// components/PrayerTimeline.tsx

import { useLanguage } from "@/contexts/language-context";
import {
  type DayPrayers,
  formatTime,
  type PrayerName,
} from "@/lib/prayer-times";
import { Text, View } from "react-native";

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

const PRAYER_COLORS: Record<PrayerName, string> = {
  fajr: "#0ea5e9",
  dhuhr: "#eab308",
  asr: "#f97316",
  maghrib: "#a855f7",
  isha: "#1e40af",
};

export function PrayerTimeline({ prayers, nextPrayer }: PrayerTimelineProps) {
  const { t } = useLanguage();

  return (
    <View className="w-full px-4">
      <View className="bg-white rounded-3xl px-4 py-4 shadow-sm border border-slate-100 flex-row justify-between gap-2">
        {PRAYER_ORDER.map((prayer, index) => {
          const isNext = prayer === nextPrayer;
          const isPast = PRAYER_ORDER.indexOf(nextPrayer) > index;
          const prayerData = prayers[prayer];

          const dotColor = PRAYER_COLORS[prayer];

          return (
            <View
              key={prayer}
              className="flex-1 items-center gap-1"
            >
              {/* Punto de color */}
              <View
                className={`w-3 h-3 rounded-full mb-1 ${
                  isNext ? "border-2 border-emerald-500" : ""
                }`}
                style={{ backgroundColor: dotColor }}
              />

              {/* Nombre del rezo */}
              <Text
                className={`text-xs font-semibold text-center uppercase ${
                  isPast
                    ? "text-slate-300"
                    : isNext
                    ? "text-emerald-700"
                    : "text-slate-700"
                }`}
              >
                {t.prayers[prayer]}
              </Text>

              {/* Hora */}
              <Text
                className={`text-sm font-medium text-center ${
                  isPast
                    ? "text-slate-300"
                    : isNext
                    ? "text-slate-900"
                    : "text-slate-600"
                }`}
              >
                {formatTime(prayerData.hour, prayerData.minute)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
