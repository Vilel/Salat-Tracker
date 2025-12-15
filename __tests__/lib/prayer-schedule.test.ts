/**
 * Tests for prayer-schedule.ts
 * 
 * Tests cover:
 * - calculateAlarmSchedule: Schedule calculation with preferences
 */

import {
    calculateAlarmSchedule,
    type AlarmPreferences
} from "@/lib/prayer-schedule";
import type { DayPrayers } from "@/lib/prayer-times";

// Helper to create mock prayer times
function createMockDayPrayers(baseDate: Date): DayPrayers {
  const createTime = (hours: number, minutes: number) => {
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  return {
    fajr: {
      name: "fajr",
      time: createTime(5, 30),
      hour: 5,
      minute: 30,
    },
    dhuhr: {
      name: "dhuhr",
      time: createTime(12, 30),
      hour: 12,
      minute: 30,
    },
    asr: {
      name: "asr",
      time: createTime(15, 45),
      hour: 15,
      minute: 45,
    },
    maghrib: {
      name: "maghrib",
      time: createTime(18, 15),
      hour: 18,
      minute: 15,
    },
    isha: {
      name: "isha",
      time: createTime(20, 0),
      hour: 20,
      minute: 0,
    },
  };
}

describe("prayer-schedule", () => {
  describe("calculateAlarmSchedule", () => {
    const allEnabled: AlarmPreferences = {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    };

    const allDisabled: AlarmPreferences = {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    };

    it("should schedule remaining prayers for today", () => {
      const baseDate = new Date("2024-01-15");
      const todayPrayers = createMockDayPrayers(baseDate);
      
      // Set "now" to 10:00 AM - fajr passed, rest remaining
      const now = new Date(baseDate);
      now.setHours(10, 0, 0, 0);

      const result = calculateAlarmSchedule(now, todayPrayers, null, allEnabled);

      // Should have dhuhr, asr, maghrib, isha (4 prayers)
      expect(result).toHaveLength(4);
      expect(result.map((r) => r.prayer)).toEqual(["dhuhr", "asr", "maghrib", "isha"]);
    });

    it("should schedule all prayers for tomorrow", () => {
      const baseDate = new Date("2024-01-15");
      const tomorrowDate = new Date("2024-01-16");
      const tomorrowPrayers = createMockDayPrayers(tomorrowDate);
      
      // Set "now" to 23:00 - all today prayers passed
      const now = new Date(baseDate);
      now.setHours(23, 0, 0, 0);

      const result = calculateAlarmSchedule(now, null, tomorrowPrayers, allEnabled);

      // Should have all 5 prayers for tomorrow
      expect(result).toHaveLength(5);
      expect(result.map((r) => r.prayer)).toEqual([
        "fajr",
        "dhuhr",
        "asr",
        "maghrib",
        "isha",
      ]);
    });

    it("should combine today remaining and tomorrow prayers", () => {
      const baseDate = new Date("2024-01-15");
      const tomorrowDate = new Date("2024-01-16");
      const todayPrayers = createMockDayPrayers(baseDate);
      const tomorrowPrayers = createMockDayPrayers(tomorrowDate);
      
      // Set "now" to 16:00 - fajr, dhuhr, asr passed
      const now = new Date(baseDate);
      now.setHours(16, 0, 0, 0);

      const result = calculateAlarmSchedule(
        now,
        todayPrayers,
        tomorrowPrayers,
        allEnabled
      );

      // Should have maghrib, isha (today) + 5 (tomorrow) = 7
      expect(result).toHaveLength(7);
      
      // First two should be today's remaining
      expect(result[0].prayer).toBe("maghrib");
      expect(result[1].prayer).toBe("isha");
      
      // Rest should be tomorrow
      expect(result[2].prayer).toBe("fajr");
    });

    it("should respect preferences", () => {
      const baseDate = new Date("2024-01-15");
      const todayPrayers = createMockDayPrayers(baseDate);
      
      // Only enable fajr and isha
      const preferences: AlarmPreferences = {
        fajr: true,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: true,
      };
      
      // Set "now" to 00:00 - all prayers are in the future
      const now = new Date(baseDate);
      now.setHours(0, 0, 0, 0);

      const result = calculateAlarmSchedule(now, todayPrayers, null, preferences);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.prayer)).toEqual(["fajr", "isha"]);
    });

    it("should return empty array when all preferences are disabled", () => {
      const baseDate = new Date("2024-01-15");
      const todayPrayers = createMockDayPrayers(baseDate);
      
      const now = new Date(baseDate);
      now.setHours(0, 0, 0, 0);

      const result = calculateAlarmSchedule(now, todayPrayers, null, allDisabled);

      expect(result).toHaveLength(0);
    });

    it("should handle null prayers gracefully", () => {
      const now = new Date();
      
      const result = calculateAlarmSchedule(now, null, null, allEnabled);

      expect(result).toHaveLength(0);
    });

    it("should generate unique keys for each alarm", () => {
      const baseDate = new Date("2024-01-15");
      const tomorrowDate = new Date("2024-01-16");
      const todayPrayers = createMockDayPrayers(baseDate);
      const tomorrowPrayers = createMockDayPrayers(tomorrowDate);
      
      const now = new Date(baseDate);
      now.setHours(0, 0, 0, 0);

      const result = calculateAlarmSchedule(
        now,
        todayPrayers,
        tomorrowPrayers,
        allEnabled
      );

      const keys = result.map((r) => r.key);
      const uniqueKeys = new Set(keys);
      
      // All keys should be unique
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it("should include correct time in alarm items", () => {
      const baseDate = new Date("2024-01-15");
      const todayPrayers = createMockDayPrayers(baseDate);
      
      const now = new Date(baseDate);
      now.setHours(0, 0, 0, 0);

      const result = calculateAlarmSchedule(now, todayPrayers, null, allEnabled);

      const fajrAlarm = result.find((r) => r.prayer === "fajr");
      expect(fajrAlarm).toBeDefined();
      expect(fajrAlarm!.time.getHours()).toBe(5);
      expect(fajrAlarm!.time.getMinutes()).toBe(30);
    });
  });
});
