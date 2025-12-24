import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const ProfileLockScreen = ({ navigation }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      const lockStartDate = await AsyncStorage.getItem('lockStartDate');
      
      if (storedData) {
        const user = JSON.parse(storedData);
        setUserData(user);
        
        if (!lockStartDate) {
          // If lock start date doesn't exist, set it now
          const now = new Date().toISOString();
          await AsyncStorage.setItem('lockStartDate', now);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const updateTimer = async () => {
    try {
      const lockStartDate = await AsyncStorage.getItem('lockStartDate');
      if (lockStartDate) {
        const startDate = new Date(lockStartDate);
        const now = new Date();
        const endDate = new Date(startDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days
        
        if (now >= endDate) {
          // Lock period is over
          await AsyncStorage.removeItem('lockStartDate');
          await AsyncStorage.setItem('isLocked', 'false');
          // Navigate back to main app
          navigation.reset({
            index: 0,
            routes: [{ name: 'EmployeeDashboard' }],
          });
          return;
        }

        const timeLeft = endDate - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      }
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="lock" size={48} color="#4F46E5" />
          <Text style={styles.title}>Profile Locked</Text>
          <Text style={styles.subtitle}>
            Congratulations on your selection! Your profile is currently in a lock period.
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerTitle}>Lock Period Remaining</Text>
          {timeRemaining && (
            <View style={styles.timerGrid}>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{timeRemaining.days}</Text>
                <Text style={styles.timerLabel}>Days</Text>
              </View>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{timeRemaining.hours}</Text>
                <Text style={styles.timerLabel}>Hours</Text>
              </View>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{timeRemaining.minutes}</Text>
                <Text style={styles.timerLabel}>Minutes</Text>
              </View>
              <View style={styles.timerBlock}>
                <Text style={styles.timerNumber}>{timeRemaining.seconds}</Text>
                <Text style={styles.timerLabel}>Seconds</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Icon name="work" size={24} color="#4F46E5" />
            <Text style={styles.infoTitle}>Selected Position</Text>
            <Text style={styles.infoValue}>{userData?.jobRole || 'Position'}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Icon name="business" size={24} color="#4F46E5" />
            <Text style={styles.infoTitle}>Company</Text>
            <Text style={styles.infoValue}>{userData?.companyName || 'Company'}</Text>
          </View>
        </View>

        <View style={styles.noteContainer}>
          <Icon name="info" size={20} color="#4F46E5" />
          <Text style={styles.noteText}>
            During this period, you won't be able to apply for other positions. 
            This helps ensure a smooth onboarding process with your new employer.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#134083',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  timerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
    textAlign: 'center',
  },
  timerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timerBlock: {
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    minWidth: 70,
  },
  timerNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  timerLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  infoTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
    marginTop: 4,
    textAlign: 'center',
  },
  noteContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#134083',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileLockScreen; 