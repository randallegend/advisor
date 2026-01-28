"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, Flame, MapPin, Sparkles, Plus } from "lucide-react";
import locationsData from "@/lib/data/google-trends-locations.json";
import { Spinner } from "@/components/ui/spinner";
import { ResponsiveLine } from "@nivo/line";
import { getExploreTrends } from "@/app/actions/trends";
import type { TrendsResult } from "@/app/actions/trends";

const PRESET_TOPICS = [
  { label: "E-commerce", keywords: ["online shopping", "dropshipping", "shopify"] },
  { label: "Fitness", keywords: ["home workout", "gym membership", "protein powder"] },
  { label: "Beauty", keywords: ["skincare routine", "retinol", "sunscreen"] },
  { label: "Food & Bev", keywords: ["meal prep", "coffee shop", "plant based"] },
  { label: "Tech", keywords: ["AI tools", "chatbot", "SaaS"] },
  { label: "Travel", keywords: ["flights", "hotel deals", "travel insurance"] },
];

const CHART_COLORS = ["#701AC0", "#0891B2", "#10B981"];

function transformToNivoData(result: TrendsResult) {
  const seriesMap: Record<string, { x: string; y: number }[]> = {};

  for (const keyword of result.keywords) {
    seriesMap[keyword] = [];
  }

  for (const point of result.timeline) {
    // Parse date - SerpAPI returns "Jan 28, 2026" or "Jan 28 – Feb 3, 2026"
    const dateStr = point.date.split("–")[0].trim().split(",")[0].trim();

    for (const val of point.values) {
      if (seriesMap[val.query]) {
        seriesMap[val.query].push({ x: dateStr, y: val.value });
      }
    }
  }

  return Object.entries(seriesMap).map(([id, data]) => ({ id, data }));
}

interface TrendsExplorerProps {
  onCreateFromTrend?: (prompt: string) => void;
}

export default function TrendsExplorer({ onCreateFromTrend }: TrendsExplorerProps) {
  const [keywordInput, setKeywordInput] = useState("");
  const [clickedPoint, setClickedPoint] = useState<{ keyword: string; date: string; x: number; y: number } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [locationInput, setLocationInput] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrendsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const locationEntries = useMemo(
    () => Object.entries(locationsData as Record<string, string>),
    []
  );

  const filteredLocations = useMemo(() => {
    if (!locationInput.trim()) return locationEntries.slice(0, 12);
    const q = locationInput.toLowerCase();
    return locationEntries
      .filter(([, name]) => name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [locationInput, locationEntries]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close chart popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clickedPoint && chartContainerRef.current && !chartContainerRef.current.contains(e.target as Node)) {
        setClickedPoint(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [clickedPoint]);

  const handleExplore = async (keywords?: string[]) => {
    const kws = keywords || keywordInput.split(",").map((k) => k.trim()).filter(Boolean);
    if (kws.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const res = await getExploreTrends(kws, locationInput || undefined);

    if (res.success && res.data) {
      setResult(res.data);
      if (!keywords) {
        // Don't overwrite input for preset clicks
      } else {
        setKeywordInput(kws.join(", "));
      }
    } else {
      setError(res.error || "Failed to fetch trends data");
    }

    setIsLoading(false);
  };

  const nivoData = result ? transformToNivoData(result) : [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#701AC0] to-[#8A2BE2] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#3C0E66]">Trends Explorer</h2>
            <p className="text-sm text-[#561493]/70">Discover trending keywords and create campaigns directly from the data</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#561493]/50" />
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExplore()}
              placeholder="Enter up to 3 keywords, separated by commas..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D4B2F4] bg-white text-sm text-[#3C0E66] placeholder:text-[#561493]/40 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]/30 focus:border-[#8A2BE2] transition-all"
            />
          </div>
          <div className="relative w-56" ref={locationRef}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#561493]/50 z-10" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setShowLocationDropdown(true);
              }}
              onFocus={() => setShowLocationDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setShowLocationDropdown(false);
                  handleExplore();
                }
              }}
              placeholder="Location"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D4B2F4] bg-white text-sm text-[#3C0E66] placeholder:text-[#561493]/40 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]/30 focus:border-[#8A2BE2] transition-all"
            />
            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#D4B2F4] shadow-xl shadow-[#8A2BE2]/10 max-h-64 overflow-y-auto z-50">
                {filteredLocations.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-[#561493]/50">No locations found</div>
                ) : (
                  filteredLocations.map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLocationInput(name);
                        setShowLocationDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#3C0E66] hover:bg-[#F0E5FC] transition-colors first:rounded-t-xl last:rounded-b-xl flex items-center justify-between"
                    >
                      <span>{name}</span>
                      {code && (
                        <span className="text-xs text-[#561493]/40 font-mono">{code}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => handleExplore()}
            disabled={isLoading || !keywordInput.trim()}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] transition-all shadow-lg shadow-[#8A2BE2]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <Spinner className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            Explore
          </button>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-[#561493]/50 font-medium self-center mr-1">Quick explore:</span>
          {PRESET_TOPICS.map((topic) => (
            <button
              key={topic.label}
              onClick={() => {
                setKeywordInput(topic.keywords.join(", "));
                handleExplore(topic.keywords);
              }}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#701AC0] bg-[#F0E5FC] hover:bg-[#E5D0F9] border border-[#D4B2F4]/50 transition-all disabled:opacity-50"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/90 border border-[#D4B2F4] shadow-xl backdrop-blur-xl">
            <Spinner className="w-5 h-5 text-[#8A2BE2]" />
            <span className="text-sm font-medium text-[#3C0E66]">Fetching trends data...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass rounded-2xl p-6 border-red-200 bg-red-50/50">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-6">
          {/* Geo badge */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#561493]/60" />
            <span className="text-sm text-[#561493]/70">
              Showing results for <span className="font-semibold text-[#3C0E66]">{result.geo}</span> · Last 90 days
            </span>
          </div>

          {/* Interest Over Time Chart */}
          {nivoData.length > 0 && nivoData[0].data.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#701AC0]" />
                <h3 className="text-lg font-bold text-[#3C0E66]">Interest Over Time</h3>
              </div>
              <div className="h-[400px] relative" ref={chartContainerRef}>
                {/* Campaign creation popover */}
                {clickedPoint && (
                  <div
                    className="absolute z-50 bg-white rounded-xl border border-[#D4B2F4] shadow-xl shadow-[#8A2BE2]/15 p-3 animate-in fade-in zoom-in-95 duration-150"
                    style={{
                      left: Math.min(clickedPoint.x, (chartContainerRef.current?.offsetWidth || 600) - 240),
                      top: Math.max(clickedPoint.y - 70, 0),
                    }}
                  >
                    <p className="text-xs text-[#561493]/70 mb-2">
                      <span className="font-semibold text-[#3C0E66]">{clickedPoint.keyword}</span> · {clickedPoint.date}
                    </p>
                    <button
                      onClick={() => {
                        if (onCreateFromTrend) {
                          const locationStr = locationInput ? ` in ${locationInput}` : "";
                          onCreateFromTrend(
                            `Create a campaign for "${clickedPoint.keyword}"${locationStr} trending on ${clickedPoint.date}`
                          );
                        }
                        setClickedPoint(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] transition-all shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create campaign from this trend
                    </button>
                  </div>
                )}
                <ResponsiveLine
                  data={nivoData}
                  margin={{ top: 20, right: 120, bottom: 60, left: 60 }}
                  yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
                  xScale={{ type: "point" }}
                  curve="cardinal"
                  axisBottom={{
                    tickRotation: -45,
                    legend: "Date",
                    legendOffset: 50,
                    legendPosition: "middle",
                    tickSize: 0,
                    tickPadding: 8,
                    // Show every ~7th label to avoid crowding
                    tickValues: nivoData[0]?.data
                      .filter((_, i) => i % 7 === 0)
                      .map((d) => d.x),
                  }}
                  axisLeft={{
                    legend: "Search Interest",
                    legendOffset: -45,
                    legendPosition: "middle",
                    tickSize: 0,
                    tickPadding: 8,
                  }}
                  enableGridX={false}
                  enableGridY={false}
                  lineWidth={3}
                  enablePoints={true}
                  pointSize={1}
                  pointColor={{ theme: "background" }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "seriesColor" }}
                  enableArea={true}
                  areaBlendMode="multiply"
                  areaOpacity={0.08}
                  enableTouchCrosshair={true}
                  useMesh={true}
                  onClick={(point: any) => {
                    const seriesId = point.seriesId ?? point.serieId ?? "";
                    const xVal = point.data?.xFormatted ?? point.data?.x ?? "";
                    setClickedPoint({
                      keyword: String(seriesId),
                      date: String(xVal),
                      x: typeof point.x === "number" ? point.x : 0,
                      y: typeof point.y === "number" ? point.y : 0,
                    });
                  }}
                  tooltip={({ point }: any) => (
                    <div className="bg-white rounded-xl border border-[#D4B2F4] shadow-xl shadow-[#8A2BE2]/15 px-3 py-2">
                      <div className="text-xs text-[#561493]/60 mb-0.5">
                        <strong>Date:</strong> {String(point.data.x)}
                      </div>
                      <div className="text-xs font-semibold" style={{ color: String(point.seriesColor || point.color || "#701AC0") }}>
                        <strong>Interest:</strong> {String(point.data.y)}
                      </div>
                      <div className="text-[10px] text-[#561493]/40 mt-1">Click to create campaign</div>
                    </div>
                  )}
                  colors={CHART_COLORS}
                  legends={[
                    {
                      anchor: "bottom-right",
                      direction: "column",
                      translateX: 110,
                      itemWidth: 90,
                      itemHeight: 24,
                      symbolShape: "circle",
                      symbolSize: 10,
                      itemTextColor: "#561493",
                    },
                  ]}
                  theme={{
                    axis: {
                      ticks: {
                        text: { fill: "#561493", fontSize: 11, opacity: 0.7 },
                      },
                      legend: {
                        text: { fill: "#3C0E66", fontSize: 12, fontWeight: 600 },
                      },
                    },
                    crosshair: {
                      line: { stroke: "#8A2BE2", strokeWidth: 1, strokeDasharray: "6 4" },
                    },
                    tooltip: {
                      container: {
                        background: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 8px 32px rgba(112,26,192,0.15)",
                        padding: "10px 14px",
                        border: "1px solid #D4B2F4",
                        fontSize: "13px",
                        color: "#3C0E66",
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Rising & Top Queries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rising Searches */}
            {result.relatedRising.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-[#D97706]" />
                  <h3 className="text-lg font-bold text-[#3C0E66]">Rising Searches</h3>
                </div>
                <div className="space-y-2">
                  {result.relatedRising.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-[#D4B2F4]/30 hover:border-[#8A2BE2]/40 transition-all"
                    >
                      <span className="text-sm font-medium text-[#3C0E66]">{q.query}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          q.value === "Breakout"
                            ? "bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white"
                            : "bg-[#ECFDF5] text-[#10B981]"
                        }`}
                      >
                        {q.value === "Breakout" ? "BREAKOUT" : `+${q.value}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Queries */}
            {result.relatedTop.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#701AC0]" />
                  <h3 className="text-lg font-bold text-[#3C0E66]">Top Related Searches</h3>
                </div>
                <div className="space-y-2">
                  {result.relatedTop.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-[#D4B2F4]/30 hover:border-[#8A2BE2]/40 transition-all"
                    >
                      <span className="text-sm font-medium text-[#3C0E66]">{q.query}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-[#F0E5FC] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#701AC0] to-[#8A2BE2]"
                            style={{ width: `${typeof q.value === "number" ? q.value : 50}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#561493]/70 w-8 text-right">
                          {q.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Empty state for timeline */}
          {nivoData.length === 0 || nivoData[0].data.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <TrendingDown className="w-10 h-10 text-[#561493]/30 mx-auto mb-3" />
              <p className="text-sm text-[#561493]/60">No timeline data available for these keywords. Try different search terms.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Empty state */}
      {!result && !isLoading && !error && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#701AC0]/10 to-[#8A2BE2]/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-[#701AC0]" />
          </div>
          <h3 className="text-lg font-bold text-[#3C0E66] mb-2">Explore Market Trends</h3>
          <p className="text-sm text-[#561493]/60 max-w-md mx-auto">
            Search for keywords or pick a preset topic to see what&apos;s trending. Click any point on the chart to instantly create a campaign from that trend.
          </p>
        </div>
      )}
    </div>
  );
}
