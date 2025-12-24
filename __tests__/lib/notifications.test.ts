/**
 * Tests for notifications.ts
 * 
 * Tests cover:
 * - isExpoGo: Detection of Expo Go environment
 * - schedulePrayerAlarm: Scheduling notifications
 * - cancelScheduledNotification: Cancelling notifications
 * - Permission functions
 */

import {
    cancelScheduledNotification,
    checkNotificationPermissions,
    getAllScheduledPrayerAlarms,
    getNotificationPermissionStatus,
    isExpoGo,
    requestNotificationPermissions,
    schedulePrayerAlarm,
} from "@/lib/notifications";

// Get the mocked module
const mockNotifications = jest.requireMock("expo-notifications");

describe("notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isExpoGo", () => {
    it("should return false when appOwnership is standalone", () => {
      // The mock sets appOwnership to "standalone"
      expect(isExpoGo()).toBe(false);
    });
  });

  describe("schedulePrayerAlarm", () => {
    it("should schedule a notification for future time", async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const id = await schedulePrayerAlarm(
        "fajr",
        futureDate,
        "Fajr",
        "Time for Fajr prayer"
      );

      expect(id).toBe("mock-notification-id");
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
      
      const call = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
      expect(call.content.title).toBe("Fajr");
      expect(call.content.body).toBe("Time for Fajr prayer");
      expect(call.content.data).toEqual({
        prayerName: "fajr",
        type: "prayer_alarm",
      });
    });

    it("should return null for past time", async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const id = await schedulePrayerAlarm(
        "fajr",
        pastDate,
        "Fajr",
        "Time for Fajr prayer"
      );

      expect(id).toBeNull();
      expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it("should include correct trigger configuration", async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      await schedulePrayerAlarm("dhuhr", futureDate, "Dhuhr", "Body");

      const call = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
      expect(call.trigger.type).toBe("date");
      expect(call.trigger.channelId).toBe("salat-alarms");
    });

    it("should handle scheduling errors gracefully", async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValueOnce(
        new Error("Scheduling failed")
      );

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const id = await schedulePrayerAlarm("fajr", futureDate, "Fajr", "Body");

      expect(id).toBeNull();
    });
  });

  describe("getAllScheduledPrayerAlarms", () => {
    it("should return only prayer_alarm notifications and build keys robustly", async () => {
      const fajrIso = "2024-01-01T05:00:00.000Z";
      const dhuhrIso = "2024-01-01T12:00:00.000Z";
      const asrIso = "2024-01-01T15:00:00.000Z";

      mockNotifications.getAllScheduledNotificationsAsync.mockResolvedValueOnce([
        {
          identifier: "id1",
          content: { data: { type: "prayer_alarm", prayerName: "fajr" } },
          trigger: { date: new Date(fajrIso).getTime() },
        },
        {
          identifier: "id2",
          content: { data: { type: "other", prayerName: "dhuhr" } },
          trigger: { date: new Date(dhuhrIso).getTime() },
        },
        {
          identifier: "id3",
          content: { data: { type: "prayer_alarm", prayerName: "dhuhr" } },
          trigger: { date: dhuhrIso },
        },
        {
          identifier: "id4",
          content: { data: { type: "prayer_alarm", prayerName: "asr" } },
          trigger: { date: new Date(asrIso) },
        },
        {
          identifier: "id5",
          content: { data: { type: "prayer_alarm" } },
          trigger: { date: new Date(asrIso).getTime() },
        },
      ]);

      const result = await getAllScheduledPrayerAlarms();

      expect(result).toHaveLength(4);
      expect(result.find((x) => x.id === "id1")?.key).toBe(`fajr:${fajrIso}`);
      expect(result.find((x) => x.id === "id3")?.key).toBe(`dhuhr:${dhuhrIso}`);
      expect(result.find((x) => x.id === "id4")?.key).toBe(`asr:${asrIso}`);
      expect(result.find((x) => x.id === "id5")?.key).toBeNull();
    });
  });

  describe("cancelScheduledNotification", () => {
    it("should cancel a notification by ID", async () => {
      await cancelScheduledNotification("test-id");

      expect(
        mockNotifications.cancelScheduledNotificationAsync
      ).toHaveBeenCalledWith("test-id");
    });
  });

  describe("getNotificationPermissionStatus", () => {
    it("should return granted when permissions are granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "granted",
      });

      const status = await getNotificationPermissionStatus();

      expect(status).toBe("granted");
    });

    it("should return denied when permissions are denied", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "denied",
      });

      const status = await getNotificationPermissionStatus();

      expect(status).toBe("denied");
    });
  });

  describe("requestNotificationPermissions", () => {
    it("should return true when already granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "granted",
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it("should request permissions when not granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "undetermined",
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValueOnce({
        status: "granted",
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it("should return false when request is denied", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "undetermined",
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValueOnce({
        status: "denied",
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });
  });

  describe("checkNotificationPermissions", () => {
    it("should return true when granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "granted",
      });

      const result = await checkNotificationPermissions();

      expect(result).toBe(true);
    });

    it("should return false when not granted", async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({
        status: "denied",
      });

      const result = await checkNotificationPermissions();

      expect(result).toBe(false);
    });
  });
});
