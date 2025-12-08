// lib/salat-tracker.ts

import type { PrayerName } from "@/lib/prayer-times";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Claves usadas en AsyncStorage
 */
export const TRACKER_KEY = "@salat_tracker_v1";
export const QADA_CLEARED_KEY = "@salat_qada_cleared_v1";

/**
 * Orden de los rezos que trackeamos.
 */
export const PRAYER_ORDER: PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

/**
 * Número de rak‘ats que contamos para cada salat.
 * Nota: Isha se cuenta como 7 en total (4 + 2 + 1).
 */
export const RAKATS: Record<PrayerName, number> = {
  fajr: 2,
  dhuhr: 4,
  asr: 4,
  maghrib: 3,
  isha: 7,
};

/**
 * Estado de un día concreto: para cada rezo, true/false si está hecho.
 */
export type DayStatus = Record<PrayerName, boolean>;

/**
 * Estructura completa del tracker:
 * - clave: "YYYY-MM-DD"
 * - valor: DayStatus
 */
export type TrackerStore = Record<string, DayStatus>;

/**
 * Crea el estado vacío para un día (ningún salat marcado).
 */
export function createEmptyDayStatus(): DayStatus {
  return {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };
}

/**
 * Convierte una Date a la clave de almacenamiento "YYYY-MM-DD".
 */
export function getDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Carga el tracker completo desde AsyncStorage.
 * Si no hay datos o hay error, devuelve {}.
 */
export async function loadTracker(): Promise<TrackerStore> {
  try {
    const raw = await AsyncStorage.getItem(TRACKER_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as TrackerStore;
    }

    return {};
  } catch (error) {
    console.warn("Failed to load salat tracker:", error);
    return {};
  }
}

/**
 * Guarda el tracker completo en AsyncStorage.
 */
export async function saveTracker(tracker: TrackerStore): Promise<void> {
  try {
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
  } catch (error) {
    console.warn("Failed to save salat tracker:", error);
  }
}

/**
 * Carga el número total de rak‘ats de qadá ya rezados.
 */
export async function loadQadaCleared(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(QADA_CLEARED_KEY);
    if (!raw) return 0;
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  } catch (error) {
    console.warn("Failed to load qada cleared:", error);
    return 0;
  }
}

/**
 * Guarda el número total de rak‘ats de qadá ya rezados.
 */
export async function saveQadaCleared(value: number): Promise<void> {
  try {
    await AsyncStorage.setItem(QADA_CLEARED_KEY, String(value));
  } catch (error) {
    console.warn("Failed to save qada cleared:", error);
  }
}

/**
 * Devuelve un nuevo TrackerStore con el rezo `prayer`
 * para la fecha `dateKey` conmutado (toggle).
 *
 * Nota: SOLO modifica ese día concreto.
 */
export function togglePrayerForDate(
  tracker: TrackerStore,
  dateKey: string,
  prayer: PrayerName
): TrackerStore {
  const currentDay: DayStatus = tracker[dateKey] ?? createEmptyDayStatus();

  const newDay: DayStatus = {
    ...currentDay,
    [prayer]: !currentDay[prayer],
  };

  return {
    ...tracker,
    [dateKey]: newDay,
  };
}

/**
 * Calcula las estadísticas diarias a partir del estado de ese día:
 * - totalRakats
 * - doneRakats
 * - donePrayersCount
 * - completionPercentage (0–100)
 * - remainingRakats
 */
export function computeDayStats(dayStatus: DayStatus) {
  const totalRakats = PRAYER_ORDER.reduce(
    (sum, name) => sum + RAKATS[name],
    0
  );

  const doneRakats = PRAYER_ORDER.reduce(
    (sum, name) => sum + (dayStatus[name] ? RAKATS[name] : 0),
    0
  );

  const donePrayersCount = PRAYER_ORDER.filter((p) => dayStatus[p]).length;

  const completionPercentage =
    totalRakats > 0
      ? Math.round((doneRakats / totalRakats) * 100)
      : 0;

  const remainingRakats = totalRakats - doneRakats;

  return {
    totalRakats,
    doneRakats,
    donePrayersCount,
    completionPercentage,
    remainingRakats,
  };
}

/**
 * Devuelve todas las claves de fecha del tracker, ordenadas ascendente.
 */
export function getSortedDateKeys(tracker: TrackerStore): string[] {
  return Object.keys(tracker).sort((a, b) => a.localeCompare(b));
}

/**
 * Calcula el total de rak‘ats NO realizados (missed) en todos los días
 * registrados en el tracker ANTES de `upToKey` (normalmente, hoy).
 */
export function computeTotalMissedRakats(
  tracker: TrackerStore,
  upToKey?: string
): number {
  let totalMissed = 0;

  for (const key of Object.keys(tracker)) {
    if (upToKey && key >= upToKey) {
      // saltamos hoy y días futuros
      continue;
    }

    const dayStatus = tracker[key] ?? createEmptyDayStatus();
    const { totalRakats, doneRakats } = computeDayStats(dayStatus);
    totalMissed += totalRakats - doneRakats;
  }

  return totalMissed;
}
