import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';

const ResumeUpload = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx],
      });
      
      setSelectedFile(result[0]);
      // Navigate after file selection
      navigation.replace('EmployeeDashboard');
      
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.log('Error:', err);
      }
    }
  };

  const handleSkip = () => {
    // Use replace instead of navigate to prevent going back
    navigation.replace('EmployeeDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload Your Resume</Text>
        <Text style={styles.subtitle}>
          Upload your resume to help us find the best jobs for you
        </Text>

        <View style={styles.uploadArea}>
          <TouchableOpacity onPress={handleFilePick} style={styles.uploadButton}>
            <View style={styles.imageContainer}>
              <Icon 
                name="folder" 
                size={80} 
                color="#666"
                style={styles.folderImage}
              />
            </View>
            <Text style={styles.uploadText}>
              {selectedFile ? selectedFile.name : 'Tap to upload your resume'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


export default ResumeUpload;