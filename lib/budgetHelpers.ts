import type { TrendSignal, FunnelBudget } from "@/lib/types";

export function computeFunnelBudget(
  totalBudget: number,
  signals: TrendSignal
): FunnelBudget {
  // Base allocation
  let awarenessPct = 0.35;
  let considerationPct = 0.3;
  let conversionPct = 0.35;

  // Adjust based on demand level
  if (signals.demand_level === "high") {
    conversionPct += 0.05;
  } else if (signals.demand_level === "low") {
    awarenessPct += 0.05;
  }

  // Adjust based on purchase urgency
  if (signals.purchase_urgency === "high") {
    conversionPct += 0.05;
    considerationPct -= 0.03;
  } else if (signals.purchase_urgency === "low") {
    awarenessPct += 0.05;
  }

  // Adjust based on trend direction
  if (signals.trend_direction === "rising") {
    conversionPct += 0.03;
  } else if (signals.trend_direction === "falling") {
    awarenessPct += 0.03;
  }

  // Adjust based on dominant intent
  if (signals.dominant_intent === "transactional") {
    conversionPct += 0.05;
    awarenessPct -= 0.03;
  } else if (signals.dominant_intent === "informational") {
    awarenessPct += 0.05;
    conversionPct -= 0.03;
  }

  // Normalize back to 1.0
  const totalPct = awarenessPct + considerationPct + conversionPct;
  awarenessPct /= totalPct;
  considerationPct /= totalPct;
  conversionPct /= totalPct;

  return {
    awareness: awarenessPct * totalBudget,
    awarenessPercent: awarenessPct * 100,
    consideration: considerationPct * totalBudget,
    considerationPercent: considerationPct * 100,
    conversion: conversionPct * totalBudget,
    conversionPercent: conversionPct * 100,
  };
}
