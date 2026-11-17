import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import TimePicker from '../components/TimePicker';
import { getTodayLocal } from '../utils/dateUtils';

const ICONS = ['🌱', '💪', '📚', '🏃', '🧘', '💧', '🎯', '✍️', '🎨', '🍎', '😴', '🧠', '❤️', '⭐'];
const COLORS = ['#1976d2', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#00bcd4', '#009688', '#4caf50', '#ff9800', '#ff5722'];
const GROUPS = ['Sức khỏe', 'Học tập', 'Công việc', 'Cá nhân', 'Thể dục', 'Tinh thần', 'Khác'];

const HabitEditScreen = ({ route, navigation }) => {
  const { addHabit, updateHabit } = useHabits();
  const { colors } = useTheme();
  const existingHabit = route.params?.habit;
  const isEdit = !!existingHabit;

  // Form state
  const [name, setName] = useState(existingHabit?.name || '');
  const [icon, setIcon] = useState(existingHabit?.icon || '🌱');
  const [color, setColor] = useState(existingHabit?.color || '#1976d2');
  const [group, setGroup] = useState(existingHabit?.group || 'Sức khỏe');
  const [goalType, setGoalType] = useState(existingHabit?.goalType || 'times_per_day');
  const [goalValue, setGoalValue] = useState(existingHabit?.goalValue?.toString() || '1');
  const [reminderTime, setReminderTime] = useState(existingHabit?.reminderTime || '');
  const [startDate, setStartDate] = useState(existingHabit?.startDate || getTodayLocal());
  const [endDate, setEndDate] = useState(existingHabit?.endDate || '');
  const [difficulty, setDifficulty] = useState(existingHabit?.difficulty || 3);
  const [active, setActive] = useState(existingHabit?.active !== undefined ? existingHabit.active : true);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thói quen');
      return;
    }

    const habitData = {
      name: name.trim(),
      icon,
      color,
      group,
      goalType,
      goalValue: parseInt(goalValue) || 1,
      reminderTime,
      startDate,
      endDate,
      difficulty,
      active,
    };

    if (isEdit) {
      updateHabit({ ...existingHabit, ...habitData });
      Alert.alert('Thành công', 'Đã cập nhật thói quen', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      addHabit(habitData);
      Alert.alert('Thành công', 'Đã thêm thói quen mới', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const renderDifficultyStars = () => {
    return (
      <View style={styles.difficultyContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setDifficulty(star)}>
            <Text style={styles.star}>{star <= difficulty ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.screenBackground }]} contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.header, { color: colors.primary }]}>{isEdit ? 'Chỉnh sửa thói quen' : 'Tạo thói quen mới'}</Text>

      {/* Name Input */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Tên thói quen *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="Ví dụ: Uống nước, Đọc sách, Tập thể dục..."
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Icon Picker */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Chọn biểu tượng</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              style={[styles.iconButton, { backgroundColor: colors.background, borderColor: colors.border }, icon === ic && { backgroundColor: '#e3f2fd', borderColor: colors.primary }]}
              onPress={() => setIcon(ic)}
            >
              <Text style={styles.iconText}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Color Picker */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Chọn màu</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((col) => (
            <TouchableOpacity
              key={col}
              style={[
                styles.colorButton,
                { backgroundColor: col },
                color === col && styles.colorButtonSelected,
              ]}
              onPress={() => setColor(col)}
            />
          ))}
        </View>
      </View>

      {/* Group */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Nhóm</Text>
        <View style={styles.groupGrid}>
          {GROUPS.map((grp) => (
            <TouchableOpacity
              key={grp}
              style={[styles.groupButton, { backgroundColor: colors.background, borderColor: colors.border }, group === grp && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setGroup(grp)}
            >
              <Text style={[styles.groupText, { color: colors.textSecondary }, group === grp && { color: '#fff' }]}>
                {grp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Goal Type */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Mục tiêu</Text>
        <View style={styles.goalTypeContainer}>
          <TouchableOpacity
            style={[styles.goalTypeButton, { backgroundColor: colors.background, borderColor: colors.border }, goalType === 'times_per_day' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => setGoalType('times_per_day')}
          >
            <Text style={[styles.goalTypeText, { color: colors.textSecondary }, goalType === 'times_per_day' && { color: '#fff' }]}>
              Mỗi ngày
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.goalTypeButton, { backgroundColor: colors.background, borderColor: colors.border }, goalType === 'times_per_week' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => setGoalType('times_per_week')}
          >
            <Text style={[styles.goalTypeText, { color: colors.textSecondary }, goalType === 'times_per_week' && { color: '#fff' }]}>
              Mỗi tuần
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, { marginTop: 8, backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="Số lần"
          placeholderTextColor={colors.textSecondary}
          value={goalValue}
          onChangeText={setGoalValue}
          keyboardType="number-pad"
        />
      </View>

      {/* Reminder Time */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Thời gian nhắc nhở (tùy chọn)</Text>
        <TimePicker
          value={reminderTime}
          onChange={setReminderTime}
          colors={colors}
        />
        {reminderTime && (
          <>
            <TouchableOpacity
              onPress={() => setReminderTime('')}
              style={styles.clearTimeButton}
            >
              <Text style={[styles.clearTimeText, { color: colors.primary }]}>
                ✕ Xóa thời gian nhắc nhở
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Ngày bắt đầu</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
          value={startDate}
          onChangeText={setStartDate}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Ngày kết thúc (tùy chọn)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
          value={endDate}
          onChangeText={setEndDate}
        />
      </View>

      {/* Difficulty */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Độ khó</Text>
        {renderDifficultyStars()}
      </View>

      {/* Active Toggle */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.text }]}>Đang hoạt động</Text>
          <Switch value={active} onValueChange={setActive} />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{isEdit ? 'Cập nhật' : 'Tạo mới'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Hủy</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  iconText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#333',
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  groupText: {
    fontSize: 14,
  },
  goalTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  goalTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  goalTypeText: {
    fontSize: 14,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 32,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearTimeButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  clearTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HabitEditScreen;
