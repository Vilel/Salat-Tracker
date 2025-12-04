// components/PrayerTimeline.tsx

import { Text, View } from "react-native";
import { useLanguage } from "../contexts/language-context";
import {
    type DayPrayers,
    formatTime,
    type PrayerName,
} from "../lib/prayer-time";

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

export function PrayerTimeline({ prayers, nextPrayer }: PrayerTimelineProps) {
  const { t } = useLanguage();

  return (
    <View className="w-full px-4">
      <View className="flex-row justify-between items-center gap-1">
        {PRAYER_ORDER.map((prayer, index) => {
          const isNext = prayer === nextPrayer;
          const isPast = PRAYER_ORDER.indexOf(nextPrayer) > index;
          const prayerData = prayers[prayer];

          return (
            <View
              key={prayer}
              className={`flex-1 items-center gap-2 py-4 px-2 rounded-xl transition-all duration-300 ${
                isNext
                  ? "bg-primary scale-105"
                  : isPast
                  ? "opacity-40 bg-neutral-100"
                  : "bg-neutral-100"
              }`}
            >
              <Text
                className={`text-base font-bold uppercase tracking-wide ${
                  isNext ? "text-primary-foreground" : "text-neutral-900"
                }`}
              >
                {t.prayers[prayer]}
              </Text>
              <Text
                className={`text-lg font-semibold ${
                  isNext ? "text-primary-foreground" : "text-neutral-500"
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
