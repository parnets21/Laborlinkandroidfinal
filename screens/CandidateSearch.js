// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   Modal,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import axios from 'axios';
// import { BASE_URL } from '../constants/config';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const CandidateSearch = ({ navigation, route }) => {
//   const [applicants, setApplicants] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedStatus, setSelectedStatus] = useState('all');
//   const [selectedApplicant, setSelectedApplicant] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [searchCount, setSearchCount] = useState(0);
//   const [isPremium, setIsPremium] = useState(false);
//   const [filters, setFilters] = useState({
//     skills: '',
//     experience: '',
//     location: '',
//   });

//   // Status options for filtering
//   const statusOptions = [
//     { label: 'All', value: 'all' },
//     { label: 'Pending', value: 'pending' },
//     { label: 'Shortlisted', value: 'shortlisted' },
//     { label: 'Selected', value: 'selected' },
//     { label: 'Rejected', value: 'rejected' }
//   ];

//   useEffect(() => {
//     checkSubscriptionStatus();
//     fetchApplicants();
//   }, []);

//   const checkSubscriptionStatus = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('userData');
//       if (userData) {
//         const { isPrime } = JSON.parse(userData);
//         setIsPremium(isPrime);
//       }
//     } catch (error) {
//       console.error('Error checking subscription:', error);
//     }
//   };

//   const fetchApplicants = async () => {
//     try {
//       setLoading(true);
//       const jobId = route.params?.jobId;
//       if (!jobId) {
//         throw new Error('Job ID not found');
//       }

//       const response = await axios.get(`${BASE_URL}/api/getApplyList/${jobId}`);
      
//       if (response.data.success) {
//         setApplicants(response.data.data);
//         setSearchCount(response.data.searchCount || 0);

//         // Check search count limit
//         if (!isPremium && response.data.searchCount >= 5) {
//           navigation.navigate('SubscriptionPlans');
//           return;
//         }
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to fetch applicants');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = async (applicantId, newStatus) => {
//     try {
//       let endpoint = '';
//       switch (newStatus) {
//         case 'shortlisted':
//           endpoint = `${BASE_URL}/api/addShortList`;
//           break;
//         case 'selected':
//           endpoint = `${BASE_URL}/api/addSelect`;
//           break;
//         case 'rejected':
//           endpoint = `${BASE_URL}/api/rejectApply`;
//           break;
//         default:
//           throw new Error('Invalid status');
//       }

//       const response = await axios.post(endpoint, {
//         applicantId,
//         companyId: route.params?.companyId
//       });

//       if (response.data.success) {
//         setApplicants(prevApplicants => 
//           prevApplicants.map(app => 
//             app._id === applicantId ? { ...app, status: newStatus } : app
//           )
//         );
//         Alert.alert('Success', `Candidate ${newStatus} successfully`);
//         setShowDetailsModal(false);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update application status');
//     }
//   };

//   const handleSearch = async () => {
//     if (!isPremium && searchCount >= 5) {
//       navigation.navigate('SubscriptionPlans');
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await axios.get(`${BASE_URL}/api/getApplyList/${route.params?.jobId}`, {
//         params: filters
//       });

//       if (response.data.success) {
//         setApplicants(response.data.data);
//         setSearchCount(prev => prev + 1);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to search candidates');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderApplicantCard = (applicant) => (
//     <TouchableOpacity
//       key={applicant._id}
//       style={styles.applicantCard}
//       onPress={() => {
//         setSelectedApplicant(applicant);
//         setShowDetailsModal(true);
//       }}
//     >
//       <Image
//         source={{ uri: applicant.profileImage || 'https://via.placeholder.com/50' }}
//         style={styles.applicantImage}
//       />
      
//       <View style={styles.applicantInfo}>
//         <Text style={styles.applicantName}>{applicant.name}</Text>
//         <Text style={styles.applicantEmail}>{applicant.email}</Text>
        
//         <View style={styles.detailsRow}>
//           <View style={styles.detailItem}>
//             <Icon name="work" size={16} color="#6B7280" />
//             <Text style={styles.detailText}>{applicant.experience} years</Text>
//           </View>
//           <View style={styles.detailItem}>
//             <Icon name="location-on" size={16} color="#6B7280" />
//             <Text style={styles.detailText}>{applicant.location}</Text>
//           </View>
//         </View>

//         <View style={styles.skillsContainer}>
//           {applicant.skills?.slice(0, 3).map((skill, index) => (
//             <View key={index} style={styles.skillBadge}>
//               <Text style={styles.skillText}>{skill}</Text>
//             </View>
//           ))}
//         </View>

//         <View style={[styles.statusBadge, { backgroundColor: getStatusColor(applicant.status) }]}>
//           <Text style={styles.statusText}>{applicant.status}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'shortlisted': return '#059669';
//       case 'selected': return '#2563EB';
//       case 'rejected': return '#DC2626';
//       default: return '#6B7280';
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Icon name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Applications</Text>
//       </View>

//       <View style={styles.filterSection}>
//         <TextInput
//           style={styles.filterInput}
//           placeholder="Skills (e.g., React, Node.js)"
//           value={filters.skills}
//           onChangeText={(text) => setFilters(prev => ({ ...prev, skills: text }))}
//         />
//         <TextInput
//           style={styles.filterInput}
//           placeholder="Experience (years)"
//           value={filters.experience}
//           onChangeText={(text) => setFilters(prev => ({ ...prev, experience: text }))}
//           keyboardType="numeric"
//         />
//         <TextInput
//           style={styles.filterInput}
//           placeholder="Location"
//           value={filters.location}
//           onChangeText={(text) => setFilters(prev => ({ ...prev, location: text }))}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="search" size={20} color="#fff" />
//           <Text style={styles.searchButtonText}>Search</Text>
//         </TouchableOpacity>

//         {!isPremium && (
//           <Text style={styles.searchCount}>
//             {5 - searchCount} searches remaining
//           </Text>
//         )}
//       </View>

//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         style={styles.statusFilters}
//       >
//         {statusOptions.map(option => (
//           <TouchableOpacity
//             key={option.value}
//             style={[
//               styles.statusChip,
//               selectedStatus === option.value && styles.selectedStatusChip
//             ]}
//             onPress={() => setSelectedStatus(option.value)}
//           >
//             <Text style={[
//               styles.statusChipText,
//               selectedStatus === option.value && styles.selectedStatusChipText
//             ]}>{option.label}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {loading ? (
//         <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
//       ) : (
//         <ScrollView style={styles.content}>
//           {applicants
//             .filter(app => selectedStatus === 'all' || app.status === selectedStatus)
//             .map(renderApplicantCard)}
//         </ScrollView>
//       )}

//       {/* Application Details Modal */}
//       <Modal
//         visible={showDetailsModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowDetailsModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Application Details</Text>
//               <TouchableOpacity 
//                 onPress={() => setShowDetailsModal(false)}
//                 style={styles.closeButton}
//               >
//                 <Icon name="close" size={24} color="#134083" />
//               </TouchableOpacity>
//             </View>

//             {selectedApplicant && (
//               <ScrollView>
//                 <Image
//                   source={{ uri: selectedApplicant.profileImage || 'https://via.placeholder.com/100' }}
//                   style={styles.modalImage}
//                 />
//                 <Text style={styles.modalName}>{selectedApplicant.name}</Text>
//                 <Text style={styles.modalEmail}>{selectedApplicant.email}</Text>

//                 <View style={styles.detailSection}>
//                   <Text style={styles.detailLabel}>Experience</Text>
//                   <Text style={styles.detailValue}>{selectedApplicant.experience} years</Text>
//                 </View>

//                 <View style={styles.detailSection}>
//                   <Text style={styles.detailLabel}>Skills</Text>
//                   <View style={styles.skillsContainer}>
//                     {selectedApplicant.skills?.map((skill, index) => (
//                       <View key={index} style={styles.skillBadge}>
//                         <Text style={styles.skillText}>{skill}</Text>
//                       </View>
//                     ))}
//                   </View>
//                 </View>

//                 <View style={styles.actionButtons}>
//                   {selectedApplicant.status === 'pending' && (
//                     <>
//                       <TouchableOpacity
//                         style={[styles.actionButton, styles.shortlistButton]}
//                         onPress={() => handleStatusChange(selectedApplicant._id, 'shortlisted')}
//                       >
//                         <Text style={styles.actionButtonText}>Shortlist</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={[styles.actionButton, styles.rejectButton]}
//                         onPress={() => handleStatusChange(selectedApplicant._id, 'rejected')}
//                       >
//                         <Text style={styles.actionButtonText}>Reject</Text>
//                       </TouchableOpacity>
//                     </>
//                   )}
                  
//                   {selectedApplicant.status === 'shortlisted' && (
//                     <>
//                       <TouchableOpacity
//                         style={[styles.actionButton, { backgroundColor: '#2563EB' }]}
//                         onPress={() => handleStatusChange(selectedApplicant._id, 'selected')}
//                       >
//                         <Text style={styles.actionButtonText}>Select</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={[styles.actionButton, styles.rejectButton]}
//                         onPress={() => handleStatusChange(selectedApplicant._id, 'rejected')}
//                       >
//                         <Text style={styles.actionButtonText}>Reject</Text>
//                       </TouchableOpacity>
//                     </>
//                   )}
//                 </View>
//               </ScrollView>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     backgroundColor: '#134083',
//     padding: 20,
//     paddingTop: 50,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backButton: {
//     marginRight: 16,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   filterSection: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   filterInput: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 8,
//     fontSize: 16,
//   },
//   searchButton: {
//     backgroundColor: '#2563EB',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   searchButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   searchCount: {
//     textAlign: 'center',
//     color: '#6B7280',
//     marginTop: 8,
//     fontSize: 14,
//   },
//   statusFilters: {
//     flexDirection: 'row',
//     paddingVertical: 12,
//   },
//   statusChip: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#F3F4F6',
//     marginRight: 8,
//   },
//   selectedStatusChip: {
//     backgroundColor: '#2563EB',
//   },
//   statusChipText: {
//     color: '#6B7280',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   selectedStatusChipText: {
//     color: '#fff',
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   applicantCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   applicantImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   applicantInfo: {
//     flex: 1,
//   },
//   applicantName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#134083',
//     marginBottom: 4,
//   },
//   applicantEmail: {
//     fontSize: 14,
//     color: '#4B5563',
//     marginBottom: 8,
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//     gap: 16,
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   detailText: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   skillsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   skillBadge: {
//     backgroundColor: '#F3F4F6',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   skillText: {
//     fontSize: 12,
//     color: '#134083',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#134083',
//   },
//   closeButton: {
//     padding: 8,
//   },
//   modalImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     alignSelf: 'center',
//     marginBottom: 16,
//   },
//   modalName: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#134083',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   modalEmail: {
//     fontSize: 16,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   detailSection: {
//     marginBottom: 16,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   detailValue: {
//     fontSize: 16,
//     color: '#134083',
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 24,
//     gap: 12,
//   },
//   actionButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   shortlistButton: {
//     backgroundColor: '#059669',
//   },
//   rejectButton: {
//     backgroundColor: '#DC2626',
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//     alignSelf: 'flex-start',
//     marginTop: 8,
//   },
//   statusText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// const additionalStyles = StyleSheet.create({
//   filterSection: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   filterInput: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 8,
//     fontSize: 16,
//   },
//   searchButton: {
//     backgroundColor: '#2563EB',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   searchButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   searchCount: {
//     textAlign: 'center',
//     color: '#6B7280',
//     marginTop: 8,
//     fontSize: 14,
//   }
// });

// export default CandidateSearch; 