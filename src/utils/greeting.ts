/**
 * Personalized User Greeting and Name-Based Interaction Utility
 * Strictly enforces exact user names without inventing or guessing names.
 */

export function getTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  // Morning: 5:00 AM to 11:59 AM
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }
  // Afternoon: 12:00 PM to 4:59 PM
  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }
  // Evening / Night: 5:00 PM to 4:59 AM
  return "Good evening";
}

export interface PersonalizedGreeting {
  /** Complete greeting line: e.g. "Good morning, Ujjwal!" or "Welcome to MediTrack" */
  greeting: string;
  /** Primary headline for hero section: e.g. "Good morning, Ujjwal" or "Welcome to MediTrack" */
  headline: string;
  /** Time of day prefix: "Good morning" | "Good afternoon" | "Good evening" */
  timeGreeting: string;
  /** Subtitle message */
  subtitle: string;
  /** Whether an exact registered user name was provided */
  hasName: boolean;
  /** Exact user name if available */
  name?: string;
}

export function getPersonalizedGreeting(
  name?: string | null,
  date: Date = new Date(),
): PersonalizedGreeting {
  const timeGreeting = getTimeOfDayGreeting(date);
  const cleanName = name?.trim();

  if (cleanName && cleanName.length > 0) {
    return {
      greeting: `${timeGreeting}, ${cleanName}!`,
      headline: `${timeGreeting}, ${cleanName}`,
      timeGreeting,
      subtitle: "Welcome back to MediTrack. Let's take care of your health today.",
      hasName: true,
      name: cleanName,
    };
  }

  // Graceful neutral fallback when name is not available - NEVER invent a name
  return {
    greeting: "Welcome to MediTrack",
    headline: `${timeGreeting}! Welcome to MediTrack`,
    timeGreeting,
    subtitle: "Welcome back to your healthcare space. Let's take care of your health today.",
    hasName: false,
    name: undefined,
  };
}
