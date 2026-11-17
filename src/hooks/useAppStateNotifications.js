import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import { getTodayLocal } from '../utils/dateUtils';

// Hook để gửi thông báo khi app vào background về các thói quen chưa hoàn thành
export function useAppStateNotifications() {
  const { isAuthenticated } = useAuth();
  const { habits, logs, getDayLogs } = useHabits();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Chỉ enable khi đã đăng nhập
    if (!isAuthenticated) {
      return;
    }

    const sendIncompleteHabitsNotification = async () => {
      try {
        // Kiểm tra quyền thông báo
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        // Lấy ngày hôm nay
        const today = getTodayLocal(); // YYYY-MM-DD
        
        // Lấy logs hôm nay
        const todayLogs = getDayLogs(today);
        
        // Tìm các thói quen chưa hoàn thành
        const incompleteHabits = habits.filter(habit => {
          // Chỉ lấy thói quen active
          if (!habit.active) return false;

          // Kiểm tra xem thói quen đã hoàn thành chưa
          const habitLogs = todayLogs.filter(log => log.habitId === habit.id);
          const totalCompleted = habitLogs.reduce((sum, log) => sum + (log.times || 0), 0);
          
          // So sánh với goalValue
          if (habit.goalType === 'times_per_day') {
            return totalCompleted < habit.goalValue;
          } else if (habit.goalType === 'times_per_week') {
            // Tính tổng trong tuần (đơn giản: chỉ check hôm nay)
            return totalCompleted < habit.goalValue;
          }
          return false;
        });

        if (incompleteHabits.length === 0) {
          // Tất cả đã hoàn thành, không cần thông báo
          return;
        }

        // Tạo nội dung thông báo
        let notificationBody = '';
        if (incompleteHabits.length === 1) {
          const habit = incompleteHabits[0];
          const habitLogs = todayLogs.filter(log => log.habitId === habit.id);
          const totalCompleted = habitLogs.reduce((sum, log) => sum + (log.times || 0), 0);
          notificationBody = `Bạn chưa hoàn thành: ${habit.name} ${habit.icon}\nCòn thiếu ${habit.goalValue - totalCompleted} lần nữa!`;
        } else {
          const habitNames = incompleteHabits.slice(0, 3).map(h => `${h.icon} ${h.name}`).join(', ');
          notificationBody = `Bạn còn ${incompleteHabits.length} thói quen chưa hoàn thành:\n${habitNames}${incompleteHabits.length > 3 ? '...' : ''}`;
        }

        // Gửi thông báo ngay lập tức
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📋 Nhắc nhở thói quen',
            body: notificationBody,
            sound: true,
            data: { type: 'incomplete_habits', date: today },
          },
          trigger: null, // Gửi ngay
        });
      } catch (error) {
        // Silent fail
      }
    };

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Khi app chuyển từ active sang background hoặc inactive
      if (
        appState.current.match(/active|foreground/) &&
        nextAppState.match(/inactive|background/)
      ) {
        sendIncompleteHabitsNotification();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [habits, logs, isAuthenticated, getDayLogs]);
}
