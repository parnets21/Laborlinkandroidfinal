"use client"
import { View, Text, StyleSheet, SafeAreaView,
   TouchableOpacity, TextInput, ScrollView, Image,
    ActivityIndicator, Alert, Modal, Dimensions, BackHandler, 
    ToastAndroid,
    AppState, FlatList, RefreshControl} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import React, { useState, useEffect, useCallback } from "react"
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import axios, { all } from 'axios'
import { BASE_URL } from '../constants/config'
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from "react-native-fast-image"
import employeelogo from '../assets/logo.jpeg';
import SubscriptionGuard from '../components/SubscriptionGuard';
import useSubscriptionValidation from '../hooks/useSubscriptionValidation';
import SubscriptionValidationService from '../services/subscriptionValidationService';

const FilterChip = ({ icon, label, selected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.filterChip,
      selected && styles.filterChipSelected
    ]}
    onPress={onPress}
  >
    <Icon name={icon} size={18} color={selected ? '#fff' : '#6B7280'} />
    <Text style={[
      styles.filterChipText,
      selected && styles.filterChipTextSelected
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Add this function near your other helper functions
const getSectionColors = (section) => {
  const colorSchemes = {
    popular: {
      card: '#4F46E5', // Indigo
      text: '#fff',
      badge: 'rgba(255, 255, 255, 0.2)',
    },
    highestPaying: {
      card: '#059669', // Green
      text: '#fff',
      badge: 'rgba(255, 255, 255, 0.2)',
    },
    suggested: {
      card: '#DC2626', // Red
      text: '#fff',
      badge: 'rgba(255, 255, 255, 0.2)',
    },
    related: {
      card: '#0EA5E9', // Blue
      text: '#fff',
      badge: 'rgba(255, 255, 255, 0.2)',
    },
    workMode: {
      card: '#8B5CF6', // Purple
      text: '#fff',
      badge: 'rgba(255, 255, 255, 0.2)',
    },
    activelyHiring: {
      card: '#F59E0B', // Amber
      text: '#fff',
      badge: 'rgba(255, 255, 255, 0.2)',
    }
  };

  return colorSchemes[section] || {
    card: '#26437c',
    text: '#fff',
    badge: 'rgba(255, 255, 255, 0.2)'
  };
};

const EmployeeDashboard = ({ navigation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    jobType: 'all',
    experience: 'all',
    salary: 'all',
    location: 'all'
  });
  const [popularJobs, setPopularJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState({
    recommended: true,
    highestPaying: true,
    suggested: true,
    related: true,
    popular: true,
    all: true
  });
  const [error, setError] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [highestPayingJobs, setHighestPayingJobs] = useState([]);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Subscription validation
  const { 
    subscriptionStatus, 
    validateAction, 
    executeAction, 
    getUsagePercentage,
    isSubscribed,
    userType 
  } = useSubscriptionValidation();

  // Debug subscription status
  useEffect(() => {
    if (subscriptionStatus) {
      console.log('Subscription Status:', JSON.stringify(subscriptionStatus, null, 2));
      console.log('Plan Name:', subscriptionStatus.subscription?.planName);
      console.log('Has Active Subscription:', subscriptionStatus.subscription?.hasActiveSubscription);
      console.log('User Type:', subscriptionStatus.subscription?.userType);
    }
  }, [subscriptionStatus]);
useFocusEffect(
  React.useCallback(() => {
    let backPressedOnce = false;

    const backAction = () => {
      if (backPressedOnce) {
        BackHandler.exitApp();
      } else {
        backPressedOnce = true;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        // Reset backPressedOnce after 2 seconds
        setTimeout(() => {
          backPressedOnce = false;
        }, 2000);
      }
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [])
);
// useEffect(() => {
//     const subscription = AppState.addEventListener('change', (nextAppState) => {
//       if (nextAppState === 'active') {

//         navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
//       }
//     });

//     return () => subscription.remove();
//   }, []);

  const fetchAllJobTypes = useCallback(async () => {
      try {
        setLoading({
          recommended: true,
          highestPaying: true,
          suggested: true,
          related: true,
          popular: true,
          all: true
        });

        // First get user data from AsyncStorage
        const storedUserData = await AsyncStorage.getItem('userData');
        console.log('Stored User Data:', JSON.parse(storedUserData));

        if (!storedUserData) {
          console.error('No user data found in AsyncStorage');
          // Redirect to login if no user data
          navigation.replace('Login');
          return;
        }

        const userData = JSON.parse(storedUserData);
        const userId = userData._id;
        console.log('User ID:', userId);
        console.log(userData,"................................")

        if (!userId) {
          console.error('No user ID found');
          return;
        }

        // Now fetch all jobs with subscription validation
        try {
          // Validate job search action
          const searchValidation = await SubscriptionValidationService.validateActionForUserType('search_job', 'employee', userId);
          
          if (!searchValidation.allowed) {
            console.log('Job search blocked:', searchValidation.reason);
            // Show limited jobs for free users
            const limitedResponse = await axios.get(`${BASE_URL}/api/user/getAllJobs?limit=5`);
            if (limitedResponse.data?.success && Array.isArray(limitedResponse.data.data)) {
              const transformedJobs = limitedResponse.data.data.map(transformJobData);
              setAllJobs(transformedJobs);
              console.log('Limited jobs loaded:', transformedJobs.length);
            }
          } else {
            // Full job search for subscribed users
            const response = await axios.get(`${BASE_URL}/api/user/getAllJobs`);
            console.log("All jobs response:", response.data);

            if (response.data?.success && Array.isArray(response.data.data)) {
              const transformedJobs = response.data.data.map(transformJobData);
              setAllJobs(transformedJobs);
              try {
                // Record a successful job search usage for daily quota
                const storedUserData = await AsyncStorage.getItem('userData');
                const uid = storedUserData ? JSON.parse(storedUserData)._id : null;
                if (uid) {
                  await SubscriptionValidationService.recordUsage('search_job', uid);
                }
              } catch (recErr) {
                console.log('Failed to record search usage:', recErr?.message || recErr);
              }
              console.log('Transformed jobs:', transformedJobs.length);
            }
          }
        } catch (error) {
          console.error('Error fetching all jobs:', error);
        }

        // Fetch highest paying jobs
        try {
          const highPayingResponse = await axios.get(`${BASE_URL}/api/user/highest-paying-job/${userId}`);
          if (highPayingResponse.data?.success && Array.isArray(highPayingResponse.data.data)) {
            const transformedJobs = highPayingResponse.data.data.map(transformJobData);
            setHighestPayingJobs(transformedJobs);
          }
        } catch (error) {
          console.error('Error fetching highest paying jobs:', error);
        }

        // Fetch suggested jobs
        try {
          const suggestedResponse = await axios.get(`${BASE_URL}/api/user/suggested-jobs/${userId}`);
          if (suggestedResponse.data?.success && Array.isArray(suggestedResponse.data.data)) {
            const transformedJobs = suggestedResponse.data.data.map(transformJobData);
            setSuggestedJobs(transformedJobs);
          }
        } catch (error) {
          console.error('Error fetching suggested jobs:', error);
        }

      } catch (error) {
        console.error('Main error in fetchAllJobTypes:', error);
        setError(error.message || 'Failed to fetch jobs');
      } finally {
        setLoading({
          recommended: false,
          highestPaying: false,
          suggested: false,
          related: false,
          popular: false,
          all: false
        });
        setRefreshing(false);
      }
  }, [BASE_URL]);

  // Update the initial useEffect to fetch all job types
  useEffect(() => {
    fetchAllJobTypes();
  }, [fetchAllJobTypes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    fetchAllJobTypes();
  }, [fetchAllJobTypes]);

  // Update the transformJobData function to handle missing data better
  const transformJobData = (job) => {
    if (!job) return null;

    return {
      id: job._id || Math.random().toString(),
      title: job.jobtitle || job.jobProfile || 'No Title',
      company: {
        name: job.companyName || 'Unknown Company',
        logo: job.companyName?.charAt(0) || '🏢',
        website: job.companywebsite || '',
        mobile: job.companymobile || '',
        industry: job.companyindustry || '',
        type: job.companytype || '',
        department: job.department || '',
        address: job.companyaddress || job.address || '',
      },
      location: job.location || job.locationDetails || 'Location not specified',
      salary: {
        min: job.minSalary || 0,
        max: job.maxSalary || 0,
        type: job.salarytype || 'Monthly',
        displayValue: `₹${job.minSalary || 0} - ₹${job.maxSalary || 0}`,
        incentive: job.averageIncentive || ''
      },
      experience: {
        required: job.experiencerequired || 0,
        details: job.experience || '',
        displayValue: `${job.experiencerequired || 0} years`
      },
      type: {
        work: job.typeofwork || 'Full Time',
        job: job.typeofjob || '',
        education: job.typeofeducation || job.education || '',
        qualification: job.typeofqualification || ''
      },
      skills: Array.isArray(job.skill) ? job.skill : [],
      description: job.description || '',
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      benefits: job.benefits || '',
      logo: job.companyName?.charAt(0) || '🏢',
      bgColor: getRandomColor(),
      matchRate: '90%'
    };
  };

  // Helper function to get a random color for job cards
  const getRandomColor = () => {
    const colors = [
      '#4F46E5', // Indigo
      '#059669', // Green
      '#DC2626', // Red
      '#2563EB', // Blue
      '#7C3AED', // Purple
      '#DB2777', // Pink
      '#EA580C', // Orange
      '#0891B2', // Cyan
      '#4338CA', // Deep Indigo
      '#B91C1C'  // Deep Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Loading component
  const LoadingSection = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );

    const [offers, setOffers] = useState([]);

    const fetchOffers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/templates?category=Offer`);
      setOffers(res.data.data.filter((offer) => offer.type === "employee"));
    } catch (err) {
      console.error("Error fetching offers", err);
    }
  };

   useEffect(() => {
    fetchOffers();
  }, []);
  

  // Updated Error component
  const ErrorSection = ({ message }) => {
    const handleRetry = async () => {
      setError(null);
      setLoading({
        recommended: true,
        highestPaying: true,
        suggested: true,
        related: true,
        popular: true,
        all: true
      });

      try {
        const userId = await AsyncStorage.getItem('userData');
        if (!userId) {
          throw new Error('User ID not found');
        }

        // Fetch all jobs again
        const response = await axios.get(`${BASE_URL}/api/user/getAllJobs`);
        console.log("Response All jobs : ", response.data)
        if (response.data?.success && Array.isArray(response.data.data)) {
          const transformedJobs = response.data.data.map(transformJobData);
          // setPopularJobs(transformedJobs.slice(0, 4));
          setAllJobs(transformedJobs);
        }

        // Fetch highest paying jobs
        const highPayingResponse = await axios.get(`${BASE_URL}/api/user/highest-paying-job/${userId}`);
        if (highPayingResponse.data?.success && Array.isArray(highPayingResponse.data.data)) {
          const transformedJobs = highPayingResponse.data.data.map(transformJobData);
          setHighestPayingJobs(transformedJobs);
        }

        // Fetch related jobs
        const relatedResponse = await axios.get(`${BASE_URL}/api/user/jobby-role/${userId}`);
        if (relatedResponse.data?.success && Array.isArray(relatedResponse.data.data)) {
          const transformedJobs = relatedResponse.data.data.map(transformJobData);
          setRelatedJobs(transformedJobs);
        }
      } catch (error) {
        console.error('Error retrying fetch:', error);
        setError('Failed to fetch jobs. Please try again.');
      } finally {
        setLoading({
          recommended: false,
          highestPaying: false,
          suggested: false,
          related: false,
          popular: false,
          all: false
        });
      }
    };

    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Update the handleJobPress function
  const handleJobPress = (job) => {
    console.log('Job pressed:', job);
    navigation.navigate('JobDetailScreen', {
      job: {
        id: job._id || job.id,
        title: job.title || job.jobtitle,
        company: {
          name: job.company?.name || job.companyName || 'Company',
          logo: job.company?.logo || job.logo || '🏢',
          website: job.company?.website || '',
          industry: job.company?.industry || job.industry || '',
          type: job.company?.type || job.companytype || '',
        },
        location: job.location || 'Location not specified',
        salary: {
          min: job.salary?.min || job.minSalary || 0,
          max: job.salary?.max || job.maxSalary || 0,
          displayValue: job.salary?.displayValue || `₹${job.minSalary || 0} - ₹${job.maxSalary || 0}`,
        },
        type: {
          work: job.type?.work || job.typeofwork || 'Full Time',
          job: job.type?.job || job.typeofjob || '',
        },
        experience: {
          required: job.experience?.required || job.experiencerequired || '0',
          displayValue: job.experience?.displayValue || `${job.experiencerequired || 0} years`,
        },
        skills: job.skills || [],
        description: job.description || 'No description available',
        requirements: job.requirements || [
          `${job.experience?.required || '0'}+ years of experience required`,
          'Proficiency in required skills',
          'Good communication skills',
          'Ability to work in a team'
        ],
        responsibilities: job.responsibilities || 'Responsibilities will be discussed during interview',
        benefits: job.benefits || [
          'Competitive salary package',
          'Health insurance',
          'Professional development opportunities',
          'Work-life balance'
        ],
        postedDate: job.postedDate || new Date().toISOString(),
        deadline: job.deadline || '',
        openings: job.openings || 1,
        department: job.department || '',
        education: job.education || job.typeofqualification || '',
      }
    });
  };

  // Fetch popular jobs when component mounts
  // useEffect(() => {
  //   fetchPopularJobs();
  // }, []);
  useFocusEffect(
    useCallback(()=>{
      fetchPopularJobs()
    },[])
  )

 const fetchPopularJobs = async () => {
  try {
    setLoading((prev) => ({ ...prev, popular: true }));
    console.log('Fetching popular jobs...');

    const response = await axios.get(`${BASE_URL}/api/user/popular`, { timeout: 8000 });
    const jobData = response?.data?.data;

    if (Array.isArray(jobData)) {
      const transformedJobs = jobData.map(job => ({
        id: job._id,
        title: job.jobtitle || 'No Title',
        company: job.companyName || 'Unknown Company',
        location: job.location || 'Location not specified',
        salary: `₹${job.minSalary || 0} - ₹${job.maxSalary || 0}`,
        logo: job.companyName?.charAt(0) || '🏢',
        bgColor: getRandomColor(),
        type: job.typeofwork || 'Full Time'
      }));
      setPopularJobs(transformedJobs.slice(0, 4));
    } else {
      console.warn('No popular jobs found');
      setPopularJobs([]);
    }
  } catch (error) {
    console.error('Error fetching popular jobs:', error?.message || error);
    // Make section optional on network error
    setPopularJobs([]);
  } finally {
    setLoading((prev) => ({ ...prev, popular: false }));
  }
};

const [userData, setUserData] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedProfileData = await AsyncStorage.getItem('profileData');
      if (!storedUserData) {
        throw new Error('No user data found');
      }

      const parsedUserData = JSON.parse(storedUserData);
      const parsedUserData1 = JSON.parse(storedProfileData);
      console.log('Stored user data:', parsedUserData);
      console.log('Stored profile data:', parsedUserData1);

      // Set the user data directly from AsyncStorage
      setUserData(parsedUserData);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);


  // Update the renderPopularJob function
  const renderPopularJob = (job, index) => {
    const colors = getSectionColors('popular');
    const gradientColors = [
      '#4F46E5', // Indigo
      '#6366F1', // Lighter Indigo
      '#818CF8'  // Even Lighter Indigo
    ];

    return (
      <TouchableOpacity
        key={job._id || job.id}
        style={[
          styles.popularJobCard,
          { backgroundColor: gradientColors[index % gradientColors.length] }
        ]}
        onPress={() => handleJobPress(job)}
      >
        <View style={styles.popularJobHeader}>
          <View style={[styles.companyLogo, { backgroundColor: job.bgColor }]}>
            <Text style={styles.companyLogoText}>{job.company?.logo || '🏢'}</Text>
          </View>
          <View style={styles.jobTypeContainer}>
            <Text style={styles.jobTypeText}>{job.type?.work || job.typeofwork || 'Full Time'}</Text>
          </View>
        </View>
        <Text style={styles.popularJobTitle} numberOfLines={1}>{job.title || job.jobtitle}</Text>
        <Text style={styles.popularJobCompany} numberOfLines={1}>{job.company?.name || job.companyName}</Text>
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={16} color="#6B7280" />
          <Text style={styles.locationText}>{job.location}</Text>
        </View>
        <View style={styles.salaryContainer}>
          {/* <Icon name="attach-money" size={16} color="#6B7280" /> */}
          <Text style={styles.salaryText}>
            {job.salary?.displayValue || `₹${job.minSalary || 0} - ₹${job.maxSalary || 0}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Update the renderHighestPayingJob function
  const renderHighestPayingJob = (job, index) => {
    const gradientColors = [
      '#059669', // Green
      '#10B981', // Lighter Green
      '#34D399'  // Even Lighter Green
    ];

    return (
      <TouchableOpacity
        key={job._id || job.id}
        style={[
          styles.highPayingCard,
          { backgroundColor: gradientColors[index % gradientColors.length] }
        ]}
        onPress={() => handleJobPress(job)}
      >
        <View style={styles.salaryBadge}>
          {/* <Icon name="attach-money" size={16} color="#fff" /> */}
          <Text style={styles.salaryText}>
            {job.salary?.displayValue || `₹${job.minSalary || 0} - ₹${job.maxSalary || 0}`}
          </Text>
        </View>
        <Text style={styles.highPayingTitle} numberOfLines={2}>{job.title || job.jobtitle}</Text>
        <Text style={styles.highPayingCompany} numberOfLines={1}>{job.company?.name || job.companyName}</Text>
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={16} color="#fff" />
          <Text style={styles.locationText}>{job.location}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Update the renderSuggestedJob function
  const renderSuggestedJob = (job, index) => {
    const gradientColors = [
      '#DC2626', // Red
      '#EF4444', // Lighter Red
      '#F87171'  // Even Lighter Red
    ];

    return (
      <TouchableOpacity
        key={job.id}
        style={[
          styles.suggestedJobCard,
          { backgroundColor: gradientColors[index % gradientColors.length] }
        ]}
        onPress={() => handleJobPress(job)}
      >
        <View style={styles.jobCardHeader}>
          <View style={styles.companyLogo}>
            <Text style={styles.logoText}>{job.logo}</Text>
          </View>
          <View style={styles.skillsContainer}>
            {job.skills.slice(0, 2).map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.companyName}>{job.company.name}</Text>
        <View style={styles.jobDetails}>
          <View style={styles.jobDetailItem}>
            <Icon name="location-on" size={16} color="#fff" />
            <Text style={styles.jobDetailText}>{job.location}</Text>
          </View>
          <View style={styles.jobDetailItem}>
            {/* <Icon name="attach-money" size={16} color="#fff" /> */}
            <Text style={styles.jobDetailText}>{job.salary.displayValue}</Text>
          </View>
        </View>
        {job.experience.required > 0 && (
          <View style={styles.experienceBadge}>
            <Icon name="work" size={16} color="#fff" />
            <Text style={styles.experienceText}>{job.experience.displayValue}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Recommended Jobs render function
  const renderRecommendedJob = (job) => (
    <TouchableOpacity
      key={job.id}
      style={[styles.recommendedJobCard, { backgroundColor: job.bgColor }]}
      onPress={() => handleJobPress(job)}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.companyLogo}>
          <Text style={styles.logoText}>{job.logo}</Text>
        </View>
        <TouchableOpacity>
          <Icon name="favorite-border" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.jobTitle}>{job.title}</Text>
      <Text style={styles.jobCompany}>{job.company}</Text>
      <View style={styles.jobDetails}>
        <View style={styles.detailPill}>
          <Icon name="location-on" size={16} color="#fff" />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>
        <View style={styles.detailPill}>
          {/* <Icon name="attach-money" size={16} color="#fff" /> */}
          <Text style={styles.detailText}>{job.salary}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Update your toggle menu navigation
  const handleSettingsPress = () => {
    console.log('Navigating to Settings'); // For debugging
    setIsToggleOpen(false);
    navigation.navigate('Settings');
  };
  const sortedJobs = allJobs.sort((a, b) => b.salary.max - a.salary.max)

  const requiredWorkModes = ["Remote", "Hybrid", "Fulltime"];

  function filterJobsByWorkMode(jobsArray, requiredWorkModes) {
    return jobsArray.filter(job => job?.type.work === "Remote")
  }
  // requiredWorkModes.includes(job?.type.work ==="Remote") // Checks if job's work mode is in required list

  const filteredJobsss = filterJobsByWorkMode(allJobs, requiredWorkModes);
  // Update the renderGridJob function
  const renderGridJob = (job, index) => {
    const gradientColors = [
      '#0EA5E9', // Blue
      '#3B82F6', // Lighter Blue
      '#60A5FA'  // Even Lighter Blue
    ];


    // // Add navigation handlers for See All buttons
    // const handleSeeAllHighestPaying = () => {
    //   navigation.navigate('AllJobs', {
    //     jobs: sortedJobs, // Pass the full array
    //     title: 'Highest Paying Jobs',
    //     type: 'highest-paying'
    //   });
    // };

    // const handleSeeAllSuggested = () => {
    //   navigation.navigate('AllJobs', {
    //     jobs: suggestedJobs, // Pass the full array
    //     title: 'Suggested Jobs',
    //     type: 'suggested'
    //   });
    // };

    const handleSeeAllRelated = () => {
      navigation.navigate('AllJobsScreen', {
        jobs: relatedJobs,
        title: 'Related Jobs',
        type: 'related'
      });
    };

    const handleSeeAllJobs = () => {
      navigation.navigate('AllJobsScreen', {
        jobs: allJobs,
        title: 'All Jobs',
        type: 'all'
      });
    };


    // console.log("allJobsallJobsallJobsallJobsallJobs" , allJobs)

    // setLoading(false);

    //   const requiredSkills = ["DSA", "React", "ML", "JavaScript"];

    //   function filterJobsBySkills(jobsArray, requiredSkills) {
    //     return jobsArray.filter(job =>
    //         requiredSkills?.every(skill => job?.skills?.includes(skill))
    //     );
    // }

    // const filteredJobs = filterJobsBySkills(allJobs, requiredSkills);
    // console.log(filteredJobs , "aascascfilteredJobs");



    // function filterAndSortJobsBySalary(jobsArray, requiredSkills) {
    //   return jobsArray
    //       .filter(job => requiredSkills.every(skill => job?.skills?.includes(skill)))
    //       .sort((a, b) => b.maxSalary - a.maxSalary); // Sort by maxSalary in descending order
    // }


    // const sortedJobsss = filterAndSortJobsBySalary(allJobs, requiredSkills);
    // console.log(sortedJobsss);




  }


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  const greeting = getGreeting();
  
  return (

    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
          <FastImage
                  source={employeelogo}
                  style={styles.logoimg}
                  resizeMode={FastImage.resizeMode.contain}
                />
        {/* Top Row with Toggle, Greeting, and Profile */}
        <View style={styles.headerTop}>
        <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsToggleOpen(!isToggleOpen)}
            >
              <Icon name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          <View style={styles.leftSection}>
        
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>Welcome back! 👋 , {userData?.fullName}</Text>
              {/* Subscription Status */}
              {subscriptionStatus ? (
                <View style={styles.subscriptionStatus}>
                  <Text style={styles.subscriptionText}>
                    {subscriptionStatus.subscription?.planName || 
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
                <View style={styles.subscriptionStatus}>
                  <Text style={styles.subscriptionText}>Free Plan</Text>
                  <Text style={styles.usageText}>Loading...</Text>
                </View>
              )}
            </View>

          </View>
          <TouchableOpacity
            style={styles.profileToggle}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileAvatar}>👨‍💻</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#9CA3AF" />
            <TouchableOpacity onPress={() => navigation.navigate('AllaccessJobPage')} style={{ flex: 1 }}>
              <TextInput
                placeholder="Find your dream job"
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                editable={false} // Prevents direct text input
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
      </View>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Horizontal Filters */}
        {/* <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filterOptions.map((filter) => (
            <FilterChip
              key={filter.label}
              icon={filter.icon}
              label={filter.label}
              selected={selectedFilter === filter.label}
              onPress={() => setSelectedFilter(filter.label)}
            />
          ))}
      </ScrollView> */}

        {/* Popular Jobs Section */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Jobs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('JobSearch')}>
              <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    </View>
          
    {loading ? (
  <ActivityIndicator size="large" color="#4B6BFB" style={styles.loadingContainer} />
) : error ? (
  <View style={styles.errorContainer}>
    <Icon name="error-outline" size={48} color="#EF4444" />
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={fetchPopularJobs}>
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableOpacity>
  </View>
) : (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularJobsContainer}>
    {allJobs?.slice(0, 3).map(renderPopularJob)}
  </ScrollView>
)}
        </View>  */}




        {/* Highest Paying Jobs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Highest Paying Jobs</Text>
          </View>
          {/* <TouchableOpacity onPress={() => navigation.navigate('AllJobsScreen')}>
              <Text style={{ color: 'blue', fontSize: 14,  bottom:30,left:340,}}>See All </Text>
            </TouchableOpacity> */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highPayingContainer}
          >
            {loading.highestPaying ? (
              <LoadingSection />
            ) : error ? (
              <ErrorSection message={error} />
            ) : (
              sortedJobs.slice(0, 6).map(renderHighestPayingJob)
            )}
          </ScrollView>
        </View>


        {/* All Jobs Grid Section */}
        <View style={styles.allJobsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Jobs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllJobsScreen')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.allJobsGrid}>
            {allJobs.slice(0, 6).map((job, index) => (
              <TouchableOpacity
                key={job.id}
                style={styles.allJobCard}
                onPress={() => navigation.navigate('JobDetailScreen', { job })}
              >
                <View style={styles.allJobHeader}>
                  <View style={[styles.allJobLogo, {
                    backgroundColor: index % 4 === 0 ? '#4F46E5' :
                      index % 4 === 1 ? '#0EA5E9' :
                        index % 4 === 2 ? '#059669' :
                          '#DC2626'
                  }]}>
                    <Text style={styles.allJobLogoText}>
                      {job.company?.logo || job.company?.name?.charAt(0) || '🏢'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.bookmarkButton}>
                    <Icon name="bookmark-border" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.allJobContent}>
                  <Text style={styles.allJobTitle} numberOfLines={1}>
                    {job.title || job.jobtitle}
                  </Text>
                  <Text style={styles.allJobCompany} numberOfLines={1}>
                    {job.company?.name || job.companyName}
                  </Text>

                  <View style={styles.allJobTags}>
                    <View style={styles.allJobTag}>
                      <Icon name="business" size={14} color="#4B5563" />
                      <Text style={styles.allJobTagText}>
                        {job.type?.work || 'Full Time'}
                      </Text>
                    </View>
                    <View style={styles.allJobTag}>
                      <Icon name="location-on" size={14} color="#4B5563" />
                      <Text style={styles.allJobTagText}>
                        {job.location || 'Remote'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.allJobSalary}>
                    {/* <Icon name="attach-money" size={16} color="#059669" /> */}
                    <Text style={styles.allJobSalaryText}>
                      {job.salary?.displayValue || `₹${job.minSalary || 0} - ₹${job.maxSalary || 0}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>



  <View style={styles.allJobsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  {/* <Icon name="local-offer" size={20} color="#059669" /> */}
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




        {/* Suggested Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested Jobs</Text>
            {/* <TouchableOpacity onPress={handleSeeAllSuggested}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>  */}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jobsScrollContainer}
          >
            {loading.suggested ? (
              <LoadingSection />
            ) : error ? (
              <ErrorSection message={error} />
            ) : (
              allJobs.slice(0, 8).map((job, index) => (
                <TouchableOpacity
                  key={job.id}
                  style={[
                    styles.jobCard,
                    { backgroundColor: getSectionColors('suggested').card }
                  ]}
                  onPress={() => navigation.navigate('JobDetailScreen', { job })}
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={styles.jobLogo}>{job.logo}</Text>
                    <View style={styles.skillsContainer}>
                      {job.skills.slice(0, 2).map((skill, index) => (
                        <View key={index} style={styles.skillBadge}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.companyName}>{job.company.name}</Text>
                  <View style={styles.jobDetails}>
                    <View style={styles.jobDetailItem}>
                      <Icon name="location-on" size={16} color="#fff" />
                      <Text style={styles.jobDetailText}>{job.location}</Text>
                    </View>
                    <View style={styles.jobDetailItem}>
                      {/* <Icon name="attach-money" size={16} color="#fff" /> */}
                      <Text style={styles.jobDetailText}>{job.salary.displayValue}</Text>
                    </View>
                  </View>
                  {job.experience.required > 0 && (
                    <View style={styles.experienceBadge}>
                      <Icon name="work" size={16} color="#fff" />
                      <Text style={styles.experienceText}>{job.experience.displayValue}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Then, after some spacing, add the Matching Profile section */}
        <View style={[styles.allJobsSection, { marginTop: 24 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Matching Your Profile</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllJobsScreen', { filter: 'matching' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.allJobsGrid}>
            {allJobs.slice(0, 4).map((job, index) => ( 
              <TouchableOpacity
                key={job.id}
                style={styles.allJobCard}
                onPress={() => navigation.navigate('JobDetailScreen', { job })}
              >
                <View style={styles.allJobHeader}>
                  <View style={[styles.allJobLogo, { backgroundColor: job.bgColor || '#4F46E5' }]}>
                    <Text style={styles.allJobLogoText}>
                      {job.company?.logo || '🏢'}
                    </Text>
                  </View>
                  <View style={styles.matchRateContainer}>
                    <Text style={styles.matchRateText}>{job.matchRate || '90%'}</Text>
                  </View>
                </View>

                <View style={styles.allJobContent}>
                  <Text style={styles.allJobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.allJobCompany} numberOfLines={1}>
                    {job.company?.name}
                  </Text>

                  <View style={styles.allJobTags}>
                    <View style={styles.allJobTag}>
                      <Icon name="school" size={14} color="#4B5563" />
                      <Text style={styles.allJobTagText}>
                        {job.type?.education || 'Not Specified'}
                      </Text>
                    </View>
                    <View style={styles.allJobTag}>
                      <Icon name="work" size={14} color="#4B5563" />
                      <Text style={styles.allJobTagText}>
                        {job.experience?.displayValue || '0 years'}
                      </Text>
                    </View>
                  </View>

                  {job.salary?.incentive && (
                    <View style={styles.incentiveContainer}>
                      <Icon name="star" size={14} color="#F59E0B" />
                      <Text style={styles.incentiveText}>
                        Incentive: ₹{job.salary.incentive}
                      </Text>
                    </View>
                  )}

                  {job.type?.qualification && (
                    <View style={styles.qualificationContainer}>
                      <Icon name="school" size={14} color="#4F46E5" />
                      <Text style={styles.qualificationText}>
                        {job.type.qualification}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actively Hiring</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllJobsScreen', { filter: 'activelyHiring' })}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jobsScrollContainer}
          >
            {allJobs.reverse().slice(0, 4).map((job, index) => {
              const gradientColors = [
                '#F59E0B', // Amber
                '#FBBF24', // Lighter Amber
                '#FCD34D'  // Even Lighter Amber
              ];

              return (
                <TouchableOpacity
                  key={job.id}
                  style={[
                    styles.jobCard,
                    { backgroundColor: gradientColors[index % gradientColors.length] }
                  ]}
                  onPress={() => navigation.navigate('JobDetailScreen', { job })}
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={styles.jobLogo}>{job.company.logo}</Text>
                    {<View style={styles.matchBadge}>
                      <Text style={styles.matchText}>{job.matchRate}</Text>
                    </View>}
                  </View>
                  <Text style={styles.jobTitle}>{job.jobtitle}</Text>
                  <Text style={styles.companyName}>{job.company.name}</Text>
                  <View style={styles.jobDetails}>
                    <View style={styles.jobDetailItem}>
                      <Icon name="location-on" size={16} color="#fff" />
                      <Text style={styles.jobDetailText}>{job.location}</Text>
                    </View>
                    <View style={styles.jobDetailItem}>
                      {/* <Icon name="attach-money" size={16} color="#fff" /> */}
                      <Text style={styles.jobDetailText}>{job.minSalary}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>




        {/* Related to Your Role - Enhanced Style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Related to Your Role</Text>
            {/* <TouchableOpacity onPress={handleSeeAllRelated}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity> */}
          </View>
          {loading.related ? (
            <LoadingSection />
          ) : error ? (
            <ErrorSection message={error} />
          ) : (
            <View style={styles.relatedJobsContainer}>
              {filteredJobsss.slice(0, 3).map(job => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.relatedJobCard}
                  onPress={() => navigation.navigate('JobDetailScreen', { job })}
                >
                  <View style={[styles.relatedCompanyLogo, { backgroundColor: job.bgColor }]}>
                    <Text style={styles.relatedLogoText}>{job.company.logo}</Text>
                  </View>
                  <View style={styles.relatedJobContent}>
                    <View style={styles.relatedJobHeader}>
                      <Text style={styles.relatedJobTitle}>{job.title}</Text>
                      <TouchableOpacity style={styles.saveButton}>
                        <Icon name="bookmark-border" size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.relatedCompanyName}>{job.company.name}</Text>
                    <View style={styles.relatedJobDetails}>
                      <View style={styles.relatedJobBadge}>
                        <Icon name="business" size={16} color="#4F46E5" />
                        <Text style={styles.relatedBadgeText}>{job.type.work}</Text>
                      </View>
                      <View style={styles.relatedJobBadge}>
                        <Icon name="location-on" size={16} color="#4F46E5" />
                        <Text style={styles.relatedBadgeText}>{job.location || 'Remote'}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>


        {/* Recommended Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Jobs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jobsScrollContainer}
          >
            {loading.recommended ? (
              <LoadingSection />
            ) : error ? (
              <ErrorSection message={error} />
            ) : (
              allJobs.reverse().slice(0, 3).reverse().map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={[styles.jobCard, { backgroundColor: job.bgColor }]}
                  onPress={() => navigation.navigate('JobDetailScreen', { job })}
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={styles.jobLogo}>{job.logo}</Text>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>{job.matchRate}</Text>
                    </View>
                  </View>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.companyName}>{job.company.name}</Text>
                  <View style={styles.jobDetails}>
                    <View style={styles.jobDetailItem}>
                      <Icon name="location-on" size={16} color="#fff" />
                      <Text style={styles.jobDetailText}>{job.company.address}</Text>
                    </View>
                    <View style={styles.jobDetailItem}>
                      {/* <Icon name="attach-money" size={16} color="#fff" /> */}
                      <Text style={styles.jobDetailText}>{job.salary.min}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>


        {/* Companies with Most Openings - Updated with company names */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Companies with Most Openings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllCompanies')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
    </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.companiesContainer}
          >
            {allJobs.map(company => (
              <TouchableOpacity 
                key={company.id} 
                style={styles.companyCard}
                onPress={() => navigation.navigate('CompanyDetails', { company })}
              >
                <View style={styles.companyHeader}>
                  <View style={[styles.companyLogo, { backgroundColor: company.bgColor || '#F3F4F6' }]}>
                    <Text style={styles.companyLogoText}>{company.logo}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Icon name="star" size={16} color="#FCD34D" />
                    <Text style={styles.ratingText}>{company.rating}</Text>
                  </View>
                </View>
                <Text style={styles.companyName}>{company.name}</Text>
                <Text style={styles.companyIndustry}>{company.industry}</Text>
                <View style={styles.openingsInfo}>
                  <Icon name="business" size={16} color="#6B7280" />
                  <Text style={styles.openingsText}>{company.openPositions} positions</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> */}



        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Matching Your Profile</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jobsScrollContainer}
          >
            {filteredJobsss.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={[styles.jobCard, { backgroundColor: job.bgColor }]}
                onPress={() => navigation.navigate('JobDetailScreen', { job })}
              >
                <View style={styles.jobCardHeader}>
                  <Text style={styles.jobLogo}>{job.logo}</Text>
                  <View style={styles.skillsContainer}>
                    {job.skills.slice(0, 2).map((skill, index) => (
                      <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
            </View>
                    ))}
            </View>
          </View>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.companyName}>{job.company}</Text>
                <View style={styles.jobDetails}>
                  <View style={styles.jobDetailItem}>
                    <Icon name="location-on" size={16} color="#fff" />
                    <Text style={styles.jobDetailText}>{job.location}</Text>
                  </View>
                  <View style={styles.jobDetailItem}>
                    <Icon name="attach-money" size={16} color="#fff" />
                    <Text style={styles.jobDetailText}>{job.salary}</Text>
                  </View>
                </View>
          </TouchableOpacity>
            ))}
          </ScrollView>
        </View>  */}

        {/* Work Mode Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Work Mode</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllJobs', { filter: 'workMode' })}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {loading.workMode ? (
            <LoadingSection />
          ) : error ? (
            <ErrorSection message={error} />
          ) : (
            <View style={styles.relatedJobsContainer}>
              {allJobs.slice(0, 3).map((job, index) => {
                const gradientColors = [
                  '#8B5CF6', // Purple
                  '#A78BFA', // Lighter Purple
                  '#C4B5FD'  // Even Lighter Purple
                ];

                return (
                  <TouchableOpacity
                    key={job.id}
                    style={[
                      styles.relatedJobCard,
                      { backgroundColor: gradientColors[index % gradientColors.length] }
                    ]}
                    onPress={() => navigation.navigate('JobDetailScreen', { job })}
                  >
                    <View style={[styles.relatedCompanyLogo, { backgroundColor: job.bgColor }]}>
                      <Text style={styles.relatedLogoText}>{job.company?.logo || '🏢'}</Text>
                    </View>
                    <View style={styles.relatedJobContent}>
                      <View style={styles.relatedJobHeader}>
                        <Text style={styles.relatedJobTitle}>{job.title}</Text>
                        <TouchableOpacity style={styles.saveButton}>
                          <Icon name="bookmark-border" size={20} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.relatedCompanyName}>{job.company?.name}</Text>
                      <View style={styles.relatedJobDetails}>
                        <View style={styles.relatedJobBadge}>
                          <Icon name="business" size={16} color="#4F46E5" />
                          <Text style={styles.relatedBadgeText}>{job.type?.work || 'Full Time'}</Text>
                        </View>

                        <View style={styles.relatedJobBadge}>
                          <Icon name="laptop" size={16} color="#4F46E5" />
                          <Text style={styles.relatedBadgeText}>{job.workMode || 'Hybrid'}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* All Jobs Grid Section */}
        <View style={styles.allJobsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Jobs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllJobs')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.allJobsGrid}>
            {allJobs.reverse().slice(0, 16).map((job, index) => (
              <TouchableOpacity
                key={job.id}
                style={styles.allJobCard}
                onPress={() => navigation.navigate('JobDetailScreen', { job })}
              >
                <View style={styles.allJobHeader}>
                  <View style={[styles.allJobLogo, {
                    backgroundColor: index % 4 === 0 ? '#4F46E5' :
                      index % 4 === 1 ? '#0EA5E9' :
                        index % 4 === 2 ? '#059669' :
                          '#DC2626'
                  }]}>
                    <Text style={styles.allJobLogoText}>
                      {job.company?.logo || job.company?.name?.charAt(0) || '🏢'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.bookmarkButton}>
                    <Icon name="bookmark-border" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.allJobContent}>
                  <Text style={styles.allJobTitle} numberOfLines={1}>
                    {job.title || job.jobtitle}
                  </Text>
                  <Text style={styles.allJobCompany} numberOfLines={1}>
                    {job.company?.name || job.companyName}
                  </Text>

                  <View style={styles.allJobTags}>
                    <View style={styles.allJobTag}>
                      <Icon name="business" size={14} color="#4B5563" />
                      <Text style={styles.allJobTagText}>
                        {job.type?.work || 'Full Time'}
                      </Text>
                    </View>
                    <View style={styles.allJobTag}>
                      <Icon name="location-on" size={14} color="#4B5563" />
                      <Text style={styles.allJobTagText}>
                        {job.location || 'Remote'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.allJobSalary}>
                    {/* <Icon name="attach-money" size={16} color="#059669" /> */}
                    {/* <Text style={styles.allJobSalaryText}>
                      {job.salary?.displayValue || `₹${job.minSalary || 0} - ₹${job.maxSalary || 0}`}
                    </Text> */}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>


      </ScrollView>

      {showMenu && (
        <MenuOverlay navigation={navigation} />
      )}

      {/* Toggle Menu */}
      <View style={[
        styles.toggleMenu,
        isToggleOpen ? styles.toggleMenuOpen : null
      ]}>
        <View style={styles.toggleHeader}>
          <Text style={styles.toggleTitle}>Menu</Text>
          <TouchableOpacity
            style={styles.toggleCloseButton}
            onPress={() => setIsToggleOpen(false)}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuItems}>
          {/* Home */}
          <TouchableOpacity
            style={styles.toggleMenuItem}
            onPress={() => {
              setIsToggleOpen(false);
              navigation.navigate('Home');
            }}
          >
            <Icon name="home" size={24} color="#fff" />
            <Text style={styles.toggleMenuText}>Home</Text>
          </TouchableOpacity>

          {/* Referral Program */}
          {/* <TouchableOpacity
            style={styles.toggleMenuItem}
            onPress={() => {
              setIsToggleOpen(false);
              navigation.navigate('ReferralSystem');
            }}
          >
            <Icon name="group-add" size={24} color="#fff" />
            <Text style={styles.toggleMenuText}>Referral Program</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.toggleMenuItem}
            onPress={() => {
              setIsToggleOpen(false);
              navigation.navigate('EmployeeSubscription',{type :"employee"});
            }}
          >
            <Icon name="subscriptions" size={24} color="#fff" />
            <Text style={styles.toggleMenuText}>Subscription Plan</Text>
          </TouchableOpacity>

          {/* Profile Lock */}
          <TouchableOpacity
            style={styles.toggleMenuItem}
            onPress={() => {
              setIsToggleOpen(false);
              navigation.navigate('ProfileLockStatus');
            }}
          >
            <Icon name="lock" size={24} color="#fff" />
            <Text style={styles.toggleMenuText}>Profile Lock</Text>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.toggleMenuItem}
            onPress={handleSettingsPress}
          >
            <Icon name="settings" size={24} color="#fff" />
            <Text style={styles.toggleMenuText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedJob && (
        <View style={styles.jobDetailOverlay}>
          <ScrollView style={styles.jobDetailContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedJob(null)}
            >
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.companyHeader}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>
                  {selectedJob.employer_name?.charAt(0) || 'G'}
                </Text>
              </View>
              <View style={styles.jobTypeContainer}>
                <View style={styles.jobTypeTag}>
                  <Text style={styles.jobTypeText}>
                    {selectedJob.job_employment_type || 'Full Time'}
                  </Text>
                </View>
                <View style={styles.jobTypeTag}>
                  <Text style={styles.jobTypeText}>Remote Work</Text>
                </View>
              </View>
            </View>

            <Text style={styles.jobDetailTitle}>{selectedJob.job_title}</Text>
            <Text style={styles.jobLocation}>{selectedJob.job_country}</Text>

            <View style={styles.tabContainer}>
              <Text style={[styles.tabText, styles.activeTab]}>Description</Text>
              <Text style={styles.tabText}>Company</Text>
              <Text style={styles.tabText}>Applicant</Text>
              <Text style={styles.tabText}>Contact Info</Text>
            </View>

            <View style={styles.requirementsSection}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              {/* Add your requirements list here */}
              {dummyRequirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <FilterOverlay
        visible={showFilter}
        currentFilters={filters}
        onClose={() => setShowFilter(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setShowFilter(false);
          // Here you would typically filter your job listings
          console.log('Applied filters:', newFilters);
        }}
      />
    </SafeAreaView>
  );
};



const MenuOverlay = ({ navigation }) => (
  <View style={styles.menuOverlay}>
    <View style={styles.menuContainer}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuTitle}>Menu</Text>
        <TouchableOpacity
          onPress={() => setShowMenu(false)}
          style={styles.closeButton}
        >
          <Icon name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          setShowMenu(false);
          navigation.navigate('ReferralSystem');
        }}
      >
        <Icon name="group-add" size={24} color="#2563EB" />
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>Referral Program</Text>
          <Text style={styles.menuItemDescription}>
            Refer candidates and earn bonuses
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="#6B7280" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          setShowMenu(false);
          navigation.navigate('ProfileLockStatus');
        }}
      >
        <Icon name="lock" size={24} color="#2563EB" />
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>Profile Lock Status</Text>
          <Text style={styles.menuItemDescription}>
            Check your profile lock period
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="#6B7280" />
      </TouchableOpacity>
    </View>
  </View>
);

const FilterOverlay = ({ visible, onClose, onApply, currentFilters }) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Add filter options inside the component
  const filterOptions = [
    { label: 'All', icon: 'apps' },
    { label: 'Remote', icon: 'laptop' },
    { label: 'Full Time', icon: 'schedule' },
    { label: 'Part Time', icon: 'access-time' },
    { label: 'Contract', icon: 'description' },
    { label: 'Internship', icon: 'school' }
  ];

  const handleApplyFilters = () => {
    // Filter jobs based on search text and selected filter
    const filtered = allJobs.filter(job => {
      // Search by job title or company name
      const searchMatch = searchText.toLowerCase() === '' ||
        job.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(searchText.toLowerCase());

      // Filter by selected option
      const filterMatch = selectedFilter === 'All' ||
        job.type?.work === selectedFilter;

      return searchMatch && filterMatch;
    });

    setAllJobs(filtered);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.filterOverlay}>
        <View style={styles.filterContent}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Jobs</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#26437c" />
            </TouchableOpacity>
          </View>

          {/* Add search input */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs or companies..."
            value={searchText}
            onChangeText={setSearchText}
          />

          {/* Filter options */}
          <View style={styles.filterOptions}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.label}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.label && styles.filterChipActive
                ]}
                onPress={() => setSelectedFilter(filter.label)}
              >
                <Icon name={filter.icon} size={18} color={selectedFilter === filter.label ? '#fff' : '#6B7280'} />
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === filter.label && styles.filterChipTextActive
                ]}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 20,
    gap: 16,
    borderBottomEndRadius: 25,
    borderBottomLeftRadius: 25,
  },
  logoimg:{
        width: '90%',
        height: Dimensions.get('window').height * 0.10,
        marginBottom: -11,
        marginTop: -20,
        // alignSelf: 'start',
        marginLeft:-55
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // gap: 12,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#26437c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingSection: {
    // marginLeft: 4,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 14,
    color: '#26437c',
    marginBottom: 4,
  },
  subscriptionStatus: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
  },
  subscriptionText: {
    fontSize: 12,
    color: '#26437c',
    fontWeight: '600',
  },
  usageText: {
    fontSize: 10,
    color: '#26437c',
    opacity: 0.8,
    marginTop: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
  },
  profileToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#26437c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatar: {
    fontSize: 24,
  },
  searchContainer: {
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26437c',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 8,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#26437c',
    paddingVertical: 8,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#26437c',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 10,
    padding: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
    
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26437c',
  },
  seeAll: {
    color: '#6366F1',
    fontWeight: '500',
  },
  jobGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
  },
  gridJobCard: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    padding: 12,
    margin: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridJobInfo: {
    marginTop: 12,
  },
  gridJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  gridJobCompany: {
    fontSize: 12,
    color: '#fff',
  },
  jobsScrollContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredJobCard: {
    width: 280,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  jobCompany: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  jobDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  detailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  detailText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#26437c',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#26437c',
  },
  closeButton: {
    padding: 8,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleMenu: {
    position: 'absolute',
    left: -280,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#26437c', // Dark background
    transform: [{ translateX: 0 }],
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toggleMenuOpen: {
    transform: [{ translateX: 280 }],
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  toggleCloseButton: {
    padding: 8,
  },
  menuItems: {
    padding: 16,
    gap: 8,
  },
  toggleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleMenuText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  jobDetailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#26437c',
    zIndex: 1000,
  },
  jobDetailContent: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#374151',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobTypeContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  jobTypeTag: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  jobTypeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  jobDetailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  jobLocation: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginBottom: 24,
  },
  tabText: {
    paddingVertical: 12,
    marginRight: 24,
    color: '#9CA3AF',
    fontSize: 16,
  },
  activeTab: {
    color: '#60A5FA',
    borderBottomWidth: 2,
    borderBottomColor: '#60A5FA',
  },
  requirementsSection: {
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bulletPoint: {
    marginRight: 8,
    color: '#9CA3AF',
  },
  requirementText: {
    flex: 1,
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  applyButton: {
    backgroundColor: '#60A5FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  suggestedJobCard: {
    width: 300,
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    marginVertical: 10,
    backgroundColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedJobCard: {
    width: 300,
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    marginVertical: 10,
    backgroundColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  seeAllButton: {
    color: '#6366F1',
    fontWeight: '500',
  },
  jobSection: {
    paddingVertical: 10,
    padding: 6,
    marginBottom: 15, // Space between sections
  },
  popularJobCard: {
    padding: 10,
    gap: 1,
    margin: 7,
    borderBottomLeftRadius: 52,
  },
  matchBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  skillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,

  },
  skillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  jobCard: {
    width: 280,
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    backgroundColor: '#F59E0B',
  },
  jobLogo: {
    fontSize: 24,
  },
  companyName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jobDetailText: {
    color: '#000000',

    fontSize: 12,
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#26437c',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 6,
  },
  filterChipSelected: {
    backgroundColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  companiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  companyCard: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogoText: {
    fontSize: 24,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#92400E',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  openingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openingsText: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 14,
  },
  relatedJobsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  relatedJobCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  relatedCompanyLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  relatedLogoText: {
    fontSize: 24,
    color: '#fff',
  },
  relatedJobContent: {
    flex: 1,
  },
  relatedJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  relatedJobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    padding: 4,
  },
  relatedCompanyName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  relatedJobDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  relatedJobBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  relatedBadgeText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  highPayingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  highPayingCard: {
    width: 280,
    padding: 20,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#059669',
  },
  salaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  salaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  highPayingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  highPayingCompany: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  companyIndustry: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    margin: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginVertical: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  popularJobsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  popularJobCard: {
    width: 280,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  popularJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTypeContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  jobTypeText: {
    color: '#4B6BFB',
    fontSize: 12,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  jobDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobDetailText: {
    fontSize: 12,
    color: '#000000',
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  salaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  salaryPeriod: {
    fontSize: 12,
    color: '#6B7280',
  },
  postedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postedTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  seeAllText: {
    color: '#6366F1',
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  gridJobCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyLogoText: {
    fontSize: 20,
  },
  gridJobInfo: {
    flex: 1,
  },
  gridJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 4,
  },
  gridJobCompany: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  jobDetails: {
    gap: 4,
  },
  detailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26437c',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  workModeSection: {
    marginBottom: 24,
  },
  workModeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workModeLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workModeLogoText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  workModeContent: {
    flex: 1,
  },
  workModeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 4,
  },
  workModeCompany: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  workModeBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  workModeBadgeText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  workModeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
  workModeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workModeDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  workModeSalary: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginTop: 8,
  },
  relatedJobsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  relatedJobCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  relatedCompanyLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  relatedLogoText: {
    fontSize: 24,
    color: '#fff',
  },
  relatedJobContent: {
    flex: 1,
  },
  relatedJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  relatedJobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    padding: 4,
  },
  relatedCompanyName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  relatedJobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedJobBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  relatedBadgeText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 14,
    color: '#fff',
  },
  cardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  allJobsSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  allJobsGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  allJobCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  allJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allJobLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allJobLogoText: {
    fontSize: 18,
    color: '#fff',
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allJobContent: {
    gap: 6,
  },
  allJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#26437c',
  },
  allJobCompany: {
    fontSize: 12,
    color: '#6B7280',
  },
  allJobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  allJobTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  allJobTagText: {
    fontSize: 11,
    color: '#4B5563',
  },
  allJobSalary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  allJobSalaryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  matchRateContainer: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchRateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  allJobDetails: {
    marginTop: 8,
    gap: 6,
  },
  allJobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  allJobDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  incentiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  incentiveText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  qualificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualificationText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  allJobCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  allJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allJobLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allJobContent: {
    gap: 8,
  },
  allJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#26437c',
  },
  allJobCompany: {
    fontSize: 12,
    color: '#6B7280',
  },
  allJobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allJobTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  allJobTagText: {
    fontSize: 11,
    color: '#4B5563',
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
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  
});

export default EmployeeDashboard;

 