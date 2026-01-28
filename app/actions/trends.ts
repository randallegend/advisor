"use server";

import { getJson } from "serpapi";
import { resolveGeoLocation } from "@/lib/geoHelpers";

const SERPAPI_KEY = process.env.NEXT_SERPAPI_KEY;

function serpApiCall(params: Record<string, any>, retries = 3, timeoutMs = 15000): Promise<any> {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryCall = () => {
      attempt++;
      const timer = setTimeout(() => {
        if (attempt < retries) {
          console.warn(`SerpAPI timeout (attempt ${attempt}/${retries}), retrying...`);
          tryCall();
        } else {
          reject(new Error("SerpAPI request timed out after all retries"));
        }
      }, timeoutMs);

      getJson(params, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    };

    tryCall();
  });
}

export interface TrendsTimelinePoint {
  date: string;
  values: { query: string; value: number }[];
}

export interface RisingQuery {
  query: string;
  value: number | string; // percentage or "Breakout"
}

export interface TrendsResult {
  timeline: TrendsTimelinePoint[];
  keywords: string[];
  geo: string;
  relatedRising: RisingQuery[];
  relatedTop: RisingQuery[];
}

export async function getExploreTrends(
  keywords: string[],
  location?: string
): Promise<{ success: boolean; data?: TrendsResult; error?: string }> {
  try {
    const cleanKeywords = keywords
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (cleanKeywords.length === 0) {
      return { success: false, error: "No keywords provided" };
    }

    const geo = location ? resolveGeoLocation(location) : "";
    const query = cleanKeywords.join(",");

    // Fetch timeseries and related queries in parallel (with retry)
    const [timeseriesData, relatedData] = await Promise.all([
      serpApiCall({
        engine: "google_trends",
        q: query,
        date: "today 3-m",
        geo: geo || undefined,
        tz: "420",
        data_type: "TIMESERIES",
        api_key: SERPAPI_KEY,
      }),
      serpApiCall({
        engine: "google_trends",
        q: cleanKeywords[0],
        date: "today 3-m",
        geo: geo || undefined,
        tz: "420",
        data_type: "RELATED_QUERIES",
        api_key: SERPAPI_KEY,
      }),
    ]);

    // Transform timeline data
    const timeline: TrendsTimelinePoint[] = [];
    if (timeseriesData?.interest_over_time?.timeline_data) {
      for (const point of timeseriesData.interest_over_time.timeline_data) {
        timeline.push({
          date: point.date,
          values: point.values.map((v: any) => ({
            query: v.query,
            value: v.extracted_value,
          })),
        });
      }
    }

    // Transform related queries
    const relatedRising: RisingQuery[] = [];
    const relatedTop: RisingQuery[] = [];

    if (relatedData?.related_queries) {
      const rq = relatedData.related_queries;
      if (rq.rising) {
        for (const item of rq.rising.slice(0, 8)) {
          relatedRising.push({
            query: item.query,
            value: item.extracted_value ?? item.value,
          });
        }
      }
      if (rq.top) {
        for (const item of rq.top.slice(0, 8)) {
          relatedTop.push({
            query: item.query,
            value: item.extracted_value ?? item.value,
          });
        }
      }
    }

    return {
      success: true,
      data: {
        timeline,
        keywords: cleanKeywords,
        geo: geo || "Worldwide",
        relatedRising,
        relatedTop,
      },
    };
  } catch (error) {
    console.error("Trends explore error:", error);
    return { success: false, error: String(error) };
  }
}
