import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import SubscriptionValidationService from '../services/subscriptionValidationService';
import { useIsFocused } from '@react-navigation/native';

const SubscriptionPlan = ({route, navigation}) => { 
    const {type} = route.params;
    
    const Basic_Url = 'http://localhost:8500';
    const [searchCount, setSearchCount] = useState(3); 
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(null);
    
    // WebView states for payment 
    const [isWebViewVisible, setWebViewVisible] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState('');
    const [merchantTransactionId, setMerchantTransactionId] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    
    // Dashboard analytics state
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);
    const [userSubscriptions, setUserSubscriptions] = useState([]);
    const [userUsage, setUserUsage] = useState({});
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [lastKnownTotalSpent, setLastKnownTotalSpent] = useState(0);
    const isFocused = useIsFocused();
    
    // Helper function to validate if transactions belong to current user
    const validateUserTransactions = (transactions, currentUserId) => {
        if (!transactions || !Array.isArray(transactions)) return [];
        const currentIdStr = currentUserId != null ? String(currentUserId) : '';
        
        const validTransactions = transactions.filter(tx => {
            try {
                const txUserId = tx?.userId;
                const txIdStr = txUserId != null ? String(txUserId) : '';
                const match = txIdStr && currentIdStr && (txIdStr === currentIdStr);
                if (!match) {
                    console.warn('Transaction does not belong to current user:', {
                        transactionId: tx?._id || tx?.orderId,
                        transactionUserId: txUserId,
                        currentUserId: currentUserId,
                        transactionUserIdType: typeof txUserId,
                        currentUserIdType: typeof currentUserId
                    });
                }
                return match;
            } catch (e) {
                console.warn('Transaction filtering error:', e?.message || e);
                return false;
            }
        });
        
        console.log(`Validated ${validTransactions.length}/${transactions.length} transactions for user ${currentIdStr}`);
        return validTransactions;
    };

    // ✅ helper to parse query params (safe in RN)
    const getQueryParams = (url) => {
        if (!url || typeof url !== 'string') return {};
        const qIndex = url.indexOf('?');
        if (qIndex === -1) return {};
        const queryString = url.substring(qIndex + 1).split('#')[0]; // drop hash
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

    // Helper function to check if a plan is currently active
    const isPlanActive = (planId) => {
        return activeSubscriptions.some(subscription => 
            subscription.subscriptionId === planId || 
            subscription.subscriptionId?._id === planId
        );
    };

    // Helper function to get active subscription details for a plan
    const getActivePlanDetails = (planId) => {
        return activeSubscriptions.find(subscription => 
            subscription.subscriptionId === planId || 
            subscription.subscriptionId?._id === planId
        );
    };

    // Function to fetch user's current usage (dynamic from backend)
    const fetchUserUsage = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if (!storedUserData) return;

            const userData = JSON.parse(storedUserData);
            const userId = userData._id;

            // Fetch usage from subscription validation API
            const usage = await SubscriptionValidationService.getCurrentUsage(userId);

            // Map backend fields to UI keys used in this screen
            const mappedUsage = {
                // Employee usage
                jobApplicationsThisMonth: usage.jobApplicationsPerMonth || 0,
                jobSearchesToday: usage.jobSearchPerDay || 0,
                profileUpdatesThisMonth: usage.profileUpdatesPerMonth || 0,
                companyViewsToday: usage.companyViewsPerDay || 0,

                // Employer usage
                activeJobPosts: usage.activeJobPosts || 0,
                candidateSearchesToday: usage.candidateSearchesPerDay || 0,
                candidateViewsToday: usage.candidateViewsPerDay || 0,
                applicationReviewsToday: usage.applicationReviewsPerDay || 0
            };

            setUserUsage(mappedUsage);
        } catch (error) {
            console.error('Error fetching user usage:', error);
            setUserUsage({});
        }
    };

    // Helper function to format usage display
    const formatUsageText = (current, limit, label) => {
        if (limit === 0) return `${label}: Unlimited`;
        const percentage = Math.round((current / limit) * 100);
        const color = percentage >= 90 ? '#DC2626' : percentage >= 70 ? '#F59E0B' : '#10B981';
        return { text: `${label}: ${current}/${limit}`, color, percentage };
    };

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            console.log('Fetching subscriptions for type:', type);
            
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
                    // If grouped data exists and has our type
                    const groupedData = response.data.data.grouped[type];
                    if (groupedData.plans && Array.isArray(groupedData.plans)) {
                        // Enhanced API structure with plans array
                        subscriptions = groupedData.plans;
                    } else if (Array.isArray(groupedData)) {
                        // Simple array structure
                        subscriptions = groupedData;
                    } else {
                        subscriptions = [];
                    }
                } else if (response.data.data.all && Array.isArray(response.data.data.all)) {
                    // If all data exists and is an array
                    subscriptions = response.data.data.all;
                } else if (Array.isArray(response.data.data)) {
                    // If data is directly an array
                    subscriptions = response.data.data;
                } else {
                    console.warn('Unexpected subscription data structure:', response.data.data);
                    subscriptions = [];
                }
                
                console.log('Raw subscriptions:', subscriptions);
                
                // Ensure subscriptions is an array before filtering
                if (Array.isArray(subscriptions)) {
                    const activeSubscriptions = subscriptions.filter(subscription => {
                        // Ensure subscription is an object with required properties
                        return subscription && 
                               typeof subscription === 'object' &&
                               subscription.isActive !== false &&
                               (subscription._id || subscription.id) &&
                               (subscription.displayName || subscription.name);
                    });
                    console.log('Active subscriptions:', activeSubscriptions);
                    setSubscription(activeSubscriptions);
                    
                    // Show message if no active subscriptions found
                    if (activeSubscriptions.length === 0) {
                        console.warn('No active subscriptions found for type:', type);
                    }
                } else {
                    console.error('Subscriptions is not an array:', subscriptions);
                    setSubscription([]);
                }
            } else {
                console.warn('Invalid response structure:', response.data);
                setSubscription([]);
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            // Show user-friendly error message
            Alert.alert(
                'Connection Error', 
                'Unable to load subscription plans. Please check your internet connection and try again.',
                [
                    { text: 'Retry', onPress: () => fetchSubscription() },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
            setSubscription([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Refresh data whenever the screen gains focus
        if (isFocused) {
            fetchSubscription();
            fetchTransactionHistory();
            fetchDashboardData();
            fetchUserUsage();
            // If API is slow, use cached total to avoid flashing zero
            (async () => {
                try {
                    const cached = await AsyncStorage.getItem('lastTotalSpent');
                    const parsed = Number(cached);
                    if (isFinite(parsed) && parsed > 0) {
                        setLastKnownTotalSpent(parsed);
                    }
                } catch {}
            })();
        }
    }, [isFocused]);

    const fetchTransactionHistory = async () => {
        try {
            setLoadingTransactions(true);
            const storedUserData = await AsyncStorage.getItem('userData');
            if (!storedUserData) {
                console.log('No user data found');
                return;
            }
            
            const userData = JSON.parse(storedUserData);
            const userId = userData._id;

            if (!userId) {
                console.log('No user ID found');
                return;
            }

            console.log('Fetching transaction history for user:', userId);
            console.log('User ID type:', typeof userId);
            console.log('User data:', userData);
            console.log('API URL:', `${Basic_Url}/api/user/checkPayment/history/${userId}`);
            console.log('User Type:', type);
            
            // Try the new endpoint first, then fallback to alternative
            let response;
            try {
                response = await axios.get(`${Basic_Url}/api/user/checkPayment/history/${userId}`, {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (primaryError) {
                console.log('Primary endpoint failed, trying alternative...');
                // Fallback to getting all payments and filtering
                response = await axios.get(`${Basic_Url}/api/user/getallpayment`, {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                // Filter transactions for this user
                if (response.data && response.data.success) {
                    const allTransactions = response.data.data || response.data.success || [];
                    console.log('All transactions from fallback:', allTransactions.length);
                    
                    // Debug fallback filtering
                    if (allTransactions.length > 0) {
                        console.log('Sample transaction userIds:', allTransactions.slice(0, 3).map(tx => ({
                            userId: tx.userId,
                            type: typeof tx.userId,
                            orderId: tx.orderId
                        })));
                    }
                    
                    const userTransactions = validateUserTransactions(allTransactions, userId);
                    console.log('User transactions from fallback:', userTransactions.length);
                    setTransactions(userTransactions); // Show all transactions, not limited
                    return;
                }
            }
            
            if (response && response.status === 200) {
                console.log('Primary endpoint response:', response.data);
                if (response.data.success) {
                    const transactions = response.data.data || [];
                    console.log('Transactions from primary endpoint:', transactions.length);
                    
                    // Validate and filter transactions for security
                    const validatedTransactions = validateUserTransactions(transactions, userId);
                    setTransactions(validatedTransactions);
                    // Opportunistically compute and store total spent for faster UI next time
                    const quickTotal = validatedTransactions
                        .filter(tx => ['COMPLETED','SUCCESS','SUCCESSFUL','PAID','CAPTURED'].includes((tx.status||'').toString().toUpperCase()))
                        .map(tx => Number(tx.amount ?? tx.total ?? tx.price ?? tx.amountPaid ?? tx.paidAmount ?? tx.transactionAmount ?? tx.txnAmount ?? tx.finalAmount ?? 0))
                        .reduce((s,v) => s + (isFinite(v) ? v : 0), 0);
                    if (quickTotal > 0) {
                        try { await AsyncStorage.setItem('lastTotalSpent', String(quickTotal)); } catch {}
                    }
                } else if (response.data.success === false) {
                    console.log('API returned success: false');
                    setTransactions([]);
                } else {
                    console.log('Unexpected response format:', response.data);
                    setTransactions([]);
                }
            }
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            // Set empty array to show "no transactions" message
            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setDashboardLoading(true);
            
            // Get user data
            const storedUserData = await AsyncStorage.getItem('userData');
            if (!storedUserData) {
                console.log('No user data found for dashboard');
                return;
            }
            
            const userData = JSON.parse(storedUserData);
            const userId = userData._id;
            const userType = userData.userType || type;
            
            console.log('=== DASHBOARD FETCH DEBUG ===');
            console.log('Dashboard fetch for userId:', userId);
            console.log('Dashboard fetch for userType:', userType);
            console.log('User data:', userData);

            // Fetch dashboard analytics
            const [analyticsResponse, userSubscriptionsResponse] = await Promise.all([
                axios.get(`${Basic_Url}/api/subscription/analytics?type=${userType}`).catch(err => {
                    console.log('Analytics API error:', err);
                    return { data: { success: false } };
                }),
                axios.get(`${Basic_Url}/api/user/subscriptions/${userId}`).catch(err => {
                    console.log('User subscriptions API error:', err);
                    return { data: { success: false } };
                })
            ]);

            console.log('Analytics response:', analyticsResponse.data);
            console.log('User subscriptions response:', userSubscriptionsResponse.data);
            
            const analytics = analyticsResponse.data.success ? analyticsResponse.data.data : null;
            const userSubscriptions = userSubscriptionsResponse.data.success ? userSubscriptionsResponse.data.data : [];
            
            console.log('Processed analytics:', analytics);
            console.log('Processed user subscriptions:', userSubscriptions.length, 'subscriptions');

            // Process user subscription data
            const now = new Date();
            const activeUserSubscriptions = userSubscriptions.filter(sub => 
                sub.status === 'active' && (!sub.endDate || new Date(sub.endDate) > now)
            );
            const expiredSubscriptions = userSubscriptions.filter(sub => 
                sub.status === 'active' && sub.endDate && new Date(sub.endDate) <= now
            );
            const inactiveSubscriptions = userSubscriptions.filter(sub => 
                sub.status === 'inactive' || sub.status === 'cancelled'
            );

            // Update state with user subscriptions
            console.log('Active subscriptions:', activeUserSubscriptions.length);
            console.log('Total subscriptions:', userSubscriptions.length);
            console.log('Expired subscriptions:', expiredSubscriptions.length);
            console.log('Inactive subscriptions:', inactiveSubscriptions.length);
            
            setActiveSubscriptions(activeUserSubscriptions);
            setUserSubscriptions(userSubscriptions);

            // Fetch transaction data for spending calculation
            let completedTransactions = [];
            let failedTransactions = [];
            let totalSpent = 0;
            const computeTotalSpent = (list) => {
                if (!Array.isArray(list)) return 0;
                const normalized = list.map(tx => ({
                    status: (tx.status || '').toString().toUpperCase(),
                    amount: Number(
                        tx.amount ??
                        tx.total ??
                        tx.price ??
                        tx.amountPaid ??
                        tx.paidAmount ??
                        tx.transactionAmount ??
                        tx.txnAmount ??
                        tx.finalAmount ?? 0
                    )
                }));
                const successStatuses = new Set(['COMPLETED', 'SUCCESS', 'SUCCESSFUL', 'PAID', 'CAPTURED']);
                const completed = normalized.filter(t => successStatuses.has(t.status));
                let amounts = completed.map(t => (isFinite(t.amount) ? t.amount : 0));
                // Convert paise to rupees heuristically if values look like paise
                if (amounts.length > 0) {
                    const maxVal = Math.max(...amounts);
                    const allDiv100 = amounts.every(v => Number.isInteger(v) && v % 100 === 0);
                    if (maxVal >= 10000 && allDiv100) {
                        amounts = amounts.map(v => v / 100);
                    }
                }
                return amounts.reduce((sum, v) => sum + v, 0);
            };
            
            // Fetch with a small retry to reduce flakiness
            const loadTransactions = async () => {
                try {
                    return await axios.get(`${Basic_Url}/api/user/checkPayment/history/${userId}`);
                } catch (e1) {
                    try {
                        await new Promise(r => setTimeout(r, 500));
                        return await axios.get(`${Basic_Url}/api/user/checkPayment/history/${userId}`);
                    } catch (e2) {
                        throw e2;
                    }
                }
            };

            try {
                const transactionsResponse = await loadTransactions();
                const payload = transactionsResponse?.data;
                const arrayData = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.success) ? payload.success : []);
                if (Array.isArray(arrayData)) {
                    const userTransactions = arrayData;
                    // Normalize status and amount fields
                    const norm = (tx) => ({
                        status: (tx.status || '').toString().toUpperCase(),
                        amount: Number(
                            tx.amount ??
                            tx.total ??
                            tx.price ??
                            tx.amountPaid ??
                            tx.paidAmount ??
                            tx.transactionAmount ??
                            tx.txnAmount ??
                            tx.finalAmount ?? 0
                        )
                    });
                    const normalized = userTransactions.map(norm);
                    const successStatuses = new Set(['COMPLETED', 'SUCCESS', 'SUCCESSFUL', 'PAID', 'CAPTURED']);
                    completedTransactions = normalized.filter(tx => successStatuses.has(tx.status));
                    failedTransactions = normalized.filter(tx => tx.status === 'FAILED' || tx.status === 'FAILURE');
                    totalSpent = computeTotalSpent(userTransactions);
                    
                    // Update transactions state as well
                    setTransactions(userTransactions);
                }
            } catch (transactionError) {
                console.log('Transaction history error:', transactionError);
                // Fallback to existing transactions state if available
                const norm = (tx) => ({
                    status: (tx.status || '').toString().toUpperCase(),
                    amount: Number(
                        tx.amount ??
                        tx.total ??
                        tx.price ??
                        tx.amountPaid ??
                        tx.paidAmount ??
                        tx.transactionAmount ??
                        tx.txnAmount ??
                        tx.finalAmount ?? 0
                    )
                });
                const fallbackList = Array.isArray(transactions) ? transactions : [];
                const normalized = fallbackList.map(norm);
                const successStatuses = new Set(['COMPLETED', 'SUCCESS', 'SUCCESSFUL', 'PAID', 'CAPTURED']);
                completedTransactions = normalized.filter(tx => successStatuses.has(tx.status));
                failedTransactions = normalized.filter(tx => tx.status === 'FAILED' || tx.status === 'FAILURE');
                totalSpent = computeTotalSpent(fallbackList);
            }

            // Secondary fallback: fetch all payments and filter by current user if still empty/zero
            try {
                if ((completedTransactions.length === 0 || totalSpent === 0)) {
                    const allResp = await axios.get(`${Basic_Url}/api/user/getallpayment`, {
                        timeout: 8000,
                        headers: { 'Content-Type': 'application/json' }
                    }).catch(() => null);
                    const storedUserData2 = await AsyncStorage.getItem('userData');
                    const userData2 = storedUserData2 ? JSON.parse(storedUserData2) : null;
                    const uid = userData2?._id;
                    if (allResp && Array.isArray(allResp.data?.data) && uid) {
                        const allTransactions = allResp.data.data;
                        const userTx = validateUserTransactions(allTransactions, uid);
                        completedTransactions = userTx
                            .map(tx => ({ status: (tx.status || '').toString().toUpperCase(), raw: tx }))
                            .filter(x => ['COMPLETED','SUCCESS','SUCCESSFUL','PAID','CAPTURED'].includes(x.status))
                            .map(x => x.raw);
                        failedTransactions = userTx
                            .map(tx => ({ status: (tx.status || '').toString().toUpperCase(), raw: tx }))
                            .filter(x => (x.status === 'FAILED' || x.status === 'FAILURE'))
                            .map(x => x.raw);
                        totalSpent = computeTotalSpent(userTx);
                        if (Array.isArray(transactions) && transactions.length === 0) {
                            setTransactions(userTx);
                        }
                    }
                }
            } catch (fallbackErr) {
                console.log('Secondary payment fallback error:', fallbackErr);
            }

            // Calculate subscription health
            const totalSubscriptions = userSubscriptions.length;
            const healthScore = totalSubscriptions > 0 ? 
                Math.round((activeUserSubscriptions.length / totalSubscriptions) * 100) : 0;

            const stableTotalSpent = totalSpent > 0 ? totalSpent : (lastKnownTotalSpent || 0);

            const dashboardResult = {
                // User specific data
                user: {
                    activeSubscriptions: activeUserSubscriptions.length,
                    expiredSubscriptions: expiredSubscriptions.length,
                    inactiveSubscriptions: inactiveSubscriptions.length,
                    totalSubscriptions,
                    healthScore,
                    totalSpent: stableTotalSpent,
                    completedTransactions: completedTransactions.length,
                    failedTransactions: failedTransactions.length
                },
                // Global analytics
                global: analytics || {
                    overview: { totalPlans: 0, activePlans: 0, freePlans: 0 },
                    pricing: { avgPrice: 0, minPrice: 0, maxPrice: 0 }
                }
            };
            
            if (stableTotalSpent > 0 && stableTotalSpent !== lastKnownTotalSpent) {
                setLastKnownTotalSpent(stableTotalSpent);
            }
            console.log('Final dashboard data:', dashboardResult);
            setDashboardData(dashboardResult);

        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setDashboardLoading(false);
        }
    };

    useEffect(() => {
        const handleDeepLink = ({ url }) => {
            console.log('Deep link received:', url);
            if (url && url.includes('http://localhost:8500/PaymentSuccess')) {
                setWebViewVisible(false);
                setCheckoutUrl('');
                if (merchantTransactionId) {
                    checkTransactionStatus(merchantTransactionId);
                }
            }
        };

        Linking.addEventListener('url', handleDeepLink);
        Linking.getInitialURL().then(url => {
            if (url && url.includes('http://localhost:8500/PaymentSuccess') && merchantTransactionId) {
                handleDeepLink({ url });
            }
        });

        return () => {
            Linking.removeAllListeners('url');
        };
    }, [merchantTransactionId]);

    // Check transaction status after payment
    const checkTransactionStatus = async (transactionId) => {
        try {
            console.log('Checking transaction status for:', transactionId);
            const storedUserData = await AsyncStorage.getItem('userData');
            const userData = JSON.parse(storedUserData);
            const userId = userData._id;

            const response = await axios.get(
                `${Basic_Url}/api/user/checkPayment/${transactionId}/${userId}`
            );
            
            console.log('Transaction status response:', response.data);
            
            if (response.status === 200 && response.data.success) {
                const paymentData = response.data.success;
                
                if (paymentData.status === 'COMPLETED') {
                    await handleSuccessfulPayment(transactionId, paymentData);
                } else if (paymentData.status === 'FAILED') {
                    Alert.alert('Payment Failed', 'Transaction was not completed successfully');
                    resetPaymentState();
                } else {
                    Alert.alert('Payment Processing', 'Payment is still being processed. Please wait.');
                    resetPaymentState();
                }
            } else {
                Alert.alert('Payment Error', 'Unable to verify payment status');
                resetPaymentState();
            }
        } catch (error) {
            console.error('Error checking transaction status:', error);
            Alert.alert('Error', 'Failed to verify payment status');
            resetPaymentState();
        }
    };

    const resetPaymentState = () => {
        setWebViewVisible(false);
        setCheckoutUrl('');
        setMerchantTransactionId('');
        setPaymentLoading(null);
    };

    const handleSuccessfulPayment = async (transactionId, paymentData, selectedPlan = null) => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            const userData = JSON.parse(storedUserData);
            
            // Get subscription ID from various sources
            let subscriptionId = paymentData.subscriptionId;
            
            // If no subscriptionId in paymentData, try to get it from the selected plan
            if (!subscriptionId && selectedPlan) {
                subscriptionId = selectedPlan._id;
            }
            
            // If still no subscriptionId, try to extract from transaction config
            if (!subscriptionId && paymentData.config) {
                try {
                    const config = typeof paymentData.config === 'string' 
                        ? JSON.parse(paymentData.config) 
                        : paymentData.config;
                    subscriptionId = config.data?.subscriptionId;
                } catch (configError) {
                    console.warn('Failed to parse config for subscriptionId:', configError);
                }
            }

            // Prepare subscription data - even if subscriptionId is missing, we'll try to activate
            const subscriptionData = {
                userId: userData._id,
                subscriptionId: subscriptionId,
                transactionId: transactionId,
                amount: paymentData.amount / 100,
                status: 'active',
                startDate: new Date(),
                paymentMethod: 'PhonePe',
                planName: paymentData.planName || (selectedPlan ? selectedPlan.displayName || selectedPlan.name : 'Unknown Plan'),
                // Add user type for proper subscription matching
                userType: userData.userType || 'employee'
            };

            try {
                // Try updateSubscription first - it will handle creating new subscriptions if needed
                const updateResponse = await axios.post(
                    `${Basic_Url}/api/user/updateSubscription`, 
                    subscriptionData
                );

                if (updateResponse.status === 200) {
                    console.log('Subscription updated successfully:', updateResponse.data);
                    showSuccessAndNavigate();
                } else {
                    throw new Error('Failed to update subscription');
                }
            } catch (updateError) {
                console.warn('updateSubscription failed, trying activateSubscription:', updateError.response?.data || updateError.message);
                
                // If updateSubscription fails, try activateSubscription as fallback
                try {
                    const activateResponse = await axios.post(
                        `${Basic_Url}/api/user/activateSubscription`,
                        subscriptionData
                    );
                    
                    if (activateResponse.status === 200) {
                        console.log('Subscription activated successfully:', activateResponse.data);
                        showSuccessAndNavigate();
                    } else {
                        throw new Error('Failed to activate subscription');
                    }
                } catch (activateError) {
                    console.error('Both subscription methods failed:', activateError.response?.data || activateError.message);
                    // Still show success to user since payment was successful
                    Alert.alert(
                        'Payment Successful',
                        'Your payment was processed successfully. Your subscription will be activated shortly.',
                        [{ text: 'OK', onPress: () => showSuccessAndNavigate() }]
                    );
                }
            }

        } catch (error) {
            console.error('Error handling successful payment:', error);
            showSuccessAndNavigate();
        }
    }; 
    
    const showSuccessAndNavigate = () => {
        resetPaymentState();
        
        Alert.alert(
            '🎉 Payment Successful!', 
            'Your subscription has been activated successfully',
            [
                {
                    text: 'Continue',
                    style: 'default',
                    onPress: () => {
                        // After success, refresh all data and stay on page so user sees updated stats
                        fetchSubscription();
                        fetchTransactionHistory();
                        fetchDashboardData();
                        fetchUserUsage();
                    }
                }
            ],
            { cancelable: false }
        );
    };

    const handlePlanSelection = async (plan) => {
        try {
            if (paymentLoading === plan._id) return;
            
            setPaymentLoading(plan._id);

            const storedUserData = await AsyncStorage.getItem('userData');
            if (!storedUserData) {
                Alert.alert('Error', 'User data not found. Please login again.');
                navigation.navigate('Login');
                return;
            }

            const userData = JSON.parse(storedUserData);
            const userId = userData._id;
            const username = userData.fullName || userData.CompanyName;
            const mobile = userData.phone || userData.mobile;

            if (!userId || !mobile) {
                Alert.alert('Error', 'Missing user ID or mobile number');
                setPaymentLoading(null);
                return;
            }

            if (plan.price === 0) {
                await handleFreeSubscription(plan, userData);
                return;
            }

            const payload = {
                userId,
                username,
                Mobile: mobile.toString(),
                orderId: `SUB_${Date.now()}_${plan._id}`,
                amount: plan.price,
                config: JSON.stringify({
                    url: `${Basic_Url}/api/user/activateSubscription`,
                    method: 'post',
                    data: {
                        userId,
                        subscriptionId: plan._id,
                        planName: plan.displayName || plan.name,
                        amount: plan.price
                    }
                }),
                successUrl: `${Basic_Url}/PaymentSuccess`,
                failedUrl: `${Basic_Url}/PaymentSuccess`
            };

            // console.log("Payment request payload:", payload);

            const response = await axios.post(
                `${Basic_Url}/api/user/addpaymentphonepay`, 
                payload
            );

            console.log("Payment response:", response.data);

            
            if (response.status === 200 && response.data.url) {
                const { orderId, url ,merchantID} = response.data;

                setMerchantTransactionId(merchantID);
                setCheckoutUrl(url);
                setWebViewVisible(true);
            } else {
                console.error("Unexpected payment API response:", response.data);
                throw new Error("Invalid response from payment API");
            }

        } catch (error) {
            console.error('Payment error:', error.response?.data || error.message || error);
            Alert.alert('Error', 'Payment failed. Please try again.');
            setPaymentLoading(null);
        }
    };

    const handleFreeSubscription = async (plan, userData) => {
        try {
            const subscriptionData = {
                userId: userData._id,
                subscriptionId: plan._id,
                planName: plan.displayName || plan.name,
                amount: 0,
                status: 'active',
                startDate: new Date(),
                paymentMethod: 'Free'
            };

            const response = await axios.post(
                `${Basic_Url}/api/user/activateSubscription`, 
                subscriptionData
            );

            if (response.status === 200) {
                Alert.alert(
                    'Success!', 
                    'Your free subscription has been activated',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                fetchSubscription();
                                navigation.navigate('Home'); 
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error activating free subscription:', error);
            Alert.alert('Error', 'Failed to activate subscription');
        } finally {
            setPaymentLoading(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription & Payments</Text>
            </View>

            <ScrollView style={styles.content}>
           
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#134083" />
                        <Text style={styles.loadingText}>Loading plans...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.container}>
                        {/* Dashboard Analytics Section */}
                        {dashboardData && (
                            <View style={styles.dashboardSection}>
                                {/* <Text style={styles.dashboardTitle}>Your Subscription Overview</Text> */}
                                
                                {/* Stats Grid */}
                                <View style={styles.statsGrid}>
                                    <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
                                        <View style={styles.statCardContent}>
                                            <View style={styles.statCardLeft}>
                                                <Text style={styles.statValue}>{dashboardData.user.activeSubscriptions}</Text>
                                                <Text style={styles.statTitle}>Active Plans</Text>
                                                <Text style={styles.statSubtitle}>Currently active</Text>
                                            </View>
                                            <View style={[styles.statIconContainer, { backgroundColor: '#10B98120' }]}>
                                                <Icon name="check-circle" size={24} color="#10B981" />
                                            </View>
                                        </View>
                                    </View>
                                    
                                    <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
                                        <View style={styles.statCardContent}>
                                            <View style={styles.statCardLeft}>
                                                <Text style={styles.statValue}>{dashboardData.user.expiredSubscriptions}</Text>
                                                <Text style={styles.statTitle}>Expired Plans</Text>
                                                <Text style={styles.statSubtitle}>Need renewal</Text>
                                            </View>
                                            <View style={[styles.statIconContainer, { backgroundColor: '#EF444420' }]}>
                                                <Icon name="schedule" size={24} color="#EF4444" />
                                            </View>
                                        </View>
                                    </View>
                                    
                                    <View style={[styles.statCard, { borderLeftColor: '#2563EB' }]}>
                                        <View style={styles.statCardContent}>
                                            <View style={styles.statCardLeft}>
                                                <Text style={styles.statValue}>₹{dashboardData.user.totalSpent}</Text>
                                                <Text style={styles.statTitle}>Total Spent</Text>
                                                <Text style={styles.statSubtitle}>{dashboardData.user.completedTransactions} transactions</Text>
                                            </View>
                                            <View style={[styles.statIconContainer, { backgroundColor: '#2563EB20' }]}>
                                                <Icon name="account-balance-wallet" size={24} color="#2563EB" />
                                            </View>
                                        </View>
                                    </View>
                                    
                                    <View style={[styles.statCard, { borderLeftColor: '#7C3AED' }]}>
                                        <View style={styles.statCardContent}>
                                            <View style={styles.statCardLeft}>
                                                <Text style={styles.statValue}>{dashboardData.user.healthScore}%</Text>
                                                <Text style={styles.statTitle}>Health Score</Text>
                                                <Text style={styles.statSubtitle}>Subscription health</Text>
                                            </View>
                                            <View style={[styles.statIconContainer, { backgroundColor: '#7C3AED20' }]}>
                                                <Icon name="trending-up" size={24} color="#7C3AED" />
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Health Progress Bar */}
                                <View style={styles.healthCard}>
                                    <View style={styles.healthHeader}>
                                        <Text style={styles.healthTitle}>Subscription Health</Text>
                                        <Text style={[styles.healthStatus, { 
                                            color: dashboardData.user.healthScore >= 80 ? '#10B981' : 
                                                   dashboardData.user.healthScore >= 60 ? '#F59E0B' : '#EF4444' 
                                        }]}>
                                            {dashboardData.user.healthScore >= 80 ? 'Excellent' : 
                                             dashboardData.user.healthScore >= 60 ? 'Good' : 
                                             dashboardData.user.healthScore >= 40 ? 'Fair' : 'Poor'}
                                        </Text>
                                    </View>
                                    <View style={styles.progressBarContainer}>
                                        <View 
                                            style={[styles.progressBar, { 
                                                width: `${dashboardData.user.healthScore}%`,
                                                backgroundColor: dashboardData.user.healthScore >= 80 ? '#10B981' : 
                                                                 dashboardData.user.healthScore >= 60 ? '#F59E0B' : '#EF4444'
                                            }]} 
                                        />
                                    </View>
                                    <Text style={styles.healthDescription}>
                                        Based on {dashboardData.user.activeSubscriptions} active out of {dashboardData.user.totalSubscriptions} total subscriptions
                                    </Text>
                                </View>
                            </View>
                        )}


                        <Text style={styles.sectionTitle}>
                            {activeSubscriptions.length > 0 ? 'Upgrade or Change Plan' : 'Choose Your Plan'}
                        </Text>

                        {subscription && subscription.length > 0 ? subscription.map((plan, index) => {
                            const isPopular = plan.isPopular || index === 1; // Mark middle plan as popular
                            const isFree = plan.price === 0;
                            const isPremium = plan.price > 500;
                            const isCurrentlyActive = isPlanActive(plan._id);
                            const activePlanDetails = getActivePlanDetails(plan._id);
                            
                            return (
                                <TouchableOpacity
                                    key={plan._id}
                                    style={[
                                        styles.planCard,
                                        isFree && styles.freePlanCard,
                                        isPremium && styles.premiumPlanCard,
                                        isPopular && styles.popularPlanCard,
                                        isCurrentlyActive && styles.activePlanCard,
                                        paymentLoading === plan._id && styles.loadingPlanCard
                                    ]}
                                    onPress={() => isCurrentlyActive ? null : handlePlanSelection(plan)}
                                    disabled={paymentLoading === plan._id || isCurrentlyActive}
                                    activeOpacity={isCurrentlyActive ? 1 : 0.8}
                                >
                                    {/* Active Badge */}
                                    {isCurrentlyActive && (
                                        <View style={styles.activeBadge}>
                                            <Icon name="check-circle" size={14} color="#fff" />
                                            <Text style={styles.activeBadgeText}>ACTIVE</Text>
                                        </View>
                                    )}
                                    
                                    {/* Popular Badge */}
                                    {isPopular && !isCurrentlyActive && (
                                        <View style={styles.popularBadge}>
                                            <Icon name="star" size={14} color="#fff" />
                                            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                                        </View>
                                    )}

                                    {/* Plan Header */}
                                    <View style={styles.planHeader}>
                                        <View style={styles.planTitleSection}>
                                            <Text 
                                                style={[
                                                    styles.planName,
                                                    isPopular && styles.popularPlanName
                                                ]}
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                            >
                                                {plan.displayName || plan.name}
                                            </Text>
                                            
                                            {/* Active Subscription Dates */}
                                            {isCurrentlyActive && activePlanDetails && (
                                                <View style={styles.activePlanDates}>
                                                    <Text style={styles.activePlanDateText}>
                                                        Started: {new Date(activePlanDetails.startDate).toLocaleDateString()}
                                                    </Text>
                                                    {activePlanDetails.endDate && (
                                                        <Text style={styles.activePlanDateText}>
                                                            Expires: {new Date(activePlanDetails.endDate).toLocaleDateString()}
                                                        </Text>
                                                    )}
                                                </View>
                                            )}
                                            
                                            {!isCurrentlyActive && plan.shortDescription && (
                                                <Text 
                                                    style={styles.planSubtitle}
                                                    numberOfLines={2}
                                                    ellipsizeMode="tail"
                                                >
                                                    {plan.shortDescription}
                                                </Text>
                                            )}
                                        </View>
                                        
                                        <View style={styles.priceSection}>
                                            <Text style={[
                                                styles.planPrice,
                                                isFree && styles.freePlanPrice,
                                                isPremium && styles.premiumPlanPrice,
                                                isPopular && styles.popularPlanPrice
                                            ]}>
                                                {plan.displayPrice || (plan.price === 0 ? 'FREE' : `₹${plan.price}`)}
                                            </Text>
                                            {!isFree && plan.duration && (
                                                <Text style={styles.planDuration}>
                                                    /{plan.duration === 'monthly' ? 'month' : 
                                                      plan.duration === 'yearly' ? 'year' : 
                                                      plan.duration === 'lifetime' ? 'lifetime' : plan.duration}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* Plan Features */}
                                    <View style={styles.planDetails}>
                                        {plan.highlightedFeatures?.slice(0, 5).map((feature, idx) => (
                                            <View key={idx} style={styles.planFeature}>
                                                <View style={[
                                                    styles.featureIcon,
                                                    isFree && styles.freeFeatureIcon,
                                                    isPremium && styles.premiumFeatureIcon,
                                                    isPopular && styles.popularFeatureIcon
                                                ]}>
                                                    <Icon 
                                                        name="check" 
                                                        size={12} 
                                                        color={isFree ? "#10B981" : isPremium ? "#7C3AED" : isPopular ? "#2563EB" : "#10B981"} 
                                                    />
                                                </View>
                                                <Text 
                                                    style={styles.featureText}
                                                    numberOfLines={2}
                                                    ellipsizeMode="tail"
                                                >
                                                    {feature}
                                                </Text>
                                            </View>
                                        ))}
                                        
                                        {/* Show additional features count */}
                                        {plan.highlightedFeatures?.length > 5 && (
                                            <View style={styles.moreFeatures}>
                                                <Text style={styles.moreFeaturesText}>
                                                    + {plan.highlightedFeatures.length - 5} more features
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Plan Benefits/Highlights */}
                                    {(plan.features || plan.benefits) && (
                                        <View style={styles.planBenefits}>
                                            <Text style={styles.benefitsTitle}>
                                                {isCurrentlyActive ? 'Current Usage & Limits:' : 'Key Limits & Features:'}
                                            </Text>
                                            {/* Display key limits for employees */}
                                            {type === 'employee' && plan.features.jobApplicationsPerMonth && (
                                                <View style={styles.limitItem}>
                                                    <Text style={styles.limitLabel}>Monthly Job Applications</Text>
                                                    {isCurrentlyActive ? (
                                                        <Text style={[styles.limitValue, { 
                                                            color: (userUsage.jobApplicationsThisMonth || 0) / plan.features.jobApplicationsPerMonth >= 0.9 ? '#DC2626' : '#10B981' 
                                                        }]}>
                                                            {userUsage.jobApplicationsThisMonth || 0}/{plan.features.jobApplicationsPerMonth}
                                                        </Text>
                                                    ) : (
                                                        <Text style={styles.limitValue}>Up to {plan.features.jobApplicationsPerMonth}</Text>
                                                    )}
                                                </View>
                                            )}
                                            
                                            {type === 'employee' && plan.features.jobSearchPerDay && (
                                                <View style={styles.limitItem}>
                                                    <Text style={styles.limitLabel}>Daily Job Searches</Text>
                                                    {isCurrentlyActive ? (
                                                        <Text style={[styles.limitValue, { 
                                                            color: (userUsage.jobSearchesToday || 0) / plan.features.jobSearchPerDay >= 0.9 ? '#DC2626' : '#10B981' 
                                                        }]}>
                                                            {userUsage.jobSearchesToday || 0}/{plan.features.jobSearchPerDay}
                                                        </Text>
                                                    ) : (
                                                        <Text style={styles.limitValue}>Up to {plan.features.jobSearchPerDay}</Text>
                                                    )}
                                                </View>
                                            )}
                                            
                                            {/* Display key limits for employers */}
                                            {type === 'employer' && plan.features.activeJobPosts && (
                                                <View style={styles.limitItem}>
                                                    <Text style={styles.limitLabel}>Active Job Posts</Text>
                                                    {isCurrentlyActive ? (
                                                        <Text style={[styles.limitValue, { 
                                                            color: (userUsage.activeJobPosts || 0) / plan.features.activeJobPosts >= 0.9 ? '#DC2626' : '#10B981' 
                                                        }]}>
                                                            {userUsage.activeJobPosts || 0}/{plan.features.activeJobPosts}
                                                        </Text>
                                                    ) : (
                                                        <Text style={styles.limitValue}>Up to {plan.features.activeJobPosts}</Text>
                                                    )}
                                                </View>
                                            )}
                                            
                                            {type === 'employer' && plan.features.candidateSearchesPerDay && (
                                                <View style={styles.limitItem}>
                                                    <Text style={styles.limitLabel}>Daily Candidate Searches</Text>
                                                    {isCurrentlyActive ? (
                                                        <Text style={[styles.limitValue, { 
                                                            color: (userUsage.candidateSearchesToday || 0) / plan.features.candidateSearchesPerDay >= 0.9 ? '#DC2626' : '#10B981' 
                                                        }]}>
                                                            {userUsage.candidateSearchesToday || 0}/{plan.features.candidateSearchesPerDay}
                                                        </Text>
                                                    ) : (
                                                        <Text style={styles.limitValue}>Up to {plan.features.candidateSearchesPerDay}</Text>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    {/* Action Button */}
                                    <TouchableOpacity
                                        onPress={() => isCurrentlyActive ? null : handlePlanSelection(plan)}
                                        style={[
                                            styles.choosePlanButton,
                                            isFree && styles.freePlanButton,
                                            isPremium && styles.premiumPlanButton,
                                            isPopular && styles.popularPlanButton,
                                            isCurrentlyActive && styles.activePlanButton,
                                            paymentLoading === plan._id && styles.disabledButton
                                        ]}
                                        disabled={paymentLoading === plan._id || isCurrentlyActive}
                                        activeOpacity={isCurrentlyActive ? 1 : 0.8}
                                    >
                                        {paymentLoading === plan._id ? (
                                            <View style={styles.loadingButtonContent}>
                                                <ActivityIndicator size="small" color="#fff" />
                                                <Text style={styles.choosePlanButtonText}>Processing...</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.buttonContent}>
                                                <Text style={[
                                                    styles.choosePlanButtonText,
                                                    isFree && styles.freePlanButtonText,
                                                    isPremium && styles.premiumPlanButtonText,
                                                    isCurrentlyActive && styles.activePlanButtonText
                                                ]}>
                                                    {isCurrentlyActive ? '✅ Current Plan' :
                                                     isFree ? '🎉 Get Started Free' : 
                                                     isPopular ? '🚀 Choose Popular' : 
                                                     isPremium ? '👑 Go Premium' : 
                                                     '✨ Select Plan'}
                                                </Text>
                                                {!isFree && !isCurrentlyActive && (
                                                    <Icon 
                                                        name="arrow-forward" 
                                                        size={16} 
                                                        color="#fff" 
                                                        style={styles.buttonIcon}
                                                    />
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        }) : (
                            <View style={styles.emptyStateContainer}>
                                <Icon name="subscriptions" size={64} color="#E5E7EB" />
                                <Text style={styles.emptyStateTitle}>No Plans Available</Text>
                                <Text style={styles.emptyStateText}>
                                    No subscription plans are currently available for {type}s.
                                </Text>
                                <TouchableOpacity 
                                    style={styles.retryButton}
                                    onPress={() => fetchSubscription()}
                                >
                                    <Icon name="refresh" size={20} color="#134083" />
                                    <Text style={styles.retryButtonText}>Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                )}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transaction History</Text>
                    <TouchableOpacity 
                        style={styles.refreshButton}
                        onPress={() => {
                            console.log('Refreshing transactions...');
                            fetchTransactionHistory();
                        }}
                    >
                        <Icon name="refresh" size={20} color="#134083" />
                    </TouchableOpacity>
                </View>
                
                {loadingTransactions ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#134083" />
                        <Text style={styles.loadingText}>Loading transactions...</Text>
                    </View>
                ) : transactions.length > 0 ? (
                    <View style={styles.transactionContainer}>
                        {(showAllTransactions ? transactions : transactions.slice(0, 5)).map((transaction, index) => (
                            <View key={transaction._id || index} style={styles.transactionCard}>
                                <View style={styles.transactionHeader}>
                                    <View style={styles.transactionInfo}>
                                        <Text style={styles.transactionAmount}>₹{transaction.amount || 0}</Text>
                                        <Text 
                                            style={styles.transactionPlan}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {transaction.planName || 'Subscription Plan'}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        transaction.status === 'COMPLETED' ? styles.successBadge :
                                        transaction.status === 'FAILED' ? styles.failedBadge : 
                                        styles.pendingBadge
                                    ]}>
                                        <Text 
                                            style={[
                                                styles.statusText,
                                                transaction.status === 'COMPLETED' ? styles.successText :
                                                transaction.status === 'FAILED' ? styles.failedText : 
                                                styles.pendingText
                                            ]}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {transaction.status === 'COMPLETED' ? '✓ Success' :
                                             transaction.status === 'FAILED' ? '✗ Failed' : 
                                             '⏳ Pending'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.transactionDetails}>
                                    <Text 
                                        style={styles.transactionDate}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                    <Text 
                                        style={styles.transactionId}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        ID: {transaction.orderId || transaction._id?.slice(-8) || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                        {transactions.length > 5 && (
                            <TouchableOpacity 
                                style={styles.viewMoreButton}
                                onPress={() => setShowAllTransactions(!showAllTransactions)}
                            >
                                <Text style={styles.viewMoreText}>
                                    {showAllTransactions ? 'Show Less' : `View All ${transactions.length} Transactions`}
                                </Text>
                                <Icon 
                                    name={showAllTransactions ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                    size={16} 
                                    color="#134083" 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.emptyTransactionContainer}>
                        <Icon name="receipt-long" size={48} color="#E5E7EB" />
                        <Text style={styles.emptyTransactionText}>No transactions yet</Text>
                        <Text style={styles.emptyTransactionSubtext}>
                            Your payment history will appear here
                        </Text>
                    </View>
                )}
                
                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            <Modal
                visible={isWebViewVisible}
                onRequestClose={() => {
                    Alert.alert(
                        'Cancel Payment',
                        'Are you sure you want to cancel the payment?',
                        [
                            { text: 'No', style: 'cancel' },
                            { 
                                text: 'Yes', 
                                onPress: () => {
                                    resetPaymentState();
                                }
                            }
                        ]
                    );
                }}
                style={styles.webViewModal}
            >
                <View style={styles.webViewContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Cancel Payment',
                                'Are you sure you want to cancel the payment?',
                                [
                                    { text: 'No', style: 'cancel' },
                                    { 
                                        text: 'Yes', 
                                        onPress: () => {
                                            resetPaymentState();
                                        }
                                    }
                                ]
                            );
                        }}
                        style={styles.closeWebViewButton}
                    >
                        <Icon name="close" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    {checkoutUrl ? (
                        <WebView
                            source={{ uri: checkoutUrl }}
                            style={styles.webView}
                            onShouldStartLoadWithRequest={(request) => {
                                const url = request?.url || request?.nativeEvent?.url;
                                console.log("Intercepted URL:", url);

                                if (url && url.includes("http://localhost:8500/PaymentSuccess")) {
                                    setWebViewVisible(false);
                                    setCheckoutUrl('');

                                    const params = getQueryParams(url);
                                    const transactionId = params.transactionId || merchantTransactionId;
                                    
                                    if (transactionId) {
                                        checkTransactionStatus(transactionId);
                                    } else {
                                        console.warn("No transaction ID found in URL params or state");
                                        Alert.alert('Error', 'Transaction ID not found. Please contact support.');
                                        resetPaymentState();
                                    }
                                    return false; // Don't load the success page in WebView
                                }

                                return true;
                            }}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                        />
                    ) : (
                        <View style={styles.webViewLoading}>
                            <ActivityIndicator size="large" color="#134083" />
                            <Text style={styles.webViewLoadingText}>Preparing Payment...</Text>
                        </View>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { 
        backgroundColor: '#134083', 
        padding: 20, 
        paddingTop: 50, 
        flexDirection: 'row', 
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5
    },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
    content: { flex: 1, padding: 16 },
    loadingContainer: { alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 16, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 8, 
        elevation: 4 
    },
    cardTitle: { fontSize: 20, fontWeight: '700', color: '#134083', marginBottom: 16 },
    searchStatus: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
    searchCount: { fontSize: 36, fontWeight: '800', color: '#134083', marginRight: 8 },
    searchText: { fontSize: 18, color: '#6B7280', fontWeight: '500' },
    searchInfo: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#134083', marginTop: 24, marginBottom: 16, flex: 1 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 0,
        marginTop: 0,
    },
    refreshButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    // Enhanced Plan Card Styles
    planCard: { 
        backgroundColor: '#fff', 
        borderRadius: 20, 
        padding: 24, 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden'
    },
    freePlanCard: { 
        borderColor: '#10B981', 
        borderWidth: 2,
        backgroundColor: '#F0FDF4',
        transform: [{ scale: 1.02 }]
    },
    premiumPlanCard: {
        borderColor: '#7C3AED',
        borderWidth: 2,
        backgroundColor: '#FAF5FF'
    },
    popularPlanCard: {
        borderColor: '#2563EB',
        borderWidth: 3,
        backgroundColor: '#EFF6FF',
        transform: [{ scale: 1.05 }],
        shadowColor: "#2563EB",
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 12
    },
    loadingPlanCard: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }]
    },
    activePlanCard: {
        borderColor: '#10B981',
        borderWidth: 3,
        backgroundColor: '#F0FDF4',
        transform: [{ scale: 1.02 }],
        shadowColor: "#10B981",
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 12
    },
    
    // Popular Badge
    popularBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#2563EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomLeftRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 1
    },
    popularBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5
    },
    
    // Active Badge
    activeBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomLeftRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 1
    },
    activeBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5
    },
    
    // Plan Header Styles
    planHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 20,
        paddingTop: 8
    },
    planTitleSection: {
        flex: 1,
        marginRight: 16
    },
    planName: { 
        fontSize: 22, 
        fontWeight: '800', 
        color: '#134083', 
        marginBottom: 4,
        lineHeight: 28,
        flexWrap: 'wrap',
        flexShrink: 1
    },
    popularPlanName: {
        color: '#2563EB'
    },
    planSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        lineHeight: 20,
        flexWrap: 'wrap',
        flexShrink: 1
    },
    priceSection: {
        alignItems: 'flex-end'
    },
    planPrice: { 
        fontSize: 28, 
        fontWeight: '900', 
        color: '#2563EB',
        lineHeight: 32
    },
    freePlanPrice: { 
        color: '#10B981',
        fontSize: 24
    },
    premiumPlanPrice: {
        color: '#7C3AED'
    },
    popularPlanPrice: {
        color: '#2563EB'
    },
    planDuration: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 2
    },
    
    // Plan Details Styles
    planDetails: { 
        gap: 14,
        marginBottom: 20
    },
    planFeature: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12
    },
    featureIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center'
    },
    freeFeatureIcon: {
        backgroundColor: '#DCFCE7'
    },
    premiumFeatureIcon: {
        backgroundColor: '#EDE9FE'
    },
    popularFeatureIcon: {
        backgroundColor: '#DBEAFE'
    },
    featureText: { 
        fontSize: 15, 
        color: '#374151', 
        flex: 1,
        fontWeight: '500',
        lineHeight: 20,
        flexWrap: 'wrap',
        flexShrink: 1
    },
    moreFeatures: {
        paddingLeft: 32,
        marginTop: 4
    },
    moreFeaturesText: {
        fontSize: 13,
        color: '#6B7280',
        fontStyle: 'italic',
        fontWeight: '500'
    },
    
    // Plan Benefits Styles
    planBenefits: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#134083'
    },
    benefitsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#134083',
        marginBottom: 8,
        flexWrap: 'wrap'
    },
    benefitItem: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
        marginBottom: 4,
        flexWrap: 'wrap',
        flexShrink: 1
    },
    
    // Limit Items Styles
    limitItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
    },
    limitLabel: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
        flex: 1,
    },
    limitValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#10B981',
    },
    
    // Enhanced Button Styles
    choosePlanButton: { 
        marginTop: 8, 
        backgroundColor: '#134083', 
        paddingVertical: 16, 
        borderRadius: 16, 
        alignItems: 'center',
        shadowColor: "#134083",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8
    },
    freePlanButton: { 
        backgroundColor: '#10B981',
        shadowColor: "#10B981"
    },
    premiumPlanButton: {
        backgroundColor: '#7C3AED',
        shadowColor: "#7C3AED"
    },
    popularPlanButton: {
        backgroundColor: '#2563EB',
        shadowColor: "#2563EB",
        shadowOpacity: 0.4
    },
    activePlanButton: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        shadowColor: "#10B981",
        opacity: 0.8
    },
    disabledButton: { 
        opacity: 0.6,
        transform: [{ scale: 0.98 }]
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    choosePlanButtonText: { 
        color: '#fff', 
        fontWeight: '700', 
        fontSize: 16,
        letterSpacing: 0.5
    },
    freePlanButtonText: {
        fontSize: 16
    },
    premiumPlanButtonText: {
        fontSize: 16
    },
    activePlanButtonText: {
        color: '#fff',
        fontSize: 16
    },
    
    // Active Plan Dates Styles
    activePlanDates: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    activePlanDateText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
        marginBottom: 2,
    },
    buttonIcon: {
        marginLeft: 4
    },
    loadingButtonContent: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12
    },
    
    // Transaction History Styles
    transactionContainer: { 
        marginTop: 8,
        paddingHorizontal: 2 // Add small padding to prevent edge overflow
    },
    transactionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden' // Prevent any content from going outside
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
        marginBottom: 8,
        flex: 1
    },
    transactionInfo: {
        flex: 1,
        marginRight: 12, // Add margin to prevent overlap with status badge
        minWidth: 0 // Allow shrinking
    },
    transactionAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#134083',
        marginBottom: 2,
        flexShrink: 1,
        flexWrap: 'wrap'
    },
    transactionPlan: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        flexShrink: 1,
        flexWrap: 'wrap'
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        maxWidth: 90, // Limit maximum width
        alignItems: 'center',
        flexShrink: 0 // Don't shrink the badge
    },
    successBadge: {
        backgroundColor: '#DCFCE7'
    },
    failedBadge: {
        backgroundColor: '#FEE2E2'
    },
    pendingBadge: {
        backgroundColor: '#FEF3C7'
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        flexShrink: 1,
        textAlign: 'center'
    },
    successText: {
        color: '#16A34A'
    },
    failedText: {
        color: '#DC2626'
    },
    pendingText: {
        color: '#D97706'
    },
    transactionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        flexWrap: 'wrap'
    },
    transactionDate: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
        flexShrink: 1
    },
    transactionId: {
        fontSize: 12,
        color: '#9CA3AF',
        fontFamily: 'monospace',
        flexShrink: 1,
        textAlign: 'right'
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8
    },
    viewMoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#134083',
        marginRight: 6
    },
    emptyTransactionContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20
    },
    emptyTransactionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 4
    },
    emptyTransactionSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center'
    },
    
    // Empty State Styles
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#374151',
        marginTop: 20,
        marginBottom: 8
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#134083'
    },
    
    // WebView Styles
    webViewModal: { margin: 0 },
    webViewContainer: { flex: 1, backgroundColor: '#000' },
    webView: { flex: 1 },
    closeWebViewButton: { 
        position: 'absolute', 
        top: 50, 
        right: 20, 
        backgroundColor: 'rgba(0,0,0,0.8)', 
        borderRadius: 24, 
        padding: 12, 
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5
    },
    webViewLoading: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#fff' 
    },
    webViewLoadingText: { 
        marginTop: 16, 
        fontSize: 16, 
        color: '#6B7280',
        fontWeight: '500'
    },

    // Dashboard Styles
    dashboardSection: {
        marginBottom: 32,
        paddingHorizontal: 4,
    },
    dashboardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#134083',
        marginBottom: 20,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        width: '48%',
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
        fontSize: 20,
        fontWeight: '800',
        color: '#134083',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    statSubtitle: {
        fontSize: 10,
        color: '#6B7280',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    healthCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    healthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    healthTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#134083',
    },
    healthStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    healthDescription: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    
    // Bottom spacing
    bottomSpacing: {
        height: 80,
        backgroundColor: 'transparent',
    },
    
    // Current Plan Section Styles (keeping for backward compatibility)
    currentPlanSection: {
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#10B981',
    },
    currentPlanHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    currentPlanTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#10B981',
    },
    currentPlanCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    currentPlanInfo: {
        flex: 1,
    },
    currentPlanName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#134083',
        marginBottom: 4,
    },
    currentPlanDetails: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    currentPlanAmount: {
        alignItems: 'flex-end',
    },
    currentPlanPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#10B981',
        marginBottom: 4,
    },
    currentPlanStatus: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
});

export default SubscriptionPlan;
