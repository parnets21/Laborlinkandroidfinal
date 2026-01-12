// "use client"
// import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from "react-native"
// import Icon from "react-native-vector-icons/MaterialIcons"
// import { useState, useEffect } from "react"
// import { useNavigation } from '@react-navigation/native'
// import avtarr from "../assets/avtar.png"
// // Dummy data
// const recentActivities = ["iOS, Mohali", "Remote job", "Full time", "UI/UX designer", "Product designer", "Graphics designer"]

// const BASE_URL = 'http://localhost:8500'; // For Android Emulator
// // const BASE_URL = 'http://localhost:8500'; // For iOS Simulator

// const popularJobs = [
//   {
//     id: 1,
//     title: "UI/UX Designer",
//     company: "Google",
//     location: "California",
//     salary: "$45/hr",
//     logo: "🎨",
//     bgColor: '#2596be'
//   },
//   {
//     id: 2,
//     title: "Product Manager",
//     company: "Microsoft",
//     location: "Seattle",
//     salary: "$55/hr",
//     logo: "💼",
//     bgColor: '#e6de91'
//   },
//   {
//     id: 3,
//     title: "Frontend Developer",
//     company: "Apple",
//     location: "New York",
//     salary: "$50/hr",
//     logo: "💻",
//     bgColor: '#EC4899'
//   }
// ];

// const suggestedJobs = [
//   {
//     id: 1,
//     title: "Product Designer",
//     company: "Netflix",
//     location: "Los Angeles",
//     salary: "$115k - $140k",
//     logo: "🎬",
//     bgColor: '#E50914',
//     skills: ["UI/UX", "Figma", "Prototyping"]
//   },
//   {
//     id: 2,
//     title: "DevOps Engineer",
//     company: "Microsoft",
//     location: "Seattle",
//     salary: "$125k - $155k",
//     logo: "⚙️",
//     bgColor: '#00A4EF',
//     skills: ["AWS", "Docker", "Kubernetes"]
//   },
//   {
//     id: 3,
//     title: "Data Scientist",
//     company: "Tesla",
//     location: "Austin",
//     salary: "$130k - $160k",
//     logo: "🚗",
//     bgColor: '#CC0000',
//     skills: ["Python", "ML", "TensorFlow"]
//   }
// ];

// const recommendedJobs = [
//   {
//     id: 1,
//     title: "Backend Developer",
//     company: "Amazon",
//     location: "Remote",
//     salary: "$140k - $170k",
//     logo: "📦",
//     bgColor: '#FF9900',
//     matchRate: "97%"
//   },
//   {
//     id: 2,
//     title: "Cloud Architect",
//     company: "Oracle",
//     location: "Austin",
//     salary: "$150k - $180k",
//     logo: "☁️",
//     bgColor: '#F80000',
//     matchRate: "94%"
//   },
//   {
//     id: 3,
//     title: "ML Engineer",
//     company: "Intel",
//     location: "Santa Clara",
//     salary: "$135k - $165k",
//     logo: "🤖",
//     bgColor: '#0071C5',
//     matchRate: "91%"
//   }
// ];

// const topCompanies = [
//   {
//     id: 1,
//     name: "Google",
//     logo: "🎯",
//     openPositions: 156,
//     rating: 4.8,
//   },
//   {
//     id: 2,
//     name: "Apple",
//     logo: "🍎",
//     openPositions: 98,
//     rating: 4.7,
//   },
//   {
//     id: 3,
//     name: "Meta",
//     logo: "📱",
//     openPositions: 124,
//     rating: 4.6,
//   },
// ]

// const activeJobs = [
//   {
//     id: 1,
//     title: "iOS Developer",
//     company: "Soft-Tech Ltd.",
//     logo: "🟣",
//     experience: "3 - 5 years",
//     skills: "iOS, Payment gateway",
//     location: "Mumbai",
//     timeAgo: "5 hrs ago",
//   },
//   {
//     id: 2,
//     title: "UI designer",
//     company: "Onri Software",
//     logo: "🟡",
//     experience: "2 - 5 years",
//     skills: "UI/UX design, Xd",
//     location: "Kolkata",
//     timeAgo: "6 hrs ago",
//   },
// ]

// // Add new notification data
// const notifications = [
//   {
//     id: 1,
//     type: "interview",
//     title: "Interview Scheduled",
//     message: "Your interview with Apple Inc. is scheduled for tomorrow at 2 PM",
//     time: "2h ago",
//     icon: "event",
//     color: "#4F46E5",
//   },
//   {
//     id: 2,
//     type: "application",
//     title: "Application Viewed",
//     message: "Google has viewed your application for Senior UI Designer",
//     time: "5h ago",
//     icon: "visibility",
//     color: "#059669",
//   },
//   {
//     id: 3,
//     type: "message",
//     title: "New Message",
//     message: "HR from Meta sent you a message regarding your application",
//     time: "1d ago",
//     icon: "mail",
//     color: "#0EA5E9",
//   },
// ]

// const JobCategories = [
//   {
//     id: 1,
//     title: "Popular Jobs",
//     jobs: [
//       {
//         id: 1,
//         role: "UI/UX Designer",
//         company: "Microsoft",
//         logo: "🪟",
//         bgColor: "#8B5CF6", // Purple
//         location: "San Francisco",
//         salary: "$120k/year",
//       },
//       // ... more jobs
//     ]
//   },
//   {
//     id: 2,
//     title: "Recent Jobs",
//     jobs: [
//       {
//         id: 1,
//         role: "Senior Product Designer",
//         company: "Facebook",
//         logo: "📘",
//         bgColor: "#60A5FA", // Light blue
//         location: "Remote",
//         salary: "$140k/year",
//       },
//       // ... more jobs
//     ]
//   },
//   {
//     id: 3,
//     title: "Featured Jobs",
//     jobs: [
//       {
//         id: 1,
//         role: "Marketing Head",
//         company: "Medium",
//         logo: "📝",
//         bgColor: "#34D399", // Green
//         location: "New York",
//         salary: "$160k/year",
//       },
//       // ... more jobs
//     ]
//   },
// ]

// const JobCard = ({ job, navigation }) => (
//   <TouchableOpacity 
//     style={[styles.featuredJobCard, { backgroundColor: job.bgColor }]}
//     onPress={() => {
//       console.log('Job card pressed');
//       navigation.navigate('JobDetails', { job });
//     }}
//   >
//     <View style={styles.jobCardHeader}>
//       <View style={styles.companyLogo}>
//         <Text style={styles.logoText}>{job.logo}</Text>
//       </View>
//       <TouchableOpacity>
//         <Icon name="favorite-border" size={20} color="#fff" />
//       </TouchableOpacity>
//     </View>
//     <Text style={styles.jobTitle}>{job.title}</Text>
//     <Text style={styles.jobCompany}>{job.company}</Text>
//     <View style={styles.jobDetails}>
//       <View style={styles.detailPill}>
//         <Icon name="location-on" size={16} color="#fff" />
//         <Text style={styles.detailText}>{job.location}</Text>
//       </View>
//       <View style={styles.detailPill}>
//         <Icon name="attach-money" size={16} color="#fff" />
//         <Text style={styles.detailText}>{job.salary}</Text>
//       </View>
//     </View>
//   </TouchableOpacity>
// );

// const HorizontalJobList = ({ title, jobs, navigation }) => (
//   <View style={styles.section}>
//     <View style={styles.sectionHeader}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       <TouchableOpacity onPress={() => navigation.navigate('AllJobs')}>
//         <Text style={styles.seeAllButton}>See all</Text>
//       </TouchableOpacity>
//     </View>
//     <ScrollView 
//       horizontal 
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={styles.jobsScrollContainer}
//     >
//       {jobs?.map(job => (
//         <JobCard key={job.id} job={job} navigation={navigation} />
//       ))}
//     </ScrollView>
//   </View>
// );

// // Add these new dummy data sections
// const activelyHiring = [
//   {
//     id: 1,
//     title: "Lead Developer",
//     company: "Spotify",
//     location: "Stockholm",
//     salary: "$130k - $150k",
//     logo: "🎵",
//     bgColor: '#4F46E5',
//     matchRate: "95%"
//   },
//   {
//     id: 2,
//     title: "Senior Engineer",
//     company: "Adobe",
//     location: "San Jose",
//     salary: "$125k - $145k",
//     logo: "🎨",
//     bgColor: '#DC2626',
//     matchRate: "92%"
//   },
//   {
//     id: 3,
//     title: "Tech Lead",
//     company: "LinkedIn",
//     location: "Remote",
//     salary: "$140k - $160k",
//     logo: "💼",
//     bgColor: '#0284C7',
//     matchRate: "88%"
//   }
// ];

// const matchingJobs = [
//   {
//     id: 1,
//     title: "Mobile Developer",
//     company: "Twitter",
//     location: "Remote",
//     salary: "$110k - $130k",
//     logo: "📱",
//     bgColor: '#0EA5E9',
//     skills: ["React Native", "TypeScript", "Redux"]
//   },
//   {
//     id: 2,
//     title: "Full Stack Developer",
//     company: "Airbnb",
//     location: "San Francisco",
//     salary: "$130k - $150k",
//     logo: "🏠",
//     bgColor: '#F43F5E',
//     skills: ["React", "Node.js", "MongoDB"]
//   },
//   {
//     id: 3,
//     title: "Frontend Engineer",
//     company: "Dropbox",
//     location: "Remote",
//     salary: "$120k - $140k",
//     logo: "📦",
//     bgColor: '#3B82F6',
//     skills: ["React", "JavaScript", "CSS"]
//   }
// ];

// const EmployeeDashboard = ({ navigation }) => {
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedPostedIn, setSelectedPostedIn] = useState('');
//   const [selectedDistance, setSelectedDistance] = useState('');
//   const [selectedSalary, setSelectedSalary] = useState('');
//   const [showMenu, setShowMenu] = useState(false);
//   const [isToggleOpen, setIsToggleOpen] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [showFilter, setShowFilter] = useState(false);
//   const [filters, setFilters] = useState({
//     jobType: 'all',
//     experience: 'all',
//     salary: 'all',
//     location: 'all'
//   });
//   const [popularJobsData, setPopularJobsData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [allJobsData, setAllJobsData] = useState([]);
//   const [suggestedJobsData, setSuggestedJobsData] = useState([]);
//   const [recommendedJobsData, setRecommendedJobsData] = useState([]);
//   const [activelyHiringData, setActivelyHiringData] = useState([]);

//   // Add this function to fetch popular jobs
//   const fetchPopularJobs = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`${BASE_URL}/api/user/popular`);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch popular jobs');
//       }

//       const result = await response.json();
      
//       if (result.success) {
//         // Transform the API data to match your existing job card structure
//         const transformedJobs = result.data.map(job => ({
//           id: job._id,
//           title: job.title || 'No Title',
//           company: job.employerDetails?.companyName || 'Unknown Company',
//           location: job.location || 'Location not specified',
//           salary: job.salarytype || 'Salary not specified',
//           logo: '💼', // You can customize this based on company or job type
//           bgColor: getRandomColor(), // Helper function to generate colors
//           description: job.description,
//           workMode: job.workMode,
//           applicationCount: job.applicationCount,
//           interviewerName: job.interviewername,
//           isPrime: job.isPrime,
//           status: job.status,
//           employerDetails: job.employerDetails
//         }));

//         setPopularJobsData(transformedJobs);
//       } else {
//         throw new Error(result.error || 'Failed to fetch jobs');
//       }
//     } catch (error) {
//       console.error('Error fetching popular jobs:', error);
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Helper function to generate random colors for job cards
//   const getRandomColor = () => {
//     const colors = ['#2596be', '#e6de91', '#EC4899', '#4F46E5', '#059669'];
//     return colors[Math.floor(Math.random() * colors.length)];
//   };

//   // Add useEffect to fetch data when component mounts
//   useEffect(() => {
//     fetchPopularJobs();
//   }, []);

//   // Common job press handler
//   const handleJobPress = (job) => {
//     console.log('Job card pressed');
//     navigation.navigate('JobDetails', {
//       job: {
//         title: job.title,
//         company: job.company,
//         location: job.location,
//         salary: job.salary,
//         logo: job.logo || job.company.charAt(0),
//         type: ["Full Time", "Remote Work"],
//         requirements: [
//           `3+ years of experience in ${job.title} or similar role`,
//           "Strong portfolio of previous work",
//           "Excellent communication skills",
//           "Ability to work in a fast-paced environment",
//           "Problem-solving mindset",
//           "Team player with leadership qualities"
//         ],
//         description: [
//           `We are seeking a talented ${job.title} to join our team.`,
//           "You will be working on cutting-edge projects with the latest technologies.",
//           "Opportunity to make a significant impact in a growing company."
//         ],
//         companyInfo: {
//           about: `${job.company} is a leading company in the technology sector.`,
//           founded: "2000",
//           employees: "10,000+",
//           industry: "Technology"
//         },
//         reviews: [
//           {
//             id: 1,
//             rating: 5,
//             author: "Former Employee",
//             position: job.title,
//             comment: "Great work environment and culture.",
//             date: "1 month ago"
//           },
//           {
//             id: 2,
//             rating: 4,
//             author: "Current Employee",
//             position: "Senior " + job.title,
//             comment: "Good benefits and work-life balance.",
//             date: "2 months ago"
//           }
//         ]
//       }
//     });
//   };

//   // Update your existing renderPopularJob function
//   const renderPopularJob = (job) => (
//     <TouchableOpacity
//       key={job.id}
//       style={[styles.popularJobCard, { backgroundColor: job.bgColor }]}
//       onPress={() => handleJobPress(job)}
//     >
//       <View style={styles.jobCardHeader}>
//         <View style={styles.companyLogo}>
//           <Text style={styles.logoText}>{job.logo}</Text>
//           {job.isPrime && (
//             <View style={styles.primeBadge}>
//               <Text style={styles.primeText}>Prime</Text>
//             </View>
//           )}
//         </View>
//         <TouchableOpacity>
//           <Icon name="favorite-border" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//       <Text style={styles.jobTitle}>{job.title}</Text>
//       <Text style={styles.jobCompany}>{job.company}</Text>
//       <View style={styles.jobDetails}>
//         <View style={styles.detailPill}>
//           <Icon name="location-on" size={16} color="#fff" />
//           <Text style={styles.detailText}>{job.location}</Text>
//         </View>
//         <View style={styles.detailPill}>
//           <Icon name="attach-money" size={16} color="#fff" />
//           <Text style={styles.detailText}>{job.salary}</Text>
//         </View>
//       </View>
//       {job.applicationCount > 0 && (
//         <View style={styles.applicationCount}>
//           <Text style={styles.applicationCountText}>
//             {job.applicationCount} applications
//           </Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   // Popular Jobs render function
//   // const renderPopularJob = (job) => (
//   //   <TouchableOpacity
//   //     key={job.id}
//   //     style={[styles.popularJobCard, { backgroundColor: job.bgColor }]}
//   //     onPress={() => handleJobPress(job)}
//   //   >
//   //     <View style={styles.jobCardHeader}>
//   //       <View style={styles.companyLogo}>
//   //         <Text style={styles.logoText}>{job.logo}</Text>
//   //       </View>
//   //       <TouchableOpacity>
//   //         <Icon name="favorite-border" size={20} color="#fff" />
//   //       </TouchableOpacity>
//   //     </View>
//   //     <Text style={styles.jobTitle}>{job.title}</Text>
//   //     <Text style={styles.jobCompany}>{job.company}</Text>
//   //     <View style={styles.jobDetails}>
//   //       <View style={styles.detailPill}>
//   //         <Icon name="location-on" size={16} color="#fff" />
//   //         <Text style={styles.detailText}>{job.location}</Text>
//   //       </View>
//   //       <View style={styles.detailPill}>
//   //         <Icon name="attach-money" size={16} color="#fff" />
//   //         <Text style={styles.detailText}>{job.salary}</Text>
//   //       </View>
//   //     </View>
//   //   </TouchableOpacity>
//   // );

//   // Suggested Jobs render function
//   const renderSuggestedJob = (job) => (
//     <TouchableOpacity
//       key={job.id}
//       style={[styles.suggestedJobCard, { backgroundColor: job.bgColor }]}
//       onPress={() => handleJobPress(job)}
//     >
//       <View style={styles.jobCardHeader}>
//         <View style={styles.companyLogo}>
//           <Text style={styles.logoText}>{job.logo}</Text>
//         </View>
//         <TouchableOpacity>
//           <Icon name="favorite-border" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//       <Text style={styles.jobTitle}>{job.title}</Text>
//       <Text style={styles.jobCompany}>{job.company}</Text>
//       <View style={styles.jobDetails}>
//         <View style={styles.detailPill}>
//           <Icon name="location-on" size={16} color="#fff" />
//           <Text style={styles.detailText}>{job.location}</Text>
//         </View>
//         <View style={styles.detailPill}>
//           <Icon name="attach-money" size={16} color="#fff" />
//           <Text style={styles.detailText}>{job.salary}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   // Recommended Jobs render function
//   const renderRecommendedJob = (job) => (
//     <TouchableOpacity
//       key={job.id}
//       style={[styles.recommendedJobCard, { backgroundColor: job.bgColor }]}
//       onPress={() => handleJobPress(job)}
//     >
//       <View style={styles.jobCardHeader}>
//         <View style={styles.companyLogo}>
//           <Text style={styles.logoText}>{job.logo}</Text>
//         </View>
//         <TouchableOpacity>
//           <Icon name="favorite-border" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//       <Text style={styles.jobTitle}>{job.title}</Text>
//       <Text style={styles.jobCompany}>{job.company}</Text>
//       <View style={styles.jobDetails}>
//         <View style={styles.detailPill}>
//           <Icon name="location-on" size={16} color="#fff" />
//           <Text style={styles.detailText}>{job.location}</Text>
//         </View>
//         <View style={styles.detailPill}>
//           <Icon name="attach-money" size={16} color="#fff" />
//           <Text style={styles.detailText}>{job.salary}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   // Update your toggle menu navigation
//   const handleSettingsPress = () => {
//     console.log('Navigating to Settings'); // For debugging
//     setIsToggleOpen(false);
//     navigation.navigate('Settings');
//   };

//   // Helper function to transform job data
//   const transformJobData = (job) => ({
//     id: job._id,
//     title: job.jobtitle || 'No Title',
//     company: job.companyName || 'Unknown Company',
//     location: job.location || 'Location not specified',
//     salary: `₹${job.minSalary || 0} - ₹${job.maxSalary || 0}`,
//     logo: '💼', // You can customize based on company industry
//     bgColor: getRandomColor(),
//     description: job.description,
//     workMode: job.typeofwork,
//     experience: job.experiencerequired,
//     skills: job.skill ? job.skill.split(',').map(s => s.trim()) : [],
//     benefits: job.benefits ? job.benefits.split(',').map(b => b.trim()) : [],
//     isPrime: job.isPrime,
//     status: job.status,
//     companyDetails: {
//       industry: job.companyindustry,
//       website: job.companywebsite,
//       address: job.companyaddress,
//       mobile: job.companymobile
//     }
//   });

//   // Fetch all jobs
//   const fetchAllJobs = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`${BASE_URL}/api/user/getAllJobs`);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch jobs');
//       }

//       const result = await response.json();
//       console.log('API Response:', result);
      
//       if (result && Array.isArray(result.success)) {
//         const transformedJobs = result.success.map(job => ({
//           id: job._id,
//           title: job.jobtitle || 'No Title',
//           company: job.companyName || 'Unknown Company',
//           location: job.location || 'Location not specified',
//           salary: `₹${job.minSalary || 0} - ₹${job.maxSalary || 0}`,
//           logo: '💼',
//           bgColor: getRandomColor(),
//           description: job.description,
//           workMode: job.typeofwork,
//           experience: job.experiencerequired,
//           skills: job.skill ? job.skill.split(',').map(s => s.trim()) : [],
//           benefits: job.benefits ? job.benefits.split(',').map(b => b.trim()) : [],
//           isPrime: job.isPrime,
//           status: job.status
//         }));
        
//         setPopularJobsData(transformedJobs);
//         setAllJobsData(transformedJobs);
//         setSuggestedJobsData(transformedJobs.filter(job => 
//           job.experience && parseInt(job.experience) <= 2
//         ));
//         setRecommendedJobsData(transformedJobs.filter(job => job.isPrime));
//         setActivelyHiringData(transformedJobs.slice(0, 5));
//       } else {
//         throw new Error('Invalid API response structure');
//       }
//     } catch (error) {
//       console.error('Error fetching jobs:', error);
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Update useEffect to use the new fetchAllJobs function
//   useEffect(() => {
//     fetchAllJobs();
//   }, []);

//   // Update the job card to include new fields
//   const renderJobCard = (job) => (
//     <TouchableOpacity
//       key={job.id}
//       style={[styles.jobCard, { backgroundColor: job.bgColor }]}
//       onPress={() => handleJobPress(job)}
//     >
//       <View style={styles.jobCardHeader}>
//         <View style={styles.companyLogo}>
//           <Text style={styles.logoText}>{job.logo}</Text>
//           {job.isPrime && (
//             <View style={styles.primeBadge}>
//               <Text style={styles.primeText}>Prime</Text>
//             </View>
//           )}
//         </View>
//         <TouchableOpacity>
//           <Icon name="favorite-border" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//       <Text style={styles.jobTitle}>{job.title}</Text>
//       <Text style={styles.jobCompany}>{job.company}</Text>
//       <View style={styles.jobDetails}>
//         <View style={styles.detailPill}>
//           <Icon name="location-on" size={16} color="#fff" />
//           <Text style={styles.detailText}>{job.location}</Text>
//         </View>
//         <View style={styles.detailPill}>
//           <Icon name="attach-money" size={16} color="#fff" />
//           <Text style={styles.detailText}>{job.salary}</Text>
//         </View>
//       </View>
//       {job.skills && job.skills.length > 0 && (
//         <View style={styles.skillsContainer}>
//           {job.skills.slice(0, 2).map((skill, index) => (
//             <View key={index} style={styles.skillBadge}>
//               <Text style={styles.skillText}>{skill}</Text>
//             </View>
//           ))}
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   // Update the sections to handle empty data
//   const renderSection = (title, data, renderFunction) => (
//     <View style={styles.section}>
//       <View style={styles.sectionHeader}>
//         <Text style={styles.sectionTitle}>{title}</Text>
//         <TouchableOpacity>
//           <Text style={styles.seeAllButton}>See all</Text>
//         </TouchableOpacity>
//       </View>
//       {isLoading ? (
//         <ActivityIndicator size="large" color="#4B6BFB" />
//       ) : error ? (
//         <Text style={styles.errorText}>{error}</Text>
//       ) : data.length > 0 ? (
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           {data.map(renderFunction)}
//         </ScrollView>
//       ) : (
//         <Text style={styles.noDataText}>No jobs available</Text>
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Enhanced Header */}
//       <View style={styles.header}>
//         {/* Top Row with Toggle, Greeting, and Profile */}
//         <View style={styles.headerTop}>
//           <View style={styles.leftSection}>
//             <TouchableOpacity 
//               style={styles.toggleButton}
//               onPress={() => setIsToggleOpen(!isToggleOpen)}
//             >
//               <Icon name="menu" size={24} color="#fff" />
//             </TouchableOpacity>
//             <View style={styles.greetingSection}>
//               <Text style={styles.greetingText}>Hi, Good Morning</Text>
//               <Text style={styles.userName}>Ms. Sugat</Text>
//             </View>
//           </View>
//           <TouchableOpacity 
//             style={styles.profileToggle}
//             onPress={() => navigation.navigate('Profile')}
//           >
//             <Text style={styles.profileAvatar}>👨‍💻</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Search Bar */}
//         <View style={styles.searchContainer}>
//           <View style={styles.searchBar}>
//             <Icon name="search" size={20} color="#9CA3AF" />
//             <TextInput
//               placeholder="Find your dream job"
//               placeholderTextColor="#9CA3AF"
//               style={styles.searchInput}
//             />
//             <TouchableOpacity 
//               style={styles.filterButton}
//               onPress={() => setShowFilter(true)}
//             >
//               <Icon name="tune" size={20} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Title */}
//       </View>

//       <ScrollView style={styles.content}>
//         {renderSection('Popular Jobs', allJobsData, renderJobCard)}
//         {renderSection('Suggested Jobs', suggestedJobsData, renderJobCard)}
//         {renderSection('Recommended Jobs', recommendedJobsData, renderJobCard)}
//         {renderSection('Actively Hiring', activelyHiringData, renderJobCard)}
//       </ScrollView>

//       {showMenu && (
//         <MenuOverlay navigation={navigation} />
//       )}

//       {/* Toggle Menu */}
//       <View style={[
//         styles.toggleMenu, 
//         isToggleOpen ? styles.toggleMenuOpen : null
//       ]}>
//         <View style={styles.toggleHeader}>
//           <Text style={styles.toggleTitle}>Menu</Text>
//           <TouchableOpacity 
//             style={styles.toggleCloseButton}
//             onPress={() => setIsToggleOpen(false)}
//           >
//             <Icon name="close" size={24} color="#fff" />
//           </TouchableOpacity>
//         </View>

//         {/* Menu Items */}
//         <View style={styles.menuItems}>
//           {/* Home */}
//           <TouchableOpacity 
//             style={styles.toggleMenuItem}
//             onPress={() => {
//               setIsToggleOpen(false);
//               navigation.navigate('Home');
//             }}
//           >
//             <Icon name="home" size={24} color="#fff" />
//             <Text style={styles.toggleMenuText}>Home</Text>
//           </TouchableOpacity>

//           {/* Referral Program */}
//           <TouchableOpacity 
//             style={styles.toggleMenuItem}
//             onPress={() => {
//               setIsToggleOpen(false);
//               navigation.navigate('ReferralSystem');
//             }}
//           >
//             <Icon name="group-add" size={24} color="#fff" />
//             <Text style={styles.toggleMenuText}>Referral Program</Text>
//           </TouchableOpacity>

//           {/* Profile Lock */}
//           <TouchableOpacity 
//             style={styles.toggleMenuItem}
//             onPress={() => {
//               setIsToggleOpen(false);
//               navigation.navigate('ProfileLockStatus');
//             }}
//           >
//             <Icon name="lock" size={24} color="#fff" />
//             <Text style={styles.toggleMenuText}>Profile Lock</Text>
//           </TouchableOpacity>

//           {/* Settings */}
//           <TouchableOpacity 
//             style={styles.toggleMenuItem}
//             onPress={handleSettingsPress}
//           >
//             <Icon name="settings" size={24} color="#fff" />
//             <Text style={styles.toggleMenuText}>Settings</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {selectedJob && (
//         <View style={styles.jobDetailOverlay}>
//           <ScrollView style={styles.jobDetailContent}>
//             <TouchableOpacity 
//               style={styles.closeButton}
//               onPress={() => setSelectedJob(null)}
//             >
//               <Icon name="close" size={24} color="#fff" />
//             </TouchableOpacity>

//             <View style={styles.companyHeader}>
//               <View style={styles.logoContainer}>
//                 <Text style={styles.logoText}>
//                   {selectedJob.employer_name?.charAt(0) || 'G'}
//                 </Text>
//               </View>
//               <View style={styles.jobTypeContainer}>
//                 <View style={styles.jobTypeTag}>
//                   <Text style={styles.jobTypeText}>
//                     {selectedJob.job_employment_type || 'Full Time'}
//                   </Text>
//                 </View>
//                 <View style={styles.jobTypeTag}>
//                   <Text style={styles.jobTypeText}>Remote Work</Text>
//                 </View>
//               </View>
//             </View>

//             <Text style={styles.jobDetailTitle}>{selectedJob.job_title}</Text>
//             <Text style={styles.jobLocation}>{selectedJob.job_country}</Text>

//             <View style={styles.tabContainer}>
//               <Text style={[styles.tabText, styles.activeTab]}>Description</Text>
//               <Text style={styles.tabText}>Company</Text>
//               <Text style={styles.tabText}>Applicant</Text>
//               <Text style={styles.tabText}>Contact Info</Text>
//             </View>

//             <View style={styles.requirementsSection}>
//               <Text style={styles.sectionTitle}>Requirements</Text>
//               {/* Add your requirements list here */}
//               {dummyRequirements.map((req, index) => (
//                 <View key={index} style={styles.requirementItem}>
//                   <Text style={styles.bulletPoint}>•</Text>
//                   <Text style={styles.requirementText}>{req}</Text>
//                 </View>
//               ))}
//             </View>

//             <TouchableOpacity style={styles.applyButton}>
//               <Text style={styles.applyButtonText}>Apply Now</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>
//       )}

//       <FilterOverlay 
//         visible={showFilter}
//         currentFilters={filters}
//         onClose={() => setShowFilter(false)}
//         onApply={(newFilters) => {
//           setFilters(newFilters);
//           setShowFilter(false);
//           // Here you would typically filter your job listings
//           console.log('Applied filters:', newFilters);
//         }}
//       />
//     </SafeAreaView>
//   );
// };

// const MenuOverlay = ({ navigation }) => (
//   <View style={styles.menuOverlay}>
//     <View style={styles.menuContainer}>
//       <View style={styles.menuHeader}>
//         <Text style={styles.menuTitle}>Menu</Text>
//         <TouchableOpacity 
//           onPress={() => setShowMenu(false)}
//           style={styles.closeButton}
//         >
//           <Icon name="close" size={24} color="#6B7280" />
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity 
//         style={styles.menuItem}
//         onPress={() => {
//           setShowMenu(false);
//           navigation.navigate('ReferralSystem');
//         }}
//       >
//         <Icon name="group-add" size={24} color="#2563EB" />
//         <View style={styles.menuItemContent}>
//           <Text style={styles.menuItemTitle}>Referral Program</Text>
//           <Text style={styles.menuItemDescription}>
//             Refer candidates and earn bonuses
//           </Text>
//         </View>
//         <Icon name="chevron-right" size={24} color="#6B7280" />
//       </TouchableOpacity>

//       <TouchableOpacity 
//         style={styles.menuItem}
//         onPress={() => {
//           setShowMenu(false);
//           navigation.navigate('ProfileLockStatus');
//         }}
//       >
//         <Icon name="lock" size={24} color="#2563EB" />
//         <View style={styles.menuItemContent}>
//           <Text style={styles.menuItemTitle}>Profile Lock Status</Text>
//           <Text style={styles.menuItemDescription}>
//             Check your profile lock period
//           </Text>
//         </View>
//         <Icon name="chevron-right" size={24} color="#6B7280" />
//       </TouchableOpacity>
//     </View>
//   </View>
// );

// const FilterOverlay = ({ visible, onClose, onApply, currentFilters }) => {
//   const [localFilters, setLocalFilters] = useState(currentFilters);

//   const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote'];
//   const experienceLevels = ['All', '0-2 years', '2-5 years', '5+ years'];
//   const salaryRanges = ['All', '$0-50k', '$50k-100k', '$100k+'];
//   const locations = ['All', 'Remote', 'On-site', 'Hybrid'];

//   if (!visible) return null;

//   return (
//     <View style={styles.filterOverlay}>
//       <View style={styles.filterContent}>
//         <View style={styles.filterHeader}>
//           <Text style={styles.filterTitle}>Filter Jobs</Text>
//           <TouchableOpacity onPress={onClose}>
//             <Icon name="close" size={24} color="#134083" />
//           </TouchableOpacity>
//         </View>

//         {/* Job Type Filter */}
//         <View style={styles.filterSection}>
//           <Text style={styles.filterSectionTitle}>Job Type</Text>
//           <View style={styles.filterOptions}>
//             {jobTypes.map((type) => (
//               <TouchableOpacity
//                 key={type}
//                 style={[
//                   styles.filterChip,
//                   localFilters.jobType === type.toLowerCase() && styles.filterChipActive
//                 ]}
//                 onPress={() => setLocalFilters({...localFilters, jobType: type.toLowerCase()})}
//               >
//                 <Text style={[
//                   styles.filterChipText,
//                   localFilters.jobType === type.toLowerCase() && styles.filterChipTextActive
//                 ]}>{type}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Experience Filter */}
//         <View style={styles.filterSection}>
//           <Text style={styles.filterSectionTitle}>Experience</Text>
//           <View style={styles.filterOptions}>
//             {experienceLevels.map((level) => (
//               <TouchableOpacity
//                 key={level}
//                 style={[
//                   styles.filterChip,
//                   localFilters.experience === level.toLowerCase() && styles.filterChipActive
//                 ]}
//                 onPress={() => setLocalFilters({...localFilters, experience: level.toLowerCase()})}
//               >
//                 <Text style={[
//                   styles.filterChipText,
//                   localFilters.experience === level.toLowerCase() && styles.filterChipTextActive
//                 ]}>{level}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Salary Range Filter */}
//         <View style={styles.filterSection}>
//           <Text style={styles.filterSectionTitle}>Salary Range</Text>
//           <View style={styles.filterOptions}>
//             {salaryRanges.map((range) => (
//               <TouchableOpacity
//                 key={range}
//                 style={[
//                   styles.filterChip,
//                   localFilters.salary === range.toLowerCase() && styles.filterChipActive
//                 ]}
//                 onPress={() => setLocalFilters({...localFilters, salary: range.toLowerCase()})}
//               >
//                 <Text style={[
//                   styles.filterChipText,
//                   localFilters.salary === range.toLowerCase() && styles.filterChipTextActive
//                 ]}>{range}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Location Filter */}
//         <View style={styles.filterSection}>
//           <Text style={styles.filterSectionTitle}>Location</Text>
//           <View style={styles.filterOptions}>
//             {locations.map((location) => (
//               <TouchableOpacity
//                 key={location}
//                 style={[
//                   styles.filterChip,
//                   localFilters.location === location.toLowerCase() && styles.filterChipActive
//                 ]}
//                 onPress={() => setLocalFilters({...localFilters, location: location.toLowerCase()})}
//               >
//                 <Text style={[
//                   styles.filterChipText,
//                   localFilters.location === location.toLowerCase() && styles.filterChipTextActive
//                 ]}>{location}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Apply Button */}
//         <TouchableOpacity 
//           style={styles.applyButton}
//           onPress={() => {
//             onApply(localFilters);
//             onClose();
//           }}
//         >
//           <Text style={styles.applyButtonText}>Apply Filters</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//   },
//   header: {
//     backgroundColor: '#134083',
//     padding: 20,
//     paddingTop: 40,
//     gap: 20,
//     borderBottomEndRadius:26,
//     borderBottomLeftRadius:26,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   leftSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   toggleButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   greetingSection: {
//     marginLeft: 4,
//   },
//   greetingText: {
//     fontSize: 14,
//     color: '#9CA3AF',
//     marginBottom: 4,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   profileToggle: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileAvatar: {
//     fontSize: 24,
//   },
//   searchContainer: {
//     marginTop: 4,
//   },
//   searchBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     paddingLeft: 16,
//     paddingRight: 8,
//     height: 48,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 12,
//     fontSize: 15,
//     color: '#134083',
//     paddingVertical: 8,
//   },
//   filterButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 8,
//     backgroundColor: '#134083',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#fff',
//     marginTop: 4,
//   },
//   content: {
//     flex: 1,
//   },
//   section: {
//     paddingVertical: 10,
//     padding: 6,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     marginTop: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#134083',
//   },
//   seeAll: {
//     color: '#6366F1',
//     fontWeight: '500',
//   },
//   jobGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//     paddingHorizontal: 20,
//   },
//   gridJobCard: {
//     width: '48%', // Slightly less than 50% to account for gap
//     padding: 12,
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//   },
//   gridJobInfo: {
//     marginTop: 12,
//   },
//   gridJobTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#134083',
//     marginBottom: 4,
//   },
//   gridJobCompany: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   jobsScrollContainer: {
//     paddingHorizontal: 20,
//     gap: 16,
//   },
//   featuredJobCard: {
//     width: 280,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   jobCardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   companyLogo: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoText: {
//     fontSize: 24,
//   },
//   jobTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: 8,
//   },
//   jobCompany: {
//     fontSize: 14,
//     color: 'rgba(255,255,255,0.8)',
//     marginBottom: 16,
//   },
//   jobDetails: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   detailPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     gap: 4,
//   },
//   detailText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   menuItemText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#134083',
//   },
//   menuOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//     zIndex: 1000,
//   },
//   menuContainer: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   menuHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   menuTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#134083',
//   },
//   closeButton: {
//     padding: 8,
//   },
//   menuItemContent: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   menuItemTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#134083',
//     marginBottom: 4,
//   },
//   menuItemDescription: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   headerButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   menuButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   toggleMenu: {
//     position: 'absolute',
//     left: -280,
//     top: 0,
//     bottom: 0,
//     width: 280,
//     backgroundColor: '#134083', // Dark background
//     transform: [{ translateX: 0 }],
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 2,
//       height: 0,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   toggleMenuOpen: {
//     transform: [{ translateX: 280 }],
//   },
//   toggleHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     paddingTop: 50,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   toggleTitle: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   toggleCloseButton: {
//     padding: 8,
//   },
//   menuItems: {
//     padding: 16,
//     gap: 8,
//   },
//   toggleMenuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.05)',
//   },
//   toggleMenuText: {
//     marginLeft: 16,
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: '500',
//   },
//   jobDetailOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: '#134083',
//     zIndex: 1000,
//   },
//   jobDetailContent: {
//     flex: 1,
//     padding: 20,
//     paddingTop: 60,
//   },
//   companyHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   logoContainer: {
//     width: 60,
//     height: 60,
//     backgroundColor: '#374151',
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   jobTypeContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     gap: 8,
//     marginLeft: 12,
//   },
//   jobTypeTag: {
//     backgroundColor: '#374151',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   jobTypeText: {
//     fontSize: 12,
//     color: '#fff',
//     fontWeight: '500',
//   },
//   jobDetailTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: 8,
//   },
//   jobLocation: {
//     fontSize: 16,
//     color: '#9CA3AF',
//     marginBottom: 24,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#374151',
//     marginBottom: 24,
//   },
//   tabText: {
//     paddingVertical: 12,
//     marginRight: 24,
//     color: '#9CA3AF',
//     fontSize: 16,
//   },
//   activeTab: {
//     color: '#60A5FA',
//     borderBottomWidth: 2,
//     borderBottomColor: '#60A5FA',
//   },
//   requirementsSection: {
//     marginBottom: 24,
//   },
//   requirementItem: {
//     flexDirection: 'row',
//     marginBottom: 12,
//   },
//   bulletPoint: {
//     marginRight: 8,
//     color: '#9CA3AF',
//   },
//   requirementText: {
//     flex: 1,
//     fontSize: 16,
//     color: '#D1D5DB',
//     lineHeight: 24,
//   },
//   applyButton: {
//     backgroundColor: '#60A5FA',
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 24,
//   },
//   applyButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   suggestedJobCard: {
//     width: 300,
//     padding: 16,
//     borderRadius: 12,
//     marginRight: 16,
//     marginVertical: 10,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   recommendedJobCard: {
//     width: 300,
//     padding: 16,
//     borderRadius: 12,
//     marginRight: 16,
//     marginVertical: 10,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   seeAllButton: {
//     color: '#6366F1',
//     fontWeight: '500',
//   },
//   jobSection: {
//     paddingVertical: 10,
//     padding: 6,
//     marginBottom: 15, // Space between sections
//   },
//   popularJobCard:{
//     padding: 10,  
//     gap: 1,
//     margin: 7,
//     borderBottomLeftRadius: 52,
//   },
//   matchBadge: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   matchText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   skillsContainer: {
//     flexDirection: 'row',
//     gap: 4,
//   },
//   skillBadge: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   skillText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   jobCard: {
//     width: 280,
//     padding: 16,
//     borderRadius: 16,
//     marginRight: 16,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 4,
//   },
//   jobLogo: {
//     fontSize: 24,
//   },
//   companyName: {
//     fontSize: 14,
//     color: 'rgba(255,255,255,0.8)',
//     marginBottom: 16,
//   },
//   jobDetailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   jobDetailText: {
//     color: '#fff',
//     fontSize: 12,
//   },
//   filterOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   filterContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   filterHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   filterTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#134083',
//   },
//   filterSection: {
//     marginBottom: 20,
//   },
//   filterSectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#134083',
//     marginBottom: 12,
//   },
//   filterOptions: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   filterChip: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#F3F4F6',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   filterChipActive: {
//     backgroundColor: '#134083',
//     borderColor: '#134083',
//   },
//   filterChipText: {
//     fontSize: 14,
//     color: '#4B5563',
//   },
//   filterChipTextActive: {
//     color: '#fff',
//   },
//   applyButton: {
//     backgroundColor: '#134083',
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   applyButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   primeBadge: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   primeText: {
//     fontSize: 10,
//     fontWeight: 'bold',
//     color: '#134083',
//   },
//   applicationCount: {
//     marginTop: 8,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     alignSelf: 'flex-start',
//   },
//   applicationCountText: {
//     color: '#fff',
//     fontSize: 12,
//   },
//   errorText: {
//     color: '#EF4444',
//     textAlign: 'center',
//     marginVertical: 20,
//   },
//   noDataText: {
//     textAlign: 'center',
//     color: '#6B7280',
//     padding: 20,
//     fontSize: 16,
//   },
// })

// export default EmployeeDashboard ;


