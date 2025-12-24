// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Linking,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const HelpCenter = ({ navigation }) => {
//   const [expandedFaq, setExpandedFaq] = useState(null);

//   const faqs = [
//     {
//       question: 'How do I apply for a job?',
//       answer: `'To apply for a job, simply browse through available positions, click on the job you're interested in, and click the "Apply Now" button. You'll need to be logged in to apply.'`,
//     },
//     {
//       question: 'How do I create a profile?',
//       answer: "Go to the Profile section, fill in your personal information, work experience, education, and skills. Dont forget to upload your resume!",
//     },
//     {
//       question: 'How do I reset my password?',
//       answer: 'Go to the login screen, click on "Forgot Password", enter your email address, and follow the instructions sent to your email.',
//     },
//     {
//       question: 'How do I contact an employer?',
//       answer: "Once you've applied for a job, employers can contact you through the platform. You can also use the messaging feature in the app.",
//     },
//   ];

//   const supportOptions = [
//     {
//       icon: 'email',
//       title: 'Email Support',
//       subtitle: 'support@laborlink.com',
//       onPress: () => Linking.openURL('mailto:support@laborlink.com'),
//     },
//     {
//       icon: 'phone',
//       title: 'Phone Support',
//       subtitle: '+91 1234567890',
//       onPress: () => Linking.openURL('tel:+911234567890'),
//     },
//     {
//       icon: 'chat',
//       title: 'Live Chat',
//       subtitle: 'Available 24/7',
//       onPress: () => navigation.navigate('LiveChat'),
//     },
//   ];

//   const toggleFaq = (index) => {
//     setExpandedFaq(expandedFaq === index ? null : index);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Icon name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Help Center</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <ScrollView style={styles.content}>
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
//           {faqs.map((faq, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.faqItem}
//               onPress={() => toggleFaq(index)}
//             >
//               <View style={styles.faqHeader}>
//                 <Text style={styles.faqQuestion}>{faq.question}</Text>
//                 <Icon
//                   name={expandedFaq === index ? 'expand-less' : 'expand-more'}
//                   size={24}
//                   color="#4B5563"
//                 />
//               </View>
//               {expandedFaq === index && (
//                 <Text style={styles.faqAnswer}>{faq.answer}</Text>
//               )}
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Contact Support</Text>
//           {supportOptions.map((option, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.supportOption}
//               onPress={option.onPress}
//             >
//               <View style={styles.supportOptionLeft}>
//                 <View style={styles.iconContainer}>
//                   <Icon name={option.icon} size={24} color="#4F46E5" />
//                 </View>
//                 <View>
//                   <Text style={styles.supportOptionTitle}>{option.title}</Text>
//                   <Text style={styles.supportOptionSubtitle}>
//                     {option.subtitle}
//                   </Text>
//                 </View>
//               </View>
//               <Icon name="chevron-right" size={24} color="#9CA3AF" />
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>
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
//     paddingTop: 60,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   section: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#134083',
//     marginBottom: 16,
//   },
//   faqItem: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     paddingVertical: 16,
//   },
//   faqHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   faqQuestion: {
//     fontSize: 16,
//     color: '#134083',
//     flex: 1,
//     marginRight: 16,
//   },
//   faqAnswer: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 8,
//     lineHeight: 20,
//   },
//   supportOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   supportOptionLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: '#EEF2FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   supportOptionTitle: {
//     fontSize: 16,
//     color: '#134083',
//     fontWeight: '500',
//   },
//   supportOptionSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 2,
//   },
// });

// export default HelpCenter; 