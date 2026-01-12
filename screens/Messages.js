import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Messages = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applied");
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          throw new Error("User data not found");
        }

        const parsedUser = JSON.parse(userData);
        const userId = parsedUser._id;

        const response = await axios.get(`http://localhost:8500/api/user/getlistOOfaplly/${userId}`);
        const apps = response.data.success || [];
        setApplications(apps);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Error fetching applications:", error);
        Alert.alert("Error", "Failed to fetch applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusColor = (status) => ({
    selected: "#28a745",
    hired: "#10B981",
    offer_sent: "#F59E0B",
    offer_accepted: "#10B981",
    offer_declined: "#EF4444",
    applied: "#3B82F6",
    declined: "#EF4444",
  }[status] || "#6B7280");

  const handleApplicationPress = (applicationId) => {
    navigation.navigate("OfferLetterScreen", { applicationId });
  };

  const filteredApplications = activeTab === "applied"
    ? applications
    : applications.filter((app) => app.offerLetter && ["sent", "accepted", "declined"].includes(app.offerLetter.status));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  const renderApplicationCard = (application, index) => (
    <Animated.View
      style={[styles.applicationCard, { opacity: fadeAnim }]}
      key={application._id}
    >
      <View style={styles.applicationHeader}>
        <View style={styles.applicationInfo}>
          <Text style={styles.applicationTitle}>{application.jobTitle}</Text>
          <Text style={styles.companyName}>{application.companyName}</Text>
          <Text style={styles.appliedDate}>
            Applied: {new Date(application.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.applicationStatus) }]}>
          <Text style={styles.statusText}>
            {application.applicationStatus.toUpperCase().replace("_", " ")}
          </Text>
        </View>
      </View>
      {application.offerLetter && (
        <View style={styles.offerStatus}>
          <Icon name="description" size={18} color={getStatusColor(application.offerLetter.status)} />
          <Text style={[styles.offerStatusText, { color: getStatusColor(application.offerLetter.status) }]}>
            Offer Letter: {application.offerLetter.status.toUpperCase()}
          </Text>
        </View>
      )}
      {activeTab === "offer" && application.offerLetter?.status === "sent" && (
        <TouchableOpacity
          style={styles.respondButton}
          onPress={() => handleApplicationPress(application._id)}
          activeOpacity={0.8}
        >
          <Text style={styles.respondButtonText}>View & Respond Offer Letter</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>◀ GO Back</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
        <Text style={styles.headerSubtitle}>
          {applications.length} {applications.length === 1 ? "application" : "applications"}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "applied" && styles.activeTab]}
          onPress={() => setActiveTab("applied")}
        >
          <Text style={[styles.tabText, activeTab === "applied" && styles.activeTabText]}>
            All Applied Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "offer" && styles.activeTab]}
          onPress={() => setActiveTab("offer")}
        >
          <Text style={[styles.tabText, activeTab === "offer" && styles.activeTabText]}>
            Offer Letters
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.applicationsList} contentContainerStyle={styles.applicationsContent}>
        <View style={styles.section}>
          {filteredApplications.length === 0 ? (
            <View style={styles.emptySection}>
              <Icon name="error-outline" size={48} color="#EF4444" />
              <Text style={styles.emptyText}>
                {activeTab === "applied" ? "No applied jobs found" : "No offer letters found"}
              </Text>
            </View>
          ) : (
            filteredApplications.map((application, index) => renderApplicationCard(application, index))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#134083",
    padding: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E5E7EB",
    fontWeight: "500",
  },
  backButton: {
    position: 'absolute',
    top: 10,
    // left: 20,
    right: 11,
    zIndex: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backText: {
    color: '#134083',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#134083",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#fff",
  },
  applicationsList: {
    flex: 1,
  },
  applicationsContent: {
    padding: 20,
    gap: 20,
  },
  section: {
    marginBottom: 20,
  },
  emptySection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#134083",
    marginTop: 12,
  },
  applicationCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  applicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
    gap: 4,
  },
  applicationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#134083",
  },
  companyName: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  appliedDate: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  offerStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: "#E5E7EB",
  },
  offerStatusText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  respondButton: {
    marginTop: 12,
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  respondButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Messages;
