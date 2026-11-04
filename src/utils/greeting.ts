import type { SupportedLanguage } from "@/types";

/**
 * Personalized User Greeting and Name-Based Interaction Utility
 * Supports English and natural, respectful elder-friendly Nepali (नेपाली).
 */

export function getTimeOfDayGreeting(
  date: Date = new Date(),
  lang: SupportedLanguage = "en",
): string {
  const hour = date.getHours();
  if (lang === "ne") {
    if (hour >= 5 && hour < 12) return "शुभ प्रभात";
    if (hour >= 12 && hour < 17) return "शुभ दिउँसो";
    return "शुभ साँझ";
  }

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
  greeting: string;
  headline: string;
  timeGreeting: string;
  subtitle: string;
  hasName: boolean;
  name?: string;
}

export function getPersonalizedGreeting(
  name?: string | null,
  date: Date = new Date(),
  lang: SupportedLanguage = "en",
): PersonalizedGreeting {
  const timeGreeting = getTimeOfDayGreeting(date, lang);
  const cleanName = name?.trim();

  if (lang === "ne") {
    if (cleanName && cleanName.length > 0) {
      return {
        greeting: `नमस्ते ${cleanName} ज्यू, ${timeGreeting}!`,
        headline: `${timeGreeting}, ${cleanName} ज्यू`,
        timeGreeting,
        subtitle: "मेडीट्रयाकमा पुनः स्वागत छ। आज पनि समयमै औषधि खानुहोला।",
        hasName: true,
        name: `${cleanName} ज्यू`,
      };
    }
    return {
      greeting: "मेडीट्रयाकमा स्वागत छ",
      headline: `${timeGreeting}! मेडीट्रयाकमा स्वागत छ`,
      timeGreeting,
      subtitle: "तपाईंको हेरचाह खातामा स्वागत छ। आज पनि आफ्नो स्वास्थ्यको राम्रो ख्याल राख्नुहोस्।",
      hasName: false,
      name: undefined,
    };
  }

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

  return {
    greeting: "Welcome to MediTrack",
    headline: `${timeGreeting}! Welcome to MediTrack`,
    timeGreeting,
    subtitle: "Welcome back to your healthcare space. Let's take care of your health today.",
    hasName: false,
    name: undefined,
  };
}
