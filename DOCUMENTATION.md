# AdVisor - Project Documentation

## Approach and Methodology

### Problem Statement
Creating effective advertising campaigns requires expertise in audience targeting, budget allocation, and market timing. Small businesses and marketers often lack access to data-driven insights that large agencies use. AdVisor democratizes this by using AI to generate professional campaign strategies from simple natural language descriptions.

### Solution Architecture

```
User Input (Natural Language)
        │
        ▼
┌─────────────────────────────┐
│   Entity Extraction (AI)    │  ← Extracts business type, industry, location, event, keywords
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│   Google Trends API         │  ← Fetches real-time search trend data via SerpAPI
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│   Signal Analysis (AI)      │  ← Analyzes trends to determine demand, urgency, intent
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│   Strategy Generation (AI)  │  ← Generates audiences, ad formats, budget allocation
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│   Interactive Refinement    │  ← User can chat with AI to adjust strategy
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│   PDF Export                │  ← Export polished campaign blueprint
└─────────────────────────────┘
```

### Core Methodology

1. **Entity-First Approach**: Before generating any strategy, we extract structured entities from the user's natural language input. This ensures the AI has concrete data points to work with.

2. **Data-Grounded Signals**: Instead of pure AI hallucination, we fetch real Google Trends data to ground our market signals in actual search behavior. When trends data is unavailable, we fall back to AI-generated signals but mark them as such.

3. **Strategist Personas**: Users select from AI strategist personas (Performance, Brand, Growth, Analytics), each with different optimization priorities. This provides variety while maintaining strategic coherence.

4. **Interactive Refinement**: The campaign isn't static. Users can chat with their AI strategist to adjust budget allocation, audience targeting, and ad format mix through natural conversation.

5. **Dynamic Budget Scaling**: Ad format budgets are stored as weights (fractions) rather than absolute values, allowing them to scale proportionally when the total budget changes.

---

## AI Tools and Techniques Used

### Primary AI: Anthropic Claude API

**Model**: Claude 3.5 Sonnet (claude-sonnet-4-20250514)

**Usage Points**:

| Function | Purpose | Technique |
|----------|---------|-----------|
| Entity Extraction | Parse campaign description into structured data | JSON-mode prompting with strict schema |
| Signal Analysis | Analyze trends data into actionable signals | Few-shot prompting with signal definitions |
| Strategy Generation | Create audiences, ad formats, rationale | System prompt with strategist persona |
| Chat Refinement | Process user feedback and adjust strategy | Structured JSON response with change deltas |

### External Data: SerpAPI (Google Trends)

- Fetches real-time interest-over-time data for keywords
- Supports geographic filtering
- Provides related queries (rising/breakout)

### Key AI Techniques

**1. Structured Output Prompting**
```
All AI responses are requested in strict JSON format with defined schemas.
This ensures reliable parsing and prevents hallucinated field names.
```

**2. Persona-Based System Prompts**
```
Each strategist has a unique system prompt that influences:
- Tone and communication style
- Optimization priorities (ROI vs reach vs growth)
- Risk tolerance in recommendations
```

**3. Fallback Handling**
```
When AI returns invalid JSON or non-JSON responses:
1. Attempt regex extraction of JSON from response
2. If no JSON found, use raw text as message content
3. Log errors for debugging without crashing the UI
```

**4. Signal Interpretation Framework**
```
Trends data is converted to actionable signals:
- demand_level: Based on search volume relative to baseline
- trend_direction: Based on recent trajectory (rising/falling/stable)
- purchase_urgency: Inferred from keyword intent signals
- dominant_intent: Informational vs transactional classification
- geo_strength: How localized the search interest is
- time_sensitivity: Event proximity and seasonality factors
```

---

## Known Limitations

### Technical Limitations

1. **Trends API Rate Limits**: SerpAPI has request limits; heavy usage may hit quotas
2. **No Real Ad Platform Integration**: Strategies are recommendations only, not executable campaigns
4. **No Historical Campaign Data**: Cannot learn from past campaign performance

### AI Limitations

1. **Hallucination Risk**: AI may generate plausible-sounding but incorrect audience sizes or CTR estimates
2. **Limited Industry Knowledge**: General marketing knowledge, not deep vertical expertise

### UX Limitations

1. **No Collaborative Editing**: Single-user campaigns only
2. **No A/B Testing Suggestions**: Single strategy per campaign
---

## Future Improvements

### Short-Term (Next Sprint)

- [ ] Add more export formats
- [ ] Improve mobile responsiveness

### Medium-Term (Next Quarter)
- [ ] Campaign performance tracking (manual input)
- [ ] Team collaboration features
- [ ] Custom strategist persona creation

### Long-Term (Future Roadmap)

- [ ] Direct integration with Google Ads, Meta Ads APIs
- [ ] Machine learning on campaign outcomes to improve recommendations
- [ ] Automated A/B test generation
---

## Prompt Logs

### 1. Entity Extraction Prompt

```
System: You are a marketing campaign analyst. Extract structured entities from campaign descriptions.

User: Extract campaign entities from: "{user_input}"

Return JSON with:
- businessType: The type of business
- industry: Industry category
- location: Geographic target (or "global")
- event: Related event/holiday if any
- eventType: "fixed_date" | "floating_holiday" | "seasonal" | "none"
- keywords: Array of 3-5 relevant search keywords
```

### 2. Signal Analysis Prompt

```
System: You are a market analyst. Analyze Google Trends data and return market signals.

User: Analyze this trends data for "{keywords}" in "{location}":
{trends_data}

Return JSON with:
- demand_level: "low" | "medium" | "high"
- trend_direction: "falling" | "stable" | "rising"
- purchase_urgency: "low" | "medium" | "high"
- dominant_intent: "informational" | "transactional" | "mixed"
- geo_strength: "weak" | "medium" | "strong"
- time_sensitivity: "short" | "medium" | "long"
```

### 3. Strategy Generation Prompt

```
System: You are {strategist_name}, a {strategist_title}. {strategist_description}

Generate a campaign strategy for:
- Campaign: {prompt}
- Budget: ${budget}
- Location: {location}
- Keywords: {keywords}
- Market Signals: {signals}

Return JSON with:
- audiences: Array of target audience segments with name, size, targeting, behavioral
- adFormats: Array of ad formats with type, budget, platforms, estimatedCTR
- strategyRationale: Array of insight/implication pairs explaining the strategy
- initialMessage: A brief greeting explaining the strategy approach
```

### 4. Chat Refinement Prompt

```
System: You are {strategist_name}. The user wants to refine their campaign strategy.

Current strategy:
- Funnel: {funnel_allocation}
- Audiences: {audiences}
- Ad Formats: {ad_formats}

User message: {user_message}

Return JSON with:
- message: Your response to the user
- changes: (optional) Object containing any strategy changes:
  - funnel_weights: { awareness, consideration, conversion } (fractions summing to 1)
  - audience_strategy: Updated audience array
  - ad_format_weights: { format_type: weight } mapping
```

---

## Technical Implementation Notes

### State Management
- React useState for local component state
- Supabase for persistent storage

### Key Design Decisions

1. **Server Actions over API Routes**: Used Next.js server actions for all AI calls to keep API keys secure and reduce client bundle size

2. **Weight-Based Budget Allocation**: Storing ad format budgets as weights (0-1 fractions) allows dynamic recalculation when total budget changes without losing proportions

3. **Graceful Degradation**: When Google Trends data is unavailable, the system falls back to AI-generated signals rather than failing

4. **Optimistic UI**: Chat messages appear immediately while AI processes, with loading states for responses

---

## Credits

Built for the MediaJel Hackathon 2026

**Tech Stack**: Next.js 16, TypeScript, Tailwind CSS, Supabase, Anthropic Claude API, SerpAPI
