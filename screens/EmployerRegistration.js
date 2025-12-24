import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { Picker } from '@react-native-picker/picker';

const EmployerRegistration = ({ navigation }) => {

  const [hasGst, setHasGst] = useState(null); // null = not answered
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    CompanyName: '',
    industry: '',
    age: '',
    gender: '',
    profile: null,
    GstNum: '',
    PanNum: ''
  });

  const selectProfileImage = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = response.assets[0];
        setFormData({ ...formData, profile: `data:${source.type};base64,${source.base64}` });
      }
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.mobile ||
      !formData.password || !formData.confirmPassword ||
      !formData.CompanyName || !formData.industry ) {
      Alert.alert('Error', 'Please fill all required fields');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      console.log('Submitting registration data:', formData);

      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        CompanyName: formData.CompanyName,
        industry: formData.industry,
        age: formData.age,
        profile: formData.profile,
        gender: formData.gender,
        GstNum: formData.GstNum,
        PanNum: formData.PanNum
      };

      console.log('Sending to API:', apiData);

      const response = await axios.post(`${BASE_URL}/api/user/registerEmployer`, apiData);
      console.log('Registration response:', response.data);



      if (response.data.success) {
        Alert.alert(
          'Registration Successful',
          'Your account is pending approval. Please wait for admin confirmation.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('EmployerPending', {
                email: formData.email,
                userId: response.data?.userData?._id
              })
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      Alert.alert('Registration Failed', 'Network error. Please try again.');
    }
  };

  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/user/industries`);
      console.log('API Response:', response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        const industriesData = response.data.data;

        const formattedData = industriesData.map((industry, index) => ({
          ...industry,
          _id: industry._id || `temp_${index}`,
        }));

        console.log('Formatted data:', formattedData);
        setIndustries(formattedData);
      } else {
        console.error('Invalid response format:', response.data);
        Alert.alert('Error', 'Failed to fetch industries: Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching industries:', error);
      Alert.alert('Error', 'Failed to fetch industries');
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Employer Account</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          {/* <TouchableOpacity style={styles.profilePicker} onPress={selectProfileImage}>
            {formData.profile ? (
              <Image source={{ uri: formData.profile }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Icon name="person-add" size={32} color="#6B7280" />
                <Text style={styles.profilePlaceholderText}>Upload profile picture</Text>
              </View>
            )}
          </TouchableOpacity> */}

          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholderTextColor="#9CA3AF"
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text.trim() })}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />

          <TextInput
            style={styles.input}
            placeholder="Mobile Number *"
            value={formData.mobile}
            onChangeText={(text) => setFormData({ ...formData, mobile: text })}
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
          />

          <TextInput
            style={styles.input}
            placeholder="Company Name *"
            value={formData.CompanyName}
            onChangeText={(text) => setFormData({ ...formData, CompanyName: text })}
            placeholderTextColor="#9CA3AF"
          />
          <View style={styles.input}>
            <Picker
              selectedValue={formData.industry}
              onValueChange={(value) => setFormData({ ...formData, industry: value })}
              style={{ color: '#000' }} // optional: for text color
            >
              <Picker.Item label="Select Industry" value="" />
              {industries.map((industry) => (
                <Picker.Item key={industry._id} label={industry.industryName} value={industry?.industryName} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Age"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />

          {/* <View style={styles.container}>
      <Text style={styles.label}>Do you have a GST Number?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.optionButton, hasGst === true && styles.selected]}
          onPress={() => setHasGst(true)}
        >
          <Text style={styles.optionText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, hasGst === false && styles.selected]}
          onPress={() => setHasGst(false)}
        >
          <Text style={styles.optionText}>No</Text>
        </TouchableOpacity>
      </View>

      {hasGst === true && (
        <TextInput
          style={styles.input}
          placeholder="GST Number"
          value={formData.GstNum}
          onChangeText={(text) => setFormData({ ...formData, GstNum: text })}
          keyboardType="default"
          placeholderTextColor="#9CA3AF"
        />
      )}

      {hasGst === false && (
        <TextInput
          style={styles.input}
          placeholder="PAN Number"
          value={formData.PanNum}
          onChangeText={(text) => setFormData({ ...formData, PanNum: text })}
          keyboardType="default"
          placeholderTextColor="#9CA3AF"
        />
      )}
    </View> */}

          <View style={styles.container}>
            <Text style={styles.label}>Do you have a GST Number?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.optionButton, hasGst === true && styles.selected]}
                onPress={() => setHasGst(true)}
              >
                <Text style={styles.optionText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, hasGst === false && styles.selected]}
                onPress={() => setHasGst(false)}
              >
                <Text style={styles.optionText}>No</Text>
              </TouchableOpacity>
            </View>

            {hasGst === true && (
              <TextInput
                style={styles.input}
                placeholder="GST Number"
                value={formData.GstNum}
                onChangeText={(text) => setFormData({ ...formData, GstNum: text })}
                keyboardType="default"
                placeholderTextColor="#9CA3AF"
              />
            )}

            {hasGst === false && (
              <TextInput
                style={styles.input}
                placeholder="PAN Number"
                value={formData.PanNum}
                onChangeText={(text) => setFormData({ ...formData, PanNum: text })}
                keyboardType="default"
                placeholderTextColor="#9CA3AF"
              />
            )}
          </View>

          <View style={styles.input}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              style={{ color: '#000' }} // optional: for text color
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Password *"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Account</Text>
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
    backgroundColor: '#134083',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  formContainer: {
    gap: 16,
  },
  profilePicker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePlaceholderText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  optionButton: {
    padding: 10,
    width: 50,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 5,
  },
  selected: {
    backgroundColor: '#1E40AF',
    color: '#fff',
    borderColor: '#1E40AF',
  },
  optionText: {
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 5,
    padding: 10,
    color: '#000',
  },
});

export default EmployerRegistration; 
