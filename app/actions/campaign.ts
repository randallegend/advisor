"use server";

import Anthropic from "@anthropic-ai/sdk";
import { getJson } from "serpapi";
import { resolveEventDate, buildDateRange } from "@/lib/dateHelpers";
import { resolveGeoLocation } from "@/lib/geoHelpers";
import { computeConfidence } from "@/lib/confidenceHelpers";
import type {
  CampaignEntities,
  TrendSignal,
  TrendsTimelineValue,
  TrendsResponse,
  AIStrategyResponse,
  AIChatResponse,
  TargetAudience,
  AdFormat,
} from "@/lib/types";

const anthropic = new Anthropic();
const SERPAPI_KEY = process.env.NEXT_SERPAPI_KEY;

export async function extractCampaignEntities(userPrompt: string) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
            content: `You are a structured data extraction assistant. Only return valid JSON, no markdown, no explanation, no code fences.

  Extract structured entities from the following request:

  {
    "businessType": string,
    "industry": string,
    "location": string,
    "event": string,
    "eventType": "fixed_date" | "floating_holiday" | "seasonal" | "none",
    "keywords": string[]
  }

  User request:
  "${userPrompt}"`,
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    return { success: true, data: parsed };
  } catch (error) {
    console.error("Claude API error:", error);
    return { success: false, error: String(error) };
  }
}

function computeTrendSignal(
  trendsData: { date: string; timestamp: string; values: TrendsTimelineValue[] }[]
): TrendSignal {
  // Extract values from timeline data
  const values = trendsData.map((d) => d.values[0]?.extracted_value || 0);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);

  // 1. Demand Level (based on average interest)
  let demand_level: "low" | "medium" | "high";
  if (avg < 30) {
    demand_level = "low";
  } else if (avg < 60) {
    demand_level = "medium";
  } else {
    demand_level = "high";
  }

  // 2. Trend Direction (slope analysis)
  const midpoint = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const slope = secondAvg - firstAvg;

  let trend_direction: "falling" | "stable" | "rising";
  if (slope < -5) {
    trend_direction = "falling";
  } else if (slope > 5) {
    trend_direction = "rising";
  } else {
    trend_direction = "stable";
  }

  // 3. Purchase Urgency (based on peak proximity)
  const peakIndex = values.indexOf(max);
  const recency = peakIndex / values.length;

  let purchase_urgency: "low" | "medium" | "high";
  if (recency > 0.7 || trend_direction === "rising") {
    purchase_urgency = "high";
  } else if (recency > 0.4) {
    purchase_urgency = "medium";
  } else {
    purchase_urgency = "low";
  }

  // 4. Dominant Intent (heuristic based on demand + urgency)
  let dominant_intent: "informational" | "transactional" | "mixed";
  if (purchase_urgency === "high" && demand_level === "high") {
    dominant_intent = "transactional";
  } else if (purchase_urgency === "low" && demand_level === "low") {
    dominant_intent = "informational";
  } else {
    dominant_intent = "mixed";
  }

  // 5. Geo Strength (based on max interest)
  let geo_strength: "weak" | "medium" | "strong";
  if (max < 40) {
    geo_strength = "weak";
  } else if (max < 70) {
    geo_strength = "medium";
  } else {
    geo_strength = "strong";
  }

  // 6. Time Sensitivity (based on volatility)
  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) /
    values.length;
  const volatility = Math.sqrt(variance);

  let time_sensitivity: "short" | "medium" | "long";
  if (volatility > 20) {
    time_sensitivity = "short";
  } else if (volatility > 10) {
    time_sensitivity = "medium";
  } else {
    time_sensitivity = "long";
  }

  return {
    demand_level,
    trend_direction,
    purchase_urgency,
    dominant_intent,
    geo_strength,
    time_sensitivity,
  };
}

async function getTrendAI(entities: CampaignEntities): Promise<TrendSignal> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are a marketing trend analyst. Infer trend signals for a campaign based on the following entities. Only return valid JSON, no markdown, no explanation, no code fences.

Campaign Context:
- Business Type: ${entities.businessType}
- Industry: ${entities.industry}
- Location: ${entities.location}
- Event: ${entities.event}
- Event Type: ${entities.eventType}
- Keywords: ${entities.keywords.join(", ")}

Return this exact structure:
{
  "demand_level": "low" | "medium" | "high",
  "trend_direction": "falling" | "stable" | "rising",
  "purchase_urgency": "low" | "medium" | "high",
  "dominant_intent": "informational" | "transactional" | "mixed",
  "geo_strength": "weak" | "medium" | "strong",
  "time_sensitivity": "short" | "medium" | "long"
}`,
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    return parsed as TrendSignal;
  } catch (error) {
    console.error("getTrendAI error:", error);
    // Fallback to conservative defaults
    return {
      demand_level: "medium",
      trend_direction: "stable",
      purchase_urgency: "medium",
      dominant_intent: "mixed",
      geo_strength: "medium",
      time_sensitivity: "medium",
    };
  }
}

export async function getTrends(entities: CampaignEntities) {
  try {
    // 1. Try to resolve event date
    const currentYear = new Date().getFullYear();
    let eventDate = resolveEventDate(entities.event, currentYear);

    // 2. Fallback if event date is null
    let effectiveEventType = entities.eventType;
    if (!eventDate && entities.event && entities.event !== "none") {
      // Unknown event, switch to seasonal logic
      effectiveEventType = "seasonal";
    }

    // 3. Build date range for trends query
    const dateRange = buildDateRange(eventDate, effectiveEventType);

    // 4. Resolve geo location
    const geoCode = resolveGeoLocation(entities.location);

    // 5. Prepare query from keywords (use first 1 keyword)
    const query = entities.keywords.slice(0, 1).join(" ");

    if (!query) {
      return {
        success: false,
        error: "No keywords provided for trends analysis",
      };
    }
    // 6. Call SerpAPI
    return new Promise(async (resolve, reject) => {
      getJson(
        {
          engine: "google_trends",
          q: query,
          date: dateRange,
          geo: geoCode,
          tz: "420",
          data_type: "TIMESERIES",
          api_key: SERPAPI_KEY,
        },
        async (data) => {
          const trendsData = data as TrendsResponse;
          if (trendsData.interest_over_time) {
            // Compute trend signals from actual data
            const signals = computeTrendSignal(
              trendsData.interest_over_time.timeline_data
            );

            // Compute confidence based on signals and data source
            const confidence = computeConfidence(signals, "data", entities.location, true);

            // Generate explanation message
            const initialMessage = await generateSignalsExplanation(entities, signals);

            resolve({
              success: true,
              data: trendsData.interest_over_time.timeline_data,
              metadata: {
                query,
                dateRange,
                geo: geoCode || "Worldwide",
                location: entities.location,
                eventDate: eventDate?.toISOString() || null,
                eventType: effectiveEventType,
                signals,
                signalSource: "data",
                initialMessage,
                confidence,
              },
            });
          } else {
            // AI fallback when no trends data available
            const signals = await getTrendAI(entities);

            // Compute confidence based on signals and data source (lower for AI inference)
            const confidence = computeConfidence(signals, "ai", entities.location, false);

            const initialMessage = await generateSignalsExplanation(entities, signals);

            resolve({
              success: true,
              data: [],
              metadata: {
                query,
                dateRange,
                geo: geoCode || "Worldwide",
                location: entities.location,
                eventDate: eventDate?.toISOString() || null,
                eventType: effectiveEventType,
                signals,
                signalSource: "ai",
                initialMessage,
                confidence,
              },
            });
          }
        }
      );
    });
  } catch (error) {
    console.error("Trends API error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Generate signals explanation message using Claude API
 * Returns a calm, confident explanation of what the market signals indicate
 */
async function generateSignalsExplanation(
  entities: CampaignEntities,
  signals: TrendSignal
): Promise<string> {
  try {
    const prompt = `You are an expert digital marketing strategist. Analyze the following campaign data and market signals, then provide a brief, calm, confident overview of what the data indicates.

Campaign Context:
- Keywords: ${entities.keywords.join(", ")}
- Location: ${entities.location}
- Event: ${entities.event}
- Industry: ${entities.industry}

Market Signals Detected:
- Demand level: ${signals.demand_level}
- Trend direction: ${signals.trend_direction}
- Purchase urgency: ${signals.purchase_urgency}
- Dominant intent: ${signals.dominant_intent}
- Geographic strength: ${signals.geo_strength}
- Time sensitivity: ${signals.time_sensitivity}

Write a concise message (3 short paragraphs max, ~150 words total) that:
1. Starts with "Campaign Overview — Market Signals Detected"
2. Briefly explains what the data indicates (1-2 sentences)
3. Summarizes 3-4 key signals using bullet points (keep each bullet to one short line)
4. Ends with one sentence offering to refine the focus

Keep it concise, professional, and strategic. No fluff.

Tone: Calm, confident, strategist-like. Not salesy or overly technical.

Return ONLY the message text, no JSON, no markdown formatting, no code fences.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return text.trim();
  } catch (error) {
    console.error("Signals explanation generation error:", error);
    // Return a fallback message
    return `Campaign Overview — Market Signals Detected

Based on the search and interest trends for "${entities.keywords.join(", ")}" in ${entities.location}, I've analyzed the current market conditions and prepared a strategic recommendation.

The data indicates ${signals.demand_level} demand with a ${signals.trend_direction} trend direction. User intent appears to be ${signals.dominant_intent}, with ${signals.purchase_urgency} purchase urgency.

Using these signals, I've outlined a recommended audience strategy and ad format mix to balance awareness, consideration, and conversion.

Let me know if you'd like to refine the focus or adjust the strategy.`;
  }
}

/**
 * Generate campaign strategy using Claude API
 * Returns target audiences and ad format recommendations
 */
export async function generateCampaignStrategy(
  budget: number,
  signals: TrendSignal,
  keywords: string[],
  location: string
): Promise<{ success: boolean; data?: AIStrategyResponse; error?: string }> {
  try {
    const prompt = `You are an expert digital marketing strategist. Analyze the following campaign data and provide strategic recommendations.

Campaign Data:
${JSON.stringify(
  {
    budget,
    funnelSignals: signals,
    keywords,
    location,
  },
  null,
  2
)}

Generate a comprehensive campaign strategy with:

1. Target Audiences (2-3 segments):
   - Name: descriptive segment name
   - Size: estimated audience size (e.g., "125K", "85K")
   - Targeting: demographics (age, gender, income, interests)
   - Behavioral: search patterns, purchase behavior, timing preferences

2. Ad Formats (3-4 formats):
   - Type: ad format name (e.g., "Display Ads", "Video Ads", "Search Ads", "Social Media Ads")
   - Budget: dollar amount allocated to this format based on total budget
   - Platforms: where ads will run (e.g., "Google Display, Facebook")
   - EstimatedCTR: realistic CTR percentage (e.g., 2.1, 3.5, 4.2)

3. Strategy Rationale (3-4 bullet points):
   - Insight: a data-driven observation (e.g., "Search demand rising +42% week-over-week")
   - Implication: the strategic action taken based on that insight (e.g., "Prioritize conversion-focused formats")

Consider the trend signals when making recommendations:
- High demand/urgency → prioritize conversion-focused formats
- Strong geo → emphasize local targeting
- Transactional intent → focus on search and retargeting
- Rising trend → allocate more to scalable formats

Return ONLY valid JSON in this exact structure (no markdown, no code fences, no explanation):
{
  "audiences": [
    {
      "name": "string",
      "size": "string",
      "targeting": "string",
      "behavioral": "string"
    }
  ],
  "adFormats": [
    {
      "type": "string",
      "budget": number,
      "platforms": "string",
      "estimatedCTR": number
    }
  ],
  "strategyRationale": [
    {
      "insight": "string",
      "implication": "string"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text) as AIStrategyResponse;

    return { success: true, data: parsed };
  } catch (error) {
    console.error("AI Strategy generation error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Chat with AI strategist to refine campaign
 * Returns message with optional changes to funnel, audiences, or ad formats
 */
export async function chatWithStrategist(
  userMessage: string,
  currentState: {
    budget: number;
    signals: TrendSignal;
    keywords: string[];
    location: string;
    funnelWeights: { awareness: number; consideration: number; conversion: number };
    audiences: TargetAudience[];
    adFormats: AdFormat[];
  },
  strategistPersona?: {
    name: string;
    title: string;
    description: string;
  },
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ success: boolean; data?: AIChatResponse; error?: string }> {
  try {
    // Build persona context
    let personaContext = "";
    if (strategistPersona) {
      personaContext = `You are ${strategistPersona.name}, a ${strategistPersona.title}. ${strategistPersona.description}

Your strategic approach:`;

      if (strategistPersona.name === "Ian") {
        personaContext += `
- Data-obsessed and conversion-focused
- Prioritize ROI, ROAS, and performance metrics
- Recommend bottom-funnel optimizations and conversion rate improvements
- Always justify decisions with expected performance impact`;
      } else if (strategistPersona.name === "Mart") {
        personaContext += `
- Creative storyteller focused on brand building
- Prioritize awareness, reach, and emotional connections
- Recommend creative campaigns and upper-funnel strategies
- Emphasize long-term brand value over short-term conversions`;
      } else if (strategistPersona.name === "Randall") {
        personaContext += `
- Analytics wizard focused on data and trends
- Prioritize statistical insights and market signals
- Recommend testing, measurement, and data-driven optimization
- Base all suggestions on trend analysis and behavioral patterns`;
      }
      personaContext += "\n\n";
    }

    const prompt = `${personaContext}You are helping refine a digital marketing campaign. The user has sent you a message asking for changes.

Current Campaign State:
${JSON.stringify(
  {
    budget: currentState.budget,
    funnelWeights: currentState.funnelWeights,
    signals: currentState.signals,
    keywords: currentState.keywords,
    location: currentState.location,
    currentAudiences: currentState.audiences,
    currentAdFormats: currentState.adFormats,
  },
  null,
  2
)}

User Message: "${userMessage}"

CONVERSATION GUIDELINES:
- STAY ON TOPIC: This conversation is about optimizing this specific campaign. Only discuss campaign strategy, budget allocation, audiences, and ad formats.
- If the user greets you (hello, hi, etc.): Respond briefly and professionally, then ask how you can help optimize their campaign. Do NOT include "changes".
- If the user asks off-topic questions: Politely redirect them back to campaign optimization. Do NOT include "changes".
- If the user asks for clarification or information: Provide helpful context about the current strategy. Do NOT include "changes" unless they explicitly request modifications.
- ONLY include "changes" when the user clearly requests campaign modifications (e.g., "allocate more to X", "focus on Y audiences", "increase Z budget").

What you CAN modify (only when requested):
1. **funnel_weights** - Adjust budget allocation across awareness/consideration/conversion (must sum to 1.0)
2. **audience_strategy** - Replace or update audience segments with new targeting
3. **ad_format_weights** - Change ad format allocation (must sum to 1.0)

Return ONLY valid JSON (no markdown, no code fences) in this exact structure:
{
  "message": "Brief explanation (1-2 sentences max)",
  "changes": {
    "funnel_weights": {
      "awareness": 0.45,
      "consideration": 0.25,
      "conversion": 0.30
    },
    "audience_strategy": [
      {
        "name": "Audience Name",
        "size": "100K",
        "targeting": "Demographics and targeting details",
        "behavioral": "Behavioral characteristics"
      }
    ],
    "ad_format_weights": {
      "search": 0.45,
      "video": 0.30,
      "display": 0.25
    }
  }
}

IMPORTANT RULES:
- Only include fields in "changes" that are relevant to the user's request
- If no modifications are requested, omit "changes" entirely
- If greeting or off-topic, omit "changes" and redirect to campaign strategy
- Weights must sum to 1.0 (normalize if needed)
- Keep messages concise and strategic, not salesy`;

    // Build conversation history context as text
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 1) {
      // Include previous exchanges for context (limit to last 10 messages)
      const recentHistory = conversationHistory.slice(-10);
      conversationContext = "\n\nPREVIOUS CONVERSATION:\n";
      for (const msg of recentHistory) {
        const role = msg.role === "assistant" ? "Strategist" : "User";
        conversationContext += `${role}: ${msg.content}\n`;
      }
      conversationContext += "\n(Use this context to understand what the user is referring to)";
    }

    const fullPrompt = prompt + conversationContext + `\n\nCurrent User Message: "${userMessage}"`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();

    let parsed: AIChatResponse;
    try {
      // Try to extract JSON from the response (might be embedded in text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]) as AIChatResponse;
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Fallback: treat the entire response as the message (no changes)
      parsed = {
        message: text || "I apologize, but I couldn't process that request. Could you please rephrase?",
      };
    }

    return { success: true, data: parsed };
  } catch (error) {
    console.error("AI Chat error:", error);
    return { success: false, error: String(error) };
  }
}
