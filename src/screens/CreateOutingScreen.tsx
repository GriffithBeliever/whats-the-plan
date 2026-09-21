// src/screens/CreateOutingScreen.tsx
import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigator/RootStack';
import { PlanForm } from '../components/PlanForm';

type Route = RouteProp<RootStackParamList, 'CreateOuting'>;

export function CreateOutingScreen() {
  const { params } = useRoute<Route>();
  return <PlanForm kind="outing" isPublic={params.isPublic} hasGroupChat={params.hasGroupChat} />;
}
