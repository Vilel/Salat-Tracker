import { loadAlarmDayPrayersCache, saveAlarmDayPrayersCache } from "./alarm-day-prayers-cache";
import { fetchPrayerTimesFromAPI, PRAYER_ORDER, type DayPrayers, type LocationData, type PrayerName } from "./prayer-times";

const METHOD = 2; // Fixed method for now

export type AlarmPreferences = Record<PrayerName, boolean>;

export async function getPrayersForDate(
    date: Date,
    location: Pick<LocationData, "latitude" | "longitude">
): Promise<DayPrayers> {
    const cached = await loadAlarmDayPrayersCache(date, location, METHOD, 3);
    if (cached) return cached;

    const fresh = await fetchPrayerTimesFromAPI(location.latitude, location.longitude, date);
    await saveAlarmDayPrayersCache(date, location, METHOD, fresh);
    return fresh;
}

export interface AlarmScheduleItem {
    prayer: PrayerName;
    time: Date;
    key: string; // unique key for the alarm
}

export function calculateAlarmSchedule(
    now: Date,
    todayPrayers: DayPrayers | null,
    tomorrowPrayers: DayPrayers | null,
    preferences: Record<PrayerName, boolean>
): AlarmScheduleItem[] {
    const items: AlarmScheduleItem[] = [];

    if (todayPrayers) {
        const remainingToday = PRAYER_ORDER.filter(
            (p) => todayPrayers[p].time.getTime() > now.getTime()
        );

        for (const p of remainingToday) {
            if (preferences[p]) {
                items.push({
                    prayer: p,
                    time: todayPrayers[p].time,
                    key: `${p}:${todayPrayers[p].time.toISOString()}`,
                });
            }
        }
    }

    if (tomorrowPrayers) {
        for (const p of PRAYER_ORDER) {
            if (preferences[p]) {
                items.push({
                    prayer: p,
                    time: tomorrowPrayers[p].time,
                    key: `${p}:${tomorrowPrayers[p].time.toISOString()}`,
                });
            }
        }
    }

    return items;
}
