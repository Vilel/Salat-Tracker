import type { PrayerAlarmIdMap } from "@/lib/prayer-alarm-schedule-storage";

export type ScheduledPrayerAlarm = {
  id: string;
  /**
   * Unique key in the same format we persist in storage: `${prayerName}:${ISO_DATE}`.
   * Null when we can't derive it (missing/invalid prayerName or trigger date).
   */
  key: string | null;
};

export type PrayerAlarmSyncPlan = {
  /**
   * Notification IDs to cancel to remove duplicates and stale alarms.
   * May include IDs not currently scheduled (cancellation should be best-effort).
   */
  idsToCancel: string[];
  /**
   * Key -> ID map for alarms that are already scheduled and should be considered "existing".
   * This is the deduped source of truth after sync.
   */
  scheduledKeyToId: Record<string, string>;
};

/**
 * Build a plan to reconcile scheduled prayer alarms with the desired schedule.
 *
 * Goal:
 * - If multiple scheduled notifications exist for the same key, keep only one.
 * - If an alarm is not desired for the current schedule, cancel it.
 * - Prefer keeping the ID already persisted in storage when it matches one of the scheduled IDs.
 */
export function buildPrayerAlarmSyncPlan(params: {
  desiredKeys: Set<string>;
  storedIds: PrayerAlarmIdMap;
  scheduled: ScheduledPrayerAlarm[];
}): PrayerAlarmSyncPlan {
  const { desiredKeys, storedIds, scheduled } = params;

  const idsToCancel = new Set<string>();
  const scheduledKeyToId: Record<string, string> = {};

  // Group scheduled alarms by key (skip those without a key; cancel them).
  const byKey = new Map<string, string[]>();
  for (const item of scheduled) {
    if (!item.key) {
      idsToCancel.add(item.id);
      continue;
    }
    const list = byKey.get(item.key) ?? [];
    list.push(item.id);
    byKey.set(item.key, list);
  }

  // Cancel anything we have stored that is not desired anymore.
  // (This also helps recover from storage/system drift.)
  for (const [key, id] of Object.entries(storedIds)) {
    if (!desiredKeys.has(key)) {
      idsToCancel.add(id);
    }
  }

  // For each scheduled key, decide whether to keep or cancel.
  for (const [key, ids] of byKey.entries()) {
    if (!desiredKeys.has(key)) {
      for (const id of ids) idsToCancel.add(id);
      continue;
    }

    const preferred = storedIds[key];
    const keepId =
      preferred && ids.includes(preferred)
        ? preferred
        : ids[0];

    scheduledKeyToId[key] = keepId;
    for (const id of ids) {
      if (id !== keepId) idsToCancel.add(id);
    }
  }

  return {
    idsToCancel: Array.from(idsToCancel),
    scheduledKeyToId,
  };
}


