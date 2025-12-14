import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredLocationMode = "auto" | "default";

export const LOCATION_MODE_KEY = "@salat_location_mode_v1";

const DEFAULT_MODE: StoredLocationMode = "auto";

function isStoredLocationMode(value: unknown): value is StoredLocationMode {
  return value === "auto" || value === "default";
}

export async function loadStoredLocationMode(): Promise<StoredLocationMode> {
  try {
    const raw = await AsyncStorage.getItem(LOCATION_MODE_KEY);
    if (!raw) return DEFAULT_MODE;
    return isStoredLocationMode(raw) ? raw : DEFAULT_MODE;
  } catch (error) {
    console.warn("Failed to load location mode:", error);
    return DEFAULT_MODE;
  }
}

export async function saveStoredLocationMode(
  mode: StoredLocationMode
): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCATION_MODE_KEY, mode);
  } catch (error) {
    console.warn("Failed to save location mode:", error);
  }
}


