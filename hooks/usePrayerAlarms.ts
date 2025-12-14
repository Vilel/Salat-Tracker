import { useLanguage } from "@/contexts/language-context";
import {
    cancelScheduledNotification,
    getNotificationPermissionStatus,
    isExpoGo,
    requestNotificationPermissions,
    schedulePrayerAlarm,
    type NotificationPermissionStatus,
} from "@/lib/notifications";
import { loadPrayerAlarmIds, savePrayerAlarmIds } from "@/lib/prayer-alarm-schedule-storage";
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

  // Load preferences
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(ALARMS_PREFS_KEY);
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
        setLoaded(true);
      }
    })();
  }, []);

  const refreshPermissionStatus = useCallback(async () => {
    const status = await getNotificationPermissionStatus();
    setPermissionStatus(status);
    return status;
  }, []);

  // Refresh permission status when app becomes active again
  useEffect(() => {
    if (!supported) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        (async () => {
          const status = await refreshPermissionStatus();
          if (status === "granted") {
            await reschedule();
          }
        })();
      }
    });

    return () => sub.remove();
  }, [refreshPermissionStatus, supported]); // Added reschedule to deps, handled below

  useEffect(() => {
    if (!supported) {
      setPermissionStatus("unavailable");
      return;
    }
    void refreshPermissionStatus();
  }, [refreshPermissionStatus, supported]);

  // Toggle Preference
  const toggleAlarm = useCallback(async (prayer: PrayerName) => {
    setPreferences((prev) => {
      const next = { ...prev, [prayer]: !prev[prayer] };
      AsyncStorage.setItem(ALARMS_PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    const granted = await requestNotificationPermissions();
    await refreshPermissionStatus();
    return granted;
  }, [refreshPermissionStatus, supported]);

  const reschedule = useCallback(async () => {
    if (!supported) return;
    if (!loaded || !prayers || !location) return;
    if (permissionStatus !== "granted") return;

    // 1. Cancel existing
    const existing = await loadPrayerAlarmIds();
    for (const id of Object.values(existing)) {
      try {
        await cancelScheduledNotification(id);
      } catch (e) {
        console.warn("Failed to cancel scheduled notification:", e);
      }
    }

    // 2. Get tomorrow's prayers (using service)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // We catch errors here to avoid crashing the hook if API fails
    let tomorrowPrayers = null;
    try {
        tomorrowPrayers = await getPrayersForDate(tomorrow, location);
    } catch (e) {
        console.warn("Failed to fetch tomorrow's prayers for alarms:", e);
    }

    // 3. Calculate schedule
    const items = calculateAlarmSchedule(new Date(), prayers, tomorrowPrayers, preferences);
    const newIds: Record<string, string> = {};

    // 4. Schedule
    for (const item of items) {
        const title = tRef.current.prayers[item.prayer];
        const body = `${tRef.current.alarm.notificationBody} ${title}`;
        
        const id = await schedulePrayerAlarm(item.prayer, item.time, title, body);
        if (id) {
            newIds[item.key] = id;
        }
    }

    await savePrayerAlarmIds(newIds);
  }, [loaded, location, permissionStatus, preferences, prayers, supported]);

  // Auto-reschedule
  useEffect(() => {
    void reschedule();
  }, [reschedule]);

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
