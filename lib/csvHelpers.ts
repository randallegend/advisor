import type { TrendSignal, TargetAudience, AdFormat, FunnelBudget } from '@/lib/types';
import type { CampaignKPIs } from '@/lib/kpiHelpers';

interface CampaignCSVData {
  campaign: string;
  strategist: {
    name: string;
    title: string;
  };
  budget: number;
  funnelBudget: FunnelBudget;
  signals: TrendSignal;
  kpis: CampaignKPIs;
  audiences: TargetAudience[];
  adFormats: AdFormat[];
  keywords: string[];
  location: string;
}

export function generateCampaignCSV(data: CampaignCSVData): string {
  const {
    campaign,
    strategist,
    budget,
    funnelBudget,
    signals,
    kpis,
    audiences,
    adFormats,
    keywords,
    location,
  } = data;

  // Create CSV data structure
  const csvData = [
    // Header
    ['Campaign Strategy Report'],
    ['Campaign:', campaign],
    ['Strategist:', `${strategist.name} - ${strategist.title}`],
    ['Generated:', new Date().toLocaleDateString()],
    [''],

    // Campaign Overview
    ['CAMPAIGN OVERVIEW'],
    ['Total Budget:', `$${budget.toLocaleString()}`],
    ['Keywords:', keywords.join(', ')],
    ['Location:', location],
    [''],

    // Market Signals
    ['MARKET SIGNALS'],
    ['Demand Level:', signals.demand_level],
    ['Trend Direction:', signals.trend_direction],
    ['Purchase Urgency:', signals.purchase_urgency],
    ['Dominant Intent:', signals.dominant_intent],
    ['Geo Strength:', signals.geo_strength],
    ['Time Sensitivity:', signals.time_sensitivity],
    [''],

    // Funnel Budget Allocation
    ['BUDGET ALLOCATION BY FUNNEL STAGE'],
    ['Stage', 'Budget', 'Percentage'],
    ['Awareness', `$${funnelBudget.awareness.toLocaleString()}`, `${funnelBudget.awarenessPercent.toFixed(1)}%`],
    ['Consideration', `$${funnelBudget.consideration.toLocaleString()}`, `${funnelBudget.considerationPercent.toFixed(1)}%`],
    ['Conversion', `$${funnelBudget.conversion.toLocaleString()}`, `${funnelBudget.conversionPercent.toFixed(1)}%`],
    [''],

    // KPIs
    ['KEY PERFORMANCE INDICATORS'],
    ['Stage', 'Metric', 'Target'],
    ['Awareness', 'Impressions', kpis.awareness.impressions.toLocaleString()],
    ['Awareness', 'Reach', kpis.awareness.reach.toLocaleString()],
    ['Consideration', 'CTR', `${kpis.consideration.ctr}%`],
    ['Consideration', 'Engagement', kpis.consideration.engagement.toLocaleString()],
    ['Conversion', 'Conversions', kpis.conversion.conversions.toLocaleString()],
    ['Conversion', 'ROAS', `${kpis.conversion.roas}x`],
    [''],

    // Target Audiences
    ['TARGET AUDIENCES'],
    ['Name', 'Size', 'Demographics & Targeting', 'Behavioral Patterns'],
    ...audiences.map(audience => [
      audience.name,
      audience.size,
      audience.targeting,
      audience.behavioral
    ]),
    [''],

    // Ad Formats
    ['AD FORMATS & TARGETING'],
    ['Type', 'Budget', 'Platforms', 'Est. CTR'],
    ...adFormats.map(ad => [
      ad.type,
      `$${ad.budget.toLocaleString()}`,
      ad.platforms,
      `${ad.estimatedCTR}%`
    ]),
  ];

  // Convert to CSV string
  const csvContent = csvData.map(row =>
    row.map(cell => {
      // Escape cells containing commas, quotes, or newlines
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');

  return csvContent;
}
