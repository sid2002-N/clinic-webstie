import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_ID = "habitspark_daily_reminder";
export const NOTIF_HOUR_KEY = "habitspark_notification_hour";

export async function getNotificationHour(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(NOTIF_HOUR_KEY);
    return val ? parseInt(val, 10) : 20;
  } catch {
    return 20;
  }
}

export async function scheduleHabitReminder(hour: number): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const Notifications = await import("expo-notifications");

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    await Notifications.cancelScheduledNotificationAsync(
      NOTIFICATION_ID
    ).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_ID,
      content: {
        title: "HabitSpark 🔥",
        body: "Don't forget to check in on your habits today!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });

    await AsyncStorage.setItem(NOTIF_HOUR_KEY, String(hour));
  } catch {
    // Notifications unavailable in this environment
  }
}

export async function setupInitialNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const Notifications = await import("expo-notifications");

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    const hour = await getNotificationHour();
    await scheduleHabitReminder(hour);
  } catch {
    // Notifications unavailable
  }
}
