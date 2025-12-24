import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LimitAlert from '../components/LimitAlert';

const ApplicationDetails = ({ navigation, route }) => {
  const { application } = route.params;
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInterviewScheduled, setIsInterviewScheduled] = useState(false);
  const [limitAlert, setLimitAlert] = useState({ visible: false, title: '', message: '' });

  console.log('Application data:', application);

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Add this function to check if interview is already scheduled
  const checkInterviewStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { _id: employerId } = JSON.parse(userData);
      
      // Backend expects employerId and companyId
      const response = await axios.get(`${BASE_URL}/api/user/getcallinterview/${employerId}/${application.companyId}`);
      
      if (response.data.success) {
        // Check if this application's user already has an interview scheduled
        const hasInterview = response.data.data.some(
          interview => interview.userId === application.userId?._id
        );
        setIsInterviewScheduled(hasInterview);
      }
    } catch (error) {
      console.error('Error checking interview status:', error);
    }
  };

  // Add this to useEffect
  useEffect(() => {
    if (application.status === 'shortlisted') {
      checkInterviewStatus();
    }
  }, [application]);

  // Update handleShortlist function
  const handleShortlist = async () => {
    try {
      setIsShortlisting(true);
      
      // include employerId for backend validation & usage
      let employerId;
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        employerId = userDataStr ? JSON.parse(userDataStr)._id : undefined;
      } catch {}
      const response = await axios.post(`${BASE_URL}/api/user/addShortList`, {
        userId: application.userId?._id,
        companyId: application.companyId,
        employerId
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Candidate has been shortlisted successfully!',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Navigate back to JobDetails with the job information
              navigation.navigate('JobDetails', { 
                job: { 
                  id: application.companyId,
                  title: application.jobTitle,
                  company: application.companyName,
                }, 
                activeTab: 'shortlisted' 
              });
            }
          }]
        );
      } else {
        const msg = response.data.error || response.data.message || response.data.success || 'Already shortlisted';
        setLimitAlert({ visible: true, title: 'Limit Reached', message: msg });
      }
    } catch (error) {
      console.error('Shortlisting error:', error);
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
      if (status === 402 || status === 403) {
        setLimitAlert({ visible: true, title: 'Limit Reached', message: serverMsg || 'You have reached your daily review limit.' });
      } else {
        Alert.alert('Error', serverMsg || 'Failed to shortlist candidate');
      }
    } finally {
      setIsShortlisting(false);
    }
  };

  // Update handleReject function
  const handleReject = async () => {
    try {
      setIsRejecting(true);
      
      // include employerId for backend validation & usage
      let employerId;
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        employerId = userDataStr ? JSON.parse(userDataStr)._id : undefined;
      } catch {}
      const response = await axios.post(`${BASE_URL}/api/user/rejectApply`, {
        userId: application.userId?._id,
        companyId: application.companyId,
        employerId
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Application has been rejected',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Navigate back to JobDetails with the job information
              navigation.navigate('JobDetails', { 
                job: { 
                  id: application.companyId,
                  title: application.jobTitle,
                  company: application.companyName,
                }, 
                activeTab: 'rejected' 
              });
            }
          }]
        );
      } else {
        const msg = response.data.error || response.data.message || 'Already rejected';
        setLimitAlert({ visible: true, title: 'Limit Reached', message: msg });
      }
   
    } catch (error) {
      console.error('Rejection error:', error);
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
      if (status === 402 || status === 403) {
        setLimitAlert({ visible: true, title: 'Limit Reached', message: serverMsg || 'You have reached your daily review limit.' });
      } else {
        Alert.alert('Error', serverMsg || 'Failed to reject application');
      }
    } finally {
      setIsRejecting(false);
    }
  };

  const renderActionButton = () => {
    // If application is already shortlisted
    if (application.status === 'shortlisted') {
      if (application.isInterviewScheduled || isInterviewScheduled) {
        return (
          <View style={[styles.actionButton, { backgroundColor: '#9CA3AF' }]}>
            <Icon name="event-available" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Interview Scheduled</Text>
          </View>
        );
      }
      
      return (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => {
            navigation.navigate('InterviewScheduler', {
              application: application,
              onScheduled: () => {
                setIsInterviewScheduled(true);
                route.params?.onStatusChange?.();
              }
            });
          }}
        >
          <Icon name="schedule" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.actionButtonText}>Schedule Interview</Text>
        </TouchableOpacity>
      );
    }

    // If application is rejected, don't show any action button
    if (application.status === 'rejected') {
      return null;
    }

    // For pending applications, show Shortlist button
    return (
      <TouchableOpacity 
        style={[
          styles.actionButton,
          { backgroundColor: isShortlisting ? '#9CA3AF' : '#3B82F6' }
        ]}
        onPress={handleShortlist}
        disabled={isShortlisting}
      >
        <Icon name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.actionButtonText}>
          {isShortlisting ? 'Processing...' : 'Shortlist Candidate'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Candidate Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileInitials}>
                {application.userId?.fullName?.charAt(0) || 'A'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.candidateName}>
                {application.userId?.fullName || 'No Name'}
              </Text>
              <Text style={styles.jobTitle}>{application.jobTitle}</Text>
              <View style={styles.locationContainer}>
                <Icon name="location-on" size={16} color="#6B7280" />
                <Text style={styles.location}>
                  {application.userId?.location || 'Location not specified'}
                </Text>
              </View>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(application.status) }
            ]}>
              <Text style={styles.statusText}>{application.status}</Text>
            </View>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Icon name="phone" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                {application.userId?.phone || 'No phone'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="email" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                {application.userId?.email || 'No email'}
              </Text>
            </View>
          </View>

          <View style={styles.applicationDates}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Applied On:</Text>
              <Text style={styles.dateValue}>
                {formatDate(application.appliedOn)}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Last Updated:</Text>
              <Text style={styles.dateValue}>
                {formatDate(application.updatedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Education Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Education</Text>
          {application.userId?.education?.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={styles.instituteName}>{edu.instituteName}</Text>
              <Text style={styles.degree}>{edu.degree} in {edu.field}</Text>
              <View style={styles.eduDuration}>
                <Text style={styles.duration}>
                  {edu.startDate} - {edu.endDate}
                </Text>
                <Text style={styles.grade}>Grade: {edu.grade}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Skills Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {application.userId?.skills?.length > 0 ? (
              application.userId.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No skills specified</Text>
            )}
          </View>
        </View>

        {/* Company Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Company Details</Text>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              Applied to: {application.companyName}
            </Text>
            <Text style={styles.jobPosition}>
              Position: {application.jobTitle}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modified Footer */}
      <View style={styles.footer}>
        {renderActionButton()}
        {/* Only show Reject button if application is not already rejected */}
        {application.status !== 'rejected' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
            onPress={handleReject}
            disabled={loading || isRejecting}
          >
            <Icon name="close" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <LimitAlert
        visible={limitAlert.visible}
        title={limitAlert.title}
        message={limitAlert.message}
        onClose={() => setLimitAlert({ ...limitAlert, visible: false })}
      />
    </SafeAreaView>
  );
};

// Add these new styles
const additionalStyles = {
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4B5563',
  },
  applicationDates: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  dateValue: {
    fontSize: 14,
    color: '#134083',
    fontWeight: '500',
  },
  educationItem: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  instituteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  degree: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  eduDuration: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
  },
  grade: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  companyInfo: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#134083',
    marginBottom: 4,
  },
  jobPosition: {
    fontSize: 14,
    color: '#4B5563',
  }
};

// Add this helper function
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return '#059669';
    case 'rejected':
      return '#DC2626';
    case 'applied':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

// Update your existing StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#134083',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    color: '#134083',
    fontSize: 14,
    fontWeight: '500',
  },
  experienceItem: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  position: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  responsibilities: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  documentName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#134083',
  },
  notesText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  ...additionalStyles,
});

export default ApplicationDetails; 