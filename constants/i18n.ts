// constants/i18n.ts

export type Locale = "es" | "en" | "fr" | "nl";

export const SUPPORTED_LOCALES: Locale[] = ["es", "en", "fr", "nl"];

// Por si quieres usarlo en algún sitio (fallback "global")
export const DEFAULT_LOCALE: Locale = "en";

// Clave para guardar el idioma en AsyncStorage
export const LOCALE_STORAGE_KEY = "@salat_locale";

// Tipo general de las traducciones (todas las lenguas comparten esta forma)
export interface Translations {
  app: {
    name: string;
    tagline: string;
  };
  nextPrayer: string;
  prayers: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  timeRemaining: string;
  hours: string;
  minutes: string;
  settings: {
    title: string;
    language: string;
    notifications: string;
    theme: string;
  };
  languages: Record<Locale, string>;
  loading: string;
  retry: string;
  errors: {
    fetchFailed: string;
    locationFailed: string;
  };
  location: {
    using: string;
    default: string;
  };
}

// --- Traducciones por idioma (contenido de tus JSON) --- //

export const es: Translations = {
  app: {
    name: "Salat",
    tagline: "Tiempos de Oración",
  },
  nextPrayer: "Próximo rezo",
  prayers: {
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  },
  timeRemaining: "Tiempo restante",
  hours: "h",
  minutes: "min",
  settings: {
    title: "Ajustes",
    language: "Idioma",
    notifications: "Notificaciones",
    theme: "Tema",
  },
  languages: {
    es: "Español",
    en: "English",
    fr: "Français",
    nl: "Nederlands",
  },
  loading: "Cargando tiempos de oración...",
  retry: "Reintentar",
  errors: {
    fetchFailed: "Error al cargar los tiempos de oración",
    locationFailed: "No se pudo obtener la ubicación",
  },
  location: {
    using: "Ubicación",
    default: "Ubicación predeterminada",
  },
};

export const en: Translations = {
  app: {
    name: "Salat",
    tagline: "Prayer Times",
  },
  nextPrayer: "Next prayer",
  prayers: {
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  },
  timeRemaining: "Time remaining",
  hours: "h",
  minutes: "min",
  settings: {
    title: "Settings",
    language: "Language",
    notifications: "Notifications",
    theme: "Theme",
  },
  languages: {
    es: "Español",
    en: "English",
    fr: "Français",
    nl: "Nederlands",
  },
  loading: "Loading prayer times...",
  retry: "Retry",
  errors: {
    fetchFailed: "Failed to load prayer times",
    locationFailed: "Could not get location",
  },
  location: {
    using: "Location",
    default: "Default location",
  },
};

export const fr: Translations = {
  app: {
    name: "Salat",
    tagline: "Heures de Prière",
  },
  nextPrayer: "Prochaine prière",
  prayers: {
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  },
  timeRemaining: "Temps restant",
  hours: "h",
  minutes: "min",
  settings: {
    title: "Paramètres",
    language: "Langue",
    notifications: "Notifications",
    theme: "Thème",
  },
  languages: {
    es: "Español",
    en: "English",
    fr: "Français",
    nl: "Nederlands",
  },
  loading: "Chargement des heures de prière...",
  retry: "Réessayer",
  errors: {
    fetchFailed: "Échec du chargement des heures de prière",
    locationFailed: "Impossible d'obtenir la localisation",
  },
  location: {
    using: "Emplacement",
    default: "Emplacement par défaut",
  },
};

export const nl: Translations = {
  app: {
    name: "Salat",
    tagline: "Gebedstijden",
  },
  nextPrayer: "Volgende gebed",
  prayers: {
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  },
  timeRemaining: "Resterende tijd",
  hours: "u",
  minutes: "min",
  settings: {
    title: "Instellingen",
    language: "Taal",
    notifications: "Meldingen",
    theme: "Thema",
  },
  languages: {
    es: "Español",
    en: "English",
    fr: "Français",
    nl: "Nederlands",
  },
  loading: "Gebedstijden laden...",
  retry: "Opnieuw proberen",
  errors: {
    fetchFailed: "Kon gebedstijden niet laden",
    locationFailed: "Kon locatie niet ophalen",
  },
  location: {
    using: "Locatie",
    default: "Standaard locatie",
  },
};

// Mapa completo de traducciones por locale
export const TRANSLATIONS: Record<Locale, Translations> = {
  es,
  en,
  fr,
  nl,
};

// Metadata para el selector de idioma en la UI
export interface LanguageOption {
  code: Locale;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "es", label: es.languages.es },
  { code: "en", label: en.languages.en },
  { code: "fr", label: fr.languages.fr },
  { code: "nl", label: nl.languages.nl },
];
