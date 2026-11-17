import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';

const TimePicker = ({ value, onChange, colors }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // Parse giá trị hiện tại
  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts.length === 2) {
        const hour = parseInt(parts[0], 10) || 7;
        const minute = parseInt(parts[1], 10) || 0;
        setSelectedHour(hour);
        setSelectedMinute(minute);
      }
    } else {
      setSelectedHour(7);
      setSelectedMinute(0);
    }
  }, [value]);

  // Scroll đến giá trị đã chọn khi mở modal
  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => {
        const itemHeight = 54; // height của mỗi item (50 + margin 2*2)
        if (hourScrollRef.current) {
          hourScrollRef.current.scrollTo({
            y: selectedHour * itemHeight,
            animated: true,
          });
        }
        if (minuteScrollRef.current) {
          minuteScrollRef.current.scrollTo({
            y: selectedMinute * itemHeight,
            animated: true,
          });
        }
      }, 100);
    }
  }, [modalVisible, selectedHour, selectedMinute]);

  // Tạo danh sách giờ (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Tạo danh sách phút (0, 15, 30, 45 hoặc 0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatTime = (hour, minute) => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleConfirm = () => {
    const timeString = formatTime(selectedHour, selectedMinute);
    onChange(timeString);
    setModalVisible(false);
  };

  const handleCancel = () => {
    // Khôi phục giá trị ban đầu
    if (value) {
      const parts = value.split(':');
      if (parts.length === 2) {
        setSelectedHour(parseInt(parts[0], 10) || 7);
        setSelectedMinute(parseInt(parts[1], 10) || 0);
      }
    }
    setModalVisible(false);
  };

  const formatDisplayTime = (timeString) => {
    if (!timeString) return 'Chọn thời gian';
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period} (${timeString})`;
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerButtonText, { color: value ? colors.text : colors.textSecondary }]}>
          {value ? formatDisplayTime(value) : 'Chọn thời gian nhắc nhở'}
        </Text>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>⌄</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Chọn thời gian nhắc nhở</Text>

            <View style={styles.pickerContainer}>
              {/* Giờ */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Giờ</Text>
                <ScrollView
                  ref={hourScrollRef}
                  style={styles.scrollPicker}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={54}
                  decelerationRate="fast"
                >
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && {
                          backgroundColor: colors.primary + '20',
                        },
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: colors.text },
                          selectedHour === hour && {
                            color: colors.primary,
                            fontWeight: 'bold',
                            fontSize: 18,
                          },
                        ]}
                      >
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={[styles.separator, { color: colors.text }]}>:</Text>

              {/* Phút */}
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Phút</Text>
                <ScrollView
                  ref={minuteScrollRef}
                  style={styles.scrollPicker}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={54}
                  decelerationRate="fast"
                >
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && {
                          backgroundColor: colors.primary + '20',
                        },
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: colors.text },
                          selectedMinute === minute && {
                            color: colors.primary,
                            fontWeight: 'bold',
                            fontSize: 18,
                          },
                        ]}
                      >
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={handleConfirm}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 15,
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    height: 250,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    marginBottom: 10,
    fontWeight: '600',
  },
  scrollPicker: {
    height: 200,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerItemText: {
    fontSize: 16,
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginTop: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor từ style inline
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimePicker;

