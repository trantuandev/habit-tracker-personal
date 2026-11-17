import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const HABITS_KEY = 'habit_data';
const SETTINGS_KEY = 'app_settings';
const BACKUP_KEY = 'habit_backup';

// Habit data operations
export const saveHabitData = async (data) => {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
};

export const getHabitData = async () => {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

export const clearHabitData = async () => {
  try {
    await AsyncStorage.removeItem(HABITS_KEY);
    return true;
  } catch (error) {
    return false;
  }
};

// Settings operations
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    return false;
  }
};

export const getSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : getDefaultSettings();
  } catch (error) {
    return getDefaultSettings();
  }
};

const getDefaultSettings = () => ({
  notifications: true,
  reminderTime: '08:00',
  theme: 'light',
  language: 'vi',
});

// Backup and restore
export const createBackup = async () => {
  try {
    const habitData = await getHabitData();
    const settings = await getSettings();
    const backup = {
      habitData,
      settings,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    return backup;
  } catch (error) {
    return null;
  }
};

export const restoreFromBackup = async () => {
  try {
    const backup = await AsyncStorage.getItem(BACKUP_KEY);
    if (backup) {
      const { habitData, settings } = JSON.parse(backup);
      if (habitData) await saveHabitData(habitData);
      if (settings) await saveSettings(settings);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Export/Import for sharing
export const exportDataAsJSON = async () => {
  try {
    const habitData = await getHabitData();
    return JSON.stringify(habitData, null, 2);
  } catch (error) {
    return null;
  }
};

export const importDataFromJSON = async (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    await saveHabitData(data);
    return true;
  } catch (error) {
    return false;
  }
};

// Statistics helpers
export const getStatistics = async () => {
  try {
    const data = await getHabitData();
    if (!data) return null;
    
    const { habits = [], logs = [] } = data;
    const completedLogs = logs.filter(log => log.completed);
    
    return {
      totalHabits: habits.length,
      activeHabits: habits.filter(h => h.active).length,
      totalLogs: logs.length,
      completedLogs: completedLogs.length,
      completionRate: logs.length > 0 
        ? Math.round((completedLogs.length / logs.length) * 100) 
        : 0,
    };
  } catch (error) {
    return null;
  }
};

// Clear all app data
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([HABITS_KEY, SETTINGS_KEY, BACKUP_KEY]);
    return true;
  } catch (error) {
    return false;
  }
};
