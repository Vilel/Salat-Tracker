import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { Card, ThemedText } from "@/components/ui";
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
  const isDark = colorScheme === "dark";
  const textClass = isDark ? "text-app-text-dark" : "text-app-text-light";
  const mutedTextClass = isDark
    ? "text-app-textMuted-dark"
    : "text-app-textMuted-light";
  const primaryBgClass = isDark ? "bg-app-primary-dark" : "bg-app-primary-light";
  
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
        className="rounded-3xl px-2 py-4"
      >
        <View className="relative">
          {/* --- BARRA DE FONDO --- */}
          <View
            className={[
              "absolute left-0 right-0 top-[6px] h-1 rounded-full",
              colorScheme === "dark" ? "bg-app-border-dark" : "bg-app-border-light",
            ].join(" ")}
          />

          {/* --- BARRA DE PROGRESO (hasta el rezo actual) --- */}
          <View
            className={["absolute left-0 top-[6px] h-1 rounded-full", primaryBgClass].join(" ")}
            style={{
              width: `${progressPos * 100}%`,
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
                    className={[
                      "mb-2 h-[18px] w-[18px] items-center justify-center rounded-full",
                      isDark ? "bg-app-card-dark" : "bg-app-card-light",
                      isCompleted
                        ? isDark
                          ? "border-2 border-app-primary-dark"
                          : "border-2 border-app-primary-light"
                        : "border-0 border-transparent",
                    ].join(" ")}
                  >
                    {/* Punto de color del rezo */}
                    <View
                      className="h-[10px] w-[10px] rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                  </View>

                  {/* Etiquetas */}
                  <View className="items-center gap-[1px] w-[52px]">
                    {/* Nombre del rezo (abreviado) */}
                    <ThemedText
                      variant="small"
                      numberOfLines={1}
                      className={[
                        "uppercase text-center w-full text-[10px]",
                        isNext ? "font-bold opacity-100" : "font-medium opacity-80", // Uniform font weight
                        isNext ? textClass : mutedTextClass,
                      ].join(" ")}
                    >
                      {t.prayers[prayerName]}
                    </ThemedText>

                    {/* Hora */}
                    <ThemedText
                      variant="small"
                      numberOfLines={1}
                      className={[
                        "text-center w-full text-[11px]",
                        isNext ? "font-bold" : "font-medium", // Uniform font weight
                        isNext ? textClass : mutedTextClass,
                      ].join(" ")}
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
