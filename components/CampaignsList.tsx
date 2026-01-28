"use client";

import { FileText, Calendar, Trash2, ArrowRight, Sparkles, FolderOpen } from "lucide-react";
import moment from "moment";

interface Campaign {
  id: string;
  prompt: string;
  status: "draft" | "finished";
  created_at: string;
  updated_at: string;
}

interface CampaignsListProps {
  campaigns: Campaign[];
  onCampaignSelect: (campaignId: string) => void;
  onCampaignDelete?: (campaignId: string) => void;
}

export default function CampaignsList({
  campaigns,
  onCampaignSelect,
  onCampaignDelete,
}: CampaignsListProps) {
  const formatDate = (dateString: string) => {
    return moment.utc(dateString).local().format("MMM D, YYYY [at] h:mm A");
  };

  const drafts = campaigns.filter((c) => c.status === "draft");
  const finished = campaigns.filter((c) => c.status === "finished");

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#701AC0] to-[#8A2BE2] flex items-center justify-center mb-6 shadow-xl shadow-[#8A2BE2]/30">
          <FolderOpen className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-[#3C0E66] mb-2">
          No campaigns yet
        </h3>
        <p className="text-sm text-[#561493]/70 max-w-xs text-center">
          Create your first AI-powered campaign strategy to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#3C0E66]">Campaigns</h2>
          <p className="text-sm text-[#561493]/70 mt-1">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} &middot; {drafts.length} draft{drafts.length !== 1 ? "s" : ""} &middot; {finished.length} finished
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#D4B2F4]/50 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#701AC0] to-[#8A2BE2] flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#3C0E66]">{campaigns.length}</span>
          </div>
          <p className="text-xs text-[#561493]/60 font-medium">Total Campaigns</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#D4B2F4]/50 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#3C0E66]">{drafts.length}</span>
          </div>
          <p className="text-xs text-[#561493]/60 font-medium">In Progress</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#D4B2F4]/50 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#3C0E66]">{finished.length}</span>
          </div>
          <p className="text-xs text-[#561493]/60 font-medium">Completed</p>
        </div>
      </div>

      {/* Campaign cards */}
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            onClick={() => onCampaignSelect(campaign.id)}
            className="group cursor-pointer relative bg-white/80 backdrop-blur-sm rounded-2xl border border-[#D4B2F4]/50 hover:border-[#8A2BE2] hover:shadow-xl hover:shadow-[#8A2BE2]/10 transition-all duration-300 p-5 overflow-hidden"
          >
            {/* Subtle gradient accent on left */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              campaign.status === "draft"
                ? "bg-gradient-to-b from-[#F59E0B] to-[#FBBF24]"
                : "bg-gradient-to-b from-[#10B981] to-[#34D399]"
            }`} />

            <div className="flex items-center justify-between pl-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  campaign.status === "draft"
                    ? "bg-[#FEF3C7]/80"
                    : "bg-[#D1FAE5]/80"
                }`}>
                  <FileText className={`w-5 h-5 ${
                    campaign.status === "draft" ? "text-[#D97706]" : "text-[#059669]"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#3C0E66] group-hover:text-[#701AC0] transition-colors truncate">
                    {campaign.prompt}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        campaign.status === "draft"
                          ? "bg-[#FEF3C7] text-[#92400E]"
                          : "bg-[#D1FAE5] text-[#065F46]"
                      }`}
                    >
                      {campaign.status === "draft" ? "Draft" : "Finished"}
                    </span>
                    <span className="text-xs text-[#561493]/50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(campaign.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {onCampaignDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCampaignDelete(campaign.id);
                    }}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                    title="Delete campaign"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-lg bg-[#F0E5FC] group-hover:bg-gradient-to-br group-hover:from-[#701AC0] group-hover:to-[#8A2BE2] flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4 text-[#701AC0] group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
