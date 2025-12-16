import { I18nManager } from "react-native";

/**
 * Small helper to keep RTL checks consistent across the UI.
 * Note: RTL changes require a reload, so this value is effectively static per session.
 */
export function useIsRTL(): boolean {
  return I18nManager.isRTL;
}


