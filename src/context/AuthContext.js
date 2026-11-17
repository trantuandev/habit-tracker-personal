import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const USER_STORAGE_KEY = 'habit_app_user';
const USERS_STORAGE_KEY = 'habit_app_users';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, username) => {
    try {
      // Get existing users
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersData ? JSON.parse(usersData) : [];

      // Check if email already exists
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'Email đã được sử dụng' };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        password, // In production, hash this password
        username,
        createdAt: new Date().toISOString(),
      };

      // Save user to users list
      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Auto login
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Đã có lỗi xảy ra, vui lòng thử lại' };
    }
  };

  const login = async (email, password) => {
    try {
      // Get all users
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersData ? JSON.parse(usersData) : [];

      // Find user
      const foundUser = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser));
        setUser(foundUser);
        return { success: true };
      } else {
        return { success: false, error: 'Email hoặc mật khẩu không đúng' };
      }
    } catch (error) {
      return { success: false, error: 'Đã có lỗi xảy ra, vui lòng thử lại' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Đã có lỗi xảy ra' };
    }
  };

  const updateProfile = async (updates) => {
    try {
      // Get all users
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersData ? JSON.parse(usersData) : [];

      // Update user in users list
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u
      );
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

      // Update current user
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Đã có lỗi xảy ra' };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      // Verify old password
      if (user.password !== oldPassword) {
        return { success: false, error: 'Mật khẩu cũ không đúng' };
      }

      // Get all users
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersData ? JSON.parse(usersData) : [];

      // Update password in users list
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, password: newPassword, passwordChangedAt: new Date().toISOString() } : u
      );
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

      // Update current user
      const updatedUser = { ...user, password: newPassword };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Đã có lỗi xảy ra' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

