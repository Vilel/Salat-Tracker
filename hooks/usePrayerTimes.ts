import { usePrayerTimesContext } from "@/contexts/prayer-times-context";

import type { PrayerTimesState } from "@/hooks/usePrayerTimesController";

export type { LocationMode, PrayerTimesErrorKind, LoadingState } from "@/hooks/usePrayerTimesController";

export function usePrayerTimes(): PrayerTimesState {
  return usePrayerTimesContext();
}


