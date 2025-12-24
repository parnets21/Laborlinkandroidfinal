import React from 'react';
import { ScrollView, Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const TermsEmployee = () => {
  const navigation = useNavigation();

  const terms = [
    'I confirm I am above 18 years of age.',
    'I acknowledge that acceptance of my details is subject to verification of my credentials and background.',
    'I agree to pay the applicable charges if any for using the Labor Link app.',
    'I agree to follow the rules and laws laid by the government.',
    'I understand the Labor Link app will not guarantee my job.',
    'I understand that Labor Link is an employment platform and does not guarantee the tenure or duration or the quality and conduct of the employer.',
    'I agree to cooperate with any background or referral checks conducted by Labor Link.',
    'I will not indulge in any illegal and criminal activities.',
    'I confirm that the information provided by me is true and accurate to the best of my knowledge.',
    'If selected by the employer and once I accept the job offer, I confirm my joining the employment.',
    'I give my permission to track my location to the app.',
    'I have read and understood the terms and conditions of signing up with Labor Link.',
  ];

  return (
    // <SafeAreaView style={styles.safeArea}>
    //   {/* Header with back button */}
    //   <View style={styles.header}>
    //     <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
    //       <Icon name="arrow-back" size={24} color="#000" />
    //     </TouchableOpacity>
    //     <Text style={styles.headerTitle}>Terms and Conditions (User)</Text>
    //   </View>

    //   <ScrollView contentContainerStyle={styles.content}>
    //     <View style={styles.card}>
    //       {terms.map((item, index) => (
    //         <View key={index} style={styles.listItem}>
    //           <Text style={styles.bullet}>•</Text>
    //           <Text style={styles.itemText}>{item}</Text>
    //         </View>
    //       ))}
    //     </View>
    //   </ScrollView>
    // </SafeAreaView>
      <View style={styles.wrapper}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
    
          {/* Header */}
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
    
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
              {/* <Text style={styles.heading}>Terms and Conditions</Text> */}
    
              {terms.map((term, index) => (
                <View key={index} style={styles.termItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.item}>{term}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#134083',
    borderRadius: 20,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 70,
    marginBottom: 10,
    color: '#134083',
  },
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 18,
    marginRight: 8,
    lineHeight: 22,
    color: '#134083',
  },
  item: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
});

export default TermsEmployee;
