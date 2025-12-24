import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PaymentManagement = ({ navigation }) => {
  const Basic_Url = 'https://laborlink.co.in';
  const [searchCount, setSearchCount] = useState(3);
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'Subscription',
      amount: 499,
      date: '2024-02-13',
      status: 'completed'
    },
    // Add more transaction history
  ]);

  const subscriptionPlans = [
    {
      id: 1,
      name: 'Basic',
      searches: 20,
      price: 499,
      duration: '1 Month'
    },
    {
      id: 2,
      name: 'Pro',
      searches: 50,
      price: 999,
      duration: '1 Month'
    }
  ];

  const [subscription, setSubscription] = useState(null);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${Basic_Url}/api/subscription`); 
      console.log("responceeeeeee",response)
      setSubscription(response.data.filter(subscription => subscription.type === 'employer'));
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  console.log(subscription, ".............................")

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
        {/* Free Searches Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Free Searches</Text>
          <View style={styles.searchStatus}>
            <Text style={styles.searchCount}>{searchCount}</Text>
            <Text style={styles.searchText}>remaining out of 5</Text>
          </View>
          <Text style={styles.searchInfo}>
            Subscribe to continue searching after free limit
          </Text>
        </View>

        {/* Subscription Plans */}
        {/* <Text style={styles.sectionTitle}>Available Plans</Text>
        {subscriptionPlans.map(plan => (
          <TouchableOpacity 
            key={plan.id} 
            style={styles.planCard}
            onPress={() => navigation.navigate('PaymentGateway', { plan })}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>₹{plan.price}</Text>
            </View>
            <View style={styles.planDetails}>
              <View style={styles.planFeature}>
                <Icon name="search" size={20} color="#4B5563" />
                <Text style={styles.featureText}>{plan.searches} Searches</Text>
              </View>
              <View style={styles.planFeature}>
                <Icon name="schedule" size={20} color="#4B5563" />
                <Text style={styles.featureText}>{plan.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))} */}

        <ScrollView style={styles.container}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>

          {subscription?.map((plan) => (
            <TouchableOpacity
              key={plan._id}
              style={styles.planCard}
              onPress={() => navigation.navigate('PaymentGateway', { plan })}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>₹{plan.price}</Text>
              </View>

              <View style={styles.planDetails}>

                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.planFeature}>
                    <Icon name="check-circle" size={20} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('PaymentGateway', { plan })}
                style={{
                  marginTop: 16,
                  backgroundColor: '#134083',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Choose Plan</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transaction History */}
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <View style={styles.card}>
          {transactions.map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.amountText}>₹{transaction.amount}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: transaction.status === 'completed' ? '#10B981' : '#F59E0B' }
                ]}>
                  <Text style={styles.statusText}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
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
    backgroundColor: '#134083',
    padding: 20,
    paddingTop: 50,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 12,
  },
  searchStatus: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  searchCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#134083',
    marginRight: 8,
  },
  searchText: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginTop: 16,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    width:"80%"
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  planDetails: {
    gap: 8,

  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563', 
    width:"90%"
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#134083',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
});

export default PaymentManagement; 