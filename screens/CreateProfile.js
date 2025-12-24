"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Modal } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import * as ImagePicker from 'react-native-image-picker'
import axios from 'axios'
import { BASE_URL } from '../constants/config'
import { Picker } from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CreateProfile = ({ navigation }) => {
  const [formData, setFormData] = useState({
    profile: null,
    fullName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    country: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    bio: '',
    companyType: '',
    industry: '',
    department: '',
    jobRole: '',
    workMode: '',
    gender: ''
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    companyTypes: [],
    departments: [],
    jobRoles: [],
    workModes: [],
    educationLevels: [],
    skills: []
  });

  // Predefined options
  const genderTypes = ['Male', 'Female', 'Any'];
  const englishLevels = ['Basic', 'Intermediate', 'Advanced', 'Native', 'Not Required'];
  const experienceLevels = ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

  // Fetch all options when component mounts
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      console.log('Fetching dropdown data...');
      const [
        companyTypesRes,
        departmentsRes,
        jobRolesRes,
        workModesRes,
        educationsRes,
        skillsRes
      ] = await Promise.all([
        axios.get(`${BASE_URL}/api/user/company-types`),
        axios.get(`${BASE_URL}/api/user/departments`),
        axios.get(`${BASE_URL}/api/user/job-roles`),
        axios.get(`${BASE_URL}/api/user/work-modes`),
        axios.get(`${BASE_URL}/api/user/educations`),
        axios.get(`${BASE_URL}/api/user/skills`)
      ]);

      console.log('API Responses:', {
        companyTypes: companyTypesRes.data,
        departments: departmentsRes.data,
        jobRoles: jobRolesRes.data,
        workModes: workModesRes.data,
        educations: educationsRes.data,
        skills: skillsRes.data
      });

      setOptions({
        companyTypes: companyTypesRes.data?.data?.map(type => ({
          id: type._id,
          name: type.type,
          value: type.type
        })) || [],
        departments: departmentsRes.data?.data?.map(dept => ({
          id: dept._id,
          name: dept.departmentName,
          value: dept.departmentName
        })) || [],
        jobRoles: jobRolesRes.data?.data?.map(role => ({
          id: role._id,
          name: role.jobRole,
          value: role.jobRole
        })) || [],
        workModes: workModesRes.data?.data?.map(mode => ({
          id: mode._id,
          name: mode.workMode,
          value: mode.workMode
        })) || [],
        educationLevels: educationsRes.data?.data?.map(edu => ({
          id: edu._id,
          name: edu.qualification,
          value: edu.qualification
        })) || [],
        skills: skillsRes.data?.data?.map(skill => ({
          id: skill._id,
          name: skill.skillName,
          value: skill.skillName
        })) || []
      });
    } catch (error) {
      console.error('Error fetching options:', error);
      Alert.alert('Error', 'Failed to load form options');
    }

  };

  

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.companyType) newErrors.companyType = 'Company type is required';

    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.jobRole) newErrors.jobRole = 'Job role is required';
    if (!formData.workMode) newErrors.workMode = 'Work mode is required';
    
    setErrors(newErrors);
    console.log(newErrors,"create profile error")
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async () => {
    console.log("Validating form...");
    if (validateForm()) {
      setLoading(true);
      try {
        // Create the profile data object
        const profileDataToSave = {
          profile: formData.profile,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          location: formData.location || '',
          country: formData.country || '',
          street: formData.street || '',
          city: formData.city || '',
          state: formData.state || '',
          pincode: formData.pincode || '',
          bio: formData.bio || '',
          gender: formData.gender || '',
          workMode: formData.workMode,
          jobRole: formData.jobRole,
          department: formData.department,
          industry: formData.industry,
          companyType: formData.companyType
        };

        console.log('Saving profile data to AsyncStorage:', profileDataToSave);
        
        // Store the profile data
        await AsyncStorage.setItem('profileData', JSON.stringify(profileDataToSave));
        
        // Verify data was saved
        const savedData = await AsyncStorage.getItem('profileData');
        console.log('Verified saved profile data:', savedData);
        
        // Navigate to Education Details screen
        navigation.navigate('EducationDetails', { 
          userData: profileDataToSave
        });
      } catch (error) {
        console.error('Error saving profile data:', error);
        Alert.alert('Error', 'Failed to save profile data');
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Form validation failed');
    }
  };

  const handleImagePicker = () => {
    const options = {
      maxWidth: 1024,
      maxHeight: 1024,
      mediaType: 'photo',
      quality: 0.7,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) return;

      const selectedImage = response.assets[0];
      if (!selectedImage.type.includes('jpeg') && !selectedImage.type.includes('jpg')) {
        Alert.alert('Invalid Format', 'Please upload a JPEG/JPG image');
        return;
      }

      if (selectedImage.fileSize > 5 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profile: selectedImage.uri
      }));
    });
  };

  const renderModal = () => (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {
             modalType === 'companyType' ? 'Select Company Type' :
             modalType === 'department' ? 'Select Department' :
             modalType === 'jobRole' ? 'Select Job Role' :
             modalType === 'workMode' ? 'Select Work Mode' :
             modalType === 'education' ? 'Select Education Level' :
             modalType === 'english' ? 'Select English Level' :
             modalType === 'experience' ? 'Select Experience Level' :
             modalType === 'gender' ? 'Select Gender' :
             'Select Option'}
          </Text>
          <ScrollView style={styles.modalScroll}>
            {modalType === 'companyType' && options.companyTypes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.modalItem}
                onPress={() => {
                  setFormData({...formData, companyType: item.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'department' && options.departments.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.modalItem}
                onPress={() => {
                  setFormData({...formData, department: item.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'jobRole' && options.jobRoles.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.modalItem}
                onPress={() => {
                  setFormData({...formData, jobRole: item.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'workMode' && options.workModes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.modalItem}
                onPress={() => {
                  setFormData({...formData, workMode: item.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'education' && options.educationLevels.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.modalItem}
                onPress={() => {
                  setFormData({...formData, education: item.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'english' && englishLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={styles.modalItem}
                onPress={() => {
                  setFormData({...formData, english: level});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{level}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'experience' && experienceLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={styles.modalItem}
                onPress={() => {
                  setFormData({...formData, experience: level});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{level}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'gender' && genderTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalItem}
                onPress={() => {
                  setFormData({...formData, gender: type});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  console.log(formData,"fffffeascascacfwwdc")

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Create Profile</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '25%' }]} />
            </View>
            <Text style={styles.stepText}>Step 1 of 4: Basic Details</Text>
          </View>
      </View>
      </View>

      <ScrollView style={styles.content}>
        {/* <View style={styles.imageUploadSection}>
          <TouchableOpacity 
            style={styles.imageUploadContainer}
            onPress={handleImagePicker}
          >
            {formData.profile ? (
              <Image
                source={{ uri: formData.profile }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Icon name="add-a-photo" size={32} color="#6B7280" />
                <Text style={styles.uploadText}>Add Profile Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View> */}

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
          <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name*</Text>
            <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
              value={formData.fullName}
              onChangeText={(text) => setFormData({...formData, fullName: text})}
                placeholder="Enter your full name"
                 placeholderTextColor="#9CA3AF"
            />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address*</Text>
            <TextInput
                style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              keyboardType="email-address"
               placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
            />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number*</Text>
            <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Enter your phone number"
               placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
            />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password*</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                placeholder="Enter your password"
                 placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password*</Text>
            <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                placeholder="Confirm your password"
                 placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Company Type*</Text>
              <View style={[styles.pickerContainer, errors.companyType && styles.inputError]}
              >
                <Picker
                  selectedValue={formData.companyType}
                  onValueChange={(value) => setFormData({...formData, companyType: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Company Type" value="" />
                  {options.companyTypes.map((type, index) => (
                    <Picker.Item key={index} label={type.name} value={type.name} />
                  ))}
                </Picker>
              </View>
              {errors.companyType && <Text style={styles.errorText}>{errors.companyType}</Text>}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Department*</Text>
              <View style={[styles.pickerContainer, errors.department && styles.inputError]}>
                <Picker
                  selectedValue={formData.department}
                  onValueChange={(value) => setFormData({...formData, department: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Department" value="" />
                  {options.departments.map((dept, index) => (
                    <Picker.Item key={index} label={dept.name} value={dept.name} />
                  ))}
                </Picker>
              </View>
              {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Job Role*</Text>
              <View style={[styles.pickerContainer, errors.jobRole && styles.inputError]}>
                <Picker
                  selectedValue={formData.jobRole}
                  onValueChange={(value) => setFormData({...formData, jobRole: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Job Role" value="" />
                  {options.jobRoles.map((role, index) => (
                    <Picker.Item key={index} label={role.name} value={role.name} />
                  ))}
                </Picker>
              </View>
              {errors.jobRole && <Text style={styles.errorText}>{errors.jobRole}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Work Mode*</Text>
              <View style={[styles.pickerContainer, errors.workMode && styles.inputError]}>
                <Picker
                  selectedValue={formData.workMode}
                  onValueChange={(value) => setFormData({...formData, workMode: value})}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Work Mode" value="" />
                  {options.workModes.map((mode, index) => (
                    <Picker.Item key={index} label={mode.name} value={mode.name} />
                  ))}
                </Picker>
              </View>
              {errors.workMode && <Text style={styles.errorText}>{errors.workMode}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            <View style={styles.inputContainer}>
            <Text style={styles.label}>Country</Text>
            <TextInput
                style={[styles.input, ]}
                value={formData.country}
                onChangeText={(text) => setFormData({...formData, country: text})}
                placeholder="Enter Your country"
                 placeholderTextColor="#9CA3AF"
              />
               <Text style={styles.label}>City</Text>
            <TextInput
                style={[styles.input, ]}
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
                placeholder="Enter Your City"
                 placeholderTextColor="#9CA3AF"
              />
               <Text style={styles.label}>Address</Text>
            <TextInput
                style={[styles.input, ]}
                value={formData.location}
                onChangeText={(text) => setFormData({...formData, location: text})}
                placeholder="Enter Your Address"
                 placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
              <Text style={styles.label}>Bio</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({...formData, bio: text})}
                placeholder="Tell us about yourself"
                 placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Next: Education Details</Text>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {renderModal()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
  },
  form: {
    gap: 8,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
  picker: {
    height: 50,
    color: '#000',
  },
  skillsInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  addSkillButton: {
    backgroundColor: '#134083',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#134083',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  skillChipText: {
    color: '#fff',
    fontSize: 14,
  },
  imageUploadSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F3F4F6',
  },
  imageUploadContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#6B7280',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#134083',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  activeDropdownText: {
    color: '#134083',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalItemText: {
    fontSize: 16,
    color: '#134083',
  },
  modalCloseButton: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skillsSection: {
    marginTop: 16,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
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
    backgroundColor: '#134083',
    borderRadius: 2,
  },
  stepText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});

export default CreateProfile;

