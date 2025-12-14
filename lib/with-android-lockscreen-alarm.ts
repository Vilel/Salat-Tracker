import {
  type ConfigPlugin,
  withAndroidManifest,
} from "@expo/config-plugins";

/**
 * Enables better "alarm-like" behavior on Android by:
 * - Adding USE_FULL_SCREEN_INTENT permission (required on Android 10+ for full-screen intents).
 * - Setting showWhenLocked/turnScreenOn on MainActivity so when the app is opened from a lockscreen
 *   notification, the alarm UI can be shown over the lockscreen.
 *
 * NOTE: This does NOT guarantee a true full-screen intent popup in all OEM/Android versions.
 * Expo-managed apps still depend on what expo-notifications can trigger at runtime.
 */
const withAndroidLockscreenAlarm: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application?.[0];
    if (!app) return config;

    // Ensure uses-permission exists
    const usesPermissions = (manifest.manifest["uses-permission"] ??= []);
    const ensurePermission = (name: string) => {
      const exists = usesPermissions.some(
        (p: any) => p?.$?.["android:name"] === name
      );
      if (!exists) usesPermissions.push({ $: { "android:name": name } });
    };

    ensurePermission("android.permission.USE_FULL_SCREEN_INTENT");

    // Find MainActivity and set lockscreen-related flags
    const activities = app.activity ?? [];
    for (const activity of activities) {
      const activityName = activity?.$?.["android:name"];
      if (
        activityName === ".MainActivity" ||
        activityName === "MainActivity" ||
        (typeof activityName === "string" && activityName.endsWith(".MainActivity"))
      ) {
        activity.$["android:showWhenLocked"] = "true";
        activity.$["android:turnScreenOn"] = "true";
      }
    }

    return config;
  });
};

export default withAndroidLockscreenAlarm;


