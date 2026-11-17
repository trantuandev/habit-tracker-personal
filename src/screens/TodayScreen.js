import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import HabitCard from '../components/HabitCard';
import { getTodayLocal } from '../utils/dateUtils';

const WEATHER_API_KEY = 'e8888386f5478c6f8c1ebb9b0aa0761e';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const TodayScreen = () => {
  const { habits, logs, getDayLogs, addHabit } = useHabits();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const today = getTodayLocal();
  const todayLogs = getDayLogs(today);
  
  // Handle adding habit from suggestion
  const handleAddFromSuggestion = (suggestion) => {
    Alert.alert(
      'Thêm thói quen',
      `Bạn muốn thêm "${suggestion.text}" vào danh sách thói quen? (Chỉ trong ngày hôm nay)`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thêm',
          onPress: () => {
            const newHabit = {
              name: suggestion.text,
              icon: suggestion.icon,
              group: suggestion.category,
              goalType: 'times_per_day',
              goalValue: 1,
              reminderTime: '',
              startDate: today,
              endDate: today,
              difficulty: 3,
              active: true,
            };
            addHabit(newHabit);
            Alert.alert('Thành công', 'Đã thêm thói quen mới cho ngày hôm nay!');
          },
        },
      ]
    );
  };
  
  // Fetch weather data
  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoadingWeather(true);
      // Thach That, Hanoi, Vietnam coordinates
      const lat = 21.1015;
      const lon = 105.5605;
      
      const response = await fetch(
        `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=vi`
      );
      const data = await response.json();
      
      if (data.cod === 200) {
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
          humidity: data.main.humidity,
          feelsLike: Math.round(data.main.feels_like),
        });
      }
    } catch (error) {
      // Silent fail
    } finally {
      setLoadingWeather(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeather();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Filter active habits
  const activeHabits = habits.filter(h => h.active);
  const activeHabitIds = activeHabits.map(h => h.id);

  // Calculate completion stats - only count logs from active habits
  const activeHabitLogs = todayLogs.filter(l => activeHabitIds.includes(l.habitId));
  const completedCount = activeHabitLogs.filter(l => l.completed).length;
  const totalHabits = activeHabits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  // Get day name
  const getDayName = () => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[new Date().getDay()];
  };

  // Get motivational message based on completion
  const getMotivationalMessage = () => {
    if (completionRate === 100) return '🎉 Hoàn hảo! Bạn đã hoàn thành tất cả!';
    if (completionRate >= 80) return '🔥 Tuyệt vời! Sắp xong rồi!';
    if (completionRate >= 50) return '💪 Đang tiến bộ tốt!';
    if (completionRate > 0) return '🌱 Bắt đầu tốt, tiếp tục nào!';
    return '☀️ Hãy bắt đầu ngày mới!';
  };

  // Get weather-based habit suggestions
  const getWeatherBasedSuggestions = () => {
    if (!weather) return [];

    const suggestions = [];
    const temp = weather.temp;
    const description = weather.description.toLowerCase();

    // Temperature-based suggestions
    if (temp >= 30) {
      suggestions.push({ icon: '🏊‍♂️', text: 'Đi bơi giải nhiệt', category: 'Thể dục' });
      suggestions.push({ icon: '🥤', text: 'Uống đủ nước (8-10 ly)', category: 'Sức khỏe' });
    } else if (temp >= 25) {
      suggestions.push({ icon: '🚶‍♂️', text: 'Đi bộ buổi sáng mát mẻ', category: 'Thể dục' });
      suggestions.push({ icon: '🧘‍♀️', text: 'Yoga ngoài trời', category: 'Thư giãn' });
    } else if (temp >= 20) {
      suggestions.push({ icon: '🏃‍♂️', text: 'Chạy bộ phòng gym', category: 'Thể dục' });
      suggestions.push({ icon: '📚', text: 'Đọc sách tại quán cà phê', category: 'Học tập' });
    } else if (temp >= 15) {
      suggestions.push({ icon: '☕', text: 'Thưởng thức trà nóng', category: 'Thư giãn' });
      suggestions.push({ icon: '🧶', text: 'Tập thể dục trong nhà', category: 'Thể dục' });
    } else {
      suggestions.push({ icon: '🧣', text: 'Mặc ấm khi ra ngoài', category: 'Sức khỏe' });
      suggestions.push({ icon: '🍲', text: 'Nấu món ăn nóng hổi', category: 'Cá nhân' });
    }

    // Weather condition-based suggestions
    if (description.includes('mưa') || description.includes('rain')) {
      suggestions.push({ icon: '📖', text: 'Đọc sách trong nhà', category: 'Học tập' });
      suggestions.push({ icon: '🎬', text: 'Xem phim, học online', category: 'Giải trí' });
    } else if (description.includes('nắng') || description.includes('sun')) {
      suggestions.push({ icon: '🚴‍♀️', text: 'Đi xe đạp dạo quanh', category: 'Thể dục' });
      suggestions.push({ icon: '🌳', text: 'Dã ngoại công viên', category: 'Giải trí' });
    } else if (description.includes('gió') || description.includes('wind')) {
      suggestions.push({ icon: '🪁', text: 'Thả diều nếu có thể', category: 'Giải trí' });
    } else if (description.includes('trời quang đãng') || description.includes('clear')) {
      suggestions.push({ icon: '⭐', text: 'Ngắm sao đêm nay', category: 'Giải trí' });
      suggestions.push({ icon: '🚶‍♂️', text: 'Đi bộ chiều tối', category: 'Thể dục' });
    }

    // Humidity-based suggestions
    if (weather.humidity >= 70) {
      suggestions.push({ icon: '🛁', text: 'Giữ cơ thể khô ráo', category: 'Sức khỏe' });
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <Text style={[styles.dateText, { color: colors.headerText }]}>{getDayName()}</Text>
        <Text style={[styles.dateSubtext, { color: colors.headerText }]}>
          {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
        
        {/* Weather Widget */}
        {loadingWeather ? (
          <View style={styles.weatherCard}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : weather && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherIconContainer}>
              <Text style={styles.weatherTemp}>{weather.temp}°</Text>
            </View>
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherDescription}>{weather.description}</Text>
              <Text style={styles.weatherCity}>{weather.city}</Text>
              <Text style={styles.weatherDetails}>Cảm giác: {weather.feelsLike}° • Độ ẩm: {weather.humidity}%</Text>
            </View>
          </View>
        )}
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.progressCircle}>
          <Text style={[styles.progressText, { color: colors.primary }]}>{completionRate}%</Text>
        </View>
        <View style={styles.statsInfo}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>{getMotivationalMessage()}</Text>
          <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
            {completedCount} / {totalHabits} thói quen hoàn thành
          </Text>
        </View>
      </View>

      {/* Habits List */}
      <ScrollView
        style={styles.habitsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Weather-based Suggestions */}
        {weather && getWeatherBasedSuggestions().length > 0 && (
          <View style={[styles.suggestionsCard, { backgroundColor: colors.cardBackground, borderLeftColor: colors.primary }]}>
            <Text style={[styles.suggestionsTitle, { color: colors.text }]}>💡 Gợi ý thói quen theo thời tiết</Text>
            {getWeatherBasedSuggestions().map((suggestion, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.suggestionItem, { backgroundColor: colors.background }]}
                onPress={() => handleAddFromSuggestion(suggestion)}
              >
                <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                <View style={styles.suggestionInfo}>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion.text}</Text>
                  <Text style={[styles.suggestionCategory, { color: colors.textSecondary }]}>{suggestion.category}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddFromSuggestion(suggestion)}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Thói quen hôm nay</Text>
        {activeHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Chưa có thói quen nào</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Hãy thêm thói quen đầu tiên của bạn!
            </Text>
          </View>
        ) : (
          activeHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              showActions={false}
            />
          ))
        )}

        {/* Quick Tips */}
        {activeHabits.length > 0 && (
          <View style={[styles.tipsCard, { backgroundColor: colors.cardBackground, borderLeftColor: colors.primary }]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>💡 Mẹo nhỏ</Text>
            <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
              • Hãy hoàn thành thói quen vào cùng một thời điểm mỗi ngày{'\n'}
              • Bắt đầu với những thói quen nhỏ và dễ dàng{'\n'}
              • Khen thưởng bản thân sau mỗi cột mốc
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  dateText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateSubtext: {
    fontSize: 14,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  weatherIconContainer: {
    marginRight: 12,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherInfo: {
    flex: 1,
  },
  weatherDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  weatherCity: {
    fontSize: 12,
    color: '#e3f2fd',
    marginBottom: 2,
  },
  weatherDetails: {
    fontSize: 11,
    color: '#e3f2fd',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    alignItems: 'center',
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 4,
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsInfo: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 13,
  },
  habitsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  suggestionsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionCategory: {
    fontSize: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tipsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },
});

export default TodayScreen;
