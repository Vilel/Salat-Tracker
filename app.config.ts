import type { ConfigContext, ExpoConfig } from "expo/config";

import {
    type ConfigPlugin,
    withAndroidManifest,
} from "@expo/config-plugins";

/**
 * Android config plugin (TypeScript) for better alarm/lockscreen behavior.
 *
 * NOTE: This is applied from `app.config.ts` to avoid `require()`-ing TypeScript
 * plugins directly from `app.json`.
 */
const withAndroidLockscreenAlarm: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    // The AndroidManifest JSON shape is not strongly typed in a way that's
    // pleasant to work with here. We treat it as unknown and mutate safely.
    const manifest = config.modResults as unknown as {
      manifest?: {
        ["uses-permission"]?: Array<{ $?: { "android:name"?: string } }>;
        application?: Array<{ activity?: Array<{ $?: Record<string, string> }> }>;
      };
    };
    const app = manifest.manifest?.application?.[0];
    if (!app) return config;

    const usesPermissions = (manifest.manifest!["uses-permission"] ??= []);

    const ensurePermission = (name: string) => {
      const exists = usesPermissions.some(
        (p: { $?: { "android:name"?: string } }) => p?.$?.["android:name"] === name
      );
      if (!exists) usesPermissions.push({ $: { "android:name": name } });
    };

    ensurePermission("android.permission.USE_FULL_SCREEN_INTENT");
    ensurePermission("android.permission.SCHEDULE_EXACT_ALARM");
    ensurePermission("android.permission.USE_EXACT_ALARM");
    ensurePermission("android.permission.VIBRATE");
    ensurePermission("android.permission.WAKE_LOCK");
    ensurePermission("android.permission.RECEIVE_BOOT_COMPLETED");
    ensurePermission("android.permission.POST_NOTIFICATIONS");

    const activities = app.activity ?? [];
    for (const activity of activities) {
      const activityName = activity?.$?.["android:name"];
      if (
        activityName === ".MainActivity" ||
        activityName === "MainActivity" ||
        (typeof activityName === "string" && activityName.endsWith(".MainActivity"))
      ) {
        activity.$ ??= {};
        activity.$["android:showWhenLocked"] = "true";
        activity.$["android:turnScreenOn"] = "true";
        activity.$["android:showOnLockScreen"] = "true";
      }
    }

    return config;
  });
};

export default ({ config }: ConfigContext): ExpoConfig => {
  // `config` can be partially defined in the ConfigContext.
  // Ensure required fields exist for ExpoConfig typing.
  const name = config.name ?? "salat-app";
  const slug = config.slug ?? "salat-app";

  return {
    ...config,
    name,
    slug,
    plugins: [
      ...(config.plugins ?? []),
      withAndroidLockscreenAlarm,
    ] as unknown as ExpoConfig["plugins"],
  };
};
