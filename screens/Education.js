import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProfile } from '../context/ProfileContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const Education = ({ navigation }) => {
  const { profileData, updateProfileData } = useProfile();
  
  // State for date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('');
  const [datePickerIndex, setDatePickerIndex] = useState(0);
  const [tempDate, setTempDate] = useState(new Date());
  
  const [educationList, setEducationList] = useState([
    {
      instituteName: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      grade: '',
    }
  ]);

  const handleAddEducation = () => {
    if (educationList.length < 3) {
      setEducationList([
        ...educationList,
        {
          instituteName: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          grade: '',
        }
      ]);
    } else {
      Alert.alert('Maximum Limit', 'You can add up to 3 education entries');
    }
  };

  const handleRemoveEducation = (index) => {
    if (educationList.length > 1) {
      const newList = educationList.filter((_, i) => i !== index);
      setEducationList(newList);
    }
  };

  const handleInputChange = (index, field, value) => {
    const newList = [...educationList];
    newList[index][field] = value;
    setEducationList(newList);
  };

  // Function to open date picker
  const openDatePicker = (index, mode) => {
    setDatePickerIndex(index);
    setDatePickerMode(mode);
    setTempDate(new Date());
    setShowDatePicker(true);
  };

  // Function to handle date selection
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    setShowDatePicker(Platform.OS === 'ios');
    setTempDate(currentDate);
    
    if (selectedDate && Platform.OS === 'android') {
      updateDate(currentDate);
    }
  };

  // Function to update date in education list
  const updateDate = (date) => {
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const newList = [...educationList];
    newList[datePickerIndex][datePickerMode] = formattedDate;
    setEducationList(newList);
    setShowDatePicker(false);
  };

  const validateEducation = () => {
    for (let edu of educationList) {
      if (!edu.instituteName || !edu.degree || !edu.startDate) {
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    try {
      if (!validateEducation()) {
        Alert.alert('Error', 'Please fill all required fields (Institute, Degree, Start Date)');
        return;
      }

      // Update profile data with education information
      await updateProfileData({
        ...profileData,
        education: educationList,
        registrationStep: 2
      });

      // Navigate to Experience Details
      navigation.navigate('ExperienceDetails');
    } catch (error) {
      Alert.alert('Error', 'Failed to save education details');
      console.error('Error saving education:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Education hihih Details</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '66%' }]} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Education Information</Text>
        <Text style={styles.subtitle}>Add your educational background</Text>

        {educationList.map((education, index) => (
          <View key={index} style={styles.educationCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Education {index + 1}</Text>
              {educationList.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveEducation(index)}>
                  <Icon name="delete" size={24} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Institute Name*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter institute name"
                value={education.instituteName}
                onChangeText={(text) => handleInputChange(index, 'instituteName', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Degree*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter degree"
                value={education.degree}
                onChangeText={(text) => handleInputChange(index, 'degree', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Field of Study</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter field of study"
                value={education.field}
                onChangeText={(text) => handleInputChange(index, 'field', text)}
              />
            </View>

            <View style={styles.dateContainer}>
              <View style={styles.dateInput}>
                <Text style={styles.label}>Start Date*</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => openDatePicker(index, 'startDate')}
                >
                  <Text style={[
                    styles.datePickerText,
                    !education.startDate && styles.placeholderText
                  ]}>
                    {education.startDate || 'Select Date'}
                  </Text>
                  <Icon name="calendar-today" size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateInput}>
                <Text style={styles.label}>End Date</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => openDatePicker(index, 'endDate')}
                >
                  <Text style={[
                    styles.datePickerText,
                    !education.endDate && styles.placeholderText
                  ]}>
                    {education.endDate || 'Select Date'}
                  </Text>
                  <Icon name="calendar-today" size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Grade/CGPA</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter grade or CGPA"
                value={education.grade}
                onChangeText={(text) => handleInputChange(index, 'grade', text)}
              />
            </View>
          </View>
        ))}

        {educationList.length < 3 && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddEducation}>
            <Icon name="add" size={24} color="#4B6BFB" />
            <Text style={styles.addButtonText}>Add Another Education</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker for iOS */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.pickerHeader}>
                <Button title="Cancel" onPress={() => setShowDatePicker(false)} />
                <Button title="Done" onPress={() => updateDate(tempDate)} />
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={tempDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#134083',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4B6BFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#134083',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  educationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
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
    backgroundColor: '#fff',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#4B6BFB',
    borderRadius: 8,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#4B6BFB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#134083',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});

export default Education; 