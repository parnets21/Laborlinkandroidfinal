"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Image,
  RefreshControl,
  Linking,
  FlatList
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BASE_URL } from '../constants/config';
import axios from "axios"
const { width } = Dimensions.get('window')

const EmployerDashboard = ({ navigation }) => {
  const [offerLetters, setOfferLetters] = useState([])
  const [loadingOffers, setLoadingOffers] = useState(false) // Changed initial state to false
  const [errorMessage, setErrorMessage] = useState('')
  const [jobs, setJobs] = useState([]);
  const [companyId, setCompanyId] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasJobs, setHasJobs] = useState(false); // Track if employer has jobs
  const [fetchError, setFetchError] = useState(null);
  const [profileData, setProfileData] = useState({
    CompanyName: '',
    companyWebsite: '',
    address: '',
    numberOfemp: '',
    industry: '',
    email: '',
    mobile: '',
    companyLogo: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});


  console.log("jobs count:", jobs.length);
  console.log("companyId:", companyId);

  const makeCall = (phoneNumber = '1234567890') => {
    let url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(err => {
      console.warn('Failed to make a call:', err);
    });
  };

  const sendEmail = (email = 'example@example.com', subject = '', body = '') => {
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(err => {
      console.warn('Failed to send email:', err);
    });
  };

  const fetchJobs = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { _id: employerId } = JSON.parse(userData);

      const response = await axios.get(`${BASE_URL}/api/user/Postedjobs/${employerId}`);
      const jobsData = response.data.jobs;

      if (Array.isArray(jobsData) && jobsData.length > 0) {
        setJobs(jobsData);
        setHasJobs(true);

        // Extract job IDs dynamically
        const extractedIds = jobsData.map(job => String(job._id));
        setCompanyId(extractedIds);

        console.log("All Job IDs:", extractedIds);
      } else {
        setJobs([]);
        setCompanyId([]);
        setHasJobs(false);
        setOfferLetters([]); // Clear offer letters if no jobs
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setCompanyId([]);
      setHasJobs(false);
      setOfferLetters([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch offer letters from API
  const fetchOfferLetters = async () => {
    // Don't fetch if no jobs exist
    if (!hasJobs || !companyId || companyId.length === 0) {
      console.log('No jobs available, skipping offer letters fetch');
      setOfferLetters([]);
      setLoadingOffers(false);
      setErrorMessage('');
      return;
    }

    setLoadingOffers(true);
    setErrorMessage('');

    try {
      // Try to fetch offer letters for all job IDs
      let allOfferLetters = [];
      let hasErrors = false;
      let errorDetails = [];

      for (const jobId of companyId) {
        try {
          const url = `http://localhost:8500/api/offers/applications/${jobId}`;
          console.log('Fetching offer letters for job:', jobId, 'from:', url);

          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            console.log(`Fetched offer letters for job ${jobId}:`, data);

            if (data.success && Array.isArray(data.data)) {
              allOfferLetters = [...allOfferLetters, ...data.data];
            }
          } else {
            // Handle specific HTTP errors
            const errorText = await response.text();
            console.log(`Job ${jobId} - HTTP ${response.status}:`, errorText);

            if (response.status === 404) {
              // 404 means no applications for this job yet - this is normal
              console.log(`No applications found for job ${jobId} (404 - Normal)`);
            } else if (response.status === 400) {
              // 400 might mean invalid job ID or other client error
              console.log(`Bad request for job ${jobId} (400 - Possible invalid job ID)`);
              hasErrors = true;
              errorDetails.push(`Job ${jobId}: Bad request`);
            } else {
              // Other errors
              hasErrors = true;
              errorDetails.push(`Job ${jobId}: HTTP ${response.status}`);
            }
          }
        } catch (fetchError) {
          console.error(`Error fetching for job ${jobId}:`, fetchError);
          hasErrors = true;
          errorDetails.push(`Job ${jobId}: ${fetchError.message}`);
        }
      }

      // Set the results
      setOfferLetters(allOfferLetters);

      // Only show error if there are actual errors (not just 404s)
      if (hasErrors && errorDetails.length > 0) {
        console.log('Some jobs had errors:', errorDetails);
        // Don't show error message for normal cases (like no applications)
        // setErrorMessage(`Some jobs couldn't be loaded: ${errorDetails.join(', ')}`);
      }

      console.log('Total offer letters found:', allOfferLetters.length);

    } catch (error) {
      const errorMsg = `Error fetching offer letters: ${error.message}`;
      setErrorMessage(errorMsg);
      setOfferLetters([]);
      console.error('Error in fetchOfferLetters:', error);
    } finally {
      setLoadingOffers(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs(); // Fetch jobs first, then offer letters will be fetched in useEffect
  };

  useEffect(() => {
    if (hasJobs && companyId && companyId.length > 0) {
      fetchOfferLetters();
    }
  }, [hasJobs, companyId]);

  // Helper functions
  const getOfferStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return { bg: '#DCFCE7', text: '#059669' }
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706' }
      case 'accepted':
        return { bg: '#DBEAFE', text: '#3B82F6' }
      case 'declined':
        return { bg: '#FEE2E2', text: '#DC2626' }
      default:
        return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  const getApplicationStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'hired':
        return { bg: '#DCFCE7', text: '#059669' }
      case 'selected':
        return { bg: '#DBEAFE', text: '#3B82F6' }
      case 'applied':
        return { bg: '#FEF3C7', text: '#D97706' }
      case 'declined':
        return { bg: '#FEE2E2', text: '#DC2626' }
      default:
        return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatSalary = (salary) => {
    if (!salary) return 'N/A'
    const salaryNum = parseInt(salary)
    if (salaryNum >= 100000) {
      return `₹${(salaryNum / 100000).toFixed(1)} LPA`
    }
    return `₹${salaryNum.toLocaleString()}`
  }

  const getAvatarFromName = (name) => {
    if (!name) return '👤'
    const firstLetter = name.charAt(0).toUpperCase()
    const avatars = {
      'A': '👨‍💻', 'B': '👩‍💻', 'C': '👨‍🎨', 'D': '👩‍🎨', 'E': '👨‍💼',
      'F': '👩‍💼', 'G': '👨‍🔬', 'H': '👩‍🔬', 'I': '👨‍🏫', 'J': '👩‍🏫',
      'K': '👨‍💻', 'L': '👩‍💻', 'M': '👨‍🎨', 'N': '👩‍🎨', 'O': '👨‍💼',
      'P': '👩‍💼', 'Q': '👨‍🔬', 'R': '👩‍🔬', 'S': '👨‍🏫', 'T': '👩‍🏫',
      'U': '👨‍💻', 'V': '👩‍💻', 'W': '👨‍🎨', 'X': '👩‍🎨', 'Y': '👨‍💼', 'Z': '👩‍💼'
    }
    return avatars[firstLetter] || '👤'
  }

  const handleEmailContact = (email) => {
    Alert.alert('Email', `Contact: ${email}`)
  }

  const handlePhoneContact = (phone) => {
    Alert.alert('Phone', `Call: ${phone}`)
  }

  const handleTrackLive = (application) => {
    navigation.navigate('TrackLiveScreen', { application });
  }

  const handleViewLocation = (location) => {
    Alert.alert('Location', `View location: ${location}`)
  }

  // Component to render when no jobs exist
  const renderNoJobsState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="work-off" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>No jobs posted yet</Text>
      <Text style={styles.emptySubText}>Post your first job to start receiving applications and managing offer letters</Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("CreateJob")}
      >
        <Icon name="add" size={16} color="#fff" />
        <Text style={styles.primaryButtonText}>Post Your First Job</Text>
      </TouchableOpacity>
    </View>
  );

  const getUserData = async () => {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) {
      throw new Error('No user data found');
    }
    return JSON.parse(userData);
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      // Get user data from storage
      const userData = await getUserData();
      console.log('User data:', userData);

      if (!userData._id) {
        throw new Error('User ID not found');
      }

      // Log the URL we're calling
      console.log('Fetching from:', `${BASE_URL}/api/user/employer/${userData._id}`);

      // Fetch employer profile
      const response = await axios.get(`${BASE_URL}/api/user/employer/${userData._id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Profile API Response:', response.data);

      if (response.data.success && response.data.data) {
        const employerData = response.data.data;
        console.log('Employer Data received:', employerData);

        // Map backend data to state with proper defaults
        const profileInfo = {
          CompanyName: employerData.CompanyName || '',
          companyWebsite: employerData.companyWebsite || '',
          address: employerData.address || '',
          numberOfemp: employerData.numberOfemp?.toString() || '',
          industry: employerData.industry || '',
          email: employerData.email || userData.email || '',
          mobile: employerData.mobile || userData.mobile || '',
          companyLogo: employerData.companyLogo || null,
        };

        console.log('Setting profile info:', profileInfo);
        setProfileData(profileInfo);
        setEditedData(profileInfo);
      } else {
        // If no specific employer data is found, use data from userData
        console.log('No employer data found, using userData defaults');
        const defaultProfile = {
          ...profileData,
          email: userData.email || '',
          mobile: userData.mobile || '',
          CompanyName: userData.name || '',
        };
        setProfileData(defaultProfile);
        setEditedData(defaultProfile);
      }
    } catch (error) {
      console.error('Error details:', error.response || error);
      let errorMessage = 'Could not load profile data. Please try again.';

      // More specific error messages based on response
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid employer ID';
            break;
          case 404:
            errorMessage = 'Employer profile not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
        }
      }

      setFetchError(errorMessage);

      // Try to use basic userData if available
      try {
        const userData = await getUserData();
        console.log('Falling back to user data:', userData);
        const fallbackProfile = {
          ...profileData,
          email: userData.email || '',
          mobile: userData.mobile || '',
          CompanyName: userData.name || '',
        };
        setProfileData(fallbackProfile);
        setEditedData(fallbackProfile);
      } catch (e) {
        console.error('Failed to load fallback data:', e);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [offers, setOffers] = useState([]);

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/templates?category=Offer`);
      setOffers(res.data.data.filter((offer) => offer.type === "employer"));
    } catch (err) {
      console.error("Error fetching offers", err);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);


  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back! 👋 , {profileData.CompanyName}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{jobs.length}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{offerLetters.length}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{offerLetters.filter(app => app?.applicationStatus === 'hired').length}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
          <View style={styles.statDivider} />

        </View>
      </View>

      {/* Enhanced Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => navigation.navigate("CreateJob")}
        >
          <View style={styles.actionIconContainer}>
            <Icon name="add-circle" size={24} color="#4F46E5" />
          </View>
          <Text style={styles.actionButtonText}>Post Job</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("JobHistory")}
        >
          <View style={styles.actionIconContainer}>
            <Icon name="work" size={24} color="#059669" />
          </View>
          <Text style={styles.actionButtonText}>Manage Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("EmployeeSubscription",{type:'employer'})}
        >
          <View style={styles.actionIconContainer}>
            <Icon name="payment" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.actionButtonText}>Subscription</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Show loading state while fetching jobs */}
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : !hasJobs ? (
          // Show no jobs state
          renderNoJobsState()
        ) : (
          <>
            {/* Enhanced Offer Letter Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Icon name="description" size={20} color="#F59E0B" />
                  <Text style={styles.sectionTitle}>Offer Letters</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("GenerateOffer")}
                  style={styles.createButton}
                >
                  <Icon name="add" size={16} color="#fff" />
                  <Text style={styles.createButtonText}>Create New</Text>
                </TouchableOpacity>
              </View>

              {loadingOffers ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading applications...</Text>
                </View>
              ) : offerLetters.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="description" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No applications yet</Text>
                  <Text style={styles.emptySubText}>Applications and offer letters will appear here once candidates apply to your jobs</Text>
                  {errorMessage && (
                    <Text style={styles.debugText}>Debug: {errorMessage}</Text>
                  )}
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {offerLetters.filter(application => application.applicationStatus !== 'hired' && application.applicationStatus !== 'applied')
                    .map((application) => {
                      const user = application.userId
                      const offerLetter = application.offerLetter
                      const statusColors = getOfferStatusColor(offerLetter?.status)
                      const appStatusColors = getApplicationStatusColor(application.applicationStatus)

                      return (
                        <TouchableOpacity
                          key={application._id}
                          style={styles.offerLetterCard}
                        >
                          <View style={styles.offerCardHeader}>
                            <View style={styles.candidateAvatarContainer}>
                              <Image
                                source={{ uri: user?.profile || 'https://via.placeholder.com/64' }}
                                style={styles.avatar}
                              />
                            </View>
                            <View style={styles.statusContainer}>
                              <View style={[
                                styles.offerStatusBadge,
                                { backgroundColor: statusColors.bg }
                              ]}>
                                <Text style={[
                                  styles.offerStatusText,
                                  { color: statusColors.text }
                                ]}>
                                  {offerLetter?.status || 'pending'}
                                </Text>
                              </View>
                              <View style={[
                                styles.appStatusBadge,
                                { backgroundColor: appStatusColors.bg }
                              ]}>
                                <Text style={[
                                  styles.appStatusText,
                                  { color: appStatusColors.text }
                                ]}>
                                  {application.applicationStatus || 'applied'}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <Text style={styles.candidateOfferName}>
                            {user?.fullName || 'Unknown Candidate'}
                          </Text>
                          <Text style={styles.offerPosition}>
                            {application.jobTitle || 'No Position'}
                          </Text>

                          <View style={styles.offerDateContainer}>
                            <Icon name="event" size={16} color="#6B7280" />
                            <Text style={styles.offerDateText}>
                              Applied: {formatDate(application.appliedOn)}
                            </Text>
                          </View>

                          <View style={styles.offerDetailsContainer}>
                            <View style={styles.offerDetailItem}>
                              <Text style={styles.offerDetailLabel}>Salary</Text>
                              <Text style={styles.offerDetailValue}>
                                {formatSalary(offerLetter?.salary)}
                              </Text>
                            </View>
                            <View style={styles.offerDetailItem}>
                              <Text style={styles.offerDetailLabel}>Start Date</Text>
                              <Text style={styles.offerDetailValue}>
                                {formatDate(offerLetter?.startDate)}
                              </Text>
                            </View>
                            <View style={styles.offerDetailItem}>
                              <Text style={styles.offerDetailLabel}>Location</Text>
                              <Text style={styles.offerDetailValue}>
                                {offerLetter?.workLocation || user?.location || 'N/A'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.offerActions}>
                            <TouchableOpacity
                              style={styles.offerActionButton}
                              onPress={() => sendEmail(`${user?.email}`, 'Hi Dear,')}
                            >
                              <Icon name="email" size={14} color="#4F46E5" />
                              <Text style={styles.offerActionText}>Email</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.offerActionButton}
                              onPress={() => makeCall(user?.phone)}
                            >
                              <Icon name="phone" size={14} color="#059669" />
                              <Text style={styles.offerActionText}>Call</Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                </ScrollView>
              )}
            </View>

            {/* View Location Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Icon name="location-on" size={20} color="#059669" />
                  <Text style={styles.sectionTitle}>View Location</Text>
                </View>
              </View>

              {loadingOffers ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading employee locations...</Text>
                </View>
              ) : offerLetters.filter(application => application.applicationStatus === 'hired').length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="location-on" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No employee locations found</Text>
                  <Text style={styles.emptySubText}>Employee locations will appear here once you hire candidates</Text>
                  {errorMessage && (
                    <Text style={styles.debugText}>Debug: {errorMessage}</Text>
                  )}
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {offerLetters.filter(application => application.applicationStatus === 'hired')
                    .map((application) => {
                      const user = application.userId
                      const offerLetter = application.offerLetter
                      const statusColors = getOfferStatusColor(offerLetter?.status)
                      const appStatusColors = getApplicationStatusColor(application.applicationStatus)

                      return (
                        <TouchableOpacity
                          key={`location-${application._id}`}
                          style={styles.offerLetterCard}
                        >
                          <View style={styles.offerCardHeader}>
                            <View style={styles.candidateAvatarContainer}>
                              <Image
                                source={{ uri: user?.profile || 'https://via.placeholder.com/64' }}
                                style={styles.avatar}
                              />
                            </View>
                            <View style={styles.statusContainer}>
                              <View style={[
                                styles.offerStatusBadge,
                                { backgroundColor: statusColors.bg }
                              ]}>
                                <Text style={[
                                  styles.offerStatusText,
                                  { color: statusColors.text }
                                ]}>
                                  {offerLetter?.status || 'pending'}
                                </Text>
                              </View>
                              <View style={[
                                styles.appStatusBadge,
                                { backgroundColor: appStatusColors.bg }
                              ]}>
                                <Text style={[
                                  styles.appStatusText,
                                  { color: appStatusColors.text }
                                ]}>
                                  {application.applicationStatus || 'applied'}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <Text style={styles.candidateOfferName}>
                            {user?.fullName || 'Unknown Candidate'}
                          </Text>
                          <Text style={styles.offerPosition}>
                            {application.jobTitle || 'No Position'}
                          </Text>

                          <View style={styles.offerDateContainer}>
                            <Icon name="event" size={16} color="#6B7280" />
                            <Text style={styles.offerDateText}>
                              Applied: {formatDate(application.appliedOn)}
                            </Text>
                          </View>

                          <View style={styles.offerDetailsContainer}>
                            <View style={styles.offerDetailItem}>
                              <Text style={styles.offerDetailLabel}>Salary</Text>
                              <Text style={styles.offerDetailValue}>
                                {formatSalary(offerLetter?.salary)}
                              </Text>
                            </View>
                            <View style={styles.offerDetailItem}>
                              <Text style={styles.offerDetailLabel}>Start Date</Text>
                              <Text style={styles.offerDetailValue}>
                                {formatDate(offerLetter?.startDate)}
                              </Text>
                            </View>
                            <View style={styles.offerDetailItem}>
                              <Text style={styles.offerDetailLabel}>Location</Text>
                              <Text style={styles.offerDetailValue}>
                                {offerLetter?.workLocation || user?.location || 'N/A'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.offerActions}>
                            <TouchableOpacity
                              style={styles.offerActionButton}
                              onPress={() => sendEmail(`${user?.email}`, 'Hi Dear,')}
                            >
                              <Icon name="email" size={14} color="#4F46E5" />
                              <Text style={styles.offerActionText}>Email</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.offerActionButton}
                              onPress={() => makeCall(user?.phone)}
                            >
                              <Icon name="phone" size={14} color="#059669" />
                              <Text style={styles.offerActionText}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.offerActionButton}
                              onPress={() => handleTrackLive(application)}
                            >
                              <Icon name="track-changes" size={14} color="#DC2626" />
                              <Text style={styles.offerActionText}>Track Live</Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                </ScrollView>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Icon name="local-offer" size={20} color="#059669" />
                  <Text style={styles.sectionTitle}>Offers and Template</Text>
                </View>
              </View>

              <FlatList
                data={offers}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
                renderItem={({ item }) => (
                  <View style={styles.offerCard}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.offerImage}
                      resizeMode="cover"
                    />
                    <View style={styles.offerContent}>
                      <Text style={styles.offerTitle}>{item.title}</Text>
                      <Text style={styles.offerDescription} numberOfLines={2}>
                        {item.description}
                      </Text>

                      {/* Tags */}
                      <View style={styles.tagContainer}>
                        {item.tags?.map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              />


            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// Add these styles to your existing StyleSheet
const additionalStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default EmployerDashboard
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#134083",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#E5E7EB",
    marginBottom: 4,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#E5E7EB",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  quickActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    backgroundColor: "#fff",
    marginTop: -30,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  primaryAction: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },
  actionIconContainer: {
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#134083",
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#134083",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  offerLetterCard: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  offerCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  candidateAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  applicationHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarText: {
    fontSize: 20,
  },
  statusContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  offerStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offerStatusText: {
    fontSize: 10,
    fontWeight: "600",
  
  },
  appStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  candidateOfferName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#134083",
    marginBottom: 4,
  },
  offerPosition: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },
  offerDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  offerDateText: {
    fontSize: 12,
    color: "#6B7280",
  },
  offerDetailsContainer: {
    marginBottom: 16,
    gap: 8,
  },
  offerDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  offerDetailLabel: {
    fontSize: 12,
    color: "#6B7280",
    width:150
  },
  offerDetailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#134083",
  },
  responseContainer: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  responseLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  responseText: {
    fontSize: 12,
    color: "#134083",
    fontStyle: "italic",
  },
  offerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  offerActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  offerActionText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  loader: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  errorContainer: {
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 12,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
    width: 220,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  offerImage: {
    width: '100%',
    height: 120,
  },
  offerContent: {
    padding: 10,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  offerDescription: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  tag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },

  tagText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
  },
});