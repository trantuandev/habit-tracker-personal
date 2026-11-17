import React, { useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HabitProvider } from './src/context/HabitContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TodayScreen from './src/screens/TodayScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import HabitEditScreen from './src/screens/HabitEditScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import CoachScreen from './src/screens/CoachScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { ActivityIndicator, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { useAppStateNotifications } from './src/hooks/useAppStateNotifications';

const Tab = createBottomTabNavigator();
const HabitsStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function HabitsStackNav() {
  return (
    <HabitsStack.Navigator>
      <HabitsStack.Screen name="HabitsList" component={HabitsScreen} options={{ title: 'Thói quen' }}/>
      <HabitsStack.Screen name="HabitEdit" component={HabitEditScreen} options={{ title: 'Thêm/Sửa thói quen' }}/>
    </HabitsStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme, isLoading: themeLoading, colors } = useTheme();

  if (authLoading || themeLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Today') iconName = focused ? 'sunny' : 'sunny-outline';
              if (route.name === 'Habits') iconName = focused ? 'list-circle' : 'list-circle-outline';
              if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
              if (route.name === 'Insights') iconName = focused ? 'analytics' : 'analytics-outline';
              if (route.name === 'Coach') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.cardBackground,
              borderTopColor: colors.border,
            },
          })}
        >
          <Tab.Screen name="Today" component={TodayScreen} options={{ title: 'Hôm nay' }} />
          <Tab.Screen name="Habits" component={HabitsStackNav} options={{ title: 'Thói quen' }} />
          <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Lịch' }} />
          <Tab.Screen name="Insights" component={InsightsScreen} options={{ title: 'Thống kê' }} />
          <Tab.Screen name="Coach" component={CoachScreen} options={{ title: 'Huấn luyện' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
        </Tab.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

// Component để handle app state notifications (chỉ chạy khi đã authenticated)
function AppStateNotificationHandler() {
  const { isAuthenticated } = useAuth();
  
  // Hook phải được gọi không điều kiện, nhưng logic bên trong sẽ check isAuthenticated
  useAppStateNotifications();
  
  return null;
}

// Wrapper component to pass userId to HabitProvider
function HabitProviderWrapper({ children }) {
  const { user } = useAuth();
  return <HabitProvider userId={user?.id}>{children}</HabitProvider>;
}

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Đăng ký quyền thông báo khi app khởi động
    registerForPushNotificationsAsync();

    // Lắng nghe thông báo khi app đang mở
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Thông báo đã nhận:', notification);
    });

    // Lắng nghe khi người dùng nhấn vào thông báo
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Người dùng đã nhấn vào thông báo:', response);
    });

    return () => {
      // Cleanup listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <HabitProviderWrapper>
          <AppStateNotificationHandler />
          <AppNavigator />
        </HabitProviderWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
}
