import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JobHistory = () => {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { _id: employerId } = JSON.parse(userData);
      
      const response = await axios.get(`${BASE_URL}/api/user/Postedjobs/${employerId}`);
      console.log('Fetched jobs:', response.data);
      
      if (response.data.jobs && Array.isArray(response.data.jobs)) {
        setJobs(response.data.jobs);
      } else {
        setJobs([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const handleJobPress = (job) => {
    navigation.navigate('JobDetails', { job: { ...job, id: job._id } });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#10B981';
      case 'Closed':
        return '#EF4444';
      default:
        return '#FCD34D';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#134083" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Posted Jobs</Text>
        <TouchableOpacity 
          style={styles.postButton}
          onPress={() => navigation.navigate('CreateJob')}
        >
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.postButtonText}>Post New Job</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchJobs}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {(!jobs || jobs.length === 0) ? (
            <View style={styles.emptyContainer}>
              <Icon name="work-off" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No jobs posted yet</Text>
              <TouchableOpacity 
                style={styles.createJobButton}
                onPress={() => navigation.navigate('CreateJob')}
              >
                <Text style={styles.createJobButtonText}>Create Your First Job Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            jobs.map((job) => (
              <TouchableOpacity 
                key={job._id} 
                style={styles.jobCard}
                onPress={() => handleJobPress(job)}
                activeOpacity={0.7}
              >
                <View style={styles.jobHeader}>
                  <View style={styles.jobHeaderLeft}>
                    <Text style={styles.companyName}>{job.companyName}</Text>
                    <Text style={styles.jobTitle}>{job.jobtitle}</Text>
                    <Text style={styles.jobProfile}>{job.jobProfile}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: job.isPrime ? '#FCD34D' : '#10B981' }
                  ]}>
                    <Text style={styles.statusText}>{job.isPrime ? 'Premium' : 'Active'}</Text>
                  </View>
                </View>
                
                <View style={styles.jobDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="location-on" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{job.location || 'Location not specified'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="people" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Openings: {job.openings}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="work" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{job.typeofwork || 'Not specified'}</Text>
                  </View>
                </View>

                <View style={styles.salarySection}>
                  <Icon name="" size={16} color="#059669" />
                  <Text style={styles.salaryText}>
                    ₹{job.minSalary} - ₹{job.maxSalary}
                    {job.averageIncentive && ` + ₹${job.averageIncentive} incentive`}
                  </Text>
                </View>

                {job.skill && job.skill.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {job.skill.map((skill, index) => (
                      <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.viewMore}>
                  <Text style={styles.viewMoreText}>View Details & Applications</Text>
                  <Icon name="chevron-right" size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#134083',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B5563',
    padding: 8,
    borderRadius: 8,
  },
  postButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  jobProfile: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  createJobButton: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  createJobButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#134083',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  salarySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
  },
  salaryText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  skillBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
});

export default JobHistory; 
