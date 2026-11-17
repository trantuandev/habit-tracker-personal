import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import { formatDateLocal } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

const InsightsScreen = () => {
  const { habits, logs } = useHabits();
  const { colors } = useTheme();
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  // Calculate date range
  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate.setDate(today.getDate() - 365);
    }
    
    return {
      start: formatDateLocal(startDate),
      end: formatDateLocal(today),
    };
  };

      const dateRange = getDateRange();

  // Filter logs in date range
  const logsInRange = logs.filter(
    log => log.date >= dateRange.start && log.date <= dateRange.end
  );

  // Helper to get start of year for range calculation
  const getYearStart = () => {
    if (timeRange === 'year') {
      const today = new Date();
      // Start from January 1st of current year
      return formatDateLocal(new Date(today.getFullYear(), 0, 1));
    }
    return dateRange.start;
  };

  // Calculate stats
  const totalCompletions = logsInRange.filter(log => log.completed).length;
  const totalLogs = logsInRange.length;
  const completionRate = totalLogs > 0 ? Math.round((totalCompletions / totalLogs) * 100) : 0;

  // Habit completion stats
  const habitStats = habits.map(habit => {
    const habitLogs = logsInRange.filter(log => log.habitId === habit.id);
    const completedLogs = habitLogs.filter(log => log.completed);
    const rate = habitLogs.length > 0 ? (completedLogs.length / habitLogs.length) * 100 : 0;
    
    return {
      habit,
      total: habitLogs.length,
      completed: completedLogs.length,
      rate: Math.round(rate),
    };
  }).sort((a, b) => b.rate - a.rate);

  // Best streak calculation
  const calculateStreak = (habitId) => {
    const habitLogs = logs
      .filter(log => log.habitId === habitId && log.completed)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (habitLogs.length === 0) return 0;
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < habitLogs.length; i++) {
      const prevDate = new Date(habitLogs[i - 1].date);
      const currDate = new Date(habitLogs[i].date);
      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };

  // Find best habit
  const bestHabit = habitStats.length > 0 ? habitStats[0] : null;

  // Weekly pattern (day of week analysis) - only for week
  const weekdayStats = Array(7).fill(0).map((_, idx) => {
    const dayLogs = logsInRange.filter(log => {
      const dayOfWeek = new Date(log.date).getDay();
      return dayOfWeek === idx;
    });
    const completed = dayLogs.filter(l => l.completed).length;
    return {
      day: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][idx],
      rate: dayLogs.length > 0 ? Math.round((completed / dayLogs.length) * 100) : 0,
    };
  });

  // Monthly pattern for 1 year
  const getMonthlyStatsForYear = () => {
    const stats = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Generate 12 months: from January to December of current year
    for (let month = 0; month < 12; month++) {
      const year = currentYear;
      const date = new Date(year, month, 1);
      const monthStr = `${month + 1}/${year}`;
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      const monthLogs = logsInRange.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= monthStart && logDate <= monthEnd;
      });
      const completed = monthLogs.filter(l => l.completed).length;
      const total = monthLogs.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      stats.push({
        day: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'][month],
        month: monthStr,
        rate: rate,
        value: completed,
      });
    }
    // Already in correct order (T1 to T12)
    return stats;
  };

  // Get chart data based on time range
  const getChartData = () => {
    if (timeRange === 'week') {
      return weekdayStats.map(item => ({ day: item.day, rate: item.rate }));
    } else {
      return getMonthlyStatsForYear().map(item => ({ day: item.day, rate: item.rate }));
    }
  };

  const chartData = getChartData();

  // Simple bar chart component
  const BarChart = ({ data, maxValue }) => {
    const chartWidth = width - 80;
    const barCount = data.length;
    const maxBarHeight = 140; // Maximum height of bars in pixels (matches barColumn height)
    // Calculate bar width based on available space
    const calculatedBarWidth = Math.max(20, Math.min(40, (width - 100) / barCount - 4));
    const finalBarWidth = barCount > 12 ? calculatedBarWidth : Math.max(25, (width - 120) / barCount);
    
    return (
      <View style={styles.barChartContainer}>
        {data.map((item, idx) => {
          // Calculate bar height - ensure it's visible if rate > 0
          let barHeight = 0;
          if (maxValue > 0 && item.rate > 0) {
            barHeight = Math.max(4, (item.rate / maxValue) * maxBarHeight); // Minimum 4px for visibility
          }
          
          return (
            <View key={idx} style={[styles.barWrapper, { flex: barCount > 12 ? 0 : 1 }]}>
              <View style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: finalBarWidth,
                      height: barHeight,
                      backgroundColor: item.rate >= 80 ? '#4caf50' : item.rate >= 50 ? '#ff9800' : item.rate > 0 ? '#f44336' : 'transparent',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { fontSize: barCount > 12 ? 9 : 11 }]} numberOfLines={1}>{item.day}</Text>
              <Text style={[styles.barValue, { fontSize: barCount > 12 ? 9 : 10 }]}>{item.rate}%</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Phân Tích & Báo Cáo</Text>
      </View>

      {/* Time Range Selector */}
      <View style={[styles.timeRangeSelector, { backgroundColor: colors.cardBackground }]}>
        {['week', 'year'].map(range => (
          <TouchableOpacity
            key={range}
            style={[styles.timeRangeBtn, { backgroundColor: colors.background }, timeRange === range && { backgroundColor: colors.primary }]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[styles.timeRangeText, { color: colors.textSecondary }, timeRange === range && { color: '#fff' }]}>
              {range === 'week' ? '7 ngày' : '1 năm'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Overall Stats */}
      <View style={styles.overallStats}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{totalCompletions}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hoàn thành</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{completionRate}%</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tỷ lệ</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{habits.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Thói quen</Text>
        </View>
      </View>

      {/* Best Habit */}
      {bestHabit && bestHabit.total > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Thói quen xuất sắc nhất</Text>
          <View style={[styles.bestHabitCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.bestHabitLeft}>
              <Text style={styles.bestHabitIcon}>{bestHabit.habit.icon}</Text>
              <View>
                <Text style={[styles.bestHabitName, { color: colors.text }]}>{bestHabit.habit.name}</Text>
                <Text style={[styles.bestHabitStats, { color: colors.textSecondary }]}>
                  {bestHabit.completed}/{bestHabit.total} hoàn thành
                </Text>
              </View>
            </View>
            <View style={styles.bestHabitRight}>
              <Text style={styles.bestHabitRate}>{bestHabit.rate}%</Text>
            </View>
          </View>
        </View>
      )}

      {/* Pattern Chart */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {timeRange === 'week' ? '📊 Mẫu hình theo ngày trong tuần' : '📊 Mẫu hình 12 tháng qua'}
        </Text>
        <View style={[styles.chartCard, { backgroundColor: colors.cardBackground }]}>
          <BarChart data={chartData} maxValue={100} />
        </View>
        <Text style={[styles.chartNote, { color: colors.textSecondary }]}>
          {timeRange === 'week' 
            ? 'Biểu đồ hiển thị tỷ lệ hoàn thành thói quen theo từng ngày trong tuần'
            : 'Biểu đồ hiển thị tỷ lệ hoàn thành thói quen theo từng tháng trong năm'}
        </Text>
      </View>

      {/* All Habits Performance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📈 Hiệu suất từng thói quen</Text>
        {habitStats.length === 0 ? (
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>Chưa có dữ liệu</Text>
        ) : (
          habitStats.map((stat, idx) => (
            <View key={stat.habit.id} style={[styles.habitStatCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.habitStatLeft}>
                <Text style={[styles.habitStatRank, { color: colors.textSecondary }]}>#{idx + 1}</Text>
                <Text style={styles.habitStatIcon}>{stat.habit.icon}</Text>
                <View style={styles.habitStatInfo}>
                  <Text style={[styles.habitStatName, { color: colors.text }]}>{stat.habit.name}</Text>
                  <Text style={[styles.habitStatDetail, { color: colors.textSecondary }]}>
                    {stat.completed}/{stat.total} lần
                  </Text>
                </View>
              </View>
              <View style={styles.habitStatRight}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${stat.rate}%` }]} />
                </View>
                <Text style={[styles.habitStatRate, { color: colors.primary }]}>{stat.rate}%</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Streaks */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🔥 Chuỗi hoàn thành tốt nhất</Text>
        {habits.map(habit => {
          const streak = calculateStreak(habit.id);
          if (streak === 0) return null;
          return (
            <View key={habit.id} style={[styles.streakCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={styles.streakIcon}>{habit.icon}</Text>
              <Text style={[styles.streakName, { color: colors.text }]}>{habit.name}</Text>
              <Text style={styles.streakValue}>{streak} ngày</Text>
            </View>
          );
        })}
      </View>

      {/* Motivational Message */}
      <View style={[styles.motivationCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.motivationTitle, { color: colors.text }]}>💡 Lời khuyên</Text>
        <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
          {completionRate >= 80
            ? 'Tuyệt vời! Bạn đang duy trì thói quen rất tốt. Hãy tiếp tục!'
            : completionRate >= 50
            ? 'Đang tiến bộ! Hãy cố gắng duy trì và cải thiện thêm.'
            : 'Đừng bỏ cuộc! Mỗi ngày là một cơ hội mới để bắt đầu lại.'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timeRangeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  overallStats: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bestHabitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  bestHabitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bestHabitIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  bestHabitName: {
    fontSize: 16,
    fontWeight: '600',
  },
  bestHabitStats: {
    fontSize: 13,
    marginTop: 2,
  },
  bestHabitRight: {},
  bestHabitRate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
  },
  chartNote: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barColumn: {
    height: 140,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  bar: {
    width: 30,
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  barValue: {
    fontSize: 10,
    marginTop: 2,
  },
  habitStatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  habitStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitStatRank: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
  },
  habitStatIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  habitStatInfo: {
    flex: 1,
  },
  habitStatName: {
    fontSize: 14,
    fontWeight: '600',
  },
  habitStatDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  habitStatRight: {
    alignItems: 'flex-end',
    width: 80,
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  habitStatRate: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  streakName: {
    fontSize: 14,
    flex: 1,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6f00',
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  motivationCard: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default InsightsScreen;
