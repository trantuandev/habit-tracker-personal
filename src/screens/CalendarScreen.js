import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import { formatDateFromComponents, getTodayLocal } from '../utils/dateUtils';

const CalendarScreen = () => {
  const { habits, logs, getDayLogs, getLogsInRange } = useHabits();
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(getTodayLocal());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper function to check if a date is within habit's date range
  const isHabitActiveOnDate = (habit, dateStr) => {
    if (!habit.active) return false;
    
    // Check startDate
    if (habit.startDate && dateStr < habit.startDate) {
      return false;
    }
    
    // Check endDate
    if (habit.endDate && habit.endDate.trim() !== '' && dateStr > habit.endDate) {
      return false;
    }
    
    return true;
  };

  // Get calendar data for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      // Format date string using formatDateFromComponents to ensure consistency
      const dateStr = formatDateFromComponents(year, month, day);
      const logs = getDayLogs(dateStr);
      const completedCount = logs.filter(l => l.completed).length;
      
      // Filter habits that are active on this date
      const activeHabitsOnDate = habits.filter(h => isHabitActiveOnDate(h, dateStr));
      const totalHabits = activeHabitsOnDate.length;
      
      days.push({
        day,
        date: dateStr,
        completedCount,
        totalHabits,
        completionRate: totalHabits > 0 ? completedCount / totalHabits : 0,
      });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getHeatmapColor = (rate) => {
    if (rate === 0) return '#f0f0f0';
    if (rate < 0.33) return '#ffcccc';
    if (rate < 0.66) return '#ffaa88';
    if (rate < 1) return '#88ccff';
    return '#4caf50';
  };

  // Get logs for selected date
  const selectedLogs = getDayLogs(selectedDate);
  const selectedHabitsWithLogs = habits
    .filter(habit => isHabitActiveOnDate(habit, selectedDate)) // Only show habits active on this date
    .map(habit => {
      const log = selectedLogs.find(l => l.habitId === habit.id);
      return { habit, log };
    });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Lịch Thói Quen</Text>
      </View>

      {/* Month Selector */}
      <View style={[styles.monthSelector, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
          <Text style={[styles.monthButtonText, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.text }]}>
          Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
          <Text style={[styles.monthButtonText, { color: colors.primary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={[styles.calendarContainer, { backgroundColor: colors.cardBackground }]}>
        {/* Day headers */}
        <View style={styles.dayHeadersRow}>
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
            <Text key={day} style={[styles.dayHeader, { color: colors.textSecondary }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar days */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((dayData, index) => (
              <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !dayData && styles.emptyCell,
                dayData && dayData.date === selectedDate && { borderColor: colors.primary },
              ]}
              onPress={() => dayData && setSelectedDate(dayData.date)}
              disabled={!dayData}
            >
              {dayData && (
                <>
                  <View
                    style={[
                      styles.dayCircle,
                      { backgroundColor: getHeatmapColor(dayData.completionRate) },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: colors.text }]}>{dayData.day}</Text>
                  </View>
                  {dayData.completedCount > 0 && (
                    <Text style={[styles.miniCount, { color: colors.textSecondary }]}>
                      {dayData.completedCount}/{dayData.totalHabits}
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Chú thích:</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendBox, { backgroundColor: '#f0f0f0' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Không hoàn thành</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendBox, { backgroundColor: '#ffcccc' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>{'<33%'}</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendBox, { backgroundColor: '#ffaa88' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>33-66%</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendBox, { backgroundColor: '#88ccff' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>66-99%</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendBox, { backgroundColor: '#4caf50' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>100%</Text>
        </View>
      </View>

      {/* Selected Date Details */}
      <View style={[styles.detailsSection, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>
          Chi tiết ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
        </Text>
        {selectedHabitsWithLogs.length === 0 ? (
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>Chưa có dữ liệu cho ngày này</Text>
        ) : (
          selectedHabitsWithLogs.map(({ habit, log }) => (
            <View key={habit.id} style={styles.habitDetailCard}>
              <View style={styles.habitDetailLeft}>
                <Text style={styles.habitIcon}>{habit.icon}</Text>
                <Text style={[styles.habitName, { color: colors.text }]}>{habit.name}</Text>
              </View>
              <View style={styles.habitDetailRight}>
                {log && log.completed ? (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Hoàn thành</Text>
                  </View>
                ) : (
                  <View style={styles.incompleteBadge}>
                    <Text style={styles.incompleteText}>✕ Chưa làm</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Monthly Stats */}
      <View style={[styles.statsSection, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>Thống kê tháng này</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {calendarDays.filter(d => d && d.completionRate === 1).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ngày hoàn hảo</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {calendarDays.filter(d => d && d.completedCount > 0).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ngày có hoạt động</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {Math.round(
                (calendarDays.filter(d => d && d.completedCount > 0).length /
                  calendarDays.filter(d => d).length) *
                100
              ) || 0}
              %
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tỷ lệ thực hiện</Text>
          </View>
        </View>
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  dayHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeader: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  selectedCell: {
    borderWidth: 2,
    borderRadius: 8,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  miniCount: {
    fontSize: 8,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
  },
  detailsSection: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  habitDetailCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  habitDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  habitName: {
    fontSize: 15,
    flex: 1,
  },
  habitDetailRight: {},
  completedBadge: {
    backgroundColor: '#c8e6c9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '600',
  },
  incompleteBadge: {
    backgroundColor: '#ffccbc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  incompleteText: {
    color: '#d84315',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default CalendarScreen;
