// components/NextPrayerDisplay.tsx

import {
  Colors,
  FontSizes,
  PrayerStripeColors,
  type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  formatTime,
  getTimeUntilPrayer,
  type PrayerName,
  type PrayerTime,
} from "@/lib/prayer-times";
import { Ionicons } from "@expo/vector-icons"; // Asegúrate de tener esto o usa tu librería de iconos preferida
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

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
  const stripeColors = PrayerStripeColors[colorScheme];

  const accentColor = useMemo(
    () => stripeColors[prayer.name as PrayerName] ?? theme.primary,
    [stripeColors, prayer.name, theme.primary]
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
      <View
        className="w-full rounded-[32px] overflow-hidden relative"
        style={{
          backgroundColor: theme.card,
          // Sombra suave y moderna
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
          borderWidth: 1,
          borderColor: rawScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }}
      >

        {/* --- SECCIÓN SUPERIOR: INFO DEL REZO --- */}
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
          <View>
            <View className="flex-row items-center mb-1">
              <Text
                className="uppercase font-bold tracking-widest opacity-60 mr-2"
                style={{
                  fontSize: 10,
                  color: theme.text,
                }}
              >
                {t.nextPrayer}
              </Text>
              {/* Icono pequeño indicativo */}
              <Ionicons name="time-outline" size={12} color={theme.textMuted} />
            </View>

            <Text
              className="font-extrabold capitalize"
              style={{
                fontSize: 32,
                color: theme.text,
                lineHeight: 38,
              }}
            >
              {t.prayers[prayer.name]}
            </Text>
            
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-sharp" size={14} color={accentColor} style={{ marginRight: 4 }} />
              <Text
                className="font-medium"
                style={{
                  fontSize: FontSizes.base,
                  color: theme.textMuted,
                }}
              >
                {formattedTime}
              </Text>
            </View>
          </View>

          {/* Icono Decorativo grande y sutil en la esquina */}
          <View 
            className="rounded-full items-center justify-center"
            style={{
              width: 56,
              height: 56,
              backgroundColor: accentColor + '15', // 15 = muy transparente
            }}
          >
             {/* Puedes cambiar el icono dinámicamente según el rezo si quieres */}
            <Ionicons name="moon" size={28} color={accentColor} />
          </View>
        </View>

        {/* Separador Sutil */}
        <View className="mx-6 h-[1px] opacity-10" style={{ backgroundColor: theme.text }} />

        {/* --- SECCIÓN INFERIOR: CONTADOR --- */}
        <View 
          className="px-6 py-5 flex-row items-center justify-between"
          style={{ backgroundColor: rawScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}
        >
          <Text 
            className="font-medium text-xs opacity-60"
            style={{ color: theme.text }}
          >
            {t.timeRemaining}
          </Text>

          <View className="flex-row items-baseline gap-1">
            {/* Horas */}
            <Text 
              className="font-bold tabular-nums" // tabular-nums evita que el texto salte cuando cambian los números
              style={{ fontSize: 24, color: theme.text }}
            >
              {formatDigit(timeLeft.hours)}
              <Text style={{ fontSize: 14, fontWeight: '400', color: theme.textMuted }}>h</Text>
            </Text>

            <Text className="text-lg opacity-30 mx-1" style={{ color: theme.text }}>:</Text>

            {/* Minutos */}
            <Text 
              className="font-bold tabular-nums"
              style={{ fontSize: 24, color: theme.text }}
            >
              {formatDigit(timeLeft.minutes)}
              <Text style={{ fontSize: 14, fontWeight: '400', color: theme.textMuted }}>m</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}