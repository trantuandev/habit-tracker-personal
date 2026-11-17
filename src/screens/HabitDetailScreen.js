import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useHabits } from '../context/HabitContext';

function formatDate(yyyyMMdd) {
  const [y,m,d] = yyyyMMdd.split('-');
  return `${d}/${m}/${y}`;
}

const HabitDetailScreen = ({ route, navigation }) => {
  const { habitId } = route.params;
  const { habits, getHistory, getStreak, removeHabit, updateHabit } = useHabits();
  const habit = habits.find(h=>h.id === habitId);
  const history = getHistory(habitId);

  const streak = getStreak(habitId);
  const total = Object.values(history).filter(v=>v).length;
  const days = Object.keys(history).sort((a,b)=>b.localeCompare(a));

  const handleDelete = () => {
    Alert.alert('Xóa?', 'Bạn muốn xóa thói quen này?', [
      { text: 'Cancel' },
      { text: 'OK', onPress:()=>{ removeHabit(habitId); navigation.goBack(); }},
    ]);
  };

  if (!habit) return <View style={{padding:40}}><Text>Không tìm thấy thói quen.</Text></View>;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{habit.name}</Text>
      {habit.desc ? <Text style={styles.desc}>{habit.desc}</Text> : null}
      <Text style={{marginTop:20,fontWeight:'bold'}}>Thống kê</Text>
      <Text>Chuỗi ngày liên tiếp: <Text style={{color:'#2e7d32'}}>{streak}</Text></Text>
      <Text>Tổng số ngày hoàn thành: <Text style={{color:'#1565c0'}}>{total}</Text></Text>
      <View style={styles.actions}>
        {/* Sửa sẽ quay lại màn hình list & pop modal edit */}
        <TouchableOpacity style={styles.actionBtn} onPress={()=>navigation.goBack()}><Text>Quay lại</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn,{backgroundColor:'#fbe9e7'}]} onPress={handleDelete}><Text style={{color:'#ee2222'}}>Xóa</Text></TouchableOpacity>
      </View>
      <Text style={{marginTop:20,marginBottom:5,fontWeight:'bold'}}>Lịch sử check-in:</Text>
      <FlatList
        data={days}
        renderItem={({item})=>history[item] && (
          <View style={styles.checkRow}><Text>✓</Text><Text style={{marginLeft:12}}>{formatDate(item)}</Text></View>
        )}
        keyExtractor={d=>d}
        style={{marginBottom:40}}
        ListEmptyComponent={<Text style={{color:'#888',padding:8}}>Chưa có ngày nào hoàn thành.</Text>}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#fff',padding:18},
  title:{fontSize:22,fontWeight:'bold',color:'#1565c0'},
  desc:{fontSize:15,color:'#888',marginTop:4},
  actions:{flexDirection:'row',marginTop:20},
  actionBtn:{backgroundColor:'#e3f2fd',borderRadius:6,paddingVertical:7,paddingHorizontal:20,marginRight:10},
  checkRow:{flexDirection:'row',alignItems:'center',padding:6,borderBottomWidth:1,borderColor:'#f0f0f0'}
});
export default HabitDetailScreen;




