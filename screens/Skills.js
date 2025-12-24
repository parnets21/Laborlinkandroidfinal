import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BASE_URL } from '../constants/config';

const Skills = ({ navigation, route }) => {
  const { userData } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/skills`);
      console.log('Skills response:', response.data);
      
      if (response.data.success) {
        const skills = response.data.data.map(skill => skill.skillName);
        setAllSkills(skills);
        setFilteredSkills(skills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      Alert.alert('Error', 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = allSkills.filter(skill =>
      skill.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSkills(filtered);
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleNext = () => {
    if (selectedSkills.length === 0) {
      Alert.alert('Error', 'Please select at least one skill');
      return;
    }

    const updatedUserData = {
      ...userData,
      skills: selectedSkills,
    };
    navigation.navigate('PreferredJobType', { userData: updatedUserData });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#134083" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skills</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '80%' }]} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>What skills do you have?</Text>
        <Text style={styles.subtitle}>
          Get noticed for the right job by adding your skills
        </Text>

        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Skills"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.skillsContainer}>
          <Text style={styles.sectionTitle}>Available Skills</Text>
          <View style={styles.skillsGrid}>
            {filteredSkills.map((skill, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.skillChip,
                  selectedSkills.includes(skill) && styles.selectedSkillChip,
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text
                  style={[
                    styles.skillChipText,
                    selectedSkills.includes(skill) && styles.selectedSkillChipText,
                  ]}
                >
                  {skill}
                </Text>
                {selectedSkills.includes(skill) && (
                  <Icon name="check" size={16} color="#fff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedSkills.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedTitle}>Selected Skills ({selectedSkills.length})</Text>
            <View style={styles.selectedSkillsGrid}>
              {selectedSkills.map((skill, index) => (
                <View key={index} style={styles.selectedSkillChip}>
                  <Text style={styles.selectedSkillChipText}>{skill}</Text>
                  <TouchableOpacity onPress={() => toggleSkill(skill)}>
                    <Icon name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.nextButton, selectedSkills.length === 0 && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={selectedSkills.length === 0}
      >
        <Text style={styles.nextButtonText}>
          {selectedSkills.length === 0 ? 'Select Skills to Continue' : 'Next'}
        </Text>
      </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#000',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 24,
    marginHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  skillsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  selectedSkillChip: {
    backgroundColor: '#134083',
    borderColor: '#059669',
  },
  skillChipText: {
    color: '#000',
    fontSize: 14,
  },
  selectedSkillChipText: {
    color: '#fff',
  },
  selectedContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 12,
  },
  selectedSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkIcon: {
    marginLeft: 4,
  },
  nextButton: {
    backgroundColor: '#134083',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  }
});

export default Skills; 