import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy Data
const YEARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
const MONTHS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const INDUSTRIES = [
  'Information Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Marketing',
  'Construction',
];
const MONTHS_NAME = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const START_YEARS = Array.from({length: 50}, (_, i) => `${new Date().getFullYear() - i}`);
const JOB_ROLES = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'UI/UX Designer',
  'Product Manager',
  'Project Manager',
  'Business Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'Quality Assurance',
];

const ExperienceDetails = ({ navigation, route }) => {
  const { userData } = route.params;
  const [hasExperience, setHasExperience] = useState(false);
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [currentSalary, setCurrentSalary] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Modal states
  const [showYearsModal, setShowYearsModal] = useState(false);
  const [showMonthsModal, setShowMonthsModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showStartMonthModal, setShowStartMonthModal] = useState(false);
  const [showStartYearModal, setShowStartYearModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [errors, setErrors] = useState({});

  const SelectionModal = ({ visible, onClose, data, onSelect, title }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView>
            {data.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const validateForm = () => {
    const newErrors = {};

    if (hasExperience) {
      if (!years) newErrors.years = 'Years is required';
      if (!jobTitle) newErrors.jobTitle = 'Job title is required';
      if (selectedRoles.length === 0) newErrors.jobRole = 'At least one job role is required';
      if (!companyName) newErrors.companyName = 'Company name is required';
      if (!industry) newErrors.industry = 'Industry is required';
      if (!startMonth) newErrors.startMonth = 'Start month is required';
      if (!startYear) newErrors.startYear = 'Start year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      const experienceData = {
        ...userData,
        hasExperience,
        experience: {
          years,
          months,
          jobTitle,
          jobRoles: selectedRoles,
          companyName,
          industry,
          startDate: {
            month: startMonth,
            year: startYear,
          },
        },
      };
      navigation.navigate('Skills', { userData: experienceData });
    }
  };

  const JobRolesModal = () => (
    <Modal
      visible={showRolesModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowRolesModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Job Roles (Max 10)</Text>
          <ScrollView>
            {JOB_ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.modalItem,
                  selectedRoles.includes(role) && styles.selectedModalItem,
                ]}
                onPress={() => {
                  if (selectedRoles.includes(role)) {
                    setSelectedRoles(selectedRoles.filter(r => r !== role));
                  } else if (selectedRoles.length < 10) {
                    setSelectedRoles([...selectedRoles, role]);
                  }
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedRoles.includes(role) && styles.selectedModalItemText
                ]}>
                  {role}
                </Text>
                {selectedRoles.includes(role) && (
                  <Icon name="check" size={20} color="#059669" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setShowRolesModal(false)}
          >
            <Text style={styles.modalCloseText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Experience Details</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '66%' }]} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.question}>Do you have work experience?</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, hasExperience && styles.toggleButtonActive]}
              onPress={() => setHasExperience(true)}
            >
              <Text style={[styles.toggleText, hasExperience && styles.toggleTextActive]}>
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !hasExperience && styles.toggleButtonActive]}
              onPress={() => setHasExperience(false)}
            >
              <Text style={[styles.toggleText, !hasExperience && styles.toggleTextActive]}>
                No
              </Text>
            </TouchableOpacity>
          </View>

          {hasExperience && (
            <>
              <Text style={styles.sectionTitle}>Total Years of Experience</Text>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Years</Text>
                  <TouchableOpacity 
                    style={styles.dropdown}
                    onPress={() => setShowYearsModal(true)}
                  >
                    <Text style={styles.dropdownText}>{years || 'Years'}</Text>
                    <Icon name="keyboard-arrow-down" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Months (Optional)</Text>
                  <TouchableOpacity 
                    style={styles.dropdown}
                    onPress={() => setShowMonthsModal(true)}
                  >
                    <Text style={styles.dropdownText}>{months || 'Months'}</Text>
                    <Icon name="keyboard-arrow-down" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>Job Title</Text>
              <TextInput
                style={[styles.input, errors.jobTitle && styles.inputError]}
                placeholder="e.g. Teacher"
                value={jobTitle}
                onChangeText={(text) => {
                  setJobTitle(text);
                  setErrors({ ...errors, jobTitle: null });
                }}
              />
              {errors.jobTitle && (
                <Text style={styles.errorText}>{errors.jobTitle}</Text>
              )}

              <Text style={styles.label}>Job role</Text>
              <TouchableOpacity 
                style={[styles.dropdown, errors.jobRole && styles.inputError]}
                onPress={() => setShowRolesModal(true)}
              >
                <Text style={styles.dropdownText}>
                  {selectedRoles.length > 0 
                    ? `${selectedRoles.length} roles selected`
                    : 'Select up to 10 roles for this job'}
                </Text>
                <Icon name="keyboard-arrow-down" size={24} color="#666" />
              </TouchableOpacity>
              {errors.jobRole && (
                <Text style={styles.errorText}>{errors.jobRole}</Text>
              )}

              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ApnaTime Tech"
                value={companyName}
                onChangeText={setCompanyName}
              />

              <Text style={styles.label}>Industry</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowIndustryModal(true)}
              >
                <Text style={styles.dropdownText}>{industry || 'Select an option'}</Text>
                <Icon name="keyboard-arrow-down" size={24} color="#666" />
              </TouchableOpacity>

              <Text style={styles.label}>Are you currently working in this company?</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleButton, isCurrentlyWorking && styles.toggleButtonActive]}
                  onPress={() => setIsCurrentlyWorking(true)}
                >
                  <Text style={[styles.toggleText, isCurrentlyWorking && styles.toggleTextActive]}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, !isCurrentlyWorking && styles.toggleButtonActive]}
                  onPress={() => setIsCurrentlyWorking(false)}
                >
                  <Text style={[styles.toggleText, !isCurrentlyWorking && styles.toggleTextActive]}>No</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Current Salary</Text>
              <View style={styles.salaryInput}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.salaryTextInput}
                  placeholder="Amount"
                  placeholderTextColor="#999"
                  value={currentSalary}
                  onChangeText={setCurrentSalary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.infoBox}>
                <Icon name="info" size={24} color="#0066CC" />
                <Text style={styles.infoText}>
                  Salary information is important, we use it only to show relevant jobs.
                </Text>
              </View>

              <Text style={styles.label}>Start Date</Text>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TouchableOpacity 
                    style={[styles.dropdown, errors.startMonth && styles.inputError]}
                    onPress={() => setShowStartMonthModal(true)}
                  >
                    <Text style={styles.dropdownText}>
                      {startMonth || 'Month'}
                    </Text>
                    <Icon name="keyboard-arrow-down" size={24} color="#666" />
                  </TouchableOpacity>
                  {errors.startMonth && (
                    <Text style={styles.errorText}>{errors.startMonth}</Text>
                  )}
                </View>
                <View style={styles.halfWidth}>
                  <TouchableOpacity 
                    style={[styles.dropdown, errors.startYear && styles.inputError]}
                    onPress={() => setShowStartYearModal(true)}
                  >
                    <Text style={styles.dropdownText}>
                      {startYear || 'Year'}
                    </Text>
                    <Icon name="keyboard-arrow-down" size={24} color="#666" />
                  </TouchableOpacity>
                  {errors.startYear && (
                    <Text style={styles.errorText}>{errors.startYear}</Text>
                  )}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.nextButton, !hasExperience && styles.nextButtonEnabled]} 
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      {/* Modals */}
      <SelectionModal
        visible={showYearsModal}
        onClose={() => setShowYearsModal(false)}
        data={YEARS}
        onSelect={setYears}
        title="Select Years"
      />

      <SelectionModal
        visible={showMonthsModal}
        onClose={() => setShowMonthsModal(false)}
        data={MONTHS}
        onSelect={setMonths}
        title="Select Months"
      />

      <SelectionModal
        visible={showIndustryModal}
        onClose={() => setShowIndustryModal(false)}
        data={INDUSTRIES}
        onSelect={setIndustry}
        title="Select Industry"
      />

      <SelectionModal
        visible={showStartMonthModal}
        onClose={() => setShowStartMonthModal(false)}
        data={MONTHS_NAME}
        onSelect={setStartMonth}
        title="Select Start Month"
      />

      <SelectionModal
        visible={showStartYearModal}
        onClose={() => setShowStartYearModal(false)}
        data={START_YEARS}
        onSelect={setStartYear}
        title="Select Start Year"
      />

      <JobRolesModal />
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
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleButtonActive: {
    backgroundColor: '#134083',
    borderColor: '#134083',
  },
  toggleText: {
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dropdownText: {
    color: '#666',
  },
  salaryInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 16,
  },
  currencySymbol: {
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#666',
  },
  salaryTextInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: '#0066CC',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  selectedModalItem: {
    backgroundColor: '#F3F4F6',
  },
  selectedModalItemText: {
    color: '#059669',
    fontWeight: 'bold',
  },
  nextButtonEnabled: {
    opacity: 1,
  },
  footer: {
    padding: 13,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    backgroundColor: '#134083',
    margin:16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default ExperienceDetails; 