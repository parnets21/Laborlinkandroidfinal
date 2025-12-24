import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HelpSupport = ({ navigation }) => {
  const helpSections = [
    {
      title: 'Account & Profile',
      icon: 'person',
      items: [
        { title: 'How to update profile', description: 'Learn how to update your profile information' },
        { title: 'Profile visibility', description: 'Control who can see your profile' },
        { title: 'Change password', description: 'Steps to change your account password' },
      ],
    },
    {
      title: 'Job Search',
      icon: 'work',
      items: [
        { title: 'Search filters', description: 'Use filters to find relevant jobs' },
        { title: 'Job alerts', description: 'Set up notifications for new job postings' },
        { title: 'Application status', description: 'Track your job applications' },
      ],
    },
    {
      title: 'Technical Support',
      icon: 'settings',
      items: [
        { title: 'Contact support', description: 'Get help from our support team' },
        { title: 'Report a bug', description: 'Report technical issues or bugs' },
        { title: 'FAQs', description: 'Frequently asked questions' },
      ],
    },
  ];

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@laborlink.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content}>
        {helpSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name={section.icon} size={24} color="#4B6BFB" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.helpItem}
                onPress={() => {
                  if (item.title === 'Contact support') {
                    handleContactSupport();
                  }
                }}
              >
                <View>
                  <Text style={styles.helpItemTitle}>{item.title}</Text>
                  <Text style={styles.helpItemDescription}>{item.description}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need more help?</Text>
          <Text style={styles.contactDescription}>
            Our support team is available 24/7 to assist you with any questions or concerns.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
    color: '#134083',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
  },
  helpItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#134083',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#4B6BFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HelpSupport; 