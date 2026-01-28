import type { FunnelBudget, TrendSignal } from "@/lib/types";

export interface CampaignKPIs {
  awareness: {
    impressions: number;
    reach: number;
  };
  consideration: {
    ctr: number; // as percentage
    engagement: number;
  };
  conversion: {
    conversions: number;
    roas: number;
  };
}

interface KPIParams {
  avgSalePrice?: number;
  audienceSize?: number;
}

export function computeCampaignKPIs(
  funnelBudget: FunnelBudget,
  signals: TrendSignal,
  params: KPIParams = {}
): CampaignKPIs {
  const { avgSalePrice = 100, audienceSize = 250000 } = params;

  // Base constants
  const baseImpressionsPerDollar = 150;
  const reachRatio = 0.55; // 55% of impressions become reach
  const baseCTR = 2.5; // 2.5% base CTR
  const baseConversionRate = 0.025; // 2.5% base conversion rate
  const averageClicksPerEngagedUser = 2.5;

  // 1. IMPRESSIONS (Awareness)
  // Adjust impressions per dollar based on geo strength
  let impressionsPerDollar = baseImpressionsPerDollar;
  if (signals.geo_strength === "strong") {
    impressionsPerDollar *= 1.3;
  } else if (signals.geo_strength === "weak") {
    impressionsPerDollar *= 0.8;
  }

  const impressions = Math.round(
    funnelBudget.awareness * impressionsPerDollar
  );

  // 2. REACH (Awareness)
  const reach = Math.round(impressions * reachRatio);

  // 3. CTR (Consideration)
  // Adjust CTR based on demand level and purchase urgency
  let ctrMultiplier = 1.0;

  if (signals.demand_level === "high") {
    ctrMultiplier *= 1.2;
  } else if (signals.demand_level === "low") {
    ctrMultiplier *= 0.85;
  }

  if (signals.purchase_urgency === "high") {
    ctrMultiplier *= 1.15;
  } else if (signals.purchase_urgency === "low") {
    ctrMultiplier *= 0.9;
  }

  if (signals.trend_direction === "rising") {
    ctrMultiplier *= 1.1;
  } else if (signals.trend_direction === "falling") {
    ctrMultiplier *= 0.95;
  }

  const ctr = baseCTR * ctrMultiplier;

  // 4. ENGAGEMENT (Consideration)
  // Calculate clicks from impressions, then multiply by engagement factor
  const clicks = Math.round(impressions * (ctr / 100));
  const engagement = Math.round(clicks * averageClicksPerEngagedUser);

  // 5. CONVERSIONS (Conversion)
  // Adjust conversion rate based on signals
  let conversionRate = baseConversionRate;

  if (signals.purchase_urgency === "high") {
    conversionRate *= 1.4;
  } else if (signals.purchase_urgency === "low") {
    conversionRate *= 0.7;
  }

  if (signals.dominant_intent === "transactional") {
    conversionRate *= 1.3;
  } else if (signals.dominant_intent === "informational") {
    conversionRate *= 0.8;
  }

  if (signals.trend_direction === "rising") {
    conversionRate *= 1.15;
  }

  const conversions = Math.round(clicks * conversionRate);

  // 6. ROAS (Conversion)
  // Revenue = conversions * average sale price
  // ROAS = revenue / conversion budget
  const revenueGenerated = conversions * avgSalePrice;
  const roas =
    funnelBudget.conversion > 0
      ? revenueGenerated / funnelBudget.conversion
      : 0;

  return {
    awareness: {
      impressions,
      reach,
    },
    consideration: {
      ctr: parseFloat(ctr.toFixed(2)),
      engagement,
    },
    conversion: {
      conversions,
      roas: parseFloat(roas.toFixed(1)),
    },
  };
}
