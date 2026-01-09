import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import CreateJob from '../screens/CreateJob';
import CreateJob2 from '../screens/CreateJob2';
import EmployerDashboard from '../screens/EmployerDashboard';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
// Import other screens as needed

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="EmployerDashboard"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="EmployerDashboard" component={EmployerDashboard} />
        <Stack.Screen name="CreateJob" component={CreateJob} />
        <Stack.Screen name="CreateJob2" component={CreateJob2} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyOTPScreen" component={VerifyOTPScreen} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        {/* Add other screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 