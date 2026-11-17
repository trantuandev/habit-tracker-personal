import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'app_theme';

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Use system theme if no saved theme
        setTheme(systemTheme || 'light');
      }
    } catch (error) {
      setTheme('light');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setTheme(newTheme);
    } catch (error) {
      // Silent fail
    }
  };

  const colors = {
    light: {
      primary: '#1976d2',
      background: '#ffffff',
      card: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
      notification: '#f44336',
      headerBackground: '#1976d2',
      headerText: '#ffffff',
      screenBackground: '#f8f9fc',
      cardBackground: '#ffffff',
      shadowColor: '#000000',
    },
    dark: {
      primary: '#64b5f6',
      background: '#121212',
      card: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#333333',
      notification: '#f44336',
      headerBackground: '#1e1e1e',
      headerText: '#ffffff',
      screenBackground: '#121212',
      cardBackground: '#1e1e1e',
      shadowColor: '#000000',
    },
  };

  const currentColors = colors[theme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: currentColors,
        toggleTheme,
        isLoading,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

