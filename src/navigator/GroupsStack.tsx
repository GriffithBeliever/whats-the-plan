// src/navigator/GroupsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GroupsScreen } from '../screens/GroupsScreen';
import { GroupChatScreen } from '../screens/GroupChatScreen';

export type GroupsStackParamList = {
  GroupsList: undefined;
  GroupChat: { groupId: string; groupName: string };
};

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
    </Stack.Navigator>
  );
}
