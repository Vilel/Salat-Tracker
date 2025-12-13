import React, { useEffect, useState } from "react";
import { View } from "react-native";

import {
  Colors,
  type ColorSchemeName,
} from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import { usePrayerTheme } from "@/contexts/prayer-theme-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  formatTime,
  type DayPrayers,
  type PrayerName,
} from "@/lib/prayer-times";
import { Card } from "./ui/Card";
import { ThemedText } from "./ui/ThemedText";

interface PrayerTimelineProps {
  prayers: DayPrayers;
  nextPrayer: PrayerName;
}

const PRAYER_ORDER: PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

// Convierte hora:minuto a minutos totales del día
function toMinutes(hour: number, minute: number, second: number = 0) {
  return hour * 60 + minute + second / 60;
}

export function PrayerTimeline({ prayers, nextPrayer }: PrayerTimelineProps) {
  const { t } = useLanguage();
  const [now, setNow] = useState(new Date());

  const rawScheme = useColorScheme();
  const colorScheme: ColorSchemeName =
    rawScheme === "dark" ? "dark" : "light";
  const theme = Colors[colorScheme];
  
  // Colores dinámicos
  const { colors: prayerColors } = usePrayerTheme();

  // Actualizar reloj cada segundo
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nowMinutes = toMinutes(
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  );

  // --- LÓGICA DE LA LÍNEA DE TIEMPO ---

  // Puntos del timeline con minutos y posición 0–1
  const timelinePoints = PRAYER_ORDER.map((name, idx) => {
    const data = prayers[name];
    if (!data) return null;

    const minutes = toMinutes(data.hour, data.minute);
    const pos =
      PRAYER_ORDER.length === 1 ? 0 : idx / (PRAYER_ORDER.length - 1);

    return { name, data, minutes, pos };
  }).filter(Boolean) as {
    name: PrayerName;
    data: { hour: number; minute: number };
    minutes: number;
    pos: number;
  }[];

  // Progreso global (0–1) a lo largo de los puntos
  let progressPos = 0;

  if (timelinePoints.length > 0) {
    const first = timelinePoints[0];
    const last = timelinePoints[timelinePoints.length - 1];

    if (nowMinutes <= first.minutes) {
      progressPos = 0;
    } else if (nowMinutes >= last.minutes) {
      progressPos = 1;
    } else {
      for (let i = 0; i < timelinePoints.length - 1; i++) {
        const currentP = timelinePoints[i];
        const nextP = timelinePoints[i + 1];

        if (nowMinutes >= currentP.minutes && nowMinutes <= nextP.minutes) {
          const timeRange = nextP.minutes - currentP.minutes || 1;
          const timeElapsed = nowMinutes - currentP.minutes;
          const segmentProgress = timeElapsed / timeRange;

          const distanceBetweenDots = nextP.pos - currentP.pos;
          progressPos =
            currentP.pos + distanceBetweenDots * segmentProgress;
          break;
        }
      }
    }
  }

  return (
    <View className="w-full">
      <Card
        variant="outlined"
        className="rounded-3xl px-4 py-4"
        style={{
           backgroundColor: theme.card, // Card already handles this but redundant is fine or removing it
           borderColor: theme.border,
        }}
      >
        <View className="relative">
          {/* --- BARRA DE FONDO --- */}
          <View
            className="absolute left-0 right-0 h-1 rounded-full"
            style={{
              top: 6,
              backgroundColor:
                colorScheme === "dark" ? "#374151" : "#e5e7eb",
            }}
          />

          {/* --- BARRA DE PROGRESO (hasta el rezo actual) --- */}
          <View
            className="absolute left-0 h-1 rounded-full"
            style={{
              top: 6,
              width: `${progressPos * 100}%`,
              backgroundColor: theme.primary,
            }}
          />

          {/* --- PUNTOS + TEXTOS --- */}
          <View className="flex-row justify-between w-full">
            {PRAYER_ORDER.map((prayerName) => {
              const prayerData = prayers[prayerName];
              if (!prayerData) return null;

              const minutes = toMinutes(
                prayerData.hour,
                prayerData.minute
              );

              const isCompleted = nowMinutes >= minutes;
              const isNext = prayerName === nextPrayer;

              const dotColor =
                prayerColors[prayerName] || theme.primary;

              return (
                <View
                  key={prayerName}
                  className="items-center z-10"
                >
                  {/* Círculo exterior que se resalta cuando ya ha ocurrido */}
                  <View
                    className="items-center justify-center rounded-full mb-2"
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor: theme.card,
                      borderWidth: isCompleted ? 2 : 0,
                      borderColor: isCompleted
                        ? theme.primary
                        : "transparent",
                    }}
                  >
                    {/* Punto de color del rezo */}
                    <View
                      className="rounded-full"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: dotColor,
                      }}
                    />
                  </View>

                  {/* Etiquetas */}
                  <View className="items-center gap-[1px]">
                    {/* Nombre del rezo (abreviado) */}
                    <ThemedText
                      variant="small"
                      className="uppercase text-center"
                      numberOfLines={1}
                      style={{
                        fontSize: 10,
                        fontWeight: isNext ? "800" : "600",
                        color: isNext ? theme.text : theme.textMuted,
                        opacity: isNext ? 1 : 0.8,
                      }}
                    >
                      {t.prayers[prayerName]}
                    </ThemedText>

                    {/* Hora */}
                    <ThemedText
                      variant="small"
                      className="text-center"
                      numberOfLines={1}
                      style={{
                        fontSize: 11,
                        fontWeight: isNext ? "700" : "400",
                        color: isNext ? theme.text : theme.textMuted,
                      }}
                    >
                      {formatTime(
                        prayerData.hour,
                        prayerData.minute
                      )}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Card>
    </View>
  );
}
