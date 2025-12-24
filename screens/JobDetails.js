import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import LimitAlert from '../components/LimitAlert';

const JobDetails = ({ route, navigation }) => {

  const { job } = route.params;
  console.log(job);
  
  const [jobDetails, setJobDetails] = useState(null);
  const [applications, setApplications] = useState([]);
  console.log("applications",applications);
  
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [applicationStats, setApplicationStats] = useState({
    shortlisted: "",
    rejected: "",
    selected: ""
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('all');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
console.log("job detailss",jobDetails);

  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [interviewScheduledMap, setInterviewScheduledMap]=useState({});
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState({
    schedule: new Date(),
    meetingLink: '',
    meetingPassword: '',
    platform: 'Zoom',
    duration: 30,
    interviewNotes: '',
    status: 'Scheduled'
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [limitAlert, setLimitAlert] = useState({ visible: false, title: '', message: '' });

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${BASE_URL}/api/user/getJobById/${job.id}`, {
        params: userId ? { userId } : {}
      });
      console.log('Job Details Response findinggg :', response.data.success);
      
      if (response.data.success) {
        setJobDetails(response.data.job || response.data.success);
        setError(null);
      } else {
        setError('Failed to load job details');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const jobId = job?.id;
      console.log('Fetching applications for jobId:', jobId);

      if (!jobId) {
        console.error('No job ID found');
        setApplications([]);
        return;
      }

      // Include employerId to allow server-side candidate search validation and usage recording
      let employerId;
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        employerId = userDataStr ? JSON.parse(userDataStr)._id : undefined;
      } catch {}
      const response = await axios.get(`${BASE_URL}/api/user/getApplyList/${jobId}`, {
        params: employerId ? { employerId } : {}
      });
      console.log('Applications Response for this job:', response.data);
      
      if (response.data.success) {
        const allApplications = response.data.data || [];
        
        const pendingApplications = allApplications.filter(app => 
          app && (!app.status || (app.status !== 'shortlisted' && app.status !== 'rejected'))
        );
        
        setApplications(pendingApplications);
        
        const stats = {
          pending: pendingApplications.length,
          shortlisted: allApplications.filter(app => app?.status === 'shortlisted').length,
          rejected: allApplications.filter(app => app?.status === 'rejected').length,
          selected: allApplications.filter(app => app?.status === 'selected').length
        };
        setApplicationStats(stats);
      } else {
        console.log('No applications found or error:', response.data);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const fetchApplicationsByStatus = async (status) => {
    try {
      const jobId = job?.id;
      
      console.log('Fetching applications by status:', status, 'for jobId:', jobId);

      if (!jobId) {
        console.error('No job ID found');
        setApplications([]);
        setFilteredApplications([]);
        return;
      }

      let endpoint;
      switch (status) {
        case 'shortlisted':
          endpoint = `${BASE_URL}/api/user/getShortlistingData/${jobId}`;
          break;
        case 'rejected':
          endpoint = `${BASE_URL}/api/user/getrejected/${jobId}`;
          break;
        case 'all':
        default:
          endpoint = `${BASE_URL}/api/user/getApplyList/${jobId}`;
          break;
      }

      console.log('Fetching from endpoint:', endpoint);

      const userDataStr = await AsyncStorage.getItem('userData');
      const employerId2 = userDataStr ? JSON.parse(userDataStr)._id : undefined;
      const response = await axios.get(endpoint, { params: employerId2 && status === 'all' ? { employerId: employerId2 } : {} });
      console.log('Raw response for status', status, ':', response.data);

      if (response.data.success) {
        let applicationsData = response.data.data || [];
        
        if (status === 'all') {
          applicationsData = applicationsData.filter(app => 
            app && (!app.status || (app.status !== 'Shortlisted' && app.status !== 'rejected'))
          );
        }

        setApplications(applicationsData);
        setFilteredApplications(applicationsData);

        const stats = {
          pending: status === 'all' ? applicationsData.length : applicationStats.pending,
          shortlisted: status === 'shortlisted' ? applicationsData.length : applicationStats.shortlisted,
          rejected: status === 'rejected' ? applicationsData.length : applicationStats.rejected,
          selected: applicationsData.filter(app => app?.status === 'Selected').length
        };
        
        setApplicationStats(stats);
        console.log('Updated stats:', stats);
      } else {
        console.log('No applications found for status:', status);
        setApplications([]);
        setFilteredApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications by status:', error);
      if (error.response?.status === 404) {
        console.log('No data found for this status');
        setApplications([]);
        setFilteredApplications([]);
        setApplicationStats(prev => ({
          ...prev,
          [status]: 0
        }));
      } else {
        setApplications([]);
        setFilteredApplications([]);
      }
    }
  };

  const fetchScheduledInterviews = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { _id: employerId } = JSON.parse(userData);
      
      const companyId=job.id;
      console.log("employerId",employerId);
      console.log("companyId",job.id)
      const response = await axios.get(`${BASE_URL}/api/user/getcallinterview/${employerId}/${companyId}`);
      console.log('Scheduled Interview Response:',response.data.data,);
      
      if (response.data.success) {
        setScheduledInterviews(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled interviews:', error);
    }
  };

  const fetchSelectedCandidates = async (companyId = job.id) => {
    try {
      if (!companyId) {
        console.error('Company ID not found');
        return;
      }

      console.log('Fetching selected candidates for companyId:', companyId);
      console.log('API URL:', `${BASE_URL}/api/user/getSelectData/${companyId}`);

      const response = await axios.get(`${BASE_URL}/api/user/getSelectDatas/${companyId}`);
      console.log('Selected candidates  this iuguhu is response: ',response.data.data);

      if (response.data.success) {
        const selectedApplications = response.data.data || [];
        if (activeSection === 'selected') {
          setApplications(selectedApplications);
          setFilteredApplications(selectedApplications);
        }
        // Update the stats
        // setApplicationStats(prev => ({
        //   ...prev,
        //   selected: selectedApplications.length
        // }));
      }
    } catch (error) {
      // console.error('Error fetching selected candidates:', error);
      if (activeSection === 'selected') {
        setApplications([]);
        setFilteredApplications([]);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
      await fetchJobDetails();
      await fetchApplications();
        await fetchScheduledInterviews();
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      } finally {
      setLoading(false);
      setRefreshing(false);
      }
    };
    
    if (job.id) {
      fetchData();
    }
  }, [job.id]);

  useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab('applications');
      setActiveSection(route.params.activeTab);

      
      const fetchSectionData = async () => {
        setLoading(true);
        try {
          switch (route.params.activeTab) {
            case 'shortlisted':
              await fetchApplicationsByStatus('shortlisted');
              break;
            case 'rejected':
              await fetchApplicationsByStatus('rejected');
              break;
            case 'scheduled':
              await fetchScheduledInterviews();
              break;
            case 'selected':
              await fetchSelectedCandidates(job.id);
              break;
            default:
              await fetchApplicationsByStatus('all');
          }
        } catch (error) {
          console.error('Error fetching section data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSectionData();
    }
  }, [route.params?.activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchJobDetails(),
        fetchApplicationsByStatus(activeSection),
        fetchScheduledInterviews(),
        fetchSelectedCandidates(job.id)
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [activeSection, job.id]);

  const handleScheduleInterview = async () => {
    try {
      // Validate required fields
      if (!selectedCandidate?.userId?._id || 
          !interviewDetails.meetingLink || 
          !interviewDetails.meetingPassword) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        Alert.alert('Error', 'User data not found. Please login again.');
        return;
      }

      // Properly parse the userData
      const userData = JSON.parse(userDataString);
      console.log('Parsed userData:', userData); // Debug log

      if (!userData._id) {
        Alert.alert('Error', 'Invalid user data. Please log in again.');
        return;
      }

      // Prepare interview data matching the backend requirements
      const interviewData = {
        userId: selectedCandidate.userId._id,
        employerId: userData._id, // Use the properly parsed _id
        companyId: job.id, // Use companyId from userData
        name: selectedCandidate.userId.fullName, // Use the candidate's name
        email: selectedCandidate.userId.email,
        schedule: interviewDetails.schedule.toISOString(),
        status: 'Scheduled',
        platform: interviewDetails.platform,
        meetingLink: interviewDetails.meetingLink,
        meetingPassword: interviewDetails.meetingPassword,
        interviewNotes: interviewDetails.interviewNotes,
        duration: interviewDetails.duration
      };

      console.log('Sending interview data:', interviewData);

      const response = await axios.post(`${BASE_URL}/api/user/callinterview`, interviewData);
      console.log('Interview scheduling response:', response.data);

      if (response.data.success) {
        Alert.alert('Success', 'Interview scheduled successfully!');
        setShowInterviewForm(false);
        setSelectedCandidate(null);
        
        // Reset form
        setInterviewDetails({
          schedule: new Date(),
          meetingLink: '',
          meetingPassword: '',
          platform: 'Zoom',
          duration: 30,
          interviewNotes: '',
          status: 'Scheduled'
        });

        // Update both scheduled interviews and shortlisted applications
        await fetchScheduledInterviews();
        
        // Filter out the scheduled candidate from applications
        const updatedApplications = applications.filter(
          app => app.userId._id !== selectedCandidate.userId._id
        );
        setApplications(updatedApplications);
        setFilteredApplications(updatedApplications);

        // Update application stats
        setApplicationStats(prev => ({
          ...prev,
          shortlisted: Math.max(0, (prev.shortlisted || 0) - 1)
        }));

        // Switch to scheduled section
        setActiveSection('scheduled');
      } else {
        // Handle limit/upgrade responses
        const msg = response.data.error || response.data.message || 'Failed to schedule interview';
        setLimitAlert({ visible: true, title: 'Limit Reached', message: msg });
      }
    } catch (error) {
      console.error('Interview scheduling error:', error);
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
      if (status === 402 || status === 403) {
        setLimitAlert({ visible: true, title: 'Limit Reached', message: serverMsg || 'Your interview limit is reached for this plan.' });
      } else {
        Alert.alert('Error', 'Failed to schedule interview. Please try again.');
      }
    }
  };

  const checkInterviewScheduled = async (userId) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { _id: employerId } = JSON.parse(userData);
      
      const response = await axios.get(`${BASE_URL}/api/user/getcallinterview/${employerId}`);
      if (response.data.success) {
        return response.data.data.some(interview => interview.userId === userId);
      }
      return false;
    } catch (error) {
      console.error('Error checking interview status:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAllInterviews = async () => {
      const scheduledMap = {};
      for (const app of applications) {
        if (app.status === 'shortlisted') {
          scheduledMap[app.userId?._id] = await checkInterviewScheduled(app.userId?._id);
        }
      }
      setInterviewScheduledMap(scheduledMap);
    };

    if (applications.length > 0) {
      checkAllInterviews();
    }
  }, [applications]);

  const renderApplicationCard = (application) => {
    if (!application || !application.userId) {
      return null;
    }

    // Check if interview is already scheduled for this candidate
    const isInterviewScheduled = scheduledInterviews.some(
      interview => interview?.userId === application.userId?._id
    );

    // Don't render the card if interview is already scheduled and we're in shortlisted section
    if (activeSection === 'shortlisted' && isInterviewScheduled) {
      return null;
    }

    return (
      <TouchableOpacity 
        key={application._id}
        style={[
          styles.applicationCard,
          activeSection === 'shortlisted' && styles.shortlistedCard
        ]}
        onPress={() => {
          if (!application.userId?._id) return;

          if (activeSection === 'all') {
            navigation.navigate('ApplicationDetails', { 
              application: application,
              onStatusChange: () => {
                fetchApplicationsByStatus('all');
                fetchApplicationsByStatus('shortlisted');
              }
            });
          } else if (activeSection === 'shortlisted' && !isInterviewScheduled) {
            setSelectedCandidate(application);
          }
        }}
      >
        <View style={styles.cardContent}>
          {/* Top Section with Avatar and Name */}
          <View style={styles.cardHeader}>
            <View style={[
              styles.avatarContainer,
              activeSection === 'shortlisted' && styles.shortlistedAvatar
            ]}>
              <Text style={styles.avatarText}>
                {application.userId?.fullName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[
                styles.userName,
                activeSection === 'shortlisted' && styles.shortlistedUserName
              ]}>
                {application.userId?.name ||application.userId?.fullName || 'No Name'}
              </Text>
              <Text style={styles.userEmail}>{application.userId?.email || 'No Email'}</Text>
              
              <View style={styles.tagContainer}>
                {application.userId?.workExperience ? (
                  <View style={styles.experienceTag}>
                    <Icon name="work" size={12} color="#059669" />
                    <Text style={styles.experienceText}>Experienced</Text>
                  </View>
                ) : (
                  <View style={styles.fresherTag}>
                    <Icon name="school" size={12} color="#3B82F6" />
                    <Text style={styles.fresherText}>Fresher</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Skills Tags */}
          {application.userId?.skills && Array.isArray(application.userId.skills) && (
            <View style={[
              styles.skillsContainer,
              activeSection === 'shortlisted' && styles.shortlistedSkillsContainer
            ]}>
              {application.userId.skills.slice(0, 3).map((skill, index) => (
                <View key={index} style={[
                  styles.skillTag,
                  activeSection === 'shortlisted' && styles.shortlistedSkillTag
                ]}>
                  <Text style={[
                    styles.skillTagText,
                    activeSection === 'shortlisted' && styles.shortlistedSkillTagText
                  ]}>
                    {skill}
                  </Text>
                </View>
              ))}
              {application.userId.skills.length > 3 && (
                <View style={[
                  styles.moreSkillTag,
                  activeSection === 'shortlisted' && styles.shortlistedMoreSkillTag
                ]}>
                  <Text style={styles.moreSkillText}>+{application.userId.skills.length - 3}</Text>
                </View>
              )}
            </View>
          )}

          {/* Bottom Action Section */}
          {activeSection === 'shortlisted' && selectedCandidate?._id === application._id && (
            <TouchableOpacity 
              style={styles.scheduleButton}
              onPress={() => {
                setShowInterviewForm(true);
                setInterviewDetails({
                  schedule: new Date(),
                  meetingLink: '',
                  meetingPassword: '',
                  platform: 'Zoom',
                  duration: 30,
                  interviewNotes: '',
                  status: 'Scheduled'
                });
              }}
            >
              <Icon name="schedule" size={20} color="#fff" />
              <Text style={styles.scheduleText}>Schedule Interview</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleScheduledCandidateAction = async ( interview , action ) => {
    try {
      const companyId = job.id;
      console.log('Action:', action, 'for interview:', interview._id);

      if (!companyId) {
        throw new Error('Company ID not found');
      }

      // Prepare request data
      const requestData = {
        userId: interview.userId,
        companyId: job.id,
        jobId: job.id,
        status: action === 'select' ? 'selected' : 'rejected'
      };

      // Choose endpoint based on action
      const endpoint = action === 'select' 
        ? `${BASE_URL}/api/user/addSelect`
        : `${BASE_URL}/api/user/rejectApply`;

      console.log('Sending request to:', endpoint, 'with data:', requestData);
      // include employerId for backend validation/usage
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        const employerId = userDataStr ? JSON.parse(userDataStr)._id : undefined;
        if (employerId) requestData.employerId = employerId;
      } catch {}
      const response = await axios.post(endpoint, requestData);

      if (response.data.success) {
        // Remove from scheduled interviews immediately
        setScheduledInterviews(prev => 
          prev.filter(item => item._id !== interview._id)
        );

        // Update application stats
        setApplicationStats(prev => ({
          ...prev,
          [action === 'select' ? 'selected' : 'rejected']: 
            (prev[action === 'select' ? 'selected' : 'rejected'] || 0) + 1,
          scheduled: Math.max(0, scheduledInterviews.length - 1)
        }));

        Alert.alert(
          'Success', 
          `Candidate has been ${action === 'select' ? 'selected' : 'rejected'} successfully`,
          [
            {
              text: 'OK',
              onPress: async () => {
                // Refresh relevant data
                if (action === 'select') {
                  // Fetch selected candidates
                  await fetchSelectedCandidates(job.id);
                } else {
                  // Fetch rejected applications
                  await fetchApplicationsByStatus('rejected');
                }
                // Refresh scheduled interviews
                await fetchScheduledInterviews();
              }
            }
          ]
        );
      } else {
        const msg = response.data.error || 'Failed to update candidate status';
        setLimitAlert({ visible: true, title: 'Limit Reached', message: msg });
      }
    } catch (error) {
      console.error('Error handling candidate action:', error);
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
      if (status === 402 || status === 403) {
        setLimitAlert({ visible: true, title: 'Limit Reached', message: serverMsg || 'You have reached your daily review limit.' });
      } else {
        Alert.alert('Error', 'Failed to process the action. Please try again.');
      }
    }
  };

  const renderScheduledInterviewCard = (interview) => (
    <View key={interview._id} style={styles.scheduledCard}>
      {/* Profile Section */}
      <View style={styles.scheduledHeader}>
        <View style={styles.scheduledAvatar}>
          <Text style={styles.scheduledAvatarText}>
            {interview.email?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.scheduledInfo}>
          <Text style={styles.scheduledName}>{interview.name}</Text>
          <Text style={styles.scheduledEmail}>{interview.email}</Text>
        </View>
      </View>

      {/* Interview Details */}
      <View style={styles.scheduledDetails}>
        <View style={styles.detailRow}>
          <Icon name="event" size={18} color="#4B5563" />
          <Text style={styles.detailText}>
            {new Date(interview.schedule).toLocaleString('en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="videocam" size={18} color="#4B5563" />
          <Text style={styles.detailText}>{interview.platform}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="schedule" size={18} color="#4B5563" />
          <Text style={styles.detailText}>{interview.duration} minutes</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.scheduledActions}>
        <TouchableOpacity 
          style={styles.viewDetailsBtn}
          onPress={() => {
            Alert.alert(
              'Interview Details',
              `Meeting Link: ${interview.meetingLink}\n\nPassword: ${interview.meetingPassword}\n\nNotes: ${interview.interviewNotes || 'No notes'}`
            );
          }}
        >
          <Icon name="info-outline" size={18} color="#3B82F6" />
          <Text style={styles.viewDetailsBtnText}>View Details</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => handleScheduledCandidateAction(interview, 'select')}
        >
          <Icon name="check-circle" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Select</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.rejectButton}
          onPress={() => handleScheduledCandidateAction(interview, 'reject')}
        >
          <Icon name="cancel" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );

  const StatusPills = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.statusPillsContainer}
    >
      <TouchableOpacity 
        style={[styles.pill, activeSection === 'all' && styles.activePill]}
        onPress={() => {
          setActiveSection('all');
          fetchApplicationsByStatus('all');
        }}
      >
        <Text style={[styles.pillText, activeSection === 'all' && styles.activePillText]}>
          All ({applications.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.pill, activeSection === 'shortlisted' && styles.activePill]}
        onPress={() => {
          setActiveSection('shortlisted');
          fetchApplicationsByStatus('shortlisted');
        }}
      >
        <Text style={[styles.pillText, activeSection === 'shortlisted' && styles.activePillText]}>
          Shortlisted ({applicationStats.shortlisted || 0})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.pill, activeSection === 'scheduled' && styles.activePill]}
        onPress={() => {
          setActiveSection('scheduled');
          fetchScheduledInterviews();
        }}
      >
        <Text style={[styles.pillText, activeSection === 'scheduled' && styles.activePillText]}>
          Scheduled ({scheduledInterviews.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.pill, activeSection === 'rejected' && styles.activePill]}
        onPress={() => {
          setActiveSection('rejected');
          fetchApplicationsByStatus('rejected');
        }}
      >
        <Text style={[styles.pillText, activeSection === 'rejected' && styles.activePillText]}>
          Rejected ({applicationStats.rejected || 0})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.pill, activeSection === 'selected' && styles.activePill]}
        onPress={() => {
          setActiveSection('selected');
          fetchSelectedCandidates(job.companyId);
        }}
      >
        <Text style={[styles.pillText, activeSection === 'selected' && styles.activePillText]}>
          Selected ({applicationStats.selected || 0})
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const InterviewForm = useMemo(() => {
    return (
      <View style={styles.formOverlay}>
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <View style={styles.formHeaderContent}>
              <Text style={styles.formTitle}>Schedule Interview</Text>
              <Text style={styles.formSubtitle}>
                {selectedCandidate?.userId?.name ? `with ${selectedCandidate.userId.name}` : ''}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowInterviewForm(false);
                setSelectedCandidate(null);
              }}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Updated Schedule Date & Time Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Schedule Date & Time <Text style={styles.requiredStar}>*</Text></Text>
              
              <View style={styles.dateTimeContainer}>
                {/* Date Picker Button */}
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="event" size={24} color="#4B5563" />
                  <Text style={styles.datePickerText}>
                    {interviewDetails.schedule.toLocaleDateString('en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#4B5563" />
                </TouchableOpacity>

                {/* Time Picker Button */}
                <TouchableOpacity 
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Icon name="access-time" size={24} color="#4B5563" />
                  <Text style={styles.timePickerText}>
                    {interviewDetails.schedule.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#4B5563" />
                </TouchableOpacity>
              </View>

              {/* Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={interviewDetails.schedule}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      const newDate = new Date(selectedDate);
                      newDate.setHours(interviewDetails.schedule.getHours());
                      newDate.setMinutes(interviewDetails.schedule.getMinutes());
                      setInterviewDetails(prev => ({...prev, schedule: newDate}));
                    }
                  }}
                />
              )}

              {/* Time Picker */}
              {showTimePicker && (
                <DateTimePicker
                  value={interviewDetails.schedule}
                  mode="time"
                  display="default"
                  is24Hour={false}
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setInterviewDetails(prev => ({...prev, schedule: selectedDate}));
                    }
                  }}
                />
              )}

              {/* Selected Date Time Preview */}
              <View style={styles.dateTimePreview}>
                <Icon name="event-available" size={20} color="#059669" />
                <Text style={styles.dateTimePreviewText}>
                  Scheduled for {interviewDetails.schedule.toLocaleString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Interview Platform</Text>
              <View style={styles.platformOptions}>
                {['Zoom', 'Google Meet', 'Microsoft Teams', 'Other'].map(platform => (
                  <TouchableOpacity 
                    key={platform}
                    style={[
                      styles.platformOption,
                      interviewDetails.platform === platform && styles.selectedPlatform
                    ]}
                    onPress={() => setInterviewDetails(prev => ({...prev, platform}))}
                  >
                    <Text style={[
                      styles.platformText,
                      interviewDetails.platform === platform && styles.selectedPlatformText
                    ]}>
                      {platform}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Meeting Link <Text style={styles.requiredStar}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Icon name="link" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={interviewDetails.meetingLink}
                  onChangeText={(text) => setInterviewDetails(prev => ({...prev, meetingLink: text}))}
                  placeholder="Enter meeting link"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Meeting Password <Text style={styles.requiredStar}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={interviewDetails.meetingPassword}
                  onChangeText={(text) => setInterviewDetails(prev => ({...prev, meetingPassword: text}))}
                  placeholder="Enter meeting password"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Interview Duration</Text>
              <View style={styles.durationOptions}>
                {[15, 30, 45, 60].map(mins => (
                  <TouchableOpacity 
                    key={mins}
                    style={[
                      styles.durationOption,
                      interviewDetails.duration === mins && styles.selectedDuration
                    ]}
                    onPress={() => setInterviewDetails(prev => ({...prev, duration: mins}))}
                  >
                    <Text style={[
                      styles.durationText,
                      interviewDetails.duration === mins && styles.selectedDurationText
                    ]}>
                      {mins} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Interview Notes</Text>
              <View style={styles.textAreaContainer}>
                <TextInput 
                  style={styles.textArea}
                  value={interviewDetails.interviewNotes}
                  onChangeText={(text) => setInterviewDetails(prev => ({...prev, interviewNotes: text}))}
                  placeholder="Add any details or instructions for the candidate"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.formActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowInterviewForm(false);
                setSelectedCandidate(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleScheduleInterview}
            >
              <Text style={styles.submitButtonText}>Schedule Interview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [selectedCandidate, interviewDetails, setInterviewDetails, showDatePicker, showTimePicker]);

  // Add this useEffect to keep scheduledInterviews in sync
  useEffect(() => {
    if (activeSection === 'shortlisted' || activeSection === 'scheduled') {
      fetchScheduledInterviews();
    }
  }, [activeSection]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#134083" />
      </View>
    );
  }

  if (error || !jobDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          </View>
          
          {activeTab === 'applications' && (
            <TouchableOpacity 
              style={styles.headerSearchButton}
              onPress={() => setSearchVisible(!searchVisible)}
            >
              <Icon name={searchVisible ? "close" : "search"} size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Failed to load job details'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchJobDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

        {activeTab === 'applications' && (
        <TouchableOpacity 
            style={styles.headerSearchButton}
            onPress={() => setSearchVisible(!searchVisible)}
        >
            <Icon name={searchVisible ? "close" : "search"} size={24} color="#fff" />
        </TouchableOpacity>
        )}
      </View>

      {activeTab === 'applications' && searchVisible && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrapper}>
            <Icon name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, skills, email..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                const filtered = applications.filter(app => 
                  app.userId?.name?.toLowerCase().includes(text.toLowerCase()) ||
                  app.userId?.skills?.some(skill => 
                    skill.toLowerCase().includes(text.toLowerCase())
                  ) ||
                  app.userId?.email?.toLowerCase().includes(text.toLowerCase())
                );
                setFilteredApplications(filtered);
              }}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery ? (
        <TouchableOpacity 
                onPress={() => {
                  setSearchQuery('');
                  setFilteredApplications(applications);
                }}
              >
                <Icon name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}

      <View style={styles.tabs}>
        {['details', 'applications'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'details' ? 'Details' : `Applications (${applications.length})`}
          </Text>
        </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'details' ? (
          <View style={styles.detailsContainer}>
            <View style={styles.section}>
              <Text style={styles.companyName}>{jobDetails?.companyName}</Text>
              <Text style={styles.jobTitle}>{jobDetails?.jobtitle}</Text>
              
              <View style={styles.infoRow}>
                <Icon name="location-on" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{jobDetails?.location || 'Location not specified'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="work" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{jobDetails?.typeofjob || 'Job type not specified'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="people" size={20} color="#6B7280" />
                <Text style={styles.infoText}>Openings: {jobDetails?.openings}</Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="" size={20} color="#6B7280" />
                <Text style={styles.infoText}>
                  ₹{jobDetails?.minSalary || 0} - ₹{jobDetails?.maxSalary || 0} {jobDetails?.salarytype || 'per month'}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{jobDetails?.description || 'No description provided'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Skills</Text>
              <View style={styles.skillsContainer}>
                {jobDetails?.skill && jobDetails.skill.length > 0 ? (
                  jobDetails.skill.map((skill, index) => (
                    <View key={index} style={styles.skillChip}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noSkillsText}>No skills specified</Text>
                )}
              </View>
            </View>

            {/* Additional sections */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Details</Text>
              <View style={styles.infoRow}>
                <Icon name="school" size={20} color="#6B7280" />
                <Text style={styles.infoText}>Education: {jobDetails?.education || 'Not specified'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="timer" size={20} color="#6B7280" />
                <Text style={styles.infoText}>Experience Required: {jobDetails?.experiencerequired || 0} years</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="person" size={20} color="#6B7280" />
                <Text style={styles.infoText}>Gender Preference: {jobDetails?.gendertype || 'Any'}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.applicationsContainer}>
            {/* Status Pills */}
            <StatusPills />

            {/* Applications List */}
            <ScrollView style={styles.applicationsList}>
              {activeSection === 'scheduled' ? (
                scheduledInterviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                    <Icon name="event-busy" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No scheduled interviews</Text>
              </View>
            ) : (
                  scheduledInterviews.map(renderScheduledInterviewCard)
                )
              ) : (
                (searchQuery ? filteredApplications : applications).length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="person-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>
                      {searchQuery ? 'No matching applications found' : 'No applications yet'}
                    </Text>
                  </View>
                ) : (
                  (searchQuery ? filteredApplications : applications).map(renderApplicationCard)
                )
              )}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {showInterviewForm && InterviewForm}
      <LimitAlert 
        visible={limitAlert.visible}
        title={limitAlert.title}
        message={limitAlert.message}
        onClose={() => setLimitAlert({ visible: false, title: '', message: '' })}
      />

      {/* Apply Now Button */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#134083',
    padding: 16,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  headerSearchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  searchBarContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 8,
    fontSize: 14,
    color: '#134083',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 4,
    margin: 16,
    borderRadius: 8,
    flexWrap: 'wrap',
  },
  tab: {
    flex: 1,
    minWidth: '23%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    margin: 2,
  },
  activeTab: {
    backgroundColor: '#134083',
  },
  tabText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  companyName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#134083',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    color: '#4B5563',
    fontSize: 14,
  },
  applicationsContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  statusPillsContainer: {
    padding: 12,
    maxHeight: 60,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activePill: {
    backgroundColor: '#134083',
    borderColor: '#134083',
  },
  pillText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  skillTagText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '500',
  },
  moreSkillTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  moreSkillText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  scheduleText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  shortlistedCard: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    borderColor: '#D1FAE5',
    shadowColor: '#10B981',
    shadowOpacity: 0.1,
  },
  shortlistedAvatar: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  shortlistedUserName: {
    color: '#059669',
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  experienceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  experienceText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 4,
  },
  fresherTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  fresherText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  shortlistedSkillsContainer: {
    borderTopColor: '#D1FAE5',
  },
  shortlistedSkillTag: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  shortlistedSkillTagText: {
    color: '#059669',
  },
  shortlistedMoreSkillTag: {
    backgroundColor: '#E5E7EB',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  scheduleText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Enhanced interview form styles
  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  formHeaderContent: {
    flex: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  formScrollView: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  platformOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  selectedPlatform: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  platformText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedPlatformText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#134083',
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    padding: 4,
  },
  textArea: {
    height: 120,
    padding: 8,
    fontSize: 15,
    color: '#134083',
    textAlignVertical: 'top',
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 4,
  },
  selectedDuration: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedDurationText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#134083',
    padding: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  noSkillsText: {
    color: '#6B7280',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#134083',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  detailsContainer: {
    // Add any additional styles for the details container
  },
  applicationsList: {
    marginTop: 8,
  },
  interviewDetails: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  interviewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  interviewDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  viewDetailsButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  cardActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  miniActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  datePickerButton: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timePickerButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#134083',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
  },
  timePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#134083',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
  },
  dateTimePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dateTimePreviewText: {
    marginLeft: 8,
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
  },
  scheduledCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scheduledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduledAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduledAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  scheduledEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  scheduledDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  scheduledActions: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 8,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  viewDetailsBtnText: {
    color: '#3B82F6',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default JobDetails; 