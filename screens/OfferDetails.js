import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OfferDetails = ({ route, navigation }) => {
  const { offer } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offer Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.offerCard}>
          <Text style={styles.avatarText}>{offer.avatar}</Text>
          <Text style={styles.candidateName}>{offer.candidateName}</Text>
          <Text style={styles.position}>{offer.position}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: 
                  offer.status === 'Sent' ? '#D1FAE5' :
                  offer.status === 'Pending' ? '#FEF3C7' : '#FEE2E2'
              }
            ]}>
              <Text style={[
                styles.statusText,
                {
                  color:
                    offer.status === 'Sent' ? '#059669' :
                    offer.status === 'Pending' ? '#D97706' : '#DC2626'
                }
              ]}>{offer.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.button, styles.emailButton]}>
            <Icon name="email" size={20} color="#fff" />
            <Text style={styles.buttonText}>Send Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.whatsappButton]}>
            <Icon name="chat" size={20} color="#fff" />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 48,
    marginBottom: 16,
  },
  candidateName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 8,
  },
  position: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#134083',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  emailButton: {
    backgroundColor: '#4F46E5',
  },
  whatsappButton: {
    backgroundColor: '#059669',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OfferDetails; 