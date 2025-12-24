import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, ScrollView, Linking, StatusBar, Animated, FlatList,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'LabourLink needs location access for tracking.',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const OfferLetterScreen = ({ route }) => {
  const [offersList, setOffersList] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [responseStatus, setResponseStatus] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) {
          throw new Error('User data not found');
        }

        const user = JSON.parse(userData);
        const userId = user._id;

        console.log('User-ID:', userId);

        // Fixed API call to match your endpoint
        const response = await axios.get(`https://laborlink.co.in/api/user/getlistOOfaplly/${userId}`);

        console.log("API Response:", response.data);

        // Extract offers from the success array and filter only 'sent' status
        const allOffers = response.data.success || [];
        const sentOffers = allOffers.filter(offer => offer.offerLetter?.status === 'sent');
        console.log("Sent offers:", sentOffers);

        setOffersList(sentOffers);

        // Select the first sent offer
        const defaultOffer = sentOffers[0];
        setSelectedOffer(defaultOffer);

        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      } catch (error) {
        console.error('Error fetching offers:', error);
        Alert.alert('Error', 'Failed to fetch offer details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOfferDetails();
  }, []);

  const handleSubmitResponse = async () => {
    if (!responseStatus || !responseMessage.trim()) {
      Alert.alert('Required', 'Please select a response and enter a message.');
      return;
    }

    if (!selectedOffer) {
      Alert.alert('Error', 'No offer selected.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`https://laborlink.co.in/api/offers/respond/${selectedOffer._id}`, {
        status: responseStatus,
        response: responseMessage,
      });

      if (Platform.OS === 'android') {
        ToastAndroid.show(`Offer ${responseStatus} successfully!`, ToastAndroid.SHORT);
      }
      if (responseStatus === 'accepted') {
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 200));
            Geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                const jobseekerId = selectedOffer?.userId;
                if (!jobseekerId) {
                  console.warn('Missing userId for location update');
                  return;
                }
                axios.post('https://laborlink.co.in/api/user/location', {
                  jobseekerId,
                  latitude,
                  longitude,
                  timestamp: new Date().toISOString(),
                }).catch(console.error);
              },
              (error) => {
                console.warn('getCurrentPosition error:', error?.message || error);
                if (Platform.OS === 'android') {
                  ToastAndroid.show('Unable to get current location', ToastAndroid.SHORT);
                } else {
                  Alert.alert('Location Error', 'Unable to access location.');
                }
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
            );
          } catch (e) {
            console.warn('Location fetch failed:', e);
          }
        }
      }

      // Refresh the offers list
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);
      const userId = user._id;

      const response = await axios.get(`https://laborlink.co.in/api/user/getlistOOfaplly/${userId}`);
      const allOffers = response.data.success || [];
      const sentOffers = allOffers.filter(offer => offer.offerLetter?.status === 'sent');
      setOffersList(sentOffers);
      const updatedOffer = sentOffers.find(offer => offer._id === selectedOffer._id);
      setSelectedOffer(updatedOffer);

      setResponseStatus('');
      setResponseMessage('');
    } catch (error) {
      console.error('Error submitting response:', error);
      Alert.alert('Error', 'Failed to submit response.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (salary) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(salary);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const getStatusColor = (status) => ({
    accepted: '#059669',
    hired: '#059669',
    declined: '#DC2626',
    sent: '#D97706',
    pending: '#D97706',
    offer_declined: '#DC2626',
    selected: '#7C3AED'
  }[status] || '#6B7280');

  const renderOfferItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.offerItem,
        selectedOffer?._id === item._id && styles.selectedOfferItem
      ]}
      onPress={() => {
        setSelectedOffer(item);
        setResponseStatus('');
        setResponseMessage('');
      }}
    >
      <View style={styles.offerItemHeader}>
        <Text style={styles.offerItemTitle}>{item.offerLetter?.position || item.jobTitle}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.offerLetter?.status || item.applicationStatus) }]}>
          <Text style={styles.statusText}>{(item.offerLetter?.status || item.applicationStatus || 'pending').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.offerItemSubtitle}>{item.offerLetter?.salary ? formatSalary(item.offerLetter.salary) : 'Salary Not Specified'}</Text>
      <Text style={styles.offerItemDate}>{formatDate(item.offerLetter?.generatedAt || item.appliedOn)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading offer details...</Text>
      </View>
    );
  }

  if (!offersList.length) {
    return (
      <View style={styles.center}>
        <Icon name="mail-outline" size={48} color="#6B7280" />
        <Text style={styles.errorTitle}>No Offer Letters</Text>
        <Text style={styles.errorSubtitle}>You don't have any pending offer letters to review.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {
          setLoading(true);
          // Re-fetch data
          const fetchData = async () => {
            try {
              const userData = await AsyncStorage.getItem('userData');
              const user = JSON.parse(userData);
              const userId = user._id;
              const response = await axios.get(`https://laborlink.co.in/api/user/getlistOOfaplly/${userId}`);
              const allOffers = response.data.success || [];
              const sentOffers = allOffers.filter(offer => offer.offerLetter?.status === 'sent');
              setOffersList(sentOffers);
              const defaultOffer = sentOffers[0];
              setSelectedOffer(defaultOffer);
            } catch (error) {
              console.error('Error:', error);
            } finally {
              setLoading(false);
            }
          };
          fetchData();
        }}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!selectedOffer) {
    return (
      <View style={styles.center}>
        <Icon name="error-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Please select an application</Text>
      </View>
    );
  }

  const { offerLetter, applicationStatus, companyId: company } = selectedOffer;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      <View style={styles.header}>
        <Icon name="celebration" size={24} color="white" />
        <Text style={styles.headerTitle}>Congratulations! 🎉</Text>
        <Text style={styles.headerSubtitle}>You have received an offer letter</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Offers List */}
        {offersList.length > 1 && (
          <View style={styles.offersListContainer}>
            <Text style={styles.offersListTitle}>Your Offer Letters</Text>
            <FlatList
              data={offersList}
              renderItem={renderOfferItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.offersList}
            />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Congratulations Card */}
          <View style={styles.congratsCard}>
            <View style={styles.congratsHeader}>
              <View style={styles.congratsIconContainer}>
                <Icon name="star" size={32} color="#FFD700" />
              </View>
              <Text style={styles.congratsTitle}>🎉 Congratulations! 🎉</Text>
              <Text style={styles.congratsSubtitle}>You've been selected for the position!</Text>
            </View>

            <View style={styles.congratsContent}>
              <Text style={styles.congratsMessage}>
                Great news! {selectedOffer.companyName} is excited to offer you the position of{' '}
                <Text style={styles.boldText}>{offerLetter?.position || selectedOffer.jobTitle}</Text>.
                Your skills and experience have impressed our team, and we believe you'll be a fantastic addition to our organization.
              </Text>

              <View style={styles.congratsDetails}>
                <View style={styles.congratsDetailItem}>
                  <Icon name="work" size={20} color="#4F46E5" />
                  <Text style={styles.congratsDetailText}>{offerLetter?.position || selectedOffer.jobTitle}</Text>
                </View>
                <View style={styles.congratsDetailItem}>
                  <Icon name="business" size={20} color="#059669" />
                  <Text style={styles.congratsDetailText}>{selectedOffer.companyName}</Text>
                </View>
                {offerLetter?.salary && (
                  <View style={styles.congratsDetailItem}>
                    <Icon name="" size={20} color="#FFB800" />
                    <Text style={styles.congratsDetailText}>{formatSalary(offerLetter.salary)}</Text>
                  </View>
                )}
                {offerLetter?.startDate && (
                  <View style={styles.congratsDetailItem}>
                    <Icon name="calendar-today" size={20} color="#7C3AED" />
                    <Text style={styles.congratsDetailText}>Start Date: {formatDate(offerLetter.startDate)}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          {/* PDF Download */}
          {offerLetter?.url && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="picture-as-pdf" size={20} color="#EF4444" />
                <Text style={styles.cardTitle}>Download Your Offer Letter</Text>
              </View>
              <Text style={styles.downloadDescription}>
                Your official offer letter contains all the details about your position, salary, benefits, and terms of employment.
              </Text>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => Linking.openURL(`https://laborlink.co.in${offerLetter.url}`)}
              >
                <Icon name="download" size={16} color="white" />
                <Text style={styles.buttonText}>Download Offer Letter PDF</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Action Section */}
          <View style={styles.card}>
            <Text style={styles.actionTitle}>Your Response Required</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton,
                responseStatus === 'accepted' && styles.activeAccept]}
                onPress={() => setResponseStatus('accepted')}
              >
                <Icon name="check-circle" size={18}
                  color={responseStatus === 'accepted' ? 'white' : '#059669'} />
                <Text style={[styles.actionText,
                { color: responseStatus === 'accepted' ? 'white' : '#059669' }]}>
                  Accept Offer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton,
                responseStatus === 'declined' && styles.activeDecline]}
                onPress={() => setResponseStatus('declined')}
              >
                <Icon name="cancel" size={18}
                  color={responseStatus === 'declined' ? 'white' : '#DC2626'} />
                <Text style={[styles.actionText,
                { color: responseStatus === 'declined' ? 'white' : '#DC2626' }]}>
                  Decline Offer
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.messageInput}
              placeholder="Enter your response message..."
              multiline
              numberOfLines={3}
              value={responseMessage}
              onChangeText={setResponseMessage}
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              style={[styles.submitButton,
              responseStatus === 'accepted' ? styles.submitAccept : styles.submitDecline,
              (submitting || !responseStatus) && styles.disabled]}
              onPress={handleSubmitResponse}
              disabled={submitting || !responseStatus}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Icon name="send" size={16} color="white" />
                  <Text style={styles.buttonText}>
                    {responseStatus === 'accepted' ? 'Accept & Join Team' : 'Decline Offer'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>



          {/* Company Details */}
          {company && (
            <View style={styles.companyCard}>
              <View style={styles.cardHeader}>
                <Icon name="business" size={24} color="#4F46E5" />
                <Text style={styles.companyCardTitle}>About {company.companyName}</Text>
              </View>

              <View style={styles.companyInfo}>
                <View style={styles.companyDetailRow}>
                  <Icon name="business" size={16} color="#6B7280" />
                  <Text style={styles.companyDetailLabel}>Company:</Text>
                  <Text style={styles.companyDetailValue}>{company.companyName}</Text>
                </View>

                {company.companyindustry && (
                  <View style={styles.companyDetailRow}>
                    <Icon name="category" size={16} color="#6B7280" />
                    <Text style={styles.companyDetailLabel}>Industry:</Text>
                    <Text style={styles.companyDetailValue}>{company.companyindustry}</Text>
                  </View>
                )}

                {company.companytype && (
                  <View style={styles.companyDetailRow}>
                    <Icon name="account-balance" size={16} color="#6B7280" />
                    <Text style={styles.companyDetailLabel}>Type:</Text>
                    <Text style={styles.companyDetailValue}>{company.companytype}</Text>
                  </View>
                )}

                {company.companywebsite && (
                  <TouchableOpacity
                    style={styles.companyDetailRow}
                    onPress={() => Linking.openURL(`https://${company.companywebsite.replace(/^https?:\/\//, '')}`)}
                  >
                    <Icon name="language" size={16} color="#4F46E5" />
                    <Text style={styles.companyDetailLabel}>Website:</Text>
                    <Text style={[styles.companyDetailValue, styles.linkText]}>{company.companywebsite}</Text>
                  </TouchableOpacity>
                )}

                {company.companymobile && (
                  <TouchableOpacity
                    style={styles.companyDetailRow}
                    onPress={() => Linking.openURL(`tel:${company.companymobile}`)}
                  >
                    <Icon name="phone" size={16} color="#059669" />
                    <Text style={styles.companyDetailLabel}>Contact:</Text>
                    <Text style={[styles.companyDetailValue, styles.linkText]}>{company.companymobile}</Text>
                  </TouchableOpacity>
                )}

                {company.companyaddress && (
                  <View style={styles.companyDetailRow}>
                    <Icon name="location-on" size={16} color="#DC2626" />
                    <Text style={styles.companyDetailLabel}>Address:</Text>
                    <Text style={styles.companyDetailValue}>{company.companyaddress}</Text>
                  </View>
                )}
              </View>

              {company.description && (
                <View style={styles.jobDescriptionContainer}>
                  <Text style={styles.jobDescriptionTitle}>Role Description</Text>
                  <Text style={styles.jobDescription}>{company.description}</Text>
                </View>
              )}

              {company.skill && company.skill.length > 0 && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.skillsTitle}>Required Skills</Text>
                  <View style={styles.skillsList}>
                    {company.skill.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280', fontWeight: '500' },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: '#134083', marginTop: 12, marginBottom: 8 },
  errorSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16, textAlign: 'center' },
  retryButton: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },

  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 8 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255, 255, 255, 0.8)' },

  content: { flex: 1, marginTop: -10 },
  scrollContent: { padding: 16, paddingTop: 20 },

  // Congratulations Card
  congratsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  congratsHeader: { alignItems: 'center', marginBottom: 20 },
  congratsIconContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 50,
    padding: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFD700'
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#134083',
    textAlign: 'center',
    marginBottom: 8
  },
  congratsSubtitle: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '600'
  },
  congratsContent: { alignItems: 'center' },
  congratsMessage: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20
  },
  boldText: { fontWeight: 'bold', color: '#4F46E5' },
  congratsDetails: { width: '100%', gap: 12 },
  congratsDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5'
  },
  congratsDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#134083',
    marginLeft: 12,
    flex: 1
  },

  // Offers list styles
  offersListContainer: { backgroundColor: 'white', paddingVertical: 16, marginBottom: 8 },
  offersListTitle: { fontSize: 16, fontWeight: 'bold', color: '#134083', paddingHorizontal: 16, marginBottom: 12 },
  offersList: { paddingHorizontal: 16 },
  offerItem: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, marginRight: 12, minWidth: 200, borderWidth: 1, borderColor: '#E5E7EB' },
  selectedOfferItem: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  offerItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  offerItemTitle: { fontSize: 14, fontWeight: '600', color: '#134083', flex: 1 },
  offerItemSubtitle: { fontSize: 12, color: '#059669', fontWeight: '500', marginBottom: 4 },
  offerItemDate: { fontSize: 10, color: '#6B7280' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusText: { color: 'white', fontSize: 10, fontWeight: '600' },

  // Company Card
  companyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  companyCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#134083', marginLeft: 8 },
  companyInfo: { marginTop: 16 },
  companyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4
  },
  companyDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
    minWidth: 80
  },
  companyDetailValue: {
    fontSize: 14,
    color: '#134083',
    marginLeft: 12,
    flex: 1
  },
  linkText: { color: '#4F46E5', textDecorationLine: 'underline' },

  jobDescriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  jobDescriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 8
  },
  jobDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#134083', marginLeft: 8 },

  downloadDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8
  },
  buttonText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 6 },

  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#134083',
    textAlign: 'center',
    marginBottom: 16
  },
  actionButtons: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5
  },
  acceptButton: { backgroundColor: '#F0FDF4', borderColor: '#059669' },
  activeAccept: { backgroundColor: '#059669' },
  declineButton: { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
  activeDecline: { backgroundColor: '#DC2626' },
  actionText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },

  messageInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#134083',
    minHeight: 80,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
    textAlignVertical: 'top'
  },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8
  },
  submitAccept: { backgroundColor: '#059669' },
  submitDecline: { backgroundColor: '#DC2626' },
  disabled: { opacity: 0.5 },

  skillsContainer: { marginBottom: 12 },
  skillsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8
  },
  skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  skillText: { fontSize: 12, color: '#4F46E5', fontWeight: '500' },
});

export default OfferLetterScreen;