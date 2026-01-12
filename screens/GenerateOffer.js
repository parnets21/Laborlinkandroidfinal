import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Linking,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const GenerateOffer = () => {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offerFormData, setOfferFormData] = useState({
    position: '',
    salary: '',
    startDate: '',
    workLocation: '',
    employerName: '',
    companyName: '',
  });
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [generatingOffer, setGeneratingOffer] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [jobList, setJobList] = useState([]);

  const API_BASE_URL = 'http://localhost:8500';

  const fetchAllJobs = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        setErrorMessage('No user data found. Please log in.');
        return;
      }

      const { _id: employerId } = JSON.parse(userData);
      const response = await axios.get(`${API_BASE_URL}/api/user/Postedjobs/${employerId}`);

      if (response.data.success) {
        setJobList(response.data.jobs);
        if (response.data.jobs.length > 0) {
          setSelectedJobId(response.data.jobs[0]._id);
        } else {
          setErrorMessage('No jobs found. Please create a job posting first.');
        }
      } else {
        setErrorMessage('Failed to fetch jobs: ' + response.data.message);
      }
    } catch (error) {
      setErrorMessage('Error fetching jobs: ' + error.message);
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplications();
    } else {
      setApplications([]); // Clear applications if no job is selected
    }
  }, [selectedJobId]);

  const fetchApplications = async () => {
    if (!selectedJobId) {
      setErrorMessage('No job selected. Please select a job first.');
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/offers/applications/${selectedJobId}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      if (data.success) {
        setApplications(data.data);
      } else {
        setErrorMessage(data.message || 'Failed to fetch applications');
      }
    } catch (error) {
      setErrorMessage('Error fetching applications: ' + error.message);
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelection = (job) => {
    setSelectedJobId(job._id);
    setShowJobSelector(false);
    setApplications([]);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSelectCandidate = (application) => {
    if (!application || !application.userId) {
      setErrorMessage('Invalid application data');
      return;
    }
    setSelectedApplication(application);
    setOfferFormData({
      position: application.jobTitle || '',
      salary: '',
      startDate: '',
      workLocation: '',
      employerName: application.userId.fullName || '',
      companyName: application.companyName || '',
    });
    setShowOfferForm(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleInputChange = (name, value) => {
    setOfferFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateOfferLetter = async () => {
    if (!selectedApplication) {
      setErrorMessage('No candidate selected');
      return;
    }
    const { position, salary, startDate, workLocation, employerName, companyName } = offerFormData;
    if (!position || !salary || !startDate || !workLocation || !employerName || !companyName) {
      setErrorMessage('All fields are required');
      return;
    }
    if (isNaN(salary) || Number(salary) <= 0) {
      setErrorMessage('Salary must be a valid number');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      setErrorMessage('Start date must be in YYYY-MM-DD format');
      return;
    }

    setGeneratingOffer(true);
    setErrorMessage('');
    try {
      const url = `${API_BASE_URL}/api/offers/generate/${selectedApplication._id}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerFormData),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Offer letter generated and sent successfully!');
        setShowOfferForm(false);
        setApplications((prev) =>
          prev.map((app) =>
            app._id === selectedApplication._id
              ? { ...app, offerLetter: data.data.offerLetter, applicationStatus: 'selected' }
              : app
          )
        );
      } else {
        setErrorMessage(data.message || 'Failed to generate offer letter');
      }
    } catch (error) {
      setErrorMessage('Error generating offer letter: ' + error.message);
      console.error('Error generating offer letter:', error);
    } finally {
      setGeneratingOffer(false);
    }
  };

  const handleViewOffer = async (url) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Error', 'Cannot open the offer letter URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open offer letter');
      console.error('Error opening URL:', error);
    }
  };

  const getStatusBadge = (status, offerLetter) => {
    let bgColor = '#DBEAFE';
    let textColor = '#1E40AF';
    let icon = 'clock';
    let label = status;

    if (offerLetter) {
      if (offerLetter.status === 'pending') {
        bgColor = '#FEF3C7';
        textColor = '#92400E';
        icon = 'clock';
        label = `Offer ${offerLetter.status}`;
      } else if (offerLetter.status === 'accepted') {
        bgColor = '#D1FAE5';
        textColor = '#065F46';
        icon = 'check-circle';
        label = `Offer ${offerLetter.status}`;
      } else if (offerLetter.status === 'sent') {
        bgColor = '#DBEAFE';
        textColor = '#1E40AF';
        icon = 'send';
        label = `Sent`;
      } else {
        bgColor = '#FEE2E2';
        textColor = '#991B1B';
        icon = 'x';
        label = `Offer ${offerLetter.status}`;
      }
    } else if (status === 'Selected') {
      bgColor = '#D1FAE5';
      textColor = '#065F46';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Icon name={icon} size={12} color={textColor} />
        <Text style={[styles.statusText, { color: textColor }]}>{label}</Text>
      </View>
    );
  };

  const renderJobItem = ({ item }) => {
    const isSelected = selectedJobId === item._id;

    return (
      <TouchableOpacity
        style={[
          styles.jobItem,
          isSelected && styles.selectedJobItem
        ]}
        onPress={() => handleJobSelection(item)}
        activeOpacity={0.8}
      >
        <View style={styles.jobItemContent}>
          <View style={styles.jobItemLeft}>
            <View style={[
              styles.jobIconContainer,
              isSelected && styles.selectedJobIconContainer
            ]}>
              <Icon
                name="briefcase"
                size={20}
                color={isSelected ? '#FFFFFF' : '#2563EB'}
              />
            </View>
            <View style={styles.jobInfo}>
              <Text style={[
                styles.jobTitle,
                isSelected && styles.selectedJobTitle
              ]}>
                {item.jobtitle}
              </Text>
              <Text style={[
                styles.companyName,
                isSelected && styles.selectedCompanyName
              ]}>
                {item.companyName}
              </Text>
              <View style={styles.jobItemDetails}>
                <View style={styles.jobDetailRow}>
                  <Icon
                    name="map-pin"
                    size={12}
                    color={isSelected ? '#059669' : '#6B7280'}
                  />
                  <Text style={[
                    styles.jobDetailText,
                    isSelected && styles.selectedJobDetailText
                  ]}>
                    {item.companyaddress}
                  </Text>
                </View>
                <View style={styles.jobDetailRow}>
                  <Icon
                    name="users"
                    size={12}
                    color={isSelected ? '#059669' : '#6B7280'}
                  />
                  <Text style={[
                    styles.jobDetailText,
                    isSelected && styles.selectedJobDetailText
                  ]}>
                    {item.department}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <View style={styles.selectedCheckmark}>
                <Icon name="check" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.selectedPulse} />
            </View>
          )}
        </View>

        {isSelected && (
          <View style={styles.selectedBorder} />
        )}
      </TouchableOpacity>
    );
  };

  const renderApplication = ({ item }) => (
    <View style={styles.applicationCard}>
      <View style={styles.applicationHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item?.userId?.profile || 'https://via.placeholder.com/64' }}
            style={styles.avatar}
          />
          <View style={styles.avatarBorder} />
        </View>
        <View style={styles.applicationInfo}>
          <Text style={styles.applicationName}>{item?.userId?.fullName}</Text>
          <Text style={styles.applicationTitle}>{item?.jobTitle}</Text>
        </View>
        <View style={styles.applicationStatus}>
          {/* {getStatusBadge(item.status, item.offerLetter)} */}
          {getStatusBadge(item?.status, item?.offerLetter)}
          {/* {item?.offerLetter && (
            <TouchableOpacity
              onPress={() => handleViewOffer(item?.offerLetter?.url)}
              style={styles.downloadButton}
            >
              <Icon name="external-link" size={14} color="#2563EB" />
              <Text style={styles.downloadText}>View Offer</Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>
      <View style={styles.applicationDetails}>
        <View style={styles.detailRow}>
          <Icon name="mail" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item?.userId?.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="phone" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item?.userId?.phone}</Text>
        </View>
      </View>
      <View style={styles.applicationMeta}>
        <View style={styles.metaItem}>
          <Icon name="map-pin" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{item?.userId?.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="briefcase" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{item?.companyName}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="dollar-sign" size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            ₹{item?.userId?.preferredSalary?.min?.toLocaleString()} - ₹{item?.userId?.preferredSalary?.max?.toLocaleString()}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="calendar" size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            Applied {new Date(item?.appliedOn).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.skillsContainer}>
        <Text style={styles.skillsLabel}>Skills:</Text>
        <View style={styles.skillsList}>
          {item?.userId?.skills?.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleSelectCandidate(item)}
        style={styles.generateButton}
      >
        <Icon name="send" size={16} color="#FFFFFF" />
        <Text style={styles.generateButtonText}>Generate Offer Letter</Text>
      </TouchableOpacity>
    </View>
  );

  const getSelectedJobTitle = () => {
    const selectedJob = jobList.find((job) => job?._id === selectedJobId);
    return selectedJob ? selectedJob.jobtitle : 'Select a job';
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Icon name="file-text" size={24} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Generate Offer Letters</Text>
              <Text style={styles.headerSubtitle}>Select candidates and generate offer letters</Text>
            </View>
          </View>

          <View style={styles.jobSelectorContainer}>
            <Text style={styles.sectionTitle}>Select Job Position</Text>
            <TouchableOpacity
              style={styles.jobSelector}
              onPress={() => jobList.length > 0 && setShowJobSelector(true)}
            >
              <View style={styles.jobSelectorContent}>
                <View style={styles.jobSelectorIcon}>
                  <Icon name="briefcase" size={20} color="#2563EB" />
                </View>
                <Text style={styles.jobSelectorText}>{getSelectedJobTitle()}</Text>
              </View>
              <Icon name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {successMessage && (
            <View style={styles.successMessage}>
              <Icon name="check-circle" size={20} color="#065F46" />
              <Text style={styles.messageText}>{successMessage}</Text>
            </View>
          )}

          {!jobList.length ? (
            <View style={styles.emptyContainer}>
              <Icon name="briefcase" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Jobs Available</Text>
              <Text style={styles.emptySubtitle}>
                Please create a job posting to start receiving applications.
              </Text>
            </View>
          ) : !selectedJobId ? (
            <View style={styles.emptyContainer}>
              <Icon name="briefcase" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Job Selected</Text>
              <Text style={styles.emptySubtitle}>
                Please select a job position to view applications.
              </Text>
            </View>
          ) : applications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="file-text" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Applications Found</Text>
              <Text style={styles.emptySubtitle}>
                There are no applications for this job position.
              </Text>
            </View>
          ) : (
            <FlatList
              data={applications.filter((app) => app.status === 'Selected')}
              keyExtractor={(item) => item._id}
              renderItem={renderApplication}
              contentContainerStyle={styles.listContent}
            />
          )}
        </ScrollView>
      )}

      <Modal
        visible={showJobSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJobSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Job Position</Text>
              <TouchableOpacity onPress={() => setShowJobSelector(false)}>
                <Icon name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={jobList}
              keyExtractor={(item) => item._id}
              renderItem={renderJobItem}
              style={styles.jobList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showOfferForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOfferForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Offer Letter</Text>
              <TouchableOpacity onPress={() => setShowOfferForm(false)}>
                <Icon name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {selectedApplication && (
              <Text style={styles.modalSubtitle}>
                For: {selectedApplication.userId.fullName}
              </Text>
            )}
            <ScrollView style={styles.formContainer}>
              <View style={styles.formRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Position *</Text>
                  <TextInput
                    style={styles.input}
                    value={offerFormData.position}
                    onChangeText={(value) => handleInputChange('position', value)}
                    placeholder="Enter position"
                    placeholderTextColor="#6B7280"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Annual Salary (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    value={offerFormData.salary}
                    onChangeText={(value) => handleInputChange('salary', value)}
                    placeholder="Enter salary"
                    keyboardType="numeric"
                    placeholderTextColor="#6B7280"
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Start Date *</Text>
                  <TextInput
                    style={styles.input}
                    value={offerFormData.startDate}
                    onChangeText={(value) => handleInputChange('startDate', value)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#6B7280"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Work Location *</Text>
                  <TextInput
                    style={styles.input}
                    value={offerFormData.workLocation}
                    onChangeText={(value) => handleInputChange('workLocation', value)}
                    placeholder="Enter location"
                    placeholderTextColor="#6B7280"
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Employer Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={offerFormData.employerName}
                    onChangeText={(value) => handleInputChange('employerName', value)}
                    placeholder="Enter employer name"
                    placeholderTextColor="#6B7280"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Company Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={offerFormData.companyName}
                    onChangeText={(value) => handleInputChange('companyName', value)}
                    placeholder="Enter company name"
                    placeholderTextColor="#6B7280"
                  />
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowOfferForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, generatingOffer && styles.submitButtonDisabled]}
                onPress={generateOfferLetter}
                disabled={generatingOffer}
              >
                {generatingOffer ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Generating...</Text>
                  </>
                ) : (
                  <>
                    <Icon name="send" size={16} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Generate & Send Offer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default GenerateOffer
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIcon: {
    backgroundColor: '#EBF8FF',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  jobSelectorContainer: {
    margin: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  jobSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  jobSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jobSelectorIcon: {
    backgroundColor: '#EBF8FF',
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  jobSelectorText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '600',
    flex: 1,
  },
  jobList: {
    maxHeight: 300,
    paddingHorizontal: 12,
  },
  jobItem: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedJobItem: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  jobItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  jobItemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  jobIconContainer: {
    backgroundColor: '#EBF8FF',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  selectedJobIconContainer: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  selectedJobTitle: {
    color: '#065F46',
  },
  companyName: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedCompanyName: {
    color: '#047857',
  },
  jobItemDetails: {
    flexDirection: 'column',
    gap: 2,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  jobDetailText: {
    fontSize: 10,
    color: '#718096',
    marginLeft: 4,
    fontWeight: '500',
  },
  selectedJobDetailText: {
    color: '#047857',
  },
  selectedIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckmark: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    margin: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  messageText: {
    fontSize: 12,
    color: '#065F46',
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A5568',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
  },
  applicationInfo: {
    flex: 1,
  },
  applicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  applicationTitle: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  applicationStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  downloadText: {
    fontSize: 10,
    color: '#2563EB',
    marginLeft: 4,
    fontWeight: '600',
  },
  applicationDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#4A5568',
    marginLeft: 6,
    fontWeight: '500',
  },
  applicationMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 10,
    color: '#4A5568',
    marginLeft: 4,
    fontWeight: '500',
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 6,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillBadge: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skillText: {
    fontSize: 10,
    color: '#4A5568',
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  formContainer: {
    paddingHorizontal: 16,
    maxHeight: 400,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
});