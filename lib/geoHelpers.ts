import locationsData from "@/lib/data/google-trends-locations.json";

// Type for the locations JSON structure
// Format: { "US-WA": "Washington", "US": "United States", "": "Worldwide" }
type LocationsMap = Record<string, string>;

/**
 * Resolves a location string to a Google Trends geo code
 * @param location - The location string from entities (e.g., "Seattle", "Washington", "United States")
 * @returns The geo code (e.g., "US-WA") or empty string for Worldwide
 */
export function resolveGeoLocation(location: string): string {
  if (!location || location.trim() === "") {
    return ""; // Worldwide
  }

  const locations = locationsData as LocationsMap;
  const normalizedInput = location.toLowerCase().trim();

  // First pass: exact match (case-insensitive)
  for (const [geoCode, geoName] of Object.entries(locations)) {
    if (geoName.toLowerCase() === normalizedInput) {
      return geoCode;
    }
  }

  // Second pass: contains match
  for (const [geoCode, geoName] of Object.entries(locations)) {
    if (geoName.toLowerCase().includes(normalizedInput)) {
      return geoCode;
    }
  }

  // Third pass: reverse contains (input contains location name)
  for (const [geoCode, geoName] of Object.entries(locations)) {
    if (normalizedInput.includes(geoName.toLowerCase())) {
      return geoCode;
    }
  }

  // Fallback to Worldwide
  return "";
}
