import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ToastAndroid,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import employeelogo from '../assets/logo.jpeg';

const EmployerLogin = ({ navigation }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true); // Set to true by default
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.email) newErrors.email = 'Email is required';
    if (!credentials.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      console.log('Attempting login with:', credentials);
      const response = await axios.post(`${BASE_URL}/api/user/loginEmployer`, {
        email: credentials.email,
        password: credentials.password,
      });

      console.log('Login Response:', response.data);

      if (response.data.msg === 'Successfully login' && response.data.success) {
        const userData = response.data.success;
        console.log('User Data:', userData);

        if (userData) {
          // Store user data
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          await AsyncStorage.setItem('userType', 'employer');
          ToastAndroid.show('Login Successful!', ToastAndroid.SHORT);
          if (userData.isApproved && userData.status === 'Approved') {
            navigation.replace('EmployerDashboard');
          } else {
            navigation.replace('EmployerPending', {
              email: credentials.email,
              userId: userData._id
            });
          }
        } else {
          ToastAndroid.show('Login Failed: User data not found', ToastAndroid.LONG);
        }
      } else {
        ToastAndroid.show(`Login Failed: ${response.data.msg || 'Invalid credentials'}`, ToastAndroid.LONG);
      }
    } catch (error) {
      ToastAndroid.show('Failed to login. Please check your credentials.', ToastAndroid.LONG);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <FastImage
          source={employeelogo}
          style={styles.bannerImage}
          resizeMode={FastImage.resizeMode.contain}
        />

        <Text style={styles.title}>Employer Login</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={credentials.email}
            onChangeText={(text) => setCredentials({ ...credentials, email: text.trim() })}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={credentials.password}
              onChangeText={(text) => setCredentials({ ...credentials, password: text })}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>


        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('TermsEmployer')}
            >
              Terms & Conditions
            </Text>
            {' '}and{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Privacy')}
            >
              Privacy Policy
            </Text>
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, !agreedToTerms && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading || !agreedToTerms}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>



        {/* <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('EmployerRegistration')}
        >
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  bannerImage: {
    width: '80%',
    height: Dimensions.get('window').height * 0.20,
    marginBottom: 16,
    alignSelf: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: '#134083',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#134083',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333"
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
    padding: 10,
  },
  registerText: {
    color: '#4B5563',
    textAlign: 'center',
    fontSize: 14,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#134083',
    borderColor: '#134083',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    flexWrap: 'wrap',
  },
  linkText: {
    color: '#134083',
    fontWeight: '500',
  },
});

export default EmployerLogin;