import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DayPrayers, LocationData, PrayerName, PrayerTime } from "@/lib/prayer-times";
import { getLocalDateKey, isSameLocation } from "@/lib/prayer-times-cache";

/**
 * Cache for alarm scheduling only (multi-day), separate from main prayer times cache.
 * Versioned storage key (shape changes must bump version + key).
 */
export const ALARM_DAY_CACHE_KEY = "@salat_alarm_day_prayers_cache_v1";

type CachedPrayerTime = {
  name: PrayerName;
  timeMs: number;
  hour: number;
  minute: number;
};

type CachedDayPrayers = Record<PrayerName, CachedPrayerTime>;

type AlarmDayCacheEntryV1 = {
  v: 1;
  savedAt: number;
  dateKey: string; // local YYYY-MM-DD
  params: {
    latitude: number;
    longitude: number;
    method: number;
  };
  prayers: CachedDayPrayers;
};

type AlarmDayCacheStoreV1 = Record<string, AlarmDayCacheEntryV1>;

function toCachedPrayerTime(p: PrayerTime): CachedPrayerTime {
  return { name: p.name, timeMs: p.time.getTime(), hour: p.hour, minute: p.minute };
}

function toCachedDayPrayers(prayers: DayPrayers): CachedDayPrayers {
  return {
    fajr: toCachedPrayerTime(prayers.fajr),
    dhuhr: toCachedPrayerTime(prayers.dhuhr),
    asr: toCachedPrayerTime(prayers.asr),
    maghrib: toCachedPrayerTime(prayers.maghrib),
    isha: toCachedPrayerTime(prayers.isha),
  };
}

function fromCachedPrayerTime(p: CachedPrayerTime): PrayerTime {
  return { name: p.name, time: new Date(p.timeMs), hour: p.hour, minute: p.minute };
}

function fromCachedDayPrayers(prayers: CachedDayPrayers): DayPrayers {
  return {
    fajr: fromCachedPrayerTime(prayers.fajr),
    dhuhr: fromCachedPrayerTime(prayers.dhuhr),
    asr: fromCachedPrayerTime(prayers.asr),
    maghrib: fromCachedPrayerTime(prayers.maghrib),
    isha: fromCachedPrayerTime(prayers.isha),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isPrayerName(value: unknown): value is PrayerName {
  return value === "fajr" || value === "dhuhr" || value === "asr" || value === "maghrib" || value === "isha";
}

function isCachedPrayerTime(value: unknown): value is CachedPrayerTime {
  if (!isRecord(value)) return false;
  return (
    isPrayerName(value.name) &&
    typeof value.timeMs === "number" &&
    Number.isFinite(value.timeMs) &&
    typeof value.hour === "number" &&
    Number.isFinite(value.hour) &&
    typeof value.minute === "number" &&
    Number.isFinite(value.minute)
  );
}

function isCachedDayPrayers(value: unknown): value is CachedDayPrayers {
  if (!isRecord(value)) return false;
  return (
    isCachedPrayerTime(value.fajr) &&
    isCachedPrayerTime(value.dhuhr) &&
    isCachedPrayerTime(value.asr) &&
    isCachedPrayerTime(value.maghrib) &&
    isCachedPrayerTime(value.isha)
  );
}

function isAlarmDayCacheEntryV1(value: unknown): value is AlarmDayCacheEntryV1 {
  if (!isRecord(value)) return false;
  if (value.v !== 1) return false;
  if (typeof value.savedAt !== "number" || !Number.isFinite(value.savedAt)) return false;
  if (typeof value.dateKey !== "string") return false;
  if (!isRecord(value.params)) return false;
  const params = value.params as Record<string, unknown>;
  if (typeof params.latitude !== "number" || !Number.isFinite(params.latitude)) return false;
  if (typeof params.longitude !== "number" || !Number.isFinite(params.longitude)) return false;
  if (typeof params.method !== "number" || !Number.isFinite(params.method)) return false;
  if (!isCachedDayPrayers(value.prayers)) return false;
  return true;
}

async function loadStore(): Promise<AlarmDayCacheStoreV1> {
  try {
    const raw = await AsyncStorage.getItem(ALARM_DAY_CACHE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return {};

    const store: AlarmDayCacheStoreV1 = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k === "string" && isAlarmDayCacheEntryV1(v)) {
        store[k] = v;
      }
    }
    return store;
  } catch (e) {
    console.warn("Failed to load alarm day prayers cache:", e);
    return {};
  }
}

async function saveStore(store: AlarmDayCacheStoreV1): Promise<void> {
  try {
    await AsyncStorage.setItem(ALARM_DAY_CACHE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn("Failed to save alarm day prayers cache:", e);
  }
}

function makeKey(dateKey: string, method: number): string {
  return `${dateKey}:${method}`;
}

export async function loadAlarmDayPrayersCache(
  date: Date,
  location: Pick<LocationData, "latitude" | "longitude">,
  method: number,
  toleranceKm: number = 3
): Promise<DayPrayers | null> {
  const dateKey = getLocalDateKey(date);
  const store = await loadStore();
  const entry = store[makeKey(dateKey, method)];
  if (!entry) return null;

  if (!isSameLocation(entry.params, location, toleranceKm)) return null;
  return fromCachedDayPrayers(entry.prayers);
}

export async function saveAlarmDayPrayersCache(
  date: Date,
  location: Pick<LocationData, "latitude" | "longitude">,
  method: number,
  prayers: DayPrayers
): Promise<void> {
  const dateKey = getLocalDateKey(date);
  const store = await loadStore();

  // Keep only today+tomorrow to avoid unbounded growth.
  const todayKey = getLocalDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = getLocalDateKey(tomorrow);

  const allowed = new Set([todayKey, tomorrowKey, dateKey]);
  for (const k of Object.keys(store)) {
    const kDate = k.split(":")[0];
    if (!allowed.has(kDate)) delete store[k];
  }

  store[makeKey(dateKey, method)] = {
    v: 1,
    savedAt: Date.now(),
    dateKey,
    params: { latitude: location.latitude, longitude: location.longitude, method },
    prayers: toCachedDayPrayers(prayers),
  };

  await saveStore(store);
}


