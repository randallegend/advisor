import type { TrendSignal, ConfidenceData } from "@/lib/types";

/**
 * Compute confidence level based on trend signals and data source
 */
export function computeConfidence(
  signals: TrendSignal,
  signalSource: "data" | "ai",
  location: string,
  hasTimelineData: boolean
): ConfidenceData {
  let score = 0;
  const sources: string[] = [];

  // Base score from signal source (data is more reliable than AI inference)
  if (signalSource === "data" && hasTimelineData) {
    score += 30;
    sources.push("Google Trends");
  } else {
    score += 10;
    sources.push("AI inference");
  }

  // Add points for strong positive signals
  if (signals.demand_level === "high") score += 15;
  else if (signals.demand_level === "medium") score += 10;
  else score += 5;

  if (signals.trend_direction === "rising") score += 15;
  else if (signals.trend_direction === "stable") score += 10;
  else score += 5;

  if (signals.geo_strength === "strong") score += 15;
  else if (signals.geo_strength === "medium") score += 10;
  else score += 5;

  if (signals.purchase_urgency === "high") score += 10;
  else if (signals.purchase_urgency === "medium") score += 7;
  else score += 3;

  if (signals.dominant_intent === "transactional") score += 10;
  else if (signals.dominant_intent === "mixed") score += 7;
  else score += 3;

  // Cap at 100
  score = Math.min(score, 100);

  // Add location to sources if available
  if (location && location !== "Worldwide") {
    sources.push(`${location} market data`);
  }

  // Determine level based on score
  let level: "high" | "medium" | "low";
  let note: string;

  if (score >= 70) {
    level = "high";
    note = "Strong market signals support this strategy";
  } else if (score >= 45) {
    level = "medium";
    note = "Moderate data available, consider testing";
  } else {
    level = "low";
    note = "Limited data, recommendations are exploratory";
  }

  return { level, score, sources, note };
}
