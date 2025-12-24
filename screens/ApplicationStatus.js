// "use client"

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Modal,
//   Image,
//   Dimensions,
//   Animated,
//   TextInput,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import axios from 'axios';
// import { BASE_URL } from '../constants/config';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ApplicationDetails from "./ApplicationDetails";

// const { width } = Dimensions.get('window');

// const ApplicationStatus = ({ navigation, route }) => {
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeStatus, setActiveStatus] = useState('shortlisted');
//   const [error, setError] = useState(null);
//   const [selectedApplication, setSelectedApplication] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [stats, setStats] = useState({
//     total: 0,
//     shortlisted: '',
//     selected: 0,
//     rejected: 0,
//     scheduled: 0
//   });
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchCount, setSearchCount] = useState(0);
//   const [isPremium, setIsPremium] = useState(false);
//   const [filters, setFilters] = useState({
//     skills: '',
//     experience: '',
//     location: ''
//   });
//   const [showFilterModal, setShowFilterModal] = useState(false);

//   // Animation value for cards
//   const fadeAnim = new Animated.Value(0);

//   // Add new state for advanced search
//   const [advancedSearch, setAdvancedSearch] = useState({
//     name: '',
//     skills: '',
//     experience: '',
//     location: '',
//     status: 'all'
//   });

//   // Add search loading state
//   const [searchLoading, setSearchLoading] = useState(false);

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 1000,
//       useNativeDriver: true,
//     }).start();
//   }, [applications]);

//   useEffect(() => {
//     if (route.params?.activeTab) {
//       setActiveStatus(route.params.activeTab);
//       fetchApplicationsByStatus(route.params.activeTab);
//     }
//   }, [route.params]);

//   const checkSubscriptionStatus = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('userData');
//       const { isPrime } = JSON.parse(userData);
//       setIsPremium(isPrime);
//     } catch (error) {
//       console.error('Error checking subscription:', error);
//     }
//   };

//   useEffect(() => {
//     checkSubscriptionStatus();
//   }, []);

//   const fetchApplicationsByStatus = async (status) => {
//     try {
//       setLoading(true);
//       const userData = await AsyncStorage.getItem('userData');
//       const parsedUserData = JSON.parse(userData); // ✅ Parse JSON safely

//       console.log("parsedUserData : " , parsedUserData)
//       const { _id: companyId } = JSON.parse(userData);
      
//       console.log('Fetching with companyId:', companyId); // Debug log

//       let endpoint;
//       switch (status) {
//         case 'shortlisted':
//           endpoint = `${BASE_URL}/api/user/getShortlistingData/${companyId}`;
//           break;
//         case 'rejected':
//           endpoint = `${BASE_URL}/api/user/getrejected/${companyId}`;
//           break;
       
//         default:
//           endpoint = `${BASE_URL}/api/user/getShortlistingData/${companyId}`;
//       }

//       console.log('Making request to:', endpoint); // Debug log

//       const response = await axios.get(endpoint);
//       console.log('API Response:', response.data);

//       if (response.data.success) {
//         const applications = response.data.data || [];
//         setApplications(applications);
//         updateStats(applications);
//         if (searchQuery || Object.values(filters).some(v => v)) {
//           setSearchCount(prev => prev + 1);
//         }
//       } else if (response.status === 404) {
//         // Handle 404 gracefully
//         setApplications([]);
//         updateStats([]);
//         setError('No applications found for this status');
//       } else {
//         setError(response.data.error || 'Failed to fetch applications');
//         setApplications([]);
//       }
//     } catch (error) {
//       console.error('Error fetching applications:', error.response || error);
//       setError(error.response?.data?.error || 'Failed to load applications');
//       setApplications([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const updateStats = (data) => {
//     const newStats = {
//       total: data.length,
//       shortlisted: data.filter(app => app.status === 'shortlisted').length,
//       selected: data.filter(app => app.status === 'selected').length,
//       rejected: data.filter(app => app.status === 'rejected').length,
//       scheduled: data.filter(app => app.status === 'scheduled').length
//     };
//     setStats(newStats);
//   };

//   const StatBox = ({ label, count, color, icon }) => (
//     <TouchableOpacity 
//       style={[styles.statBox, { borderLeftColor: color }]}
//       onPress={() => setActiveStatus(label.toLowerCase())}
//     >
//       <Icon name={icon} size={18} color={color} />
//       <Text style={styles.statCount}>{count}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </TouchableOpacity>
//   );

//   const SearchHeader = () => (
//     <View style={styles.searchHeader}>
//       <View style={styles.searchInputContainer}>
//         <Icon name="search" size={20} color="#9CA3AF" />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search by name or skills..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           onSubmitEditing={() => fetchApplicationsByStatus(activeStatus)}
//         />
//         {searchQuery && (
//           <TouchableOpacity onPress={() => setSearchQuery('')}>
//             <Icon name="close" size={18} color="#9CA3AF" />
//           </TouchableOpacity>
//         )}
//       </View>
//       <TouchableOpacity 
//         style={styles.filterButton}
//         onPress={() => setShowFilterModal(true)}
//       >
//         <Icon name="tune" size={20} color="#3B82F6" />
//       </TouchableOpacity>
//     </View>
//   );

//   const StatsRow = () => (
//     <View style={styles.statsRow}>
//       <StatBox label="Shortlisted" count={stats.shortlisted} color="#10B981" icon="person-add" />
//       <StatBox label="Selected" count={stats.selected} color="#6366F1" icon="check-circle" />
//       <StatBox label="Rejected" count={stats.rejected} color="#EF4444" icon="cancel" />
//       <StatBox label="Scheduled" count={stats.scheduled || 0} color="#F59E0B" icon="schedule" />
//     </View>
//   );

//   const renderApplicationCard = (application) => (
//     <Animated.View style={[styles.applicationCard, { opacity: fadeAnim }]}>
//       <TouchableOpacity
//         onPress={() => handleApplicationPress(application)}
//         style={styles.cardContent}
//       >
//         <View style={styles.cardHeader}>
//           <View style={styles.profileSection}>
//             <View style={styles.profileImageContainer}>
//               <Text style={styles.profileInitials}>
//                 {application.userId?.name?.charAt(0) || 'A'}
//               </Text>
//             </View>
//             <View style={styles.nameSection}>
//               <Text style={styles.applicantName}>
//                 {application.userId?.name || 'No Name'}
//               </Text>
//               <Text style={styles.jobTitle}>
//                 {application.companyId?.jobProfile || application.jobTitle || 'No Position'}
//               </Text>
//             </View>
//           </View>
//           <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
//             <Text style={styles.statusText}>{application.status}</Text>
//           </View>
//         </View>

//         <View style={styles.cardDetails}>
//           <View style={styles.detailItem}>
//             <Icon name="email" size={16} color="#6B7280" />
//             <Text style={styles.detailText}>{application.userId?.email || 'No email'}</Text>
//           </View>
//           <View style={styles.detailItem}>
//             <Icon name="business" size={16} color="#6B7280" />
//             <Text style={styles.detailText}>
//               {application.companyId?.CompanyName || 'Company Name'}
//             </Text>
//           </View>
//         </View>

//         {application.userId?.skills && (
//           <View style={styles.skillsContainer}>
//             {application.userId.skills.slice(0, 3).map((skill, index) => (
//               <View key={index} style={styles.skillBadge}>
//                 <Text style={styles.skillText}>{skill}</Text>
//               </View>
//             ))}
//             {application.userId.skills.length > 3 && (
//               <View style={styles.skillBadge}>
//                 <Text style={styles.skillText}>+{application.userId.skills.length - 3}</Text>
//               </View>
//             )}
//           </View>
//         )}

//         {application.status === 'shortlisted' && !application.isInterviewScheduled && (
//           <TouchableOpacity 
//             style={styles.scheduleButton}
//             onPress={() => navigation.navigate('InterviewScheduler', { application })}
//           >
//             <Icon name="schedule" size={20} color="#fff" />
//             <Text style={styles.scheduleButtonText}>Schedule Interview</Text>
//           </TouchableOpacity>
//         )}
//       </TouchableOpacity>
//     </Animated.View>
//   );

//   const getStatusColor = (status) => {
//     switch (status.toLowerCase()) {
//       case 'selected':
//         return '#10B981';
//       case 'shortlisted':
//         return '#3B82F6';
//       case 'rejected':
//         return '#EF4444';
//       default:
//         return '#6B7280';
//     }
//   };

//   const handleApplicationPress = (application) => {
//     setSelectedApplication(application);
//     setModalVisible(true);
//   };

//   const handleStatusUpdate = async (id, newStatus) => {
//     try {
//       // Update status through your API
//       const response = await axios.put(`${BASE_URL}/api/user/updateApplicationStatus/${id}`, {
//         status: newStatus
//       });

//       if (response.data.success) {
//         // Refresh the applications list
//         fetchApplicationsByStatus(activeStatus);
//       }
//     } catch (error) {
//       console.error('Error updating application status:', error);
//     }
//     setModalVisible(false);
//   };

//   // Modify the search function to handle advanced search
//   const handleSearch = async () => {
//     try {
//       setSearchLoading(true);
//       const userData = await AsyncStorage.getItem('userData');
//       const { _id: companyId } = JSON.parse(userData);

//       if (!isPremium && searchCount >= 5) {
//         navigation.navigate('SubscriptionPlans');
//         return;
//       }

//       const response = await axios.get(`${BASE_URL}/api/user/searchApplications/${companyId}`, {
//         params: {
//           ...advancedSearch,
//           searchQuery
//         }
//       });

//       if (response.data.success) {
//         setApplications(response.data.data || []);
//         updateStats(response.data.data);
//         if (searchQuery || Object.values(advancedSearch).some(v => v && v !== 'all')) {
//           setSearchCount(prev => prev + 1);
//         }
//         setShowFilterModal(false);
//       }
//     } catch (error) {
//       setError('Search failed. Please try again.');
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   // Update the FilterModal component
//   const FilterModal = () => (
//     <Modal
//       visible={showFilterModal}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={() => setShowFilterModal(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.filterModalContent}>
//           <View style={styles.filterModalHeader}>
//             <Text style={styles.filterModalTitle}>Advanced Search</Text>
//             <TouchableOpacity onPress={() => setShowFilterModal(false)}>
//               <Icon name="close" size={24} color="#134083" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.filterScrollView}>
//             <Text style={styles.filterLabel}>Candidate Name</Text>
//             <TextInput
//               style={styles.filterInput}
//               placeholder="Enter candidate name"
//               value={advancedSearch.name}
//               onChangeText={(text) => setAdvancedSearch(prev => ({ ...prev, name: text }))}
//             />

//             <Text style={styles.filterLabel}>Skills</Text>
//             <TextInput
//               style={styles.filterInput}
//               placeholder="e.g., React, Node.js, Python"
//               value={advancedSearch.skills}
//               onChangeText={(text) => setAdvancedSearch(prev => ({ ...prev, skills: text }))}
//             />

//             <Text style={styles.filterLabel}>Experience (years)</Text>
//             <TextInput
//               style={styles.filterInput}
//               placeholder="Minimum years of experience"
//               value={advancedSearch.experience}
//               onChangeText={(text) => setAdvancedSearch(prev => ({ ...prev, experience: text }))}
//               keyboardType="numeric"
//             />

//             <Text style={styles.filterLabel}>Location</Text>
//             <TextInput
//               style={styles.filterInput}
//               placeholder="City or country"
//               value={advancedSearch.location}
//               onChangeText={(text) => setAdvancedSearch(prev => ({ ...prev, location: text }))}
//             />

//             <Text style={styles.filterLabel}>Status</Text>
//             <View style={styles.statusButtons}>
//               {['all', 'shortlisted', 'selected', 'rejected'].map((status) => (
//                 <TouchableOpacity
//                   key={status}
//                   style={[
//                     styles.statusButton,
//                     advancedSearch.status === status && styles.activeStatusButton
//                   ]}
//                   onPress={() => setAdvancedSearch(prev => ({ ...prev, status }))}
//                 >
//                   <Text style={[
//                     styles.statusButtonText,
//                     advancedSearch.status === status && styles.activeStatusButtonText
//                   ]}>
//                     {status.charAt(0).toUpperCase() + status.slice(1)}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <TouchableOpacity 
//               style={styles.applyFilterButton}
//               onPress={handleSearch}
//               disabled={searchLoading}
//             >
//               {searchLoading ? (
//                 <ActivityIndicator color="#FFFFFF" size="small" />
//               ) : (
//                 <Text style={styles.applyFilterButtonText}>Search</Text>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={styles.clearFilterButton}
//               onPress={() => {
//                 setAdvancedSearch({
//                   name: '',
//                   skills: '',
//                   experience: '',
//                   location: '',
//                   status: 'all'
//                 });
//                 setSearchQuery('');
//               }}
//             >
//               <Text style={styles.clearFilterButtonText}>Clear All</Text>
//             </TouchableOpacity>

//             {!isPremium && (
//               <Text style={styles.searchCountText}>
//                 {5 - searchCount} searches remaining
//               </Text>
//             )}
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Applications</Text>
//         {!isPremium && (
//           <Text style={styles.searchLimit}>
//             {5 - searchCount} searches remaining
//           </Text>
//         )}
//       </View>

//       <SearchHeader />
//       <StatsRow />

//       <View style={styles.tabContainer}>
//         {['shortlisted', 'selected', 'rejected', 'scheduled'].map((status) => (
//           <TouchableOpacity
//             key={status}
//             style={[
//               styles.tab,
//               activeStatus === status && styles.activeTab
//             ]}
//             onPress={() => {
//               setActiveStatus(status);
//               fetchApplicationsByStatus(status);
//             }}
//           >
//             <Text style={[
//               styles.tabText,
//               activeStatus === status && styles.activeTabText
//             ]}>
//               {status.charAt(0).toUpperCase() + status.slice(1)}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <ScrollView
//         style={styles.content}
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={() => fetchApplicationsByStatus(activeStatus)}
//             colors={['#3B82F6']}
//           />
//         }
//       >
//         {loading ? (
//           <View style={styles.centerContainer}>
//             <ActivityIndicator size="large" color="#3B82F6" />
//           </View>
//         ) : error ? (
//           <View style={styles.errorContainer}>
//             <Icon name="error-outline" size={48} color="#EF4444" />
//             <Text style={styles.errorText}>{error}</Text>
//             <TouchableOpacity 
//               style={styles.retryButton}
//               onPress={() => fetchApplicationsByStatus(activeStatus)}
//             >
//               <Text style={styles.retryButtonText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         ) : applications.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Icon name="inbox" size={64} color="#9CA3AF" />
//             <Text style={styles.emptyText}>No applications found</Text>
//             <Text style={styles.emptySubtext}>
//               Applications will appear here once candidates apply
//             </Text>
//           </View>
//         ) : (
//           applications.map(renderApplicationCard)
//         )}
//       </ScrollView>

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <ApplicationDetails
//           application={selectedApplication}
//           onClose={() => setModalVisible(false)}
//           onStatusUpdate={(id, status) => {
//             handleStatusUpdate(id, status);
//             fetchApplicationsByStatus(activeStatus);
//           }}
//         />
//       </Modal>

//       <FilterModal />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F1F5F9",
//   },
//   header: {
//     backgroundColor: "#1E293B",
//     padding: 16,
//     paddingTop: 45,
//     borderBottomLeftRadius: 16,
//     borderBottomRightRadius: 16,
//     elevation: 4,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   searchLimit: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     opacity: 0.8,
//     marginTop: 4,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     margin: 12,
//     borderRadius: 12,
//     padding: 4,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   activeTab: {
//     backgroundColor: '#3B82F6',
//     elevation: 2,
//   },
//   tabText: {
//     fontSize: 12,
//     color: '#4B5563',
//   },
//   activeTabText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   applicationCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     marginHorizontal: 12,
//     marginBottom: 12,
//     elevation: 3,
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   cardContent: {
//     padding: 12,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   profileSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   profileImageContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 1,
//     backgroundColor: '#EFF6FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileInitials: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#3B82F6',
//   },
//   nameSection: {
//     gap: 4,
//   },
//   applicantName: {
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   jobTitle: {
//     fontSize: 13,
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   cardDetails: {
//     backgroundColor: '#F8FAFC',
//     borderRadius: 8,
//     padding: 8,
//     marginVertical: 8,
//   },
//   detailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     paddingVertical: 4,
//   },
//   detailText: {
//     fontSize: 13,
//   },
//   skillsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginTop: 12,
//   },
//   skillBadge: {
//     backgroundColor: '#EFF6FF',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#BFDBFE',
//   },
//   skillText: {
//     fontSize: 11,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//     backgroundColor: '#FFFFFF',
//     margin: 12,
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   emptyText: {
//     fontSize: 16,
//   },
//   emptySubtext: {
//     fontSize: 13,
//     color: '#64748B',
//     textAlign: 'center',
//     marginTop: 8,
//     lineHeight: 22,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//   },
//   errorText: {
//     fontSize: 16,
//     color: "#EF4444",
//     marginTop: 16,
//     marginBottom: 24,
//   },
//   retryButton: {
//     backgroundColor: "#3B82F6",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   searchHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     gap: 8,
//   },
//   searchInputContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: '#134083',
//   },
//   filterButton: {
//     padding: 8,
//     backgroundColor: '#EBF5FF',
//     borderRadius: 8,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     padding: 12,
//     backgroundColor: '#FFFFFF',
//     gap: 8,
//   },
//   statBox: {
//     flex: 1,
//     padding: 8,
//     backgroundColor: '#F8FAFC',
//     borderRadius: 8,
//     borderLeftWidth: 3,
//     alignItems: 'center',
//   },
//   statCount: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#134083',
//     marginVertical: 2,
//   },
//   statLabel: {
//     fontSize: 11,
//     color: '#6B7280',
//   },
//   searchCountText: {
//     textAlign: 'center',
//     color: '#64748B',
//     marginTop: 16,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   filterModalContent: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 16,
//     maxHeight: '80%',
//   },
//   filterModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   filterModalTitle: {
//     fontSize: 18,
//   },
//   filterScrollView: {
//     maxHeight: '80%',
//   },
//   filterLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#134083',
//     marginBottom: 8,
//     marginTop: 16,
//   },
//   filterInput: {
//     backgroundColor: '#F8FAFC',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 4,
//     fontSize: 14,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     color: '#134083',
//   },
//   applyFilterButton: {
//     backgroundColor: '#3B82F6',
//     padding: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 16,
//     elevation: 3,
//     shadowColor: "#1E40AF",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   applyFilterButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//   },
//   statusButtons: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginTop: 8,
//   },
//   statusButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     backgroundColor: '#F9FAFB',
//   },
//   activeStatusButton: {
//     backgroundColor: '#3B82F6',
//     borderColor: '#3B82F6',
//   },
//   statusButtonText: {
//     fontSize: 13,
//     color: '#4B5563',
//   },
//   activeStatusButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   clearFilterButton: {
//     marginTop: 12,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   clearFilterButtonText: {
//     color: '#6B7280',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   scheduleButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#10B981',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   scheduleButtonText: {
//     marginLeft: 8,
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
// });

// export default ApplicationStatus;

 

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Image,
  Dimensions,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApplicationDetails from "./ApplicationDetails";

const { width } = Dimensions.get('window');

const ApplicationStatus = ({ navigation, route }) => {
  const [applications, setApplications] = useState([]);
  const [originalApplications, setOriginalApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState('shortlisted');
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
    scheduled: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [filters, setFilters] = useState({
    skills: '',
    experience: '',
    location: ''
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Animation value for cards
  const fadeAnim = new Animated.Value(0);

  // Add new state for advanced search
  const [advancedSearch, setAdvancedSearch] = useState({
    name: '',
    skills: '',
    experience: '',
    location: '',
    status: 'all'
  });

  // Add search loading state
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [applications]);

  useEffect(() => {
    if (route.params?.activeTab) {
      setActiveStatus(route.params.activeTab);
      fetchApplicationsByStatus(route.params.activeTab);
    } else {
      fetchApplicationsByStatus('shortlisted');
    }
  }, [route.params]);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { isPrime } = JSON.parse(userData);
        setIsPremium(isPrime || false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  const fetchApplicationsByStatus = useCallback(async (status) => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('User data not found');
      }

      const parsedUserData = JSON.parse(userData);
      console.log("parsedUserData : ", parsedUserData);
      
      const companyId = parsedUserData._id;
      if (!companyId) {
        throw new Error('Company ID not found');
      }
      
      console.log('Fetching with companyId:', companyId);

      let endpoint;
      switch (status) {
        case 'shortlisted':
          endpoint = `${BASE_URL}/api/user/getShortlistingData/${companyId}`;
          break;
        case 'rejected':
          endpoint = `${BASE_URL}/api/user/getrejected/${companyId}`;
          break;
        case 'selected':
          endpoint = `${BASE_URL}/api/user/getselected/${companyId}`;
          break;
        case 'scheduled':
          endpoint = `${BASE_URL}/api/user/getscheduled/${companyId}`;
          break;
        default:
          endpoint = `${BASE_URL}/api/user/getShortlistingData/${companyId}`;
      }

      console.log('Making request to:', endpoint);

      const response = await axios.get(endpoint, {
        timeout: 10000, // 10 second timeout
      });
      
      console.log('API Response:', response.data);

      if (response.data.success) {
        const applicationsData = response.data.data || [];
        setApplications(applicationsData);
        setOriginalApplications(applicationsData);
        updateStats(applicationsData);
        
        if (searchQuery || Object.values(filters).some(v => v)) {
          setSearchCount(prev => prev + 1);
        }
      } else if (response.status === 404) {
        setApplications([]);
        setOriginalApplications([]);
        updateStats([]);
        setError('No applications found for this status');
      } else {
        setError(response.data.error || 'Failed to fetch applications');
        setApplications([]);
        setOriginalApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your internet connection.');
      } else if (error.response) {
        setError(error.response.data?.error || `Server error: ${error.response.status}`);
      } else if (error.request) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(error.message || 'Failed to load applications');
      }
      
      setApplications([]);
      setOriginalApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filters]);

  const updateStats = useCallback((data) => {
    const newStats = {
      total: data.length,
      shortlisted: data.filter(app => app.status === 'shortlisted').length,
      selected: data.filter(app => app.status === 'selected').length,
      rejected: data.filter(app => app.status === 'rejected').length,
      scheduled: data.filter(app => app.status === 'scheduled').length
    };
    setStats(newStats);
  }, []);

  // Optimized status update function
  const handleStatusUpdate = useCallback(async (applicationId, newStatus) => {
    try {
      setActionLoading(true);
      
      const response = await axios.put(
        `${BASE_URL}/api/user/updateApplicationStatus/${applicationId}`, 
        { status: newStatus },
        { timeout: 8000 }
      );

      if (response.data.success) {
        // Optimistically update the UI
        setApplications(prev => 
          prev.filter(app => app._id !== applicationId)
        );
        
        // Update stats immediately
        setStats(prev => ({
          ...prev,
          [activeStatus]: Math.max(0, prev[activeStatus] - 1),
          [newStatus]: prev[newStatus] + 1,
          total: prev.total
        }));

        Alert.alert(
          'Success', 
          `Application status updated to ${newStatus}`,
          [{ text: 'OK' }]
        );

        // Refresh data in background
        setTimeout(() => {
          fetchApplicationsByStatus(activeStatus);
        }, 500);
        
      } else {
        throw new Error(response.data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.error || 'Failed to update application status',
        [{ text: 'OK' }]
      );
    } finally {
      setActionLoading(false);
      setModalVisible(false);
    }
  }, [activeStatus, fetchApplicationsByStatus]);

  // Optimized search function
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() && Object.values(advancedSearch).every(v => !v || v === 'all')) {
      setApplications(originalApplications);
      return;
    }

    try {
      setSearchLoading(true);
      
      if (!isPremium && searchCount >= 5) {
        Alert.alert(
          'Search Limit Reached',
          'You have reached your free search limit. Upgrade to premium for unlimited searches.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => navigation.navigate('SubscriptionPlans') }
          ]
        );
        return;
      }

      const userData = await AsyncStorage.getItem('userData');
      const { _id: companyId } = JSON.parse(userData);

      const searchParams = {
        ...advancedSearch,
        searchQuery: searchQuery.trim(),
        status: activeStatus
      };

      // Remove empty search parameters
      Object.keys(searchParams).forEach(key => {
        if (!searchParams[key] || searchParams[key] === 'all') {
          delete searchParams[key];
        }
      });

      const response = await axios.get(`${BASE_URL}/api/user/searchApplications/${companyId}`, {
        params: searchParams,
        timeout: 8000
      });

      if (response.data.success) {
        const searchResults = response.data.data || [];
        setApplications(searchResults);
        updateStats(searchResults);
        
        if (Object.keys(searchParams).length > 1) { // More than just status
          setSearchCount(prev => prev + 1);
        }
        
        setShowFilterModal(false);
        
        if (searchResults.length === 0) {
          Alert.alert('No Results', 'No applications found matching your search criteria.');
        }
      } else {
        throw new Error(response.data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Search Error', 
        error.response?.data?.error || 'Search failed. Please try again.'
      );
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, advancedSearch, originalApplications, isPremium, searchCount, activeStatus, navigation, updateStats]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setAdvancedSearch({
      name: '',
      skills: '',
      experience: '',
      location: '',
      status: 'all'
    });
    setApplications(originalApplications);
    setShowFilterModal(false);
  }, [originalApplications]);

  // Optimized tab change
  const handleTabChange = useCallback((status) => {
    if (status !== activeStatus) {
      setActiveStatus(status);
      setSearchQuery('');
      setAdvancedSearch(prev => ({ ...prev, status: 'all' }));
      fetchApplicationsByStatus(status);
    }
  }, [activeStatus, fetchApplicationsByStatus]);

  const StatBox = ({ label, count, color, icon }) => (
    <TouchableOpacity 
      style={[styles.statBox, { borderLeftColor: color }]}
      onPress={() => handleTabChange(label.toLowerCase())}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={18} color={color} />
      <Text style={styles.statCount}>{count || 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const SearchHeader = () => (
    <View style={styles.searchHeader}>
      <View style={styles.searchInputContainer}>
        <Icon name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or skills..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
        activeOpacity={0.7}
      >
        <Icon name="tune" size={20} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );

  const StatsRow = () => (
    <View style={styles.statsRow}>
      <StatBox label="Shortlisted" count={stats.shortlisted} color="#10B981" icon="person-add" />
      <StatBox label="Selected" count={stats.selected} color="#6366F1" icon="check-circle" />
      <StatBox label="Rejected" count={stats.rejected} color="#EF4444" icon="cancel" />
      <StatBox label="Scheduled" count={stats.scheduled} color="#F59E0B" icon="schedule" />
    </View>
  );

  const renderApplicationCard = useCallback((application, index) => (
    <Animated.View 
      key={application._id || index} 
      style={[styles.applicationCard, { opacity: fadeAnim }]}
    >
      <TouchableOpacity
        onPress={() => handleApplicationPress(application)}
        style={styles.cardContent}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileInitials}>
                {application.userId?.name?.charAt(0)?.toUpperCase() || 'A'}
              </Text>
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.applicantName} numberOfLines={1}>
                {application.userId?.name || 'No Name'}
              </Text>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {application.companyId?.jobProfile || application.jobTitle || 'No Position'}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
            <Text style={styles.statusText}>{application.status?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Icon name="email" size={16} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {application.userId?.email || 'No email'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="business" size={16} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {application.companyId?.CompanyName || 'Company Name'}
            </Text>
          </View>
          {application.userId?.experience && (
            <View style={styles.detailItem}>
              <Icon name="work" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {application.userId.experience} years experience
              </Text>
            </View>
          )}
        </View>

        {application.userId?.skills && application.userId.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            {application.userId.skills.slice(0, 3).map((skill, skillIndex) => (
              <View key={skillIndex} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {application.userId.skills.length > 3 && (
              <View style={styles.skillBadge}>
                <Text style={styles.skillText}>+{application.userId.skills.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {application.status === 'shortlisted' && !application.isInterviewScheduled && (
          <TouchableOpacity 
            style={styles.scheduleButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('InterviewScheduler', { application });
            }}
            activeOpacity={0.8}
          >
            <Icon name="schedule" size={20} color="#fff" />
            <Text style={styles.scheduleButtonText}>Schedule Interview</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  ), [fadeAnim, navigation]);

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'selected':
        return '#10B981';
      case 'shortlisted':
        return '#3B82F6';
      case 'rejected':
        return '#EF4444';
      case 'scheduled':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  }, []);

  const handleApplicationPress = useCallback((application) => {
    setSelectedApplication(application);
    setModalVisible(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    clearSearch();
    fetchApplicationsByStatus(activeStatus);
  }, [activeStatus, fetchApplicationsByStatus, clearSearch]);

  // Memoized filter modal
  const FilterModal = useMemo(() => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Advanced Search</Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#134083" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.filterScrollView}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.filterLabel}>Candidate Name</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Enter candidate name"
              value={advancedSearch.name}
              onChangeText={(text) => setAdvancedSearch(prev => ({ ...prev, name: text }))}
              autoCapitalize="words"
            />

            <Text style={styles.filterLabel}>Skills</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="e.g., React, Node.js, Python"
              value={advancedSearch.skills}
              onChangeText={(text) => setAdvancedSearch(prev => ({ ...prev, skills: text }))}
              multiline
            />

            <Text style={styles.filterLabel}>Minimum Experience (years)</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="e.g., 2"
              value={advancedSearch.experience}
              onChangeText={(text) => setAdvancedSearch(prev => ({ ...prev, experience: text }))}
              keyboardType="numeric"
            />

            <Text style={styles.filterLabel}>Location</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="City or country"
              value={advancedSearch.location}
              onChangeText={(text) => setAdvancedSearch(prev => ({ ...prev, location: text }))}
              autoCapitalize="words"
            />

            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.statusButtons}>
              {['all', 'shortlisted', 'selected', 'rejected', 'scheduled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    advancedSearch.status === status && styles.activeStatusButton
                  ]}
                  onPress={() => setAdvancedSearch(prev => ({ ...prev, status }))}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusButtonText,
                    advancedSearch.status === status && styles.activeStatusButtonText
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.applyFilterButton, searchLoading && styles.disabledButton]}
              onPress={handleSearch}
              disabled={searchLoading}
              activeOpacity={0.8}
            >
              {searchLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Icon name="search" size={20} color="#FFFFFF" />
                  <Text style={styles.applyFilterButtonText}>Apply Search</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={clearSearch}
              activeOpacity={0.7}
            >
              <Icon name="clear" size={18} color="#6B7280" />
              <Text style={styles.clearFilterButtonText}>Clear All</Text>
            </TouchableOpacity>

            {!isPremium && (
              <View style={styles.searchLimitContainer}>
                <Icon name="info" size={16} color="#F59E0B" />
                <Text style={styles.searchCountText}>
                  {Math.max(0, 5 - searchCount)} searches remaining (Free Plan)
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  ), [showFilterModal, advancedSearch, searchLoading, isPremium, searchCount, handleSearch, clearSearch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Applications</Text>
        {!isPremium && (
          <Text style={styles.searchLimit}>
            {Math.max(0, 5 - searchCount)} searches remaining
          </Text>
        )}
      </View>

      <SearchHeader />
      <StatsRow />

      <View style={styles.tabContainer}>
        {['shortlisted', 'selected', 'rejected', 'scheduled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.tab,
              activeStatus === status && styles.activeTab
            ]}
            onPress={() => handleTabChange(status)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              activeStatus === status && styles.activeTabText
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading applications...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => fetchApplicationsByStatus(activeStatus)}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No applications found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || Object.values(advancedSearch).some(v => v && v !== 'all') 
                ? 'Try adjusting your search criteria' 
                : 'Applications will appear here once candidates apply'
              }
            </Text>
            {(searchQuery || Object.values(advancedSearch).some(v => v && v !== 'all')) && (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={clearSearch}
                activeOpacity={0.7}
              >
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          applications.map(renderApplicationCard)
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedApplication && (
          <ApplicationDetails
            application={selectedApplication}
            onClose={() => setModalVisible(false)}
            onStatusUpdate={handleStatusUpdate}
            loading={actionLoading}
          />
        )}
      </Modal>

      {FilterModal}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    backgroundColor: "#1E293B",
    padding: 16,
    paddingTop: 45,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  searchLimit: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
    elevation: 2,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  profileImageContainer:{
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  nameSection: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "600",
    color: '#1F2937',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: '#FFFFFF',
  },
  cardDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  skillText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '600',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  scheduleButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  clearSearchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 12,
    elevation: 2,
    minHeight: 300,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#134083',
    marginHorizontal: 8,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#EBF5FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderLeftWidth: 4,
    alignItems: 'center',
    elevation: 1,
  },
  statCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#134083',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#134083',
  },
  closeButton: {
    padding: 4,
  },
  filterScrollView: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 8,
    marginTop: 16,
  },
  filterInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#134083',
    marginBottom: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  activeStatusButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    elevation: 2,
  },
  statusButtonText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  activeStatusButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  applyFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    elevation: 3,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  applyFilterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  clearFilterButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  searchLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  searchCountText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ApplicationStatus; 