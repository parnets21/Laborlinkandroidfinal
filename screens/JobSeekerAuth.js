import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import welcm from '../assets/wlecome.png';
import Icon from 'react-native-vector-icons/Ionicons';

const JobSeekerAuth = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Image source={welcm} style={styles.wlvv} />
        <Text style={styles.title}>Welcome Job Seeker</Text>
        <Text style={styles.subtitle}>Find your dream job today</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CreateProfile')}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.outlineButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: '#134083',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#134083',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#134083',
  },
  outlineButtonText: {
    color: '#134083',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  wlvv: {
    height: 194,
    width: 133,
    left: 90,
    top: -83,

  }
});

export default JobSeekerAuth;