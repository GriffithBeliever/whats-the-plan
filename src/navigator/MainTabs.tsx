// src/navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlansScreen } from '../screens/PlansScreen';

export type MainTabsParamList = {
  Plans: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Plans" component={PlansScreen} />
    </Tab.Navigator>
  );
}
