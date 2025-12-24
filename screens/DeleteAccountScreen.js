import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DeleteAccountScreen = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const navigation = useNavigation();

  const getUserId = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');

      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        console.log('Parsed Data:', parsedData);

        const userId = parsedData?._id;
        console.log('USERID:', userId);
        return userId;
      } else {
        console.log('No user data found in AsyncStorage');
      }

    } catch (error) {
      console.error('Error getting userId:', error);
      return null;
    }
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.multiRemove(['userId', 'userToken', 'userProfile']);
      // Add any other keys you want to clear
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== 'delete') {
      Alert.alert('Confirmation Required', 'Please type "DELETE" to confirm');
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'Are you absolutely sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDeletion },
      ]
    );
  };

  const performDeletion = async () => {
    setIsDeleting(true);

    try {
      const userId = await getUserId();

      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please try logging in again.');
        return;
      }

      const response = await fetch(`https://laborlink.co.in/api/user/deleteProfileParmanet/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Clear all user data
        await clearUserData();

        Alert.alert(
          'Account Deleted',
          'Your account has been permanently deleted from LaborLink.',
          [
            {
              text: 'OK',
              onPress: () => {
                AsyncStorage.multiRemove([
                  'userData',
                  'token',
                  'profileData'
                ]);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              },
            },
          ]
        );

      } else {
        Alert.alert('Error', data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Network Error', 'Please check your connection and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoBack = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
      setConfirmText('');
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!showConfirmation ? (
          /* Initial Warning Screen */
          <View style={styles.warningContainer}>
            <View style={styles.iconContainer}>
              <Icon name="delete-forever" size={60} color="#DC2626" />
            </View>

            <Text style={styles.mainTitle}>Are you sure?</Text>
            <Text style={styles.subtitle}>
              This action will permanently delete your account and all associated data.
            </Text>

            {/* What will be deleted */}
            <View style={styles.warningBox}>
              <View style={styles.warningHeader}>
                <Icon name="warning" size={20} color="#F59E0B" />
                <Text style={styles.warningTitle}>What will be deleted:</Text>
              </View>
              <View style={styles.deleteList}>
                <Text style={styles.deleteItem}>• Your profile and personal information</Text>
                <Text style={styles.deleteItem}>• All your job applications and history</Text>
                <Text style={styles.deleteItem}>• Saved jobs and preferences</Text>
                <Text style={styles.deleteItem}>• Messages and communications</Text>
                <Text style={styles.deleteItem}>• Account settings and data</Text>
              </View>
            </View>

            {/* Important notice */}
            <View style={styles.dangerBox}>
              <View style={styles.dangerHeader}>
                <Icon name="security" size={20} color="#DC2626" />
                <Text style={styles.dangerTitle}>Important Notice</Text>
              </View>
              <Text style={styles.dangerText}>
                This action cannot be undone. Once deleted, all your data will be permanently removed from LaborLink servers.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setShowConfirmation(true)}
              >
                <Text style={styles.deleteButtonText}>I understand, continue with deletion</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel, keep my account</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Final Confirmation Screen */
          <View style={styles.confirmationContainer}>
            <View style={styles.iconContainer}>
              <Icon name="warning" size={60} color="#DC2626" />
            </View>

            <Text style={styles.mainTitle}>Final Confirmation</Text>

            <View style={styles.finalWarningBox}>
              <Text style={styles.finalWarningTitle}>Last chance to reconsider!</Text>
              <Text style={styles.finalWarningText}>
                Type <Text style={styles.boldText}>DELETE</Text> in the box below to confirm permanent deletion of your account.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Type "DELETE" to confirm</Text>
              <TextInput
                style={styles.textInput}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="Type DELETE here"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.finalDeleteButton,
                  (isDeleting || confirmText.toLowerCase() !== 'delete') && styles.disabledButton
                ]}
                onPress={handleDeleteAccount}
                disabled={isDeleting || confirmText.toLowerCase() !== 'delete'}
              >
                {isDeleting ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.loadingText}>Deleting Account...</Text>
                  </View>
                ) : (
                  <Text style={styles.finalDeleteButtonText}>Delete My Account Permanently</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.goBackButton}
                onPress={() => setShowConfirmation(false)}
                disabled={isDeleting}
              >
                <Text style={styles.goBackButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#26437c',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningContainer: {
    alignItems: 'center',
  },
  confirmationContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  deleteList: {
    marginLeft: 8,
  },
  deleteItem: {
    fontSize: 14,
    color: '#B45309',
    marginBottom: 4,
    lineHeight: 20,
  },
  dangerBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    width: '100%',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginLeft: 8,
  },
  dangerText: {
    fontSize: 14,
    color: '#B91C1C',
    lineHeight: 20,
  },
  finalWarningBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  finalWarningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  finalWarningText: {
    fontSize: 14,
    color: '#B91C1C',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1F2937',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 50
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  finalDeleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  finalDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  goBackButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  goBackButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DeleteAccountScreen;