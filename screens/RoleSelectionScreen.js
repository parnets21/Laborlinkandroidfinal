import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
const { width, height } = Dimensions.get('window');

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TouchableOpacity
  style={styles.backButton}
  onPress={() => navigation.goBack()}
  activeOpacity={0.7}
>
  <Text style={styles.backText}>◀ Back</Text>
</TouchableOpacity>

      {/* Skip button at top-right */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.replace('AllaccessJobPage')}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {/* <Image style={styles.image} source={wleimg} /> */}
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you want to use the app and get started on your journey
          </Text>
        </View>

        {/* Role Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.roleButton, styles.jobSeekerButton]}
            onPress={() => navigation.navigate('JobSeekerAuth')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>🔍</Text>
              <Text style={styles.roleButtonText}>Job Seeker</Text>
              <Text style={styles.buttonSubtext}>Find your dream job</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, styles.employerButton]}
            onPress={() => navigation.navigate('EmployerAuth')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>🏢</Text>
              <Text style={styles.roleButtonText}>Employer</Text>
              <Text style={styles.buttonSubtext}>Hire top talent</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backButton: {
  position: 'absolute',
  top: 58,
  left: 20,
  zIndex: 1,
  paddingVertical: 10,
  paddingHorizontal: 18,
  backgroundColor: '#e2e8f0',
  borderRadius: 25,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
},
backText: {
  color: '#64748b',
  fontSize: 14,
  fontWeight: '600',
},

  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  skipText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  image: {
    height: height * 0.25,
    width: width * 0.7,
    borderRadius: 16,
    resizeMode: 'contain',
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop:100
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  roleButton: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  jobSeekerButton: {
    backgroundColor: '#26437c',
  },
  employerButton: {
    backgroundColor: '#26437c',
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default RoleSelectionScreen;