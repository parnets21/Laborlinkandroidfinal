import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkExperience = ({ navigation, route }) => {
  const { userData } = route.params;
  const [hasExperience, setHasExperience] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [experience, setExperience] = useState({
    years: '',
    jobTitle: '',
    jobRoles: [],
    companyName: '',
    industry: [],
    salary: '',
    startDate: {
      month: '',
      year: ''
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Available navigation options:', navigation);
    console.log('Route params:', route.params);
  }, []);

  useEffect(() => {
    console.log('Received userData in WorkExperience:', userData);
  }, []);

  const industries = [
    'Information Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Construction',
    'Hospitality',
    'Others'
  ];

  const validateForm = () => {
    if (!hasExperience) return true;

    if (!experience.jobTitle || !experience.companyName || 
        !experience.industry.length || !experience.startDate.month || 
        !experience.startDate.year) {
      Alert.alert('Error', 'Please fill all required fields');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      console.log('Starting navigation to SkillsAndPreferences');
      
      // Get the stored profile data
      const storedProfileData = await AsyncStorage.getItem('profileData');
      const parsedProfileData = storedProfileData ? JSON.parse(storedProfileData) : userData;
      
      // Format work experience data
      const workData = {
        workExperience: hasExperience,
        experiences: hasExperience ? {
          years: experience.years,
          jobTitle: experience.jobTitle,
          jobRoles: experience.jobRoles,
          companyName: experience.companyName,
          industry: experience.industry,
          salary: experience.salary,
          startDate: experience.startDate
        } : null
      };

      // Combine data
      const combinedData = {
        ...parsedProfileData,
        ...workData
      };

      console.log('Combined data:', combinedData);
      
      // Save data
      await AsyncStorage.setItem('profileData', JSON.stringify(combinedData));
      
      // Navigate to next screen
      navigation.navigate('SkillsAndPreferences', {
        userData: combinedData
      });

    } catch (error) {
      console.error('Error in handleNext:', error);
      Alert.alert('Error', 'Failed to proceed to next step');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      console.log('Navigation event:', e);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Work Experience</Text>
        <Text style={styles.stepIndicator}>Step 3 of 4</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.experienceToggle}>
          <Text style={styles.question}>Do you have work experience?</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                hasExperience && styles.toggleButtonActive
              ]}
              onPress={() => setHasExperience(true)}
            >
              <Text style={[
                styles.toggleButtonText,
                hasExperience && styles.toggleButtonTextActive
              ]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !hasExperience && styles.toggleButtonActive
              ]}
              onPress={() => setHasExperience(false)}
            >
              <Text style={[
                styles.toggleButtonText,
                !hasExperience && styles.toggleButtonTextActive
              ]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {hasExperience && (
          <View style={styles.experienceForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Job Title*</Text>
              <TextInput
                style={styles.input}
                value={experience.jobTitle}
                onChangeText={(text) => setExperience({...experience, jobTitle: text})}
                placeholder="Enter your job title"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Company Name*</Text>
              <TextInput
                style={styles.input}
                value={experience.companyName}
                onChangeText={(text) => setExperience({...experience, companyName: text})}
                placeholder="Enter company name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Industry*</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowIndustryModal(true)}
              >
                <Text style={styles.selectButtonText}>
                  {experience.industry.length > 0 ? experience.industry.join(', ') : 'Select Industry'}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.dateContainer}>
              <Text style={styles.label}>Start Date*</Text>
              <View style={styles.dateInputs}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <TextInput
                    style={styles.input}
                    value={experience.startDate.month}
                    onChangeText={(text) => setExperience({
                      ...experience,
                      startDate: { ...experience.startDate, month: text }
                    })}
                    placeholder="Month"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <TextInput
                    style={styles.input}
                    value={experience.startDate.year}
                    onChangeText={(text) => setExperience({
                      ...experience,
                      startDate: { ...experience.startDate, year: text }
                    })}
                    placeholder="Year"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showIndustryModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Industry</Text>
              <TouchableOpacity onPress={() => setShowIndustryModal(false)}>
                <Icon name="close" size={24} color="#134083" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {industries.map((industry) => (
                <TouchableOpacity
                  key={industry}
                  style={styles.modalItem}
                  onPress={() => {
                    setExperience({...experience, industry: [industry]});
                    setShowIndustryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{industry}</Text>
                  {experience.industry.includes(industry) && (
                    <Icon name="check" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Icon name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#134083',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  experienceToggle: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 12,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  experienceForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateInputs: {
    flexDirection: 'row',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalItemText: {
    fontSize: 16,
    color: '#134083',
  },
});

export default WorkExperience; 