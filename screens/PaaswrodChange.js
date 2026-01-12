import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8500';

const PasswordChange = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleNewPasswordChange = (password) => {
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return '#EF4444';
    if (passwordStrength <= 50) return '#F59E0B';
    if (passwordStrength <= 75) return '#3B82F6';
    return '#10B981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      console.log("userid", storedUserData);
      const userData = JSON.parse(storedUserData);
      const userId = userData._id;
      console.log('User ID:', userId);
      const response = await fetch(`${BASE_URL}/api/user/changePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          oldPassword: currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Icon name="security" size={32} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>Change Your Password</Text>
            <Text style={styles.cardSubtitle}>
              Keep your account secure by updating your password regularly
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  ref={currentPasswordRef}
                  style={styles.input}
                  placeholder="Current Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => newPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showCurrentPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Icon name="lock-open" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  ref={newPasswordRef}
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={handleNewPasswordChange}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showNewPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {newPassword.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthText}>Password Strength</Text>
                  <Text style={[styles.strengthLevel, { color: getPasswordStrengthColor() }]}>
                    {getPasswordStrengthText()}
                  </Text>
                </View>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }
                    ]}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Icon name="check-circle" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  ref={confirmPasswordRef}
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
                  blurOnSubmit={true}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <View style={styles.errorContainer}>
                <Icon name="error" size={16} color="#EF4444" />
                <Text style={styles.errorText}>Passwords do not match</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.changeButton,
              loading && styles.buttonDisabled,
              (newPassword && confirmPassword && newPassword === confirmPassword) && styles.buttonActive
            ]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <>
                  <Icon name="hourglass-empty" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Updating...</Text>
                </>
              ) : (
                <>
                  <Icon name="security" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Update Password</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.securityTips}>
            <Text style={styles.tipsTitle}>Security Tips</Text>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Use at least 8 characters</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Include uppercase and lowercase letters</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Add numbers and special characters</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF'
  },
  header: {
    height: 75,
    backgroundColor: '#26437c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 0
  },
  backButton: {
    padding: 8,
    borderRadius: 20
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold'
  },
  content: {
    padding: 15
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  iconContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 30,
    padding: 10,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4
  },
  formContainer: {
    marginBottom: 20
  },
  inputWrapper: {
    marginBottom: 15
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    minHeight: 48
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    height: 48,
    color: '#111827',
    fontSize: 16,
    paddingVertical: 0
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 4
  },
  passwordStrengthContainer: {
    marginBottom: 15,
    paddingHorizontal: 4
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  strengthText: {
    fontSize: 12,
    color: '#6B7280'
  },
  strengthLevel: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  strengthBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden'
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4
  },
  changeButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonActive: {
    backgroundColor: '#4338CA'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16
  },
  securityTips: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  tipText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#4B5563',
    flex: 1
  }
});

export default PasswordChange;