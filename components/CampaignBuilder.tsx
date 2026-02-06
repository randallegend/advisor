"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, Send, Users, ClipboardList, Sparkles, Check, Copy, Lightbulb, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { computeFunnelBudget } from "@/lib/budgetHelpers";
import { computeCampaignKPIs } from "@/lib/kpiHelpers";
import { generateCampaignCSV } from "@/lib/csvHelpers";
import { computeConfidence } from "@/lib/confidenceHelpers";
import { generateCampaignStrategy, chatWithStrategist } from "@/app/actions/campaign";
import { saveCampaignDraft } from "@/app/actions/campaigns-db";
import ExportModal from "@/components/ExportModal";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import type { CampaignData, StrategistUI, TargetAudience, AdFormat, StrategyRationale } from "@/lib/types";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

interface CampaignBuilderProps {
  campaign: CampaignData;
  strategistUI: StrategistUI;
  onBack: () => void;
  onDuplicate?: () => void;
  onCampaignUpdate?: (campaign: CampaignData) => void;
}

export default function CampaignBuilder({
  campaign,
  strategistUI,
  onBack,
  onDuplicate,
  onCampaignUpdate,
}: CampaignBuilderProps) {
  // Destructure campaign for easier access
  const {
    id: initialCampaignId,
    prompt,
    strategist,
    budget: initialBudget,
    keywords,
    location,
    signals,
    signalSource,
    funnelBudget: initialFunnelBudget,
    audiences: initialAudiences,
    adFormats: initialAdFormats,
    strategyRationale: initialStrategyRationale,
    chatMessages: initialChatMessages,
    initialMessage,
    status: initialStatus,
  } = campaign;

  // Compute confidence from signals
  const confidence = useMemo(
    () => computeConfidence(signals, signalSource, location, signalSource === "data"),
    [signals, signalSource, location]
  );

  const [budget, setBudget] = useState(initialBudget ?? 10000);
  const [budgetInput, setBudgetInput] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialChatMessages && initialChatMessages.length > 0
      ? initialChatMessages
      : [
          {
            role: "assistant",
            content: initialMessage || `Hi! I'm ${strategist.name}, your ${strategist.title}. I'm analyzing your campaign prompt and creating a comprehensive strategy...`,
          },
        ]
  );
  const [chatInput, setChatInput] = useState("");

  // Manual budget allocation overrides (null means use signal-driven)
  const [manualPercentages, setManualPercentages] = useState<{
    awareness: number | null;
    consideration: number | null;
    conversion: number | null;
  }>(initialFunnelBudget ? {
    awareness: initialFunnelBudget.awarenessPercent,
    consideration: initialFunnelBudget.considerationPercent,
    conversion: initialFunnelBudget.conversionPercent,
  } : { awareness: null, consideration: null, conversion: null });

  // AI-generated strategy data
  const [audiences, setAudiences] = useState<TargetAudience[]>(initialAudiences);

  // Store ad format weights (fractions of total budget) for dynamic scaling
  const [adFormatWeights, setAdFormatWeights] = useState<AdFormat[]>(() => {
    // Initialize weights from initial budgets
    const totalInitialBudget = initialAdFormats.reduce((sum, ad) => sum + ad.budget, 0);
    return initialAdFormats.map(ad => ({
      ...ad,
      weight: totalInitialBudget > 0 ? ad.budget / totalInitialBudget : 1 / initialAdFormats.length,
    }));
  });

  // Compute actual ad format budgets dynamically based on current budget
  const adFormats = useMemo(() => {
    return adFormatWeights.map(ad => ({
      ...ad,
      budget: Math.round(budget * (ad.weight || 0)),
    }));
  }, [adFormatWeights, budget]);

  // Helper to update ad format weights from new formats (converts budgets to weights)
  const setAdFormats = (newFormats: AdFormat[]) => {
    const totalBudget = newFormats.reduce((sum, ad) => sum + ad.budget, 0);
    setAdFormatWeights(newFormats.map(ad => ({
      ...ad,
      weight: totalBudget > 0 ? ad.budget / totalBudget : 1 / newFormats.length,
    })));
  };

  const [strategyRationale, setStrategyRationale] = useState<StrategyRationale[]>(initialStrategyRationale);
  const [isRationaleExpanded, setIsRationaleExpanded] = useState(true);
  const [isRefining, setIsRefining] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [includeRationale, setIncludeRationale] = useState(true);
  const [campaignId, setCampaignId] = useState<string | undefined>(initialCampaignId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [campaignStatus, setCampaignStatus] = useState<"draft" | "finished">(initialStatus);
  const isFinished = campaignStatus === "finished";

  // Ref for auto-scrolling chat messages
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages([...chatMessages, { role: "user", content: userMsg }]);
    setIsChatLoading(true);

    try {
      // Get current funnel weights
      const currentWeights = {
        awareness: funnelBudget.awarenessPercent / 100,
        consideration: funnelBudget.considerationPercent / 100,
        conversion: funnelBudget.conversionPercent / 100,
      };

      // Call AI strategist with persona and conversation history
      const result = await chatWithStrategist(
        userMsg,
        {
          budget,
          signals,
          keywords,
          location,
          funnelWeights: currentWeights,
          audiences,
          adFormats,
        },
        {
          name: strategist.name,
          title: strategist.title,
          description: strategist.id === "ian"
            ? "Data-obsessed, conversion-focused. Optimizes every dollar for ROI."
            : strategist.id === "mart"
            ? "Creative storyteller. Builds awareness and emotional connections."
            : "Analytics wizard. Finds insights in numbers and trends.",
        },
        chatMessages
      );

      if (result.success && result.data) {
        const aiResponse = result.data;

        // Add AI message to chat
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse.message },
        ]);

        // Apply changes if any
        if (aiResponse.changes) {
          // Apply budget change
          if (aiResponse.changes.budget) {
            const newBudget = Math.max(1000, Math.min(100000, aiResponse.changes.budget));
            setBudget(newBudget);
          }

          // Apply funnel weight changes
          if (aiResponse.changes.funnel_weights) {
            const weights = aiResponse.changes.funnel_weights;
            setManualPercentages({
              awareness: weights.awareness * 100,
              consideration: weights.consideration * 100,
              conversion: weights.conversion * 100,
            });
          }

          // Apply audience strategy changes
          if (aiResponse.changes.audience_strategy) {
            setAudiences(aiResponse.changes.audience_strategy);
          }

          // Apply ad format weight changes
          if (aiResponse.changes.ad_format_weights) {
            const weights = aiResponse.changes.ad_format_weights;
            const totalBudget = adFormats.reduce((sum, ad) => sum + ad.budget, 0);

            // Recalculate ad format budgets based on new weights
            const updatedFormats = adFormats.map((ad) => {
              const formatKey = ad.type.toLowerCase().split(" ")[0]; // "Display Ads" -> "display"
              const weight = weights[formatKey] || ad.budget / totalBudget;
              return {
                ...ad,
                budget: Math.round(totalBudget * weight),
              };
            });

            setAdFormats(updatedFormats);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Refine strategy handler - re-triggers AI with current budget and signals
  const handleRefineStrategy = async () => {
    setIsRefining(true);
    const result = await generateCampaignStrategy(budget, signals, keywords, location);
    if (result.success && result.data) {
      setAudiences(result.data.audiences);
      setAdFormats(result.data.adFormats);
      setStrategyRationale(result.data.strategyRationale || []);
    }
    setIsRefining(false);
  };

  // Export handlers
  const handleExportPDF = async () => {
    setIsExportingPDF(true);

    try {
      // Dynamically import react-pdf/renderer
      const { pdf } = await import('@react-pdf/renderer');
      const { default: CampaignPDF } = await import('@/components/CampaignPDF');

      // Create PDF document
      const doc = (
        <CampaignPDF
          campaign={prompt}
          strategist={{
            name: strategist.name,
            title: strategist.title,
            avatar: strategist.avatar,
          }}
          budget={budget}
          funnelBudget={funnelBudget}
          signals={signals}
          kpis={campaignKPIs}
          audiences={audiences}
          adFormats={adFormats}
          keywords={keywords}
          location={location}
          strategyRationale={strategyRationale}
          includeRationale={includeRationale}
        />
      );

      // Generate PDF blob
      const blob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaign-strategy-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExportingPDF(false);
    } catch (error) {
      console.error('PDF export error:', error);
      setIsExportingPDF(false);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV content using helper
    const csvContent = generateCampaignCSV({
      campaign: prompt,
      strategist: {
        name: strategist.name,
        title: strategist.title,
      },
      budget,
      funnelBudget,
      signals,
      kpis: campaignKPIs,
      audiences,
      adFormats,
      keywords,
      location,
    });

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `campaign-strategy-${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save draft handler
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const result = await saveCampaignDraft({
        prompt,
        strategist: {
          id: strategist.id,
          name: strategist.name,
          title: strategist.title,
          avatar: strategist.avatar,
        },
        budget,
        keywords,
        location,
        signals,
        signalSource,
        funnelBudget,
        kpis: campaignKPIs,
        audiences,
        adFormats,
        strategyRationale,
        chatMessages,
        status: "draft",
      }, campaignId);

      if (result.success && result.campaignId) {
        setCampaignId(result.campaignId);
        setSaveMessage("Draft saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to save draft");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Save draft error:", error);
      setSaveMessage("Failed to save draft");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      const result = await saveCampaignDraft({
        prompt,
        strategist: {
          id: strategist.id,
          name: strategist.name,
          title: strategist.title,
          avatar: strategist.avatar,
        },
        budget,
        keywords,
        location,
        signals,
        signalSource,
        funnelBudget,
        kpis: campaignKPIs,
        audiences,
        adFormats,
        strategyRationale,
        chatMessages,
        status: "finished",
      }, campaignId);

      if (result.success && result.campaignId) {
        setCampaignId(result.campaignId);
        setCampaignStatus("finished");
        setSaveMessage("Strategy finalized!");
        setShowExportModal(false);
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to finalize");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Finalize error:", error);
      setSaveMessage("Failed to finalize");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Compute funnel budget dynamically based on signals and budget slider
  const signalDrivenBudget = useMemo(
    () => computeFunnelBudget(budget, signals),
    [budget, signals]
  );

  // Use manual percentages if set, otherwise use signal-driven
  const funnelBudget = useMemo(() => {
    if (manualPercentages.awareness !== null) {
      return {
        awarenessPercent: manualPercentages.awareness,
        awareness: (manualPercentages.awareness / 100) * budget,
        considerationPercent: manualPercentages.consideration!,
        consideration: (manualPercentages.consideration! / 100) * budget,
        conversionPercent: manualPercentages.conversion!,
        conversion: (manualPercentages.conversion! / 100) * budget,
      };
    }
    return signalDrivenBudget;
  }, [manualPercentages, budget, signalDrivenBudget]);

  // Compute KPIs dynamically based on funnel budget and signals
  const campaignKPIs = useMemo(() => {
    return computeCampaignKPIs(funnelBudget, signals, {
      avgSalePrice: 100,
      audienceSize: 250000,
    });
  }, [funnelBudget, signals]);

  // Handle manual adjustment of a funnel stage
  const handleFunnelAdjust = (stageId: string, newPercent: number) => {
    // Clamp between 10% and 80%
    newPercent = Math.max(10, Math.min(80, newPercent));

    if (stageId === "awareness") {
      const remaining = 100 - newPercent;
      const currentConsideration = manualPercentages.consideration ?? signalDrivenBudget.considerationPercent;
      const currentConversion = manualPercentages.conversion ?? signalDrivenBudget.conversionPercent;
      const ratio = currentConsideration / (currentConsideration + currentConversion);

      setManualPercentages({
        awareness: newPercent,
        consideration: remaining * ratio,
        conversion: remaining * (1 - ratio),
      });
    } else if (stageId === "consideration") {
      const remaining = 100 - newPercent;
      const currentAwareness = manualPercentages.awareness ?? signalDrivenBudget.awarenessPercent;
      const currentConversion = manualPercentages.conversion ?? signalDrivenBudget.conversionPercent;
      const ratio = currentAwareness / (currentAwareness + currentConversion);

      setManualPercentages({
        awareness: remaining * ratio,
        consideration: newPercent,
        conversion: remaining * (1 - ratio),
      });
    } else if (stageId === "conversion") {
      const remaining = 100 - newPercent;
      const currentAwareness = manualPercentages.awareness ?? signalDrivenBudget.awarenessPercent;
      const currentConsideration = manualPercentages.consideration ?? signalDrivenBudget.considerationPercent;
      const ratio = currentAwareness / (currentAwareness + currentConsideration);

      setManualPercentages({
        awareness: remaining * ratio,
        consideration: remaining * (1 - ratio),
        conversion: newPercent,
      });
    }
  };

  // Define funnel stages array directly (no useMemo to ensure it updates)
  const funnelStages = [
    {
      id: "awareness",
      name: "Awareness",
      percentage: funnelBudget.awarenessPercent,
      amount: funnelBudget.awareness,
      color: "from-[#06B6D4] to-[#22D3EE]",
      badgeColor: "bg-[#ECFEFF] text-[#0891B2]"
    },
    {
      id: "consideration",
      name: "Consideration",
      percentage: funnelBudget.considerationPercent,
      amount: funnelBudget.consideration,
      color: "from-[#8A2BE2] to-[#A358E8]",
      badgeColor: "bg-[#F0E5FC] text-[#701AC0]"
    },
    {
      id: "conversion",
      name: "Conversion",
      percentage: funnelBudget.conversionPercent,
      amount: funnelBudget.conversion,
      color: "from-[#10B981] to-[#34D399]",
      badgeColor: "bg-[#ECFDF5] text-[#10B981]"
    },
  ];

  // Format KPIs for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toLocaleString();
  };

  const kpis = [
    {
      stage: "Awareness",
      metric: "Impressions",
      target: formatNumber(campaignKPIs.awareness.impressions),
      icon: "👁️",
      color: "bg-gradient-to-br from-[#06B6D4] to-[#22D3EE]"
    },
    {
      stage: "Awareness",
      metric: "Reach",
      target: formatNumber(campaignKPIs.awareness.reach),
      icon: "🎯",
      color: "bg-gradient-to-br from-[#22D3EE] to-[#67E8F9]"
    },
    {
      stage: "Consideration",
      metric: "CTR",
      target: `${campaignKPIs.consideration.ctr}%`,
      icon: "👆",
      color: "bg-gradient-to-br from-[#8A2BE2] to-[#A358E8]"
    },
    {
      stage: "Consideration",
      metric: "Engagement",
      target: formatNumber(campaignKPIs.consideration.engagement),
      icon: "💬",
      color: "bg-gradient-to-br from-[#A358E8] to-[#BC85EE]"
    },
    {
      stage: "Conversion",
      metric: "Conversions",
      target: formatNumber(campaignKPIs.conversion.conversions),
      icon: "✅",
      color: "bg-gradient-to-br from-[#10B981] to-[#34D399]"
    },
    {
      stage: "Conversion",
      metric: "ROAS",
      target: `${campaignKPIs.conversion.roas}x`,
      icon: "💰",
      color: "bg-gradient-to-br from-[#34D399] to-[#6EE7B7]"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F2FE] via-white to-[#F0E5FC] animate-fade-in" suppressHydrationWarning>
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
        isExporting={isExportingPDF}
        isDraft={!isFinished}
        onFinalize={handleFinalize}
        isFinalizing={isSaving}
        includeRationale={includeRationale}
        onToggleRationale={setIncludeRationale}
        hasRationale={strategyRationale.length > 0}
      />

      {/* Loading overlay for refining strategy */}
      {isRefining && (
        <div className="fixed inset-x-0 top-0 z-[60] flex justify-center animate-slide-up">
          <div className="mt-6 flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/90 border border-[#D4B2F4] shadow-2xl shadow-[#8A2BE2]/20 backdrop-blur-xl">
            <Spinner className="w-5 h-5 text-[#8A2BE2]" />
            <span className="text-sm font-medium text-[#3C0E66]">
              Refining campaign strategy with AI...
            </span>
          </div>
        </div>
      )}

      {/* Sticky Header - Campaign Summary */}
      <header className="sticky top-0 z-50 glass border-b border-[#D4B2F4]/50 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-[#F0E5FC] transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#701AC0]" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden shadow-md ring-2"
                  style={{ "--tw-ring-color": strategistUI.primaryHex } as React.CSSProperties}
                >
                  <img
                    src={strategist.avatar}
                    alt={strategist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-[#3C0E66]">{prompt.substring(0, 100)}...</h1>
                    {confidence && <ConfidenceBadge confidence={confidence} />}
                  </div>
                  <p className="text-sm text-[#561493]/70">Strategist: {strategist.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saveMessage && (
                <span className="text-sm text-[#10B981] font-medium animate-fade-in">
                  {saveMessage}
                </span>
              )}
              {isFinished ? (
                <>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#10B981]">
                    <Check className="w-4 h-4" />
                    Finalized
                  </span>
                  {onDuplicate && (
                    <button
                      onClick={onDuplicate}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-[#701AC0] bg-[#F0E5FC] hover:bg-[#E5D0F9] border border-[#D4B2F4] transition-all flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate to Edit
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-[#701AC0] bg-[#F0E5FC] hover:bg-[#E5D0F9] border border-[#D4B2F4] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Spinner className="w-4 h-4 text-[#701AC0]" />
                        Saving...
                      </>
                    ) : (
                      "Save Draft"
                    )}
                  </button>
                  <button
                    onClick={handleFinalize}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#059669] hover:to-[#10B981] transition-all shadow-lg shadow-[#10B981]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Finalize Strategy
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 min-h-[calc(100vh-180px)]">
          {/* Left Panel - AI Strategist Chat */}
          <div className="glass rounded-2xl p-4 flex flex-col h-[calc(100vh-180px)] sticky top-20 animate-slide-in-left">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#D4B2F4]/50">
              <div
                className="w-14 h-14 rounded-full overflow-hidden shadow-lg ring-3"
                style={{ "--tw-ring-color": strategistUI.primaryHex } as React.CSSProperties}
              >
                <img
                  src={strategist.avatar}
                  alt={strategist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#3C0E66]">{strategist.name}</h2>
                <p className={`text-sm ${strategistUI.textColor}`}>{strategist.title}</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
              {chatMessages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Label for first assistant message */}
                  {idx === 0 && message.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                      <span className="text-xs font-medium text-[#8A2BE2]">📊 Market Snapshot</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "text-white"
                        : "bg-white/60 text-[#3C0E66] border border-[#D4B2F4]/50"
                    }`}
                    style={message.role === "user" ? {
                      background: `linear-gradient(to right, ${strategistUI.primaryHex}, ${strategistUI.secondaryHex})`
                    } : undefined}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            {!isFinished && (
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isChatLoading) {
                    handleSendMessage();
                  }
                }}
                disabled={isChatLoading}
                placeholder={
                  isChatLoading
                    ? "Thinking..."
                    : strategist.id === "ian"
                    ? "e.g., 'Allocate more to conversion'"
                    : strategist.id === "mart"
                    ? "e.g., 'Increase awareness budget'"
                    : "e.g., 'Optimize based on signals'"
                }
                className="chat-input flex-1 px-4 py-2.5 rounded-xl border-2 bg-white/50 text-[#3C0E66] focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:opacity-50"
                style={{
                  borderColor: strategistUI.primaryHex + "40",
                  "--tw-ring-color": strategistUI.secondaryHex,
                  "--placeholder-color": strategistUI.primaryHex,
                } as React.CSSProperties}
              />
              <button
                onClick={handleSendMessage}
                disabled={isChatLoading}
                className="px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(to right, ${strategistUI.primaryHex}, ${strategistUI.secondaryHex})`
                }}
              >
                {isChatLoading ? (
                  <Spinner className="w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            )}
          </div>

          {/* Right Panel - Strategy Blueprint */}
          <div className="space-y-4 animate-slide-in-right">
            {/* Funnel Visualization */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-[#3C0E66]">Campaign Funnel</h2>
                {manualPercentages.awareness !== null && (
                  <button
                    onClick={() => setManualPercentages({ awareness: null, consideration: null, conversion: null })}
                    className="text-xs px-3 py-1 rounded-lg bg-[#F0E5FC] text-[#701AC0] hover:bg-[#E5D0F9] transition-all font-medium"
                  >
                    Reset to AI
                  </button>
                )}
              </div>
              {!isFinished && <p className="text-xs text-[#561493]/70 mb-3">Click or drag bars to manually adjust allocation</p>}
              <div className="space-y-3">
                {funnelStages.map((stage) => (
                  <div key={stage.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#3C0E66]">{stage.name}</span>
                      <span className="text-sm text-[#561493]/70 transition-all duration-300">{stage.percentage.toFixed(1)}% of budget</span>
                    </div>
                    <div
                      className={`h-12 rounded-xl bg-white/50 overflow-visible relative ring-2 ring-transparent transition-all duration-300 ${
                        isFinished ? "cursor-default" : "cursor-ew-resize group hover:ring-[#D4B2F4]/40"
                      }`}
                      onClick={isFinished ? undefined : (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newPercent = (clickX / rect.width) * 100;
                        handleFunnelAdjust(stage.id, newPercent);
                      }}
                      onMouseDown={isFinished ? undefined : (e) => {
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const moveX = moveEvent.clientX - rect.left;
                          const newPercent = Math.max(0, Math.min(100, (moveX / rect.width) * 100));
                          handleFunnelAdjust(stage.id, newPercent);
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      {/* Animated background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#701AC0]/5 via-transparent to-[#8A2BE2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

                      <div
                        className={`h-full bg-gradient-to-r ${stage.color} flex items-center px-4 transition-all duration-300 ease-out relative overflow-hidden rounded-xl group-hover:brightness-110 group-hover:shadow-xl group-hover:scale-[1.02]`}
                        style={{ width: `${stage.percentage}%` }}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <span className="text-white font-semibold text-sm transition-all duration-300 relative z-10">${stage.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>

                      {/* Enhanced drag handle with grip lines */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                        style={{ left: `calc(${stage.percentage}% - 12px)` }}
                      >
                        <div className="w-1 h-8 bg-white/50 rounded-full shadow-lg backdrop-blur-sm">
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 py-2">
                            <div className="w-0.5 h-1 bg-white rounded-full" />
                            <div className="w-0.5 h-1 bg-white rounded-full" />
                            <div className="w-0.5 h-1 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* Percentage badge tooltip */}
                      <div
                        className="absolute -top-8 px-2 py-1 rounded-lg bg-[#3C0E66] text-white text-xs font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                        style={{ left: `calc(${stage.percentage}% - 20px)` }}
                      >
                        {stage.percentage.toFixed(1)}%
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#3C0E66] rotate-45" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KPIs Grid */}
            <div className="glass rounded-2xl p-4">
              <h2 className="text-xl font-bold text-[#3C0E66] mb-3">Phased KPIs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {kpis.map((kpi, idx) => (
                  <div key={idx} className="bg-white/50 rounded-xl p-4 border border-[#D4B2F4]/50 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center text-xl shadow-md`}>
                        {kpi.icon}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        kpi.stage === "Awareness" ? "bg-[#ECFEFF] text-[#0891B2]" :
                        kpi.stage === "Consideration" ? "bg-[#F0E5FC] text-[#701AC0]" :
                        "bg-[#ECFDF5] text-[#10B981]"
                      }`}>{kpi.stage}</span>
                    </div>
                    <p className="text-sm text-[#561493]/70 mb-1">{kpi.metric}</p>
                    <p className="text-2xl font-bold text-[#3C0E66]">{kpi.target}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Rationale */}
            {strategyRationale.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <button
                  onClick={() => setIsRationaleExpanded(!isRationaleExpanded)}
                  className="w-full flex items-center justify-between mb-3 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[#3C0E66]">Strategy Rationale</h2>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-[#561493]/50 transition-transform duration-200 ${isRationaleExpanded ? "rotate-180" : ""}`} />
                </button>
                {isRationaleExpanded && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {strategyRationale.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-amber-600">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#3C0E66] mb-0.5">{item.insight}</p>
                          <p className="text-sm text-[#561493]/70">{item.implication}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audience Segments */}
            <div className="glass rounded-2xl p-4">
              <h2 className="text-xl font-bold text-[#3C0E66] mb-3">Target Audiences</h2>
              <div className="space-y-3">
                {audiences.map((audience, idx) => (
                  <div key={idx} className="bg-white/50 rounded-xl p-4 border border-[#D4B2F4]/50">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-[#3C0E66]">{audience.name}</h3>
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] text-white text-sm font-semibold">
                        {audience.size}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-[#8A2BE2] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[#561493]/80">{audience.targeting}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ClipboardList className="w-4 h-4 text-[#8A2BE2] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[#561493]/80">{audience.behavioral}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Formats & Targeting */}
            <div className="glass rounded-2xl p-4">
              <h2 className="text-xl font-bold text-[#3C0E66] mb-3">Ad Formats & Targeting</h2>
              <div className="space-y-2">
                {adFormats.map((ad, idx) => (
                  <div key={idx} className="bg-white/50 rounded-xl p-4 border border-[#D4B2F4]/50 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[#3C0E66] mb-1">{ad.type}</h3>
                      <p className="text-sm text-[#561493]/70">{ad.platforms}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#701AC0]">${ad.budget.toLocaleString()}</p>
                      <p className="text-xs text-[#561493]/70">Est. CTR: {ad.estimatedCTR}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom - Budget Slider */}
      <div className="sticky bottom-0 z-40 glass border-t border-[#D4B2F4]/50 backdrop-blur-xl">
        <div className={`max-w-[1800px] mx-auto px-4 ${isFinished ? "py-4" : "py-2.5"}`}>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#3C0E66]">Total Campaign Budget</label>
                {isFinished ? (
                  <span className="text-2xl font-bold text-[#701AC0]">
                    ${budget.toLocaleString()}
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-[#701AC0]">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={isEditingBudget ? budgetInput : budget.toLocaleString()}
                      onFocus={() => {
                        setIsEditingBudget(true);
                        setBudgetInput(String(budget));
                      }}
                      onChange={(e) => {
                        setBudgetInput(e.target.value.replace(/[^0-9]/g, ""));
                      }}
                      onBlur={() => {
                        setIsEditingBudget(false);
                        const num = parseInt(budgetInput, 10);
                        if (!isNaN(num) && num > 0) {
                          setBudget(Math.min(100000, Math.max(1000, num)));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      className="text-2xl font-bold text-[#701AC0] bg-transparent border-b-2 border-transparent hover:border-[#D4B2F4] focus:border-[#701AC0] focus:outline-none transition-colors w-24 text-right"
                    />
                  </div>
                )}
              </div>
              {!isFinished && (
                <>
                  <Slider
                    value={[budget]}
                    onValueChange={(value) => setBudget(value[0])}
                    min={1000}
                    max={100000}
                    step={1000}
                    className="w-full [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:h-5"
                    style={{
                      "--slider-range-color": "#701AC0",
                      "--slider-thumb-border": "#701AC0",
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-[#561493]/70 mt-1">
                    <span>$1K</span>
                    <span>$50K</span>
                    <span>$100K</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3">
              {!isFinished && (
                <button
                  onClick={handleRefineStrategy}
                  disabled={isRefining}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#701AC0] bg-[#F0E5FC] hover:bg-[#E5D0F9] border border-[#D4B2F4] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className={`w-4 h-4 ${isRefining ? 'animate-spin' : ''}`} />
                  {isRefining ? "Refining..." : "Refine Strategy"}
                </button>
              )}
              <button
                onClick={() => setShowExportModal(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] transition-all shadow-xl shadow-[#8A2BE2]/30"
              >
                Export Campaign Strategy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
