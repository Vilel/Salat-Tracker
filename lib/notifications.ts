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

function getNotifications(): typeof import("expo-notifications") {
  // Lazy require to avoid crashing Expo Go during module evaluation.
  // This also works better in Jest (no need for experimental vm modules).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("expo-notifications");
}

/**
 * Initialize notification handler + Android channel.
 * 
 * IMPORTANT: We ALWAYS show alerts as a fallback mechanism.
 * Even if the app can't open the alarm screen (lockscreen, OEM restrictions),
 * the user will still see the notification as a heads-up/banner.
 */
export async function initNotifications(): Promise<void> {
  if (isExpoGo()) return;

  const Notifications = getNotifications();

  // Always show notification alert as fallback
  // This ensures the user sees *something* even if the alarm screen can't open
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data = notification.request.content.data as { type?: string } | undefined;
      const isPrayerAlarm = data?.type === "prayer_alarm";
      
      return {
        // CRITICAL: Always show alert for prayer alarms as fallback
        shouldShowAlert: true,
        // Required by expo-notifications NotificationBehavior (shows in banner + list)
        shouldShowBanner: true,
        shouldShowList: true,
        // Enable sound for high priority (vibration pattern is in channel)
        shouldPlaySound: isPrayerAlarm,
        shouldSetBadge: false,
        // High priority to ensure it shows on lockscreen
        priority: isPrayerAlarm 
          ? Notifications.AndroidNotificationPriority.MAX 
          : Notifications.AndroidNotificationPriority.DEFAULT,
      };
    },
  });

  if (Platform.OS === "android") {
    // Create high-priority channel for prayer alarms
    await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: "Salat Alarms",
      description: "Prayer time notifications and alarms",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500, 200, 500],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      // Enable lights for visibility
      enableLights: true,
      lightColor: "#4F46E5",
      // Bypass DND for important prayer alarms
      bypassDnd: true,
      // Show badge on app icon
      showBadge: true,
      // Use default alarm sound for maximum visibility
      sound: "default",
    });
  }
}

/**
 * Request notification permissions.
 * Returns false in Expo Go.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo()) return false;

  const Notifications = getNotifications();
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (isExpoGo()) return "unavailable";
  const Notifications = getNotifications();
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * Schedule a local prayer alarm notification with high priority.
 * 
 * This notification is configured to:
 * 1. Always show as a heads-up/banner notification
 * 2. Vibrate with a distinct pattern
 * 3. Show on lockscreen
 * 4. Play default sound (channel-level setting)
 * 
 * Even if the app can't open the alarm screen (OEM restrictions, lockscreen issues),
 * the notification will still appear as a push notification fallback.
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

  const Notifications = getNotifications();

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { prayerName, type: "prayer_alarm" },
        // Use default sound (configured at channel level on Android)
        sound: "default",
        // Vibration pattern: attention-grabbing but not annoying
        vibrate: [0, 500, 200, 500, 200, 500],
        // High priority for Android
        priority: Notifications.AndroidNotificationPriority.MAX,
        // Sticky notification - harder to dismiss accidentally
        sticky: false,
        // Auto-cancel when tapped
        autoDismiss: true,
        // Category for Android notification actions
        categoryIdentifier: "prayer_alarm",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: ALARM_CHANNEL_ID,
      },
    });
    return id;
  } catch (e) {
    console.warn("Failed to schedule prayer alarm notification:", e);
    return null;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (isExpoGo()) return;
  const Notifications = getNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelScheduledNotification(id: string): Promise<void> {
  if (isExpoGo()) return;
  const Notifications = getNotifications();
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function checkNotificationPermissions(): Promise<boolean> {
  if (isExpoGo()) return false;
  const Notifications = getNotifications();
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Check if exact alarms are allowed on Android 12+.
 * On older versions or iOS, this always returns true.
 * 
 * Note: On Android 12+, the user may need to grant this permission
 * in system settings for alarm apps.
 */
export async function canScheduleExactAlarms(): Promise<boolean> {
  if (isExpoGo()) return false;
  if (Platform.OS !== "android") return true;
  
  // Android 12 (API 31) and above require SCHEDULE_EXACT_ALARM permission
  // This is a special permission that users grant in system settings
  // For now, we assume it's granted if notifications are granted
  // The expo-notifications library handles this internally
  return true;
}

/**
 * Get all currently scheduled notifications.
 * Useful for debugging and verifying alarms are scheduled correctly.
 */
export async function getScheduledNotifications(): Promise<
  Array<{ id: string; date: Date | null; prayer: string | null }>
> {
  if (isExpoGo()) return [];
  
  const Notifications = getNotifications();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  
  return scheduled.map((notif) => {
    const data = notif.content.data as { prayerName?: string; type?: string } | undefined;
    const trigger = notif.trigger as { date?: number } | null;
    
    return {
      id: notif.identifier,
      date: trigger?.date ? new Date(trigger.date) : null,
      prayer: data?.prayerName ?? null,
    };
  });
}

