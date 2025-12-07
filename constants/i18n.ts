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
  navigation: {
    home: string;
    mySalats: string;
  };
  mySalats: {
    title: string;
    subtitle: string;
    todaySummary: string;
    todaySummaryHint: string;
    pendingRakatsLabel: string;
    todayPrayers: string;
    statusDone: string;
    statusPending: string;
    historyTitle: string;
    historySubtitle: string;
    today: string;
    yesterday: string;
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
  navigation: {
    home: "Inicio",
    mySalats: "Mis salats",
  },
  mySalats: {
    title: "Mis salats",
    subtitle:
      "Lleva un seguimiento de los rezos que has hecho hoy y de los que te faltan.",
    todaySummary: "Resumen de hoy",
    todaySummaryHint:
      "Marca cada salat como hecho cuando lo hayas rezado.",
    pendingRakatsLabel: "rak‘ats que quedan hoy",
    todayPrayers: "Rezos de hoy",
    statusDone: "Hecho",
    statusPending: "Pendiente",
    historyTitle: "Días anteriores",
    historySubtitle:
      "Los días pasados están bloqueados. Solo puedes marcar los salats de hoy.",
    today: "Hoy",
    yesterday: "Ayer",
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
  navigation: {
    home: "Home",
    mySalats: "My salats",
  },
  mySalats: {
    title: "My salats",
    subtitle:
      "Track which prayers you’ve done today and how many rak‘ats are left.",
    todaySummary: "Today’s summary",
    todaySummaryHint:
      "Mark each prayer as done once you have performed it.",
    pendingRakatsLabel: "rak‘ats still to pray today",
    todayPrayers: "Today’s prayers",
    statusDone: "Done",
    statusPending: "Pending",
    historyTitle: "Previous days",
    historySubtitle:
      "Past days are locked. You can only mark prayers for today.",
    today: "Today",
    yesterday: "Yesterday",
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
  navigation: {
    home: "Accueil",
    mySalats: "Mes salats",
  },
  mySalats: {
    title: "Mes salats",
    subtitle:
      "Suivez les prières accomplies aujourd’hui et celles qui restent.",
    todaySummary: "Résumé du jour",
    todaySummaryHint:
      "Marquez chaque prière comme faite une fois accomplie.",
    pendingRakatsLabel: "rak‘ats restant à prier aujourd’hui",
    todayPrayers: "Prières d’aujourd’hui",
    statusDone: "Fait",
    statusPending: "En attente",
    historyTitle: "Jours précédents",
    historySubtitle:
      "Les jours passés sont verrouillés. Vous ne pouvez marquer que les prières d’aujourd’hui.",
    today: "Aujourd’hui",
    yesterday: "Hier",
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
  navigation: {
    home: "Start",
    mySalats: "Mijn gebeden",
  },
  mySalats: {
    title: "Mijn gebeden",
    subtitle:
      "Houd bij welke gebeden je vandaag hebt verricht en hoeveel rak‘ats er nog over zijn.",
    todaySummary: "Overzicht van vandaag",
    todaySummaryHint:
      "Markeer elk gebed als voltooid zodra je het hebt verricht.",
    pendingRakatsLabel: "rak‘ats die vandaag nog moeten",
    todayPrayers: "Gebeden van vandaag",
    statusDone: "Gedaan",
    statusPending: "Open",
    historyTitle: "Eerdere dagen",
    historySubtitle:
      "Afgelopen dagen zijn vergrendeld. Je kunt alleen de gebeden van vandaag markeren.",
    today: "Vandaag",
    yesterday: "Gisteren",
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
