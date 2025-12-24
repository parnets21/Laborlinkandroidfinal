import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import SubscriptionGuard from '../components/SubscriptionGuard';
import useSubscriptionValidation from '../hooks/useSubscriptionValidation';
import SubscriptionValidationService from '../services/subscriptionValidationService';

const JobDetailScreen = ({ navigation, route }) => {
  const job = route.params?.job;
  console.log('Received job data:', job);

  const [activeTab, setActiveTab] = useState('Description');
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [upgradeInfo, setUpgradeInfo] = useState(null);
  
  // Subscription validation
  const { 
    subscriptionStatus, 
    validateAction, 
    executeAction, 
    getUsagePercentage,
    isSubscribed,
    userType 
  } = useSubscriptionValidation();
const handleOpenWebsite = (url) => {
  if (url) {
    const prefixedUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(prefixedUrl).catch(() => {
      Alert.alert('Error', 'Unable to open the website.');
    });
  }
};

// Guard tab changes for company profile views per day
const handleTabChange = async (nextTab) => {
  try {
    if (nextTab === 'Company') {
      const stored = await AsyncStorage.getItem('userData');
      const uid = stored ? JSON.parse(stored)._id : null;
      if (!uid) {
        Alert.alert('Login Required', 'Please login to view company details.');
        return;
      }
      const v = await SubscriptionValidationService
        .validateActionForUserType('view_company_details', 'employee', uid);
      if (!v.allowed) {
        Alert.alert('Limit reached', v.message || 'Upgrade to view more companies today.');
        return;
      }
      // Record view usage
      try { await SubscriptionValidationService.recordUsage('view_company_details', uid); } catch {}
    }
    setActiveTab(nextTab);
  } catch (e) {
    console.log('Company tab guard error:', e?.message || e);
    setActiveTab(nextTab);
  }
};

const applyjob = () => {
  Alert.alert(
    'Relocation Confirmation',
    'To proceed with applying for this job, please confirm that you are ready to relocate if selected.',
    [
      {
        text: 'Cancel',
        onPress: () => console.log('User cancelled application'),
        style: 'cancel',
      },
      {
        text: 'I am Ready',
        onPress: () => {
          console.log('User confirmed relocation');
          handleApplyNow(); // proceed only if confirmed
        },
      },
    ],
    { cancelable: false }
  );
};

const handleApplyNow = async () => {
  try {
    setIsApplying(true);
    // Clear any previous upgrade banner
    setUpgradeInfo(null);

    // Get user ID from AsyncStorage
    const userData = await AsyncStorage.getItem('userData');
    const userId = userData ? JSON.parse(userData)._id : null;

    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'Please log in to apply for jobs.',
        position: 'top',
      });
      setIsApplying(false);
      return;
    }

    // ✅ Validate using server actions endpoint and compare usage vs limits
    try {
      const actionsData = await SubscriptionValidationService.getAvailableActions(userId);
      const restricted = actionsData?.restrictedActions || {};
      const available = actionsData?.availableActions || {};
      const subscription = actionsData?.subscription || {};
      const limits = subscription?.limits || {};
      const usage = actionsData?.usage || {};

      // If server already marks apply_job as restricted, block immediately
      const serverApply = restricted.apply_job || available.apply_job;
      if (serverApply && serverApply.allowed === false) {
        setUpgradeInfo({
          title: 'Upgrade required',
          message: serverApply.message || 'Your application limit is reached. Please upgrade your plan.',
          dailyLimit: limits.jobApplicationsPerDay,
          dailyUsed: usage.jobApplicationsPerDay || 0,
          monthlyLimit: limits.jobApplicationsPerMonth,
          monthlyUsed: usage.jobApplicationsPerMonth || 0
        });
        setIsApplying(false);
        return;
      } else {
        // Ensure banner is not shown if server allows
        setUpgradeInfo(null);
      }

      // Enforce monthly and daily limits from limits vs usage
      const monthlyLimit = limits.jobApplicationsPerMonth;
      const monthlyUsed = usage.jobApplicationsPerMonth || 0;
      const dailyLimit = limits.jobApplicationsPerDay;
      const dailyUsed = usage.jobApplicationsPerDay || 0;

      if (typeof monthlyLimit === 'number' && monthlyUsed >= monthlyLimit) {
        setUpgradeInfo({
          title: 'Monthly limit reached',
          message: 'Your monthly application limit is reached. Please upgrade your plan.',
          dailyLimit,
          dailyUsed,
          monthlyLimit,
          monthlyUsed
        });
        setIsApplying(false);
        return;
      }

      if (typeof dailyLimit === 'number' && dailyUsed >= dailyLimit) {
        setUpgradeInfo({
          title: 'Daily limit reached',
          message: "You've reached today's application limit.",
          dailyLimit,
          dailyUsed,
          monthlyLimit,
          monthlyUsed
        });
        setIsApplying(false);
        return;
      } else {
        // Passed daily check, keep banner off
        setUpgradeInfo(null);
      }
    } catch (vErr) {
      console.log('Validation error (actions endpoint):', vErr?.message || vErr);
      setUpgradeInfo({ title: 'Please try again', message: 'Unable to verify subscription status.' });
      setIsApplying(false);
      return;
    }

    // ✅ Check if user has already applied for this job BEFORE applying
    const checkResponse = await axios.get(`${BASE_URL}/api/user/checkApplication`, {
      params: {
        applicant: userId,
        job: job.id || job._id,
      }
    });

    if (checkResponse.data?.applied) {
      Toast.show({
        type: 'info',
        text1: 'Already Applied',
        text2: 'You have already applied for this job.',
        position: 'top',
      });

      Alert.alert(
        'Already Applied',
        'You have already submitted an application for this job.',
        [
          {
            text: 'View Applications',
            onPress: () => navigation.navigate('MyApplies'),
          },
          {
            text: 'OK',
            style: 'cancel',
          }
        ]
      );

      return;
    }

    // ✅ If not already applied, proceed with application
    const applicationData = {
      applicant: userId,
      job: job.id || job._id,
      title: job.title,
      company: job.company?.name,
      location: job.location,
      type: job.type?.work || job.type?.job,
      requirements: Array.isArray(job.requirements)
        ? job.requirements
        : typeof job.requirements === 'string'
          ? job.requirements.split(',').map(r => r.trim())
          : [],
      description: job.description,
      companyInfo: {
        name: job.company?.name,
        industry: job.company?.industry || '',
        website: job.company?.website || '',
        address: job.company?.address || '',
        mobile: job.company?.mobile || ''
      },
      status: 'Applied',
      applicationFee: {
        amount: 0,
        currency: 'INR',
        status: 'pending'
      }
    };

    console.log('Sending application data:', applicationData);

    const response = await axios.post(`${BASE_URL}/api/user/applyForJob`, applicationData);

    if (response.data.success) {
      Toast.show({
        type: 'success',
        text1: 'Application Submitted',
        text2: 'Your application was submitted successfully!',
        position: 'top',
      });

      // Record usage after successful application
      try {
        await SubscriptionValidationService.recordUsage('apply_job', userId);
      } catch (recErr) {
        console.log('Record usage failed (apply_job):', recErr?.message || recErr);
      }
      setTimeout(() => {
        navigation.navigate('MyApplies');
      }, 3000);
      Alert.alert(
        'Application Submitted',
        'Would you like to view your applications or continue browsing?',
        [
          {
            text: 'View Applications',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Continue Browsing',
            style: 'cancel',
          }
        ]
      );
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: response.data.message || 'Failed to submit application.',
        position: 'top',
      });
    }

  } catch (error) {
    console.error('Application error:', error);

    let errorMessage = 'Something went wrong. Please try again.';

    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

          Toast.show({
        type: 'info',
        text1: 'Already Applied',
        text2: 'You have already applied for this job.',
        position: 'top',
      });

  } finally {
    setIsApplying(false);
  }
};


  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Job details not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const requirementsList = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === 'string'
      ? job.requirements.split('\n')
      : [
        `${job.experience?.required || '0'}+ years of experience required`,
        'Proficiency in required skills',
        'Good communication skills',
        'Ability to work in a team'
      ];

  const renderCompanyDetail = (icon, label, value) => (
    <View style={styles.companyDetailRow}>
      <View style={styles.companyDetailIcon}>
        <Icon name={icon} size={16} color="#4F46E5" />
      </View>
      <Text style={styles.companyDetailLabel}>{label}</Text>
      <Text style={styles.companyDetailValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerImage}>
        <View style={styles.overlay} />
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <View style={styles.companyHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              {job.company?.logo || job.company?.name?.charAt(0) || '🏢'}
            </Text>
          </View>
          <View style={styles.jobTypeContainer}>
            <View style={styles.jobTypeTag}>
              <Text style={styles.jobTypeText}>{job.type?.work || 'Full Time'}</Text>
            </View>
            {job.type?.job && (
              <View style={styles.jobTypeTag}>
                <Text style={styles.jobTypeText}>{job.type.job}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => setIsSaved(!isSaved)}
          >
            <Icon
              name={isSaved ? "bookmark" : "bookmark-border"}
              size={24}
              color="#4F46E5"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.companyName}>{job.company?.name}</Text>
        <View style={styles.location}>
          <Icon name="location-on" size={16} color="#6B7280" style={{ marginRight: 4 }} />
          <Text style={{ color: '#6B7280' }}>{job.location}</Text>
        </View>

        <View style={styles.keyDetails}>
          <View style={styles.detailItem}>
            <Icon name="currency-rupee" size={20} color="#4F46E5" />
            <Text style={styles.detailText}>
              {job.salary?.displayValue || `₹${job.salary?.min || 0} - ₹${job.salary?.max || 0}`}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="work" size={20} color="#4F46E5" />
            <Text style={styles.detailText}>
              {job.experience?.displayValue || `${job.experience?.required || 0} years`}
            </Text>
          </View>
          {job.openings > 0 && (
            <View style={styles.detailItem}>
              <Icon name="group" size={20} color="#4F46E5" />
              <Text style={styles.detailText}>{job.openings} openings</Text>
            </View>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }} // keeps your padding
        >
          <View style={styles.tabContainer}>
            {['Description', 'Requirements', 'Company', 'Benefits'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => handleTabChange(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>


        {activeTab === 'Description' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>

            {job.responsibilities && (
              <>
                <Text style={styles.subSectionTitle}>Key Responsibilities</Text>
                <Text style={styles.descriptionText}>{job.responsibilities}</Text>
              </>
            )}
          </View>
        )}

        {activeTab === 'Requirements' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {requirementsList.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.requirementText}>{requirement}</Text>
              </View>
            ))}

            {job.skills?.length > 0 && (
              <>
                <Text style={styles.subSectionTitle}>Required Skills</Text>
                <View style={styles.skillsContainer}>
                  {job.skills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {activeTab === 'Company' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Company</Text>
            {renderCompanyDetail('business', 'Industry', job.company?.industry || 'Not specified')}
            {renderCompanyDetail('apartment', 'Company Type', job.company?.type || 'Not specified')}
            {/* {job.company?.website && renderCompanyDetail('language', 'Website', job.company.website)} */}
            {job.company?.website && (
              <TouchableOpacity onPress={() => handleOpenWebsite(job.company.website)}>
                {renderCompanyDetail('language', 'Website', job.company.website)}
              </TouchableOpacity>
            )}
          </View>
        )}

        {activeTab === 'Benefits' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits & Perks</Text>
            {Array.isArray(job.benefits) ? (
              job.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Icon name="check-circle" size={20} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.descriptionText}>{job.benefits}</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {upgradeInfo && (
          <View style={styles.limitCard}>
            <View style={styles.limitIconCircle}>
              <Icon name="lock" size={28} color="#DC2626" />
            </View>
            <Text style={styles.limitTitle}>{upgradeInfo.title || 'Upgrade required'}</Text>
            <Text style={styles.limitSubtitle}>{upgradeInfo.message || 'Please upgrade your plan to continue.'}</Text>
            <View style={styles.limitChipsRow}>
              {typeof upgradeInfo.monthlyLimit === 'number' && (
                <View style={styles.limitChip}>
                  <Icon name="date-range" size={14} color="#4F46E5" />
                  <Text style={styles.limitChipText}>Monthly: {upgradeInfo.monthlyUsed || 0}/{upgradeInfo.monthlyLimit}</Text>
                </View>
              )}
              {typeof upgradeInfo.dailyLimit === 'number' && (
                <View style={styles.limitChip}>
                  <Icon name="today" size={14} color="#4F46E5" />
                  <Text style={styles.limitChipText}>Daily: {upgradeInfo.dailyUsed || 0}/{upgradeInfo.dailyLimit}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={async () => {
                try {
                  const s = await AsyncStorage.getItem('userData');
                  const u = s ? JSON.parse(s) : null;
                  const utype = u?.userType || 'employee';
                  navigation.navigate('EmployeeSubscription', { type: utype });
                } catch {
                  navigation.navigate('EmployeeSubscription', { type: 'employee' });
                }
              }}
            >
              <Icon name="upgrade" size={18} color="#fff" />
              <Text style={styles.upgradeButtonText}>View Plans</Text>
            </TouchableOpacity>
          </View>
        )}
        <SubscriptionGuard
          action="apply_job"
          userType="employee"
          onUpgrade={() => {
            Alert.alert(
              'Upgrade Required',
              'Upgrade your subscription to apply for more jobs this month.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'View Plans', 
                  onPress: () => {
                    // Navigate to subscription screen
                    console.log('Navigate to subscription plans');
                  }
                }
              ]
            );
          }}
          recordUsage={true}
          metadata={{ jobId: job.id || job._id }}
        >
          <TouchableOpacity
            style={[
              styles.applyButton,
              isApplying && styles.applyButtonDisabled
            ]}
            onPress={applyjob}
            disabled={isApplying}
          >
            {isApplying ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.applyButtonText}>Applying...</Text>
              </View>
            ) : (
              <Text style={styles.applyButtonText}>Apply Now</Text>
            )}
          </TouchableOpacity>
        </SubscriptionGuard>
        
        {/* Show subscription info */}
        {subscriptionStatus ? (
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionText}>
              Plan: {subscriptionStatus.subscription?.planName || 
                     subscriptionStatus.planName || 
                     (subscriptionStatus.subscription?.hasActiveSubscription ? 'Active Plan' : 'Free Plan')}
            </Text>
            {/* <Text style={styles.usageText}>
              {subscriptionStatus?.subscription?.userType === 'employer' 
                ? `Jobs: ${getUsagePercentage('activeJobPosts')}% used`
                : `Applications: ${getUsagePercentage('jobApplicationsPerMonth')}% used`
              }
            </Text> */}
          </View>
        ) : (
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionText}>Plan: Free Plan</Text>
            <Text style={styles.usageText}>Loading...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerImage: {
    height: 180,
    width: '100%',
    backgroundColor: '#134083',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    flex: 1,
    marginTop: -50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#F3F4F6',
    paddingTop: 20,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  jobTypeContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
    flexWrap: 'wrap',
  },
  jobTypeTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  jobTypeText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#134083',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    color: '#6B7280',
    marginHorizontal: 20,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  detailText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
    marginTop: 16,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 16,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    marginRight: 8,
    color: '#4F46E5',
    fontSize: 16,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  skillBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  companyDetails: {
    gap: 12,
  },
  companyDetailText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginVertical: 12,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  companyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  companyDetailIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  companyDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  companyDetailValue: {
    fontSize: 14,
    color: '#134083',
    fontWeight: '500',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  benefitIcon: {
    marginRight: 12,
    color: '#4F46E5',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyButtonDisabled: {
    opacity: 0.7,
  },
  subscriptionInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  limitCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center'
  },
  limitIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4
  },
  limitSubtitle: {
    fontSize: 12,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 10
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  limitChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  limitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20
  },
  limitChipText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600'
  },
  subscriptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  usageText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

export default JobDetailScreen;  