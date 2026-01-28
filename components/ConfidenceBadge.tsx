"use client";

import type { ConfidenceData } from "@/lib/types";

interface ConfidenceBadgeProps {
  confidence: ConfidenceData;
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const levelConfig = {
    high: {
      dotColor: "bg-emerald-500",
      pulseColor: "bg-emerald-400",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    medium: {
      dotColor: "bg-amber-500",
      pulseColor: "bg-amber-400",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    low: {
      dotColor: "bg-red-500",
      pulseColor: "bg-red-400",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
  };

  const config = levelConfig[confidence.level];

  return (
    <div className="relative group">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold cursor-help transition-all ${config.bg} ${config.text} border ${config.border}`}
      >
        {/* Pulsing dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dotColor}`}
          />
        </span>
        <span className="capitalize">{confidence.level} confidence</span>
      </div>

      {/* Tooltip */}
      <div className="absolute top-full left-0 mt-2 w-64 p-3 rounded-xl bg-white border border-[#D4B2F4] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <p className="text-xs font-medium text-[#3C0E66] mb-2">{confidence.note}</p>
        <div className="space-y-1">
          <p className="text-xs text-[#561493]/60 font-medium">Data sources:</p>
          {confidence.sources.map((source, i) => (
            <p key={i} className="text-xs text-[#561493]/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A2BE2]" />
              {source}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
