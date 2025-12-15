/**
 * Tests for prayer-alarm-schedule-storage.ts
 * 
 * Tests cover:
 * - calculateAlarmDiff: Diff algorithm for alarm scheduling
 * - mergeAlarmIds: Merging alarm ID maps
 * - cleanupExpiredAlarmIds: Cleaning expired alarms
 * - loadPrayerAlarmIds / savePrayerAlarmIds: Storage operations
 */

import {
    calculateAlarmDiff,
    cleanupExpiredAlarmIds,
    loadAndCleanupAlarmIds,
    loadPrayerAlarmIds,
    mergeAlarmIds,
    PRAYER_ALARM_IDS_KEY,
    savePrayerAlarmIds,
    type PrayerAlarmIdMap,
} from "@/lib/prayer-alarm-schedule-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("prayer-alarm-schedule-storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe("calculateAlarmDiff", () => {
    it("should identify alarms to cancel when they no longer exist in desired", () => {
      const existing = new Set(["fajr:2024-01-01", "dhuhr:2024-01-01", "asr:2024-01-01"]);
      const desired = new Set(["fajr:2024-01-01", "dhuhr:2024-01-01"]);

      const diff = calculateAlarmDiff(existing, desired);

      expect(diff.toCancel).toEqual(["asr:2024-01-01"]);
      expect(diff.toKeep).toContain("fajr:2024-01-01");
      expect(diff.toKeep).toContain("dhuhr:2024-01-01");
      expect(diff.toSchedule).toEqual([]);
    });

    it("should identify alarms to schedule when they are new", () => {
      const existing = new Set(["fajr:2024-01-01"]);
      const desired = new Set(["fajr:2024-01-01", "dhuhr:2024-01-01", "asr:2024-01-01"]);

      const diff = calculateAlarmDiff(existing, desired);

      expect(diff.toCancel).toEqual([]);
      expect(diff.toKeep).toEqual(["fajr:2024-01-01"]);
      expect(diff.toSchedule).toContain("dhuhr:2024-01-01");
      expect(diff.toSchedule).toContain("asr:2024-01-01");
    });

    it("should handle empty existing set", () => {
      const existing = new Set<string>();
      const desired = new Set(["fajr:2024-01-01", "dhuhr:2024-01-01"]);

      const diff = calculateAlarmDiff(existing, desired);

      expect(diff.toCancel).toEqual([]);
      expect(diff.toKeep).toEqual([]);
      expect(diff.toSchedule).toHaveLength(2);
    });

    it("should handle empty desired set", () => {
      const existing = new Set(["fajr:2024-01-01", "dhuhr:2024-01-01"]);
      const desired = new Set<string>();

      const diff = calculateAlarmDiff(existing, desired);

      expect(diff.toCancel).toHaveLength(2);
      expect(diff.toKeep).toEqual([]);
      expect(diff.toSchedule).toEqual([]);
    });

    it("should handle identical sets", () => {
      const keys = ["fajr:2024-01-01", "dhuhr:2024-01-01"];
      const existing = new Set(keys);
      const desired = new Set(keys);

      const diff = calculateAlarmDiff(existing, desired);

      expect(diff.toCancel).toEqual([]);
      expect(diff.toKeep).toHaveLength(2);
      expect(diff.toSchedule).toEqual([]);
    });
  });

  describe("mergeAlarmIds", () => {
    it("should remove cancelled keys", () => {
      const existing: PrayerAlarmIdMap = {
        "fajr:2024-01-01": "id1",
        "dhuhr:2024-01-01": "id2",
        "asr:2024-01-01": "id3",
      };
      const toRemove = ["asr:2024-01-01"];
      const toAdd: PrayerAlarmIdMap = {};

      const result = mergeAlarmIds(existing, toRemove, toAdd);

      expect(result).toEqual({
        "fajr:2024-01-01": "id1",
        "dhuhr:2024-01-01": "id2",
      });
    });

    it("should add new keys", () => {
      const existing: PrayerAlarmIdMap = {
        "fajr:2024-01-01": "id1",
      };
      const toRemove: string[] = [];
      const toAdd: PrayerAlarmIdMap = {
        "dhuhr:2024-01-01": "id2",
        "asr:2024-01-01": "id3",
      };

      const result = mergeAlarmIds(existing, toRemove, toAdd);

      expect(result).toEqual({
        "fajr:2024-01-01": "id1",
        "dhuhr:2024-01-01": "id2",
        "asr:2024-01-01": "id3",
      });
    });

    it("should handle simultaneous add and remove", () => {
      const existing: PrayerAlarmIdMap = {
        "fajr:2024-01-01": "id1",
        "dhuhr:2024-01-01": "id2",
      };
      const toRemove = ["fajr:2024-01-01"];
      const toAdd: PrayerAlarmIdMap = {
        "fajr:2024-01-02": "id3",
      };

      const result = mergeAlarmIds(existing, toRemove, toAdd);

      expect(result).toEqual({
        "dhuhr:2024-01-01": "id2",
        "fajr:2024-01-02": "id3",
      });
    });

    it("should not mutate original map", () => {
      const existing: PrayerAlarmIdMap = {
        "fajr:2024-01-01": "id1",
      };
      const originalKeys = Object.keys(existing);

      mergeAlarmIds(existing, [], { "dhuhr:2024-01-01": "id2" });

      expect(Object.keys(existing)).toEqual(originalKeys);
    });
  });

  describe("cleanupExpiredAlarmIds", () => {
    it("should keep future alarms", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      
      const alarmIds: PrayerAlarmIdMap = {
        [`fajr:${futureDate.toISOString()}`]: "id1",
      };

      const result = cleanupExpiredAlarmIds(alarmIds);

      expect(Object.keys(result)).toHaveLength(1);
    });

    it("should remove past alarms", () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 2);
      
      const alarmIds: PrayerAlarmIdMap = {
        [`fajr:${pastDate.toISOString()}`]: "id1",
      };

      const result = cleanupExpiredAlarmIds(alarmIds);

      expect(Object.keys(result)).toHaveLength(0);
    });

    it("should keep alarms within 1 minute buffer", () => {
      const recentDate = new Date();
      recentDate.setSeconds(recentDate.getSeconds() - 30);
      
      const alarmIds: PrayerAlarmIdMap = {
        [`fajr:${recentDate.toISOString()}`]: "id1",
      };

      const result = cleanupExpiredAlarmIds(alarmIds);

      expect(Object.keys(result)).toHaveLength(1);
    });

    it("should keep entries with invalid date format", () => {
      const alarmIds: PrayerAlarmIdMap = {
        "invalid-format": "id1",
        "fajr:not-a-date": "id2",
      };

      const result = cleanupExpiredAlarmIds(alarmIds);

      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  describe("loadPrayerAlarmIds", () => {
    it("should return empty object when no data exists", async () => {
      const result = await loadPrayerAlarmIds();
      expect(result).toEqual({});
    });

    it("should load and parse stored data", async () => {
      const data: PrayerAlarmIdMap = {
        "fajr:2024-01-01": "id1",
        "dhuhr:2024-01-01": "id2",
      };
      await AsyncStorage.setItem(PRAYER_ALARM_IDS_KEY, JSON.stringify(data));

      const result = await loadPrayerAlarmIds();

      expect(result).toEqual(data);
    });

    it("should return empty object on invalid JSON", async () => {
      await AsyncStorage.setItem(PRAYER_ALARM_IDS_KEY, "not valid json");

      const result = await loadPrayerAlarmIds();

      expect(result).toEqual({});
    });

    it("should filter out non-string values", async () => {
      const data = {
        "fajr:2024-01-01": "id1",
        "dhuhr:2024-01-01": 123, // Invalid: not a string
        "asr:2024-01-01": null, // Invalid: null
      };
      await AsyncStorage.setItem(PRAYER_ALARM_IDS_KEY, JSON.stringify(data));

      const result = await loadPrayerAlarmIds();

      expect(result).toEqual({ "fajr:2024-01-01": "id1" });
    });
  });

  describe("savePrayerAlarmIds", () => {
    it("should save data to AsyncStorage", async () => {
      const data: PrayerAlarmIdMap = {
        "fajr:2024-01-01": "id1",
        "dhuhr:2024-01-01": "id2",
      };

      await savePrayerAlarmIds(data);

      const stored = await AsyncStorage.getItem(PRAYER_ALARM_IDS_KEY);
      expect(JSON.parse(stored!)).toEqual(data);
    });
  });

  describe("loadAndCleanupAlarmIds", () => {
    it("should clean expired alarms and save", async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 2);
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const data: PrayerAlarmIdMap = {
        [`fajr:${pastDate.toISOString()}`]: "id1",
        [`dhuhr:${futureDate.toISOString()}`]: "id2",
      };
      await AsyncStorage.setItem(PRAYER_ALARM_IDS_KEY, JSON.stringify(data));

      const result = await loadAndCleanupAlarmIds();

      expect(Object.keys(result)).toHaveLength(1);
      expect(result[`dhuhr:${futureDate.toISOString()}`]).toBe("id2");
    });
  });
});
