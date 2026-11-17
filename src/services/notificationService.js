import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Cấu hình cách thông báo được xử lý khi app đang mở
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Yêu cầu quyền thông báo
export async function registerForPushNotificationsAsync() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Nhắc nhở thói quen',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return false;
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

// Lên lịch thông báo nhắc nhở cho một thói quen
export async function scheduleHabitReminder(habit) {
  // Kiểm tra nếu habit không có reminderTime hoặc không active
  if (!habit || !habit.reminderTime || !habit.active || typeof habit.reminderTime !== 'string' || habit.reminderTime.trim() === '') {
    return null;
  }

  // Kiểm tra quyền thông báo
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  // Parse thời gian (format: "HH:MM")
  const timeParts = habit.reminderTime.trim().split(':');
  if (timeParts.length !== 2) {
    return null;
  }

  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  // Hủy thông báo cũ nếu có (sử dụng habit.id)
  await cancelHabitReminder(habit.id);

  // Tạo identifier duy nhất cho thông báo
  const notificationId = `habit_${habit.id}`;

  // Lên lịch thông báo hàng ngày
  try {
    // Thử cả hai cách: Date trigger và hour/minute trigger
    // Cách 1: Dùng hour/minute (chuẩn cho daily repeat)
    let notificationIdResult;
    try {
      notificationIdResult = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Nhắc nhở thói quen',
          body: `Đã đến giờ thực hiện: ${habit.name} ${habit.icon}`,
          sound: true,
          data: { habitId: habit.id, habitName: habit.name },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
        identifier: notificationId,
      });
    } catch (error) {
      // Thử cách 2: Date trigger
      const now = new Date();
      const triggerDateTime = new Date(now);
      triggerDateTime.setHours(hours);
      triggerDateTime.setMinutes(minutes);
      triggerDateTime.setSeconds(0);
      if (triggerDateTime <= now) {
        triggerDateTime.setDate(triggerDateTime.getDate() + 1);
      }
      
      notificationIdResult = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Nhắc nhở thói quen',
          body: `Đã đến giờ thực hiện: ${habit.name} ${habit.icon}`,
          sound: true,
          data: { habitId: habit.id, habitName: habit.name },
        },
        trigger: triggerDateTime,
        identifier: notificationId,
      });
    }
    
    return notificationIdResult;
  } catch (error) {
    return null;
  }
}

// Hủy thông báo nhắc nhở cho một thói quen
export async function cancelHabitReminder(habitId) {
  try {
    const identifier = `habit_${habitId}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    // Silent fail
  }
}

// Hủy tất cả thông báo đã lên lịch
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    // Silent fail
  }
}

// Lên lịch lại tất cả thông báo cho danh sách thói quen
export async function rescheduleAllHabitReminders(habits) {
  // Hủy tất cả thông báo cũ
  await cancelAllNotifications();
  
  // Lên lịch lại cho tất cả thói quen có reminderTime
  for (const habit of habits) {
    if (habit.reminderTime && habit.active && habit.reminderTime.trim() !== '') {
      await scheduleHabitReminder(habit);
    }
  }
}

// Lấy danh sách tất cả thông báo đã lên lịch
export async function getAllScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    return [];
  }
}

