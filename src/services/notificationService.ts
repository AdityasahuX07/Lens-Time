import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  async scheduleRecleanNotification(targetTimeHours: number): Promise<string | null> {
    try {
      const halfTargetSeconds = (targetTimeHours / 2) * 3600;

      // Check if we're already past the half target time
      const elapsedSeconds = 0; // This will be calculated by the caller if needed

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to Reclean',
          body: `You have reached ${targetTimeHours / 2}h of wear. Clen lenses for crystal vision`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  isQuietHours(): boolean {
    const currentHour = new Date().getHours();
    // Quiet hours: 9 PM (21:00) to 4 AM (4:00)
    return currentHour >= 21 || currentHour < 4;
  },

  async checkAndScheduleNotification(
    elapsedSeconds: number,
    targetTimeHours: number,
    notificationId: string | null,
    notificationsEnabled: boolean
  ): Promise<string | null> {
    if (!notificationsEnabled) {
      return null;
    }

    const halfTargetSeconds = (targetTimeHours / 2) * 3600;

    // Check if we've reached half target time
    if (elapsedSeconds >= halfTargetSeconds && !notificationId && !this.isQuietHours()) {
      // Schedule immediate notification
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Time to Reclean',
          body: `You have reached ${targetTimeHours / 2} hours of wear time. Consider recleaning your lenses.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Immediate notification
      });

      return id;
    }

    return notificationId;
  },
};