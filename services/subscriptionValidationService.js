import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Basic_Url = "http://localhost:8500"; // Update with your actual URL

class SubscriptionValidationService {
  
  /**
   * Get user's current subscription status using existing backend APIs
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Subscription status
   */
  static async getSubscriptionStatus(userId = null) {
    try {
      if (!userId) {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) throw new Error('User not logged in');
        userId = JSON.parse(userData)._id;
      }

      // First, try to get user's active subscriptions from the existing API
      console.log('🔍 Fetching user subscriptions for userId:', userId);
      const userSubscriptionsResponse = await axios.get(`${Basic_Url}/api/user/subscriptions/${userId}`);
      
      console.log('📡 User subscriptions API response:', userSubscriptionsResponse.data);
      
      if (userSubscriptionsResponse.data.success) {
        const userSubscriptions = userSubscriptionsResponse.data.data;
        console.log('📋 User subscriptions data:', userSubscriptions);
        
        // Find active subscription
        const activeSubscription = userSubscriptions.find(sub => 
          sub.status === 'active' && !sub.isExpired
        );
        
        console.log('✅ Active subscription found:', activeSubscription);
        
        if (activeSubscription) {
          // User has active subscription
          const result = {
            subscription: {
              planName: activeSubscription.planName,
              hasActiveSubscription: true,
              userType: activeSubscription.planType,
              subscriptionType: activeSubscription.planType,
              subscriptionId: activeSubscription._id,
              features: activeSubscription.features || {},
              limits: this.extractLimitsFromFeatures(activeSubscription.features || {}),
              startDate: activeSubscription.startDate,
              endDate: activeSubscription.endDate,
              isExpiringSoon: activeSubscription.daysRemaining && activeSubscription.daysRemaining <= 7,
              price: activeSubscription.price,
              duration: activeSubscription.duration
            },
            usage: {} // Will be populated by usage API if needed
          };
          console.log('🎯 Returning active subscription result:', result);
          return result;
        } else {
          // No active subscription - get free plan data
          console.log('🆓 No active subscription found, getting free plan data');
          return await this.getFreePlanData(userId);
        }
      } else {
        // API failed, try fallback
        console.log('❌ User subscriptions API failed, trying fallback');
        return await this.getFreePlanData(userId);
      }

    } catch (error) {
      console.error('Get subscription status error:', error);
      
      // Return fallback data if API is not available
      if (error.code === 'ECONNREFUSED' || error.response?.status === 404) {
        console.log('❌ Subscription API not available, using fallback data');
        console.log('🔍 Error details:', error.message);
        return await this.getFreePlanData(userId);
      }
      
      throw error;
    }
  }

  /**
   * Get free plan data for user using existing backend APIs
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Free plan data
   */
  static async getFreePlanData(userId) {
    try {
      // Detect user type from stored user data
      let detectedUserType = 'employee';
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          detectedUserType = parsedUserData.userType || parsedUserData.role || 'employee';
        }
      } catch (userDataError) {
        console.log('Could not detect user type, defaulting to employee');
      }
      
      // Try to get free subscription plan from backend
      try {
        console.log('🔍 Fetching free plans for userType:', detectedUserType);
        const freePlansResponse = await axios.get(`${Basic_Url}/api/subscriptions?type=${detectedUserType}&price=0`);
        
        console.log('📡 Free plans API response:', freePlansResponse.data);
        
        if (freePlansResponse.data.success && freePlansResponse.data.data.length > 0) {
          const freePlan = freePlansResponse.data.data[0]; // Get first free plan
          console.log('✅ Free plan found:', freePlan);
          
          const result = {
            subscription: {
              planName: freePlan.displayName || `${detectedUserType === 'employer' ? 'Employer' : 'Employee'} Free Plan`,
              hasActiveSubscription: false,
              userType: detectedUserType,
              subscriptionType: 'free',
              features: freePlan.features || {},
              limits: this.extractLimitsFromFeatures(freePlan.features || {}),
              price: freePlan.price || 0,
              duration: freePlan.duration || 'monthly'
            },
            usage: {}
          };
          console.log('🎯 Returning free plan result:', result);
          return result;
        }
      } catch (freePlanError) {
        console.log('❌ Could not fetch free plan from backend, using fallback:', freePlanError.message);
      }
      
      // Fallback to hardcoded free plan data
      const fallbackResult = {
        subscription: {
          planName: `${detectedUserType === 'employer' ? 'Employer' : 'Employee'} Free Plan`,
          hasActiveSubscription: false,
          userType: detectedUserType,
          subscriptionType: 'free',
          features: this.getFreeFeatures(detectedUserType),
          limits: this.getFreeLimits(detectedUserType),
          price: 0,
          duration: 'monthly'
        },
        usage: {}
      };
      console.log('🔄 Using fallback free plan data:', fallbackResult);
      return fallbackResult;
    } catch (error) {
      console.error('Error getting free plan data:', error);
      throw error;
    }
  }

  /**
   * Extract limits from features object
   * @param {Object} features - Features object
   * @returns {Object} Extracted limits
   */
  static extractLimitsFromFeatures(features) {
    const limits = {};
    
    // Extract numeric limits from features
    Object.keys(features).forEach(key => {
      if (typeof features[key] === 'number') {
        limits[key] = features[key];
      }
    });
    
    return limits;
  }

  /**
   * Validate if user can perform a specific action
   * @param {String} action - Action to validate
   * @param {String} userId - User ID (optional)
   * @returns {Promise<Object>} Validation result
   */
  static async validateAction(action, userId = null) {
    try {
      const subscriptionStatus = await this.getSubscriptionStatus(userId);
      return this.validateActionForUserType(action, subscriptionStatus.subscription?.userType || 'employee', userId);
    } catch (error) {
      console.error('Validate action error:', error);
      return {
        allowed: false,
        reason: 'subscription_check_failed',
        message: 'Unable to verify subscription status',
        upgradeRequired: false
      };
    }
  }

  /**
   * Validate action for specific user type
   * @param {String} action - Action to validate
   * @param {String} userType - User type ('employee' or 'employer')
   * @param {String} userId - User ID (optional)
   * @returns {Promise<Object>} Validation result
   */
  static async validateActionForUserType(action, userType, userId = null) {
    try {
      // First try server-side authoritative validation
      try {
        if (!userId) {
          const userData = await AsyncStorage.getItem('userData');
          if (!userData) throw new Error('User not logged in');
          userId = JSON.parse(userData)._id;
        }
        const serverResp = await axios.post(
          `${Basic_Url}/api/subscription-validation/validate/${userId}/${action}`,
          { userType }
        );
        if (serverResp?.data?.success) {
          const data = serverResp.data?.data || serverResp.data;
          // Respect server-side allowed flag and messaging
          return {
            allowed: !!data.allowed,
            reason: data.reason || (data.allowed ? 'success' : 'limit_exceeded'),
            message: data.message || (data.allowed ? 'Action allowed' : 'Not allowed'),
            upgradeRequired: !!data.upgradeRequired,
            subscription: data.subscription,
            remainingUsage: data.remainingUsage,
            totalLimit: data.totalLimit,
            currentUsage: data.currentUsage,
            dailyLimit: data.dailyLimit,
            dailyUsage: data.dailyUsage
          };
        }
        if (serverResp?.data && serverResp.data.success === false) {
          return {
            allowed: false,
            reason: serverResp.data.error || 'limit_exceeded',
            message: serverResp.data.error || 'Not allowed',
            upgradeRequired: !!serverResp.data.upgradeRequired,
            subscription: serverResp.data.subscription,
            remainingUsage: serverResp.data.remainingUsage,
            totalLimit: serverResp.data.totalLimit,
            currentUsage: serverResp.data.currentUsage
          };
        }
      } catch (serverErr) {
        // Fall back to local validation if server call fails
        console.log('Server validate failed, using local validation:', serverErr?.message || serverErr);
      }

      const subscriptionStatus = await this.getSubscriptionStatus(userId);
      const subscription = subscriptionStatus.subscription;
      // Always fetch live usage for accurate checks
      let liveUsage = {};
      try {
        liveUsage = await this.getCurrentUsage(userId);
      } catch (e) {
        liveUsage = subscriptionStatus.usage || {};
      }
      
      if (!subscription) {
        return {
          allowed: false,
          reason: 'no_subscription',
          message: 'No subscription found',
          upgradeRequired: true
        };
      }

      // Check if user type matches
      if (subscription.userType !== userType) {
        return {
          allowed: false,
          reason: 'user_type_mismatch',
          message: `Action requires ${userType} subscription`,
          upgradeRequired: true
        };
      }

      // Check if user has active subscription for premium actions
      const premiumActions = userType === 'employee' ? [
        'premium_filters',
        'resume_boost',
        'unlimited_applications'
      ] : [
        'premium_job_posting',
        'candidate_database_access',
        'analytics_access',
        'bulk_messaging'
      ];

      if (premiumActions.includes(action) && !subscription.hasActiveSubscription) {
        return {
          allowed: false,
          reason: 'premium_feature',
          message: 'This feature requires a premium subscription',
          upgradeRequired: true
        };
      }

      // Check usage limits
      const usage = liveUsage || {};
      const limits = subscription.limits || {};

      // Define action mappings with limits
      const actionMappings = {
        employee: {
          // Enforce monthly AND daily limits together for apply_job
          'apply_job': {
            monthlyLimitKey: 'jobApplicationsPerMonth',
            monthlyUsed: usage.jobApplicationsPerMonth || 0,
            dailyLimitKey: 'jobApplicationsPerDay',
            dailyUsed: usage.jobApplicationsPerDay || 0
          },
          'search_job': { limit: 'jobSearchPerDay', usage: usage.jobSearchPerDay || 0 },
          'view_company_details': { limit: 'companyViewsPerDay', usage: usage.companyViewsPerDay || 0 },
          'contact_employer': { limit: 'messagesPerThread', usage: usage.messagesPerThread || 0 },
          'premium_filters': { limit: 'premiumFilters', usage: usage.premiumFilters || 0 },
          'resume_boost': { limit: 'resumeBoosts', usage: usage.resumeBoosts || 0 },
          'job_alerts': { limit: 'customJobAlerts', usage: usage.customJobAlerts || 0 }
        },
        employer: {
          'post_job': { limit: 'activeJobPosts', usage: usage.activeJobPosts || 0 },
          'search_candidates': { limit: 'candidateSearchesPerDay', usage: usage.candidateSearchesPerDay || 0 },
          'view_candidate_contact': { limit: 'candidateViewsPerDay', usage: usage.candidateViewsPerDay || 0 },
          'premium_job_posting': { limit: 'premiumJobPosts', usage: usage.premiumJobPosts || 0 },
          'candidate_database_access': { limit: 'databaseAccess', usage: usage.databaseAccess || 0 },
          'analytics_access': { limit: 'analyticsAccess', usage: usage.analyticsAccess || 0 },
          'bulk_messaging': { limit: 'bulkMessages', usage: usage.bulkMessages || 0 }
        }
      };

      const userActions = actionMappings[userType] || {};
      const actionConfig = userActions[action];

      if (actionConfig) {
        // Special handling for apply_job with monthly + daily limits
        if (action === 'apply_job') {
          const monthlyLimit = limits[actionConfig.monthlyLimitKey];
          const monthlyUsed = actionConfig.monthlyUsed;
          const dailyLimit = limits[actionConfig.dailyLimitKey];
          const dailyUsed = actionConfig.dailyUsed;

          const monthlyAllowed = typeof monthlyLimit === 'number' ? monthlyUsed < monthlyLimit : true;
          const dailyAllowed = typeof dailyLimit === 'number' ? dailyUsed < dailyLimit : true;

          const allowed = monthlyAllowed && dailyAllowed;
          if (!allowed) {
            const reason = !monthlyAllowed ? 'monthly_limit_exceeded' : 'daily_limit_exceeded';
            const message = !monthlyAllowed
              ? 'Your monthly application limit is reached. Please upgrade your plan.'
              : 'You have reached today\'s application limit.';
            const remainingMonthly = typeof monthlyLimit === 'number' ? Math.max(0, monthlyLimit - monthlyUsed) : null;
            const remainingDaily = typeof dailyLimit === 'number' ? Math.max(0, dailyLimit - dailyUsed) : null;
            return {
              allowed: false,
              reason,
              message,
              upgradeRequired: true,
              remainingUsage: remainingMonthly,
              totalLimit: monthlyLimit,
              currentUsage: monthlyUsed,
              dailyLimit,
              dailyUsage: dailyUsed,
              remainingDaily
            };
          }
        } else if (actionConfig.limit) {
          const limit = limits[actionConfig.limit];
          const currentUsageVal = actionConfig.usage;
          if (typeof limit === 'number' && currentUsageVal >= limit) {
            return {
              allowed: false,
              reason: 'limit_exceeded',
              message: `You have reached your limit for ${action}`,
              upgradeRequired: true,
              currentUsage: currentUsageVal,
              limit
            };
          }
        }
      }

      return {
        allowed: true,
        reason: 'success',
        message: 'Action allowed',
        upgradeRequired: false
      };

    } catch (error) {
      console.error('Validate action for user type error:', error);
      return {
        allowed: false,
        reason: 'validation_error',
        message: 'Unable to validate action',
        upgradeRequired: false
      };
    }
  }

  /**
   * Get current usage for user
   * @param {String} userId - User ID (optional)
   * @returns {Promise<Object>} Current usage
   */
  static async getCurrentUsage(userId = null) {
    try {
      if (!userId) {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) throw new Error('User not logged in');
        userId = JSON.parse(userData)._id;
      }

      const response = await axios.get(`${Basic_Url}/api/subscription-validation/usage/${userId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get usage data');
      }

    } catch (error) {
      console.error('Get current usage error:', error);
      return {};
    }
  }

  /**
   * Get subscription recommendations
   * @param {String} userId - User ID (optional)
   * @returns {Promise<Array>} Recommended subscriptions
   */
  static async getRecommendations(userId = null) {
    try {
      if (!userId) {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) throw new Error('User not logged in');
        userId = JSON.parse(userData)._id;
      }

      const response = await axios.get(`${Basic_Url}/api/subscription-validation/recommendations/${userId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get recommendations');
      }

    } catch (error) {
      console.error('Get recommendations error:', error);
      return [];
    }
  }

  /**
   * Get subscription recommendations based on user type
   * @param {String} userType - User type ('employee' or 'employer')
   * @param {String} userId - User ID (optional)
   * @returns {Promise<Array>} Recommended subscriptions
   */
  static async getRecommendationsForUserType(userType, userId = null) {
    try {
      const response = await axios.get(`${Basic_Url}/api/subscriptions?type=${userType}&isActive=true`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get recommendations');
      }

    } catch (error) {
      console.error('Get recommendations for user type error:', error);
      throw error;
    }
  }

  /**
   * Get available actions for current user from backend
   * @param {String} userId - User ID (optional)
   * @returns {Promise<Object>} Available actions map
   */
  static async getAvailableActions(userId = null) {
    try {
      if (!userId) {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) throw new Error('User not logged in');
        userId = JSON.parse(userData)._id;
      }

      const response = await axios.get(`${Basic_Url}/api/subscription-validation/actions/${userId}`);
      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error(response.data?.error || 'Failed to load available actions');
    } catch (error) {
      console.error('Get available actions error:', error);
      // Fallback: derive actions from current subscription status
      try {
        const status = await this.getSubscriptionStatus(userId);
        const features = status?.subscription?.features || {};
        return { features };
      } catch (e) {
        return {};
      }
    }
  }

  /**
   * Get free features for user type
   * @param {String} userType - User type ('employee' or 'employer')
   * @returns {Object} Free features
   */
  static getFreeFeatures(userType) {
    const freeFeatures = {
      employee: {
        profileCreation: true,
        workExperience: true,
        educationDetails: true,
        skillsManagement: true,
        preferredSalary: true,
        locationPreferences: true,
        jobApplications: true,
        applicationTracking: true,
        jobAlerts: true,
        applicationHistory: true,
        employerChat: true,
        applicationMessages: true,
        onlineInterviews: true,
        interviewScheduling: true,
        interviewAvailability: true,
        interviewFeedback: true,
        enableJobSearch: true,
        enableJobApplications: true,
        enableProfileUpdates: true,
        enableInterviews: true,
        enableCommunication: true
      },
      employer: {
        profileCreation: true,
        workExperience: true,
        jobApplications: true,
        applicationTracking: true,
        jobAlerts: true,
        applicationHistory: true,
        employerChat: true,
        applicationMessages: true,
        onlineInterviews: true,
        interviewScheduling: true,
        interviewFeedback: true,
        enableJobPosting: true,
        enableCandidateSearch: true,
        enableEmployerInterviews: true,
        enableEmployerCommunication: true
      }
    };

    return freeFeatures[userType] || freeFeatures.employee;
  }

  /**
   * Get free limits for user type
   * @param {String} userType - User type ('employee' or 'employer')
   * @returns {Object} Free limits
   */
  static getFreeLimits(userType) {
    const freeLimits = {
      employee: {
        jobSearchPerDay: 5,
        jobApplicationsPerMonth: 3,
        jobApplicationsPerDay: 1,
        companyViewsPerDay: 3,
        profileUpdatesPerMonth: 2,
        // skillAssessmentsPerMonth removed (no assessments feature in app)
        interviewsPerMonth: 2,
        messagesPerThread: 10,
        customJobAlerts: 1
      },
      employer: {
        activeJobPosts: 1,
        candidateSearchesPerDay: 5,
        candidateViewsPerDay: 3,
        applicationReviewsPerDay: 10,
        interviewSlotsPerJob: 3,
        messagesPerCandidate: 10,
        messageThreads: 3
      }
    };

    return freeLimits[userType] || freeLimits.employee;
  }

  /**
   * Check if user has specific feature
   * @param {String} featureName - Feature to check
   * @param {String} userId - User ID (optional)
   * @returns {Promise<Boolean>} Has feature
   */
  static async hasFeature(featureName, userId = null) {
    try {
      const subscriptionStatus = await this.getSubscriptionStatus(userId);
      const features = subscriptionStatus.subscription?.features || {};
      return features[featureName] === true;
    } catch (error) {
      console.error('Has feature error:', error);
      return false;
    }
  }

  /**
   * Get upgrade message for user
   * @param {String} action - Action that requires upgrade
   * @param {String} userId - User ID (optional)
   * @returns {Promise<String>} Upgrade message
   */
  static async getUpgradeMessage(action, userId = null) {
    try {
      const subscriptionStatus = await this.getSubscriptionStatus(userId);
      const subscription = subscriptionStatus.subscription;
      
      if (!subscription) {
        return 'Please subscribe to access this feature.';
      }

      const userType = subscription.userType || 'employee';
      const planName = subscription.planName || 'Free Plan';
      
      return `This feature requires a premium ${userType} subscription. You are currently on the ${planName}. Please upgrade to access this feature.`;
    } catch (error) {
      console.error('Get upgrade message error:', error);
      return 'Please upgrade your subscription to access this feature.';
    }
  }

  /**
   * Record action usage
   * @param {String} action - Action performed
   * @param {String} userId - User ID (optional)
   * @returns {Promise<Object>} Recording result
   */
  static async recordUsage(action, userId = null) {
    try {
      if (!userId) {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) throw new Error('User not logged in');
        userId = JSON.parse(userData)._id;
      }

      const response = await axios.post(`${Basic_Url}/api/subscription-validation/record-usage`, {
        userId,
        action,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to record usage');
      }

    } catch (error) {
      console.error('Record usage error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default SubscriptionValidationService;