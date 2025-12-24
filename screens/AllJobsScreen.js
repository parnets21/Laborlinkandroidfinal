import AsyncStorage from '@react-native-async-storage/async-storage';
import SubscriptionValidationService from '../services/subscriptionValidationService';
import { BASE_URL } from '../constants/config';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';



const AllJobsScreen = ({ navigation }) => {
  const BASE_URL = 'https://laborlink.co.in';
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('none');
  const [showSortModal, setShowSortModal] = useState(false);
  const [remainingSearches, setRemainingSearches] = useState(null);
  const [totalSearchLimit, setTotalSearchLimit] = useState(null);

  const getRandomColor = () => {
    const colors = ['#2596be', '#e6de91', '#EC4899', '#4F46E5', '#059669'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const fetchAllJobs = async (opts = {}) => {
    try {
      setIsLoading(true);
      // Build query params from options
      const params = new URLSearchParams();
      if (opts.query) params.append('q', opts.query);
      if (opts.remoteOnly === true) params.append('remote', 'true');
      if (opts.sortBy) params.append('sort', opts.sortBy);

      // Validate daily search limit using server actions endpoint
      let allowFullSearch = true;
      try {
        const userData = await AsyncStorage.getItem('userData');
        const userId = userData ? JSON.parse(userData)._id : null;
        if (userId) {
          const actions = await SubscriptionValidationService.getAvailableActions(userId);
          const restricted = actions?.restrictedActions || {};
          const subscription = actions?.subscription || {};
          const limits = subscription?.limits || {};
          const usage = actions?.usage || {};

          if (restricted.search_job && restricted.search_job.allowed === false) {
            setError(restricted.search_job.message || 'Upgrade required to continue searching jobs.');
            setIsLoading(false);
            return;
          }

          const dailyLimit = limits.jobSearchPerDay;
          const dailyUsed = usage.jobSearchPerDay || 0;
          if (typeof dailyLimit === 'number' && dailyUsed >= dailyLimit) {
            setError("You've reached today's job search limit.");
            setIsLoading(false);
            return;
          }
          allowFullSearch = true;
        }
      } catch (e) {
        allowFullSearch = true; // fail open to avoid blocking UX if validation fails
      }

      // Always include userId so backend can validate and record usage
      try {
        const userData = await AsyncStorage.getItem('userData');
        const userId = userData ? JSON.parse(userData)._id : null;
        if (userId) params.append('userId', userId);
      } catch {}

      // Choose endpoint based on allowance
      const url = allowFullSearch
        ? `${BASE_URL}/api/user/getAllJobs${params.toString() ? `?${params.toString()}` : ''}`
        : `${BASE_URL}/api/user/getAllJobs?limit=5${params.toString() ? `&${params.toString()}` : ''}`;

      const response = await fetch(url);




      if (!response.ok) {
        if (response.status === 402 || response.status === 403) {
          const data = await response.json().catch(() => ({}));
          const message = data?.error || (response.status === 402 ? 'Upgrade required to continue searching jobs.' : 'Feature not available in current plan.');
          setError(message);
          return;
        }
        throw new Error('Failed to fetch jobs');
      }

      const result = await response.json();

      console.log('API Response:..................', result);   

      if (result && result.data) {
        const transformedJobs = result.data.map(job => ({
          id: job._id,
          title: job.title || job.jobtitle || 'No Title',
          company: {
            name: job.company?.name || job.companyName || 'Unknown Company',
            logo: job.company?.logo || job.companyName?.charAt(0) || '💼',
            website: job.company?.website || job.companywebsite || '',
            mobile: job.company?.mobile || job.companymobile || '',
            industry: job.company?.industry || job.companyindustry || '',
            type: job.company?.type || job.companytype || '',
            department: job.company?.department || job.department || '',
            address: job.company?.address || job.companyaddress || ''
          },
          location: job.location || 'Location not specified',
          salary: {
            min: job.salary?.min || job.minSalary || 0,
            max: job.salary?.max || job.maxSalary || 0,
            type: job.salary?.type || 'Monthly',
            displayValue: `₹${job.salary?.min || job?.minSalary || 0} - ₹${job.salary?.max || job.maxSalary || 0}`,
            incentive: job.salary?.incentive || job?.averageIncentive || ''
          },
          experience: {
            required: job.experience?.required || job?.experiencerequired || 0,
            details: job.experience?.details || '',
            displayValue: `${job?.experience?.required || job?.experiencerequired || 0} years`
          },
          type: {
            work: job?.type?.work || job?.typeofwork || 'Full Time',
            job: job?.type?.job || job?.typeofjob || '',
            education: job?.type?.education || job?.education || '',
            qualification: job?.type?.qualification || ''
          },
          skills: Array.isArray(job?.skills) ? job?.skills :
            Array.isArray(job?.skill) ? job?.skill :
              typeof job?.skill === 'string' ? job?.skill.split(',').map(s => s.trim()) : [],
          description: job?.description || '',
          requirements: job?.requirements || '',
          responsibilities: job?.responsibilities || '',
          benefits: job?.benefits || '',
          logo: job?.company?.logo || job?.companyName?.charAt(0) || '💼',
          bgColor: getRandomColor(),
          matchRate: job?.matchRate || '90%',
          isPrime: job?.isPrime || false,
          status: job?.status || 'Active'
        }));

        setJobs(transformedJobs);
        setFilteredJobs(transformedJobs);
        if (result.meta) {
          setRemainingSearches(typeof result.meta.remainingSearches === 'number' ? result.meta.remainingSearches : null);
          setTotalSearchLimit(typeof result.meta.totalLimit === 'number' ? result.meta.totalLimit : null);
        }

        // Record a search usage and refresh actions to update remainingSearches
        try {
          const userData = await AsyncStorage.getItem('userData');
          const userId = userData ? JSON.parse(userData)._id : null;
          if (userId) {
            await SubscriptionValidationService.recordUsage('search_job', userId);
            const actions = await SubscriptionValidationService.getAvailableActions(userId);
            const subscription = actions?.subscription || {};
            const limits = subscription?.limits || {};
            const usage = actions?.usage || {};
            const dailyLimit = limits.jobSearchPerDay;
            const dailyUsed = usage.jobSearchPerDay || 0;
            if (typeof dailyLimit === 'number') {
              setRemainingSearches(Math.max(0, dailyLimit - dailyUsed));
              setTotalSearchLimit(dailyLimit);
            }
          }
        } catch {}
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);


  // When filters change, fetch latest jobs from backend and then apply local sort fallback
  useEffect(() => {
    fetchAllJobs({ query: searchQuery, remoteOnly: showRemoteOnly, sortBy });
  }, [searchQuery, showRemoteOnly, sortBy]);

  // Also refetch whenever the screen gains focus (user revisits), so usage increments per visit
  useFocusEffect(
    React.useCallback(() => {
      fetchAllJobs({ query: searchQuery, remoteOnly: showRemoteOnly, sortBy });
    }, [searchQuery, showRemoteOnly, sortBy])
  );

  const renderJobCard = ({ item: job }) => (
    <TouchableOpacity
      style={[styles.jobCard, { backgroundColor: job.bgColor }]}
      onPress={() => navigation.navigate('JobDetailScreen', { job })}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.companyLogo}>
          <Text style={styles.logoText}>{job?.logo}</Text>
          {job?.isPrime && (
            <View style={styles.primeBadge}>
              <Text style={styles.primeText}>Prime</Text>
            </View>
          )}
        </View>
        <TouchableOpacity>
        </TouchableOpacity>
      </View>

      <Text style={styles.jobTitle}>{job.title}</Text>
      <Text style={styles.companyName}>{job?.company?.name}</Text>

      <View style={styles.jobDetails}>
        <View style={styles.detailPill}>
          <Icon name="location-on" size={16} color="#fff" />
          <Text style={styles.detailText}>{job?.location}</Text>
        </View>
        <View style={styles.detailPill}>
          <Icon name="currency-rupee" size={20} color="#4F46E5" />
          <Text style={styles.detailText}>{job?.salary?.displayValue}</Text>
        </View>
      </View>

      {job.skills && job.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {job.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const FilterRow = () => {
    const filters = [
      { label: 'All', icon: 'apps' },
      { label: 'Hybrid', icon: 'laptop' },
      { label: 'WFO', icon: 'schedule' },
      { label: 'Part-time', icon: 'access-time' },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.label}
            style={[
              styles.filterButton,
              activeFilter === filter.label && styles.filterButtonActive
            ]}
            onPress={() => {
              setActiveFilter(filter.label);
              let filtered = jobs;

              if (filter.label === 'Hybrid') {
                filtered = jobs.filter(job => job.type?.work === "Hybrid");
              } else if (filter.label === 'WFO') {
                filtered = jobs.filter(job => job.type?.work === "WFO");
              } else if (filter.label === 'Part-time') {
                filtered = jobs.filter(job => job.type?.work === "Part-time");
              }

              setFilteredJobs(filtered);
            }}
          >
            <Icon
              name={filter.icon}
              size={20}
              color={activeFilter === filter.label ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[
              styles.filterText,
              activeFilter === filter.label && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const SortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'location' && styles.selectedSort]}
            onPress={() => {
              setSortBy('location');
              setShowSortModal(false);
            }}
          >
            <Icon name="location-on" size={20} color={sortBy === 'location' ? "#4F46E5" : "#6B7280"} />
            <Text style={[styles.sortText, sortBy === 'location' && styles.selectedSortText]}>
              Location
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'salary_low_to_high' && styles.selectedSort]}
            onPress={() => {
              setSortBy('salary_low_to_high');
              setShowSortModal(false);
            }}
          >
            <Icon name="trending-up" size={20} color={sortBy === 'salary_low_to_high' ? "#4F46E5" : "#6B7280"} />
            <Text style={[styles.sortText, sortBy === 'salary_low_to_high' && styles.selectedSortText]}>
              Salary: Low to High
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'salary_high_to_low' && styles.selectedSort]}
            onPress={() => {
              setSortBy('salary_high_to_low');
              setShowSortModal(false);
            }}
          >
            <Icon name="trending-down" size={20} color={sortBy === 'salary_high_to_low' ? "#4F46E5" : "#6B7280"} />
            <Text style={[styles.sortText, sortBy === 'salary_high_to_low' && styles.selectedSortText]}>
              Salary: High to Low
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Jobs</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search jobs .."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={remainingSearches === null || remainingSearches > 0}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Icon name="sort" size={24} color="#26437c" />
          </TouchableOpacity>
        </View>

        <FilterRow />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4B6BFB" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={renderJobCard}
          keyExtractor={job => job.id}
          contentContainerStyle={styles.jobsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.noJobsText}>No jobs found</Text>
          }
          ListHeaderComponent={(
            remainingSearches !== null && totalSearchLimit !== null ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                <Text style={{ color: '#26437c', fontWeight: '600' }}>
                  {`Remaining searches today: ${remainingSearches}/${totalSearchLimit}`}
                </Text>
              </View>
            ) : null
          )}
        />
      )}

      <SortModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#26437c',
    padding: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#26437c',
  },
  jobsList: {
    padding: 16,
    gap: 16,
  },
  jobCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  primeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#26437c',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  jobDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
    padding: 16,
  },
  noJobsText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
  filterRow: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sortButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26437c',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedSort: {
    backgroundColor: '#EEF2FF',
  },
  sortText: {
    fontSize: 16,
    color: '#26437c',
    marginLeft: 12,
  },
  selectedSortText: {
    color: '#4F46E5',
    fontWeight: '500',
  },
});

export default AllJobsScreen; 