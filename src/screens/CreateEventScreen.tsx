// src/screens/CreateEventScreen.tsx
import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigator/RootStack';
import { PlanForm } from '../components/PlanForm';

type Route = RouteProp<RootStackParamList, 'CreateEvent'>;

export function CreateEventScreen() {
  const { params } = useRoute<Route>();
  return <PlanForm kind="event" isPublic={params.isPublic} hasGroupChat={params.hasGroupChat} />;
}
