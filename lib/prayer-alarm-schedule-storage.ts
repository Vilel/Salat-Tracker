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

/**
 * Result of comparing existing scheduled alarms with desired alarms.
 * Used for efficient rescheduling (only cancel/schedule what changed).
 */
export interface AlarmDiff {
  /** Keys of alarms to cancel (exist but no longer needed) */
  toCancel: string[];
  /** Keys of alarms to schedule (needed but don't exist) */
  toSchedule: string[];
  /** Keys of alarms to keep (already scheduled correctly) */
  toKeep: string[];
}

/**
 * Calculate the diff between existing scheduled alarms and desired alarms.
 * 
 * @param existingKeys - Keys currently scheduled (from storage)
 * @param desiredKeys - Keys that should be scheduled (from schedule calculation)
 * @returns Diff object with arrays of keys to cancel, schedule, and keep
 */
export function calculateAlarmDiff(
  existingKeys: Set<string>,
  desiredKeys: Set<string>
): AlarmDiff {
  const toCancel: string[] = [];
  const toSchedule: string[] = [];
  const toKeep: string[] = [];

  // Find alarms to cancel (exist but not desired)
  for (const key of existingKeys) {
    if (desiredKeys.has(key)) {
      toKeep.push(key);
    } else {
      toCancel.push(key);
    }
  }

  // Find alarms to schedule (desired but don't exist)
  for (const key of desiredKeys) {
    if (!existingKeys.has(key)) {
      toSchedule.push(key);
    }
  }

  return { toCancel, toSchedule, toKeep };
}

/**
 * Merge existing alarm IDs with new ones, removing cancelled keys.
 * 
 * @param existing - Current alarm ID map
 * @param toRemove - Keys to remove
 * @param toAdd - New key-ID pairs to add
 * @returns Merged alarm ID map
 */
export function mergeAlarmIds(
  existing: PrayerAlarmIdMap,
  toRemove: string[],
  toAdd: PrayerAlarmIdMap
): PrayerAlarmIdMap {
  const result: PrayerAlarmIdMap = { ...existing };
  
  // Remove cancelled
  for (const key of toRemove) {
    delete result[key];
  }
  
  // Add new
  for (const [key, id] of Object.entries(toAdd)) {
    result[key] = id;
  }
  
  return result;
}

/**
 * Remove alarm IDs for prayers that have already passed.
 * Keys are in format "prayerName:ISO_DATE", so we can parse the date.
 * 
 * @param alarmIds - Current alarm ID map
 * @returns Cleaned map with only future alarms
 */
export function cleanupExpiredAlarmIds(alarmIds: PrayerAlarmIdMap): PrayerAlarmIdMap {
  const now = Date.now();
  const result: PrayerAlarmIdMap = {};
  
  for (const [key, id] of Object.entries(alarmIds)) {
    // Key format: "prayerName:ISO_DATE"
    const parts = key.split(":");
    if (parts.length >= 2) {
      // Join all parts after first colon (in case ISO date has colons)
      const dateStr = parts.slice(1).join(":");
      const date = new Date(dateStr);
      const time = date.getTime();
      // If parsing fails (Invalid Date => NaN), keep entry to be safe.
      if (!Number.isFinite(time)) {
        result[key] = id;
        continue;
      }
      // Keep if the alarm is in the future (with 1 minute buffer)
      if (time > now - 60000) {
        result[key] = id;
      }
    } else {
      // Invalid format, keep to be safe
      result[key] = id;
    }
  }
  
  return result;
}

/**
 * Load and clean expired alarm IDs from storage.
 * Saves cleaned version back to storage if any were removed.
 * 
 * @returns Cleaned alarm ID map
 */
export async function loadAndCleanupAlarmIds(): Promise<PrayerAlarmIdMap> {
  const existing = await loadPrayerAlarmIds();
  const cleaned = cleanupExpiredAlarmIds(existing);
  
  // Only save if something was cleaned
  if (Object.keys(existing).length !== Object.keys(cleaned).length) {
    await savePrayerAlarmIds(cleaned);
  }
  
  return cleaned;
}


