import React from 'react';
import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const TermsEmployer = ({ navigation }) => {
  return (
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
          {/* <Text style={styles.heading}>Terms and Conditions (Company/Firm)</Text> */}

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

const terms = [
  'Company/Firm acknowledges that acceptance of company details is subject to verification of company credentials and background.',
  'Company/Firm accepts to pay the applicable commissions as per the plans chosen by the company along with the mandated GST.',
  'Company/Firm agrees to follow the rules and laws laid by the government.',
  'Company/Firm will use the app only for employment purposes and confirm to pay the applicable charges if any for using the Labor Link app.',
  'Company/Firm understands that Labor Link app is a platform for employment and does not guarantee any kind of hired employee’s conduct and performance in the company.',
  'Company/Firm understands that Labor Link role is only limited to sourcing the required employee profiles and moderate the interview and hiring process.',
  'Company/Firm owns all the liabilities and responsibilities of ads posted in the app.',
  'Company/Firm will not indulge in any illegal and criminal activities.',
  'Company/Firm agrees to maintain confidentiality of all proprietary and client-related information.',
  'Company/Firm acknowledges that providing a GST and PAN of the establishment is mandatory.',
  'Company/Firm confirms that the information provided by the company is true and accurate to the best of the company’s knowledge.',
  'Company/Firm has read and understood the terms and conditions of signing up with Labor Link.',
];

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

export default TermsEmployer;
