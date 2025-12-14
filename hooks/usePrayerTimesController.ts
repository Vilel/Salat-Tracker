import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchPrayerTimesFromAPI,
  getDefaultLocation,
  getNextPrayer,
  type DayPrayers,
  type LocationData,
  type PrayerTime,
} from "@/lib/prayer-times";
import {
  getLocalDateKey,
  getPrayerTimesMemoryCache,
  isCacheValidFor,
  isSameLocation,
  loadPrayerTimesCache,
  materializeCachedPrayers,
  savePrayerTimesCache,
  type PrayerTimesCacheParams,
} from "@/lib/prayer-times-cache";
import {
  loadStoredLocationMode,
  saveStoredLocationMode,
  type StoredLocationMode,
} from "@/lib/location-mode-storage";

export type LocationMode = StoredLocationMode;

export type LoadingState = "loading" | "success" | "error";

export type PrayerTimesErrorKind = "fetch_failed";

export type PrayerTimesState = {
  loadingState: LoadingState;
  errorKind: PrayerTimesErrorKind | null;
  prayers: DayPrayers | null;
  nextPrayer: PrayerTime | null;
  location: LocationData | null;
  locationMode: LocationMode;
  setLocationMode: (mode: LocationMode) => void;
  retry: () => void;
};

const PRAYER_TIMES_METHOD = 2;
const LOCATION_REUSE_TTL_MS = 10 * 60 * 1000; // 10 min

export function usePrayerTimesController(): PrayerTimesState {
  const initialCache = getPrayerTimesMemoryCache();

  const [prayers, setPrayers] = useState<DayPrayers | null>(() => {
    return initialCache ? materializeCachedPrayers(initialCache) : null;
  });

  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(() => {
    if (!initialCache) return null;
    const p = materializeCachedPrayers(initialCache);
    return getNextPrayer(p);
  });

  const [location, setLocation] = useState<LocationData | null>(() => {
    return initialCache?.location ?? null;
  });

  const [loadingState, setLoadingState] = useState<LoadingState>(() => {
    return initialCache ? "success" : "loading";
  });

  const [errorKind, setErrorKind] = useState<PrayerTimesErrorKind | null>(null);

  const [locationMode, setLocationModeState] = useState<LocationMode>("auto");
  const [isModeLoaded, setIsModeLoaded] = useState(false);

  const dateKeyRef = useRef(getLocalDateKey(new Date()));

  const buildParams = useCallback(
    (loc: LocationData): PrayerTimesCacheParams => ({
      dateKey: getLocalDateKey(new Date()),
      latitude: loc.latitude,
      longitude: loc.longitude,
      method: PRAYER_TIMES_METHOD,
    }),
    []
  );

  const applyPrayers = useCallback((p: DayPrayers, loc: LocationData | null) => {
    setPrayers(p);
    setNextPrayer(getNextPrayer(p));
    if (loc) setLocation(loc);
    setLoadingState("success");
    setErrorKind(null);
  }, []);

  const tryUseCache = useCallback(
    async (loc: LocationData): Promise<boolean> => {
      const params = buildParams(loc);

      const mem = getPrayerTimesMemoryCache();
      if (mem && isCacheValidFor(mem, params)) {
        const cachedPrayers = materializeCachedPrayers(mem);
        applyPrayers(cachedPrayers, mem.location ?? loc);
        return true;
      }

      const stored = await loadPrayerTimesCache();
      if (stored && isCacheValidFor(stored, params)) {
        const cachedPrayers = materializeCachedPrayers(stored);
        applyPrayers(cachedPrayers, stored.location ?? loc);
        return true;
      }

      return false;
    },
    [applyPrayers, buildParams]
  );

  const resolveLocation = useCallback(async (): Promise<LocationData> => {
    if (locationMode === "default") {
      return getDefaultLocation();
    }

    const mem = getPrayerTimesMemoryCache();
    if (mem?.location && Date.now() - mem.savedAt <= LOCATION_REUSE_TTL_MS) {
      return mem.location;
    }

    try {
      const current = await Location.getForegroundPermissionsAsync();
      let status = current.status;

      if (status !== "granted") {
        if (current.canAskAgain) {
          const requested = await Location.requestForegroundPermissionsAsync();
          status = requested.status;
        }
      }

      if (status !== "granted") return getDefaultLocation();

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const loc: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // If we recently had a geocoded location within tolerance, reuse city/country
      // to avoid repeated reverse geocoding.
      if (
        mem?.location?.city &&
        mem.location.country &&
        isSameLocation(mem.location, loc, 3)
      ) {
        loc.city = mem.location.city;
        loc.country = mem.location.country;
        return loc;
      }

      // Reverse geocode is best-effort; failure should not block prayer times.
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
        if (geocode) {
          loc.city = geocode.city || geocode.subregion || undefined;
          loc.country = geocode.country || undefined;
        }
      } catch (geoError) {
        console.warn("Reverse geocoding failed:", geoError);
      }

      return loc;
    } catch (error) {
      console.warn("Geolocation failed, using default location:", error);
      return getDefaultLocation();
    }
  }, [locationMode]);

  const load = useCallback(async () => {
    const loc = await resolveLocation();
    setLocation(loc);

    if (await tryUseCache(loc)) {
      return;
    }

    setLoadingState("loading");

    try {
      const todayPrayers = await fetchPrayerTimesFromAPI(
        loc.latitude,
        loc.longitude
      );

      applyPrayers(todayPrayers, loc);
      await savePrayerTimesCache(buildParams(loc), todayPrayers, loc);
    } catch (error) {
      console.error("Failed to fetch prayer times:", error);
      setErrorKind("fetch_failed");
      setLoadingState("error");
    }
  }, [applyPrayers, buildParams, resolveLocation, tryUseCache]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const saved = await loadStoredLocationMode();
      if (!isMounted) return;
      setLocationModeState(saved);
      setIsModeLoaded(true);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isModeLoaded) return;
    load();
  }, [isModeLoaded, load]);

  // Keep nextPrayer fresh without refetching times.
  useEffect(() => {
    if (!prayers) return;
    const interval = setInterval(() => {
      setNextPrayer(getNextPrayer(prayers));
    }, 60000);
    return () => clearInterval(interval);
  }, [prayers]);

  // Reload prayer times if the local date changes (midnight rollover).
  useEffect(() => {
    if (!isModeLoaded) return;

    const interval = setInterval(() => {
      const currentKey = getLocalDateKey(new Date());
      if (currentKey !== dateKeyRef.current) {
        dateKeyRef.current = currentKey;
        load();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isModeLoaded, load]);

  const setLocationMode = useCallback((mode: LocationMode) => {
    setLocationModeState(mode);
    void saveStoredLocationMode(mode);
  }, []);

  const retry = useCallback(() => {
    load();
  }, [load]);

  return {
    loadingState,
    errorKind,
    prayers,
    nextPrayer,
    location,
    locationMode,
    setLocationMode,
    retry,
  };
}


