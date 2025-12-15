/**
 * Integration tests for the alarm system.
 * 
 * Tests the complete flow:
 * 1. Load preferences
 * 2. Calculate schedule
 * 3. Diff with existing alarms
 * 4. Schedule new alarms
 * 5. Persist alarm IDs
 */

import {
    calculateAlarmDiff,
    cleanupExpiredAlarmIds,
    loadPrayerAlarmIds,
    mergeAlarmIds,
    PRAYER_ALARM_IDS_KEY,
    savePrayerAlarmIds,
} from "@/lib/prayer-alarm-schedule-storage";
import {
    calculateAlarmSchedule,
    type AlarmPreferences,
} from "@/lib/prayer-schedule";
import type { DayPrayers } from "@/lib/prayer-times";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("Alarm System Integration", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  // Helper to create mock prayer times
  function createMockDayPrayers(baseDate: Date): DayPrayers {
    const createTime = (hours: number, minutes: number) => {
      const date = new Date(baseDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    return {
      fajr: { name: "fajr", time: createTime(5, 30), hour: 5, minute: 30 },
      dhuhr: { name: "dhuhr", time: createTime(12, 30), hour: 12, minute: 30 },
      asr: { name: "asr", time: createTime(15, 45), hour: 15, minute: 45 },
      maghrib: { name: "maghrib", time: createTime(18, 15), hour: 18, minute: 15 },
      isha: { name: "isha", time: createTime(20, 0), hour: 20, minute: 0 },
    };
  }

  describe("Full alarm scheduling flow", () => {
    it("should schedule alarms correctly on fresh install", async () => {
      // 1. Start with empty storage (fresh install)
      const existingIds = await loadPrayerAlarmIds();
      expect(existingIds).toEqual({});

      // 2. Calculate schedule
      const now = new Date("2024-01-15T10:00:00");
      const todayPrayers = createMockDayPrayers(new Date("2024-01-15"));
      const tomorrowPrayers = createMockDayPrayers(new Date("2024-01-16"));
      
      const preferences: AlarmPreferences = {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      };

      const schedule = calculateAlarmSchedule(
        now,
        todayPrayers,
        tomorrowPrayers,
        preferences
      );

      // Should have 4 today (dhuhr, asr, maghrib, isha) + 5 tomorrow = 9
      expect(schedule).toHaveLength(9);

      // 3. Calculate diff
      const existingKeys = new Set(Object.keys(existingIds));
      const desiredKeys = new Set(schedule.map((s) => s.key));
      const diff = calculateAlarmDiff(existingKeys, desiredKeys);

      // On fresh install, all should be scheduled
      expect(diff.toCancel).toHaveLength(0);
      expect(diff.toSchedule).toHaveLength(9);
      expect(diff.toKeep).toHaveLength(0);

      // 4. Simulate scheduling (in real code, this calls schedulePrayerAlarm)
      const newIds: Record<string, string> = {};
      for (const item of schedule) {
        newIds[item.key] = `notification-${item.prayer}-${item.time.toISOString()}`;
      }

      // 5. Save alarm IDs
      const mergedIds = mergeAlarmIds(existingIds, diff.toCancel, newIds);
      await savePrayerAlarmIds(mergedIds);

      // Verify persistence
      const savedIds = await loadPrayerAlarmIds();
      expect(Object.keys(savedIds)).toHaveLength(9);
    });

    it("should handle preference toggle correctly", async () => {
      // Setup: Some alarms already scheduled (build keys from the same date helpers
      // to avoid timezone-dependent hardcoding)
      const todayPrayers = createMockDayPrayers(new Date("2024-01-15"));
      const initialIds: Record<string, string> = {
        [`fajr:${todayPrayers.fajr.time.toISOString()}`]: "id1",
        [`dhuhr:${todayPrayers.dhuhr.time.toISOString()}`]: "id2",
        [`asr:${todayPrayers.asr.time.toISOString()}`]: "id3",
      };
      await savePrayerAlarmIds(initialIds);

      // User disables fajr
      const preferences: AlarmPreferences = {
        fajr: false, // Disabled!
        dhuhr: true,
        asr: true,
        maghrib: false,
        isha: false,
      };

      // Calculate new schedule
      const now = new Date("2024-01-15T00:00:00");
      
      const schedule = calculateAlarmSchedule(now, todayPrayers, null, preferences);

      // Should only have dhuhr and asr
      expect(schedule).toHaveLength(2);
      expect(schedule.map((s) => s.prayer)).toEqual(["dhuhr", "asr"]);

      // Calculate diff
      const existingKeys = new Set(Object.keys(initialIds));
      const desiredKeys = new Set(schedule.map((s) => s.key));
      const diff = calculateAlarmDiff(existingKeys, desiredKeys);

      // Fajr should be cancelled
      expect(diff.toCancel).toContain(`fajr:${todayPrayers.fajr.time.toISOString()}`);
      expect(diff.toKeep).toHaveLength(2);
      expect(diff.toSchedule).toHaveLength(0);
    });

    it("should cleanup expired alarms", async () => {
      // Setup: Mix of expired and future alarms
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 2);
      
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const mixedIds: Record<string, string> = {
        [`fajr:${pastDate.toISOString()}`]: "expired-id",
        [`dhuhr:${futureDate.toISOString()}`]: "future-id",
      };

      // Cleanup
      const cleaned = cleanupExpiredAlarmIds(mixedIds);

      // Only future alarm should remain
      expect(Object.keys(cleaned)).toHaveLength(1);
      expect(cleaned[`dhuhr:${futureDate.toISOString()}`]).toBe("future-id");
    });

    it("should handle day transition correctly", async () => {
      // Scenario: It's 23:30, almost midnight
      const today = new Date("2024-01-15");
      const tomorrow = new Date("2024-01-16");
      
      const now = new Date("2024-01-15T23:30:00");
      const todayPrayers = createMockDayPrayers(today);
      const tomorrowPrayers = createMockDayPrayers(tomorrow);

      const preferences: AlarmPreferences = {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      };

      const schedule = calculateAlarmSchedule(
        now,
        todayPrayers,
        tomorrowPrayers,
        preferences
      );

      // All today's prayers have passed (isha was at 20:00)
      // Should only have tomorrow's 5 prayers
      expect(schedule).toHaveLength(5);
      
      // All should be from tomorrow
      for (const item of schedule) {
        expect(item.time.getDate()).toBe(16);
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle empty prayer data gracefully", () => {
      const now = new Date();
      const preferences: AlarmPreferences = {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      };

      const schedule = calculateAlarmSchedule(now, null, null, preferences);

      expect(schedule).toHaveLength(0);
    });

    it("should handle corrupted storage gracefully", async () => {
      // Store invalid data
      await AsyncStorage.setItem(PRAYER_ALARM_IDS_KEY, "not valid json");

      const ids = await loadPrayerAlarmIds();

      // Should return empty object, not throw
      expect(ids).toEqual({});
    });

    it("should handle storage with wrong types", async () => {
      // Store data with wrong types
      await AsyncStorage.setItem(
        PRAYER_ALARM_IDS_KEY,
        JSON.stringify({
          "fajr:2024-01-15": "valid-id",
          "dhuhr:2024-01-15": 123, // Wrong type
          "asr:2024-01-15": null, // Wrong type
          "maghrib:2024-01-15": { nested: "object" }, // Wrong type
        })
      );

      const ids = await loadPrayerAlarmIds();

      // Should only include the valid entry
      expect(ids).toEqual({ "fajr:2024-01-15": "valid-id" });
    });
  });
});
