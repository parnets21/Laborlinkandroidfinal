import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CompanyDetails = ({ route, navigation }) => {
  const { company } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Details</Text>
      </View>

      <View style={styles.companyCard}>
        <View style={styles.companyHeader}>
          <View style={[styles.companyLogo, { backgroundColor: company.bgColor || '#4F46E5' }]}>
            <Text style={styles.companyLogoText}>
              {company.company?.logo || company.company?.name?.charAt(0) || '🏢'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.companyName}>{company.company?.name || 'Company Name'}</Text>
            <Text style={styles.industry}>{company.type?.industry || 'Technology'}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="business" size={24} color="#4F46E5" />
            <Text style={styles.statValue}>{Math.floor(Math.random() * 50) + 10}</Text>
            <Text style={styles.statLabel}>Open Positions</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="people" size={24} color="#059669" />
            <Text style={styles.statValue}>{Math.floor(Math.random() * 1000) + 100}+</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="location-on" size={24} color="#DC2626" />
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Locations</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Company</Text>
          <Text style={styles.sectionText}>
            {company.description || 'A leading technology company focused on innovation and excellence.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <Icon name="location-on" size={20} color="#4F46E5" />
            <Text style={styles.locationText}>
              {company.company?.address || company.location || 'Multiple Locations'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.viewJobsButton}
          onPress={() => navigation.navigate('AllJobs', { companyId: company.id })}
        >
          <Text style={styles.viewJobsButtonText}>View All Jobs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#134083',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 16,
  },
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyLogoText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  industry: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  viewJobsButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewJobsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CompanyDetails; 