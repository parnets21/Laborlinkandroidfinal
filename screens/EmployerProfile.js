// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
//   TextInput,
//   Modal,
//   Alert,
//   Dimensions,
//   RefreshControl,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import axios from 'axios';
// import { BASE_URL } from '../constants/config';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { launchImageLibrary } from 'react-native-image-picker';

// const { width } = Dimensions.get('window');

// const EmployerProfile = ({ navigation }) => {
//   const [profileData, setProfileData] = useState({
//     CompanyName: '',
//     companyWebsite: '',
//     address: '',
//     numberOfemp: '',
//     industry: '',
//     email: '',
//     mobile: '',
//     companyLogo: null,
//   });
//   const [loading, setLoading] = useState(true);
//   const [editMode, setEditMode] = useState(false);
//   const [editedData, setEditedData] = useState({});
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [passwordData, setPasswordData] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//   });
//   const [fetchError, setFetchError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//    const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [jobs, setJobs] = useState([]);

//   const fetchJobs = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('userData');
//       const { _id: employerId } = JSON.parse(userData);
//       console.log("userdata",userData);

//       const response = await axios.get(`${BASE_URL}/api/user/Postedjobs/${employerId}`);
//       console.log('Fetched jobs:', response.data);

//       if (response.data.jobs && Array.isArray(response.data.jobs)) {
//         setJobs(response.data.jobs);
//       } else {
//         setJobs([]);
//       }
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching jobs:', error);
//       setError('Failed to load jobs');
//       setJobs([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };
//     useEffect(() => {
//       fetchJobs();
//     }, []);

//     const [AllJobs, setAllJobs] = useState([]);
// console.log("loggaaaalll",AllJobs);

// const fetchAllJobs = async () => {
//   try {
//     setIsLoading(true);
//     const response = await fetch(`${BASE_URL}/api/user/getAllJobs`);

//     if (!response.ok) {
//       throw new Error('Failed to fetch jobs');
//     }

//     const data = await response.json(); // Extract JSON data
//     console.log('Fetched Jobs:', data);
//     setAllJobs(data || []); // Update state with fetched jobs
//   } catch (error) {
//     console.error('Error fetching jobs:', error);
//     setError(error.message);
//   } finally {
//     setIsLoading(false);
//   }
// };


//       useEffect(() => {
//         fetchAllJobs();
//       }, []);
//   // Get user data helper function
//   const getUserData = async () => {
//     const userData = await AsyncStorage.getItem('userData');
//     if (!userData) {
//       throw new Error('No user data found');
//     }
//     return JSON.parse(userData);
//   };

//   const fetchProfileData = async () => {
//     try {
//       setLoading(true);
//       setFetchError(null);

//       // Get user data from storage
//       const userData = await getUserData();
//       console.log('User data:', userData);

//       if (!userData._id) {
//         throw new Error('User ID not found');
//       }

//       // Log the URL we're calling
//       console.log('Fetching from:', `${BASE_URL}/api/user/employer/${userData._id}`);

//       // Fetch employer profile
//       const response = await axios.get(`${BASE_URL}/api/user/employer/${userData._id}`, {
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('Profile API Response:', response.data);

//       if (response.data.success && response.data.data) {
//         const employerData = response.data.data;
//         console.log('Employer Data received:', employerData);

//         // Map backend data to state with proper defaults
//         const profileInfo = {
//           CompanyName: employerData.CompanyName || '',
//           companyWebsite: employerData.companyWebsite || '',
//           address: employerData.address || '',
//           numberOfemp: employerData.numberOfemp?.toString() || '',
//           industry: employerData.industry || '',
//           email: employerData.email || userData.email || '',
//           mobile: employerData.mobile || userData.mobile || '',
//           companyLogo: employerData.companyLogo || null,
//         };

//         console.log('Setting profile info:', profileInfo);
//         setProfileData(profileInfo);
//         setEditedData(profileInfo);
//       } else {
//         // If no specific employer data is found, use data from userData
//         console.log('No employer data found, using userData defaults');
//         const defaultProfile = {
//           ...profileData,
//           email: userData.email || '',
//           mobile: userData.mobile || '',
//           CompanyName: userData.name || '',
//         };
//         setProfileData(defaultProfile);
//         setEditedData(defaultProfile);
//       }
//     } catch (error) {
//       console.error('Error details:', error.response || error);
//       let errorMessage = 'Could not load profile data. Please try again.';

//       // More specific error messages based on response
//       if (error.response) {
//         switch (error.response.status) {
//           case 400:
//             errorMessage = 'Invalid employer ID';
//             break;
//           case 404:
//             errorMessage = 'Employer profile not found';
//             break;
//           case 500:
//             errorMessage = 'Server error. Please try again later';
//             break;
//         }
//       }

//       setFetchError(errorMessage);

//       // Try to use basic userData if available
//       try {
//         const userData = await getUserData();
//         console.log('Falling back to user data:', userData);
//         const fallbackProfile = {
//           ...profileData,
//           email: userData.email || '',
//           mobile: userData.mobile || '',
//           CompanyName: userData.name || '',
//         };
//         setProfileData(fallbackProfile);
//         setEditedData(fallbackProfile);
//       } catch (e) {
//         console.error('Failed to load fallback data:', e);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfileData();
//   }, []);

//   // Debug log when profile data changes
//   useEffect(() => {
//     console.log('Current Profile Data:', profileData);
//   }, [profileData]);

//   const handleUpdateProfile = async () => {
//     try {
//       setLoading(true);
//       const userData = await getUserData();
//       const formData = new FormData();

//       // Add all the edited fields to formData
//       // Object.keys(editedData).forEach(key => {
//       //   if (editedData[key] !== null && editedData[key] !== undefined) {
//       //     if (key === 'companyLogo' && typeof editedData[key] === 'object') {
//       //       formData.append('companyLogo', editedData[key]);
//       //     } else {
//       //       formData.append(key, editedData[key]);
//       //     }
//       //   }
//       // });

//       // Add employerId

//       formData.append('employerId', userData._id);

//       console.log('Submitting profile update:', formData);

//       // Use the correct endpoint with multipart/form-data content type
//       const response = await axios.put(`${BASE_URL}/api/user/editProfileEmployer`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       console.log('Update response:', response.data);

//       if (response.data.success) {
//         setProfileData(editedData);
//         setEditMode(false);
//         Alert.alert('Success', 'Profile updated successfully');
//       } else {
//         throw new Error(response.data.message || 'Update failed');
//       }
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to update profile'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePasswordChange = async () => {
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       Alert.alert('Error', 'New passwords do not match');
//       return;
//     }

//     try {
//       const userData = await getUserData();

//       const response = await axios.put(`${BASE_URL}/api/user/changePassword`, {
//         employerId: userData._id,
//         currentPassword: passwordData.currentPassword,
//         newPassword: passwordData.newPassword
//       });

//       if (response.data.success) {
//         setShowPasswordModal(false);
//         setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
//         Alert.alert('Success', 'Password updated successfully');
//       } else {
//         throw new Error(response.data.message || 'Password change failed');
//       }
//     } catch (error) {
//       console.error('Error changing password:', error);
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to change password'
//       );
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem('userData');
//       await AsyncStorage.removeItem('token');
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'RoleSelection' }],
//       });
//     } catch (error) {
//       console.error('Error logging out:', error);
//       Alert.alert('Error', 'Failed to log out');
//     }
//   };

//   const pickImage = async () => {
//     const options = {
//       mediaType: 'photo',
//       quality: 1,
//     };

//     try {
//       const result = await launchImageLibrary(options);
//       if (!result.didCancel && result.assets && result.assets[0]) {
//         const imageUri = result.assets[0].uri;

//         // Create image object for FormData
//         const imageFile = {
//           uri: imageUri,
//           type: result.assets[0].type || 'image/jpeg',
//           name: result.assets[0].fileName || 'profile.jpg',
//         };

//         setEditedData(prev => ({ ...prev, companyLogo: imageFile }));
//       }
//     } catch (error) {
//       console.error('Error picking image:', error);
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchProfileData();
//   };

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2563EB" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView 
//         style={styles.scrollView}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#2563EB']}
//           />
//         }
//       >
//         {fetchError ? (
//           <View style={styles.errorContainer}>
//             <Icon name="error-outline" size={48} color="#DC2626" />
//             <Text style={styles.errorText}>{fetchError}</Text>
//             <TouchableOpacity 
//               style={styles.retryButton}
//               onPress={onRefresh}
//             >
//               <Icon name="refresh" size={20} color="#FFFFFF" />
//               <Text style={styles.retryButtonText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <>
//             <View style={styles.header}>
//               <View style={styles.headerContent}>
//                 <TouchableOpacity 
//                   style={styles.profileImageContainer}
//                   onPress={editMode ? pickImage : null}
//                 >
//                   {profileData.companyLogo ? (
//                     <Image 
//                       source={{ uri: typeof profileData.companyLogo === 'string' 
//                         ? profileData.companyLogo 
//                         : profileData.companyLogo.uri }}
//                       style={styles.profileImage}
//                     />
//                   ) : (
//                     <View style={styles.defaultImage}>
//                       <Text style={styles.defaultImageText}>
//                         {profileData.CompanyName?.charAt(0) || 'C'}
//                       </Text>
//                     </View>
//                   )}
//                   {editMode && (
//                     <View style={styles.editOverlay}>
//                       <Icon name="camera-alt" size={24} color="#fff" />
//                     </View>
//                   )}
//                 </TouchableOpacity>
//                 <Text style={styles.companyName}>{profileData.CompanyName || 'Your Company'}</Text>
//                 <Text style={styles.industry}>{profileData.industry || 'Add your industry'}</Text>
//               </View>
//             </View>

//             <View style={styles.statsContainer}>
//               <View style={styles.statItem}>
//                 <Icon name="people" size={24} color="#2563EB" />
//                 <Text style={styles.statNumber}>{profileData.numberOfemp || '0'}</Text>
//                 <Text style={styles.statLabel}>Employees</Text>
//               </View>
//               <View style={styles.statDivider} />
//               <View style={styles.statItem}>
//                 <Icon name="work" size={24} color="#2563EB" />
//                 <Text style={styles.statNumber}>{jobs?.length}</Text>
//                 <Text style={styles.statLabel}>Active Jobs</Text>
//               </View>
//               <View style={styles.statDivider} />
//               <View style={styles.statItem}>
//                 <Icon name="person-search" size={24} color="#2563EB" />
//                 <Text style={styles.statNumber}> {AllJobs?.data?.length}</Text>
//                 <Text style={styles.statLabel}>Applications</Text>
//               </View>
//             </View>

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Company Information</Text>
//               {editMode ? (
//                 <>
//                   <TextInput
//                     style={styles.input}
//                     value={editedData.CompanyName}
//                     onChangeText={(text) => setEditedData({ ...editedData, CompanyName: text })}
//                     placeholder="Company Name"
//                   />
//                   <TextInput
//                     style={styles.input}
//                     value={editedData.companyWebsite}
//                     onChangeText={(text) => setEditedData({ ...editedData, companyWebsite: text })}
//                     placeholder="Company Website"
//                   />
//                 </>
//               ) : (
//                 <>
//                   <View style={styles.infoItem}>
//                     <Icon name="business" size={20} color="#6B7280" />
//                     <Text style={styles.infoText}>{profileData.CompanyName || 'Not specified'}</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Icon name="public" size={20} color="#6B7280" />
//                     <Text style={styles.infoText}>{profileData.companyWebsite || 'India'}</Text>
//                   </View>
//                 </>
//               )}
//             </View>

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Business Details</Text>
//               {editMode ? (
//                 <>
//                   <TextInput
//                     style={styles.input}
//                     value={editedData.industry}
//                     onChangeText={(text) => setEditedData({ ...editedData, industry: text })}
//                     placeholder="Industry"
//                   />
//                   <TextInput
//                     style={styles.input}
//                     value={editedData.numberOfemp}
//                     onChangeText={(text) => setEditedData({ ...editedData, numberOfemp: text })}
//                     placeholder="Number of Employees"
//                     keyboardType="numeric"
//                   />
//                   <TextInput
//                     style={styles.input}
//                     value={editedData.address}
//                     onChangeText={(text) => setEditedData({ ...editedData, address: text })}
//                     placeholder="Address"
//                     multiline
//                   />
//                 </>
//               ) : (
//                 <>
//                   <View style={styles.infoItem}>
//                     <Icon name="business" size={20} color="#6B7280" />
//                     <Text style={styles.infoText}>{profileData.industry || 'Not specified'}</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Icon name="people" size={20} color="#6B7280" />
//                     <Text style={styles.infoText}>{profileData.numberOfemp || '0'} employees</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Icon name="location-on" size={20} color="#6B7280" />
//                     {/* <Text style={styles.infoText}>{profileData.address || 'Not specified'}</Text> */}
//                   </View>
//                 </>
//               )}
//             </View>

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Contact Information</Text>
//               {editMode ? (
//                 <>
//                   <TextInput
//                     style={styles.input}
//                     value={editedData.email}
//                     onChangeText={(text) => setEditedData({ ...editedData, email: text })}
//                     placeholder="Email"
//                     keyboardType="email-address"
//                   />
//                   <TextInput
//                     style={styles.input}
//                     value={editedData.mobile}
//                     onChangeText={(text) => setEditedData({ ...editedData, mobile: text })}
//                     placeholder="Phone Number"
//                     keyboardType="phone-pad"
//                   />
//                 </>
//               ) : (
//                 <>
//                   <View style={styles.infoItem}>
//                     <Icon name="email" size={20} color="#6B7280" />
//                     <Text style={styles.infoText}>{profileData.email || 'Not specified'}</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Icon name="phone" size={20} color="#6B7280" />
//                     <Text style={styles.infoText}>{profileData.mobile || 'Not specified'}</Text>
//                   </View>
//                 </>
//               )}
//             </View>

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Account Settings</Text>
//               <TouchableOpacity 
//                 style={styles.settingItem}
//                 onPress={() => setShowPasswordModal(true)}
//               >
//                 <Icon name="lock" size={20} color="#6B7280" />
//                 <Text style={styles.settingText}>Change Password</Text>
//                 <Icon name="chevron-right" size={20} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity 
//               style={styles.logoutButton}
//               onPress={handleLogout}
//             >
//               <Icon name="logout" size={20} color="#DC2626" />
//               <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </ScrollView>

//       {/* {!fetchError && (
//         <TouchableOpacity 
//           style={styles.floatingEditButton}
//           onPress={() => {
//             if (editMode) {
//               // If already in edit mode, save changes
//               handleUpdateProfile();
//             } else {
//               // Enter edit mode
//               setEditMode(true);
//             }
//           }}
//         >
//           <Icon name={editMode ? "check" : "edit"} size={24} color="#fff" />
//         </TouchableOpacity>
//       )} */}

//       {/* Password Change Modal */}
//       {/* <Modal
//         visible={showPasswordModal}
//         transparent={true}
//         animationType="slide"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Change Password</Text>
//             <TextInput
//               style={styles.modalInput}
//               placeholder="Current Password"
//               secureTextEntry
//               value={passwordData.currentPassword}
//               onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
//             />
//             <TextInput
//               style={styles.modalInput}
//               placeholder="New Password"
//               secureTextEntry
//               value={passwordData.newPassword}
//               onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
//             />
//             <TextInput
//               style={styles.modalInput}
//               placeholder="Confirm New Password"
//               secureTextEntry
//               value={passwordData.confirmPassword}
//               onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
//             />
//             <View style={styles.modalButtons}>
//               <TouchableOpacity 
//                 style={[styles.modalButton, styles.cancelButton]}
//                 onPress={() => setShowPasswordModal(false)}
//               >
//                 <Text style={styles.modalButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.modalButton, styles.saveButton]}
//                 onPress={handlePasswordChange}
//               >
//                 <Text style={styles.modalButtonText}>Save</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal> */}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     backgroundColor: 'black',
//     paddingTop: 30,
//     paddingBottom: 30,
//   },
//   headerContent: {
//     alignItems: 'center',
//   },
//   profileImageContainer: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     marginBottom: 16,
//     elevation: 4,
//     backgroundColor: '#fff',
//   },
//   profileImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 60,
//   },
//   defaultImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 60,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   defaultImageText: {
//     fontSize: 48,
//     fontWeight: 'bold',
//     color: '#2563EB',
//   },
//   companyName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 4,
//   },
//   industry: {
//     fontSize: 16,
//     color: '#E5E7EB',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     marginTop: -30,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     padding: 16,
//     elevation: 4,
//   },
//   section: {
//     backgroundColor: '#FFFFFF',
//     padding: 20,
//     marginHorizontal: 16,
//     marginTop: 16,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 1,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#134083',
//     marginBottom: 16,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//     gap: 12,
//   },
//   infoText: {
//     fontSize: 16,
//     color: '#4B5563',
//     flex: 1,
//   },
//   settingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     gap: 12,
//   },
//   settingText: {
//     fontSize: 16,
//     color: '#4B5563',
//     flex: 1,
//   },
//   logoutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//     gap: 8,
//     margin: 20,
//     borderWidth: 1,
//     borderColor: '#DC2626',
//     borderRadius: 8,
//     backgroundColor: '#FEF2F2',
//   },
//   logoutText: {
//     color: '#DC2626',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 12,
//     width: '90%',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   modalInput: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//   },
//   modalButton: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 8,
//     marginHorizontal: 8,
//   },
//   cancelButton: {
//     backgroundColor: '#6B7280',
//   },
//   saveButton: {
//     backgroundColor: '#134083',
//   },
//   modalButtonText: {
//     color: '#fff',
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   editOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   floatingEditButton: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: 'black',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 6,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#134083',
//     marginVertical: 4,
//   },
//   statLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   statDivider: {
//     width: 1,
//     height: '100%',
//     backgroundColor: '#E5E7EB',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//     fontSize: 16,
//     backgroundColor: '#F9FAFB',
//   },
//   errorContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 32,
//     marginTop: 50,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#DC2626',
//     textAlign: 'center',
//     marginVertical: 16,
//   },
//   retryButton: {
//     backgroundColor: '#2563EB',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

// export default EmployerProfile; 




















import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

const EmployerProfile = ({ navigation }) => {
  const [profileData, setProfileData] = useState({
    CompanyName: '',
    companyWebsite: '',
    address: '',
    numberOfemp: '',
    industry: '',
    email: '',
    mobile: '',
    companyLogo: null,
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fetchError, setFetchError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [AllJobs, setAllJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { _id: employerId } = JSON.parse(userData);
      const response = await axios.get(`${BASE_URL}/api/user/Postedjobs/${employerId}`);

      if (response.data.jobs && Array.isArray(response.data.jobs)) {
        setJobs(response.data.jobs);
      } else {
        setJobs([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAllJobs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/user/getAllJobs`);

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setAllJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserData = async () => {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) {
      throw new Error('No user data found');
    }
    return JSON.parse(userData);
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const userData = await getUserData();

      if (!userData._id) {
        throw new Error('User ID not found');
      }

      const response = await axios.get(`${BASE_URL}/api/user/employer/${userData._id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.data) {
        const employerData = response.data.data;

        const profileInfo = {
          CompanyName: employerData.CompanyName || '',
          companyWebsite: employerData.companyWebsite || '',
          address: employerData.address || '',
          numberOfemp: employerData.numberOfemp?.toString() || '',
          industry: employerData.industry || '',
          email: employerData.email || userData.email || '',
          mobile: employerData.mobile || userData.mobile || '',
          EmployerImg: employerData.EmployerImg || null,
        };

        setProfileData(profileInfo);
        setEditedData(profileInfo);
      } else {
        const defaultProfile = {
          ...profileData,
          email: userData.email || '',
          mobile: userData.mobile || '',
          CompanyName: userData.name || '',
        };
        setProfileData(defaultProfile);
        setEditedData(defaultProfile);
      }
    } catch (error) {
      console.error('Error details:', error.response || error);
      // let errorMessage = 'Could not load profile data. Please try again.';

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid employer ID';
            break;
          case 404:
            errorMessage = 'Employer profile not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
        }
      }

      setFetchError(errorMessage);

      try {
        const userData = await getUserData();
        const fallbackProfile = {
          ...profileData,
          email: userData.email || '',
          mobile: userData.mobile || '',
          CompanyName: userData.name || '',
        };
        setProfileData(fallbackProfile);
        setEditedData(fallbackProfile);
      } catch (e) {
        console.error('Failed to load fallback data:', e);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchJobs();
    fetchAllJobs();
  }, []);

  // const handleUpdateProfile = async () => {
  //   try {
  //     setLoading(true);
  //     const userData = await getUserData();
  //     const formData = new FormData();

  //     // Append all edited fields to formData
  //     Object.keys(editedData).forEach(key => {
  //       if (editedData[key] !== null && editedData[key] !== undefined) {
  //         if (key === 'companyLogo' && typeof editedData[key] === 'object') {
  //           formData.append('companyLogo', {
  //             uri: editedData[key].uri,
  //             type: editedData[key].type || 'image/jpeg',
  //             name: editedData[key].fileName || 'profile.jpg',
  //           });
  //         } else {
  //           formData.append(key, editedData[key]);
  //         }
  //       }
  //     });

  //     formData.append('employerId', userData._id);

  //     const response = await axios.put(`${BASE_URL}/api/user/UpdateEmployerImg/${userData._id}`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });

  //     if (response.data.success) {
  //       setProfileData(editedData);
  //       setEditMode(false);
  //       Alert.alert('Success', 'Profile updated successfully');
  //     } else {
  //       throw new Error(response.data.message || 'Update failed');
  //     }
  //   } catch (error) {
  //     console.error('Error updating profile:', error);
  //     Alert.alert(
  //       'Error',
  //       error.response?.data?.message || 'Failed to update profile'
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleUpdateProfile = async () => {
  try {
    setLoading(true);
    const userData = await getUserData();
    const formData = new FormData();

    // Append non-file fields
    Object.keys(editedData).forEach(key => {
      if (key !== 'EmployerImg' && editedData[key] != null) {
        formData.append(key, String(editedData[key]));
      }
    });

    // Append file with the correct field name
    if (editedData.EmployerImg && typeof editedData.EmployerImg === 'object') {
      formData.append('EmployerImg', {
        uri: editedData.EmployerImg.uri,
        type: editedData.EmployerImg.type || 'image/jpeg',
        name: editedData.EmployerImg.fileName || `employer_${Date.now()}.jpg`,
      });
    }

    const response = await axios.put(
      `${BASE_URL}/api/user/UpdateEmployerImg/${userData._id}`,
      formData,
       {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log(response,"uploading..................")

    if (response.data.success) {
      setProfileData(editedData);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      throw new Error(response.data.message || 'Update failed');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};



  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      const userData = await getUserData();

      const response = await axios.put(`${BASE_URL}/api/user/changePassword`, {
        employerId: userData._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        Alert.alert('Success', 'Password updated successfully');
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to change password'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'RoleSelection' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    try {
      const result = await launchImageLibrary(options);
      if (!result.didCancel && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        const imageFile = {
          uri: imageUri,
          type: result.assets[0].type || 'image/jpeg',
          name: result.assets[0].fileName || 'profile.jpg',
        };

        setEditedData(prev => ({ ...prev, EmployerImg: imageFile }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
    fetchJobs();
    fetchAllJobs();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
          />
        }
      >
        {fetchError ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#DC2626" />
            <Text style={styles.errorText}>{fetchError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRefresh}
            >
              <Icon name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={styles.profileImageContainer}
                  onPress={editMode ? pickImage : null}
                >
                  {editedData.EmployerImg ? (
                    <Image
                      source={{
                        uri: typeof editedData.EmployerImg === 'string'
                          ? editedData.EmployerImg
                          : editedData.EmployerImg.uri
                      }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.defaultImage}>
                      <Text style={styles.defaultImageText}>
                        {editedData.CompanyName?.charAt(0) || 'C'}
                      </Text>
                    </View>
                  )}
                  {editMode && (
                    <View style={styles.editOverlay}>
                      <Icon name="camera-alt" size={24} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
                {editMode ? (
                  <TextInput
                    style={[styles.companyName, { color: '#fff', textAlign: 'center', marginBottom: 4 }]}
                    value={editedData.CompanyName}
                    onChangeText={(text) => setEditedData({ ...editedData, CompanyName: text })}
                    placeholder="Company Name"
                    placeholderTextColor="#E5E7EB"
                  />
                ) : (
                  <Text style={styles.companyName}>{editedData.CompanyName || 'Your Company'}</Text>
                )}
                {editMode ? (
                  <TextInput
                    style={[styles.industry, { color: '#E5E7EB', textAlign: 'center' }]}
                    value={editedData.industry}
                    onChangeText={(text) => setEditedData({ ...editedData, industry: text })}
                    placeholder="Industry"
                    placeholderTextColor="#E5E7EB"
                  />
                ) : (
                  <Text style={styles.industry}>{editedData.industry || 'Add your industry'}</Text>
                )}
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="people" size={24} color="#2563EB" />
                <Text style={styles.statNumber}>{editedData.numberOfemp || '0'}</Text>
                <Text style={styles.statLabel}>Employees</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="work" size={24} color="#2563EB" />
                <Text style={styles.statNumber}>{jobs?.length}</Text>
                <Text style={styles.statLabel}>Active Jobs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="person-search" size={24} color="#2563EB" />
                <Text style={styles.statNumber}>{AllJobs?.data?.length}</Text>
                <Text style={styles.statLabel}>Applications</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Company Information</Text>
              {editMode ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editedData.CompanyName}
                    onChangeText={(text) => setEditedData({ ...editedData, CompanyName: text })}
                    placeholder="Company Name"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedData.companyWebsite}
                    onChangeText={(text) => setEditedData({ ...editedData, companyWebsite: text })}
                    placeholder="Company Website"
                  />
                </>
              ) : (
                <>
                  <View style={styles.infoItem}>
                    <Icon name="business" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{editedData.CompanyName || 'Not specified'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="public" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{editedData.companyWebsite || 'Not specified'}</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Details</Text>
              {editMode ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editedData.industry}
                    onChangeText={(text) => setEditedData({ ...editedData, industry: text })}
                    placeholder="Industry"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedData.numberOfemp}
                    onChangeText={(text) => setEditedData({ ...editedData, numberOfemp: text })}
                    placeholder="Number of Employees"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    value={editedData.address}
                    onChangeText={(text) => setEditedData({ ...editedData, address: text })}
                    placeholder="Address"
                    multiline
                  />
                </>
              ) : (
                <>
                  <View style={styles.infoItem}>
                    <Icon name="business" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{editedData.industry || 'Not specified'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="people" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{editedData.numberOfemp || '0'} employees</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="location-on" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{editedData.address || 'Not specified'}</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              {editMode ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editedData.email}
                    onChangeText={(text) => setEditedData({ ...editedData, email: text })}
                    placeholder="Email"
                    keyboardType="email-address"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedData.mobile}
                    onChangeText={(text) => setEditedData({ ...editedData, mobile: text })}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                </>
              ) : (
                <>
                  <View style={styles.infoItem}>
                    <Icon name="email" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{editedData.email || 'Not specified'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="phone" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{editedData.mobile || 'Not specified'}</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Settings</Text>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setShowPasswordModal(true)}
              >
                <Icon name="lock" size={20} color="#6B7280" />
                <Text style={styles.settingText}>Change Password</Text>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View> 
              
              
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PrivacyPolicy</Text>
              <TouchableOpacity
                style={styles.settingItem}
               onPress={() => navigation.navigate('Privacy')}
              >
                <Icon name="business" size={20} color="#6B7280" />
                <Text style={styles.settingText}>PrivacyPolicy</Text>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="logout" size={20} color="#DC2626" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {!fetchError && (
        <TouchableOpacity
          style={styles.floatingEditButton}
          onPress={() => {
            if (editMode) {
              // If already in edit mode, save changes
              handleUpdateProfile();
            } else {
              // Enter edit mode
              setEditedData({ ...profileData });
              setEditMode(true);
            }
          }}
        >
          <Icon name={editMode ? "check" : "edit"} size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Current Password"
              secureTextEntry
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              secureTextEntry
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              secureTextEntry
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handlePasswordChange}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'black',
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  defaultImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultImageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  industry: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: -30,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    margin: 20,
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#134083',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingEditButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#134083',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EmployerProfile;