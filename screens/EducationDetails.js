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
  ActivityIndicator,
  Modal,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';

const EducationDetails = ({ navigation, route }) => {
  const { userData } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [educationOptions, setEducationOptions] = useState([]);
  
  const [educationData, setEducationData] = useState({
    institute: '',
    course: '',
    field: '',
    starting: new Date(),
    passOut: new Date(),
    grade: ''
  });

  // Certificate upload section removed as certificates are not supported in app
  
  const [errors, setErrors] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    console.log('Received userData in EducationDetails:', userData);
    fetchEducationOptions();
  }, []);

  const fetchEducationOptions = async () => {
    try {
      console.log('Fetching education options...');
      const response = await axios.get(`${BASE_URL}/api/user/educations`);
      console.log('Education API response:', response.data);

      // The response is directly an array of education options
      if (Array.isArray(response.data)) {
        const transformedEducations = response.data.map(edu => ({
          id: edu._id,
          name: edu.qualification,
          value: edu.qualification
        }));
        console.log('Transformed education options:', transformedEducations);
        setEducationOptions(transformedEducations);
      } else {
        console.error('Unexpected response format:', response.data);
        Alert.alert('Error', 'Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching education options:', error);
      Alert.alert('Error', 'Failed to load education options');
    }
  };

  const validateForm = () => {
    if (!educationData.institute) {
      Alert.alert('Error', 'Please enter your institute name');
      return false;
    }
    if (!educationData.course) {
      Alert.alert('Error', 'Please enter your course');
      return false;
    }
    if (!educationData.field) {
      Alert.alert('Error', 'Please enter your field of study');
      return false;
    }
    if (!educationData.starting) {
      Alert.alert('Error', 'Please select your start date');
      return false;
    }
    if (!educationData.passOut) {
      Alert.alert('Error', 'Please select your pass out date');
      return false;
    }
    if (!educationData.grade) {
      Alert.alert('Error', 'Please enter your grade');
      return false;
    }
    return true;
  };

  const handleImagePicker = async () => {};

  const handleAddCertificate = () => {};

  const handleRemoveCertificate = () => {};

  const handleDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected && event.type !== 'dismissed') {
      if (dateType === 'starting') {
        setEducationData(prev => ({
          ...prev,
          starting: selected
        }));
      } else if (dateType === 'passOut') {
        setEducationData(prev => ({
          ...prev,
          passOut: selected
        }));
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleNext = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        // Get the stored profile data to ensure we have the latest
        const storedProfileData = await AsyncStorage.getItem('profileData');
        const parsedProfileData = storedProfileData ? JSON.parse(storedProfileData) : userData;
        
        console.log('Retrieved profile data in EducationDetails:', parsedProfileData);
        
        // Format the education data to match schema
        const formattedEducation = [{
          institute: educationData.institute,
          course: educationData.course,
          field: educationData.field,
          // starting: Number(educationData.starting.replace('-', '')), // Convert YYYY-MM to YYYYMM
          // passOut: Number(educationData.passOut.replace('-', '')), // Convert YYYY-MM to YYYYMM
          grade: educationData.grade
        }];

        // Combine with existing profile data
        const combinedData = {
          ...parsedProfileData,
          education: formattedEducation
        };

        console.log('Combined data to save from EducationDetails:', combinedData);
        
        // Save the combined data
        await AsyncStorage.setItem('profileData', JSON.stringify(combinedData));
        
        // Verify data was saved
        const savedData = await AsyncStorage.getItem('profileData');
        console.log('Verified saved data from EducationDetails:', savedData);
        
        // Navigate to Work Experience
        navigation.navigate('WorkExperience', {
          userData: combinedData
        });
      } catch (error) {
        console.error('Error saving education data:', error);
        Alert.alert('Error', 'Failed to save education data');
      } finally {
        setLoading(false);
      }
    }
  };

  // Render education level selection modal
  const renderEducationModal = () => (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="slide"
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setShowModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Course</Text>
            <TouchableOpacity 
              onPress={() => setShowModal(false)}
              style={styles.modalCloseButton}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {educationOptions.map((edu) => (
              <TouchableOpacity
                key={edu.id}
                style={styles.modalItem}
                onPress={() => {
                  setEducationData({...educationData, institute: edu.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{edu.name}</Text>
                {educationData.institute === edu.value && (
                  <Icon name="check" size={20} color="#4F46E5" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Education Details</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
            <Text style={styles.stepText}>Step 2 of 4: Education</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Course *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  console.log('Opening modal with options:', educationOptions);
                  setShowModal(true);
                }}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  educationData.institute ? styles.activeDropdownText : styles.placeholderText
                ]}>
                  {educationData.institute || 'Select Course'}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Institute name *</Text>
              <TextInput
                style={[styles.input, errors.course && styles.inputError]}
                value={educationData.course}
                onChangeText={(text) => setEducationData({...educationData, course: text})}
                placeholder="Enter your course"
              />
              {errors.course && <Text style={styles.errorText}>{errors.course}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Field of Study *</Text>
              <TextInput
                style={[styles.input, errors.field && styles.inputError]}
                value={educationData.field}
                onChangeText={(text) => setEducationData({...educationData, field: text})}
                placeholder="Enter your field of study"
              />
              {errors.field && <Text style={styles.errorText}>{errors.field}</Text>}
            </View>

            <View style={styles.dateContainer}>
              <View style={styles.dateField}>
                <Text style={styles.label}>Start Date *</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    setDateType('starting');
                    setShowDatePicker(true);
                  }}
                >
                  <Icon name="event" size={20} color="#6B7280" />
                  <Text style={styles.dateButtonText}>
                    {educationData.starting ? formatDate(educationData.starting) : 'Select Start Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateField}>
                <Text style={styles.label}>End Date *</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    setDateType('passOut');
                    setShowDatePicker(true);
                  }}
                >
                  <Icon name="event" size={20} color="#6B7280" />
                  <Text style={styles.dateButtonText}>
                    {educationData.passOut ? formatDate(educationData.passOut) : 'Select End Date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Grade/CGPA</Text>
              <TextInput
                style={styles.input}
                value={educationData.grade}
                onChangeText={(text) => setEducationData({...educationData, grade: text})}
                placeholder="Enter your grade or CGPA"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Certificate uploads removed as per requirement */}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Next: Experience Details</Text>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dateType === 'starting' ? educationData.starting || new Date() : educationData.passOut || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {renderEducationModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#134083',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  stepText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonText: {
    marginLeft: 8,
    color: '#134083',
    fontSize: 14,
  },
  certificateSection: {
    marginTop: 16,
  },
  certificateInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  certificateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  imageButton: {
    backgroundColor: '#6B7280',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  certificateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  certificateText: {
    color: '#fff',
    fontSize: 14,
  },
  certificateImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    height: 48,
  },
  dropdownButtonText: {
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  activeDropdownText: {
    color: '#134083',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
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
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: '50%',
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
    fontWeight: '500',
  },
});

export default EducationDetails; 