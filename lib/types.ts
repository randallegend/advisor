// Campaign entity types
export interface CampaignEntities {
  businessType: string;
  industry: string;
  location: string;
  event: string;
  eventType: "fixed_date" | "floating_holiday" | "seasonal" | "none";
  keywords: string[];
}

// Trend signal types
export type TrendSignal = {
  demand_level: "low" | "medium" | "high";
  trend_direction: "falling" | "stable" | "rising";
  purchase_urgency: "low" | "medium" | "high";
  dominant_intent: "informational" | "transactional" | "mixed";
  geo_strength: "weak" | "medium" | "strong";
  time_sensitivity: "short" | "medium" | "long";
};

// Funnel budget allocation types
export interface FunnelBudget {
  awareness: number;
  awarenessPercent: number;
  consideration: number;
  considerationPercent: number;
  conversion: number;
  conversionPercent: number;
}

// SerpAPI Trends response types
export interface TrendsTimelineValue {
  query: string;
  value: string;
  extracted_value: number;
}

export interface TrendsTimelineData {
  date: string;
  timestamp: string;
  values: TrendsTimelineValue[];
}

export interface TrendsResponse {
  search_metadata: {
    id: string;
    status: string;
    created_at: string;
    processed_at: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    hl: string;
    date: string;
    tz: string;
    data_type: string;
  };
  interest_over_time?: {
    timeline_data: TrendsTimelineData[];
  };
}

// Target audience types
export interface TargetAudience {
  name: string;
  size: string;
  targeting: string;
  behavioral: string;
}

// Ad format types
export interface AdFormat {
  type: string;
  budget: number;
  weight?: number; // 0-1 fraction of total budget (for dynamic scaling)
  platforms: string;
  estimatedCTR: number;
}

// Strategy rationale bullet point
export interface StrategyRationale {
  insight: string;
  implication: string;
}

// Confidence indicator data
export interface ConfidenceData {
  level: "high" | "medium" | "low";
  score: number; // 0-100
  sources: string[];
  note: string;
}

// AI Strategy response
export interface AIStrategyResponse {
  audiences: TargetAudience[];
  adFormats: AdFormat[];
  strategyRationale: StrategyRationale[];
}

// Strategist stored in campaign (minimal - what goes to DB)
export interface CampaignStrategist {
  id: string;
  name: string;
  title: string;
  avatar: string;
}

// Strategist UI properties (for styling)
export interface StrategistUI extends CampaignStrategist {
  description: string;
  icon: string;
  gradient: string;
  bgColor: string;
  lightBg: string;
  textColor: string;
  primaryHex: string;
  secondaryHex: string;
}

// Campaign data (matches DB schema + runtime state)
export interface CampaignData {
  id?: string;
  prompt: string;
  strategist: CampaignStrategist;
  budget: number;
  keywords: string[];
  location: string;
  signals: TrendSignal;
  signalSource: "data" | "ai";
  funnelBudget?: FunnelBudget;
  audiences: TargetAudience[];
  adFormats: AdFormat[];
  strategyRationale: StrategyRationale[];
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>;
  initialMessage: string;
  status: "draft" | "finished";
}

// AI Chat response with changes
export interface AIChatResponse {
  message: string;
  changes?: {
    budget?: number; // New total campaign budget (between 1000 and 100000)
    funnel_weights?: {
      awareness: number;
      consideration: number;
      conversion: number;
    };
    audience_strategy?: TargetAudience[];
    ad_format_weights?: {
      [key: string]: number; // e.g., { "search": 0.45, "video": 0.30, "display": 0.25 }
    };
  };
}
