import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import EmployeeDashboard from '../screens/EmployeeDashboard';
import MyApplies from '../screens/MyApplies';
import Messages from '../screens/Messages';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarActiveTintColor: '#134083',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen
        name="Jobs"
        component={EmployeeDashboard}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="work" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyApplies"
        component={MyApplies}
        options={{
          tabBarLabel: 'My Applies',
          tabBarIcon: ({ color }) => (
            <Icon name="folder" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="mail" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="person" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

