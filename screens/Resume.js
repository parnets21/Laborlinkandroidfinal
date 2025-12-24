import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'react-native-document-picker';

const Resume = ({ navigation, route }) => {
  const { userData } = route.params;
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx],
        allowMultiSelection: false,
      });

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      if (result[0].size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setSelectedFile(result[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error(err);
      }
    }
  };

  const handleNext = () => {
    const updatedUserData = {
      ...userData,
      resume: selectedFile,
    };
    navigation.navigate('EmployeeDashboard', { userData: updatedUserData });
  };

  const handleSkip = () => {
    navigation.navigate('EmployeeDashboard', { userData });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resume</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '95%' }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Upload your resume!</Text>
        <Text style={styles.subtitle}>Receive 2x job offers after uploading</Text>

        <View style={styles.uploadInfo}>
          <Icon name="flash-on" size={20} color="#FFB800" />
          <Text style={styles.uploadInfoText}>Takes less than a min to upload</Text>
        </View>

        <View style={styles.imageContainer}>
          {/* <Image
            source={require('../assets/resume-folder.png')} // Make sure to add this image to your assets
            style={styles.folderImage}
            resizeMode="contain"
          /> */}
          <Text style={styles.fileTypeText}>Upload .pdf or .docx file only</Text>
          <Text style={styles.fileSizeText}>(Max file size: 5 MB)</Text>
        </View>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Icon name="check-circle" size={24} color="#666" />
            <Text style={styles.benefitText}>Unlock jobs from top companies faster</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="check-circle" size={24} color="#666" />
            <Text style={styles.benefitText}>Get direct calls from top HRs</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="check-circle" size={24} color="#666" />
            <Text style={styles.benefitText}>
              Get jobs specifically suited for your role and experience level
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.selectButton}
          onPress={handleFilePick}
        >
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#000',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  content: {
    flex: 1,
    backgroundColor: '#FDF7FF',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 32,
  },
  uploadInfoText: {
    marginLeft: 8,
    color: '#000',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  folderImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  fileTypeText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  fileSizeText: {
    fontSize: 14,
    color: '#666',
  },
  benefitsList: {
    width: '100%',
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  skipButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#059669',
  },
  skipButtonText: {
    color: '#134083',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectButton: {
    backgroundColor: '#134083',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Resume; 