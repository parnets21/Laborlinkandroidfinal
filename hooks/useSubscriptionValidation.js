import { useState, useEffect, useCallback } from 'react';
import SubscriptionValidationService from '../services/subscriptionValidationService';
import { Alert } from 'react-native';

/**
 * Custom hook for subscription validation
 * @param {String} userId - User ID (optional)
 * @returns {Object} Subscription validation utilities
 */
const useSubscriptionValidation = (userId = null) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [availableActions, setAvailableActions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load subscription status
   */
  const loadSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const status = await SubscriptionValidationService.getSubscriptionStatus(userId);
      
      // Ensure we have a valid subscription object
      if (status && status.subscription) {
        setSubscriptionStatus(status);
      } else {
        // Fallback for users without subscription data
        let detectedUserType = 'employee';
        try {
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            detectedUserType = parsedUserData.userType || parsedUserData.role || 'employee';
          }
        } catch (userDataError) {
          console.log('Could not detect user type in initial fallback, defaulting to employee');
        }
        
        const fallbackStatus = {
          subscription: {
            planName: `${detectedUserType === 'employer' ? 'Employer' : 'Employee'} Free Plan`,
            hasActiveSubscription: false,
            userType: detectedUserType,
            limits: detectedUserType === 'employer' ? {
              activeJobPosts: 1,
              candidateSearchesPerDay: 5,
              candidateViewsPerDay: 3,
              applicationReviewsPerDay: 10
            } : {
              jobApplicationsPerMonth: 3,
              jobSearchPerDay: 5,
              companyViewsPerDay: 3,
              profileUpdatesPerMonth: 2
            }
          },
          usage: {}
        };
        setSubscriptionStatus(fallbackStatus);
      }
      
      return status;
    } catch (err) {
      setError(err.message);
      console.error('Load subscription status error:', err);
      
      // Set fallback status on error with user type detection
      let detectedUserType = 'employee';
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          detectedUserType = parsedUserData.userType || parsedUserData.role || 'employee';
        }
      } catch (userDataError) {
        console.log('Could not detect user type in hook, defaulting to employee');
      }
      
      const fallbackStatus = {
        subscription: {
          planName: `${detectedUserType === 'employer' ? 'Employer' : 'Employee'} Free Plan`,
          hasActiveSubscription: false,
          userType: detectedUserType,
          limits: detectedUserType === 'employer' ? {
            activeJobPosts: 1,
            candidateSearchesPerDay: 5,
            candidateViewsPerDay: 3,
            applicationReviewsPerDay: 10
          } : {
            jobApplicationsPerMonth: 3,
            jobSearchPerDay: 5,
            companyViewsPerDay: 3,
            profileUpdatesPerMonth: 2
          }
        },
        usage: {}
      };
      setSubscriptionStatus(fallbackStatus);
      
      return fallbackStatus;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Load available actions
   */
  const loadAvailableActions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const actions = await SubscriptionValidationService.getAvailableActions(userId);
      setAvailableActions(actions);
      
      return actions;
    } catch (err) {
      setError(err.message);
      console.error('Load available actions error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Validate a specific action
   */
  const validateAction = useCallback(async (action, currentUsage = {}) => {
    try {
      const validation = await SubscriptionValidationService.validateAction(action, userId, currentUsage);
      return validation;
    } catch (err) {
      console.error('Validate action error:', err);
      return {
        allowed: false,
        reason: 'Validation error',
        error: err.message
      };
    }
  }, [userId]);

  /**
   * Check if user can perform action with UI feedback
   */
  const checkAction = useCallback(async (action, options = {}) => {
    try {
      const validation = await validateAction(action, options.currentUsage);
      
      if (!validation.allowed) {
        const message = SubscriptionValidationService.getUpgradeMessage(validation);
        
        if (options.showAlert !== false) {
          Alert.alert(
            'Action Not Available',
            message,
            [
              { text: 'OK', style: 'default' },
              ...(validation.upgradeRequired ? [{
                text: 'Upgrade',
                style: 'default',
                onPress: options.onUpgrade || (() => {
                  console.log('Navigate to upgrade screen');
                })
              }] : [])
            ]
          );
        }
      }
      
      return validation;
    } catch (err) {
      console.error('Check action error:', err);
      return {
        allowed: false,
        reason: 'Check failed',
        error: err.message
      };
    }
  }, [validateAction]);

  /**
   * Execute action with validation and usage recording
   */
  const executeAction = useCallback(async (action, callback, options = {}) => {
    try {
      const validation = await checkAction(action, {
        ...options,
        showAlert: options.showAlert !== false
      });
      
      if (validation.allowed) {
        // Record usage if specified
        if (options.recordUsage !== false) {
          await SubscriptionValidationService.recordUsage(action, options.metadata, userId);
        }
        
        // Execute the callback
        if (callback) {
          return await callback(validation);
        }
      }
      
      return validation;
    } catch (err) {
      console.error('Execute action error:', err);
      return {
        allowed: false,
        reason: 'Execution failed',
        error: err.message
      };
    }
  }, [checkAction, userId]);

  /**
   * Check if user has specific feature
   */
  const hasFeature = useCallback((featureName) => {
    if (!subscriptionStatus) return false;
    return !!subscriptionStatus.subscription.features[featureName];
  }, [subscriptionStatus]);

  /**
   * Get usage percentage for a limit
   */
  const getUsagePercentage = useCallback((limitName) => {
    if (!subscriptionStatus || !subscriptionStatus.usage) return 0;
    
    const limit = subscriptionStatus.subscription.limits[limitName];
    const used = subscriptionStatus.usage[limitName] || 0;
    
    if (!limit || typeof limit !== 'number') return 0;
    
    return Math.min(100, Math.round((used / limit) * 100));
  }, [subscriptionStatus]);

  /**
   * Get remaining usage for a limit
   */
  const getRemainingUsage = useCallback((limitName) => {
    if (!subscriptionStatus) return 0;
    
    const limit = subscriptionStatus.subscription.limits[limitName];
    const used = subscriptionStatus.usage[limitName] || 0;
    
    if (!limit || typeof limit !== 'number') return 0;
    
    return Math.max(0, limit - used);
  }, [subscriptionStatus]);

  /**
   * Check if usage is near limit (>80%)
   */
  const isNearLimit = useCallback((limitName, threshold = 80) => {
    const percentage = getUsagePercentage(limitName);
    return percentage >= threshold;
  }, [getUsagePercentage]);

  /**
   * Get subscription display info
   */
  const getSubscriptionInfo = useCallback(() => {
    if (!subscriptionStatus) return null;
    
    const { subscription } = subscriptionStatus;
    
    return {
      planName: subscription.planName || 'Free Plan',
      subscriptionType: subscription.subscriptionType,
      hasActiveSubscription: subscription.hasActiveSubscription,
      isExpiringSoon: subscription.isExpiringSoon,
      endDate: subscription.endDate,
      userType: subscription.userType
    };
  }, [subscriptionStatus]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadSubscriptionStatus(),
      loadAvailableActions()
    ]);
  }, [loadSubscriptionStatus, loadAvailableActions]);

  // Load initial data
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    // Data
    subscriptionStatus,
    availableActions,
    loading,
    error,
    
    // Actions
    validateAction,
    checkAction,
    executeAction,
    refresh,
    
    // Utilities
    hasFeature,
    getUsagePercentage,
    getRemainingUsage,
    isNearLimit,
    getSubscriptionInfo,
    
    // Computed values
    isSubscribed: subscriptionStatus?.subscription?.hasActiveSubscription || false,
    userType: subscriptionStatus?.subscription?.userType || null,
    planName: subscriptionStatus?.subscription?.planName || 'Free Plan'
  };
};

export default useSubscriptionValidation;
