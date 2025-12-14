import React, { createContext, useContext, useMemo } from "react";

import {
  usePrayerTimesController,
  type PrayerTimesState,
} from "@/hooks/usePrayerTimesController";

const PrayerTimesContext = createContext<PrayerTimesState | undefined>(
  undefined
);

export function PrayerTimesProvider({ children }: { children: React.ReactNode }) {
  const state = usePrayerTimesController();

  // Keep reference stable for consumers when possible.
  const value = useMemo(() => state, [state]);

  return (
    <PrayerTimesContext.Provider value={value}>
      {children}
    </PrayerTimesContext.Provider>
  );
}

export function usePrayerTimesContext(): PrayerTimesState {
  const ctx = useContext(PrayerTimesContext);
  if (!ctx) {
    throw new Error("usePrayerTimesContext must be used within a PrayerTimesProvider");
  }
  return ctx;
}


