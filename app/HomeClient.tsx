"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap, Check, FileText, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import CampaignBuilder from "@/components/CampaignBuilder";
import Sidebar from "@/components/Sidebar";
import CampaignsList from "@/components/CampaignsList";
import HeroLanding from "@/components/HeroLanding";
import TrendsExplorer from "@/components/TrendsExplorer";
import Settings from "@/components/Settings";
import { extractCampaignEntities, getTrends, generateCampaignStrategy } from "./actions/campaign";
import { getUserCampaigns, getCampaign, deleteCampaign } from "./actions/campaigns-db";
import { signOut } from "./(auth)/actions";
import { STRATEGISTS, EXAMPLE_PROMPTS, getStrategistById } from "@/lib/constants";
import type { TrendSignal, CampaignData } from "@/lib/types";

interface HomeClientProps {
  user: any;
}

export default function HomeClient({ user }: HomeClientProps) {
  // Campaign state - single object
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  // Form state (before campaign is created)
  const [campaignPrompt, setCampaignPrompt] = useState("");
  const [selectedStrategistId, setSelectedStrategistId] = useState<string | null>(null);

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);

  // Sidebar state
  const [selectedView, setSelectedView] = useState<string>("new");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoadingCampaigns(true);
    const result = await getUserCampaigns();
    if (result.success && result.data) {
      setCampaigns(result.data);
    }
    setIsLoadingCampaigns(false);
  };

  const handleViewChange = (view: string) => {
    setSelectedView(view);
    if (view === "new") {
      setShowBuilder(false);
      setCampaign(null);
    }
    if (view === "campaigns" || view === "new") {
      loadCampaigns();
    }
  };

  const handleCampaignSelect = async (campaignId: string) => {
    setSelectedView(campaignId);
    setIsLoadingCampaign(true);
    const result = await getCampaign(campaignId);
    setIsLoadingCampaign(false);

    if (result.success && result.data) {
      const data = result.data;
      const strategist = getStrategistById(data.strategist_id);
      if (!strategist) return;

      const signalSource = (data.signal_source as "data" | "ai") || "data";

      setCampaign({
        id: data.id,
        prompt: data.prompt,
        strategist: {
          id: strategist.id,
          name: strategist.name,
          title: strategist.title,
          avatar: strategist.avatar,
        },
        budget: data.budget,
        keywords: data.keywords,
        location: data.location,
        signals: data.signals,
        signalSource,
        funnelBudget: data.funnel_budget,
        audiences: data.audiences,
        adFormats: data.ad_formats,
        strategyRationale: data.strategy_rationale || [],
        chatMessages: data.messages || [],
        initialMessage: data.messages?.[0]?.content || "",
        status: data.status || "draft",
      });

      setCampaignPrompt(data.prompt);
      setSelectedStrategistId(data.strategist_id);
      setShowBuilder(true);
    }
  };

  const handleCampaignDelete = async (campaignId: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      const result = await deleteCampaign(campaignId);
      if (result.success) {
        await loadCampaigns();
        if (selectedView === campaignId) {
          setSelectedView("new");
          setShowBuilder(false);
          setCampaign(null);
        }
      }
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignPrompt.trim() || !selectedStrategistId) return;

    const strategist = getStrategistById(selectedStrategistId);
    if (!strategist) return;

    setIsGenerating(true);
    setCampaign(null);

    try {
      // Step 1: Extract campaign entities
      setLoadingMessage("Extracting campaign insights...");
      const result = await extractCampaignEntities(campaignPrompt);

      if (result.success && result.data) {
        const keywords = result.data.keywords || [];
        const location = result.data.location || "";

        // Step 2: Get trends data
        setLoadingMessage("Analyzing market trends...");
        const trendsResult = await getTrends(result.data);

        if (
          typeof trendsResult === "object" &&
          trendsResult !== null &&
          "success" in trendsResult &&
          trendsResult.success &&
          "metadata" in trendsResult &&
          typeof trendsResult.metadata === "object" &&
          trendsResult.metadata !== null &&
          "signals" in trendsResult.metadata
        ) {
          const metadata = trendsResult.metadata as {
            signals: TrendSignal;
            signalSource?: "data" | "ai";
            initialMessage?: string;
          };
          const signals = metadata.signals;
          const signalSource = metadata.signalSource || "data";
          const initialMessage = metadata.initialMessage || "";

          // Step 3: Generate AI strategy
          setLoadingMessage("Generating campaign strategy with AI...");
          const strategyResult = await generateCampaignStrategy(10000, signals, keywords, location);

          const audiences = strategyResult.success && strategyResult.data ? strategyResult.data.audiences : [];
          const adFormats = strategyResult.success && strategyResult.data ? strategyResult.data.adFormats : [];
          const strategyRationale = strategyResult.success && strategyResult.data ? strategyResult.data.strategyRationale || [] : [];

          // Create campaign object
          setCampaign({
            prompt: campaignPrompt,
            strategist: {
              id: strategist.id,
              name: strategist.name,
              title: strategist.title,
              avatar: strategist.avatar,
            },
            budget: 10000,
            keywords,
            location,
            signals,
            signalSource,
            audiences,
            adFormats,
            strategyRationale,
            chatMessages: [],
            initialMessage,
            status: "draft",
          });

          setShowBuilder(true);
        }
      }
    } catch (error) {
      console.error("Failed to generate campaign:", error);
    } finally {
      setIsGenerating(false);
      setLoadingMessage("");
    }
  };

  const handleBackToHome = () => {
    setShowBuilder(false);
    loadCampaigns();
  };

  const handleDuplicate = () => {
    if (campaign) {
      setCampaign({
        ...campaign,
        id: undefined,
        status: "draft",
      });
      setShowBuilder(false);
      setTimeout(() => setShowBuilder(true), 0);
    }
  };

  const handleCampaignUpdate = (updatedCampaign: CampaignData) => {
    setCampaign(updatedCampaign);
  };

  // Unauthenticated: show hero landing page
  if (!user) {
    return <HeroLanding />;
  }

  // Loading state while fetching a campaign
  if (isLoadingCampaign) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#F8F2FE] via-white to-[#F0E5FC]" suppressHydrationWarning>
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/90 border border-[#D4B2F4] shadow-2xl shadow-[#8A2BE2]/20 backdrop-blur-xl">
          <Spinner className="w-5 h-5 text-[#8A2BE2]" />
          <span className="text-sm font-medium text-[#3C0E66]">Loading campaign...</span>
        </div>
      </div>
    );
  }

  // If builder is active with a campaign, show it
  if (showBuilder && campaign && selectedStrategistId) {
    const strategistUI = getStrategistById(selectedStrategistId);
    if (!strategistUI) return null;

    return (
      <CampaignBuilder
        campaign={campaign}
        strategistUI={strategistUI}
        onBack={handleBackToHome}
        onDuplicate={handleDuplicate}
        onCampaignUpdate={handleCampaignUpdate}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#F8F2FE] via-white to-[#F0E5FC]" suppressHydrationWarning>
      {/* Sidebar */}
      <Sidebar
        campaigns={campaigns}
        selectedView={selectedView}
        onViewChange={handleViewChange}
        onCampaignSelect={handleCampaignSelect}
        userEmail={user?.email}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        {/* Show different views based on selection */}
        {selectedView === "campaigns" ? (
          <div className="p-8">
            <CampaignsList
              campaigns={campaigns}
              onCampaignSelect={handleCampaignSelect}
              onCampaignDelete={handleCampaignDelete}
            />
          </div>
        ) : selectedView === "trends" ? (
          <TrendsExplorer
            onCreateFromTrend={(prompt) => {
              setCampaignPrompt(prompt);
              setSelectedView("new");
              setShowBuilder(false);
              setCampaign(null);
            }}
          />
        ) : selectedView === "settings" ? (
          <div className="p-8">
            <Settings user={user} onSignOut={signOut} />
          </div>
        ) : (
          <>
            {/* Loading overlay */}
            {isGenerating && (
              <div className="fixed inset-x-0 top-0 z-50 flex justify-center animate-slide-up">
                <div className="mt-6 flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/90 border border-[#D4B2F4] shadow-2xl shadow-[#8A2BE2]/20 backdrop-blur-xl">
                  <Spinner className="w-5 h-5 text-[#8A2BE2]" />
                  <span className="text-sm font-medium text-[#3C0E66]">
                    {loadingMessage || "Analyzing your campaign with AI..."}
                  </span>
                </div>
              </div>
            )}

            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#D4B2F4] to-[#BC85EE] rounded-full opacity-30 blur-3xl animate-float" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#A358E8] to-[#8A2BE2] rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#701AC0]/10 to-[#561493]/10 rounded-full blur-3xl" />

              {/* Neural network dots */}
              <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-[#8A2BE2] neural-dot" />
              <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-[#A358E8] neural-dot" style={{ animationDelay: "-0.5s" }} />
              <div className="absolute bottom-32 left-40 w-2 h-2 rounded-full bg-[#701AC0] neural-dot" style={{ animationDelay: "-1s" }} />
              <div className="absolute bottom-20 right-20 w-2 h-2 rounded-full bg-[#BC85EE] neural-dot" style={{ animationDelay: "-1.5s" }} />
              <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#561493] neural-dot" style={{ animationDelay: "-0.8s" }} />
              <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-[#D4B2F4] neural-dot" style={{ animationDelay: "-1.3s" }} />

              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(#8A2BE2 1px, transparent 1px), linear-gradient(90deg, #8A2BE2 1px, transparent 1px)`,
                  backgroundSize: "50px 50px",
                }}
              />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/images/advisor_logo.png"
                  alt="AdVisor"
                  className="h-18 w-auto object-contain"
                />
              </div>

              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <span className="text-sm text-[#561493] hidden sm:block">
                      {user.email}
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-[#701AC0] bg-[#F0E5FC] hover:bg-[#E5D0F9] border border-[#D4B2F4] transition-all"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-[#701AC0] hover:bg-[#F0E5FC] transition-all"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] transition-all shadow-lg shadow-[#8A2BE2]/30"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 px-6 pt-8 pb-20 max-w-7xl mx-auto">
              {/* Hero Badge */}
              <div className="flex justify-center mb-6 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-[#D4B2F4] backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-[#8A2BE2] animate-pulse" />
                  <span className="text-sm text-[#561493] font-medium">AI-Powered Media Strategy</span>
                </div>
              </div>

              {/* Hero Title */}
              <div className="text-center mb-12 animate-slide-up">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#3C0E66] leading-tight mb-4">
                  Transform Ideas Into{" "}
                  <span className="bg-gradient-to-r from-[#701AC0] via-[#8A2BE2] to-[#A358E8] bg-clip-text text-transparent animate-gradient">
                    Winning Campaigns
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-[#561493]/80 max-w-3xl mx-auto">
                  {user
                    ? `Welcome, ${user.user_metadata?.full_name || user.email?.split('@')[0]}!`
                    : "From creative ideation to media activation through natural language"}
                </p>
              </div>

              {/* Campaign Creation Section */}
              <div className="max-w-4xl mx-auto mb-16">
                <div className="glass rounded-3xl p-8 shadow-2xl shadow-[#8A2BE2]/10 animate-scale-in">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#701AC0] to-[#8A2BE2] flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#3C0E66] mb-2">Create Your Campaign</h2>
                      <p className="text-[#561493]/70">Tell us what you want to promote</p>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="relative mb-4">
                    <textarea
                      value={campaignPrompt}
                      onChange={(e) => setCampaignPrompt(e.target.value)}
                      placeholder="e.g., Create campaign for Mother's Day sales for local flower shop in Seattle..."
                      className="w-full h-32 px-6 py-4 rounded-2xl border-2 border-[#D4B2F4] bg-white/50 text-[#3C0E66] placeholder-[#BC85EE] focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all resize-none text-lg"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-[#BC85EE]">
                      {campaignPrompt.length}/500
                    </div>
                  </div>

                  {/* Example Prompts */}
                  <div className="mb-6">
                    <p className="text-sm text-[#561493]/70 mb-3">Try an example:</p>
                    <div className="flex flex-wrap gap-2">
                      {EXAMPLE_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCampaignPrompt(prompt)}
                          className="px-4 py-2 rounded-xl text-sm text-[#701AC0] bg-[#F0E5FC] hover:bg-[#E5D0F9] border border-[#D4B2F4] transition-all hover:scale-105"
                        >
                          {prompt.substring(0, 40)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreateCampaign}
                    disabled={!campaignPrompt.trim() || !selectedStrategistId || isGenerating}
                    className="w-full py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#8A2BE2]/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isGenerating
                      ? <span className="flex items-center justify-center gap-2"><Spinner className="w-5 h-5" /> {loadingMessage || "Processing..."}</span>
                      : !selectedStrategistId
                        ? "Select a strategist below to continue"
                        : <span className="flex items-center justify-center gap-2"><Sparkles className="w-5 h-5" /> Generate Campaign Strategy</span>}
                  </button>
                </div>
              </div>

              {/* Strategist Selection */}
              <div className="max-w-6xl mx-auto mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#3C0E66] mb-3">Choose Your AI Strategist</h2>
                  <p className="text-[#561493]/70">Each strategist brings unique expertise to your campaign</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {STRATEGISTS.map((strategist, idx) => (
                    <button
                      key={strategist.id}
                      onClick={() => setSelectedStrategistId(strategist.id)}
                      className={`relative rounded-3xl transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
                        selectedStrategistId === strategist.id
                          ? `bg-gradient-to-br ${strategist.gradient} shadow-2xl`
                          : "bg-white shadow-lg hover:shadow-xl border border-gray-100"
                      }`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {/* Avatar Section */}
                      <div className={`relative pt-8 pb-4 ${
                        selectedStrategistId === strategist.id ? "" : strategist.lightBg
                      }`}>
                        <div className="flex justify-center">
                          <div className={`w-28 h-28 rounded-full overflow-hidden shadow-xl ring-4 transition-all ${
                            selectedStrategistId === strategist.id
                              ? "ring-white/40"
                              : "ring-white"
                          }`}>
                            <img
                              src={strategist.avatar}
                              alt={strategist.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Selected checkmark badge */}
                        {selectedStrategistId === strategist.id && (
                          <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Check className={`w-5 h-5 ${strategist.textColor}`} />
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className={`px-6 pb-6 pt-2 text-center ${
                        selectedStrategistId === strategist.id ? "" : "bg-white"
                      }`}>
                        <h3 className={`text-xl font-bold mb-1 ${
                          selectedStrategistId === strategist.id ? "text-white" : "text-[#3C0E66]"
                        }`}>{strategist.name}</h3>

                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                          selectedStrategistId === strategist.id
                            ? "bg-white/20 text-white"
                            : `${strategist.lightBg} ${strategist.textColor}`
                        }`}>
                          {strategist.title}
                        </span>

                        <p className={`text-sm leading-relaxed ${
                          selectedStrategistId === strategist.id ? "text-white/90" : "text-gray-600"
                        }`}>{strategist.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Campaigns / Stats Section */}
              {user && (
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-2xl font-bold text-[#3C0E66] mb-6">Recent Activity</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Cards */}
                    <button
                      onClick={() => handleViewChange("campaigns")}
                      className="glass rounded-2xl p-6 hover:shadow-xl hover:shadow-[#06B6D4]/10 transition-all text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#22D3EE] flex items-center justify-center shadow-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-[#0891B2]">{campaigns.length}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#3C0E66]">Total Campaigns</h3>
                      <p className="text-[#561493]/70 text-sm">Created this month</p>
                    </button>

                    <button
                      onClick={() => handleViewChange("campaigns")}
                      className="glass rounded-2xl p-6 hover:shadow-xl hover:shadow-[#F59E0B]/10 transition-all text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-[#D97706]">{campaigns.filter(c => c.status === "draft").length}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#3C0E66]">Drafts</h3>
                      <p className="text-[#561493]/70 text-sm">In progress</p>
                    </button>

                    <button
                      onClick={() => handleViewChange("campaigns")}
                      className="glass rounded-2xl p-6 hover:shadow-xl hover:shadow-[#10B981]/10 transition-all text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-[#10B981]">{campaigns.filter(c => c.status === "finished").length}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#3C0E66]">Finalized</h3>
                      <p className="text-[#561493]/70 text-sm">Ready to deploy</p>
                    </button>
                  </div>
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
}
