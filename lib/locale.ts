import type { Locale } from "@/constants/i18n";

export function toLocaleTag(locale: Locale): string {
  if (locale === "es") return "es-ES";
  if (locale === "fr") return "fr-FR";
  if (locale === "nl") return "nl-NL";
  return "en-US";
}


