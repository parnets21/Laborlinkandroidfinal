import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import CreateJob from '../screens/CreateJob';
import CreateJob2 from '../screens/CreateJob2';
import EmployerDashboard from '../screens/EmployerDashboard';
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
        {/* Add other screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 