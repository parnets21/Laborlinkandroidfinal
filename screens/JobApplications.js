import React, { useState, useEffect } from 'react';
import { useEmployer } from "../context/EmployerContext"; // Import EmployerContext
import axios from "axios";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


const JobDetailsPage = ({ route, navigation }) => {
  // In a real app, you would get the job ID from route.params
  const { job } = route.params;
  console.log("Job : ", job)
  // const { jobId } = route.params; // Get Job ID from navigation params
  // const { employerData } = useEmployer(); // Access employer details
  const [jobDetails, setJobDetails] = useState(null);
  // const [applicationsData, setApplicationsData] = useState([]);

  const [activeTab, setActiveTab] = useState('details');
  const [applicationsData, setApplicationsData] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionType, setActionType] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add useEffect to fetch job details when component mounts
  useEffect(() => {
    if (job.id) {
      fetchJobDetails();
    } else {
      setError('No job ID provided');
      setLoading(false);
    }
  }, [job.id]);

  // Add useEffect to fetch applications when component mounts
  useEffect(() => {
    if (job && job.id) {
      console.log('Fetching applications for job ID:', job.id);
      fetchApplications(job.id);
    }
  }, [job]);

  const handleCandidateAction = (candidate, action) => {
    setSelectedCandidate(candidate);
    setActionType(action);

    if (action === 'interview') {
      setInterviewDate('');
      setInterviewTime('');
      setInterviewLocation('');
    } else if (action === 'reject') {
      setRejectReason('');
    }

    setShowActionModal(true);
  };

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting to fetch job details...');

      // Check if we have an employer ID
      if (!employerId) {
        console.error('No employer ID available');
        setError('Employer ID not available - please try again');
        setLoading(false);
        return;
      }

      // First, fetch all jobs to find the specific job
      console.log('Fetching jobs for employer ID:', employerId);

      const response = await fetch(`http://localhost:8500/api/user/Postedjobs/${employerId}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Failed to fetch jobs: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response success:', result.success);
      console.log('API Response count:', result.count);
      console.log('API Response data length:', result.data ? result.data.length : 0);

      if (result.success && result.data) {
        // Find the specific job by ID
        console.log('Looking for job with ID:', job.id);
        const job = result.data.find(job => job._id === job.id);

        if (job) {
          console.log('Found job with matching ID:', job._id);
          setJobDetails(job);

          // Now fetch applications for this job
          await fetchApplications(job._id);
        } else {
          console.error('Job not found with ID:', job.id);
          setError(`Job with ID ${job.id} not found in the ${result.data.length} jobs returned`);
        }
      } else {
        console.error('Invalid API response format:', result);
        setError('Invalid response format or no data returned');
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(`Error fetching job details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch applications for a specific job
  const fetchApplications = async (jobId) => {
    try {
      console.log('Fetching applications for job ID:', jobId);

      // Use the API endpoint with job ID
      const response = await fetch(`https://laborlink.co.in/api/user/getApplyList/${jobId}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Applications API response not OK:', response.status, errorText);
        console.log('Will use dummy data instead');
        // Use dummy data if API fails
        setApplicationsData(getDummyApplications());
        return;
      }

      const result = await response.json();
      console.log('Applications API Response:', result);

      if (result.success && result.data && result.data.length > 0) {
        // Transform the API data to match our application format
        const formattedApplications = result.data.map(app => {
          // Extract user data from the populated userId field
          const userData = app.userId || {};

          return {
            id: app._id,
            candidate: {
              name: userData.name || 'Unknown User',
              avatar: getAvatarUrl(userData.name),
              currentRole: app.jobTitle || job.title || 'Job Applicant',
              currentCompany: app.companyName || userData.company || 'Unknown Company',
              experience: userData.experience || 'Not specified',
              location: userData.location || 'Not specified',
              email: userData.email || 'No email provided',
              phone: userData.mobile || 'No phone provided'
            },
            appliedDate: formatDate(app.appliedOn || app.createdAt),
            status: mapStatusToUI(app.status || 'Applied'),
            resumeUrl: userData.resume || '',
            coverLetter: userData.coverLetter || 'No cover letter provided',
            matchPercentage: calculateMatchPercentage(userData, job)
          };
        });

        console.log('Formatted applications:', formattedApplications);
        setApplicationsData(formattedApplications);
      } else {
        console.log('No applications found or invalid response, using dummy data');
        // Use dummy data if no applications found
        setApplicationsData(getDummyApplications());
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Use dummy data if there's an error
      setApplicationsData(getDummyApplications());
    }
  };

  // Helper function to get avatar URL
  const getAvatarUrl = (name) => {
    // Generate a consistent avatar based on name
    // This ensures the same person always gets the same avatar
    if (!name) return 'https://randomuser.me/api/portraits/lego/1.jpg';

    const firstChar = name.charCodeAt(0) || 0;
    const gender = firstChar % 2 === 0 ? 'women' : 'men';
    const number = (firstChar % 10) + 1;

    return `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
  };

  // Helper function to map API status to UI status
  const mapStatusToUI = (apiStatus) => {
    const statusMap = {
      'Applied': 'New',
      'Shortlisted': 'Shortlisted',
      'Selected': 'Shortlisted',
      'Rejected': 'Rejected'
    };

    return statusMap[apiStatus] || 'New';
  };

  // Helper function to calculate match percentage
  const calculateMatchPercentage = (application, jobData) => {
    // In a real app, you would implement a sophisticated matching algorithm
    // For now, we'll return a random percentage between 70 and 95
    return Math.floor(Math.random() * 25) + 70;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  // Function to get dummy applications data
  const getDummyApplications = () => {
    return [
      {
        id: '1',
        candidate: {
          name: 'John Doe',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          currentRole: 'Senior Developer',
          currentCompany: 'TechCorp',
          experience: '5 years',
          location: 'Bangalore',
          email: 'john.doe@example.com',
          phone: '+91 9876543210'
        },
        appliedDate: '2 days ago',
        status: 'New',
        resumeUrl: 'https://example.com/resume1.pdf',
        coverLetter: 'I am excited to apply for this position...',
        matchPercentage: 92
      },
      {
        id: '2',
        candidate: {
          name: 'Jane Smith',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          currentRole: 'UX Designer',
          currentCompany: 'DesignHub',
          experience: '3 years',
          location: 'Mumbai',
          email: 'jane.smith@example.com',
          phone: '+91 9876543211'
        },
        appliedDate: '3 days ago',
        status: 'Shortlisted',
        resumeUrl: 'https://example.com/resume2.pdf',
        coverLetter: 'With my extensive experience in design...',
        matchPercentage: 88
      },
      {
        id: '3',
        candidate: {
          name: 'Robert Johnson',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          currentRole: 'Product Manager',
          currentCompany: 'InnovateTech',
          experience: '4 years',
          location: 'Delhi',
          email: 'robert.j@example.com',
          phone: '+91 9876543212'
        },
        appliedDate: '5 days ago',
        status: 'Rejected',
        resumeUrl: 'https://example.com/resume3.pdf',
        coverLetter: 'I believe my skills in product management...',
        matchPercentage: 75
      }
    ];
  };

  const confirmAction = () => {
    // Update the application status based on the action
    const updatedApplications = applicationsData.map(app => {
      if (app.id === selectedCandidate.id) {
        let updatedStatus = app.status;

        switch (actionType) {
          case 'shortlist':
            updatedStatus = 'Shortlisted';
            break;
          case 'interview':
            updatedStatus = 'Interview Scheduled';
            // In a real app, you would save the interview details
            break;
          case 'reject':
            updatedStatus = 'Rejected';
            // In a real app, you would save the rejection reason
            break;
        }

        return { ...app, status: updatedStatus };
      }
      return app;
    });

    setApplicationsData(updatedApplications);
    setShowActionModal(false);

    // In a real app, you would make an API call to update the status
  };

  const renderApplicationItem = ({ item }) => (
    <View style={styles.applicationCard}>
      <TouchableOpacity
        style={styles.candidateCardContent}
        onPress={() => navigation.navigate('CandidateDetails', { candidateId: item.id })}
      >
        <View style={styles.applicationHeader}>
          <View style={styles.candidateInfo}>
            <Image
              source={{ uri: item.candidate.avatar }}
              style={styles.candidateAvatar}
            />
            <View>
              <Text style={styles.candidateName}>{item.candidate.name}</Text>
              <Text style={styles.candidateRole}>{item.candidate.currentRole}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              item.status === 'Shortlisted' && styles.shortlistedText,
              item.status === 'Interview Scheduled' && styles.interviewText,
              item.status === 'Rejected' && styles.rejectedText
            ]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.candidateDetails}>
          <View style={styles.detailItem}>
            <Icon name="business" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.candidate.currentCompany}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="location-on" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.candidate.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="work" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.candidate.experience}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="calendar-today" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Applied: {item.appliedDate}</Text>
          </View>
        </View>

        <View style={styles.matchContainer}>
          <Text style={styles.matchLabel}>Match</Text>
          <View style={styles.matchProgressContainer}>
            <View
              style={[
                styles.matchProgress,
                { width: `${item.matchPercentage}%` }
              ]}
            />
          </View>
          <Text style={styles.matchPercentage}>{item.matchPercentage}%</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.candidateActions}>
        <TouchableOpacity
          style={styles.viewResumeButton}
          onPress={() => {
            setSelectedCandidate(item);
            setShowResumeModal(true);
          }}
        >
          <Icon name="description" size={20} color="#4F46E5" />
          <Text style={styles.viewResumeText}>View Resume</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shortlistButton]}
            onPress={() => handleCandidateAction(item, 'shortlist')}
          >
            <Icon name="thumb-up" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Shortlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.interviewButton]}
            onPress={() => handleCandidateAction(item, 'interview')}
          >
            <Icon name="event" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleCandidateAction(item, 'reject')}
          >
            <Icon name="thumb-down" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-vert" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
            Applications ({applicationsData.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'details' ? (
        <ScrollView style={styles.detailsContainer}>
          {/* Job Title and Status */}
          <View style={styles.titleContainer}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            {/* <View style={[
              styles.statusBadge, 
              { backgroundColor: jobDetails.status === 'Active' ? '#10B981' : '#F59E0B' }
            ]}>
              <Text style={styles.statusBadgeText}>{jobDetails.status}</Text>
            </View> */}
          </View>

          {/* Job Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Icon name="business" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{job.company}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="location-on" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{job.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{job.minSalary}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="work" size={16} color="#6B7280" />
              <Text style={styles.metaText}>Experience: {job.experience}</Text>
            </View>
            {/* <View style={styles.metaItem}>
              <Icon name="calendar-today" size={16} color="#6B7280" />
              <Text style={styles.metaText}>Posted: {jobDetails.postedDate}</Text>
            </View> */}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{jobDetails.applicationsCount}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {/* <Text style={styles.statValue}>{jobDetails.viewsCount}</Text> */}
              {/* <Text style={styles.statLabel}>Views</Text> */}
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>{job.description}</Text>
          </View>

          {/* Requirements */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {jobDetails.requirements.map((req, index) => (
              <View key={index} style={styles.listItem}>
                <Icon name="check-circle" size={16} color="#4F46E5" />
                <Text style={styles.listItemText}>{req}</Text>
              </View>
            ))}
          </View>

          {/* Responsibilities */}
          {/* <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Responsibilities</Text>
            {jobDetails.responsibilities.map((resp, index) => (
              <View key={index} style={styles.listItem}>
                <Icon name="check-circle" size={16} color="#4F46E5" />
                <Text style={styles.listItemText}>{resp}</Text>
              </View>
            ))}
          </View> */}

          {/* Benefits */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            {job.benefits.map((benefit, index) => (
              <View key={index} style={styles.listItem}>
                <Icon name="check-circle" size={16} color="#4F46E5" />
                <Text style={styles.listItemText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButtonLarge, styles.editButton]}
              onPress={() => navigation.navigate('EditJob', { jobId: jobDetails.id })}
            >
              <Icon name="edit" size={20} color="#4F46E5" />
              <Text style={styles.editButtonText}>Edit Job</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButtonLarge, styles.closeButton]}
              onPress={() => {/* Handle close job */ }}
            >
              <Icon name="close" size={20} color="#EF4444" />
              <Text style={styles.closeButtonText}>Close Job</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={applicationsData}
          renderItem={renderApplicationItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.applicationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No applications yet</Text>
            </View>
          }
        />
      )}

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {actionType === 'shortlist' ? 'Shortlist Candidate' :
                  actionType === 'interview' ? 'Schedule Interview' : 'Reject Candidate'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowActionModal(false)}
                style={styles.closeModalButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedCandidate && (
                <View style={styles.selectedCandidateInfo}>
                  <Image
                    source={{ uri: selectedCandidate.candidate.avatar }}
                    style={styles.modalCandidateAvatar}
                  />
                  <View>
                    <Text style={styles.modalCandidateName}>
                      {selectedCandidate.candidate.name}
                    </Text>
                    <Text style={styles.modalCandidateRole}>
                      {selectedCandidate.candidate.currentRole}
                    </Text>
                  </View>
                </View>
              )}

              {actionType === 'shortlist' && (
                <Text style={styles.confirmationText}>
                  Are you sure you want to shortlist this candidate?
                </Text>
              )}

              {actionType === 'interview' && (
                <View style={styles.interviewForm}>
                  <Text style={styles.formLabel}>Interview Date</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY"
                    value={interviewDate}
                    onChangeText={setInterviewDate}
                  />

                  <Text style={styles.formLabel}>Interview Time</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="HH:MM AM/PM"
                    value={interviewTime}
                    onChangeText={setInterviewTime}
                  />

                  <Text style={styles.formLabel}>Location/Link</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Office address or video call link"
                    value={interviewLocation}
                    onChangeText={setInterviewLocation}
                  />
                </View>
              )}

              {actionType === 'reject' && (
                <View style={styles.rejectForm}>
                  <Text style={styles.formLabel}>Reason for Rejection (Optional)</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="Provide feedback for the candidate"
                    multiline={true}
                    numberOfLines={4}
                    value={rejectReason}
                    onChangeText={setRejectReason}
                  />
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowActionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  actionType === 'shortlist' && styles.shortlistConfirmButton,
                  actionType === 'interview' && styles.interviewConfirmButton,
                  actionType === 'reject' && styles.rejectConfirmButton
                ]}
                onPress={confirmAction}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Resume Modal */}
      <Modal
        visible={showResumeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResumeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resumeModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Candidate Resume</Text>
              <TouchableOpacity
                onPress={() => setShowResumeModal(false)}
                style={styles.closeModalButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedCandidate && (
              <ScrollView style={styles.resumeContainer}>
                <View style={styles.resumeHeader}>
                  <Text style={styles.resumeName}>{selectedCandidate.candidate.name}</Text>
                  <Text style={styles.resumeRole}>{selectedCandidate.candidate.currentRole}</Text>

                  <View style={styles.resumeContactInfo}>
                    <View style={styles.contactItem}>
                      <Icon name="email" size={16} color="#6B7280" />
                      <Text style={styles.contactText}>{selectedCandidate.candidate.email}</Text>
                    </View>
                    <View style={styles.contactItem}>
                      <Icon name="phone" size={16} color="#6B7280" />
                      <Text style={styles.contactText}>{selectedCandidate.candidate.phone}</Text>
                    </View>
                    <View style={styles.contactItem}>
                      <Icon name="location-on" size={16} color="#6B7280" />
                      <Text style={styles.contactText}>{selectedCandidate.candidate.location}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.resumeSection}>
                  <Text style={styles.resumeSectionTitle}>Experience</Text>
                  <Text style={styles.resumeText}>
                    {selectedCandidate.candidate.currentRole} at {selectedCandidate.candidate.currentCompany}
                  </Text>
                  <Text style={styles.resumeText}>
                    Total Experience: {selectedCandidate.candidate.experience}
                  </Text>
                </View>

                <View style={styles.resumeSection}>
                  <Text style={styles.resumeSectionTitle}>Cover Letter</Text>
                  <Text style={styles.resumeText}>{selectedCandidate.coverLetter}</Text>
                </View>

                <View style={styles.resumeActions}>
                  <TouchableOpacity style={styles.resumeActionButton}>
                    <Icon name="download" size={20} color="#4F46E5" />
                    <Text style={styles.resumeActionText}>Download PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.resumeActionButton}>
                    <Icon name="print" size={20} color="#4F46E5" />
                    <Text style={styles.resumeActionText}>Print</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#134083',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  moreButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#134083',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#10B981',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  metaContainer: {
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
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  statsContainer: {
    flexDirection: 'row',
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

  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#134083',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  sectionContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listItemText: {
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  actionButtonLarge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  editButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  closeButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  applicationsList: {
    padding: 16,
  },
  applicationCard: {
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
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  candidateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
  },
  candidateRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  shortlistedText: {
    color: '#10B981',
  },
  interviewText: {
    color: '#3B82F6',
  },
  rejectedText: {
    color: '#EF4444',
  },
  candidateDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6B7280',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  matchProgressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 8,
  },
  matchProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  matchPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  candidateActions: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  viewResumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  viewResumeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  shortlistButton: {
    backgroundColor: '#10B981',
  },
  interviewButton: {
    backgroundColor: '#3B82F6',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  resumeModalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
  },
  closeModalButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  selectedCandidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCandidateAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  modalCandidateName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
  },
  modalCandidateRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  confirmationText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 16,
  },
  interviewForm: {
    marginBottom: 16,
  },
  rejectForm: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shortlistConfirmButton: {
    backgroundColor: '#10B981',
  },
  interviewConfirmButton: {
    backgroundColor: '#3B82F6',
  },
  rejectConfirmButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  resumeContainer: {
    flex: 1,
    padding: 16,
  },
  resumeHeader: {
    marginBottom: 24,
  },
  resumeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#134083',
    marginBottom: 4,
  },
  resumeRole: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 16,
  },
  resumeContactInfo: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  resumeSection: {
    marginBottom: 24,
  },
  resumeSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  resumeText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  resumeActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  resumeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  resumeActionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  candidateCardContent: {
    marginBottom: 12,
  },
});

export default JobDetailsPage;