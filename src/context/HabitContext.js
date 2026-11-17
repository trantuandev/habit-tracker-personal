import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Habit from '../models/Habit';
import HabitLog from '../models/HabitLog';
import {
  scheduleHabitReminder,
  cancelHabitReminder,
  rescheduleAllHabitReminders,
} from '../services/notificationService';
import { formatDateLocal } from '../utils/dateUtils';

const HabitContext = createContext();

// ------ Reducer ------
const initialState = {
  habits: [],
  logs: [],
  currentUserId: null,
};

function habitReducer(state, action) {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, ...action.payload };
    case 'SET_USER':
      return { ...state, currentUserId: action.payload };
    case 'CLEAR_DATA':
      return { habits: [], logs: [], currentUserId: action.payload };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id===action.payload.id ? { ...h, ...action.payload, updatedAt: new Date().toISOString()} : h),
      };
    case 'REMOVE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.payload), logs: state.logs.filter(l => l.habitId !== action.payload) };
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs, action.payload] };
    case 'UPDATE_LOG':
      return { ...state, logs: state.logs.map(l => l.id===action.payload.id ? { ...l, ...action.payload } : l) };
    case 'REMOVE_LOG':
      return { ...state, logs: state.logs.filter(l => l.id !== action.payload) };
    default:
      return state;
  }
}

// ------ Provider ------
export const HabitProvider = ({ children, userId }) => {
  const [state, dispatch] = useReducer(habitReducer, initialState);

  // Normalize log dates to fix timezone issues from legacy data
  const normalizeLogDates = (logs, userId) => {
    if (!logs || !Array.isArray(logs)) return logs;
    let hasChanges = false;
    const normalized = logs.map(log => {
      if (log.date) {
        try {
          // If createdAt exists, use it to determine the correct date
          if (log.createdAt) {
            const createdAtDate = new Date(log.createdAt);
            const createdAtDateStr = formatDateLocal(createdAtDate);
            
            // If log.date doesn't match createdAt date, it's likely a timezone issue
            // Use createdAt date as the source of truth
            if (log.date !== createdAtDateStr) {
              // Check if difference is 1 day (typical timezone offset issue)
              const logDateObj = new Date(log.date + 'T12:00:00'); // Use noon to avoid DST issues
              const diffTime = Math.abs(createdAtDate - logDateObj);
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              
              // If off by exactly 1 day, fix it
              if (diffDays === 1) {
                hasChanges = true;
                return { ...log, date: createdAtDateStr };
              }
            }
          }
        } catch {
          // If parsing fails, keep original date
        }
      }
      return log;
    });
    
    // Save normalized logs back if any were changed
    if (hasChanges && userId) {
      setTimeout(async () => {
        try {
          const storageKey = `habit_data_${userId}`;
          const data = await AsyncStorage.getItem(storageKey);
          if (data) {
            const parsed = JSON.parse(data);
            parsed.logs = normalized;
            await AsyncStorage.setItem(storageKey, JSON.stringify(parsed));
          }
        } catch {
          // Silent fail
        }
      }, 100);
    }
    
    return normalized;
  };

  // Load data when userId changes
  useEffect(() => {
    const loadUserData = async (id) => {
      try {
        const storageKey = `habit_data_${id}`;
        const data = await AsyncStorage.getItem(storageKey);
        if (data) {
          const parsed = JSON.parse(data);
          // Normalize log dates to fix timezone issues
          if (parsed.logs && Array.isArray(parsed.logs)) {
            parsed.logs = normalizeLogDates(parsed.logs, id);
          }
          dispatch({ type: 'SET_ALL', payload: parsed });
          // Lên lịch lại thông báo sau khi load data
          if (parsed.habits && parsed.habits.length > 0) {
            setTimeout(() => {
              rescheduleAllHabitReminders(parsed.habits);
            }, 500);
          }
        } else {
          // Initialize empty data for new user
          dispatch({ type: 'SET_ALL', payload: { habits: [], logs: [] } });
        }
      } catch (error) {
        // Silent fail
      }
    };

    if (userId) {
      dispatch({ type: 'SET_USER', payload: userId });
      loadUserData(userId);
    } else {
      // Clear data when no user
      dispatch({ type: 'CLEAR_DATA', payload: null });
    }
  }, [userId]);

  // Save data when state changes
  useEffect(() => {
    if (state.currentUserId && (state.habits.length > 0 || state.logs.length > 0)) {
      const storageKey = `habit_data_${state.currentUserId}`;
      AsyncStorage.setItem(storageKey, JSON.stringify({
        habits: state.habits,
        logs: state.logs,
      }));
    }
  }, [state.habits, state.logs, state.currentUserId]);

  // ------ Habit CRUD ------
  function addHabit(habit) {
    const h = new Habit(habit);
    dispatch({ type: 'ADD_HABIT', payload: h });
    // Lên lịch thông báo nếu có reminderTime
    if (h.reminderTime && h.active && h.reminderTime.trim() !== '') {
      scheduleHabitReminder(h).catch(() => {
        // Silent fail
      });
    }
  }
  function updateHabit(habit) {
    dispatch({ type: 'UPDATE_HABIT', payload: habit });
    // Cập nhật thông báo: hủy cũ và lên lịch mới nếu cần
    const updatedHabit = { ...habit };
    if (updatedHabit.reminderTime && updatedHabit.active && updatedHabit.reminderTime.trim() !== '') {
      scheduleHabitReminder(updatedHabit).catch(() => {
        // Silent fail
      });
    } else {
      // Nếu không còn reminderTime hoặc không active, hủy thông báo
      cancelHabitReminder(updatedHabit.id);
    }
  }
  function removeHabit(id) {
    // Hủy thông báo trước khi xóa
    cancelHabitReminder(id);
    dispatch({ type: 'REMOVE_HABIT', payload: id });
  }

  // ------ Log/Check-in ------
  function addLog(log) {
    const l = new HabitLog(log);
    dispatch({ type: 'ADD_LOG', payload: l });
  }
  function updateLog(log) {
    dispatch({ type: 'UPDATE_LOG', payload: log });
  }
  function removeLog(id) {
    dispatch({ type: 'REMOVE_LOG', payload: id });
  }
  // Get logs for a specific habit (and/or by date)
  function getLogs(habitId, date=null) {
    return state.logs.filter(l => l.habitId===habitId && (!date || l.date === date));
  }
  // Get logs for a specific date (all habits)
  function getDayLogs(date) {
    return state.logs.filter(l => l.date === date);
  }
  // Get logs by week/month
  function getLogsInRange(startDate, endDate) {
    return state.logs.filter(l => l.date >= startDate && l.date <= endDate);
  }

  // ------ Export/Import ------
  function exportData() {
    return JSON.stringify(state);
  }
  function importData(json) {
    try {
      dispatch({type:'SET_ALL', payload:JSON.parse(json)});
    } catch {
      // ignore
    }
  }

  return (
    <HabitContext.Provider value={{
      habits: state.habits,
      logs: state.logs,
      addHabit, updateHabit, removeHabit,
      addLog, updateLog, removeLog,
      getLogs, getDayLogs, getLogsInRange,
      exportData, importData,
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
