import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useHabits } from '../context/HabitContext';
import HabitCard from '../components/HabitCard';

const HabitListScreen = ({ navigation }) => {
  const { habits, addHabit, removeHabit, updateHabit } = useHabits();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const openModal = (habit=null) => {
    setEditingHabit(habit);
    setName(habit ? habit.name : '');
    setDesc(habit ? habit.desc : '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setEditingHabit(null); setName(''); setDesc(''); setModalVisible(false);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Vui lòng nhập tên thói quen'); return; }
    if (editingHabit) {
      updateHabit({ ...editingHabit, name, desc });
    } else {
      addHabit({ name, desc });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    Alert.alert('Xóa?', 'Bạn muốn xóa thói quen này?', [
      { text: 'Cancel' },
      { text: 'OK', onPress:()=> removeHabit(id) },
    ]);
  };

  const handleDetail = (habit) => {
    navigation.navigate('HabitDetail', { habitId: habit.id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách Thói Quen</Text>
      <FlatList
        data={habits}
        renderItem={({item}) => (
          <HabitCard
            habit={item}
            onEdit={openModal}
            onDelete={handleDelete}
            onDetail={handleDetail}
          />
        )}
        keyExtractor={h=>h.id}
        ListEmptyComponent={<Text style={{padding:20, color:'#aaa'}}>Chưa có thói quen nào.</Text>}
      />

      <TouchableOpacity style={styles.addBtn} onPress={()=>openModal()}>
        <Text style={styles.addBtnText}>+ Thêm thói quen</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingHabit ? 'Sửa thói quen' : 'Thêm thói quen'}</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Tên thói quen"
              style={styles.input} />
            <TextInput value={desc} onChangeText={setDesc} placeholder="Mô tả (tùy chọn)"
              style={styles.input} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn2} onPress={closeModal}><Text>Hủy</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={handleSave}><Text>Lưu</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f6f8fc' },
  header:{ fontSize:22, fontWeight:'bold', color:'#1565c0', margin:20, marginBottom:12 },
  addBtn: {
    backgroundColor:'#42a5f5', alignSelf:'center', paddingHorizontal:26, paddingVertical:10,
    borderRadius:20, margin:15,
  },
  addBtnText: { color:'#fff', fontWeight:'bold', fontSize:16 },
  modalBg: { flex:1,backgroundColor:'rgba(0,0,0,0.2)',justifyContent:'center', alignItems:'center' },
  modalContent:{backgroundColor:'#fff',borderRadius:16,padding:20,width:'80%',shadowColor:'#222',elevation:3},
  modalTitle:{fontSize:18,fontWeight:'bold',marginBottom:12},
  input:{borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10,marginVertical:7},
  modalActions:{flexDirection:'row',justifyContent:'flex-end',marginTop:12},
  modalBtn:{backgroundColor:'#1976d2',paddingHorizontal:20,paddingVertical:7,borderRadius:8,marginLeft:10},
  modalBtn2: {backgroundColor:'#eee',paddingHorizontal:16,paddingVertical:7,borderRadius:8},
});
export default HabitListScreen;









