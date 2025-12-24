import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
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

const BASE_URL = 'https://laborlink.co.in';

const AllaccessJobPage = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limitInfo, setLimitInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('none');
  const [showSortModal, setShowSortModal] = useState(false);
  const [userType, setUserType] = useState('employee');

  const getRandomColor = () => {
    const colors = ['#2596be', '#e6de91', '#EC4899', '#4F46E5', '#059669'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const fetchAllJobs = async () => {
    try {
      setIsLoading(true);
      // Always include userId so backend can validate usage and skip counting when not a real search
      let userIdParam = '';
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        const uid = userDataStr ? JSON.parse(userDataStr)._id : null;
        if (uid) userIdParam = `?userId=${encodeURIComponent(uid)}`;
      } catch {}
      const response = await fetch(`${BASE_URL}/api/user/getAllJobs${userIdParam}`);
      console.log(response, "thissioa")

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const result = await response.json();

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
            displayValue: `₹${job.salary?.min || job.minSalary || 0} - ₹${job.salary?.max || job.maxSalary || 0}`,
            incentive: job.salary?.incentive || job.averageIncentive || ''
          },
          experience: {
            required: job.experience?.required || job.experiencerequired || 0,
            details: job.experience?.details || '',
            displayValue: `${job.experience?.required || job.experiencerequired || 0} years`
          },
          type: {
            work: job.type?.work || job.typeofwork || 'Full Time',
            job: job.type?.job || job.typeofjob || '',
            education: job.type?.education || job.education || '',
            qualification: job.type?.qualification || ''
          },
          skills: Array.isArray(job.skills) ? job.skills :
            Array.isArray(job.skill) ? job.skill :
              typeof job.skill === 'string' ? job.skill.split(',').map(s => s.trim()) : [],
          description: job.description || '',
          requirements: job.requirements || '',
          responsibilities: job.responsibilities || '',
          benefits: job.benefits || '',
          logo: job.company?.logo || job.companyName?.charAt(0) || '💼',
          bgColor: getRandomColor(),
          matchRate: job.matchRate || '90%',
          isPrime: job.isPrime || false,
          status: job.status || 'Active'
        }));

        setJobs(transformedJobs);
        setFilteredJobs(transformedJobs);
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
    (async () => {
      try {
        const s = await AsyncStorage.getItem('userData');
        const u = s ? JSON.parse(s) : null;
        if (u?.userType) setUserType(u.userType);
      } catch {}
    })();
  }, []);

  // Perform server-side search with validation when filters are applied
  const performServerSearch = async () => {
    try {
      if (!searchQuery && !showRemoteOnly && !sortBy) {
        // No filters, rely on local dataset
        setFilteredJobs(handleSort(jobs));
        return;
      }

      setIsLoading(true);

      // Load userId
      const userDataStr = await AsyncStorage.getItem('userData');
      const uid = userDataStr ? JSON.parse(userDataStr)._id : null;

      // Validate daily search limit using server actions endpoint if query/filter is present
      if (uid) {
        try {
          const actions = await SubscriptionValidationService.getAvailableActions(uid);
          const restricted = actions?.restrictedActions || {};
          const subscription = actions?.subscription || {};
          const limits = subscription?.limits || {};
          const usage = actions?.usage || {};

          // If server marks search_job as restricted, block immediately
          if (restricted.search_job && restricted.search_job.allowed === false) {
            setError(restricted.search_job.message || 'Upgrade required to continue searching jobs.');
            setLimitInfo({ remaining: 0, planName: subscription?.planName || 'Free Plan' });
            setIsLoading(false);
            return;
          }

          const dailyLimit = limits.jobSearchPerDay;
          const dailyUsed = usage.jobSearchPerDay || 0;
          if (typeof dailyLimit === 'number' && dailyUsed >= dailyLimit) {
            setError("You've reached today's job search limit.");
            setLimitInfo({ remaining: 0, planName: subscription?.planName || 'Free Plan' });
            setIsLoading(false);
            return;
          }
        } catch {}
      }

      // Build query params for server search
      const params = new URLSearchParams();
      if (uid) params.append('userId', uid);
      if (searchQuery) params.append('q', searchQuery);
      if (showRemoteOnly) params.append('remote', 'true');
      if (sortBy) params.append('sort', sortBy);

      const resp = await fetch(`${BASE_URL}/api/user/getAllJobs?${params.toString()}`);
      if (!resp.ok) {
        // Show upgrade required message when server blocks due to limit
        try {
          const payload = await resp.json();
          if (payload && payload.upgradeRequired) {
            setError(payload.error || "You've reached today's job search limit. Please upgrade your plan.");
            setLimitInfo({ remaining: payload.remainingUsage ?? 0, planName: 'Current Plan' });
            setIsLoading(false);
            return;
          }
          throw new Error(payload?.error || 'Failed to fetch jobs');
        } catch (_) {
          const text = await resp.text();
          throw new Error(text || 'Failed to fetch jobs');
        }
      }
      const result = await resp.json();
      const list = result?.data || [];

      const transformedJobs = list.map(job => ({
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
          displayValue: `₹${job.salary?.min || job.minSalary || 0} - ₹${job.salary?.max || job.maxSalary || 0}`,
          incentive: job.salary?.incentive || job.averageIncentive || ''
        },
        experience: {
          required: job.experience?.required || job.experiencerequired || 0,
          details: job.experience?.details || '',
          displayValue: `${job.experience?.required || job.experiencerequired || 0} years`
        },
        type: {
          work: job.type?.work || job.typeofwork || 'Full Time',
          job: job.type?.job || job.typeofjob || '',
          education: job.type?.education || job.education || '',
          qualification: job.type?.qualification || ''
        },
        skills: Array.isArray(job.skills) ? job.skills :
          Array.isArray(job.skill) ? job.skill :
            typeof job.skill === 'string' ? job.skill.split(',').map(s => s.trim()) : [],
        description: job.description || '',
        requirements: job.requirements || '',
        responsibilities: job.responsibilities || '',
        benefits: job.benefits || '',
        logo: job.company?.logo || job.companyName?.charAt(0) || '💼',
        bgColor: getRandomColor(),
        matchRate: job.matchRate || '90%',
        isPrime: job.isPrime || false,
        status: job.status || 'Active'
      }));

      setFilteredJobs(handleSort(transformedJobs));
    } catch (e) {
      console.error('Server search error:', e?.message || e);
      // Fall back to local filtering
      setFilteredJobs(handleSort(jobs));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (jobs) => {
    if (!jobs) return [];

    switch (sortBy) {
      case 'location':
        return [...jobs].sort((a, b) =>
          (a.location || '').localeCompare(b.location || '')
        );
      case 'salary_low_to_high':
        return [...jobs].sort((a, b) =>
          (a.salary?.min || 0) - (b.salary?.min || 0)
        );
      case 'salary_high_to_low':
        return [...jobs].sort((a, b) =>
          (b.salary?.max || 0) - (a.salary?.max || 0)
        );
      default:
        return jobs;
    }
  };

  useEffect(() => {
    // Use server-backed search when filters are present to enforce limits
    if (searchQuery || showRemoteOnly || sortBy) {
      performServerSearch();
    } else {
      // No filters; show locally
      setFilteredJobs(handleSort(jobs));
    }
  }, [searchQuery, showRemoteOnly, sortBy]);

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
          <Icon name="favorite-border" size={20} color="#fff" />
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
              placeholder="Search jobs, companies, location..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
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
        <View style={styles.limitCard}>
          <View style={styles.limitIconCircle}> 
            <Icon name="lock" size={28} color="#DC2626" />
          </View>
          <Text style={styles.limitTitle}>Daily search limit reached</Text>
          <Text style={styles.limitSubtitle}>
            {typeof error === 'string' ? error : "You've reached today's job search limit. Upgrade to continue searching."}
          </Text>
          <View style={styles.limitChipsRow}>
            {!!limitInfo?.planName && (
              <View style={styles.limitChip}><Icon name="star" size={14} color="#4F46E5" /><Text style={styles.limitChipText}>{limitInfo.planName}</Text></View>
            )}
            <View style={styles.limitChip}><Icon name="hourglass-empty" size={14} color="#4F46E5" /><Text style={styles.limitChipText}>Remaining Today: {limitInfo?.remaining ?? 0}</Text></View>
          </View>
          <View style={styles.limitActions}>
            <TouchableOpacity style={styles.upgradeButton} onPress={() => navigation.navigate('EmployeeSubscription', { type: userType || 'employee' })}>
              <Icon name="upgrade" size={18} color="#fff" />
              <Text style={styles.upgradeButtonText}>View Plans</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  limitCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center'
  },
  limitIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
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
    marginBottom: 14,
    textAlign: 'center'
  },
  limitChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
  limitActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
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

export default AllaccessJobPage; 