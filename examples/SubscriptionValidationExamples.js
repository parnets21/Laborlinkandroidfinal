import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import SubscriptionGuard, { UsageLimitIndicator, SubscriptionBadge } from '../components/SubscriptionGuard';
import useSubscriptionValidation from '../hooks/useSubscriptionValidation';
import SubscriptionValidationService from '../services/subscriptionValidationService';

/**
 * Example: Job Application with Subscription Validation
 */
const JobApplicationExample = () => {
  const { executeAction } = useSubscriptionValidation();

  const handleJobApplication = async () => {
    await executeAction(
      'apply_job',
      async (validation) => {
        // This code runs only if user is allowed to apply
        console.log('Applying for job...', validation);
        Alert.alert('Success', 'Job application submitted!');
      },
      {
        recordUsage: true,
        metadata: { jobId: '12345', jobTitle: 'Software Developer' },
        showAlert: true
      }
    );
  };

  return (
    <SubscriptionGuard
      action="apply_job"
      fallback={
        <TouchableOpacity style={[styles.button, styles.disabledButton]} disabled>
          <Text style={styles.disabledButtonText}>Apply for Job (Upgrade Required)</Text>
        </TouchableOpacity>
      }
    >
      <TouchableOpacity style={styles.button} onPress={handleJobApplication}>
        <Text style={styles.buttonText}>Apply for Job</Text>
      </TouchableOpacity>
    </SubscriptionGuard>
  );
};

/**
 * Example: Job Posting with Validation
 */
const JobPostingExample = () => {
  const { checkAction } = useSubscriptionValidation();

  const handleJobPosting = async () => {
    const validation = await checkAction('post_job', {
      showAlert: true,
      onUpgrade: () => {
        console.log('Navigate to upgrade screen');
      }
    });

    if (validation.allowed) {
      console.log('Creating job post...');
      Alert.alert('Success', 'Job posted successfully!');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleJobPosting}>
      <Text style={styles.buttonText}>Post Job</Text>
    </TouchableOpacity>
  );
};

/**
 * Example: Premium Feature Access
 */
const PremiumFeatureExample = () => {
  const { hasFeature } = useSubscriptionValidation();

  if (!hasFeature('premiumFilters')) {
    return (
      <View style={styles.premiumFeature}>
        <Text style={styles.premiumText}>🔒 Premium Filters</Text>
        <Text style={styles.premiumSubtext}>Upgrade to access advanced search filters</Text>
      </View>
    );
  }

  return (
    <View style={styles.premiumFeature}>
      <Text style={styles.featureText}>✨ Premium Filters Available</Text>
      {/* Premium filter UI here */}
    </View>
  );
};

/**
 * Example: Usage Limits Display
 */
const UsageLimitsExample = () => {
  const { subscriptionStatus, userType } = useSubscriptionValidation();

  if (!subscriptionStatus) return null;

  return (
    <View style={styles.usageSection}>
      <Text style={styles.sectionTitle}>Usage Limits</Text>
      
      {userType === 'employee' && (
        <>
          <UsageLimitIndicator
            limitName="jobApplicationsPerMonth"
            label="Monthly Job Applications"
          />
          <UsageLimitIndicator
            limitName="jobSearchPerDay"
            label="Daily Job Searches"
          />
        </>
      )}
      
      {userType === 'employer' && (
        <>
          <UsageLimitIndicator
            limitName="activeJobPosts"
            label="Active Job Posts"
          />
          <UsageLimitIndicator
            limitName="candidateSearchesPerDay"
            label="Daily Candidate Searches"
          />
        </>
      )}
    </View>
  );
};

/**
 * Example: Subscription Status Display
 */
const SubscriptionStatusExample = () => {
  const { getSubscriptionInfo, refresh } = useSubscriptionValidation();
  const info = getSubscriptionInfo();

  return (
    <View style={styles.statusSection}>
      <View style={styles.statusHeader}>
        <Text style={styles.sectionTitle}>Subscription Status</Text>
        <SubscriptionBadge />
      </View>
      
      {info && (
        <View style={styles.statusDetails}>
          <Text style={styles.statusText}>Plan: {info.planName}</Text>
          <Text style={styles.statusText}>Type: {info.userType}</Text>
          <Text style={styles.statusText}>
            Status: {info.hasActiveSubscription ? 'Active' : 'Inactive'}
          </Text>
          {info.endDate && (
            <Text style={styles.statusText}>
              Expires: {new Date(info.endDate).toLocaleDateString()}
            </Text>
          )}
          {info.isExpiringSoon && (
            <Text style={styles.warningText}>⚠️ Expiring soon!</Text>
          )}
        </View>
      )}
      
      <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
        <Text style={styles.refreshButtonText}>Refresh Status</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Example: Manual Validation
 */
const ManualValidationExample = () => {
  const handleManualCheck = async () => {
    try {
      // Method 1: Using the service directly
      const validation = await SubscriptionValidationService.validateAction('search_candidates');
      
      if (validation.allowed) {
        console.log('Search allowed:', validation);
      } else {
        Alert.alert('Not Allowed', validation.reason);
      }
      
      // Method 2: Check multiple actions
      const multipleValidations = await SubscriptionValidationService.validateMultipleActions([
        'post_job',
        'search_candidates',
        'view_candidate_contact'
      ]);
      
      console.log('Multiple validations:', multipleValidations);
      
      // Method 3: Get recommendations
      const recommendations = await SubscriptionValidationService.getRecommendations({
        candidateSearchesPerDay: 50,
        premiumJobPosting: true
      });
      
      console.log('Recommendations:', recommendations);
      
    } catch (error) {
      console.error('Manual validation error:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleManualCheck}>
      <Text style={styles.buttonText}>Run Manual Validation</Text>
    </TouchableOpacity>
  );
};

/**
 * Main Example Screen
 */
const SubscriptionValidationExamples = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription Validation Examples</Text>
      
      <JobApplicationExample />
      <JobPostingExample />
      <PremiumFeatureExample />
      <UsageLimitsExample />
      <SubscriptionStatusExample />
      <ManualValidationExample />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#134083',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  disabledButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  premiumFeature: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  premiumText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  premiumSubtext: {
    fontSize: 14,
    color: '#A16207',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  usageSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDetails: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  refreshButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SubscriptionValidationExamples;
