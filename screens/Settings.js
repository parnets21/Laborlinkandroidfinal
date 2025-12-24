import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Settings = ({ navigation }) => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [emailUpdates, setEmailUpdates] = React.useState(true);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          title: 'Profile Information',
          onPress: () => navigation.navigate('Profile'),
          showArrow: true,
        },
        {
          icon: 'lock',
          title: 'Password & Security',
          onPress: () => navigation.navigate('PasswordChange'),
          showArrow: true,
        },
        {
          icon: 'notifications',
          title: 'Notifications',
          onPress: null,
          showSwitch: true,
          value: notifications,
          onValueChange: setNotifications,
        },
      ],
    },
    // {
    //   title: 'Preferences',
    //   items: [
    //     {
    //       icon: 'notifications',
    //       title: 'Alerts',
    //       onPress: null,
    //       showSwitch: true,
    //       value: emailUpdates,
    //       onValueChange: setEmailUpdates,
    //     },
    //     {
    //       icon: 'language',
    //       title: 'Language',
    //       subtitle: 'English',
    //       onPress: () => navigation.navigate('LanguageSettings'),
    //       showArrow: true,
    //     },
    //   ],
    // },
    {
      title: 'Support',
      items: [
{
  icon: 'help',
  title: 'Help Center',
  onPress: () => {
    Alert.alert(
      'Help Center',
      'Right now you can contact us via email. We are working on adding more support options soon.',
      [{ text: 'OK' }]
    );
  },
  showSwitch: false,
},
        {
          icon: 'privacy-tip',
          title: 'Privacy Policy',
          onPress: () => navigation.navigate('Privacy'),
          showArrow: true,
        },
        {
          icon: 'description',
          title: 'Terms of Service',
          onPress: () => navigation.navigate('Terms'),
          showArrow: true,
        },
          {
          icon: 'delete',
          title: 'Delete Your Account',
          onPress: () => navigation.navigate('DeleteAccountScreen'),
          showArrow: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item) => (
    <TouchableOpacity
      key={item.title}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.showSwitch}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={item.icon} size={24} color="#4F46E5" />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      {item.showArrow && <Icon name="chevron-right" size={24} color="#9CA3AF" />}
      {item.showSwitch && (
        <Switch
          value={item.value}
          onValueChange={item.onValueChange}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={item.value ? '#4F46E5' : '#fff'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} /> {/* Placeholder for alignment */}
      </View>

      <ScrollView style={styles.content}>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
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
    backgroundColor: '#26437c',
    padding: 20,
    paddingTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#26437c',
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default Settings; 