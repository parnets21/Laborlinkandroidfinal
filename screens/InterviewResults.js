import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NotificationService from '../services/NotificationService';

const InterviewResults = ({ navigation }) => {
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'John Doe',
      position: 'React Native Developer',
      interviewDate: '2024-01-15',
      status: 'pending', // pending, selected, rejected, shortlisted
      feedback: '',
    },
    // Add more candidates as needed
  ]);

  const updateCandidateStatus = (id, status) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === id ? { ...candidate, status } : candidate
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'selected': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'shortlisted': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const announceResult = async (candidate) => {
    try {
      await NotificationService.sendNotification(
        'INTERVIEW_RESULT',
        {
          phoneNumber: candidate.phoneNumber,
          email: candidate.email
        },
        {
          candidateName: candidate.name,
          position: candidate.position,
          status: candidate.status,
          additionalInfo: candidate.feedback,
          companyName: 'Your Company Name'
        }
      );
      // Show success message
    } catch (error) {
      // Handle error
    }
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
        <Text style={styles.headerTitle}>Interview Results</Text>
      </View>

      <ScrollView style={styles.content}>
        {candidates.map(candidate => (
          <View key={candidate.id} style={styles.candidateCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.candidateName}>{candidate.name}</Text>
                <Text style={styles.position}>{candidate.position}</Text>
                <Text style={styles.interviewDate}>
                  Interviewed on {candidate.interviewDate}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(candidate.status) }
              ]}>
                <Text style={styles.statusText}>
                  {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.feedbackSection}>
              <Text style={styles.sectionTitle}>Feedback</Text>
              <TextInput
                style={styles.feedbackInput}
                multiline
                numberOfLines={4}
                placeholder="Add interview feedback..."
                value={candidate.feedback}
                onChangeText={(text) => {
                  setCandidates(candidates.map(c => 
                    c.id === candidate.id ? { ...c, feedback: text } : c
                  ));
                }}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.shortlistButton]}
                onPress={() => updateCandidateStatus(candidate.id, 'shortlisted')}
              >
                <Icon name="people" size={20} color="#F59E0B" />
                <Text style={[styles.actionText, { color: '#F59E0B' }]}>
                  Shortlist
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.selectButton]}
                onPress={() => updateCandidateStatus(candidate.id, 'selected')}
              >
                <Icon name="check-circle" size={20} color="#10B981" />
                <Text style={[styles.actionText, { color: '#10B981' }]}>
                  Select
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => updateCandidateStatus(candidate.id, 'rejected')}
              >
                <Icon name="cancel" size={20} color="#EF4444" />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>
                  Reject
                </Text>
              </TouchableOpacity>
            </View>

            {candidate.status !== 'pending' && (
              <TouchableOpacity 
                style={styles.announceButton}
                onPress={() => {
                  announceResult(candidate);
                }}
              >
                <Icon name="send" size={20} color="#fff" />
                <Text style={styles.announceButtonText}>
                  Announce Result
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
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
  candidateCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 4,
  },
  interviewDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#134083',
    marginBottom: 8,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  shortlistButton: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  selectButton: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  rejectButton: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  announceButton: {
    backgroundColor: '#134083',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  announceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default InterviewResults; 