/**
 * Expo config plugin must be resolvable by Node (JS).
 * This JS file is the runtime entry used by `app.json` plugins.
 */

const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * @type {import('@expo/config-plugins').ConfigPlugin}
 */
function withAndroidLockscreenAlarm(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest?.manifest?.application?.[0];
    if (!app) return config;

    // Ensure uses-permission exists
    const usesPermissions = (manifest.manifest["uses-permission"] ??= []);

    /** @param {string} name */
    const ensurePermission = (name) => {
      const exists = usesPermissions.some(
        (p) => p?.$?.["android:name"] === name
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
}

module.exports = withAndroidLockscreenAlarm;
