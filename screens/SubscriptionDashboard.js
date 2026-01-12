import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    Animated,
    Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const SubscriptionDashboard = ({ navigation }) => {
    const Basic_Url = 'http://localhost:8500';
    
    // State management
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [userType, setUserType] = useState('employee');
    const [refreshing, setRefreshing] = useState(false);
    
    // Subscription plans state
    const [availablePlans, setAvailablePlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(null);
    
    // WebView states for payment 
    const [isWebViewVisible, setWebViewVisible] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState('');
    const [merchantTransactionId, setMerchantTransactionId] = useState('');
    
    // Animation values
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);

    useEffect(() => {
        fetchDashboardData();
        fetchAvailablePlans();
        
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Get user data
            const storedUserData = await AsyncStorage.getItem('userData');
            if (!storedUserData) {
                Alert.alert('Error', 'User data not found');
                return;
            }
            
            const userData = JSON.parse(storedUserData);
            const userId = userData._id;
            const type = userData.userType || 'employee';
            setUserType(type);

            // Fetch dashboard analytics
            const [analyticsResponse, userSubscriptionsResponse, transactionsResponse] = await Promise.all([
                axios.get(`${Basic_Url}/api/subscription/analytics?type=${type}`),
                axios.get(`${Basic_Url}/api/user/subscriptions/${userId}`),
                axios.get(`${Basic_Url}/api/user/checkPayment/history/${userId}`)
            ]);

            const analytics = analyticsResponse.data.success ? analyticsResponse.data.data : null;
            const userSubscriptions = userSubscriptionsResponse.data.success ? userSubscriptionsResponse.data.data : [];
            const transactions = transactionsResponse.data.success ? transactionsResponse.data.data : [];

            // Process user subscription data
            const now = new Date();
            const activeSubscriptions = userSubscriptions.filter(sub => 
                sub.status === 'active' && new Date(sub.endDate) > now
            );
            const expiredSubscriptions = userSubscriptions.filter(sub => 
                sub.status === 'active' && new Date(sub.endDate) <= now
            );
            const inactiveSubscriptions = userSubscriptions.filter(sub => 
                sub.status === 'inactive' || sub.status === 'cancelled'
            );

            // Process transaction data
            const completedTransactions = transactions.filter(tx => tx.status === 'COMPLETED');
            const failedTransactions = transactions.filter(tx => tx.status === 'FAILED');
            const totalSpent = completedTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

            // Calculate subscription health
            const totalSubscriptions = userSubscriptions.length;
            const healthScore = totalSubscriptions > 0 ? 
                Math.round((activeSubscriptions.length / totalSubscriptions) * 100) : 0;

            setDashboardData({
                // User specific data
                user: {
                    activeSubscriptions: activeSubscriptions.length,
                    expiredSubscriptions: expiredSubscriptions.length,
                    inactiveSubscriptions: inactiveSubscriptions.length,
                    totalSubscriptions,
                    healthScore,
                    totalSpent,
                    completedTransactions: completedTransactions.length,
                    failedTransactions: failedTransactions.length
                },
                // Global analytics
                global: analytics || {
                    overview: { totalPlans: 0, activePlans: 0, freePlans: 0 },
                    pricing: { avgPrice: 0, minPrice: 0, maxPrice: 0 }
                },
                // Recent subscriptions
                recentSubscriptions: userSubscriptions.slice(0, 3),
                // Recent transactions
                recentTransactions: transactions.slice(0, 5)
            });

        } catch (error) {
            console.error('Dashboard fetch error:', error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAvailablePlans = async () => {
        try {
            setPlansLoading(true);
            
            // Get user data to determine type
            const storedUserData = await AsyncStorage.getItem('userData');
            if (!storedUserData) return;
            
            const userData = JSON.parse(storedUserData);
            const type = userData.userType || 'employee';
            
            console.log('Fetching subscription plans for type:', type);
            
            const response = await axios.get(`${Basic_Url}/api/subscription?type=${type}`, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Subscription API response:', response.data);
            
            if (response.data && response.data.success && response.data.data) {
                let subscriptions = [];
                
                // Try to get subscriptions from different possible response structures
                if (response.data.data.grouped && response.data.data.grouped[type]) {
                    const groupedData = response.data.data.grouped[type];
                    if (groupedData.plans && Array.isArray(groupedData.plans)) {
                        subscriptions = groupedData.plans;
                    } else if (Array.isArray(groupedData)) {
                        subscriptions = groupedData;
                    }
                } else if (response.data.data.all && Array.isArray(response.data.data.all)) {
                    subscriptions = response.data.data.all;
                } else if (Array.isArray(response.data.data)) {
                    subscriptions = response.data.data;
                }
                
                // Filter active subscriptions
                if (Array.isArray(subscriptions)) {
                    const activeSubscriptions = subscriptions.filter(subscription => {
                        return subscription && 
                               typeof subscription === 'object' &&
                               subscription.isActive !== false &&
                               (subscription._id || subscription.id) &&
                               (subscription.displayName || subscription.name);
                    });
                    
                    console.log('Active subscription plans:', activeSubscriptions);
                    setAvailablePlans(activeSubscriptions);
                } else {
                    setAvailablePlans([]);
                }
            } else {
                setAvailablePlans([]);
            }
            
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            setAvailablePlans([]);
        } finally {
            setPlansLoading(false);
        }
    };

    // Helper to parse query params
    const getQueryParams = (url) => {
        if (!url || typeof url !== 'string') return {};
        const qIndex = url.indexOf('?');
        if (qIndex === -1) return {};
        const queryString = url.substring(qIndex + 1).split('#')[0];
        return queryString.split('&').reduce((acc, pair) => {
            if (!pair) return acc;
            const [rawKey, rawVal] = pair.split('=');
            if (!rawKey) return acc;
            const key = decodeURIComponent(rawKey);
            const val = rawVal ? decodeURIComponent(rawVal) : '';
            acc[key] = val;
            return acc;
        }, {});
    };

    // Payment handling
    const handlePayment = async (plan) => {
        try {
            setPaymentLoading(plan._id);
            
            const storedUserData = await AsyncStorage.getItem('userData');
            if (!storedUserData) {
                Alert.alert('Error', 'User data not found');
                return;
            }
            
            const userData = JSON.parse(storedUserData);
            const userId = userData._id;
            
            const paymentData = {
                amount: plan.price,
                userId: userId,
                config: JSON.stringify({
                    data: {
                        planName: plan.displayName || plan.name,
                        planId: plan._id,
                        duration: plan.duration,
                        features: plan.features
                    }
                })
            };

            console.log('Initiating payment with data:', paymentData);

            const response = await axios.post(`${Basic_Url}/api/user/addpaymentphonepay`, paymentData);
            
            if (response.data && response.data.success) {
                const { checkoutUrl, orderId } = response.data.success;
                console.log('Payment initiated successfully:', { checkoutUrl, orderId });
                
                setMerchantTransactionId(orderId);
                setCheckoutUrl(checkoutUrl);
                setWebViewVisible(true);
            } else {
                console.error('Payment initiation failed:', response.data);
                Alert.alert('Payment Error', 'Failed to initiate payment. Please try again.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert('Payment Error', 'Failed to process payment. Please try again.');
        } finally {
            setPaymentLoading(null);
        }
    };

    // Check transaction status
    const checkTransactionStatus = async (transactionId, userId) => {
        try {
            console.log('Checking transaction status:', { transactionId, userId });
            const response = await axios.get(`${Basic_Url}/api/user/checkPayment/${transactionId}/${userId}`);
            
            if (response.data && response.data.success) {
                console.log('Transaction successful:', response.data);
                setWebViewVisible(false);
                showSuccessAndNavigate();
                // Refresh dashboard data
                fetchDashboardData();
                fetchAvailablePlans();
            } else {
                console.log('Transaction not completed yet or failed');
                Alert.alert('Payment Status', 'Transaction is still processing or failed. Please check your payment history.');
                setWebViewVisible(false);
            }
        } catch (error) {
            console.error('Error checking transaction status:', error);
            Alert.alert('Error', 'Failed to verify payment status');
            setWebViewVisible(false);
        }
    };

    // Show success message and navigate
    const showSuccessAndNavigate = () => {
        Alert.alert(
            'Payment Successful! 🎉',
            'Your subscription has been activated successfully.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Refresh dashboard data
                        fetchDashboardData();
                        fetchAvailablePlans();
                    }
                }
            ]
        );
    };

    // WebView navigation handler
    const handleWebViewNavigation = (navState) => {
        const { url } = navState;
        console.log('WebView navigating to:', url);
        
        if (url.includes('success') || url.includes('callback')) {
            const params = getQueryParams(url);
            console.log('Callback URL params:', params);
            
            const transactionId = params.transactionId || params.id || merchantTransactionId;
            
            if (transactionId) {
                AsyncStorage.getItem('userData').then(storedUserData => {
                    if (storedUserData) {
                        const userData = JSON.parse(storedUserData);
                        checkTransactionStatus(transactionId, userData._id);
                    }
                });
            } else {
                console.error('No transaction ID found in callback URL');
                Alert.alert('Error', 'Transaction ID not found. Please check your payment history.');
                setWebViewVisible(false);
            }
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
        fetchAvailablePlans();
    };

    const StatCard = ({ title, value, subtitle, icon, color, onPress }) => (
        <TouchableOpacity 
            style={[styles.statCard, { borderLeftColor: color }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statTitle}>{title}</Text>
                    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
                </View>
                <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                    <Icon name={icon} size={28} color={color} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const ProgressBar = ({ progress, color, height = 8 }) => (
        <View style={[styles.progressBarContainer, { height }]}>
            <View 
                style={[
                    styles.progressBar, 
                    { width: `${progress}%`, backgroundColor: color, height }
                ]} 
            />
        </View>
    );

    const HealthScoreCard = ({ score }) => {
        const getHealthColor = (score) => {
            if (score >= 80) return '#10B981';
            if (score >= 60) return '#F59E0B';
            return '#EF4444';
        };

        const getHealthStatus = (score) => {
            if (score >= 80) return 'Excellent';
            if (score >= 60) return 'Good';
            if (score >= 40) return 'Fair';
            return 'Poor';
        };

        const healthColor = getHealthColor(score);
        const healthStatus = getHealthStatus(score);

        return (
            <View style={styles.healthScoreCard}>
                <View style={styles.healthScoreHeader}>
                    <Text style={styles.healthScoreTitle}>Subscription Health</Text>
                    <Text style={[styles.healthScoreStatus, { color: healthColor }]}>
                        {healthStatus}
                    </Text>
                </View>
                <View style={styles.healthScoreContent}>
                    <Text style={styles.healthScoreValue}>{score}%</Text>
                    <ProgressBar progress={score} color={healthColor} height={12} />
                    <Text style={styles.healthScoreDescription}>
                        Based on active vs total subscriptions
                    </Text>
                </View>
            </View>
        );
    };

    const QuickActionButton = ({ title, icon, color, onPress }) => (
        <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: color + '15' }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Icon name={icon} size={24} color={color} />
            <Text style={[styles.quickActionText, { color }]}>{title}</Text>
        </TouchableOpacity>
    );

    const PlanCard = ({ plan, index }) => {
        const isPopular = plan.isPopular || index === 1; // Mark middle plan as popular
        const isFree = plan.price === 0;
        const isPremium = plan.price > 500;
        
        return (
            <View key={plan._id} style={[
                styles.planCard,
                isPopular && styles.popularCard,
                isFree && styles.freeCard,
                isPremium && styles.premiumCard
            ]}>
                {/* Plan Badge */}
                {isPopular && (
                    <View style={styles.popularBadge}>
                        <Icon name="star" size={16} color="#fff" />
                        <Text style={styles.popularBadgeText}>POPULAR</Text>
                    </View>
                )}
                {isFree && (
                    <View style={styles.freeBadge}>
                        <Icon name="free-breakfast" size={16} color="#fff" />
                        <Text style={styles.freeBadgeText}>FREE</Text>
                    </View>
                )}
                {isPremium && (
                    <View style={styles.premiumBadge}>
                        <Icon name="diamond" size={16} color="#fff" />
                        <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                    </View>
                )}

                {/* Plan Header */}
                <View style={styles.planHeader}>
                    <Text style={[styles.planName, { numberOfLines: 2, ellipsizeMode: 'tail' }]}>
                        {plan.displayName || plan.name}
                    </Text>
                    <Text style={[styles.planSubtitle, { numberOfLines: 2, ellipsizeMode: 'tail' }]}>
                        {plan.subtitle || `Perfect for ${userType}s`}
                    </Text>
                </View>

                {/* Plan Pricing */}
                <View style={styles.planPricing}>
                    <Text style={styles.planPrice}>
                        {isFree ? 'Free' : `₹${plan.price}`}
                    </Text>
                    <Text style={styles.planDuration}>
                        {plan.duration || '1 month'}
                    </Text>
                </View>

                {/* Plan Features */}
                <View style={styles.planFeatures}>
                    {plan.features && plan.features.slice(0, 4).map((feature, featureIndex) => (
                        <View key={featureIndex} style={styles.featureItem}>
                            <Icon name="check-circle" size={16} color="#10B981" />
                            <Text style={[styles.featureText, { numberOfLines: 2, ellipsizeMode: 'tail', flexWrap: 'wrap', flexShrink: 1 }]}>
                                {feature}
                            </Text>
                        </View>
                    ))}
                    
                    {plan.benefits && plan.benefits.slice(0, 3).map((benefit, benefitIndex) => (
                        <View key={`benefit-${benefitIndex}`} style={styles.featureItem}>
                            <Icon name="check-circle" size={16} color="#10B981" />
                            <Text style={[styles.benefitItem, { numberOfLines: 2, ellipsizeMode: 'tail', flexWrap: 'wrap', flexShrink: 1 }]}>
                                {benefit}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Plan Button */}
                <TouchableOpacity 
                    style={[
                        styles.planButton,
                        isPopular && styles.popularButton,
                        isFree && styles.freeButton,
                        isPremium && styles.premiumButton,
                        paymentLoading === plan._id && styles.loadingButton
                    ]}
                    onPress={() => handlePayment(plan)}
                    disabled={paymentLoading === plan._id}
                    activeOpacity={0.8}
                >
                    {paymentLoading === plan._id ? (
                        <View style={styles.buttonLoadingContainer}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.buttonLoadingText}>Processing...</Text>
                        </View>
                    ) : (
                        <View style={styles.buttonContent}>
                            <Text style={[
                                styles.planButtonText,
                                isPopular && styles.popularButtonText,
                                isFree && styles.freeButtonText,
                                isPremium && styles.premiumButtonText
                            ]}>
                                {isFree ? 'Get Started' : 'Subscribe Now'}
                            </Text>
                            <Icon 
                                name="arrow-forward" 
                                size={20} 
                                color={isPopular || isPremium ? '#fff' : '#134083'} 
                            />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#134083" />
                    <Text style={styles.loadingText}>Loading Dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!dashboardData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>Failed to Load</Text>
                    <Text style={styles.errorText}>Unable to load dashboard data</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const { user, global, recentSubscriptions, recentTransactions } = dashboardData;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription Dashboard</Text>
                <TouchableOpacity 
                    onPress={handleRefresh}
                    style={styles.refreshButton}
                    disabled={refreshing}
                >
                    <Icon 
                        name="refresh" 
                        size={24} 
                        color="#fff" 
                        style={refreshing ? styles.spinning : null}
                    />
                </TouchableOpacity>
            </View>

            <Animated.ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                opacity={fadeAnim}
                transform={[{ translateY: slideAnim }]}
            >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>Welcome Back! 👋</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Here's your subscription overview for {userType}s
                    </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Active Plans"
                        value={user.activeSubscriptions}
                        subtitle="Currently active"
                        icon="check-circle"
                        color="#10B981"
                        onPress={() => navigation.navigate('EmployeeSubscription')}
                    />
                    <StatCard
                        title="Expired Plans"
                        value={user.expiredSubscriptions}
                        subtitle="Need renewal"
                        icon="schedule"
                        color="#EF4444"
                    />
                    <StatCard
                        title="Total Spent"
                        value={`₹${user.totalSpent}`}
                        subtitle={`${user.completedTransactions} transactions`}
                        icon="account-balance-wallet"
                        color="#2563EB"
                    />
                    <StatCard
                        title="Success Rate"
                        value={`${user.completedTransactions + user.failedTransactions > 0 ? 
                            Math.round((user.completedTransactions / (user.completedTransactions + user.failedTransactions)) * 100) : 0}%`}
                        subtitle={`${user.failedTransactions} failed`}
                        icon="trending-up"
                        color="#7C3AED"
                    />
                </View>

                {/* Health Score Card */}
                <HealthScoreCard score={user.healthScore} />

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <QuickActionButton
                            title="Browse Plans"
                            icon="shopping-cart"
                            color="#134083"
                            onPress={() => navigation.navigate('EmployeeSubscription')}
                        />
                        <QuickActionButton
                            title="Payment History"
                            icon="receipt"
                            color="#10B981"
                            onPress={() => navigation.navigate('PaymentHistory')}
                        />
                        <QuickActionButton
                            title="Renew Plan"
                            icon="autorenew"
                            color="#F59E0B"
                            onPress={() => navigation.navigate('EmployeeSubscription')}
                        />
                        <QuickActionButton
                            title="Support"
                            icon="help"
                            color="#EF4444"
                            onPress={() => navigation.navigate('HelpSupport')}
                        />
                    </View>
                </View>

                {/* Recent Subscriptions */}
                {recentSubscriptions.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Subscriptions</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('EmployeeSubscription')}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        {recentSubscriptions.map((subscription, index) => (
                            <View key={subscription._id || index} style={styles.subscriptionItem}>
                                <View style={styles.subscriptionInfo}>
                                    <Text style={styles.subscriptionName}>
                                        {subscription.planName}
                                    </Text>
                                    <Text style={styles.subscriptionDate}>
                                        {new Date(subscription.startDate).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.subscriptionStatus,
                                    subscription.status === 'active' ? styles.activeStatus : styles.inactiveStatus
                                ]}>
                                    <Text style={[
                                        styles.subscriptionStatusText,
                                        subscription.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText
                                    ]}>
                                        {subscription.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Available Subscription Plans */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Available Plans</Text>
                        <Text style={styles.plansSectionSubtitle}>Choose the perfect plan for you</Text>
                    </View>
                    
                    {plansLoading ? (
                        <View style={styles.plansLoadingContainer}>
                            <ActivityIndicator size="large" color="#134083" />
                            <Text style={styles.loadingText}>Loading plans...</Text>
                        </View>
                    ) : availablePlans && availablePlans.length > 0 ? (
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.plansScrollContainer}
                        >
                            {availablePlans.map((plan, index) => (
                                <PlanCard key={plan._id} plan={plan} index={index} />
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.noPlansContainer}>
                            <Icon name="subscriptions" size={48} color="#E5E7EB" />
                            <Text style={styles.noPlansTitle}>No Plans Available</Text>
                            <Text style={styles.noPlansText}>
                                No subscription plans are currently available for {userType}s.
                            </Text>
                            <TouchableOpacity 
                                style={styles.retryPlansButton}
                                onPress={() => fetchAvailablePlans()}
                            >
                                <Icon name="refresh" size={16} color="#134083" />
                                <Text style={styles.retryPlansButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Global Statistics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Platform Statistics</Text>
                    <View style={styles.globalStatsContainer}>
                        <View style={styles.globalStatItem}>
                            <Text style={styles.globalStatValue}>{global.overview.totalPlans}</Text>
                            <Text style={styles.globalStatLabel}>Total Plans</Text>
                        </View>
                        <View style={styles.globalStatItem}>
                            <Text style={styles.globalStatValue}>{global.overview.activePlans}</Text>
                            <Text style={styles.globalStatLabel}>Active Plans</Text>
                        </View>
                        <View style={styles.globalStatItem}>
                            <Text style={styles.globalStatValue}>₹{global.pricing.avgPrice}</Text>
                            <Text style={styles.globalStatLabel}>Avg Price</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </Animated.ScrollView>
            
            {/* Payment WebView Modal */}
            <Modal
                visible={isWebViewVisible}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <SafeAreaView style={styles.webViewContainer}>
                    <View style={styles.webViewHeader}>
                        <TouchableOpacity 
                            onPress={() => setWebViewVisible(false)}
                            style={styles.webViewCloseButton}
                        >
                            <Icon name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.webViewTitle}>Complete Payment</Text>
                        <View style={styles.webViewPlaceholder} />
                    </View>
                    <WebView
                        source={{ uri: checkoutUrl }}
                        onNavigationStateChange={handleWebViewNavigation}
                        style={styles.webView}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={styles.webViewLoadingContainer}>
                                <ActivityIndicator size="large" color="#134083" />
                                <Text style={styles.webViewLoadingText}>Loading payment page...</Text>
                            </View>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#134083',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    refreshButton: {
        padding: 8,
    },
    spinning: {
        transform: [{ rotate: '360deg' }],
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#134083',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    welcomeSection: {
        paddingVertical: 24,
        paddingHorizontal: 4,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#134083',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        width: (width - 48) / 2,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    statCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statCardLeft: {
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#134083',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    statSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    healthScoreCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    healthScoreHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    healthScoreTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#134083',
    },
    healthScoreStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    healthScoreContent: {
        alignItems: 'center',
    },
    healthScoreValue: {
        fontSize: 48,
        fontWeight: '800',
        color: '#134083',
        marginBottom: 16,
    },
    progressBarContainer: {
        width: '100%',
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        marginBottom: 12,
    },
    progressBar: {
        borderRadius: 6,
    },
    healthScoreDescription: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#134083',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563EB',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        width: (width - 48) / 2,
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    subscriptionItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    subscriptionInfo: {
        flex: 1,
    },
    subscriptionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#134083',
        marginBottom: 4,
    },
    subscriptionDate: {
        fontSize: 14,
        color: '#6B7280',
    },
    subscriptionStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    activeStatus: {
        backgroundColor: '#DCFCE7',
    },
    inactiveStatus: {
        backgroundColor: '#FEE2E2',
    },
    subscriptionStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeStatusText: {
        color: '#16A34A',
    },
    inactiveStatusText: {
        color: '#DC2626',
    },
    globalStatsContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    globalStatItem: {
        alignItems: 'center',
    },
    globalStatValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#134083',
        marginBottom: 4,
    },
    globalStatLabel: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    bottomSpacing: {
        height: 32,
    },
    
    // Plans Section Styles
    plansSectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    plansLoadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    plansScrollContainer: {
        paddingHorizontal: 4,
    },
    noPlansContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    noPlansTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    noPlansText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryPlansButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    retryPlansButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#134083',
    },
    
    // Plan Card Styles
    planCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginRight: 16,
        width: width * 0.8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    popularCard: {
        borderColor: '#F59E0B',
        transform: [{ scale: 1.02 }],
    },
    freeCard: {
        borderColor: '#10B981',
    },
    premiumCard: {
        borderColor: '#7C3AED',
    },
    
    // Plan Badges
    popularBadge: {
        position: 'absolute',
        top: -8,
        right: 20,
        backgroundColor: '#F59E0B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 1,
    },
    freeBadge: {
        position: 'absolute',
        top: -8,
        right: 20,
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 1,
    },
    premiumBadge: {
        position: 'absolute',
        top: -8,
        right: 20,
        backgroundColor: '#7C3AED',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 1,
    },
    popularBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    freeBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    premiumBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    
    // Plan Header
    planHeader: {
        marginBottom: 20,
        marginTop: 16,
    },
    planName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#134083',
        marginBottom: 8,
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    planSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 22,
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    
    // Plan Pricing
    planPricing: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
    },
    planPrice: {
        fontSize: 36,
        fontWeight: '900',
        color: '#134083',
        marginBottom: 4,
    },
    planDuration: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    
    // Plan Features
    planFeatures: {
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingRight: 8,
    },
    featureText: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 12,
        flex: 1,
        lineHeight: 22,
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    benefitItem: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 12,
        flex: 1,
        lineHeight: 22,
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    
    // Plan Button
    planButton: {
        backgroundColor: '#134083',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#134083',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    popularButton: {
        backgroundColor: '#F59E0B',
        shadowColor: '#F59E0B',
    },
    freeButton: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
    },
    premiumButton: {
        backgroundColor: '#7C3AED',
        shadowColor: '#7C3AED',
    },
    loadingButton: {
        opacity: 0.7,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    planButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    popularButtonText: {
        color: '#fff',
    },
    freeButtonText: {
        color: '#fff',
    },
    premiumButtonText: {
        color: '#fff',
    },
    buttonLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonLoadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    
    // WebView Styles
    webViewContainer: {
        flex: 1,
        backgroundColor: '#134083',
    },
    webViewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#134083',
    },
    webViewCloseButton: {
        padding: 8,
    },
    webViewTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    webViewPlaceholder: {
        width: 40,
    },
    webView: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webViewLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        zIndex: 1,
    },
    webViewLoadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
});

export default SubscriptionDashboard;
