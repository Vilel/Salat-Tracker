import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import { initNotifications, isExpoGo } from "@/lib/notifications";

type NotificationData = {
  type?: string;
  prayerName?: string;
};

/**
 * Hook that manages notification listeners for prayer alarms.
 * 
 * Responsibilities:
 * 1. Initialize notification handler on mount
 * 2. Listen for notification responses (user tapped notification)
 * 3. Listen for received notifications (app in foreground)
 * 4. Navigate to alarm screen when appropriate
 * 
 * Fallback behavior:
 * - If the alarm screen can't be opened, the notification itself serves as fallback
 * - The notification is configured with high priority and always shows as alert
 */
export function useNotificationListener(): void {
  const router = useRouter();
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    // Skip in Expo Go to avoid crashes
    if (isExpoGo()) return;

    let responseSubscription: { remove: () => void } | null = null;
    let receivedSubscription: { remove: () => void } | null = null;
    let isMounted = true;

    const setup = async () => {
      try {
        // Initialize notification handler
        await initNotifications();

        // Lazy import to avoid crashing Expo Go
        const Notifications = await import("expo-notifications");

        /**
         * Navigate to alarm screen if the notification is a prayer alarm.
         * Prevents duplicate navigations with a ref guard.
         */
        const openAlarmIfNeeded = (data: NotificationData | undefined | null) => {
          if (!isMounted) return;
          if (!data?.type || data.type !== "prayer_alarm") return;
          if (!data.prayerName) return;

          // Prevent duplicate navigations
          if (isNavigatingRef.current) return;
          isNavigatingRef.current = true;

          try {
            router.push({
              pathname: "/alarm",
              params: { prayerName: data.prayerName },
            });
          } catch (e) {
            console.warn("Failed to navigate to alarm screen:", e);
            // Navigation failed, but notification is still visible as fallback
          } finally {
            // Reset navigation guard after a short delay
            setTimeout(() => {
              if (isMounted) {
                isNavigatingRef.current = false;
              }
            }, 1000);
          }
        };

        // Handle notification tap (app was in background/closed)
        responseSubscription = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const data = response.notification.request.content.data as NotificationData | undefined;
            openAlarmIfNeeded(data);
          }
        );

        // Handle notification received while app is in foreground
        // The notification will ALSO show as alert (fallback), but we try to open the alarm screen
        receivedSubscription = Notifications.addNotificationReceivedListener(
          (notification) => {
            const data = notification.request.content.data as NotificationData | undefined;
            openAlarmIfNeeded(data);
          }
        );

        // Check if app was opened from a notification (cold start)
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          const data = lastResponse.notification.request.content.data as NotificationData | undefined;
          openAlarmIfNeeded(data);
        }
      } catch (e) {
        console.warn("Failed to setup notification listeners:", e);
      }
    };

    void setup();

    return () => {
      isMounted = false;
      responseSubscription?.remove();
      receivedSubscription?.remove();
    };
  }, [router]);
}
