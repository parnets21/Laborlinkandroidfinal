import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PreferredJobRole = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const suggestedRoles = [
    'Elder Care',
    'Cleaning',
    'Cook / Chef / Kitchen Help',
    'Food Services',
    'Baby Care',
    'Delivery',
    'Full Time',
    'Part Time',
    'Contract'
  ];

  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else if (selectedRoles.length < 5) {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const filteredRoles = suggestedRoles.filter(role =>
    role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    if (selectedRoles.length > 0) {
      navigation.navigate('ResumeUpload');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#134083" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferred Job Role</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '90%' }]} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>What job title/role are you looking for?.</Text>
        <Text style={styles.subtitle}>You can select up to 5 job roles.</Text>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by job title/role"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedTitle}>Suggested job title/role</Text>
          <View style={styles.rolesContainer}>
            {filteredRoles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleChip,
                  selectedRoles.includes(role) && styles.selectedRoleChip
                ]}
                onPress={() => toggleRole(role)}
              >
                <Text style={[
                  styles.roleText,
                  selectedRoles.includes(role) && styles.selectedRoleText
                ]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.nextButton, 
            selectedRoles.length === 0 && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={selectedRoles.length === 0}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#134083',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#134083',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#134083',
  },
  suggestedSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  suggestedTitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    marginRight: 8,
  },
  selectedRoleChip: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  roleText: {
    color: '#134083',
    fontSize: 14,
  },
  selectedRoleText: {
    color: '#fff',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PreferredJobRole;