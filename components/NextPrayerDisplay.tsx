// components/NextPrayerDisplay.tsx

import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLanguage } from "../contexts/language-context";
import {
    type PrayerTime,
    formatTime,
    getTimeUntilPrayer,
} from "../lib/prayer-time";

interface NextPrayerDisplayProps {
  prayer: PrayerTime;
}

export function NextPrayerDisplay({ prayer }: NextPrayerDisplayProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(getTimeUntilPrayer(prayer));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilPrayer(prayer));
    }, 1000);

    return () => clearInterval(interval);
  }, [prayer]);

  return (
    <View className="items-center justify-center space-y-4">
      {/* Next prayer label */}
      <Text className="text-2xl md:text-3xl font-medium text-neutral-500 uppercase tracking-[0.2em]">
        {t.nextPrayer}
      </Text>

      {/* Prayer name - extra large */}
      <Text className="text-6xl md:text-8xl font-bold text-neutral-900 tracking-tight">
        {t.prayers[prayer.name]}
      </Text>

      {/* Prayer time */}
      <Text className="text-5xl md:text-7xl font-semibold text-primary tabular-nums">
        {formatTime(prayer.hour, prayer.minute)}
      </Text>

      {/* Time remaining */}
      <View className="pt-4 items-center">
        <Text className="text-lg text-neutral-500 uppercase tracking-wide mb-2">
          {t.timeRemaining}
        </Text>
        <Text className="text-3xl md:text-4xl font-semibold text-emerald-600 tabular-nums">
          {timeLeft.hours}
          {t.hours} {timeLeft.minutes}
          {t.minutes}
        </Text>
      </View>
    </View>
  );
}
