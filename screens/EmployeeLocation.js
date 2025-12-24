import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import locat from "../assets/images.jpeg"
const EmployeeLocation = ({ navigation, route }) => {
  const { employee } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Location</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <Image
            // source={{ uri: 'https://i.imgur.com/KaRRX9h.png' }}
            source={locat}
            //locat
            style={styles.mapImage}
            resizeMode="cover"
          />
          <View style={styles.mapOverlay}>
            <View style={styles.employeeMarker}>
              <Text style={styles.markerAvatar}>{employee.avatar}</Text>
              <View style={styles.markerPulse} />
            </View>
          </View>
        </View>

        {/* Employee Info Card */}
        <View style={styles.employeeCard}>
          <View style={styles.employeeHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{employee.avatar}</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: employee.status === "Active" ? "#10B981" : "#F59E0B" }
              ]} />
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>{employee.name}</Text>
              <Text style={styles.employeeRole}>{employee.role}</Text>
            </View>
          </View>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="access-time" size={20} color="#6B7280" />
              <Text style={styles.infoText}>Time Logged: {employee.timeLogged}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="work" size={20} color="#6B7280" />
              <Text style={styles.infoText}>Current Task: {employee.currentTask}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#6B7280" />
              <Text style={styles.infoText}>Work Mode: {employee.workMode}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="schedule" size={20} color="#6B7280" />
              <Text style={styles.infoText}>Last Active: {employee.lastActive}</Text>
            </View>
          </View>

          {/* <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            {employee.todaysTasks.map((task, index) => (
              <View key={index} style={styles.taskItem}>
                <Icon 
                  name={task.status === 'completed' ? 'check-circle' : 'schedule'} 
                  size={20} 
                  color={task.status === 'completed' ? '#10B981' : '#F59E0B'} 
                />
                <Text style={styles.taskText}>{task.task}</Text>
                <Text style={[
                  styles.taskStatus,
                  { color: task.status === 'completed' ? '#10B981' : '#F59E0B' }
                ]}>
                  {task.status}
                </Text>
              </View>
            ))}
          </View> */}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeMarker: {
    alignItems: 'center',
  },
  markerAvatar: {
    fontSize: 30,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  markerPulse: {
    position: 'absolute',
    bottom: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  employeeCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 4,
  },
  employeeRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#4B5563',
  },
  tasksSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134083',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  taskText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#4B5563',
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default EmployeeLocation; 