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
    qada: string;
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
  qada: {
    title: string;
    subtitle: string;
    summaryTitle: string;
    summaryDetailsTitle: string;
    netNegativeLabel: string;
    netPositiveLabel: string;
    netZeroLabel: string;
    missedLabel: string;
    clearedLabel: string;
    inputLabel: string;
    inputPlaceholder: string;
    registerButton: string;
    historyTitle: string;
    historyEmpty: string;
  };
}

// --- Traducciones por idioma --- //

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
    qada: "Qadá",
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
  qada: {
    title: "Qadá y histórico",
    subtitle:
      "Rak‘ats pendientes de días pasados y registro de qadá.",
    summaryTitle: "Balance global",
    summaryDetailsTitle: "Resumen",
    netNegativeLabel: "Rak‘ats pendientes",
    netPositiveLabel: "Rak‘ats extra realizados",
    netZeroLabel: "Sin deuda pendiente",
    missedLabel: "rak‘ats omitidos",
    clearedLabel: "rak‘ats de qadá rezados",
    inputLabel: "Añadir rak‘ats de qadá que has rezado hoy:",
    inputPlaceholder: "Ej. 4",
    registerButton: "Registrar",
    historyTitle: "Histórico de salats (días con registro)",
    historyEmpty:
      "Todavía no hay días anteriores registrados. Los días se guardan automáticamente cuando marcas algún salat.",
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
    qada: "Qadā",
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
  qada: {
    title: "Qadā & history",
    subtitle: "Past-days rak‘ats and your qadā progress.",
    summaryTitle: "Overall balance",
    summaryDetailsTitle: "Summary",
    netNegativeLabel: "Rak‘ats pending",
    netPositiveLabel: "Extra rak‘ats completed",
    netZeroLabel: "No debt remaining",
    missedLabel: "rak‘ats missed",
    clearedLabel: "qadā rak‘ats completed",
    inputLabel: "Add qadā rak‘ats you performed today:",
    inputPlaceholder: "e.g. 4",
    registerButton: "Save",
    historyTitle: "Prayer history (days with data)",
    historyEmpty:
      "No previous days recorded yet. Days are saved automatically when you mark any salat.",
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
    qada: "Qadā",
  },
  mySalats: {
    title: "Mes salats",
    subtitle:
      "Suivez les prières accomplies aujourd’hui et celles qui restent.",
    todaySummary: "Résumé du jour",
    todaySummaryHint:
      "Marquez chaque prière comme faite une fois accomplie.",
    pendingRakatsLabel:
      "rak‘ats restant à prier aujourd’hui",
    todayPrayers: "Prières d’aujourd’hui",
    statusDone: "Fait",
    statusPending: "En attente",
    historyTitle: "Jours précédents",
    historySubtitle:
      "Les jours passés sont verrouillés. Vous ne pouvez marquer que les prières d’aujourd’hui.",
    today: "Aujourd’hui",
    yesterday: "Hier",
  },
  qada: {
    title: "Qadā et historique",
    subtitle:
      "Rak‘ats en retard des jours passés et suivi de votre qadā.",
    summaryTitle: "Balance globale",
    summaryDetailsTitle: "Résumé",
    netNegativeLabel: "Rak‘ats en retard",
    netPositiveLabel: "Rak‘ats supplémentaires accomplis",
    netZeroLabel: "Aucune dette restante",
    missedLabel: "rak‘ats manqués",
    clearedLabel: "rak‘ats de qadā accomplis",
    inputLabel:
      "Ajouter les rak‘ats de qadā accomplis aujourd’hui :",
    inputPlaceholder: "Ex. 4",
    registerButton: "Enregistrer",
    historyTitle:
      "Historique des prières (jours enregistrés)",
    historyEmpty:
      "Aucun jour précédent enregistré pour l’instant. Les jours sont sauvegardés automatiquement lorsque vous marquez un salat.",
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
    qada: "Qadā",
  },
  mySalats: {
    title: "Mijn gebeden",
    subtitle:
      "Houd bij welke gebeden je vandaag hebt verricht en hoeveel rak‘ats er nog over zijn.",
    todaySummary: "Overzicht van vandaag",
    todaySummaryHint:
      "Markeer elk gebed als voltooid zodra je het hebt verricht.",
    pendingRakatsLabel:
      "rak‘ats die vandaag nog moeten",
    todayPrayers: "Gebeden van vandaag",
    statusDone: "Gedaan",
    statusPending: "Open",
    historyTitle: "Eerdere dagen",
    historySubtitle:
      "Afgelopen dagen zijn vergrendeld. Je kunt alleen de gebeden van vandaag markeren.",
    today: "Vandaag",
    yesterday: "Gisteren",
  },
  qada: {
    title: "Qadā en historiek",
    subtitle:
      "Gemiste rak‘ats van eerdere dagen en je qadā-voortgang.",
    summaryTitle: "Totaalbalans",
    summaryDetailsTitle: "Overzicht",
    netNegativeLabel: "Openstaande rak‘ats",
    netPositiveLabel: "Extra rak‘ats voltooid",
    netZeroLabel: "Geen schuld meer",
    missedLabel: "gemiste rak‘ats",
    clearedLabel: "qadā-rak‘ats voltooid",
    inputLabel:
      "Voeg het aantal qadā-rak‘ats toe dat je vandaag hebt verricht:",
    inputPlaceholder: "Bijv. 4",
    registerButton: "Opslaan",
    historyTitle:
      "Gebedsgeschiedenis (dagen met gegevens)",
    historyEmpty:
      "Er zijn nog geen eerdere dagen geregistreerd. Dagen worden automatisch opgeslagen wanneer je een salat markeert.",
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
