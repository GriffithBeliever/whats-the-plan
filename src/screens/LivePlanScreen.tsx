// src/screens/LivePlanScreen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLivePlan } from '../state/AppStateContext';
import { PlanDetails } from '../components/PlanDetails';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme/theme';

export function LivePlanScreen() {
  const livePlan = useLivePlan();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {livePlan ? (
        <PlanDetails plan={livePlan} />
      ) : (
        <View style={styles.center}>
          <EmptyState
            icon="📡"
            title="No live plan right now"
            subtitle="This screen activates automatically once a plan you've joined starts — from 15 minutes before, until it wraps up."
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center' },
});
