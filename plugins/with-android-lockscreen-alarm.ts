import {
    type ConfigPlugin,
    withAndroidManifest,
} from "@expo/config-plugins";

/**
 * Expo config plugin for Android alarm/notification enhancements.
 * 
 * Features:
 * - USE_FULL_SCREEN_INTENT: Required for full-screen alarm UI on Android 10+
 * - SCHEDULE_EXACT_ALARM: Required for exact timing on Android 12+ (API 31+)
 * - USE_EXACT_ALARM: Alternative permission for alarm apps on Android 14+ (API 34+)
 * - VIBRATE: For vibration patterns
 * - RECEIVE_BOOT_COMPLETED: To reschedule alarms after device reboot
 * - WAKE_LOCK: To keep device awake during alarm
 * - POST_NOTIFICATIONS: Required for Android 13+ (handled by expo-notifications, but declared for clarity)
 * - MainActivity flags for lockscreen visibility
 *
 * NOTE: This does NOT guarantee a true full-screen intent popup in all OEM/Android versions.
 * Expo-managed apps still depend on what expo-notifications can trigger at runtime.
 * The notification will always show as a fallback (heads-up notification).
 */

interface AndroidManifestPermission {
  $?: {
    "android:name"?: string;
    "android:maxSdkVersion"?: string;
  };
}

interface AndroidManifestActivity {
  $?: {
    "android:name"?: string;
    "android:showWhenLocked"?: string;
    "android:turnScreenOn"?: string;
    "android:showOnLockScreen"?: string;
    [key: string]: string | undefined;
  };
}

const withAndroidLockscreenAlarm: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application?.[0];
    if (!app) return config;

    // Ensure uses-permission exists
    const usesPermissions: AndroidManifestPermission[] = 
      (manifest.manifest["uses-permission"] ??= []);
    
    /**
     * Add permission if not already present
     */
    const ensurePermission = (name: string, maxSdkVersion?: number): void => {
      const exists = usesPermissions.some(
        (p) => p?.$?.["android:name"] === name
      );
      if (!exists) {
        const perm: AndroidManifestPermission = { 
          $: { "android:name": name } 
        };
        if (maxSdkVersion !== undefined && perm.$) {
          perm.$["android:maxSdkVersion"] = String(maxSdkVersion);
        }
        usesPermissions.push(perm);
      }
    };

    // Full-screen intent for alarm UI over lockscreen (Android 10+)
    ensurePermission("android.permission.USE_FULL_SCREEN_INTENT");
    
    // Exact alarm scheduling (Android 12+ / API 31+)
    ensurePermission("android.permission.SCHEDULE_EXACT_ALARM");
    
    // Alternative for alarm apps on Android 14+ (API 34+)
    ensurePermission("android.permission.USE_EXACT_ALARM");
    
    // Vibration for alarm feedback
    ensurePermission("android.permission.VIBRATE");
    
    // Wake lock to keep screen on during alarm
    ensurePermission("android.permission.WAKE_LOCK");
    
    // Receive boot completed to reschedule alarms after reboot
    ensurePermission("android.permission.RECEIVE_BOOT_COMPLETED");
    
    // POST_NOTIFICATIONS for Android 13+ (API 33+)
    ensurePermission("android.permission.POST_NOTIFICATIONS");

    // Find MainActivity and set lockscreen-related flags
    const activities: AndroidManifestActivity[] = app.activity ?? [];
    for (const activity of activities) {
      const activityName = activity?.$?.["android:name"];
      if (
        activityName === ".MainActivity" ||
        activityName === "MainActivity" ||
        (typeof activityName === "string" && activityName.endsWith(".MainActivity"))
      ) {
        if (activity.$) {
          activity.$["android:showWhenLocked"] = "true";
          activity.$["android:turnScreenOn"] = "true";
          activity.$["android:showOnLockScreen"] = "true";
        }
      }
    }

    return config;
  });
};

export default withAndroidLockscreenAlarm;
