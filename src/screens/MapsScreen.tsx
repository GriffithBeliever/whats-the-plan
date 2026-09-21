// src/screens/MapsScreen.tsx
// A self-contained, illustrated "map": no real basemap/tiles or API key needed
// (there's no real geocoding backend yet either), just plans projected onto a
// textured canvas by their lat/long so the interaction model — markers, a
// scrollable date dial, a today strip — is fully in place and easy to swap
// for a real map SDK later.
import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/RootStack';
import { usePlans, useMyPlans } from '../state/AppStateContext';
import { Plan, formatTime } from '../types/plan';
import { SegmentedControl } from '../components/SegmentedControl';
import { DateDial } from '../components/DateDial';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
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
  const [sheetPlan, setSheetPlan] = useState<Plan | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const basePool = scope === 'mine' ? myPlans : allPlans.filter(p => p.isPublic);

  const dayPlans = useMemo(
    () => basePool.filter(p => sameDay(new Date(p.startTime), selectedDate)),
    [basePool, selectedDate],
  );

  const markers = useMemo(() => {
    if (dayPlans.length === 0 || canvasSize.width === 0) return [];
    const lats = dayPlans.map(p => p.latitude);
    const lngs = dayPlans.map(p => p.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const pad = 36;
    const w = Math.max(1, canvasSize.width - pad * 2);
    const h = Math.max(1, canvasSize.height - pad * 2);
    return dayPlans.map(plan => {
      const nx = maxLng === minLng ? 0.5 : (plan.longitude - minLng) / (maxLng - minLng);
      const ny = maxLat === minLat ? 0.5 : (plan.latitude - minLat) / (maxLat - minLat);
      return { plan, x: pad + nx * w, y: pad + (1 - ny) * h };
    });
  }, [dayPlans, canvasSize]);

  const onCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  };

  const openPlan = (planId: string) => {
    setSheetPlan(null);
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
              <TouchableOpacity key={plan.id} style={styles.todayPill} onPress={() => setSheetPlan(plan)} activeOpacity={0.8}>
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

      <View style={styles.canvas} onLayout={onCanvasLayout}>
        <MapTexture />
        {markers.map(({ plan, x, y }) => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.marker, { left: x - 18, top: y - 18, backgroundColor: plan.gradient[1] }]}
            onPress={() => setSheetPlan(plan)}
            activeOpacity={0.85}
          >
            <Text style={styles.markerIcon}>{plan.icon}</Text>
          </TouchableOpacity>
        ))}
        {dayPlans.length === 0 ? (
          <View style={styles.canvasEmpty} pointerEvents="none">
            <EmptyState icon="🗺️" title="No plans on this day" subtitle="Try another date on the dial below." />
          </View>
        ) : null}
      </View>

      <DateDial onChange={setSelectedDate} />

      <BottomSheet visible={!!sheetPlan} onClose={() => setSheetPlan(null)}>
        {sheetPlan ? (
          <View>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetIcon}>{sheetPlan.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{sheetPlan.title}</Text>
                <Text style={styles.sheetMeta}>{formatTime(sheetPlan.startTime)} · {sheetPlan.location}</Text>
              </View>
            </View>
            <Text style={styles.sheetDescription} numberOfLines={3}>{sheetPlan.description}</Text>
            <Button label="Interested" onPress={() => openPlan(sheetPlan.id)} />
          </View>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}

function MapTexture() {
  const rows = 8;
  const cols = 6;
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <View
          key={`${r}-${c}`}
          style={[
            styles.textureDot,
            { left: `${(c / cols) * 100}%`, top: `${(r / rows) * 100}%`, opacity: (r + c) % 2 === 0 ? 0.5 : 0.25 },
          ]}
        />,
      );
    }
  }
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{dots}</View>;
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
  canvas: {
    flex: 1, marginHorizontal: spacing.xl, marginBottom: spacing.md, borderRadius: radius.xl,
    backgroundColor: '#E7F0EC', overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
  },
  canvasEmpty: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  textureDot: { position: 'absolute', width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#8FB8A3' },
  marker: {
    position: 'absolute', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff', ...shadow.md,
  },
  markerIcon: { fontSize: 16 },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  sheetIcon: { fontSize: 32 },
  sheetTitle: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  sheetMeta: { fontSize: font.size.sm, color: colors.textMuted, marginTop: 2 },
  sheetDescription: { fontSize: font.size.sm, color: colors.textMuted, marginBottom: spacing.lg },
});
