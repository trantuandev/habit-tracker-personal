import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import HabitCard from '../components/HabitCard';

const HabitsScreen = ({ navigation }) => {
  const { habits, removeHabit, updateHabit } = useHabits();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'

  // Filter habits based on search and active status
  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && habit.active) ||
      (filterActive === 'inactive' && !habit.active);
    return matchesSearch && matchesFilter;
  });

  // Group habits by category
  const groupedHabits = filteredHabits.reduce((acc, habit) => {
    const group = habit.group || 'Khác';
    if (!acc[group]) acc[group] = [];
    acc[group].push(habit);
    return acc;
  }, {});

  const handleEdit = (habit) => {
    navigation.navigate('HabitEdit', { habit });
  };

  const handleDelete = (habitId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa thói quen này? Tất cả dữ liệu liên quan sẽ bị xóa.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => removeHabit(habitId),
        },
      ]
    );
  };

  const handleTogglePause = (habit) => {
    updateHabit({
      ...habit,
      active: !habit.active,
    });
  };

  const renderFilterButton = (label, value) => (
    <TouchableOpacity
      style={[styles.filterBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }, filterActive === value && { backgroundColor: colors.primary, borderColor: colors.primary }]}
      onPress={() => setFilterActive(value)}
    >
      <Text style={[styles.filterText, { color: colors.textSecondary }, filterActive === value && { color: '#fff' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.screenBackground }]}>
      {/* Header with Add Button */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Thói Quen</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('HabitEdit', {})}
        >
          <Text style={styles.addButtonText}>+ Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Tìm kiếm thói quen..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('Tất cả', 'all')}
        {renderFilterButton('Đang hoạt động', 'active')}
        {renderFilterButton('Tạm dừng', 'inactive')}
      </View>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {searchQuery ? 'Không tìm thấy thói quen' : 'Chưa có thói quen nào'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {!searchQuery && 'Nhấn "Thêm mới" để tạo thói quen đầu tiên'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={Object.keys(groupedHabits)}
          keyExtractor={(item) => item}
          renderItem={({ item: group }) => (
            <View style={styles.groupSection}>
              <Text style={[styles.groupTitle, { color: colors.text }]}>{group}</Text>
              {groupedHabits[group].map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePause={handleTogglePause}
                  showActions={true}
                  allowCheck={false}
                />
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Stats Footer */}
      <View style={[styles.statsFooter, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{habits.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tổng số</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{habits.filter(h => h.active).length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Đang hoạt động</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{Object.keys(groupedHabits).length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Nhóm</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 15,
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontSize: 18,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 80,
  },
  groupSection: {
    marginTop: 12,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  statsFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default HabitsScreen;
