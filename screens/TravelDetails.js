import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TravelDetails = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Travel Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
            <Text style={styles.dateTime}>Next Week</Text>
          </View>

          <View style={styles.travelInfo}>
            <Text style={styles.travelTitle}>Site Visit - Mumbai</Text>
            <Text style={styles.travelPurpose}>Technical Team Meeting</Text>
          </View>
        </View>

        {/* Location Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location Details</Text>
          
          <View style={styles.detailItem}>
            <Icon name="location-on" size={24} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Destination</Text>
              <Text style={styles.detailText}>Mumbai, Maharashtra</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="business" size={24} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Venue</Text>
              <Text style={styles.detailText}>Tech Park, Andheri East</Text>
            </View>
          </View>
        </View>

        {/* Schedule Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          
          <View style={styles.detailItem}>
            <Icon name="event" size={24} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>March 25, 2024</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="schedule" size={24} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailText}>2 Days</Text>
            </View>
          </View>
        </View>

        {/* Travel Arrangements */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Travel Arrangements</Text>
          
          <View style={styles.detailItem}>
            <Icon name="flight" size={24} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Flight Details</Text>
              <Text style={styles.detailText}>AI-123 • 8:30 AM</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="hotel" size={24} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Accommodation</Text>
              <Text style={styles.detailText}>Hotel Taj • Confirmed</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>
            Please carry all necessary documents and presentation materials.
            Local transport will be arranged by the Mumbai office.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.rescheduleButton}
          onPress={() => {/* Handle reschedule */}}
        >
          <Icon name="schedule" size={20} color="#134083" />
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => {/* Handle confirm */}}
        >
          <Icon name="check" size={20} color="#fff" />
          <Text style={styles.confirmButtonText}>Confirm Travel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... similar styles as InterviewDetails ...
  // Adding unique styles for travel
  travelInfo: {
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 12,
  },
  travelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  travelPurpose: {
    fontSize: 16,
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  confirmButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default TravelDetails; 