// src/navigator/PlansStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlansScreen } from '../screens/PlansScreen';
import { CreateEventScreen } from '../screens/CreateEventScreen';

export type PlansStackParamList = {
  PlansHome: undefined;
  CreateEvent: undefined;
};

const Stack = createNativeStackNavigator<PlansStackParamList>();

export function PlansStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlansHome" component={PlansScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
    </Stack.Navigator>
  );
}
