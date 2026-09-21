// src/screens/PlanScreen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigator/RootStack';
import { usePlan } from '../state/AppStateContext';
import { PlanDetails } from '../components/PlanDetails';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme/theme';

type Route = RouteProp<RootStackParamList, 'Plan'>;

export function PlanScreen() {
  const { params } = useRoute<Route>();
  const plan = usePlan(params.planId);

  if (!plan) {
    return (
      <View style={styles.center}>
        <EmptyState icon="🕵️" title="This plan is gone" subtitle="It may have been removed." />
      </View>
    );
  }

  return <PlanDetails plan={plan} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
});
