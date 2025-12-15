import { Card, ThemedText } from "@/components/ui";
import {
    Colors,
    type ColorSchemeName
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { usePrayerTheme } from "@/contexts/prayer-theme-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    formatTime,
    getTimeUntilPrayer,
    type PrayerName,
    type PrayerTime,
} from "@/lib/prayer-times";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

interface NextPrayerDisplayProps {
  prayer: PrayerTime;
}

export function NextPrayerDisplay({ prayer }: NextPrayerDisplayProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(() =>
    getTimeUntilPrayer(prayer)
  );

  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName = rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const textClass = isDark ? "text-app-text-dark" : "text-app-text-light";
  const mutedTextClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";
  
  // Usar colores dinámicos en lugar de estáticos
  const { colors: prayerColors } = usePrayerTheme();

  const accentColor = useMemo(
    () => prayerColors[prayer.name as PrayerName] ?? theme.primary,
    [prayerColors, prayer.name, theme.primary]
  );

  useEffect(() => {
    setTimeLeft(getTimeUntilPrayer(prayer));
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilPrayer(prayer));
    }, 1000);
    return () => clearInterval(interval);
  }, [prayer]);

  const formattedTime = formatTime(prayer.hour, prayer.minute);

  // Formateo de números para asegurar dos dígitos (ej: 04 en vez de 4)
  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  return (
    <View className="w-full">
      <Card
        variant="elevated"
        className={[
          "rounded-[32px] overflow-hidden p-0 border",
          rawScheme === "dark" ? "border-app-border-dark/60" : "border-app-border-light/60",
        ].join(" ")}
      >
        {/* --- SECCIÓN SUPERIOR: INFO DEL REZO --- */}
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-1">
              <ThemedText
                variant="small"
                className={["uppercase tracking-widest opacity-70 mr-2 text-[10px] font-semibold", mutedTextClass].join(" ")}
              >
                {t.nextPrayer}
              </ThemedText>
              {/* Icono pequeño indicativo */}
              <Ionicons name="time-outline" size={12} color={theme.textMuted} />
            </View>

            <ThemedText
              adjustsFontSizeToFit
              numberOfLines={1}
              className={["capitalize text-[32px] leading-[50px] font-extrabold", textClass].join(" ")}
            >
              {t.prayers[prayer.name]}
            </ThemedText>
            
            <View className="flex-row items-center mt-2">
              <View 
                className="mr-2 rounded-lg p-1"
                style={{ backgroundColor: accentColor + "20" }}
              >
                <Ionicons name="location-sharp" size={14} color={accentColor} />
              </View>
              <ThemedText
                variant="default"
                className={["text-[18px] font-semibold", mutedTextClass].join(" ")}
              >
                {formattedTime}
              </ThemedText>
            </View>
          </View>

          {/* Icono Decorativo grande y sutil en la esquina */}
          <View 
            className="h-16 w-16 rounded-full items-center justify-center"
            style={{ backgroundColor: accentColor + "10" }}
          >
             {/* Icono de luna/sol según el rezo podría ser una mejora futura */}
            <Ionicons name="moon" size={32} color={accentColor} />
          </View>
        </View>

          {/* Separador Sutil */}
          <View className={["mx-6 h-px opacity-10", isDark ? "bg-app-text-dark" : "bg-app-text-light"].join(" ")} />

          {/* --- SECCIÓN INFERIOR: CONTADOR --- */}
          <View className="px-6 py-5 flex-row items-center justify-between">
            <ThemedText 
              variant="small"
              className={["font-medium opacity-80", mutedTextClass].join(" ")}
            >
              {t.timeRemaining}
            </ThemedText>

            <View className="flex-row items-baseline gap-1">
              {/* Horas */}
              <View className="flex-row items-baseline">
                <ThemedText
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.5}
                  className={["text-[28px] font-extrabold", textClass].join(" ")}
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {formatDigit(timeLeft.hours)}
                </ThemedText>
                <ThemedText className={["ml-0.5 text-[14px] font-medium opacity-80", mutedTextClass].join(" ")}>
                  h
                </ThemedText>
              </View>

              <ThemedText className={["text-xl opacity-40 mx-1 mb-1", textClass].join(" ")}>:</ThemedText>

              {/* Minutos */}
              <View className="flex-row items-baseline">
                <ThemedText
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.5}
                  className={["text-[28px] font-extrabold", textClass].join(" ")}
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {formatDigit(timeLeft.minutes)}
                </ThemedText>
                <ThemedText className={["ml-0.5 text-[14px] font-medium opacity-80", mutedTextClass].join(" ")}>
                  m
                </ThemedText>
              </View>
            </View>
          </View>
      </Card>
    </View>
  );
}
