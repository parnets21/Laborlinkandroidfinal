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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUGGESTED_SKILLS = [
  'Communication',
  'Customer Service',
  'Sales',
  'Marketing',
  'Management',
  'Leadership',
  'Problem Solving',
  'Team Work',
  'Time Management',
  'Microsoft Office',
  'Data Entry',
  'Computer Skills',
  'Administrative',
  'Project Management',
  'Analytical Skills',
];

const SkillsAndPreferences = ({ navigation, route }) => {
  const { userData: initialUserData } = route.params;

  const [userData, setUserData] = useState(initialUserData);
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [resume, setResume] = useState(null);
  const [preferences, setPreferences] = useState({
    preferredLocation: '',
    preferredSalary: {
      min: '',
      max: ''
    }
  });

  useEffect(() => {
    console.log('Received userData:', userData);
    fetchSkills();
  }, []);

  console.log(userData,".............................")

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user/skills`);
      console.log('Skills API response:', response.data);

      if (Array.isArray(response.data)) {
        const skills = response.data.map(skill => skill.skillName);
        setAvailableSkills(skills);
      } else if (response.data?.data) {
        const skills = response.data.data.map(skill => skill.skillName);
        setAvailableSkills(skills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      Alert.alert('Error', 'Failed to load skills');
    }
  };

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, skill]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 10 skills');
    }
  };

  const handleAddCustomSkill = () => {
    if (!customSkill.trim()) return;
    if (selectedSkills.length >= 10) {
      Alert.alert('Limit Reached', 'You can select up to 10 skills');
      return;
    }
    if (!selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const pickResume = async () => {
    try {
      const storedProfileData = await AsyncStorage.getItem('profileData');
      const parsedProfileData = storedProfileData ? JSON.parse(storedProfileData) : userData;

      console.log('Retrieved profile data in EducationDetails:', parsedProfileData);

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      if (result[0]) {
        const formData = new FormData();
        formData.append('userId', userData._id);
        formData.append('resume', {
          uri: result[0].uri,
          type: result[0].type,
          name: result[0].name,
        });

        const response = await axios.put(
          `${BASE_URL}/api/user/updateResume/${userData._id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success) {
          // Update local state
          setUserData({
            ...userData,
            resume: response.data.data.resume
          });

          // Update AsyncStorage
          await AsyncStorage.setItem('userData', JSON.stringify({
            ...userData,
            resume: response.data.data.resume
          }));

          Alert.alert('Success', 'Resume uploaded successfully');
        }
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        return;
      }
      console.error('Error uploading resume:', error);
      Alert.alert('Error', 'Failed to upload resume');
    }
  };
  const handleSubmit = async () => {
    if (selectedSkills.length === 0) {
      Alert.alert('Error', 'Please select at least one skill');
      return;
    }

    try {
      setLoading(true);

      // Get the stored profile data
      const storedProfileData = await AsyncStorage.getItem('profileData');
      console.log('Raw stored profile data:', storedProfileData);

      if (!storedProfileData) {
        console.error('No profile data found in AsyncStorage');

        // Try to use the data from route params as fallback
        if (userData && userData.fullName) {
          console.log('Using userData from route params as fallback:', userData);
        } else {
          Alert.alert('Error', 'Profile data not found. Please complete previous steps first.');
          setLoading(false);
          return;
        }
      }

      // Use either stored data or route params
      const parsedProfileData = storedProfileData ? JSON.parse(storedProfileData) : userData;
      console.log('Parsed profile data:', parsedProfileData);

      // Create the final registration data
      const finalUserData = {
        // Basic Info
        fullName: parsedProfileData.fullName,
        email: parsedProfileData.email,
        phone: Number(parsedProfileData.phone),
        password: parsedProfileData.password,

        // Additional Info
        location: parsedProfileData.location || '',
        country: parsedProfileData.country || '',
        state: parsedProfileData.state || '',
        city: parsedProfileData.city || '',
        street: parsedProfileData.street || '',
        pincode: parsedProfileData.pincode ? Number(parsedProfileData.pincode) : '',
        bio: parsedProfileData.bio || '',
        address: parsedProfileData.address || '',

        // Profile and Work Related
        profile: parsedProfileData.profile,
        workMode: parsedProfileData.workMode,
        jobRole: parsedProfileData.jobRole,
        department: parsedProfileData.department,
        companyType: parsedProfileData.companyType,

        // Education
        education: parsedProfileData.education,

        // Work Experience
        workExperience: parsedProfileData.workExperience || false,
        experiences: parsedProfileData.experiences,

        // Skills and Preferences
        skills: selectedSkills,
        preferredLocation: preferences.preferredLocation || '',
        preferredSalary: {
          min: Number(preferences.preferredSalary.min) || 0,
          max: Number(preferences.preferredSalary.max) || 0
        },

        // Resume
        resume: resume ? resume.uri : null,

        // Additional fields
        jobType: parsedProfileData.jobType || ''
      };

      console.log('Final registration data:', finalUserData);

      // Validate required fields
      if (!finalUserData.fullName || !finalUserData.email || !finalUserData.phone || !finalUserData.password) {
        console.error('Missing required fields:', {
          fullName: finalUserData.fullName,
          email: finalUserData.email,
          phone: finalUserData.phone,
          password: finalUserData.password
        });
        Alert.alert(
          'Error',
          'Required information is missing. Please go back to Create Profile and ensure all required fields are filled:\n\n' +
          '- Full Name\n' +
          '- Email\n' +
          '- Phone\n' +
          '- Password'
        );
        setLoading(false);
        return;
      }

      // Register user with all data
      console.log('Sending registration request to:', `${BASE_URL}/api/user/register`);
      const response = await axios.post(`${BASE_URL}/api/user/register`, finalUserData);
      console.log('Registration response:', response.data);

      if (response.data.success) {
        // Create a minimal user object to store
        const userDataToStore = {
          id: response.data.userId,
          ...finalUserData
        };

        // Store the user data and success message
        await AsyncStorage.setItem('userData', JSON.stringify(userDataToStore));

        // No token in response, so we'll skip token storage

        // Clear registration data
        await AsyncStorage.removeItem('profileData');

        // Show success message
        Alert.alert(
          'Success',
          'Registration successful!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to dashboard
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);

      // Get detailed error information
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed. Please check all required fields.';

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Skills & Preferences</Text>
        <Text style={styles.stepIndicator}>Step 4 of 4</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Skills</Text>
          <Text style={styles.sectionSubtitle}>Choose up to 10 skills</Text>

          <View style={styles.skillsContainer}>
            {availableSkills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillChip,
                  selectedSkills.includes(skill) && styles.selectedSkillChip
                ]}
                onPress={() => handleSkillToggle(skill)}
              >
                <Text style={[
                  styles.skillChipText,
                  selectedSkills.includes(skill) && styles.selectedSkillChipText
                ]}>
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customSkillContainer}>
            <TextInput
              style={styles.customSkillInput}
              value={customSkill}
              onChangeText={setCustomSkill}
              placeholder="Add custom skill"
              onSubmitEditing={handleAddCustomSkill}
            />
            <TouchableOpacity
              style={styles.addSkillButton}
              onPress={handleAddCustomSkill}
            >
              <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Preferences</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preferred Location</Text>
            <TextInput
              style={styles.input}
              value={preferences.preferredLocation}
              onChangeText={(text) => setPreferences({
                ...preferences,
                preferredLocation: text
              })}
              placeholder="Enter preferred location"
            />
          </View>

          <Text style={styles.label}>Expected Salary Range</Text>
          <View style={styles.salaryContainer}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <TextInput
                style={styles.input}
                value={preferences.preferredSalary.min}
                onChangeText={(text) => setPreferences({
                  ...preferences,
                  preferredSalary: { ...preferences.preferredSalary, min: text }
                })}
                placeholder="Min"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                value={preferences.preferredSalary.max}
                onChangeText={(text) => setPreferences({
                  ...preferences,
                  preferredSalary: { ...preferences.preferredSalary, max: text }
                })}
                placeholder="Max"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume (Optional)</Text>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={pickResume}
          >
            <Icon name="upload-file" size={24} color="#2563EB" />
            <Text style={styles.resumeButtonText}>
              {resume ? resume.name : 'Upload Resume (PDF)'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Complete Registration</Text>
              <Icon name="check" size={20} color="#fff" />
            </>
          )}
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    margin: 4,
  },
  selectedSkillChip: {
    backgroundColor: '#1E293B',
  },
  skillChipText: {
    color: '#4B5563',
    fontSize: 14,
    width: '300',
  },
  selectedSkillChipText: {
    color: '#fff',
  },
  customSkillContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  customSkillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addSkillButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
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
  salaryContainer: {
    flexDirection: 'row',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  resumeButtonText: {
    color: '#2563EB',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default SkillsAndPreferences; 