import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import SubscriptionGuard from '../components/SubscriptionGuard';
import SubscriptionValidationService from '../services/subscriptionValidationService';
import useSubscriptionValidation from '../hooks/useSubscriptionValidation';

/**
 * Example component showing how to use subscription validation
 * for different user types (employee/employer)
 */
const SubscriptionUsageExamples = ({ userType = 'employee' }) => {
  const [loading, setLoading] = useState(false);
  const { subscriptionStatus, validateAction, executeAction } = useSubscriptionValidation();

  // Employee-specific actions
  const employeeActions = [
    {
      action: 'apply_job',
      label: 'Apply for Job',
      description: 'Apply to a job posting',
      icon: '💼'
    },
    {
      action: 'search_job',
      label: 'Search Jobs',
      description: 'Search for available jobs',
      icon: '🔍'
    },
    {
      action: 'view_company_details',
      label: 'View Company Details',
      description: 'View detailed company information',
      icon: '🏢'
    },
    {
      action: 'contact_employer',
      label: 'Contact Employer',
      description: 'Send message to employer',
      icon: '💬'
    },
    {
      action: 'profile_update',
      label: 'Update Profile',
      description: 'Update your profile information',
      icon: '✏️'
    },
    {
      action: 'skill_assessment',
      label: 'Take Skill Assessment',
      description: 'Complete skill assessment test',
      icon: '📝'
    }
  ];

  // Employer-specific actions
  const employerActions = [
    {
      action: 'post_job',
      label: 'Post Job',
      description: 'Create a new job posting',
      icon: '📋'
    },
    {
      action: 'search_candidates',
      label: 'Search Candidates',
      description: 'Search for potential candidates',
      icon: '👥'
    },
    {
      action: 'view_candidate_contact',
      label: 'View Candidate Contact',
      description: 'Access candidate contact information',
      icon: '📞'
    },
    {
      action: 'interview_schedule_employer',
      label: 'Schedule Interview',
      description: 'Schedule interview with candidate',
      icon: '📅'
    },
    {
      action: 'application_review',
      label: 'Review Applications',
      description: 'Review job applications',
      icon: '📄'
    }
  ];

  const actions = userType === 'employee' ? employeeActions : employerActions;

  const handleActionPress = async (action) => {
    try {
      setLoading(true);
      
      const result = await executeAction(
        action.action,
        () => {
          Alert.alert('Success', `${action.label} completed successfully!`);
        },
        {
          showAlert: true,
          recordUsage: true,
          metadata: { userType, timestamp: new Date() }
        }
      );

      if (!result.allowed) {
        console.log('Action blocked:', result.reason);
      }
    } catch (error) {
      console.error('Action error:', error);
      Alert.alert('Error', 'Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (validation) => {
    Alert.alert(
      'Upgrade Required',
      `Upgrade your ${userType} subscription to access this feature.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Plans', 
          onPress: () => {
            console.log('Navigate to subscription plans');
            // Navigate to subscription screen
          }
        }
      ]
    );
  };

  const renderActionButton = (actionItem) => (
    <SubscriptionGuard
      key={actionItem.action}
      action={actionItem.action}
      userType={userType}
      onUpgrade={handleUpgrade}
      recordUsage={true}
      metadata={{ userType }}
    >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleActionPress(actionItem)}
        disabled={loading}
      >
        <Text style={styles.actionIcon}>{actionItem.icon}</Text>
        <Text style={styles.actionLabel}>{actionItem.label}</Text>
        <Text style={styles.actionDescription}>{actionItem.description}</Text>
      </TouchableOpacity>
    </SubscriptionGuard>
  );

  const renderSubscriptionInfo = () => {
    if (!subscriptionStatus) return null;

    const { subscription } = subscriptionStatus;
    
    return (
      <View style={styles.subscriptionInfo}>
        <Text style={styles.subscriptionTitle}>Current Subscription</Text>
        <Text style={styles.planName}>{subscription.planName}</Text>
        <Text style={styles.userType}>User Type: {subscription.userType}</Text>
        <Text style={styles.subscriptionStatus}>
          Status: {subscription.hasActiveSubscription ? 'Active' : 'Free'}
        </Text>
        {subscription.isExpiringSoon && (
          <Text style={styles.expiringWarning}>
            ⚠️ Subscription expires soon!
          </Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Subscription Examples</Text>
      <Text style={styles.subtitle}>User Type: {userType}</Text>
      
      {renderSubscriptionInfo()}
      
      <Text style={styles.sectionTitle}>Available Actions</Text>
      <View style={styles.actionsContainer}>
        {actions.map(renderActionButton)}
      </View>

      <Text style={styles.sectionTitle}>Usage Limits</Text>
      <View style={styles.limitsContainer}>
        {subscriptionStatus?.usage && Object.entries(subscriptionStatus.usage).map(([key, value]) => (
          <View key={key} style={styles.limitItem}>
            <Text style={styles.limitKey}>{key}</Text>
            <Text style={styles.limitValue}>{value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#134083',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  subscriptionInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#134083',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  userType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  subscriptionStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  expiringWarning: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#134083',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  limitsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  limitKey: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#134083',
  },
});

export default SubscriptionUsageExamples;
