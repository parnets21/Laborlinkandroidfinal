import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubscriptionValidationService from '../services/subscriptionValidationService';

const { width } = Dimensions.get('window');

const CreateJob = ({ navigation }) => {
  const [jobData, setJobData] = useState({
    companyName: '',
    companywebsite: '',
    companymobile: '',
    companyindustry: '',
    companytype: '',
    department: '',
    companyaddress: '',
    address: '',
    jobtitle: '',
    jobProfile: '',
    description: '',
    openings: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    salarytype: '',
    averageIncentive: '',
    benefits: '',
    requirements: '',
    responsibilities: '',
    workSchedule: '',
    locationDetails: '',
    preferredQualifications: '',
    additionalNotes: '',
  });

  const [industries, setIndustries] = useState([]);
  const [companyTypes, setCompanyTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [postLimitInfo, setPostLimitInfo] = useState(null);

  const PROHIBITED_CONTENT = [
  'porn', 'pornography', 'sex', 'sexual', 'xxx', 'adult content', 
  'nude', 'nudity', 'explicit', 'erotic', 'prostitute', 'escort',
  'hooker', 'fetish', 'bdsm', 'whore', 'slut', 'fuck', 'dick', 'cock',
  'pussy', 'vagina', 'penis', 'blowjob', 'handjob', 'cum', 'sperm',
  'orgasm', 'masturbate', 'horny', 'sexy', 'naked', 'bare', 'boobs',
  'breasts', 'tits', 'ass', 'butt', 'anal', 'oral', 'intercourse',
  'hentai', 'incest', 'rape', 'molest', 'pedo', 'child porn' ,'child labor'
];

 const containsProhibitedContent = (text) => {
    const lowerText = text.toLowerCase();
    return PROHIBITED_CONTENT.some(word => lowerText.includes(word));
  };

  const validateContent = (fieldName, text) => {
    if (containsProhibitedContent(text)) {
      Alert.alert(
        'Content Violation',
        'Pornography and sexual content are prohibited. Please remove inappropriate content.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTextChange = (fieldName, text) => {
    if (!validateContent(fieldName, text)) {
      // Clear the field if prohibited content is found
      setJobData({...jobData, [fieldName]: ''});
      return;
    }
    setJobData({...jobData, [fieldName]: text});
  };


  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [
        industriesRes,
        companyTypesRes,
        departmentsRes
      ] = await Promise.all([
        axios.get(`${BASE_URL}/api/user/industries`),
        axios.get(`${BASE_URL}/api/user/company-types`),
        axios.get(`${BASE_URL}/api/user/departments`)
      ]);

      if (industriesRes.data?.success) {
        const transformedIndustries = industriesRes.data.data.map(industry => ({
          id: industry._id,
          name: industry.industryName,
          value: industry.industryName
        }));
        setIndustries(transformedIndustries);
      }
      
      if (companyTypesRes.data?.success) {
        const transformedTypes = companyTypesRes.data.data.map(type => ({
          id: type._id,
          name: type.type,
          value: type.type,
          typeId: type.typeId
        }));
        console.log('Transformed company types:', transformedTypes);
        setCompanyTypes(transformedTypes);
      }
      
      if (departmentsRes.data?.success) {
        const transformedDepts = departmentsRes.data.data.map(dept => ({
          id: dept._id,
          name: dept.departmentName || dept.name,
          value: dept.departmentName || dept.name
        }));
        setDepartments(transformedDepts);
      }

      console.log('Fetched company types:', companyTypesRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      Alert.alert('Error', 'Failed to load some options. Please try again.');
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'companyName',
      'companymobile',
      'companyindustry',
      'companytype',
      'department',
      'jobtitle',
      'description',
      'openings',
      'location',
      'minSalary',
      'maxSalary',
      'benefits',
      'requirements',
      'responsibilities',
      'locationDetails'
    ];
    
    const emptyFields = requiredFields.filter(field => !jobData[field]);
    if (emptyFields.length > 0) {
      Alert.alert('Error', `Please fill all required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    // Validate salary
    if (parseInt(jobData.minSalary) > parseInt(jobData.maxSalary)) {
      Alert.alert('Error', 'Minimum salary cannot be greater than maximum salary');
      return false;
    }

    // Validate mobile number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(jobData.companymobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }

    // Validate website if provided
    if (jobData.companywebsite) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlRegex.test(jobData.companywebsite)) {
        Alert.alert('Error', 'Please enter a valid website URL');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Log the data before sending
      console.log('Job Data to be submitted:', {
        // Company Details
        companyName: jobData.companyName,
        companywebsite: jobData.companywebsite,
        companymobile: jobData.companymobile,
        companyindustry: jobData.companyindustry,
        companytype: jobData.companytype,
        department: jobData.department,
        companyaddress: jobData.companyaddress,
        
        // Job Details
        jobtitle: jobData.jobtitle,
        jobProfile: jobData.jobProfile,
        description: jobData.description,
        openings: jobData.openings,
        location: jobData.location,
        minSalary: parseInt(jobData.minSalary) || 0,
        maxSalary: parseInt(jobData.maxSalary) || 0,
        salarytype: jobData.salarytype,
        averageIncentive: jobData.averageIncentive,
        
        // Additional Details
        benefits: jobData.benefits,
        requirements: jobData.requirements,
        responsibilities: jobData.responsibilities,
        workSchedule: jobData.workSchedule,
        locationDetails: jobData.locationDetails,
        preferredQualifications: jobData.preferredQualifications,
        additionalNotes: jobData.additionalNotes,

        // These fields will be filled in CreateJob2
        skill: [],
        english: '',
        experience: '',
        interview: '',
        typeofjob: '',
        jobRoles: '',
        period: '',
        typeofwork: '',
        typeofeducation: '',
        education: '',
        experiencerequired: 0,
        gendertype: '',
        typeofqualification: '',
        category: '',
        reason: '',
        time: '',
        whatsapp: '',
        interviewername: '',
      });

      // Navigate to next screen with the data
      navigation.navigate('CreateJob2', { 
        jobData: jobData,
        onSubmit: async (finalData) => {
          try {
            // Validate employer action via actions endpoint before submitting
            try {
              const userData = await AsyncStorage.getItem('userData');
              const employerId = userData ? JSON.parse(userData)._id : null;
              if (employerId) {
                const actions = await SubscriptionValidationService.getAvailableActions(employerId);
                const restricted = actions?.restrictedActions || {};
                const subscription = actions?.subscription || {};
                const limits = subscription?.limits || {};
                const usage = actions?.usage || {};
                if (subscription?.userType !== 'employer') {
                  Alert.alert('Not Allowed', 'Only employer accounts can post jobs.');
                  return;
                }
                if (restricted.post_job && restricted.post_job.allowed === false) {
                  setPostLimitInfo({
                    title: 'Job posting limit reached',
                    message: restricted.post_job.message || 'Your job posting limit is reached.',
                    limit: limits.activeJobPosts,
                    used: usage.activeJobPosts || 0
                  });
                  return;
                }
                // Explicitly enforce active job posts cap if server didn't include in restricted
                const activeLimit = limits.activeJobPosts;
                const activeUsed = usage.activeJobPosts || 0;
                if (typeof activeLimit === 'number' && activeUsed >= activeLimit) {
                  setPostLimitInfo({
                    title: 'Job posting limit reached',
                    message: 'You have reached the maximum number of active job posts for your plan.',
                    limit: activeLimit,
                    used: activeUsed
                  });
                  return;
                }
              }
            } catch {}

            const response = await axios.post(`${BASE_URL}/api/user/registerCompany`, finalData);
            console.log('Job creation response:', response.data);
            
            if (response.data.success) {
              // Record employer usage for post_job and refresh actions to reflect remaining posts
              try {
                const userData = await AsyncStorage.getItem('userData');
                const userId = userData ? JSON.parse(userData)._id : null;
                if (userId) {
                  await SubscriptionValidationService.recordUsage('post_job', userId);
                  await SubscriptionValidationService.getAvailableActions(userId);
                }
              } catch {}
              // Alert.alert('Success', 'Job posted successfully!');
                Toast.show({
                          type: 'success',
                          text1: 'Success',
                          text2: 'Job posted successfully!',
                        });
              navigation.navigate('EmployerDashboard'); 
            } else {
              const message = response.data.message || response.data.error || 'Failed to create job';
              Alert.alert('Error', message);
            }
          } catch (error) {
            // console.error('Error creating job:', error);
            const status = error?.response?.status;
            const data = error?.response?.data || {};
            if (status === 402 || status === 403) {
              setPostLimitInfo({
                title: status === 402 ? 'Upgrade Required' : 'Not Allowed',
                message: data.message || data.error || 'Your job posting limit is reached for your current plan.',
                limit: data.totalLimit,
                used: (data.totalLimit ? (data.totalLimit - (data.remainingUsage || 0)) : undefined)
              });
            } else {
              const msg = data.message || data.error || 'Failed to create job. Please try again.';
              Alert.alert('Error', msg);
            }
          }
        }
      });
    }
  };

  const renderModal = () => (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {modalType === 'industry' ? 'Select Industry' :
             modalType === 'companyType' ? 'Select Company Type' :
             modalType === 'department' ? 'Select Department' :
             'Select Option'}
          </Text>
          <ScrollView style={styles.modalScroll}>
            {modalType === 'industry' && industries.map((industry) => (
              <TouchableOpacity
                key={industry.id}
                style={styles.modalItem}
                onPress={() => {
                  setJobData({...jobData, companyindustry: industry.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{industry.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'companyType' && companyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.modalItem}
                onPress={() => {
                  setJobData({...jobData, companytype: type.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{type.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'department' && departments.map((dept) => (
              <TouchableOpacity
                key={dept.id}
                style={styles.modalItem}
                onPress={() => {
                  setJobData({...jobData, department: dept.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{dept.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );



  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0) + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Job</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
          {postLimitInfo && (
            <View style={styles.limitCard}>
              <View style={styles.limitIconCircle}>
                <Icon name="lock" size={28} color="#DC2626" />
              </View>
              <Text style={styles.limitTitle}>{postLimitInfo.title || 'Upgrade required'}</Text>
              <Text style={styles.limitSubtitle}>{postLimitInfo.message || 'Please upgrade your plan to post more jobs.'}</Text>
              <View style={styles.limitChipsRow}>
                {typeof postLimitInfo.limit === 'number' && (
                  <View style={styles.limitChip}>
                    <Icon name="work" size={14} color="#4F46E5" />
                    <Text style={styles.limitChipText}>Active posts: {postLimitInfo.used ?? 0}/{postLimitInfo.limit}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={async () => {
                  try {
                    const s = await AsyncStorage.getItem('userData');
                    const u = s ? JSON.parse(s) : null;
                    const utype = u?.userType || 'employer';
                    navigation.navigate('SubscriptionPlan', { type: utype });
                  } catch {
                    navigation.navigate('SubscriptionPlan', { type: 'employer' });
                  }
                }}
              >
                <Icon name="upgrade" size={18} color="#fff" />
                <Text style={styles.upgradeButtonText}>View Plans</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.formContainer}>
            {/* Company Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="business" size={24} color="#134083" />
                {' Company Details'}
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company Information</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Company Name *"
                  value={jobData.companyName}
                  onChangeText={(text) => handleTextChange('companyName', text)}
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Company Website"
                  value={jobData.companywebsite}
                  onChangeText={(text) => handleTextChange('companywebsite', text)}
                  keyboardType="url"
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Company Mobile No *"
                  value={jobData.companymobile}
                  onChangeText={(text) => setJobData({...jobData, companymobile: text})}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company Classification</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    setModalType('industry');
                    setShowModal(true);
                  }}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    jobData.companyindustry && styles.activeDropdownText
                  ]}>
                    {jobData.companyindustry || 'Select Industry *'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#6B7280" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    setModalType('companyType');
                    setShowModal(true);
                  }}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    jobData.companytype && styles.activeDropdownText
                  ]}>
                    {jobData.companytype || 'Select Company Type *'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#6B7280" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    setModalType('department');
                    setShowModal(true);
                  }}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    jobData.department && styles.activeDropdownText
                  ]}>
                    {jobData.department || 'Select Department *'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Company Address"
                value={jobData.companyaddress}
                  onChangeText={(text) => handleTextChange('companyaddress', text)}
                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Job Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="work" size={24} color="#134083" />
                {' Job Details'}
              </Text>

              <TextInput
                style={[styles.input, { marginBottom: 16 }]}
                placeholder="Job Title *"
                value={jobData.jobtitle}
                  onChangeText={(text) => handleTextChange('jobtitle', text)}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, { marginBottom: 16 }]}
                placeholder="Job Profile"
                value={jobData.jobProfile}
                  onChangeText={(text) => handleTextChange('jobProfile', text)}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Job Description (detailed) *"
                value={jobData.description}
                  onChangeText={(text) => handleTextChange('description', text)}

                multiline
                numberOfLines={6}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Key Responsibilities *"
                value={jobData.responsibilities}
                  onChangeText={(text) => handleTextChange('responsibilities', text)}

                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Requirements *"
                value={jobData.requirements}
                  onChangeText={(text) => handleTextChange('requirements', text)}

                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Benefits & Perks *"
                value={jobData.benefits}
                  onChangeText={(text) => handleTextChange('benefits', text)}

                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Preferred Qualifications"
                value={jobData.preferredQualifications}
                  onChangeText={(text) => handleTextChange('preferredQualifications', text)}
              
                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input]}
                placeholder="Work Schedule"
                value={jobData.workSchedule}
                  onChangeText={(text) => handleTextChange('workSchedule', text)}

                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Location Details (Address, Landmarks, etc.) *"
                value={jobData.locationDetails}
                  onChangeText={(text) => handleTextChange('locationDetails', text)}

                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Openings *"
                  value={jobData.openings}
                  onChangeText={(text) => handleTextChange('openings', text)}

                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Location City*"
                  value={jobData.location}
                  onChangeText={(text) => handleTextChange('location', text)}

                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.salaryContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Min Salary"
                  value={jobData.minSalary}
                  onChangeText={(text) => setJobData({...jobData, minSalary: text})}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Max Salary"
                  value={jobData.maxSalary}
                  onChangeText={(text) => setJobData({...jobData, maxSalary: text})}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Average Incentive"
                value={jobData.averageIncentive}
                onChangeText={(text) => setJobData({...jobData, averageIncentive: text})}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional Notes"
                value={jobData.additionalNotes}
                  onChangeText={(text) => handleTextChange('additionalNotes', text)}

                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Icon name="arrow-forward" size={24} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#134083',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  limitCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center'
  },
  limitIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  limitTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 4
  },
  limitSubtitle: {
    fontSize: 13,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 12
  },
  limitChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12
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
  formContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#134083',
    marginBottom: 12,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  activeDropdownText: {
    color: '#134083',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  salaryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#134083',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalItemText: {
    fontSize: 16,
    color: '#134083',
  },
  modalCloseButton: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateJob; 