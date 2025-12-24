import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileLockStatus = ({ navigation }) => {
  const [lockStatus, setLockStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchLockStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          throw new Error("User data not found");
        }

        const parsedUser = JSON.parse(userData);
        const userId = parsedUser._id;

        // Fetch applications to find hired status
        const response = await axios.get(`https://laborlink.co.in/api/user/getlistOOfaplly/${userId}`);
        const applications = response.data.success || [];

        // Find the hired application
        const hiredApplication = applications.find(app =>
          app.applicationStatus === 'hired' ||
          app.applicationStatus === 'selected' ||
          (app.offerLetter && app.offerLetter.status === 'accepted')
        );

        if (hiredApplication) {
          // Calculate lock status based on hire date
          const hireDate = new Date(hiredApplication.updatedAt || hiredApplication.createdAt);
          const currentDate = new Date();
          const lockPeriodDays = 90; // 3 months
          const unlockDate = new Date(hireDate);
          unlockDate.setDate(unlockDate.getDate() + lockPeriodDays);

          const daysPassed = Math.floor((currentDate - hireDate) / (1000 * 60 * 60 * 24));
          const daysRemaining = Math.max(0, lockPeriodDays - daysPassed);
          const isLocked = daysRemaining > 0;

          setLockStatus({
            isLocked,
            hireDate: hireDate.toISOString().split('T')[0],
            unlockDate: unlockDate.toISOString().split('T')[0],
            company: hiredApplication.companyName || 'Unknown Company',
            position: hiredApplication.jobTitle || 'Unknown Position',
            daysRemaining,
            daysPassed,
            lockPeriodDays,
            applicationId: hiredApplication._id
          });
        } else {
          // User is not hired, profile is active
          setLockStatus({
            isLocked: false,
            company: null,
            position: null,
            daysRemaining: 0
          });
        }

        // Animate in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();

      } catch (error) {
        console.error("Error fetching lock status:", error);
        Alert.alert("Error", "Failed to fetch profile lock status.");
      } finally {
        setLoading(false);
      }
    };

    fetchLockStatus();
  }, []);

  const getProgressPercentage = () => {
    if (!lockStatus || !lockStatus.isLocked) return 100;
    const progress = (lockStatus.daysPassed / lockStatus.lockPeriodDays) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Lock Status</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#26437c" />
          <Text style={styles.loadingText}>Loading profile status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lockStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Lock Status</Text>
        </View>
        <View style={styles.center}>
          <Icon name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Unable to load profile status</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Lock Status</Text>
      </View>

      <ScrollView style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Lock Status Card */}
          <View style={styles.card}>
            <View style={styles.lockStatusHeader}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: lockStatus.isLocked ? '#FEE2E2' : '#DCFCE7' }
              ]}>
                <Icon
                  name={lockStatus.isLocked ? "lock" : "lock-open"}
                  size={32}
                  color={lockStatus.isLocked ? "#EF4444" : "#10B981"}
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.lockStatusText}>
                  {lockStatus.isLocked ? 'Profile Locked' : 'Profile Active'}
                </Text>
                <Text style={styles.lockStatusSubtext}>
                  {lockStatus.isLocked
                    ? 'You are currently employed'
                    : 'Available for new opportunities'
                  }
                </Text>
              </View>
            </View>

            {lockStatus.isLocked && (
              <>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Lock Period Progress</Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(getProgressPercentage())}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${getProgressPercentage()}%` }
                      ]}
                    />
                  </View>
                  <View style={styles.progressFooter}>
                    <Text style={styles.daysRemaining}>
                      {lockStatus.daysRemaining} days remaining
                    </Text>
                    <Text style={styles.daysPassed}>
                      {lockStatus.daysPassed} days completed
                    </Text>
                  </View>
                </View>

                {/* Employment Details */}
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Employment Details</Text>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Icon name="business" size={20} color="#26437c" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Company</Text>
                      <Text style={styles.detailValue}>{lockStatus.company}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Icon name="work" size={20} color="#26437c" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Position</Text>
                      <Text style={styles.detailValue}>{lockStatus.position}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Icon name="event" size={20} color="#26437c" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Hire Date</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(lockStatus.hireDate)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Icon name="event-available" size={20} color="#26437c" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Unlock Date</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(lockStatus.unlockDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Lock Policy Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Icon name="info" size={20} color="#26437c" /> Lock Policy Information
            </Text>
            <View style={styles.policyItem}>
              <Icon name="schedule" size={24} color="#2563EB" />
              <Text style={styles.policyText}>
                Profile is automatically locked for 90 days after being hired
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Icon name="block" size={24} color="#2563EB" />
              <Text style={styles.policyText}>
                During lock period, you cannot apply for new positions
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Icon name="verified" size={24} color="#2563EB" />
              <Text style={styles.policyText}>
                Profile unlocks automatically after the lock period ends
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Icon name="update" size={24} color="#2563EB" />
              <Text style={styles.policyText}>
                You can update your profile anytime, even when locked
              </Text>
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Icon name="help" size={20} color="#26437c" /> Need Help?
            </Text>
            <Text style={styles.supportDescription}>
              Have questions about your profile lock status or employment?
              Our support team is here to help.
            </Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => Alert.alert('Contact Support', 'Support feature will be implemented soon.')}
            >
              <Icon name="headset-mic" size={24} color="#fff" />
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#26437c',
    padding: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  lockStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  lockStatusText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#26437c',
  },
  lockStatusSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#26437c',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysRemaining: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  daysPassed: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  policyText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 12,
    lineHeight: 20,
  },
  supportDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileLockStatus;