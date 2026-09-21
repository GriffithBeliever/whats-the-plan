// src/navigator/RootStack.tsx
// Sits above MainTabs so full-screen flows (plan details, group chat, the
// create wizard) push over the whole app — tab bar included — no matter
// which tab they were launched from, then pop back to exactly where the user
// was.
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { PlanScreen } from '../screens/PlanScreen';
import { GroupScreen } from '../screens/GroupScreen';
import { CreatePlanScreen } from '../screens/CreatePlanScreen';
import { CreateOutingScreen } from '../screens/CreateOutingScreen';
import { CreateEventScreen } from '../screens/CreateEventScreen';
import { colors, font } from '../theme/theme';

export type RootStackParamList = {
  MainTabs: undefined;
  Plan: { planId: string };
  Group: { planId: string };
  CreatePlan: undefined;
  CreateOuting: { isPublic: boolean; hasGroupChat: boolean };
  CreateEvent: { isPublic: boolean; hasGroupChat: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: font.weight.bold, fontSize: font.size.md },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Plan" component={PlanScreen} options={{ title: '' }} />
      <Stack.Screen name="Group" component={GroupScreen} options={{ title: 'Group Chat' }} />
      <Stack.Screen name="CreatePlan" component={CreatePlanScreen} options={{ title: 'New Plan', presentation: 'modal' }} />
      <Stack.Screen name="CreateOuting" component={CreateOutingScreen} options={{ title: 'New Outing', presentation: 'modal' }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'New Event', presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
