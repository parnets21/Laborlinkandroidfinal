import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useSubscriptionValidation from '../hooks/useSubscriptionValidation';
import SubscriptionValidationService from '../services/subscriptionValidationService';

/**
 * Component that wraps content with subscription validation
 * @param {Object} props - Component props
 * @param {String} props.action - Action to validate
 * @param {React.Node} props.children - Content to show when allowed
 * @param {React.Node} props.fallback - Content to show when not allowed
 * @param {Function} props.onUpgrade - Callback when upgrade is needed
 * @param {Boolean} props.showUpgradeModal - Whether to show upgrade modal
 * @param {Boolean} props.recordUsage - Whether to record usage when action is performed
 * @param {Object} props.metadata - Additional metadata for usage recording
 * @param {String} props.userType - User type ('employee' or 'employer')
 */
const SubscriptionGuard = ({
  action,
  children,
  fallback,
  onUpgrade,
  showUpgradeModal = true,
  recordUsage = true,
  metadata = {},
  userType,
  style
}) => {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { validateAction, subscriptionStatus } = useSubscriptionValidation();

  useEffect(() => {
    if (action) {
      checkPermission();
    }
  }, [action, subscriptionStatus]);

  const checkPermission = async () => {
    try {
      setLoading(true);
      
      // Use user type validation if provided
      let result;
      if (userType) {
        result = await SubscriptionValidationService.validateActionForUserType(action, userType);
      } else {
        result = await validateAction(action);
      }
      
      setValidation(result);
      
      if (!result.allowed && showUpgradeModal && result.upgradeRequired) {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Permission check error:', error);
      setValidation({
        allowed: false,
        reason: 'Permission check failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setShowModal(false);
    if (onUpgrade) {
      onUpgrade(validation);
    } else {
      // Default upgrade action - navigate to subscription screen
      console.log('Navigate to subscription upgrade');
    }
  };

  const handleExecute = async (callback) => {
    if (validation?.allowed && recordUsage) {
      try {
        await SubscriptionValidationService.recordUsage(action, metadata);
      } catch (error) {
        console.error('Usage recording error:', error);
      }
    }
    
    if (callback) callback();
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color="#134083" />
      </View>
    );
  }

  if (!validation?.allowed) {
    if (fallback) {
      return <View style={style}>{fallback}</View>;
    }

    return (
      <View style={[styles.restrictedContainer, style]}>
        <Icon name="lock" size={24} color="#9CA3AF" />
        <Text style={styles.restrictedText}>
          {validation?.reason || 'Feature not available'}
        </Text>
        {validation?.upgradeRequired && (
          <TouchableOpacity style={styles.upgradeButton} onPress={() => setShowModal(true)}>
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        )}
        
        {/* Upgrade Modal */}
        <Modal
          visible={showModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Icon name="star" size={32} color="#F59E0B" />
                <Text style={styles.modalTitle}>Upgrade Required</Text>
              </View>
              
              <Text style={styles.modalMessage}>
                {validation?.reason || 'This feature requires a premium subscription.'}
              </Text>
              
              {validation?.remainingUsage && (
                <View style={styles.usageInfo}>
                  <Text style={styles.usageText}>
                    Usage: {validation.remainingUsage.currentUsage || 0}/{validation.remainingUsage.totalLimit || 0}
                  </Text>
                </View>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.upgradeModalButton} 
                  onPress={handleUpgrade}
                >
                  <Text style={styles.upgradeModalButtonText}>Upgrade Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Clone children and add execution wrapper if needed
  if (React.isValidElement(children) && children.props.onPress) {
    const originalOnPress = children.props.onPress;
    const wrappedOnPress = () => handleExecute(originalOnPress);
    
    return React.cloneElement(children, { onPress: wrappedOnPress });
  }

  return <View style={style}>{children}</View>;
};

/**
 * Usage limit indicator component
 */
const UsageLimitIndicator = ({ 
  limitName, 
  label, 
  showPercentage = true, 
  warningThreshold = 80,
  style 
}) => {
  const { getUsagePercentage, getRemainingUsage, subscriptionStatus } = useSubscriptionValidation();
  
  if (!subscriptionStatus) return null;
  
  const percentage = getUsagePercentage(limitName);
  const remaining = getRemainingUsage(limitName);
  const limit = subscriptionStatus.subscription.limits[limitName];
  const used = (subscriptionStatus.usage && subscriptionStatus.usage[limitName]) || 0;
  
  if (!limit) return null;
  
  const isWarning = percentage >= warningThreshold;
  const isDanger = percentage >= 95;
  
  return (
    <View style={[styles.usageLimitContainer, style]}>
      <View style={styles.usageLimitHeader}>
        <Text style={styles.usageLimitLabel}>{label}</Text>
        <Text style={[
          styles.usageLimitText,
          isWarning && styles.usageLimitWarning,
          isDanger && styles.usageLimitDanger
        ]}>
          {used}/{limit}
        </Text>
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${percentage}%` },
            isWarning && styles.progressWarning,
            isDanger && styles.progressDanger
          ]} 
        />
      </View>
      
      {showPercentage && (
        <Text style={styles.percentageText}>{percentage}% used</Text>
      )}
    </View>
  );
};

/**
 * Subscription status badge
 */
const SubscriptionBadge = ({ style }) => {
  const { getSubscriptionInfo } = useSubscriptionValidation();
  const info = getSubscriptionInfo();
  
  if (!info) return null;
  
  const badgeStyle = info.hasActiveSubscription ? styles.activeBadge : styles.freeBadge;
  const textStyle = info.hasActiveSubscription ? styles.activeBadgeText : styles.freeBadgeText;
  
  return (
    <View style={[styles.badge, badgeStyle, style]}>
      <Text style={[styles.badgeText, textStyle]}>
        {info.planName}
      </Text>
      {info.isExpiringSoon && (
        <Icon name="warning" size={14} color="#F59E0B" style={styles.warningIcon} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  restrictedContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  restrictedText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#134083',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    minWidth: 300,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#134083',
    marginTop: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  usageInfo: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  usageText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  upgradeModalButton: {
    flex: 1,
    backgroundColor: '#134083',
    padding: 12,
    borderRadius: 8,
  },
  upgradeModalButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  usageLimitContainer: {
    marginBottom: 16,
  },
  usageLimitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLimitLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  usageLimitText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  usageLimitWarning: {
    color: '#F59E0B',
  },
  usageLimitDanger: {
    color: '#EF4444',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressWarning: {
    backgroundColor: '#F59E0B',
  },
  progressDanger: {
    backgroundColor: '#EF4444',
  },
  percentageText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#10B981',
  },
  freeBadge: {
    backgroundColor: '#6B7280',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeBadgeText: {
    color: '#FFFFFF',
  },
  freeBadgeText: {
    color: '#FFFFFF',
  },
  warningIcon: {
    marginLeft: 4,
  },
});

export default SubscriptionGuard;
export { UsageLimitIndicator, SubscriptionBadge };
