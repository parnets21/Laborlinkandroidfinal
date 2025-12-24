import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.appName}>apna<Text style={styles.appNameGreen}>Profile</Text></Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Sugat</Text>
            <Text style={styles.profileLink}>
              apna.co/sugat-rir19vz 
              <Icon name="open-in-new" size={16} color="#008080" />
            </Text>
            <View style={styles.educationInfo}>
              <Icon name="school" size={16} color="#666" />
              <Text style={styles.infoText}> 10th or Below 10th</Text>
            </View>
            <View style={styles.locationInfo}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.infoText}> Varadharaja Nagar, Bengaluru/Bangalore, KA</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Icon name="share" size={20} color="#008080" />
            <Text style={styles.shareButtonText}>Share profile</Text>
          </TouchableOpacity>
        </View>

        {/* Resume Upload Card */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadInfo}>
            <Image
              source={require('../assets/resume-icon.png')}
              style={styles.uploadIcon}
            />
            <View>
              <Text style={styles.uploadTitle}>Increases your chances of a job by 54%</Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Upload Resume</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About Me</Text>

        {/* Experience Section */}
        <Text style={styles.sectionTitle}>Experience</Text>
        <TouchableOpacity style={styles.infoCard}>
          <View style={styles.infoCardContent}>
            <Text style={styles.infoLabel}>Experience Level:</Text>
            <View style={styles.infoValue}>
              <Text style={styles.infoValueText}>Fresher</Text>
              <Icon name="chevron-right" size={24} color="#666" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Education Section */}
        <Text style={styles.sectionTitle}>Education</Text>
        <TouchableOpacity style={styles.infoCard}>
          <View style={styles.infoCardContent}>
            <Text style={styles.infoLabel}>Highest education:</Text>
            <View style={styles.infoValue}>
              <Text style={styles.infoValueText}>10th or Below 10th</Text>
              <Icon name="chevron-right" size={24} color="#666" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Further Education */}
        <TouchableOpacity style={styles.addEducationCard}>
          <Text style={styles.addEducationTitle}>Further Education Preferences</Text>
          <View style={styles.addButton}>
            <Icon name="add" size={24} color="#008080" />
            <Text style={styles.addButtonText}>Add</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="work" size={24} color="#666" />
          <Text style={styles.navText}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="description" size={24} color="#666" />
          <Text style={styles.navText}>Applications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
          <Icon name="school" size={24} color="#666" />
          <Text style={styles.navText}>Degree</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="emoji-events" size={24} color="#666" />
          <Text style={styles.navText}>Contests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <View style={styles.profileNavIcon}>
            <Text style={styles.profileNavText}>S</Text>
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appNameGreen: {
    color: '#008080',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a4a4a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileLink: {
    color: '#008080',
    marginBottom: 8,
  },
  educationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#666',
    marginLeft: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  shareButtonText: {
    color: '#008080',
    marginLeft: 8,
    fontWeight: '500',
  },
  uploadCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  uploadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  uploadTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#666',
    fontSize: 16,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValueText: {
    fontSize: 16,
    marginRight: 8,
  },
  addEducationCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addEducationTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#008080',
    marginLeft: 4,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#008080',
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileNavIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4a4a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileNavText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;