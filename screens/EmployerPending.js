import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const EmployerPending = ({ navigation, route }) => {
  const { email, userId } = route.params;
  
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animation] = useState(new Animated.Value(0));
  const toastTimeoutRef = useRef(null);
  
  // Animation for the status card
  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Helper function to show toasts
  const showToast = (message, type) => {
    Toast.show({
      type: type || 'info',
      text1: type === 'success' ? 'Success' : 'Notification',
      text2: message,
      visibilityTime: 3000,
      position: 'top'
    });
  };

  const checkApprovalStatus = async () => {
    try {
      setLoading(true);
      Toast.show({
        type: 'info',
        text1: 'Checking Status',
        text2: 'Verifying your approval status...',
        visibilityTime: 2000,
        position: 'top'
      });
      
      const response = await axios.get(`${BASE_URL}/api/user/check-approval-status/${userId}`);
      
      if (response.data.success) {
        if (response.data.isApproved) {
          setIsApproved(true);
          // Store user data in AsyncStorage
          await AsyncStorage.setItem('employerData', JSON.stringify(response.data.userData));
          
          // First congratulatory toast
          Toast.show({
            type: 'success',
            text1: 'Account Approved! 🎉',
            text2: 'Your account has been approved by our admin team.',
            visibilityTime: 2000,
            position: 'top'
          });
          
          // Second congratulatory toast with delay
          setTimeout(() => {
            Toast.show({
              type: 'success',
              text1: 'Welcome Aboard! 🚀',
              text2: 'You now have full access to all employer features.',
              visibilityTime: 2000,
              position: 'top'
            });
          }, 2500);
          
          // Third toast before navigation
          setTimeout(() => {
            Toast.show({
              type: 'success',
              text1: 'Getting Ready... ✨',
              text2: 'Preparing your employer dashboard...',
              visibilityTime: 2000,
              position: 'top'
            });
            
            // Navigate after the last toast
            setTimeout(() => {
              navigation.replace('EmployerLogin');
            }, 2000);
          }, 5000);
        } else {
          Toast.show({
            type: 'info',
            text1: 'Still Pending',
            text2: 'Your account is still under review by our team.',
            visibilityTime: 3000,
            position: 'top'
          });
        }
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Failed to check approval status. Please try again.',
        visibilityTime: 4000,
        position: 'top'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Display welcome toast
    showToast('Welcome! Checking your account status...', 'info');
    
    // Initial check after a short delay to allow toast to display
    setTimeout(() => {
      checkApprovalStatus();
    }, 1000);

    // Set up polling interval (10 minutes)
    const interval = setInterval(checkApprovalStatus, 600000); 

    return () => {
      clearInterval(interval);
      // Clear any pending toast timeout
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleBackToLogin = () => {
    showToast('Going back to login screen...', 'info');
    setTimeout(() => {
      navigation.replace('EmployerLogin');
    }, 1000);
  };

  // Animation styles
  const cardScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1]
  });

  const cardOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (!isApproved) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [isApproved]);

  // The animation for the "Check Status" button (replaces Animatable)
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (!isApproved && !loading) {
      // Create a pulse animation for the button
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScaleAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(buttonScaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();
    }
    
    return () => buttonScaleAnim.stopAnimation();
  }, [isApproved, loading]);

  // The animation for the button container (replaces Animatable's bounceIn/fadeIn)
  const buttonContainerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(buttonContainerAnim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      useNativeDriver: true
    }).start();
  }, []);

  const buttonContainerStyle = {
    opacity: buttonContainerAnim,
    transform: [
      { 
        scale: buttonContainerAnim.interpolate({
          inputRange: [0, 0.6, 0.9, 1],
          outputRange: isApproved ? [0.3, 1.1, 0.9, 1] : [0.8, 1, 1, 1]
        }) 
      }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Gradient Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Verification</Text>
        <Text style={styles.headerSubtitle}>
          {isApproved ? 'Your account is now ready' : 'We\'re reviewing your details'}
        </Text>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.statusCard,
            { 
              transform: [{ scale: cardScale }],
              opacity: cardOpacity
            }
          ]}
        >
          {/* Status Icon */}
          <Animated.View style={[
            styles.iconContainer,
            isApproved ? styles.iconContainerApproved : styles.iconContainerPending,
            !isApproved && { transform: [{ scale: pulseAnim }] }
          ]}>
            <Icon 
              name={isApproved ? "check-circle" : "hourglass-empty"} 
              size={50} 
              color="#FFFFFF" 
            />
          </Animated.View>
          
          {/* Status Text */}
          <Text style={[
            styles.statusText,
            isApproved ? styles.statusTextApproved : styles.statusTextPending
          ]}>
            {isApproved ? 'APPROVED' : 'PENDING'}
          </Text>
          
          <Text style={styles.title}>
            {isApproved ? 'Account Approved!' : 'Approval Pending'}
          </Text>
          
          <View style={styles.emailContainer}>
            <Icon name="email" size={16} color="#4B5563" />
            <Text style={styles.email}>{email}</Text>
          </View>
          
          {!isApproved && (
            <>
              <View style={styles.divider} />
              
              <Text style={styles.message}>
                Your account is under review by our admin team. This usually takes 1-2 business days.
              </Text>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1E40AF" />
                  <Text style={styles.checkingText}>
                    Checking approval status...
                  </Text>
                </View>
              ) : (
                <View style={styles.refreshContainer}>
                  <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                    <TouchableOpacity 
                      style={styles.refreshButton}
                      onPress={checkApprovalStatus}
                      activeOpacity={0.7}
                    >
                      <Icon name="refresh" size={18} color="#FFFFFF" />
                      <Text style={styles.refreshText}>Check Status</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              )}
            </>
          )}

          <Animated.View style={buttonContainerStyle}>
            <TouchableOpacity
              style={[
                styles.button,
                isApproved ? styles.buttonApproved : styles.buttonPending
              ]}
              activeOpacity={0.8}
              onPress={isApproved ? () => {
                // Celebratory toast sequence when going to dashboard
                Toast.show({
                  type: 'success',
                  text1: 'Congratulations! 🎊',
                  text2: 'Your employer account is ready to use!',
                  visibilityTime: 2000,
                  position: 'top'
                });
                
                setTimeout(() => {
                  Toast.show({
                    type: 'success',
                    text1: 'Loading Dashboard 🌟',
                    text2: 'Taking you to your employer dashboard...',
                    visibilityTime: 2000,
                    position: 'top'
                  });
                  
                  setTimeout(() => {
                    navigation.replace('EmployerLogin');
                  }, 1000);
                }, 2500);
              } : handleBackToLogin}
            >
              <Text style={styles.buttonText}>
                {isApproved ? 'Go to Dashboard' : 'Back to Login'}
              </Text>
              <Icon 
                name={isApproved ? "dashboard" : "arrow-back"} 
                size={18} 
                color="#FFFFFF" 
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Need help? Contact support@labourlink.com
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: -30,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '92%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainerPending: {
    backgroundColor: '#3B82F6',
  },
  iconContainerApproved: {
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statusTextPending: {
    color: '#3B82F6',
  },
  statusTextApproved: {
    color: '#10B981',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#134083',
    textAlign: 'center',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 50,
    marginBottom: 20,
  },
  email: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginBottom: 20,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 25,
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  checkingText: {
    marginTop: 10,
    color: '#4B5563',
    fontSize: 14,
  },
  refreshContainer: {
    marginBottom: 25,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  refreshText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Toast styles
  toast: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonPending: {
    backgroundColor: '#1E40AF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  buttonApproved: {
    backgroundColor: '#059669',
    borderWidth: 1,
    borderColor: '#047857',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footer: {
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
  }
});

export default EmployerPending;