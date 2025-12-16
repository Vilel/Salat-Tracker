// contexts/language-context.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import * as Localization from "expo-localization";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { Alert, DevSettings, I18nManager } from "react-native";

import {
    LOCALE_STORAGE_KEY,
    SUPPORTED_LOCALES,
    TRANSLATIONS,
    type Locale,
    type Translations,
} from "../constants/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Determina el idioma inicial a partir de la configuración del dispositivo.
// Si el idioma del sistema no está soportado, usa inglés.
function getSystemLocale(): Locale {
  const systemLocale =
    Localization.getLocales?.()[0]?.languageCode?.toLowerCase() ?? "en";

  if (SUPPORTED_LOCALES.includes(systemLocale as Locale)) {
    return systemLocale as Locale;
  }

  return "en";
}

function isRtlLocale(locale: Locale): boolean {
  return locale === "ar";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Idioma inicial = idioma del sistema (o "en" si no coincide)
  const [locale, setLocaleState] = useState<Locale>(getSystemLocale);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSavedLocale();
  }, []);

  const loadSavedLocale = async () => {
    try {
      const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);

      let resolvedLocale = locale;
      if (saved && TRANSLATIONS[saved as Locale]) {
        // Si el usuario ya eligió un idioma antes, priorizamos ese
        resolvedLocale = saved as Locale;
      }
      // Si no hay nada guardado, dejamos el idioma del sistema tal cual

      // Apply RTL on startup before rendering UI (no alert on cold start).
      const shouldBeRtl = isRtlLocale(resolvedLocale);
      if (I18nManager.isRTL !== shouldBeRtl) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(shouldBeRtl);
      }

      setLocaleState(resolvedLocale);
    } catch (error) {
      console.warn("Failed to load saved locale:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setLocale = async (newLocale: Locale): Promise<void> => {
    const shouldSwitchRtl = I18nManager.isRTL !== isRtlLocale(newLocale);
    setLocaleState(newLocale);
    try {
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch (error) {
      console.warn("Failed to save locale:", error);
    }

    if (shouldSwitchRtl) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(isRtlLocale(newLocale));

      if (__DEV__) {
        DevSettings.reload();
      } else {
        try {
          if (Updates.isEnabled) {
            await Updates.reloadAsync();
            return;
          }
        } catch (error) {
          console.warn("Failed to reload after RTL switch:", error);
        }

        Alert.alert(
          TRANSLATIONS[newLocale].settings.restartRequiredTitle,
          TRANSLATIONS[newLocale].settings.restartRequiredMessage,
          [{ text: TRANSLATIONS[newLocale].common.close }]
        );
      }
    }
  };

  const value: LanguageContextType = {
    locale,
    setLocale,
    t: TRANSLATIONS[locale],
  };

  if (!isLoaded) {
    // Aquí podrías devolver un loader o un splash específico si quieres
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
