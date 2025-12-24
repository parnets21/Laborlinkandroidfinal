import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const ReferralComingSoon = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for "Coming Soon" badge
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const features = [
    {
      icon: 'share',
      title: 'Easy Sharing',
      description: 'Share your unique referral code with friends and colleagues',
      color: '#10B981'
    },
    {
      icon: 'account-balance-wallet',
      title: 'Earn Rewards',
      description: 'Get bonus for every successful referral hire',
      color: '#F59E0B'
    },
    {
      icon: 'people',
      title: 'Track Referrals',
      description: 'Monitor your referrals and their application status',
      color: '#8B5CF6'
    },
    {
      icon: 'trending-up',
      title: 'Real-time Updates',
      description: 'Get instant notifications on referral progress',
      color: '#EF4444'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral Program</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Coming Soon Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.comingSoonBadge,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text style={styles.comingSoonText}>COMING SOON</Text>
          </Animated.View>
          
          <Text style={styles.heroTitle}>Referral Program</Text>
          <Text style={styles.heroSubtitle}>
            Earn rewards by referring talented professionals to join our platform
          </Text>
          
          <View style={styles.rewardHighlight}>
            <Icon name="star" size={32} color="#FFD700" />
            <Text style={styles.rewardText}>Up to ₹5,000</Text>
            <Text style={styles.rewardSubtext}>per successful hire</Text>
          </View>
        </Animated.View>

        {/* Features Preview */}
        <Animated.View 
          style={[
            styles.featuresSection,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.sectionTitle}>What's Coming</Text>
          
          {features.map((feature, index) => (
            <Animated.View 
              key={index}
              style={[
                styles.featureCard,
                {
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50 + (index * 20)]
                    })
                  }]
                }
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                <Icon name={feature.icon} size={24} color={feature.color} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Preview Cards */}
        <Animated.View 
          style={[
            styles.previewSection,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.sectionTitle}>Preview</Text>
          
          {/* Referral Code Preview */}
          <View style={styles.previewCard}>
            <Text style={styles.previewCardTitle}>Your Referral Code</Text>
            <View style={styles.codePreview}>
              <View style={styles.codePlaceholder}>
                <Text style={styles.codePlaceholderText}>REF******</Text>
              </View>
              <View style={styles.sharePreview}>
                <Icon name="share" size={20} color="#2563EB" />
                <Text style={styles.shareText}>Share</Text>
              </View>
            </View>
          </View>

          {/* Stats Preview */}
          <View style={styles.previewCard}>
            <Text style={styles.previewCardTitle}>Your Stats</Text>
            <View style={styles.statsPreview}>
              <View style={styles.statItem}>
                <View style={styles.statPlaceholder} />
                <Text style={styles.statLabel}>Total Referrals</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statPlaceholder} />
                <Text style={styles.statLabel}>Successful Hires</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statPlaceholder} />
                <Text style={styles.statLabel}>Earnings</Text>
              </View>
            </View>
          </View>

          {/* Referrals List Preview */}
          <View style={styles.previewCard}>
            <Text style={styles.previewCardTitle}>Referral History</Text>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.referralPreview}>
                <View style={styles.referralPlaceholder}>
                  <View style={styles.namePlaceholder} />
                  <View style={styles.positionPlaceholder} />
                  <View style={styles.datePlaceholder} />
                </View>
                <View style={styles.statusPlaceholder} />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Notification Section */}
        <Animated.View 
          style={[
            styles.notificationSection,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.notificationCard}>
            <Icon name="notifications" size={32} color="#26437c" />
            <Text style={styles.notificationTitle}>Get Notified</Text>
            <Text style={styles.notificationText}>
              Be the first to know when the referral program launches!
            </Text>
            <TouchableOpacity style={styles.notifyButton}>
              <Text style={styles.notifyButtonText}>Notify Me</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#26437c',
    padding: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comingSoonBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#26437c',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  rewardHighlight: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  rewardText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 8,
  },
  rewardSubtext: {
    fontSize: 14,
    color: '#92400E',
    marginTop: 4,
  },
  featuresSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#26437c',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#26437c',
    marginBottom: 12,
  },
  codePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 8,
  },
  codePlaceholder: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  codePlaceholderText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '600',
  },
  sharePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  statsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statPlaceholder: {
    width: 40,
    height: 24,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  referralPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  referralPlaceholder: {
    flex: 1,
  },
  namePlaceholder: {
    width: '70%',
    height: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 6,
  },
  positionPlaceholder: {
    width: '50%',
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: 4,
  },
  datePlaceholder: {
    width: '40%',
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  statusPlaceholder: {
    width: 60,
    height: 24,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
  },
  notificationSection: {
    marginBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#26437c',
    marginTop: 16,
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  notifyButton: {
    backgroundColor: '#26437c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  notifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReferralComingSoon