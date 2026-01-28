"use client";

import { useState } from "react";
import moment from "moment";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  FolderOpen,
  TrendingUp,
  Settings,
  FileText,
  Calendar
} from "lucide-react";

interface Campaign {
  id: string;
  prompt: string;
  status: "draft" | "finished";
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  campaigns: Campaign[];
  selectedView: string;
  onViewChange: (view: string) => void;
  onCampaignSelect: (campaignId: string) => void;
  userEmail?: string;
}

export default function Sidebar({
  campaigns,
  selectedView,
  onViewChange,
  onCampaignSelect,
  userEmail,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatDate = (dateString: string) => {
    const m = moment.utc(dateString).local();
    const now = moment();
    const diffDays = now.diff(m, "days");

    if (diffDays === 0) return m.format("[Today] h:mm A");
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return m.fromNow();
    return m.format("MMM D");
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-72"
      } bg-white border-r border-[#D4B2F4] transition-all duration-300 flex flex-col h-screen sticky top-0 z-10`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#D4B2F4] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <img
              src="/icon.png"
              alt="AdVisor"
              className="h-8 w-auto object-contain"
            />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-[#F0E5FC] transition-colors"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-[#701AC0]" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-[#701AC0]" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* New Campaign */}
        <button
          onClick={() => onViewChange("new")}
          className={`w-full flex items-center ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} rounded-xl transition-all ${
            selectedView === "new"
              ? "bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] text-white shadow-lg shadow-[#8A2BE2]/30"
              : "hover:bg-[#F0E5FC] text-[#701AC0]"
          }`}
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">New Campaign</span>}
        </button>

        {/* Trends */}
        <button
          onClick={() => onViewChange("trends")}
          className={`w-full flex items-center ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} rounded-lg transition-all ${
            selectedView === "trends"
              ? "bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] text-white shadow-lg shadow-[#8A2BE2]/30"
              : "hover:bg-[#F0E5FC] text-[#561493]"
          }`}
        >
          <TrendingUp className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Trends</span>}
        </button>

        {/* My Campaigns - hidden when collapsed */}
        {!isCollapsed && (
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-[#561493]/60 uppercase tracking-wider px-3 mb-2">
              My Campaigns
            </h3>

            <div className="space-y-1">
              {campaigns.length === 0 ? (
                <p className="text-sm text-[#561493]/50 px-3 py-2">
                  No campaigns yet
                </p>
              ) : (
                campaigns.slice(0, 5).map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => onCampaignSelect(campaign.id)}
                    className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-all ${
                      selectedView === campaign.id
                        ? "bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] text-white shadow-lg shadow-[#8A2BE2]/30"
                        : "hover:bg-[#F8F2FE] text-[#561493]"
                    }`}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {truncateText(campaign.prompt, 35)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            selectedView === campaign.id
                              ? "bg-white/20 text-white"
                              : campaign.status === "draft"
                                ? "bg-[#FEF3C7] text-[#92400E]"
                                : "bg-[#D1FAE5] text-[#065F46]"
                          }`}
                        >
                          {campaign.status}
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${
                          selectedView === campaign.id ? "text-white/70" : "text-[#561493]/50"
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(campaign.updated_at)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {campaigns.length > 5 && (
              <button
                onClick={() => onViewChange("campaigns")}
                className="w-full text-sm text-[#701AC0] hover:text-[#561493] px-3 py-2 text-left"
              >
                View all campaigns ({campaigns.length})
              </button>
            )}
          </div>
        )}

        {/* Other Navigation */}
        <div className="pt-4 space-y-1">
          <button
            onClick={() => onViewChange("campaigns")}
            className={`w-full flex items-center ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} rounded-lg transition-all ${
              selectedView === "campaigns"
                ? "bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] text-white shadow-lg shadow-[#8A2BE2]/30"
                : "hover:bg-[#F0E5FC] text-[#561493]"
            }`}
          >
            <FolderOpen className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">All Campaigns</span>}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[#D4B2F4]">
        <button
          onClick={() => onViewChange("settings")}
          className={`w-full flex items-center ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} rounded-lg transition-all ${
            selectedView === "settings"
              ? "bg-[#F0E5FC] text-[#3C0E66]"
              : "hover:bg-[#F0E5FC] text-[#561493]"
          }`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </button>

        {!isCollapsed && userEmail && (
          <div className="mt-3 px-3">
            <p className="text-xs text-[#561493]/50 truncate">{userEmail}</p>
          </div>
        )}
      </div>
    </div>
  );
}
