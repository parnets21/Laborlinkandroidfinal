import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InterviewDetails = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interview Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Interview Status Card */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Scheduled</Text>
            </View>
            <Text style={styles.dateTime}>Today, 10:00 AM</Text>
          </View>

          <View style={styles.positionInfo}>
            <Text style={styles.positionTitle}>React Native Developer</Text>
            <Text style={styles.department}>Engineering Department</Text>
          </View>
        </View>

        {/* Candidate Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Candidate</Text>
          <View style={styles.candidateInfo}>
            <Image
              source={{ uri: 'https://via.placeholder.com/60' }}
              style={styles.candidateImage}
            />
            <View style={styles.candidateDetails}>
              <Text style={styles.candidateName}>John Doe</Text>
              <Text style={styles.candidateLocation}>Mumbai, India</Text>
              <Text style={styles.experience}>5 years experience</Text>
            </View>
            <TouchableOpacity style={styles.viewProfileButton}>
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interview Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Interview Details</Text>
          
          <View style={styles.detailItem}>
            <Icon name="video-call" size={24} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Platform</Text>
              <Text style={styles.detailText}>Google Meet</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="schedule" size={24} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailText}>45 minutes</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="link" size={24} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Meeting Link</Text>
              <Text style={styles.linkText}>https://meet.google.com/abc-defg-hij</Text>
            </View>
          </View>
        </View>

        {/* Participants Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Participants</Text>
          
          <View style={styles.participantItem}>
            <Icon name="person" size={24} color="#6B7280" />
            <Text style={styles.participantName}>Sarah Johnson</Text>
            <Text style={styles.participantRole}>Interviewer</Text>
          </View>

          <View style={styles.participantItem}>
            <Icon name="person" size={24} color="#6B7280" />
            <Text style={styles.participantName}>Mike Wilson</Text>
            <Text style={styles.participantRole}>Technical Lead</Text>
          </View>

          <View style={styles.participantItem}>
            <Icon name="person" size={24} color="#6B7280" />
            <Text style={styles.participantName}>John Doe</Text>
            <Text style={styles.participantRole}>Candidate</Text>
          </View>
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Interview Notes</Text>
          <Text style={styles.notesText}>
            Please review the candidate's portfolio before the interview.
            Focus on React Native experience and system design skills.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.rescheduleButton}
          onPress={() => {/* Handle reschedule */}}
        >
          <Icon name="schedule" size={20} color="#134083" />
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => {/* Handle join meeting */}}
        >
          <Icon name="video-call" size={20} color="#fff" />
          <Text style={styles.joinButtonText}>Join Meeting</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  dateTime: {
    fontSize: 16,
    color: '#134083',
    fontWeight: '500',
  },
  positionInfo: {
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 12,
  },
  positionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  department: {
    fontSize: 16,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  candidateImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  candidateLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  experience: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewProfileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  viewProfileText: {
    color: '#134083',
    fontSize: 14,
    fontWeight: '500',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailText: {
    fontSize: 16,
    color: '#134083',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  participantName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#134083',
  },
  participantRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  notesText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  rescheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rescheduleButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#134083',
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  joinButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default InterviewDetails; 