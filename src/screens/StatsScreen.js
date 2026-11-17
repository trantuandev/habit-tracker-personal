import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useHabits } from '../context/HabitContext';

const StatsScreen = () => {
  const { habits, progress, getStreak } = useHabits();
  let totalCheckins = 0;
  let maxStreak = 0;
  let topHabit = null;
  habits.forEach(h => {
    const count = Object.values(progress[h.id]||{}).filter(v=>v).length;
    const streak = getStreak(h.id);
    totalCheckins += count;
    if (streak > maxStreak) { maxStreak = streak; topHabit = h; }
  });
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Thống kê tổng quan</Text>
      <Text>Số thói quen đang theo dõi: <Text style={styles.bold}>{habits.length}</Text></Text>
      <Text>Tổng số lần hoàn thành: <Text style={styles.bold}>{totalCheckins}</Text></Text>
      <Text>Chuỗi ngày liên tiếp dài nhất: <Text style={styles.bold}>{maxStreak}</Text></Text>
      <Text style={{marginTop:18, fontWeight:'bold'}}>Thói quen streak tốt nhất:</Text>
      {topHabit ? (
        <Text>- {topHabit.name} ({getStreak(topHabit.id)} ngày liên tiếp)</Text>
      ) : <Text>Chưa có...</Text>}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#fff', padding:24 },
  heading: { fontSize:19, fontWeight:'bold', color:'#1976d2', marginBottom:20 },
  bold: { color:'#2e7d32', fontWeight:'bold' },
});
export default StatsScreen;









