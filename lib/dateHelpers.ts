import { addDays, subDays, format } from "date-fns";

// Helper to calculate Mother's Day (2nd Sunday of May)
function resolveMothersDay(year: number): Date {
  const may1 = new Date(year, 4, 1); // May is month 4 (0-indexed)
  const dayOfWeek = may1.getDay();
  const firstSunday = 1 + ((7 - dayOfWeek) % 7);
  const secondSunday = firstSunday + 7;
  return new Date(year, 4, secondSunday);
}

// Resolve event name to actual date
export function resolveEventDate(
  eventName: string,
  year: number
): Date | null {
  if (!eventName || eventName === "none") return null;

  const normalized = eventName.toLowerCase().trim();

  // Mother's Day - 2nd Sunday of May
  if (normalized.includes("mother") && normalized.includes("day")) {
    return resolveMothersDay(year);
  }

  // Valentine's Day - February 14
  if (normalized.includes("valentine")) {
    return new Date(year, 1, 14);
  }

  // Christmas - December 25
  if (normalized.includes("christmas")) {
    return new Date(year, 11, 25);
  }

  // New Year - January 1
  if (normalized.includes("new year")) {
    return new Date(year, 0, 1);
  }

  // Halloween - October 31
  if (normalized.includes("halloween")) {
    return new Date(year, 9, 31);
  }

  // Independence Day - July 4
  if (normalized.includes("independence") || normalized.includes("july 4")) {
    return new Date(year, 6, 4);
  }

  // Thanksgiving - 4th Thursday of November
  if (normalized.includes("thanksgiving")) {
    const nov1 = new Date(year, 10, 1);
    const dayOfWeek = nov1.getDay();
    const firstThursday = 1 + ((4 - dayOfWeek + 7) % 7);
    const fourthThursday = firstThursday + 21;
    return new Date(year, 10, fourthThursday);
  }

  // Black Friday - Day after Thanksgiving
  if (normalized.includes("black friday")) {
    const nov1 = new Date(year, 10, 1);
    const dayOfWeek = nov1.getDay();
    const firstThursday = 1 + ((4 - dayOfWeek + 7) % 7);
    const fourthThursday = firstThursday + 21;
    return addDays(new Date(year, 10, fourthThursday), 1);
  }

  // Easter - Complex calculation, simplified
  if (normalized.includes("easter")) {
    // Using a simple approximation for common years
    // For production, use a proper Easter calculation algorithm
    return new Date(year, 3, 15); // Approximate
  }

  return null;
}

// Build date range string for SerpAPI based on event date and type
export function buildDateRange(
  eventDate: Date | null,
  eventType: "fixed_date" | "floating_holiday" | "seasonal" | "none"
): string {
  const now = new Date();

  // If event has a real date (Mother's Day, Valentine's, etc.)
  if (eventDate) {
    const start = new Date(eventDate);
    const end = new Date(eventDate);

    // If event is in the future, analyze historical trends from last year
    if (eventDate > now) {
      start.setFullYear(start.getFullYear() - 1);
      end.setFullYear(end.getFullYear() - 1);
    }

    if (eventType === "seasonal") {
      // Seasonal events → wider window (3 months before and after)
      start.setMonth(start.getMonth() - 3);
      end.setMonth(end.getMonth() + 3);
    } else {
      // Fixed / floating holidays → focused window (2 months before and after)
      start.setMonth(start.getMonth() - 2);
      end.setMonth(end.getMonth() + 2);
    }

    return `${format(start, "yyyy-MM-dd")} ${format(end, "yyyy-MM-dd")}`;
  }

  // Fallback logic based on event type
  if (eventType === "seasonal") {
    // Last 90 days for seasonal campaigns
    return "today 3-m";
  }

  // For "none" or always-on campaigns: last 60-90 days
  return "today 3-m";
}

// Get time window for fallback scenarios (used for debugging/logging)
export function getTimeWindow(
  eventType: "fixed_date" | "floating_holiday" | "seasonal" | "none"
): { start: Date; end: Date } {
  const now = new Date();

  if (eventType === "seasonal") {
    return {
      start: subDays(now, 90),
      end: now,
    };
  }

  // For "none" type
  return {
    start: subDays(now, 60),
    end: now,
  };
}
