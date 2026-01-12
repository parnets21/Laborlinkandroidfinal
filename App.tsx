/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileProvider } from './context/ProfileContext';
import Toast from 'react-native-toast-message';

// Import all screens
import WelcomeScreen from './screens/WelcomeScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import JobSeekerAuth from './screens/JobSeekerAuth';
import CreateProfile from './screens/CreateProfile';
import EmployerAuth from './screens/EmployerAuth';
import PreferredJobRole from './screens/PreferredJobRole';
import ResumeUpload from './screens/ResumeUpload';
import EmployeeDashboard from './screens/EmployeeDashboard';
import ExperienceDetails from './screens/ExperienceDetails';
import Skills from './screens/Skills';
import Resume from './screens/Resume';
import MyApplies from './screens/MyApplies';
import Messages from './screens/Messages';
import Profile from './screens/Profile';
import TabNavigator from './navigation/TabNavigator';
import EmployerRegistration from './screens/EmployerRegistration';
import EmployerTabNavigator from './navigation/EmployerTabNavigator.js';
import CreateJob from './screens/CreateJob';
import ApplicationStatus from './screens/ApplicationStatus.js'

import InterviewResults from './screens/InterviewResults';
import JobDetails from './screens/JobDetails';
import InterviewDetails from './screens/InterviewDetails';
import TravelDetails from './screens/TravelDetails.js';
import ApplicationDetails from './screens/ApplicationDetails';
import JobDetailsPage from './screens/JobDetailScreen.js'
import PaymentManagement from './screens/PaymentManagement';
import PaymentGateway from './screens/PaymentGateway';
import NotificationCenter from './screens/NotificationCenter';
import ReferralSystem from './screens/ReferralSystem';
import ProfileLockStatus from './screens/ProfileLockStatus';
import Settings from './screens/Settings';
import EmployeeLocation from './screens/EmployeeLocation';
import GenerateOffer from './screens/GenerateOffer';
import OfferDetails from './screens/OfferDetails';
import EmployerRegistration1 from './screens/EmployerRegistration';
import EmployerPending from './screens/EmployerPending';
// import SignupScreen from './screens/SignupScreen';
import EmployerLogin from './screens/EmployerLogin.js';
import AllJobsScreen from './screens/AllJobsScreen.js'
// Define the type for navigation parameters
import EducationDetails from './screens/EducationDetails';
import CreateJob2 from './screens/CreateJob2';
import WorkExperience from './screens/WorkExperience';
import SkillsAndPreferences from './screens/SkillsAndPreferences.js'
import Login from './screens/Login';
import JobHistory from './screens/JobHistory.js'
import HelpSupport from './screens/HelpSupport.js'
import JobDetailScreen from './screens/JobDetailScreen.js'
import TrackLiveScreen from './screens/TrackLiveScreen.js';
import OfferLetterScreen from './screens/OfferLetterScreen.js';
import Privacy from './screens/Privacy.js';
import Terms from './screens/Terms.js';
import PasswordChange from './screens/PaaswrodChange.js';
import AllaccessJobPage from './screens/AllaccessJobPage.js';
import DeleteAccountScreen from './screens/DeleteAccountScreen.js';
import TermsEmployee from './screens/TermsEmployee.js';
import TermsEmployer from './screens/TermsEmployer.js';
import SubscriptionPlan from './screens/SubscriptionPlan.js';
import ChangePasswordScreen from './screens/ChangePasswordScreen.js';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen.js';
import VerifyOTPScreen from './screens/VerifyOTPScreen.js';
import ResetPasswordScreen from './screens/ResetPasswordScreen.js';
import { AuthProvider } from './context/AuthContext.js'; 
import messaging from '@react-native-firebase/messaging'; 
import  { useEffect } from 'react'; 
export type RootStackParamList = {
  Welcome: undefined;
  RoleSelection: undefined;
  JobSeekerAuth: undefined;
  EmployerAuth: undefined;
  CreateProfile: undefined;
  Login: undefined;
  HelpSupport:undefined;
  NextScreen: undefined;
  PreferredJobRole: undefined;
  ResumeUpload: undefined;
  EmployeeDashboard: undefined;
  Signup: undefined;
  ApplicationStatus:undefined;
  ExperienceDetails: undefined;
  Skills: undefined;
  JobHistory:undefined,
  AllJobsScreen:undefined;
  Resume: undefined;
  MyApplies: undefined;
  Messages: undefined;
  Profile: undefined;
  EmployerRegistration: undefined;
  EmployerDashboard: undefined;
  CreateJob: undefined;
  JobDetailsPage:undefined;
  InterviewResults: undefined;
  JobDetails: undefined;
  InterviewDetails: undefined;
  TravelDetails: undefined;
  ApplicationDetails: undefined;
  PaymentManagement: undefined;
  PaymentGateway: undefined;
  NotificationCenter: undefined;
  ReferralSystem: undefined;
  ProfileLockStatus: undefined;
  GenerateOffer: undefined;
  OfferDetails: undefined;
  EmployerRegistration1: undefined;
  EmployerPending: undefined;
  EmployerLogin:undefined;
  CreateJob2:undefined;
  EducationDetails:undefined;
  WorkExperience:undefined;
  SkillsAndPreferences:undefined;
  JobDetailScreen:undefined;
  TermsEmployee:undefined;
  TermsEmployer:undefined;
  OfferLetterScreen:undefined;
  AllaccessJobPage:undefined;
Settings:undefined;
  TrackLiveScreen:undefined;
  PasswordChange:undefined;
  Privacy:undefined;
  Terms:undefined;
  DeleteAccountScreen:undefined;
  EmployeeLocation:undefined;
  EmployeeSubscription:undefined;
  EmployerOffer:undefined;
  ChangePasswordScreen:undefined;
  ForgotPasswordScreen: { userType?: string };
  VerifyOTPScreen: { email: string; userType: string };
  ResetPasswordScreen: { email: string; userType: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => { 
   useEffect(() => {
    messaging()
      .getToken()
      .then(token => {
        console.log("🔥 New FCM Token:", token); // Check Metro console for this
        // You can also send it to your backend API here:
        // fetch('http://localhost:8500/api/user/fcmToken', { method: 'POST', body: JSON.stringify({ token }) })
      })
      .catch(err => console.log("Error getting FCM token", err));

    // Optional: Listen for token refresh
    const unsubscribe = messaging().onTokenRefresh(newToken => {
      console.log("♻️ FCM Token refreshed:", newToken);
      // Send updated token to backend here if needed
    });

    return unsubscribe; // Clean up listener on unmount
  }, []);
  return ( 
    <AuthProvider>
    <ProfileProvider> 
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Welcome"
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="JobSeekerAuth" component={JobSeekerAuth} />
          <Stack.Screen name="EmployerAuth" component={EmployerAuth} />
          <Stack.Screen name="CreateProfile" component={CreateProfile} />
          <Stack.Screen name="ExperienceDetails" component={ExperienceDetails} />
          <Stack.Screen name="Skills" component={Skills} />
          <Stack.Screen name="PreferredJobRole" component={PreferredJobRole} />
          <Stack.Screen name="ResumeUpload" component={ResumeUpload} />
          <Stack.Screen name="CreateJob2" component={CreateJob2} />
          <Stack.Screen name="WorkExperience" component={WorkExperience} options={{ headerShown: false }} />
          <Stack.Screen name="EducationDetails" component={EducationDetails} />
          <Stack.Screen name="SkillsAndPreferences" component={SkillsAndPreferences} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="EmployeeDashboard" component={TabNavigator} />
          <Stack.Screen name="EmployerDashboard" component={EmployerTabNavigator} />
          <Stack.Screen name="TermsEmployee" component={TermsEmployee} />
          <Stack.Screen name="TermsEmployer" component={TermsEmployer} />
          <Stack.Screen name="EmployerOffer" component={TermsEmployer} />
          <Stack.Screen 
            name="EmployerLogin" 
            component={EmployerLogin}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ForgotPasswordScreen" 
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="VerifyOTPScreen" 
            component={VerifyOTPScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ResetPasswordScreen" 
            component={ResetPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Messages" 
            component={Messages}
            options={{ headerShown: false }}
          />

        <Stack.Screen 
          name="JobHistory" 
          component={JobHistory}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="ApplicationStatus" 
          component={ApplicationStatus}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="HelpSupport" 
          component={HelpSupport}
          options={{ headerShown: false }}
        />
           <Stack.Screen 
          name="JobDetailsPage" 
          component={JobDetailsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Profile" 
          component={Profile}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EmployerRegistration" 
          component={EmployerRegistration}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreateJob" 
          component={CreateJob}
          options={{ headerShown: false }}
        />        
        <Stack.Screen 
          name="MyApplies" 
          component={MyApplies}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="OfferLetterScreen" 
          component={OfferLetterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="InterviewResults" 
          component={InterviewResults}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="JobDetails" 
          component={JobDetails}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="AllJobsScreen" 
          component={AllJobsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AllaccessJobPage" 
          component={AllaccessJobPage}
          options={{ headerShown: false }}
        />
       <Stack.Screen 
          name="JobDetailScreen" 
          component={JobDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="InterviewDetails" 
          component={InterviewDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TravelDetails" 
          component={TravelDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ApplicationDetails" 
          component={ApplicationDetails}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="PaymentManagement" 
          component={PaymentManagement}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PaymentGateway" 
          component={PaymentGateway}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="NotificationCenter" 
          component={NotificationCenter}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ReferralSystem" 
          component={ReferralSystem}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ProfileLockStatus" 
          component={ProfileLockStatus}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Settings" 
          component={Settings}
          options={{ headerShown: false }}
        />
                <Stack.Screen 
          name="Privacy" 
          component={Privacy}
          options={{ headerShown: true }}
        />
        <Stack.Screen 
          name="Terms" 
          component={Terms}
          options={{ headerShown: true }}
        />
                 <Stack.Screen 
          name="PasswordChange" 
          component={PasswordChange}
          options={{ headerShown: false }}
        />
                 <Stack.Screen 
          name="DeleteAccountScreen" 
          component={DeleteAccountScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EmployeeLocation" 
          component={EmployeeLocation}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="OfferDetails" 
          component={OfferDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="GenerateOffer" 
          component={GenerateOffer}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TrackLiveScreen" 
          component={TrackLiveScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EmployerRegistration1" 
          component={EmployerRegistration1}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EmployerPending" 
          component={EmployerPending}
          options={{ headerShown: false }}
        />
          <Stack.Screen 
          name="EmployeeSubscription" 
          component={SubscriptionPlan}
          options={{ headerShown: false }}
        />
          <Stack.Screen 
          name="ChangePasswordScreen" 
          component={ChangePasswordScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast />
    </ProfileProvider> 
    </AuthProvider>
  );
};

export default App;
