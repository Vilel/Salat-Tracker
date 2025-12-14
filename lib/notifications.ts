import type { PrayerName } from "@/lib/prayer-times";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const ALARM_CHANNEL_ID = "salat-alarms";

export type NotificationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined"
  | "unavailable";

/**
 * Expo Go no soporta correctamente expo-notifications (SDK 53+), y puede crashear
 * por side-effects al importar el módulo. En Expo Go deshabilitamos la funcionalidad.
 */
export function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

async function getNotifications() {
  // Lazy import to avoid crashing Expo Go during module evaluation.
  return await import("expo-notifications");
}

/**
 * Initialize notification handler + Android channel (vibration-only).
 */
export async function initNotifications(): Promise<void> {
  if (isExpoGo()) return;

  const Notifications = await getNotifications();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false, // vibration only
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: "Salat Alarms",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      // Keep it silent: no adhan/audio.
      sound: null,
    });
  }
}

/**
 * Request notification permissions.
 * Returns false in Expo Go.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo()) return false;

  const Notifications = await getNotifications();
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (isExpoGo()) return "unavailable";
  const Notifications = await getNotifications();
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * Schedule a local prayer alarm notification (vibration-only).
 */
export async function schedulePrayerAlarm(
  prayerName: PrayerName,
  date: Date,
  title: string,
  body: string
): Promise<string | null> {
  if (isExpoGo()) return null;

  // Only schedule future notifications
  if (date.getTime() <= Date.now()) return null;

  const Notifications = await getNotifications();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { prayerName, type: "prayer_alarm" },
      sound: null,
      vibrate: [0, 250, 250, 250],
    },
    trigger: {
      date,
      channelId: ALARM_CHANNEL_ID,
    },
  });
  return id;
}

export async function cancelAllNotifications(): Promise<void> {
  if (isExpoGo()) return;
  const Notifications = await getNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelScheduledNotification(id: string): Promise<void> {
  if (isExpoGo()) return;
  const Notifications = await getNotifications();
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function checkNotificationPermissions(): Promise<boolean> {
  if (isExpoGo()) return false;
  const Notifications = await getNotifications();
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

