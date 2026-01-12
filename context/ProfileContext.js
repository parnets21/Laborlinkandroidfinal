import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'http://localhost:8500'; // For Android emulator
// const BASE_URL = 'http://localhost:8500'; // For iOS simulator

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);

  // Load profile data when the app starts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`${BASE_URL}/api/user/getUserById/${userId}`);
          const data = await response.json();

          if (response.ok) {
            setProfileData(data);
          } else {
            console.error('Failed to load profile:', data.error);
            setError(data.error);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateProfileData = async (updatedData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Enforce subscription limit for profile updates per month for employees
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        const userIdForLimit = parsed?._id || (await AsyncStorage.getItem('userId'));
        if (userIdForLimit) {
          // Ask backend if this action is allowed and get current usage
          const resp = await fetch(`http://localhost:8500/api/subscription-validation/validate/${userIdForLimit}/profile_update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userType: 'employee' })
          });
          const data = await resp.json();
          if (!data?.success || data?.data?.allowed === false) {
            const message = data?.data?.message || data?.error || 'Monthly profile update limit reached. Please upgrade your plan.';
            throw new Error(message);
          }
        }
      } catch (limitErr) {
        // Surface friendly error and stop update
        setIsLoading(false);
        setError(limitErr.message);
        throw limitErr;
      }

      // For new registration flow
      if (!updatedData._id) {
        setRegistrationData(prev => {
          const newData = {
            ...prev,
            ...updatedData
          };
          console.log('Updated registration data:', JSON.stringify(newData, null, 2));
          return newData;
        });
        return { success: true, message: 'Data stored for registration' };
      }

      // For existing profile updates
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${BASE_URL}/api/user/updateProfile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update profile');
      }

      // Record usage for profile update on success (monthly counter)
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        const userIdForUsage = parsed?._id || (await AsyncStorage.getItem('userId'));
        if (userIdForUsage) {
          await fetch('http://localhost:8500/api/subscription-validation/record-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userIdForUsage, action: 'profile_update', timestamp: new Date().toISOString() })
          });
        }
      } catch {}

      setProfileData(prevData => ({
        ...prevData,
        ...updatedData
      }));

      return data;
    } catch (error) {
      console.error('Error in updateProfileData:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitRegistration = async (skillsData) => {
    console.log(skillsData, "skillsData")
    try {
      setIsLoading(true);
      setError(null);

      if (!registrationData) {
        throw new Error('No registration data found. Please start registration from the beginning.');
      }

      // Combine all registration data
      const completeData = {
        ...registrationData,
        skills: skillsData,
        registrationStep: 3
      };

      console.log('Submitting complete registration:', JSON.stringify(completeData, null, 2));

      const response = await fetch(`${BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      // Store the new user ID
      if (data.userId) {
        await AsyncStorage.setItem('userId', data.userId);
      }

      // Update profile data and clear registration data
      setProfileData(data.data || completeData);
      setRegistrationData(null);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${BASE_URL}/api/user/getUserById/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setProfileData(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearProfileData = () => {
    setProfileData(null);
    setRegistrationData(null);
    setError(null);
  };

  return (
    <ProfileContext.Provider value={{
      profileData,
      isLoading,
      error,
      registrationData,
      updateProfileData,
      submitRegistration,
      fetchUserProfile,
      clearProfileData
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;