import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BASE_URL } from '../constants/config'

const MyApplies = ({ navigation }) => {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [fadeAnim] = useState(new Animated.Value(1))
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [acceptedApps, setAcceptedApps] = useState([])
  const [rejectedApps, setRejectedApps] = useState([])
  const [selectedApps, setSelectedApps] = useState([])

  useEffect(() => {
    fetchApplications()
  }, []) 

  useEffect(() => {
    console.log('Current applications:', applications);
    console.log('Accepted applications:', acceptedApps);
    console.log('Rejected applications:', rejectedApps);
  }, [applications, acceptedApps, rejectedApps]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const storedUserData = await AsyncStorage.getItem("userData");
      const userId = storedUserData ? JSON.parse(storedUserData)._id : null; 
      console.log('User ID:', userId) 
      console.log("Stored user data:", storedUserData)

      if (!userId) {
        Alert.alert('Error', 'Please login to view your applications');
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/user/getlistOOfaplly/${userId}`);
      console.log('Raw API Response:', response); 

      // Check if response.data exists and has the expected structure
      if (response.data.success) {
        // If the data is directly an array
        const applicationsData = Array.isArray(response.data.success) ? response.data.success : 
                               (response.data.data ? response.data.data : []);

        console.log('Applications data before formatting:', applicationsData);

        // Format the applications with null checks for companyId
        const formattedApplications = applicationsData.map(app => {
          console.log('Processing application:', app);
          
          // Add null check for companyId
          const companyData = app.companyId || {};
          
          return {
            _id: app._id || '',
            fullName: app.companyName || companyData.companyName || '',
            email: app.email || '',
            skills: companyData.skill || [],
            phone: companyData.whatsapp || companyData.companymobile || '',
            workExperience: app.workExperience || false,
            education: companyData.education || [],
            preferredSalary: companyData.preferredSalary || { minSalary: 0, maxSalary: 0 },
            online: app.online || '',
            city: app.city || '',
            state: app.state || '',
            status: app.status || 'Applied',
            appliedOn: app.appliedOn || app.createdAt || new Date(),
            jobType: companyData.typeofwork || companyData.companytype || '',
            location: companyData.location || companyData.companyaddress || '',
            bio: app.bio || '',
            department: companyData.companyindustry || companyData.department || '',
            companyType: companyData.companytype || app.companyType || '',
            jobRole: companyData.jobProfile || companyData.jobtitle || app.jobTitle || '',
            jobTitle: app.jobTitle || companyData.jobtitle || ''
          };
        });

        console.log('Formatted Applications:', formattedApplications);
        
        // Update state with formatted applications
        setApplications(formattedApplications);

        // Filter for shortlisted applications
        const shortlistedApps = formattedApplications.filter(app => 
          app.status.toLowerCase() === 'shortlisted'
        );
        
        // Filter for rejected applications
        const rejectedApps = formattedApplications.filter(app => 
          app.status.toLowerCase() === 'rejected'
        );

        // Filter for selected applications
        const selectedApps = formattedApplications.filter(app => 
          app.status.toLowerCase() === 'selected'
        );

        setAcceptedApps(shortlistedApps);
        setRejectedApps(rejectedApps);
        setSelectedApps(selectedApps);

      } else {
        console.log('Invalid response format:', response);
        setApplications([]);
        setAcceptedApps([]);
        setRejectedApps([]);
        setSelectedApps([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error.response || error);
      Alert.alert(
        'Error',
        'Failed to load applications. Please try again later.',
        [
          {
            text: 'Retry',
            onPress: () => fetchApplications()
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter applications based on status
  const filteredApplications = () => {
    switch (selectedStatus) {
      case 'shortlisted':
        return applications.filter(app => app.status.toLowerCase() === 'shortlisted');
      case 'rejected':
        return applications.filter(app => app.status.toLowerCase() === 'rejected');
      case 'selected':
        return applications.filter(app => app.status.toLowerCase() === 'selected');
      case 'all':
      default:
        return applications;
    }
  }

  console.log('Rendering with filtered applications:', filteredApplications());

  const renderApplicationCard = (application) => (
    <View key={application._id} style={styles.applicationCard}>
      {/* Company Header */}
      <View style={styles.cardHeader}>
        <View style={styles.companyLogoContainer}>
          <Text style={styles.companyLogoText}>
            {application.fullName?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.jobTitle}>{application.jobRole || application.jobTitle || 'No Title'}</Text>
          <Text style={styles.companyName}>{application.fullName || 'Unknown Company'}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, {
              backgroundColor: 
                application.status.toLowerCase() === 'shortlisted' ? '#059669' :
                application.status.toLowerCase() === 'rejected' ? '#DC2626' :
                application.status.toLowerCase() === 'selected' ? '#3B82F6' : '#F59E0B'
            }]}>
              <Text style={styles.statusText}>{application.status}</Text>
            </View>
            <Text style={styles.appliedDate}>
              Applied on {new Date(application.appliedOn).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Job Details */}
      <View style={styles.detailsContainer}>
        {/* Department & Type */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="business" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{application.department || 'Not specified'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="work" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{application.jobType || 'Not specified'}</Text>
          </View>
        </View>

        {/* Location & Experience */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="location-on" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{application.location || 'Not specified'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="timeline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{application.workExperience ? 'Experienced' : 'Fresher'}</Text>
          </View>
        </View>

        {/* Skills */}
        {application.skills && application.skills?.length > 0 && (
          <View style={styles.skillsContainer}>
            {application.skills?.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoItem}>
            <Icon name="school" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {typeof application.education === 'string' ? application.education : 'Not specified'}
            </Text>
          </View>
          {application.companyType && (
            <View style={styles.infoItem}>
              <Icon name="business-center" size={16} color="#6B7280" />
              <Text style={styles.infoText}>{application.companyType}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#134083" />
        <Text style={styles.loadingText}>Loading your applications...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Applications</Text>
          <Text style={styles.headerSubtitle}>Track your job applications</Text>
        </View>
      </View>

      {/* Status Summary Cards */}
      <View style={styles.statusSummary}>
        <TouchableOpacity 
          style={[styles.statusCard, selectedStatus === 'all' && styles.selectedCard]}
          onPress={() => setSelectedStatus('all')}
        >
          <View style={[styles.statusIconContainer, { backgroundColor: '#134083' }]}>
            <Icon name="folder" size={24} color="#fff" />
          </View>
          <Text style={styles.statusNumber}>{applications.length}</Text>
          <Text style={styles.statusLabel}>Total Applied</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statusCard, selectedStatus === 'shortlisted' && styles.selectedCard]}
          onPress={() => setSelectedStatus('shortlisted')}
        >
          <View style={[styles.statusIconContainer, { backgroundColor: '#059669' }]}>
            <Icon name="check-circle" size={24} color="#fff" />
          </View>
          <Text style={styles.statusNumber}>{acceptedApps.length}</Text>
          <Text style={styles.statusLabel}>Shortlisted</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statusCard, selectedStatus === 'rejected' && styles.selectedCard]}
          onPress={() => setSelectedStatus('rejected')}
        >
          <View style={[styles.statusIconContainer, { backgroundColor: '#DC2626' }]}>
            <Icon name="cancel" size={24} color="#fff" />
          </View>
          <Text style={styles.statusNumber}>{rejectedApps.length}</Text>
          <Text style={styles.statusLabel}>Rejected</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statusCard, selectedStatus === 'selected' && styles.selectedCard]}
          onPress={() => setSelectedStatus('selected')}
        >
          <View style={[styles.statusIconContainer, { backgroundColor: '#4F46E5' }]}>
            <Icon name="check-circle" size={24} color="#fff" />
          </View>
          <Text style={styles.statusNumber}>{selectedApps.length}</Text>
          <Text style={styles.statusLabel}>Selected</Text>
        </TouchableOpacity>
      </View>

      {/* Applications List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredApplications().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="work-off" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No applications found</Text>
            <TouchableOpacity 
              style={styles.browseJobsButton}
              onPress={() => navigation.navigate('AllJobsScreen')}
            >
              <Text style={styles.browseJobsText}>Browse Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredApplications().map(application => renderApplicationCard(application))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#134083",
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E5E7EB",
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statusSummary: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    marginTop: -30,
  },
  statusCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    borderColor: "#134083",
    borderWidth: 2,
    backgroundColor: "#F8FAFC",
  },
  statusIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#134083",
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  companyLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyLogoText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4F46E5',
  },
  headerInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  appliedDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  salaryText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  browseJobsButton: {
    marginTop: 20,
    backgroundColor: "#134083",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseJobsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
})
export default MyApplies