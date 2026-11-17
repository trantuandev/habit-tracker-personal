import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import { getTodayLocal } from '../utils/dateUtils';

const HabitCard = ({ habit, onEdit, onDelete, onCheck, onTogglePause, showActions = true, compact = false, allowCheck = true }) => {
  const { getDayLogs, addLog, updateLog } = useHabits();
  const { colors } = useTheme();
  const today = getTodayLocal();
  const todayLogs = getDayLogs(today).filter(l => l.habitId === habit.id);
  const isDone = todayLogs.length > 0 && todayLogs[0].completed;

  const handleCheck = () => {
    if (!allowCheck) return; // Disable check if allowCheck is false
    
    if (todayLogs.length === 0) {
      // Create new log
      addLog({
        habitId: habit.id,
        date: today,
        completed: true,
        times: 1,
      });
    } else {
      // Toggle existing log
      const log = todayLogs[0];
      updateLog({
        ...log,
        completed: !log.completed,
      });
    }
    if (onCheck) onCheck(habit);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderLeftColor: habit.color || colors.primary, borderLeftWidth: 4 }]}>
      <View style={styles.leftSection}>
        {allowCheck && (
          <TouchableOpacity
            style={[styles.checkCircle, { borderColor: isDone ? '#4caf50' : colors.border, backgroundColor: isDone ? '#c8e6c9' : colors.background }]}
            onPress={handleCheck}
          >
            {isDone && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        )}
        <View style={styles.textSection}>
          <View style={styles.titleRow}>
            <Text style={styles.icon}>{habit.icon || '🌱'}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{habit.name}</Text>
          </View>
          {!compact && habit.goalType && (
            <Text style={[styles.goal, { color: colors.textSecondary }]}>
              Mục tiêu: {habit.goalValue} {habit.goalType === 'times_per_day' ? 'lần/ngày' : 'lần/tuần'}
            </Text>
          )}
          {!compact && habit.reminderTime && (
            <Text style={[styles.reminder, { color: colors.textSecondary }]}>⏰ {habit.reminderTime}</Text>
          )}
        </View>
      </View>
      {showActions && (
        <View style={styles.rightSection}>
          {onTogglePause && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: habit.active ? '#fff4e5' : '#e5f5e5' }]} 
              onPress={() => onTogglePause(habit)}
            >
              <Text style={styles.actionText}>{habit.active ? '⏸️' : '▶️'}</Text>
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.background }]} onPress={() => onEdit(habit)}>
              <Text style={styles.actionText}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ffe5e5' }]} onPress={() => onDelete(habit.id)}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 10,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: { color: '#2e7d32', fontWeight: 'bold', fontSize: 20 },
  textSection: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { fontSize: 20, marginRight: 6 },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  goal: { fontSize: 12, marginTop: 2 },
  reminder: { fontSize: 11, marginTop: 2 },
  rightSection: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  actionBtn: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: { fontSize: 16 },
});

export default HabitCard;


