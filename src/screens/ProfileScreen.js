import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import { pickImage } from '../services/imageService';
import Ionicons from '@expo/vector-icons/Ionicons';

const ProfileScreen = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { habits, logs } = useHabits();
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  
  // Update editedUsername when user changes
  React.useEffect(() => {
    if (user?.username) {
      setEditedUsername(user.username);
    }
  }, [user]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleSaveUsername = async () => {
    if (!editedUsername.trim()) {
      Alert.alert('Lỗi', 'Tên hiển thị không được để trống');
      return;
    }

    setIsLoading(true);
    const result = await updateProfile({ username: editedUsername.trim() });
    setIsLoading(false);

    if (result.success) {
      setIsEditing(false);
      Alert.alert('Thành công', 'Đã cập nhật tên hiển thị');
    } else {
      Alert.alert('Lỗi', result.error || 'Không thể cập nhật');
    }
  };

  const handleChangeAvatar = async () => {
    Alert.alert(
      'Thay đổi avatar',
      'Chọn ảnh từ thiết bị',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chọn ảnh',
          onPress: async () => {
            setIsLoading(true);
            const image = await pickImage();
            setIsLoading(false);
            
            if (image && image.uri) {
              const result = await updateProfile({ avatar: image.uri });
              if (result.success) {
                Alert.alert('Thành công', 'Đã cập nhật avatar');
              } else {
                Alert.alert('Lỗi', 'Không thể cập nhật avatar');
              }
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    const result = await changePassword(oldPassword, newPassword);
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Thành công', 'Đã đổi mật khẩu');
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Lỗi', result.error || 'Không thể đổi mật khẩu');
    }
  };

  // Calculate stats
  const completedLogs = logs.filter(log => log.completed);
  const completionRate = logs.length > 0 
    ? Math.round((completedLogs.length / logs.length) * 100) 
    : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleChangeAvatar}
          disabled={isLoading}
        >
          <View style={[styles.avatar, { backgroundColor: user?.avatar ? 'transparent' : '#fff' }]}>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        {isEditing ? (
          <View style={styles.editForm}>
            <TextInput
              style={styles.editInput}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="Tên hiển thị"
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setEditedUsername(user?.username || '');
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveUsername}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.username, { color: colors.headerText }]}>{user?.username || 'User'}</Text>
            <Text style={[styles.email, { color: colors.headerText }]}>{user?.email || ''}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil-outline" size={16} color="#1976d2" />
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={styles.statValue}>{habits.length}</Text>
          <Text style={styles.statLabel}>Thói quen</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={styles.statValue}>{logs.length}</Text>
          <Text style={styles.statLabel}>Hoạt động</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={styles.statValue}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
      </View>

      {/* Theme Toggle */}
      <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color="#1976d2" />
        <Text style={[styles.menuText, { color: colors.text }]}>Chế độ {isDark ? 'tối' : 'sáng'}</Text>
        <Switch
          value={isDark}
          onValueChange={(value) => toggleTheme(value ? 'dark' : 'light')}
          trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
          thumbColor={isDark ? '#1976d2' : '#f4f3f4'}
        />
      </TouchableOpacity>

      {/* Change Password Section */}
      {isChangingPassword ? (
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Đổi mật khẩu</Text>
            <TouchableOpacity
              onPress={() => {
                setIsChangingPassword(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              <Ionicons name="close-circle-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Mật khẩu cũ</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Nhập mật khẩu cũ"
              placeholderTextColor={colors.textSecondary}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Mật khẩu mới</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor={colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Xác nhận mật khẩu</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.changePasswordButtonText}>Đổi mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => setIsChangingPassword(true)}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#1976d2" />
          <Text style={[styles.menuText, { color: colors.text }]}>Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#f44336" />
        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#e3f2fd',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  editForm: {
    width: '100%',
    paddingHorizontal: 20,
  },
  editInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  changePasswordButton: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  logoutButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 40,
  },
});

export default ProfileScreen;

