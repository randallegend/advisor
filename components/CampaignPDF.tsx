import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { TrendSignal, TargetAudience, AdFormat, FunnelBudget, StrategyRationale } from '@/lib/types';
import type { CampaignKPIs } from '@/lib/kpiHelpers';

interface CampaignPDFProps {
  campaign: string;
  strategist: {
    name: string;
    title: string;
    avatar: string;
  };
  budget: number;
  funnelBudget: FunnelBudget;
  signals: TrendSignal;
  kpis: CampaignKPIs;
  audiences: TargetAudience[];
  adFormats: AdFormat[];
  keywords: string[];
  location: string;
  strategyRationale?: StrategyRationale[];
  includeRationale?: boolean;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #D4B2F4',
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',

  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 60,
    height: 50,
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C0E66',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#561493',
    marginBottom: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C0E66',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: '1 solid #F0E5FC',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#561493',
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#3C0E66',
    width: '70%',
  },
  // Funnel styles
  funnelContainer: {
    marginBottom: 10,
  },
  funnelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  funnelLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3C0E66',
    width: '25%',
  },
  funnelBarOuter: {
    width: '60%',
    height: 24,
    backgroundColor: '#F0E5FC',
    borderRadius: 8,
    position: 'relative',
  },
  funnelBarInner: {
    height: 24,
    borderRadius: 8,
  },
  funnelAmount: {
    fontSize: 9,
    color: '#FFFFFF',
    position: 'absolute',
    left: 8,
    top: 7,
    fontWeight: 'bold',
  },
  funnelPercent: {
    fontSize: 10,
    color: '#561493',
    width: '15%',
    textAlign: 'right',
  },
  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '31%',
    backgroundColor: '#F8F2FE',
    borderRadius: 12,
    padding: 12,
    border: '1 solid #D4B2F4',
  },
  kpiStage: {
    fontSize: 8,
    color: '#701AC0',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  kpiMetric: {
    fontSize: 9,
    color: '#561493',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C0E66',
  },
  // Audience card
  audienceCard: {
    backgroundColor: '#F8F2FE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    border: '1 solid #D4B2F4',
  },
  audienceName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3C0E66',
    marginBottom: 4,
  },
  audienceSize: {
    fontSize: 10,
    color: '#701AC0',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  audienceDetail: {
    fontSize: 9,
    color: '#561493',
    marginBottom: 3,
    lineHeight: 1.3,
  },
  audienceLabel: {
    fontSize: 9,
    color: '#701AC0',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  // Ad Format
  adFormatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F2FE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    border: '1 solid #D4B2F4',
  },
  adFormatLeft: {
    width: '60%',
  },
  adFormatType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3C0E66',
    marginBottom: 3,
  },
  adFormatPlatform: {
    fontSize: 8,
    color: '#561493',
  },
  adFormatRight: {
    width: '35%',
    alignItems: 'flex-end',
  },
  adFormatBudget: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#701AC0',
    marginBottom: 2,
  },
  adFormatCTR: {
    fontSize: 8,
    color: '#561493',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#561493',
    paddingTop: 10,
    borderTop: '1 solid #F0E5FC',
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    width: '48%',
  },
  // Strategy Rationale
  rationaleCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    border: '1 solid #FCD34D',
  },
  rationaleNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 4,
    marginRight: 10,
  },
  rationaleContent: {
    flex: 1,
  },
  rationaleInsight: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3C0E66',
    marginBottom: 2,
  },
  rationaleImplication: {
    fontSize: 9,
    color: '#561493',
    lineHeight: 1.3,
  },
});

export default function CampaignPDF({
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
  strategyRationale = [],
  includeRationale = false,
}: CampaignPDFProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo - Absolute positioned */}
        <View style={styles.headerRight}>
          <Image src="/assets/images/advisor_logo.png" style={styles.logo} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Campaign Strategy Report</Text>
            <Text style={styles.subtitle}>{campaign}</Text>
            <Text style={styles.subtitle}>Strategist: {strategist.name} • {strategist.title}</Text>
          </View>
        </View>

        {/* Campaign Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campaign Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Budget:</Text>
            <Text style={styles.value}>${budget.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Keywords:</Text>
            <Text style={styles.value}>{keywords.join(', ')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{location}</Text>
          </View>
        </View>

        {/* Market Signals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Signals</Text>
          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>Demand Level:</Text>
                <Text style={styles.value}>{signals.demand_level}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Trend Direction:</Text>
                <Text style={styles.value}>{signals.trend_direction}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Purchase Urgency:</Text>
                <Text style={styles.value}>{signals.purchase_urgency}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>Dominant Intent:</Text>
                <Text style={styles.value}>{signals.dominant_intent}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Geo Strength:</Text>
                <Text style={styles.value}>{signals.geo_strength}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Time Sensitivity:</Text>
                <Text style={styles.value}>{signals.time_sensitivity}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Funnel Allocation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Allocation by Funnel Stage</Text>

          {/* Awareness */}
          <View style={styles.funnelBar}>
            <Text style={styles.funnelLabel}>Awareness</Text>
            <View style={styles.funnelBarOuter}>
              <View style={[styles.funnelBarInner, {
                width: `${funnelBudget.awarenessPercent}%`,
                backgroundColor: '#06B6D4'
              }]}>
                <Text style={styles.funnelAmount}>${funnelBudget.awareness.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.funnelPercent}>{funnelBudget.awarenessPercent.toFixed(1)}%</Text>
          </View>

          {/* Consideration */}
          <View style={styles.funnelBar}>
            <Text style={styles.funnelLabel}>Consideration</Text>
            <View style={styles.funnelBarOuter}>
              <View style={[styles.funnelBarInner, {
                width: `${funnelBudget.considerationPercent}%`,
                backgroundColor: '#8A2BE2'
              }]}>
                <Text style={styles.funnelAmount}>${funnelBudget.consideration.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.funnelPercent}>{funnelBudget.considerationPercent.toFixed(1)}%</Text>
          </View>

          {/* Conversion */}
          <View style={styles.funnelBar}>
            <Text style={styles.funnelLabel}>Conversion</Text>
            <View style={styles.funnelBarOuter}>
              <View style={[styles.funnelBarInner, {
                width: `${funnelBudget.conversionPercent}%`,
                backgroundColor: '#10B981'
              }]}>
                <Text style={styles.funnelAmount}>${funnelBudget.conversion.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.funnelPercent}>{funnelBudget.conversionPercent.toFixed(1)}%</Text>
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiStage}>AWARENESS</Text>
              <Text style={styles.kpiMetric}>Impressions</Text>
              <Text style={styles.kpiValue}>{formatNumber(kpis.awareness.impressions)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiStage}>AWARENESS</Text>
              <Text style={styles.kpiMetric}>Reach</Text>
              <Text style={styles.kpiValue}>{formatNumber(kpis.awareness.reach)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiStage}>CONSIDERATION</Text>
              <Text style={styles.kpiMetric}>CTR</Text>
              <Text style={styles.kpiValue}>{kpis.consideration.ctr}%</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiStage}>CONSIDERATION</Text>
              <Text style={styles.kpiMetric}>Engagement</Text>
              <Text style={styles.kpiValue}>{formatNumber(kpis.consideration.engagement)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiStage}>CONVERSION</Text>
              <Text style={styles.kpiMetric}>Conversions</Text>
              <Text style={styles.kpiValue}>{formatNumber(kpis.conversion.conversions)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiStage}>CONVERSION</Text>
              <Text style={styles.kpiMetric}>ROAS</Text>
              <Text style={styles.kpiValue}>{kpis.conversion.roas}x</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by AdVisor AI Campaign Architect • {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>

      {/* Page 2: Audiences and Ad Formats */}
      <Page size="A4" style={styles.page}>
        {/* Target Audiences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Audiences</Text>
          {audiences.map((audience, idx) => (
            <View key={idx} style={styles.audienceCard}>
              <Text style={styles.audienceName}>{audience.name}</Text>
              <Text style={styles.audienceSize}>Estimated Size: {audience.size}</Text>
              <View style={{ marginTop: 2 }}>
                <Text style={styles.audienceLabel}>Demographics & Targeting:</Text>
                <Text style={styles.audienceDetail}>{audience.targeting}</Text>
              </View>
              <View style={{ marginTop: 2 }}>
                <Text style={styles.audienceLabel}>Behavioral Patterns:</Text>
                <Text style={styles.audienceDetail}>{audience.behavioral}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Ad Formats & Targeting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ad Formats & Targeting</Text>
          {adFormats.map((ad, idx) => (
            <View key={idx} style={styles.adFormatRow}>
              <View style={styles.adFormatLeft}>
                <Text style={styles.adFormatType}>{ad.type}</Text>
                <Text style={styles.adFormatPlatform}>{ad.platforms}</Text>
              </View>
              <View style={styles.adFormatRight}>
                <Text style={styles.adFormatBudget}>${ad.budget.toLocaleString()}</Text>
                <Text style={styles.adFormatCTR}>Est. CTR: {ad.estimatedCTR}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by AdVisor AI Campaign Architect • {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>

      {/* Page 3: Strategy Rationale (optional) */}
      {includeRationale && strategyRationale.length > 0 && (
        <Page size="A4" style={styles.page}>
          {/* Strategy Rationale */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategy Rationale</Text>
            <Text style={{ fontSize: 10, color: '#561493', marginBottom: 12 }}>
              Key insights explaining why this strategy works for your campaign.
            </Text>
            {strategyRationale.map((item, idx) => (
              <View key={idx} style={styles.rationaleCard}>
                <Text style={styles.rationaleNumber}>{idx + 1}</Text>
                <View style={styles.rationaleContent}>
                  <Text style={styles.rationaleInsight}>{item.insight}</Text>
                  <Text style={styles.rationaleImplication}>{item.implication}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Generated by AdVisor AI Campaign Architect • {new Date().toLocaleDateString()}</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
