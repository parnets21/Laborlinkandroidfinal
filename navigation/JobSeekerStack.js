import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreateProfile from '../screens/CreateProfile';
import EducationDetails from '../screens/EducationDetails';
import WorkExperience from '../screens/WorkExperience';
import SkillsAndPreferences from '../screens/SkillsAndPreferences';
import Login from '../screens/Login';
import EmployeeDashboard from '../screens/EmployeeDashboard';

const Stack = createNativeStackNavigator();

const JobSeekerStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="CreateProfile" component={CreateProfile} />
      <Stack.Screen name="EducationDetails" component={EducationDetails} />
      <Stack.Screen name="WorkExperience" component={WorkExperience} />
      <Stack.Screen name="SkillsAndPreferences" component={SkillsAndPreferences} />
      <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboard} />
    </Stack.Navigator>
  );
};

export default JobSeekerStack; 