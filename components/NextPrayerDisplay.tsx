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
import { Card } from "./ui/Card";
import { ThemedText } from "./ui/ThemedText";

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
        style={{
          borderRadius: 32,
          padding: 0,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: rawScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' // Sutil borde
        }}
      >
        {/* --- SECCIÓN SUPERIOR: INFO DEL REZO --- */}
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
          <View>
            <View className="flex-row items-center mb-1">
              <ThemedText
                variant="small"
                className="uppercase tracking-widest opacity-70 mr-2"
                style={{ fontSize: 10, fontWeight: "600" }}
              >
                {t.nextPrayer}
              </ThemedText>
              {/* Icono pequeño indicativo */}
              <Ionicons name="time-outline" size={12} color={theme.textMuted} />
            </View>

            <ThemedText
              variant="title"
              className="capitalize"
              style={{
                fontSize: 36, // Más grande para mejor jerarquía
                lineHeight: 42,
                fontWeight: "800",
                letterSpacing: -0.5,
              }}
            >
              {t.prayers[prayer.name]}
            </ThemedText>
            
            <View className="flex-row items-center mt-2">
              <View 
                style={{ 
                  backgroundColor: accentColor + '20', 
                  padding: 4, 
                  borderRadius: 8, 
                  marginRight: 8 
                }}
              >
                <Ionicons name="location-sharp" size={14} color={accentColor} />
              </View>
              <ThemedText
                variant="default"
                color={theme.textMuted}
                style={{ fontWeight: "600", fontSize: 18 }}
              >
                {formattedTime}
              </ThemedText>
            </View>
          </View>

          {/* Icono Decorativo grande y sutil en la esquina */}
          <View 
            className="rounded-full items-center justify-center"
            style={{
              width: 64,
              height: 64,
              backgroundColor: accentColor + '10', // Muy sutil
            }}
          >
             {/* Icono de luna/sol según el rezo podría ser una mejora futura */}
            <Ionicons name="moon" size={32} color={accentColor} />
          </View>
        </View>

        {/* Separador Sutil */}
        <View className="mx-6 h-[1px] opacity-5" style={{ backgroundColor: theme.text }} />

        {/* --- SECCIÓN INFERIOR: CONTADOR --- */}
        <View 
          className="px-6 py-5 flex-row items-center justify-between"
          style={{ backgroundColor: rawScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
        >
          <ThemedText 
            variant="small"
            className="font-medium opacity-60"
          >
            {t.timeRemaining}
          </ThemedText>

          <View className="flex-row items-baseline gap-1">
            {/* Horas */}
            <ThemedText 
              style={{ fontSize: 28, fontWeight: "800", fontVariant: ["tabular-nums"], color: theme.text }}
            >
              {formatDigit(timeLeft.hours)}
              <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.textMuted }}>h</ThemedText>
            </ThemedText>

            <ThemedText className="text-xl opacity-30 mx-1 mb-1">:</ThemedText>

            {/* Minutos */}
            <ThemedText 
              style={{ fontSize: 28, fontWeight: "800", fontVariant: ["tabular-nums"], color: theme.text }}
            >
              {formatDigit(timeLeft.minutes)}
              <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.textMuted }}>m</ThemedText>
            </ThemedText>
          </View>
        </View>
      </Card>
    </View>
  );
}
