import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NotificationService from '../services/NotificationService';

const NotificationCenter = ({ navigation }) => {
  const [settings, setSettings] = useState({
    whatsapp: true,
    email: true,
    notifications: {
      interviews: true,
      results: true,
      offers: true,
      applications: true,
    }
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadSettings();
    // Load dummy notifications
    setNotifications(NotificationService.getDummyNotifications());
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const toggleSetting = (key, subKey = null) => {
    const newSettings = { ...settings };
    if (subKey) {
      newSettings.notifications[subKey] = !newSettings.notifications[subKey];
    } else {
      newSettings[key] = !newSettings[key];
    }
    saveSettings(newSettings);
  };

  const renderNotification = (notification) => {
    const getIcon = (type) => {
      switch (type) {
        case 'INTERVIEW_SCHEDULED': return 'schedule';
        case 'INTERVIEW_RESULT': return 'assessment';
        case 'OFFER_LETTER': return 'description';
        default: return 'notifications';
      }
    };

    return (
      <View key={notification.id} style={styles.notificationItem}>
        <Icon 
          name={getIcon(notification.type)} 
          size={24} 
          color="#2563EB" 
        />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>
            {notification.data.candidateName}
          </Text>
          <Text style={styles.notificationText}>
            {notification.type === 'INTERVIEW_SCHEDULED' 
              ? `Interview scheduled for ${notification.data.position}`
              : notification.type === 'INTERVIEW_RESULT'
              ? `Interview result: ${notification.data.status}`
              : `Offer letter sent for ${notification.data.position}`
            }
          </Text>
          <Text style={styles.notificationTime}>
            {new Date(notification.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          {notifications.map(renderNotification)}
        </View>

        {/* Channels Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="whatsapp" size={24} color="#25D366" />
              <Text style={styles.settingText}>WhatsApp Notifications</Text>
            </View>
            <Switch
              value={settings.whatsapp}
              onValueChange={() => toggleSetting('whatsapp')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.whatsapp ? '#2563EB' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="email" size={24} color="#2563EB" />
              <Text style={styles.settingText}>Email Notifications</Text>
            </View>
            <Switch
              value={settings.email}
              onValueChange={() => toggleSetting('email')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.email ? '#2563EB' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Notification Types Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="schedule" size={24} color="#F59E0B" />
              <Text style={styles.settingText}>Interview Schedule</Text>
            </View>
            <Switch
              value={settings.notifications.interviews}
              onValueChange={() => toggleSetting('notifications', 'interviews')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.notifications.interviews ? '#2563EB' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="assessment" size={24} color="#10B981" />
              <Text style={styles.settingText}>Interview Results</Text>
            </View>
            <Switch
              value={settings.notifications.results}
              onValueChange={() => toggleSetting('notifications', 'results')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.notifications.results ? '#2563EB' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="description" size={24} color="#6366F1" />
              <Text style={styles.settingText}>Offer Letters</Text>
            </View>
            <Switch
              value={settings.notifications.offers}
              onValueChange={() => toggleSetting('notifications', 'offers')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.notifications.offers ? '#2563EB' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="notifications" size={24} color="#EC4899" />
              <Text style={styles.settingText}>Application Updates</Text>
            </View>
            <Switch
              value={settings.notifications.applications}
              onValueChange={() => toggleSetting('notifications', 'applications')}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.notifications.applications ? '#2563EB' : '#9CA3AF'}
            />
          </View>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#134083',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'flex-start',
  },
  notificationContent: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#134083',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default NotificationCenter; 