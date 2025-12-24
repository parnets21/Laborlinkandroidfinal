import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const CreateJob2 = ({ navigation, route }) => {
  const { jobData: previousData } = route.params;
  const [jobData, setJobData] = useState({
    ...previousData,
    skill: [],
    benefits: '',
    english: '',
    experience: '',
    interview: '',
    typeofjob: '',
    jobRoles: '',
    period: '',
    typeofwork: '',
    typeofeducation: '',
    education: '',
    experiencerequired: '',
    gendertype: '',
    typeofqualification: '',
    category: '',
    reason: '',
    time: '',
    whatsapp: '',
    interviewername: '',
  });

  // States for dropdown data
  const [jobRoles, setJobRoles] = useState([]);
  const [workModes, setWorkModes] = useState([]);
  const [educations, setEducations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Add interview types
  const interviewTypes = ['Virtual', 'In-Person', 'Hybrid'];

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      console.log('Fetching dropdown data...');
      const [
        jobRolesRes,
        workModesRes,
        educationsRes,
        skillsRes
      ] = await Promise.all([
        axios.get(`${BASE_URL}/api/user/job-roles`),
        axios.get(`${BASE_URL}/api/user/work-modes`),
        axios.get(`${BASE_URL}/api/user/educations`),
        axios.get(`${BASE_URL}/api/user/skills`)
      ]);

      // Log raw responses to see the actual data structure
      console.log('Raw API Responses:', {
        jobRoles: jobRolesRes.data,
        workModes: workModesRes.data, 
        educations: educationsRes.data,
        skills: skillsRes.data
      });

      // Transform job roles data
      if (jobRolesRes.data?.success) {
        const transformedRoles = jobRolesRes.data.data.map(role => ({
          id: role._id,
          name: role.jobRole,
          value: role.jobRole
        }));
        console.log('Transformed job roles:', transformedRoles);
        setJobRoles(transformedRoles);
      }

      // Transform work modes data
      if (workModesRes.data?.success) {
        const transformedModes = workModesRes.data.data.map(mode => ({
          id: mode._id,
          name: mode.workMode,
          value: mode.workMode
        }));
        console.log('Transformed work modes:', transformedModes);
        setWorkModes(transformedModes);
      }

      // Transform educations data
      if (educationsRes.data) {
        const transformedEducations = educationsRes.data.map(edu => ({
          id: edu._id,
          name: edu.qualification,
          value: edu.qualification
        }));
        console.log('Transformed educations:', transformedEducations);
        setEducations(transformedEducations);
      }

      // Transform skills data
      if (skillsRes.data?.success) {
        const transformedSkills = skillsRes.data.data.map(skill => ({
          id: skill._id,
          name: skill.skillName,
          value: skill.skillName
        }));
        console.log('Transformed skills:', transformedSkills);
        setSkills(transformedSkills);
      }

    } catch (error) {
      console.error('Error fetching dropdown data:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load some options. Please try again.');
    }
  };

  // Add this debug function to check the state values
  useEffect(() => {
    console.log('Current State Values:', {
      jobRoles,
      workModes,
      educations,
      skills,
      selectedSkills
    });
  }, [jobRoles, workModes, educations, skills, selectedSkills]);

  const handleSubmit = async () => {
    if (validateForm()) {
      const userData = await AsyncStorage.getItem('userData');
      const finalJobData = {
        ...route.params.jobData,
        // Add CreateJob2 specific fields
        skill: selectedSkills,
        english: jobData.english,
        experience: jobData.experience,
        interview: jobData.interview,
        typeofjob: jobData.typeofjob,
        jobRoles: jobData.jobRoles,
        period: jobData.period,
        typeofwork: jobData.typeofwork,
        typeofeducation: jobData.typeofeducation,
        education: jobData.education,
        experiencerequired: parseInt(jobData.experiencerequired) || 0,
        gendertype: jobData.gendertype,
        typeofqualification: jobData.typeofqualification,
        category: jobData.category,
        reason: jobData.reason,
        time: jobData.time,
        whatsapp: jobData.whatsapp,
        interviewername: jobData.interviewername,
        employerId:JSON.parse(userData)?._id
      };

      console.log('Final job data to be submitted:', finalJobData);

      // Call the onSubmit function passed from CreateJob
      if (route.params.onSubmit) {
        route.params.onSubmit(finalJobData);
      }
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'companyName',
      'companymobile',
      'companyindustry',
      'companytype',
      'department',
      'jobtitle',
      'description',
      'openings',
      'location',
      'minSalary',
      'maxSalary',
      // 'benefits',
      'requirements',
      'responsibilities',
      'locationDetails'
    ];
    
    const emptyFields = requiredFields.filter(field => !jobData[field]);
    if (emptyFields.length > 0) {
      Alert.alert('Error', `Please fill all required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    // Validate salary
    if (parseInt(jobData.minSalary) > parseInt(jobData.maxSalary)) {
      Alert.alert('Error', 'Minimum salary cannot be greater than maximum salary');
      return false;
    }

    // Validate mobile number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(jobData.companymobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }

    // Validate website if provided
    if (jobData.companywebsite) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlRegex.test(jobData.companywebsite)) {
        Alert.alert('Error', 'Please enter a valid website URL');
        return false;
      }
    }

    return true;
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
            {modalType === 'skills' ? 'Select Skills' : 
             modalType === 'workMode' ? 'Select Work Mode' :
             modalType === 'education' ? 'Select Education' :
             modalType === 'jobRoles' ? 'Select Job Role' :
             modalType === 'interviewType' ? 'Select Interview Type' :
             'Select Option'}
          </Text>
          <ScrollView style={styles.modalScroll}>
            {modalType === 'skills' && (
              <View style={styles.skillsContainer}>
                {skills.map((skill) => (
                  <TouchableOpacity
                    key={skill.id}
                    style={[
                      styles.skillChip,
                      selectedSkills.includes(skill.value) && styles.selectedSkillChip
                    ]}
                    onPress={() => {
                      if (selectedSkills.includes(skill.value)) {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill.value));
                      } else {
                        setSelectedSkills([...selectedSkills, skill.value]);
                      }
                    }}
                  >
                    <Text style={[
                      styles.skillChipText,
                      selectedSkills.includes(skill.value) && styles.selectedSkillChipText
                    ]}>
                      {skill.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {modalType === 'workMode' && workModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={styles.modalItem}
                onPress={() => {
                  setJobData({...jobData, typeofwork: mode.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{mode.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'education' && educations.map((edu) => (
              <TouchableOpacity
                key={edu.id}
                style={styles.modalItem}
                onPress={() => {
                  setJobData({...jobData, education: edu.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{edu.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'jobRoles' && jobRoles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={styles.modalItem}
                onPress={() => {
                  setJobData({...jobData, jobRoles: role.value});
                  setShowModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{role.name}</Text>
              </TouchableOpacity>
            ))}
            {modalType === 'interviewType' && interviewTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalItem}
                onPress={() => {
                  setJobData({...jobData, interview: type});
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a New Job (2/2)</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          {/* Job Requirements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Requirements</Text>

            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setModalType('jobRoles');
                setShowModal(true);
              }}
            >
              <Text style={styles.dropdownButtonText}>
                {jobData.jobRoles || 'Select Job Role *'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setModalType('skills');
                setShowModal(true);
              }}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedSkills.length > 0 
                  ? `Selected Skills (${selectedSkills.length})`
                  : 'Select Required Skills *'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles}>
             
              <TouchableOpacity
                style={[styles.dropdownButton, { flex: 1, marginLeft: -1 }]}
                onPress={() => {
                  setModalType('workMode');
                  setShowModal(true);
                }}
              >
                <Text style={styles.dropdownButtonText}>
                  {jobData.typeofwork || 'Work Type *'}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Experience Required (in years) *"
              value={jobData.experiencerequired}
              onChangeText={(text) => setJobData({...jobData, experiencerequired: text})}
              keyboardType="numeric"
              placeholderTextColor="#6B7280"
            />

            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setModalType('education');
                setShowModal(true);
              }}
            >
              <Text style={styles.dropdownButtonText}>
                {jobData.education || 'Education Required *'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setModalType('interviewType');
                setShowModal(true);
              }}
            >
              <Text style={styles.dropdownButtonText}>
                {jobData.interview || 'Select Interview Type *'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Interview Details (Location, Time, etc.)"
              value={jobData.interviewDetails}
              onChangeText={(text) => setJobData({...jobData, interviewDetails: text})}
              multiline
              placeholderTextColor="#6B7280"
            />
          </View>

          {/* Additional Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>

            {/* <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Benefits"
              value={jobData.benefits}
              onChangeText={(text) => setJobData({...jobData, benefits: text})}
              multiline
              numberOfLines={4}
              placeholderTextColor="#6B7280"
            /> */}

            {/* <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setModalType('english');
                setShowModal(true);
              }}
            > */}
              {/* <Text style={styles.dropdownButtonText}>
                {jobData.english || 'English Level Required'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#6B7280" />
            </TouchableOpacity> */}

            <TextInput
              style={styles.input}
              placeholder="Interviewer Name"
              value={jobData.interviewername}
              onChangeText={(text) => setJobData({...jobData, interviewername: text})}
               placeholderTextColor="#6B7280"
            />

            <TextInput
              style={styles.input}
              placeholder="WhatsApp Contact"
              value={jobData.whatsapp}
              onChangeText={(text) => setJobData({...jobData, whatsapp: text})}
              keyboardType="phone-pad"
               placeholderTextColor="#6B7280"
            />
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Post Job</Text>
            <Icon name="check" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#134083',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  skillChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  selectedSkillChip: {
    backgroundColor: '#134083',
  },
  skillChipText: {
    color: '#4B5563',
    fontSize: 14,
  },
  selectedSkillChipText: {
    color: '#fff',
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
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalItemText: {
    fontSize: 16,
    color: '#134083',
  },
});

export default CreateJob2; 