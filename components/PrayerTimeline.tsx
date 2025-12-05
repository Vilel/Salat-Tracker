// components/PrayerTimeline.tsx

import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

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
  const stripeColors = PrayerStripeColors[colorScheme];

  // Reloj interno: actualizamos cada segundo
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nowMinutes = toMinutes(
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  );

  // Construimos la lista de rezos con sus tiempos (en minutos) y su posición horizontal (0–1)
  const timelinePoints = PRAYER_ORDER.map((name, idx) => {
    const data = prayers[name];
    if (!data) return null;

    const minutes = toMinutes(data.hour, data.minute);
    const pos = PRAYER_ORDER.length === 1 ? 0 : idx / (PRAYER_ORDER.length - 1);

    return {
      name,
      data,
      minutes,
      pos, // posición horizontal del punto
    };
  }).filter(Boolean) as {
    name: PrayerName;
    data: { hour: number; minute: number };
    minutes: number;
    pos: number;
  }[];

  // Cálculo del progreso sobre la línea:
  // - Antes del primer rezo: empieza en el primer punto
  // - Entre dos rezos: interpolación lineal entre sus posiciones
  // - Después del último rezo: termina en el último punto
  let progressPos = 0; // 0–1

  if (timelinePoints.length > 0) {
    const first = timelinePoints[0];
    const last = timelinePoints[timelinePoints.length - 1];

    if (nowMinutes <= first.minutes) {
      progressPos = first.pos;
    } else if (nowMinutes >= last.minutes) {
      progressPos = last.pos;
    } else {
      for (let i = 0; i < timelinePoints.length - 1; i++) {
        const a = timelinePoints[i];
        const b = timelinePoints[i + 1];

        if (nowMinutes >= a.minutes && nowMinutes <= b.minutes) {
          const segmentTotal = b.minutes - a.minutes || 1;
          const segmentProgress = (nowMinutes - a.minutes) / segmentTotal;

          progressPos =
            a.pos + (b.pos - a.pos) * segmentProgress;
          break;
        }
      }
    }
  }

  return (
    <View className="w-full px-4">
      <View
        className="rounded-3xl px-4 py-3 shadow-sm border flex-col gap-3"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        {/* Barra de progreso */}
        <View className="w-full h-1.5 rounded-full overflow-hidden mb-1 relative">
          {/* Fondo */}
          <View
            className="h-full"
            style={{
              backgroundColor: theme.border,
              opacity: 0.5,
            }}
          />
          {/* Progreso que avanza “debajo” de los puntos */}
          <View
            className="h-full absolute left-0 top-0"
            style={{
              width: `${progressPos * 100}%`,
              backgroundColor: theme.primary,
            }}
          />
        </View>

        {/* Puntos de los rezos */}
        <View className="flex-row justify-between gap-1">
          {PRAYER_ORDER.map((prayerName) => {
            const prayerData = prayers[prayerName];
            if (!prayerData) return null;

            const dotColor = stripeColors[prayerName];
            const isNext = prayerName === nextPrayer;

            return (
              <View
                key={prayerName}
                className="flex-1 items-center gap-[2px]"
              >
                {/* Punto de color (no cambiamos color, solo un pequeño halo para el siguiente) */}
                <View
                  className="w-3 h-3 rounded-full mb-[2px]"
                  style={{
                    backgroundColor: dotColor,
                    borderWidth: isNext ? 2 : 0,
                    borderColor: isNext ? theme.primary : "transparent",
                  }}
                />

                {/* Nombre del rezo */}
                <Text
                  className="text-center uppercase"
                  numberOfLines={1}
                  style={{
                    fontSize: FontSizes.xxs, // más pequeño
                    fontWeight: "600",
                    color: isNext ? theme.primary : theme.text,
                  }}
                >
                  {t.prayers[prayerName]}
                </Text>

                {/* Hora */}
                <Text
                  className="text-center"
                  numberOfLines={1}
                  style={{
                    fontSize: 12, // un poco menos que xs
                    fontWeight: "500",
                    color: theme.text,
                    opacity: 0.9,
                  }}
                >
                  {formatTime(prayerData.hour, prayerData.minute)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
