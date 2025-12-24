import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import * as ImagePicker from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { Linking, Platform } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SubscriptionValidationService from '../services/subscriptionValidationService';


const Profile = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  console.log("userData", userData);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [resume, setResume] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    bio: '',
    education: []
  });
  const [upgradeInfo, setUpgradeInfo] = useState(null);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);



const handleProfilePicture = () => {
  Alert.alert(
    'Update Profile Picture',
    'Choose an option',
    [
      {
        text: 'Take a Selfie',
        onPress: () => openCamera(),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => openGallery(),
      },
      { text: 'Cancel', style: 'cancel' },
    ],
    { cancelable: true }
  );
};

const openCamera = async () => {
  try {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (!result.didCancel && result.assets && result.assets[0]) {
      await uploadProfileImage(result.assets[0]);
    }
  } catch (error) {
    console.error('Camera error:', error);
  }
};

const openGallery = async () => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (!result.didCancel && result.assets && result.assets[0]) {
      await uploadProfileImage(result.assets[0]);
    }
  } catch (error) {
    console.error('Gallery error:', error);
  }
};

const uploadProfileImage = async (asset) => {
  try {
    const formData = new FormData();
    formData.append('userId', userData._id);
    formData.append('profile', {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || 'profile.jpg',
    });

    const response = await axios.put(
      `${BASE_URL}/api/user/updateProfileImg/${userData._id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      const updatedUser = {
        ...userData,
        profile: response.data.data.profile,
      };

      setUserData(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile picture updated successfully 👤',
      });
    }
  } catch (error) {
    console.error('Error updating profile picture:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to update profile picture 😞',
    });
  }
};


  const fetchUserProfile = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedProfileData = await AsyncStorage.getItem('profileData');
      if (!storedUserData) {
        throw new Error('No user data found');
      }

      const parsedUserData = JSON.parse(storedUserData);
      const parsedUserData1 = JSON.parse(storedProfileData);
      console.log('Stored user data:', parsedUserData);
      console.log('Stored profile data:', parsedUserData1);

      // Set the user data directly from AsyncStorage
      setUserData(parsedUserData);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.multiRemove([
                  'userData',
                  'token',
                  'profileData'
                ]);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              } catch (error) {
                console.error('Error during logout:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in logout process:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // ✅ Move menuItems below handleLogout
  const menuItems = [
    { icon: 'settings', title: 'Settings', action: () => navigation.navigate('Settings') },
    // { icon: 'help-outline', title: 'Help & Support', action: () => navigation.navigate('HelpSupport') },
    {
      icon: 'help-outline',
      title: 'Help & Support',
      action: () => {
        Alert.alert(
          'Help & Support',
          'You can reach us via email for now. We’re working on more support options soon.',
          [{ text: 'OK' }]
        );
      }
    }, 
    {
      icon: 'help-outline',
      title: 'PrivacyPolicy',
    action: () => navigation.navigate('Privacy')
    },
    { icon: 'logout', title: 'Logout', action: handleLogout },
  ];


  // const handleProfilePicture = async () => {
  //   try {
  //     const result = await ImagePicker.launchImageLibrary({
  //       mediaType: 'photo',
  //       quality: 0.8,
  //       includeBase64: false,
  //     });

  //     if (!result.didCancel && result.assets && result.assets[0]) {
  //       const formData = new FormData();
  //       formData.append('userId', userData._id);
  //       formData.append('profile', {
  //         uri: result.assets[0].uri,
  //         type: result.assets[0].type || 'image/jpeg',
  //         name: result.assets[0].fileName || 'profile.jpg',
  //       });

  //       const response = await axios.put(
  //         `${BASE_URL}/api/user/updateProfileImg/${userData._id}`,
  //         formData,
  //         {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //           },
  //         }
  //       );

  //       if (response.data.success) {
  //         setUserData({
  //           ...userData,
  //           profile: response.data.data.profile,
  //         });

  //         await AsyncStorage.setItem(
  //           'userData',
  //           JSON.stringify({
  //             ...userData,
  //             profile: response.data.data.profile,
  //           })
  //         );

  //         Toast.show({
  //           type: 'success',
  //           text1: 'Success',
  //           text2: 'Profile picture updated successfully 👤',
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error updating profile picture:', error);
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: 'Failed to update profile picture 😞',
  //     });
  //   }
  // };


  // const handleResumeUpload = async () => {
  //   try {
  //     const result = await DocumentPicker.pick({
  //       type: [DocumentPicker.types.pdf],
  //     });

  //     if (result[0]) {
  //       const formData = new FormData();
  //       formData.append('userId', userData._id);
  //       formData.append('resume', {
  //         uri: result[0].uri,
  //         type: result[0].type,
  //         name: result[0].name,
  //       });

  //       const response = await axios.put(
  //         `${BASE_URL}/api/user/updateResume/${userData._id}`, 
  //         formData,
  //         {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //           },
  //         }
  //       );

  //       if (response.data.success) {
  //         // Update local state
  //         setUserData({
  //           ...userData,
  //           resume: response.data.data.resume
  //         });

  //         // Update AsyncStorage
  //         await AsyncStorage.setItem('userData', JSON.stringify({
  //           ...userData,
  //           resume: response.data.data.resume
  //         }));
  //         Toast.show({
  //           type: 'success',
  //           text1: 'Success',
  //           text2: 'Resume uploaded successfully',
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     if (DocumentPicker.isCancel(error)) {
  //       return;
  //     }
  //     console.error('Error uploading resume:', error);
  //     Alert.alert('Error', 'Failed to upload resume');
  //   }
  // };


  //   const handleViewResume = async (resumeUrl) => {
  //   try {
  //     if (!resumeUrl) {
  //       Alert.alert('Error', 'No resume available to view');
  //       return;
  //     }

  //     // For Android and iOS, we'll try to download and open the file locally
  //     if (Platform.OS === 'ios' || Platform.OS === 'android') {
  //       // Create a local file path to save the PDF
  //       const localFile = `${RNFS.DocumentDirectoryPath}/resume.pdf`;

  //       // Show loading indicator
  //       setIsLoading(true);

  //       // Download the file
  //       const options = {
  //         fromUrl: resumeUrl,
  //         toFile: localFile,
  //       };

  //       // Download the file
  //       const response = await RNFS.downloadFile(options).promise;

  //       if (response.statusCode === 200) {
  //         // Open the file with the default viewer
  //         await FileViewer.open(localFile, { showOpenWithDialog: true });
  //       } else {
  //         // If download fails, try opening in browser
  //         await Linking.openURL(resumeUrl);
  //       }
  //     } else {
  //       // For web or other platforms, open in browser
  //       await Linking.openURL(resumeUrl);
  //     }
  //   } catch (error) {
  //     console.error('Error viewing resume:', error);

  //     // Fallback to opening in browser if file viewing fails
  //     try {
  //       await Linking.openURL(resumeUrl);
  //     } catch (linkError) {
  //       Alert.alert('Error', 'Unable to open the resume. Please try again later.');
  //     }
  //   } finally {
  //     // Hide loading indicator if you're using one
  //     if (typeof setIsLoading === 'function') {
  //       setIsLoading(false);
  //     }
  //   }
  // };
  const handleResumeUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images,
          DocumentPicker.types.plainText, // to support .txt
          DocumentPicker.types.doc,       // .doc
          DocumentPicker.types.docx       // .docx
        ],
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

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Resume uploaded successfully',
          });
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


  const handleViewResume = async (resumeUrl) => {
    try {
      if (!resumeUrl) {
        Alert.alert('Error', 'No resume available to view');
        return;
      }

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        setIsLoading(true);

        // Extract filename and extension from URL
        const fileName = resumeUrl.split('/').pop(); // e.g., resume.pdf, resume.jpg
        const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;

        const options = {
          fromUrl: resumeUrl,
          toFile: localFile,
        };

        const response = await RNFS.downloadFile(options).promise;

        if (response.statusCode === 200) {
          try {
            await FileViewer.open(localFile, { showOpenWithDialog: true });
          } catch (viewError) {
            console.error('FileViewer error:', viewError);
            // fallback to open in browser
            await Linking.openURL(resumeUrl);
          }
        } else {
          console.error('Download failed, opening in browser');
          await Linking.openURL(resumeUrl);
        }
      } else {
        // Web or other platforms
        await Linking.openURL(resumeUrl);
      }
    } catch (error) {
      console.error('Error viewing resume:', error);

      try {
        await Linking.openURL(resumeUrl);
      } catch (linkError) {
        Alert.alert('Error', 'Unable to open the resume. Please try again later.');
      }
    } finally {
      if (typeof setIsLoading === 'function') {
        setIsLoading(false);
      }
    }
  };
  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      setUpgradeInfo(null);
      const userId = userData?._id;
      console.log("USS", userId);

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('fullName', editData.fullName);
      formData.append('bio', editData.bio);
      formData.append('education', JSON.stringify(editData.education));

      // Validate profile update limit before submit
      try {
        const actionsData = await SubscriptionValidationService.getAvailableActions(userId);
        const restricted = actionsData?.restrictedActions || {};
        const subscription = actionsData?.subscription || {};
        const limits = subscription?.limits || {};
        const usage = actionsData?.usage || {};
        if (restricted.profile_update && restricted.profile_update.allowed === false) {
          setUpgradeInfo({
            title: 'Profile update limit reached',
            message: restricted.profile_update.message || 'Please upgrade your plan to update your profile further this month.',
            monthlyLimit: limits.profileUpdatesPerMonth,
            monthlyUsed: usage.profileUpdatesPerMonth || 0
          });
          setLoading(false);
          return;
        }
        const mLimit = limits.profileUpdatesPerMonth;
        const mUsed = usage.profileUpdatesPerMonth || 0;
        if (typeof mLimit === 'number' && mUsed >= mLimit) {
          setUpgradeInfo({
            title: 'Profile update limit reached',
            message: 'You have reached your monthly profile update limit.',
            monthlyLimit: mLimit,
            monthlyUsed: mUsed
          });
          setLoading(false);
          return;
        }
      } catch {}

      const response = await axios.put(`${BASE_URL}/api/user/editUser/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Update local state
        setUserData({
          ...userData,
          fullName: editData.fullName,
          bio: editData.bio,
          education: editData.education
        });
        setIsEditing(false);

        // Update AsyncStorage
        const updatedUserData = {
          ...userData,
          fullName: editData.fullName,
          bio: editData.bio,
          education: editData.education
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

        // Alert.alert('Success', 'Profile updated successfully');
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Profile updated successfully',
        });

        // Record usage on success
        try {
          await SubscriptionValidationService.recordUsage('profile_update', userId);
        } catch {}
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEducationEdit = (index, field, value) => {
    const newEducation = [...editData.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setEditData({
      ...editData,
      education: newEducation
    });
  };

  const handleAddEducation = async (educationData) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/AddEducation`, {
        userId: userData._id,
        education: educationData
      });

      if (response.data.success) {
        // Update local state
        setUserData({
          ...userData,
          education: response.data.data
        });

        // Update AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify({
          ...userData,
          education: response.data.data
        }));

        Alert.alert('Success', 'Education added successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error adding education:', error);
      Alert.alert('Error', 'Failed to add education');
    }
  };

  const handleRemoveEducation = async (educationId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/removeEducation/${userData._id}/${educationId}`);

      if (response.data.success) {
        // Update local state
        setUserData({
          ...userData,
          education: response.data.data
        });

        // Update AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify({
          ...userData,
          education: response.data.data
        }));

        Alert.alert('Success', 'Education removed successfully');
      }
    } catch (error) {
      console.error('Error removing education:', error);
      Alert.alert('Error', 'Failed to remove education');
    }
  };

  const handleAddSkill = async (skill) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/addsKill`, {
        userId: userData._id,
        skill: skill
      });

      if (response.data.success) {
        // Update local state
        setUserData({
          ...userData,
          skills: response.data.data
        });

        // Update AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify({
          ...userData,
          skills: response.data.data
        }));

        Alert.alert('Success', 'Skill added successfully');
        setIsAddingSkill(false);
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      Alert.alert('Error', 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/removeSkill/${userData._id}/${skillId}`);

      if (response.data.success) {
        // Update local state
        setUserData({
          ...userData,
          skills: response.data.data
        });

        // Update AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify({
          ...userData,
          skills: response.data.data
        }));

        Alert.alert('Success', 'Skill removed successfully');
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      Alert.alert('Error', 'Failed to remove skill');
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.infoCard}>
          <InfoItem icon="person" label="Full Name" value={userData?.fullName} />
          <InfoItem icon="email" label="Email" value={userData?.email} />
          <InfoItem icon="phone" label="Phone" value={userData?.phone?.toString()} />
          {/* <InfoItem icon="location-on" label="Location" value={userData?.location} /> */}
          <InfoItem icon="business" label="City" value={userData?.city || 'Not specified'} />
          <InfoItem icon="public" label="Country" value={userData?.country || 'Not specified'} />
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <View style={styles.infoCard}>
          <Text style={styles.bioText}>{userData?.bio || 'No bio available'}</Text>
        </View>
      </View>

      {/* Education Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Education</Text>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            {/* <Icon name="add" size={24} color="#4F46E5" /> */}
          </TouchableOpacity>
        </View>
        {userData?.education?.map((edu, index) => (
          <View key={index} style={styles.educationCard}>
            <View style={styles.eduHeader}>
              <Text style={styles.eduTitle}>{edu.course} in {edu.field}</Text>
              <TouchableOpacity onPress={() => handleRemoveEducation(edu._id)}>
                {/* <Icon name="delete-outline" size={20} color="#EF4444" /> */}
              </TouchableOpacity>
            </View>
            <Text style={styles.eduInstitute}>{edu.institute}</Text>
            <Text style={styles.eduYear}>{edu.starting} - {edu.passOut}</Text>
            {edu.grade && (
              <Text style={styles.eduGrade}>Grade: {edu.grade}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Resume Section with Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <TouchableOpacity onPress={handleResumeUpload}>
            <Icon name="upload-file" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>
        {userData?.resume ? (
          <View style={styles.resumeCard}>
            <View style={styles.resumePreview}>
              <Icon name="description" size={32} color="#4F46E5" />
              <View style={styles.resumeInfo}>
                <Text style={styles.resumeName}>
                  {userData?.resume ? userData.resume.split("/").pop() : "No resume uploaded"}
                </Text>
                <Text style={styles.resumeDate}>
                  Last Uploaded on {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : "N/A"}
                </Text>
              </View>

            </View>
            <View style={styles.resumeActions}>
              <TouchableOpacity
                style={styles.resumeButton}
                onPress={() => {
                  console.log('Opening resume:', userData.resume);
                  handleViewResume(userData.resume);
                }}
              >
                <Icon name="visibility" size={20} color="#4F46E5" />
                <Text style={styles.resumeButtonText}>View Your Resume</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity 
                style={[styles.resumeButton, styles.resumeDeleteButton]}
                // onPress={handleRemoveResume}
              >
                <Icon name="delete-outline" size={20} color="#EF4444" />
                <Text style={[styles.resumeButtonText, styles.resumeDeleteText]}>
                  Remove
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleResumeUpload}
          >
            <Icon name="upload-file" size={32} color="#4F46E5" />
            <Text style={styles.uploadText}>Upload your resume</Text>
            <Text style={styles.uploadSubtext}>PDF (max 5MB)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Skills Section with Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <TouchableOpacity onPress={() => setIsAddingSkill(true)}>
            {/* <Icon name="add" size={24} color="#4F46E5" /> */}
          </TouchableOpacity>
        </View>
        <View style={styles.skillsContainer}>
          {userData?.skills?.map((skill, index) => (
            <TouchableOpacity
              key={index}
              style={styles.skillChip}
              onLongPress={() => handleRemoveSkill(skill)}
            >
              <Text style={styles.skillText}>{skill}</Text>
              <Icon name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Salary Expectations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Salary Expectations</Text>
        <View style={styles.salaryCard}>
          <Text style={styles.salaryText}>
            ₹{userData?.preferredSalary?.min || 0} - ₹{userData?.preferredSalary?.max || 0}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSkillsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {userData?.skills?.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.infoCard}>
          <Text style={styles.experienceText}>
            {userData?.workExperience ? 'Experienced' : 'Fresher'}
          </Text>
        </View>
      </View>

      {userData?.experiences?.industry?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Industry Experience</Text>
          <View style={styles.skillsContainer}>
            {userData.experiences.industry.map((ind, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{ind}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <Icon name={icon} size={20} color="#4B5563" />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not specified'}</Text>
      </View>
    </View>
  );

  const renderAddSkillModal = () => (
    <Modal
      visible={isAddingSkill}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Skill</Text>
            <TouchableOpacity onPress={() => setIsAddingSkill(false)}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalScroll}>
            <TextInput
              style={styles.input}
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Enter skill name"
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewSkill('');
                  setIsAddingSkill(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={async () => {
                  if (newSkill.trim()) {
                    await handleAddSkill(newSkill.trim());
                    setNewSkill('');
                    setIsAddingSkill(false);
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Add Skill</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#26437c" />
      </View>
    );
  }



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {upgradeInfo && (
          <View style={styles.limitCard}>
            <View style={styles.limitIconCircle}>
              <Icon name="lock" size={28} color="#DC2626" />
            </View>
            <Text style={styles.limitTitle}>{upgradeInfo.title || 'Upgrade required'}</Text>
            <Text style={styles.limitSubtitle}>{upgradeInfo.message || 'Please upgrade your plan to continue.'}</Text>
            <View style={styles.limitChipsRow}>
              {typeof upgradeInfo.monthlyLimit === 'number' && (
                <View style={styles.limitChip}>
                  <Icon name="date-range" size={14} color="#4F46E5" />
                  <Text style={styles.limitChipText}>Monthly updates: {upgradeInfo.monthlyUsed || 0}/{upgradeInfo.monthlyLimit}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={async () => {
                try {
                  const s = await AsyncStorage.getItem('userData');
                  const u = s ? JSON.parse(s) : null;
                  const utype = u?.userType || 'employee';
                  navigation.navigate('SubscriptionPlan', { type: utype });
                } catch {
                  navigation.navigate('SubscriptionPlan', { type: 'employee' });
                }
              }}
            >
              <Icon name="upgrade" size={18} color="#fff" />
              <Text style={styles.upgradeButtonText}>View Plans</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleProfilePicture}
          >
            {userData?.profile ? (
              <Image
                source={{ uri: userData.profile }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.defaultImage}>
                <Text style={styles.defaultImageText}>
                  {userData?.fullName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}

            <View style={styles.editOverlay}>
              <Icon name="camera-alt" size={20} color="#fff" />
            </View>
            <View style={styles.statusBadge} />
          </TouchableOpacity>
          <Text style={styles.name}>{userData?.fullName}</Text>
          <Text style={styles.role}>{userData?.role}</Text>
        </View>

        {/* <View style={styles.locationContainer}>
            <Text style={styles.location}>{userData?.location}</Text>
            <Icon name="location-on" size={20} color="#6B7280" />
          </View> */}
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setEditData({
                fullName: userData?.fullName || '',
                bio: userData?.bio || '',
                education: userData?.education || []
              });
              setIsEditing(true);
            }}
          >
            <Icon name="edit" size={20} color="#fff" />
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="message" size={20} color="#fff" />
            <Text style={styles.actionText} onPress={() => navigation.navigate('Messages')}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'skills' && styles.activeTab]}
            onPress={() => setActiveTab('skills')}
          >
            <Text style={[styles.tabText, activeTab === 'skills' && styles.activeTabText]}>
              Skills
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' ? renderOverviewTab() : renderSkillsTab()}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <Icon name={item.icon} size={24} color="#26437c" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommendations */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          {recommendations.map((rec) => (
            <View key={rec.id} style={styles.recommendationCard}>
              <Image source={{ uri: rec.image }} style={styles.recommenderImage} />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommenderName}>{rec.name}</Text>
                <Text style={styles.recommenderRole}>{rec.role}</Text>
                <Text style={styles.recommendationText}>{rec.comment}</Text>
              </View>
            </View>
          ))}
        </View> */}
      </ScrollView>

      {isEditing && (
        <Modal
          visible={isEditing}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.fullName}
                    onChangeText={(text) => setEditData({ ...editData, fullName: text })}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Bio Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bio</Text>
                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    value={editData.bio}
                    onChangeText={(text) => setEditData({ ...editData, bio: text })}
                    placeholder="Write something about yourself"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Education Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Education</Text>
                  {editData.education.map((edu, index) => (
                    <View key={index} style={styles.educationInput}>
                      <TextInput
                        style={styles.input}
                        value={edu.course}
                        onChangeText={(text) => handleEducationEdit(index, 'course', text)}
                        placeholder="Course"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        style={styles.input}
                        value={edu.field}
                        onChangeText={(text) => handleEducationEdit(index, 'field', text)}
                        placeholder="Field"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        style={styles.input}
                        value={edu.institute}
                        onChangeText={(text) => handleEducationEdit(index, 'institute', text)}
                        placeholder="Institute"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        style={styles.input}
                        value={edu.grade}
                        onChangeText={(text) => handleEducationEdit(index, 'grade', text)}
                        placeholder="Grade"
                        placeholderTextColor="#9CA3AF"
                      />
                      <View style={styles.yearInputs}>
                        <TextInput
                          style={[styles.input, styles.yearInput]}
                          value={edu.starting}
                          onChangeText={(text) => handleEducationEdit(index, 'starting', text)}
                          placeholder="Start Year"
                          keyboardType="numeric"
                          placeholderTextColor="#9CA3AF"
                        />
                        <TextInput
                          style={[styles.input, styles.yearInput]}
                          value={edu.passOut}
                          onChangeText={(text) => handleEducationEdit(index, 'passOut', text)}
                          placeholder="End Year"
                          keyboardType="numeric"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                    </View>
                  ))}
                  {/* <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setEditData({
                      ...editData,
                      education: [...editData.education, { course: '', field: '', institute: '', starting: '', passOut: '' }]
                    })}
                  >
                    <Icon name="add" size={20} color="#4F46E5" />
                    <Text style={styles.addButtonText}>Add Education</Text>
                  </TouchableOpacity> */}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleEditSubmit}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {renderAddSkillModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    // backgroundColor: '#26437c',
    // paddingTop: 0,
    // paddingBottom: 20,
    // paddingHorizontal: 20,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#26437c',
    marginLeft: 11,
    marginTop: 11,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    // marginTop: -50,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    aspectRatio: 1,
  },
  defaultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultImageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6B7280',
  },



  defaultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatar: {
    fontSize: 40,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#26437c',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#26437c',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#26437c',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#26437c',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  infoValue: {
    color: '#26437c',
    fontSize: 16,
    fontWeight: '500',
  },
  bioText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  educationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  eduHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eduTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
  },
  eduInstitute: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  eduYear: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  eduGrade: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  skillText: {
    color: '#26437c',
    fontSize: 14,
  },
  salaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  salaryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26437c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#26437c',
    width:200
  },
  recommendationCard: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  recommenderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommenderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 2,
  },
  recommenderRole: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  experienceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26437c',
  },
  jobTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  jobTypeChip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  jobTypeText: {
    color: '#26437c',
    fontSize: 14,
  },

  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  resumeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  resumePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 12,
  },
  resumeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
  },
  resumeDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  resumeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resumeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    gap: 8,
  },
  resumeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
  },
  resumeDeleteButton: {
    backgroundColor: '#FEE2E2',
  },
  resumeDeleteText: {
    color: '#EF4444',
  },
  uploadButton: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F46E5',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26437c',
  },
  limitCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center'
  },
  limitIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  limitTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 4
  },
  limitSubtitle: {
    fontSize: 13,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 12
  },
  limitChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12
  },
  limitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20
  },
  limitChipText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600'
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  addSkillChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#4F46E5',
  },

  inputGroup: {
    marginBottom: 50,
  },
  inputLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
  },
  yearInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  yearInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  educationInput: {
    marginBottom: 20,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 15,
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default Profile;   