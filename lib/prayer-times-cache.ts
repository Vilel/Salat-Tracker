import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  DayPrayers,
  LocationData,
  PrayerName,
  PrayerTime,
} from "@/lib/prayer-times";

/**
 * Versioned storage key (shape changes must bump version + key).
 */
export const PRAYER_TIMES_CACHE_KEY = "@prayer_times_cache_v1";

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export type PrayerTimesCacheParams = {
  dateKey: string; // local YYYY-MM-DD
  latitude: number;
  longitude: number;
  method: number;
};

type CachedPrayerTime = {
  name: PrayerName;
  timeMs: number;
  hour: number;
  minute: number;
};

type CachedDayPrayers = Record<PrayerName, CachedPrayerTime>;

export type PrayerTimesCacheEntryV1 = {
  v: 1;
  savedAt: number;
  params: PrayerTimesCacheParams;
  location?: LocationData;
  prayers: CachedDayPrayers;
};

let memoryCache: PrayerTimesCacheEntryV1 | null = null;

export function getPrayerTimesMemoryCache(): PrayerTimesCacheEntryV1 | null {
  return memoryCache;
}

export function setPrayerTimesMemoryCache(
  entry: PrayerTimesCacheEntryV1 | null
): void {
  memoryCache = entry;
}

export function getLocalDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameLocation(
  a: Pick<LocationData, "latitude" | "longitude">,
  b: Pick<LocationData, "latitude" | "longitude">,
  toleranceKm: number = 3
): boolean {
  // Haversine distance (km) for an approx 3km tolerance by default.
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(h)));

  const distanceKm = R * c;
  return distanceKm <= toleranceKm;
}

export function isCacheValidFor(
  entry: PrayerTimesCacheEntryV1,
  params: PrayerTimesCacheParams,
  toleranceKm: number = 3
): boolean {
  return (
    entry.v === 1 &&
    entry.params.dateKey === params.dateKey &&
    entry.params.method === params.method &&
    isSameLocation(entry.params, params, toleranceKm)
  );
}

function toCachedPrayerTime(p: PrayerTime): CachedPrayerTime {
  return {
    name: p.name,
    timeMs: p.time.getTime(),
    hour: p.hour,
    minute: p.minute,
  };
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
  return {
    name: p.name,
    time: new Date(p.timeMs),
    hour: p.hour,
    minute: p.minute,
  };
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
  return typeof value === "object" && value !== null;
}

function isPrayerName(value: unknown): value is PrayerName {
  return (
    value === "fajr" ||
    value === "dhuhr" ||
    value === "asr" ||
    value === "maghrib" ||
    value === "isha"
  );
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
  return PRAYER_ORDER.every((p) => isCachedPrayerTime(value[p]));
}

function isPrayerTimesCacheEntryV1(
  value: unknown
): value is PrayerTimesCacheEntryV1 {
  if (!isRecord(value)) return false;
  if (value.v !== 1) return false;
  if (typeof value.savedAt !== "number" || !Number.isFinite(value.savedAt)) {
    return false;
  }
  if (!isRecord(value.params)) return false;

  const params = value.params as Record<string, unknown>;
  if (typeof params.dateKey !== "string") return false;
  if (typeof params.latitude !== "number" || !Number.isFinite(params.latitude)) {
    return false;
  }
  if (
    typeof params.longitude !== "number" ||
    !Number.isFinite(params.longitude)
  ) {
    return false;
  }
  if (typeof params.method !== "number" || !Number.isFinite(params.method)) {
    return false;
  }
  if (!isCachedDayPrayers(value.prayers)) return false;

  // location is optional; if present, validate minimal shape
  if (value.location !== undefined) {
    if (!isRecord(value.location)) return false;
    const loc = value.location as Record<string, unknown>;
    if (typeof loc.latitude !== "number" || !Number.isFinite(loc.latitude)) {
      return false;
    }
    if (typeof loc.longitude !== "number" || !Number.isFinite(loc.longitude)) {
      return false;
    }
    if (loc.city !== undefined && typeof loc.city !== "string") return false;
    if (loc.country !== undefined && typeof loc.country !== "string") return false;
  }

  return true;
}

export async function loadPrayerTimesCache(): Promise<PrayerTimesCacheEntryV1 | null> {
  try {
    const raw = await AsyncStorage.getItem(PRAYER_TIMES_CACHE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isPrayerTimesCacheEntryV1(parsed)) return null;

    return parsed;
  } catch (error) {
    console.warn("Failed to load prayer times cache:", error);
    return null;
  }
}

export async function savePrayerTimesCache(
  params: PrayerTimesCacheParams,
  prayers: DayPrayers,
  location?: LocationData
): Promise<PrayerTimesCacheEntryV1> {
  const entry: PrayerTimesCacheEntryV1 = {
    v: 1,
    savedAt: Date.now(),
    params,
    location,
    prayers: toCachedDayPrayers(prayers),
  };

  // Update memory first (so navigation feels instant even if storage write is slow)
  setPrayerTimesMemoryCache(entry);

  try {
    await AsyncStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.warn("Failed to save prayer times cache:", error);
  }

  return entry;
}

export function materializeCachedPrayers(
  entry: PrayerTimesCacheEntryV1
): DayPrayers {
  return fromCachedDayPrayers(entry.prayers);
}


