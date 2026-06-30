// src/navigation/MainTabs.tsx
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlansScreen } from '../screens/PlansScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MapScreen } from '../screens/MapScreen';

export type MainTabsParamList = {
  Groups: undefined;
  Plans: undefined;
  Profile: undefined;
  Map: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator initialRouteName="Plans" screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Groups" component={GroupsScreen}
      options={{
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="groups"  color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Plans" 
        component={PlansScreen} 
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="event-note"  color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="maps-ugc"  color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="profile"  color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
