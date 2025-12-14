import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Stores IDs of scheduled local notifications that belong to prayer alarms,
 * so we can cancel only our own scheduled notifications (not all notifications).
 */
export const PRAYER_ALARM_IDS_KEY = "@salat_prayer_alarm_ids_v1";

export type PrayerAlarmIdMap = Record<string, string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function loadPrayerAlarmIds(): Promise<PrayerAlarmIdMap> {
  try {
    const raw = await AsyncStorage.getItem(PRAYER_ALARM_IDS_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return {};

    const out: PrayerAlarmIdMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  } catch (e) {
    console.warn("Failed to load prayer alarm ids:", e);
    return {};
  }
}

export async function savePrayerAlarmIds(map: PrayerAlarmIdMap): Promise<void> {
  try {
    await AsyncStorage.setItem(PRAYER_ALARM_IDS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Failed to save prayer alarm ids:", e);
  }
}

export async function clearPrayerAlarmIds(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PRAYER_ALARM_IDS_KEY);
  } catch (e) {
    console.warn("Failed to clear prayer alarm ids:", e);
  }
}


