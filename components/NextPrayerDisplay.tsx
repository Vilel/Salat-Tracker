// components/NextPrayerDisplay.tsx

import { FontSizes } from "@/constants/theme";
import { useLanguage } from "@/contexts/language-context";
import {
  type PrayerTime,
  formatTime,
  getTimeUntilPrayer,
} from "@/lib/prayer-times";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

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
    <View className="items-center justify-center px-4 gap-3">
      {/* Next prayer label */}
      <Text
        style={{ fontSize: FontSizes.sm, letterSpacing: 4 }}
        className="text-slate-500 uppercase"
      >
        {t.nextPrayer}
      </Text>

      {/* Prayer name */}
      <Text
        style={{ fontSize: FontSizes["3xl"] }}
        className="font-bold text-slate-900"
      >
        {t.prayers[prayer.name]}
      </Text>

      {/* Prayer time */}
      <Text
        style={{ fontSize: FontSizes["2xl"] }}
        className="font-semibold text-emerald-700"
      >
        {formatTime(prayer.hour, prayer.minute)}
      </Text>

      {/* Time remaining */}
      <View className="pt-3 items-center">
        <Text
          style={{ fontSize: FontSizes.sm }}
          className="text-slate-500 uppercase tracking-wide mb-1"
        >
          {t.timeRemaining}
        </Text>
        <Text
          style={{ fontSize: FontSizes.xl }}
          className="font-semibold text-emerald-600"
        >
          {timeLeft.hours}
          {t.hours} {timeLeft.minutes}
          {t.minutes}
        </Text>
      </View>
    </View>
  );
}
