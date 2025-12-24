import { buildPrayerAlarmSyncPlan } from "@/lib/prayer-alarm-sync";

describe("prayer-alarm-sync", () => {
  it("should cancel duplicates and keep stored ID when it matches", () => {
    const key = "fajr:2024-01-01T05:00:00.000Z";

    const desiredKeys = new Set([key]);
    const storedIds = { [key]: "keep-id" };
    const scheduled = [
      { id: "keep-id", key },
      { id: "dupe-id", key },
    ];

    const plan = buildPrayerAlarmSyncPlan({ desiredKeys, storedIds, scheduled });

    expect(plan.scheduledKeyToId).toEqual({ [key]: "keep-id" });
    expect(plan.idsToCancel).toContain("dupe-id");
    expect(plan.idsToCancel).not.toContain("keep-id");
  });

  it("should cancel stale scheduled alarms that are not desired", () => {
    const desiredKeys = new Set<string>();
    const scheduled = [
      { id: "id1", key: "dhuhr:2024-01-01T12:00:00.000Z" },
      { id: "id2", key: "asr:2024-01-01T15:00:00.000Z" },
    ];

    const plan = buildPrayerAlarmSyncPlan({ desiredKeys, storedIds: {}, scheduled });

    expect(plan.scheduledKeyToId).toEqual({});
    expect(plan.idsToCancel).toEqual(expect.arrayContaining(["id1", "id2"]));
  });

  it("should cancel scheduled alarms that have no derivable key", () => {
    const desiredKeys = new Set(["isha:2024-01-01T20:00:00.000Z"]);
    const scheduled = [
      { id: "unknown-id", key: null },
      { id: "ok-id", key: "isha:2024-01-01T20:00:00.000Z" },
    ];

    const plan = buildPrayerAlarmSyncPlan({ desiredKeys, storedIds: {}, scheduled });

    expect(plan.idsToCancel).toContain("unknown-id");
    expect(plan.scheduledKeyToId).toEqual({
      "isha:2024-01-01T20:00:00.000Z": "ok-id",
    });
  });

  it("should cancel stored IDs for keys that are not desired anymore", () => {
    const desiredKeys = new Set(["asr:2024-01-01T15:00:00.000Z"]);
    const storedIds = {
      "fajr:2024-01-01T05:00:00.000Z": "stale-id",
    };

    const plan = buildPrayerAlarmSyncPlan({ desiredKeys, storedIds, scheduled: [] });

    expect(plan.idsToCancel).toContain("stale-id");
  });
});


