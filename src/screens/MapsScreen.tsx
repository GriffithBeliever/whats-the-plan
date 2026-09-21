// src/screens/MapsScreen.tsx
// A self-contained, illustrated "map": no real basemap/tiles or API key needed
// (there's no real geocoding backend yet either), just plans projected onto a
// textured canvas by their lat/long so the interaction model — markers, a
// scrollable date dial, a today strip — is fully in place and easy to swap
// for a real map SDK later.
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/RootStack';
import { usePlans, useMyPlans } from '../state/AppStateContext';
import { Plan, formatTime } from '../types/plan';
import { SegmentedControl } from '../components/SegmentedControl';
import { DateDial } from '../components/DateDial';
import { MapCanvas } from '../components/MapCanvas';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { PlanCard } from '../components/PlanCard';
import { colors, font, radius, shadow, spacing } from '../theme/theme';
import { sameDay } from '../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function MapsScreen() {
  const navigation = useNavigation<Nav>();
  const allPlans = usePlans();
  const myPlans = useMyPlans();
  const [scope, setScope] = useState<'mine' | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(startOfToday);
  const [sheetPlans, setSheetPlans] = useState<Plan[] | null>(null);

  const basePool = scope === 'mine' ? myPlans : allPlans.filter(p => p.isPublic);

  const dayPlans = useMemo(
    () => basePool.filter(p => sameDay(new Date(p.startTime), selectedDate)),
    [basePool, selectedDate],
  );

  const openPlan = (planId: string) => {
    setSheetPlans(null);
    navigation.navigate('Plan', { planId });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
        <SegmentedControl
          value={scope}
          onChange={setScope}
          options={[{ value: 'mine', label: 'My Plans' }, { value: 'all', label: 'All' }]}
        />
      </View>

      <View style={styles.todayBar}>
        {dayPlans.length === 0 ? (
          <Text style={styles.todayEmpty}>Nothing {scope === 'mine' ? 'you joined ' : ''}on {sameDay(selectedDate, new Date()) ? 'today' : selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.todayBarContent}>
            {dayPlans.map(plan => (
              <TouchableOpacity key={plan.id} style={styles.todayPill} onPress={() => setSheetPlans([plan])} activeOpacity={0.8}>
                <Text style={styles.todayIcon}>{plan.icon}</Text>
                <View>
                  <Text style={styles.todayTitle} numberOfLines={1}>{plan.title}</Text>
                  <Text style={styles.todayTime}>{formatTime(plan.startTime)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <MapCanvas plans={dayPlans} onSelect={setSheetPlans} />

      <DateDial onChange={setSelectedDate} />

      <BottomSheet
        visible={!!sheetPlans}
        onClose={() => setSheetPlans(null)}
        title={sheetPlans && sheetPlans.length > 1 ? `${sheetPlans.length} plans here` : undefined}
      >
        {sheetPlans && sheetPlans.length === 1 ? (
          <View>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetIcon}>{sheetPlans[0].icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{sheetPlans[0].title}</Text>
                <Text style={styles.sheetMeta}>{formatTime(sheetPlans[0].startTime)} · {sheetPlans[0].location}</Text>
              </View>
            </View>
            <Text style={styles.sheetDescription} numberOfLines={3}>{sheetPlans[0].description}</Text>
            <Button label="Interested" onPress={() => openPlan(sheetPlans[0].id)} />
          </View>
        ) : sheetPlans ? (
          <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
            {sheetPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} variant="row" onPress={() => openPlan(plan.id)} />
            ))}
          </ScrollView>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
  title: { fontSize: font.size.xxxl, fontWeight: font.weight.heavy, color: colors.text },
  todayBar: { height: 64, justifyContent: 'center', paddingLeft: spacing.xl },
  todayBarContent: { alignItems: 'center', paddingRight: spacing.xl, gap: spacing.sm },
  todayEmpty: { color: colors.textMuted, fontSize: font.size.sm },
  todayPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, ...shadow.sm, marginRight: spacing.sm,
  },
  todayIcon: { fontSize: 16 },
  todayTitle: { fontSize: font.size.xs, fontWeight: font.weight.bold, color: colors.text, maxWidth: 110 },
  todayTime: { fontSize: 10, color: colors.textMuted },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  sheetIcon: { fontSize: 32 },
  sheetTitle: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  sheetMeta: { fontSize: font.size.sm, color: colors.textMuted, marginTop: 2 },
  sheetDescription: { fontSize: font.size.sm, color: colors.textMuted, marginBottom: spacing.lg },
  sheetList: { maxHeight: 420 },
});
