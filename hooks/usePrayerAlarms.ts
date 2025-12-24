import { useLanguage } from "@/contexts/language-context";
import {
    cancelScheduledNotification,
    getAllScheduledPrayerAlarms,
    getNotificationPermissionStatus,
    isExpoGo,
    requestNotificationPermissions,
    schedulePrayerAlarm,
    type NotificationPermissionStatus,
} from "@/lib/notifications";
import {
    calculateAlarmDiff,
    loadAndCleanupAlarmIds,
    mergeAlarmIds,
    savePrayerAlarmIds
} from "@/lib/prayer-alarm-schedule-storage";
import { buildPrayerAlarmSyncPlan } from "@/lib/prayer-alarm-sync";
import {
    calculateAlarmSchedule,
    getPrayersForDate,
    type AlarmPreferences
} from "@/lib/prayer-schedule";
import { type PrayerName } from "@/lib/prayer-times";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { usePrayerTimes } from "./usePrayerTimes";

const ALARMS_PREFS_KEY = "@salat_alarms_prefs_v1";

// Re-export type for convenience
export type { AlarmPreferences } from "@/lib/prayer-schedule";

const DEFAULT_ALARM_PREFS: AlarmPreferences = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

// Debounce delay for rescheduling (ms)
const RESCHEDULE_DEBOUNCE_MS = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
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

/**
 * Safely persist alarm preferences to AsyncStorage.
 * Returns true on success, false on failure.
 */
async function persistAlarmPrefs(prefs: AlarmPreferences): Promise<boolean> {
  try {
    await AsyncStorage.setItem(ALARMS_PREFS_KEY, JSON.stringify(prefs));
    return true;
  } catch (e) {
    console.warn("Failed to persist alarm preferences:", e);
    return false;
  }
}

export function usePrayerAlarms() {
  const { prayers, location } = usePrayerTimes();
  const { t } = useLanguage();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const supported = useMemo(() => !isExpoGo(), []);

  const [preferences, setPreferences] =
    useState<AlarmPreferences>(DEFAULT_ALARM_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>("undetermined");
  
  // Track if a reschedule is pending (for debounce)
  const rescheduleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track if we are currently rescheduling (prevent overlapping calls)
  const isReschedulingRef = useRef(false);
  // Store latest preferences ref for reschedule to use (avoids stale closure)
  const preferencesRef = useRef(preferences);
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  // Load preferences on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(ALARMS_PREFS_KEY);
        if (!isMounted) return;
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (isRecord(parsed)) {
            const next: AlarmPreferences = { ...DEFAULT_ALARM_PREFS };
            for (const [k, v] of Object.entries(parsed)) {
              if (isPrayerName(k) && typeof v === "boolean") {
                next[k] = v;
              }
            }
            setPreferences(next);
          }
        }
      } catch (e) {
        console.warn("Failed to load alarm prefs", e);
      } finally {
        if (isMounted) setLoaded(true);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const refreshPermissionStatus = useCallback(async () => {
    const status = await getNotificationPermissionStatus();
    setPermissionStatus(status);
    return status;
  }, []);

  useEffect(() => {
    if (!supported) {
      setPermissionStatus("unavailable");
      return;
    }
    void refreshPermissionStatus();
  }, [refreshPermissionStatus, supported]);

  // Core reschedule logic (internal, not debounced)
  // Uses OS reconciliation (preferred) with a storage-only diff fallback.
  const doReschedule = useCallback(async () => {
    if (!supported) return;
    if (!loaded || !prayers || !location) return;
    if (permissionStatus !== "granted") return;
    if (isReschedulingRef.current) return; // Prevent overlapping

    isReschedulingRef.current = true;

    try {
      // 1. Load existing scheduled alarm IDs (also cleans up expired ones)
      const existingIds = await loadAndCleanupAlarmIds();
      const existingKeys = new Set(Object.keys(existingIds));

      // 2. Get tomorrow's prayers (catch errors to avoid breaking the flow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let tomorrowPrayers = null;
      try {
        tomorrowPrayers = await getPrayersForDate(tomorrow, location);
      } catch (e) {
        console.warn("Failed to fetch tomorrow's prayers for alarms:", e);
      }

      // 3. Calculate desired schedule using latest preferences
      const currentPrefs = preferencesRef.current;
      const items = calculateAlarmSchedule(new Date(), prayers, tomorrowPrayers, currentPrefs);
      const desiredKeys = new Set(items.map(item => item.key));

      // 4. Preferred: reconcile against OS scheduled notifications (fixes drift + removes duplicates)
      let usedOsReconcile = false;
      try {
        const scheduled = await getAllScheduledPrayerAlarms();
        const syncPlan = buildPrayerAlarmSyncPlan({
          desiredKeys,
          storedIds: existingIds,
          scheduled,
        });

        // Cancel stale + duplicates (best-effort)
        if (syncPlan.idsToCancel.length > 0) {
          await Promise.all(
            syncPlan.idsToCancel.map(async (id) => {
              try {
                await cancelScheduledNotification(id);
              } catch (e) {
                console.warn(`Failed to cancel notification ${id}:`, e);
              }
            })
          );
        }

        // Schedule missing desired keys (based on what is actually scheduled post-sync)
        const existingOsKeys = new Set(Object.keys(syncPlan.scheduledKeyToId));
        const diff = calculateAlarmDiff(existingOsKeys, desiredKeys);

        const toScheduleKeySet = new Set(diff.toSchedule);
        const newIds: Record<string, string> = {};
        for (const item of items) {
          if (!toScheduleKeySet.has(item.key)) continue;

          const title = tRef.current.prayers[item.prayer];
          const body = `${tRef.current.alarm.notificationBody} ${title}`;

          const id = await schedulePrayerAlarm(item.prayer, item.time, title, body);
          if (id) newIds[item.key] = id;
        }

        // Persist the reconciled truth (fixes storage drift)
        await savePrayerAlarmIds({ ...syncPlan.scheduledKeyToId, ...newIds });

        usedOsReconcile = true;

        if (__DEV__) {
          console.log(
            `[Alarms] Reconcile: cancelled=${syncPlan.idsToCancel.length}, scheduled=${diff.toSchedule.length}, kept=${diff.toKeep.length}`
          );
        }
      } catch (e) {
        // If OS introspection fails (rare), fall back to storage-based diff
        console.warn("Failed to reconcile scheduled alarms with OS, falling back to storage diff:", e);
      }

      if (!usedOsReconcile) {
        // 4b. Fallback: Calculate diff based on AsyncStorage-only keys
        const diff = calculateAlarmDiff(existingKeys, desiredKeys);

        // Cancel only alarms that are no longer needed (parallel)
        if (diff.toCancel.length > 0) {
          const cancelPromises = diff.toCancel.map(async (key) => {
            const id = existingIds[key];
            if (id) {
              try {
                await cancelScheduledNotification(id);
              } catch (e) {
                console.warn(`Failed to cancel notification ${key}:`, e);
              }
            }
          });
          await Promise.all(cancelPromises);
        }

        // Schedule only new alarms (those not already scheduled)
        const newIds: Record<string, string> = {};
        const itemsToSchedule = items.filter(item => diff.toSchedule.includes(item.key));

        for (const item of itemsToSchedule) {
          const title = tRef.current.prayers[item.prayer];
          const body = `${tRef.current.alarm.notificationBody} ${title}`;

          const id = await schedulePrayerAlarm(item.prayer, item.time, title, body);
          if (id) {
            newIds[item.key] = id;
          }
        }

        // Merge IDs: remove cancelled, add new, keep existing
        const mergedIds = mergeAlarmIds(existingIds, diff.toCancel, newIds);
        await savePrayerAlarmIds(mergedIds);

        if (__DEV__) {
          console.log(`[Alarms] Diff result: cancelled=${diff.toCancel.length}, scheduled=${diff.toSchedule.length}, kept=${diff.toKeep.length}`);
        }
      }
    } finally {
      isReschedulingRef.current = false;
    }
  }, [loaded, location, permissionStatus, prayers, supported]);

  // Debounced reschedule function
  const reschedule = useCallback(() => {
    // Clear any pending reschedule
    if (rescheduleTimeoutRef.current) {
      clearTimeout(rescheduleTimeoutRef.current);
    }
    
    rescheduleTimeoutRef.current = setTimeout(() => {
      rescheduleTimeoutRef.current = null;
      void doReschedule();
    }, RESCHEDULE_DEBOUNCE_MS);
  }, [doReschedule]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (rescheduleTimeoutRef.current) {
        clearTimeout(rescheduleTimeoutRef.current);
      }
    };
  }, []);

  // Toggle preference with proper persistence
  const toggleAlarm = useCallback(async (prayer: PrayerName) => {
    // Optimistic update
    const newPrefs = { ...preferencesRef.current, [prayer]: !preferencesRef.current[prayer] };
    setPreferences(newPrefs);
    
    // Persist asynchronously
    const success = await persistAlarmPrefs(newPrefs);
    if (!success) {
      // Rollback on failure
      setPreferences(preferencesRef.current);
      console.warn("Failed to save alarm preference, rolled back");
      return;
    }
    
    // Trigger debounced reschedule
    reschedule();
  }, [reschedule]);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    const granted = await requestNotificationPermissions();
    await refreshPermissionStatus();
    if (granted) {
      reschedule();
    }
    return granted;
  }, [refreshPermissionStatus, reschedule, supported]);

  // Refresh permission status when app becomes active again
  useEffect(() => {
    if (!supported) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        (async () => {
          const status = await refreshPermissionStatus();
          if (status === "granted") {
            reschedule();
          }
        })();
      }
    });

    return () => sub.remove();
  }, [refreshPermissionStatus, reschedule, supported]);

  // Auto-reschedule when core dependencies change
  useEffect(() => {
    if (loaded && prayers && location && permissionStatus === "granted") {
      reschedule();
    }
  }, [loaded, prayers, location, permissionStatus, reschedule]);

  return {
    supported,
    loaded,
    permissionStatus,
    refreshPermissionStatus,
    requestPermission,
    preferences,
    toggleAlarm,
    reschedule,
    canSchedule: supported && permissionStatus === "granted",
  };
}
