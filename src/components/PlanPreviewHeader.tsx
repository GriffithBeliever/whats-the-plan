// src/components/PlanPreviewHeader.tsx
// A read-only "this is what your plan will look like" card, pinned above the
// create-plan form's ScrollView so it's visible no matter which field the
// user is currently editing. Mirrors PlanDetails' hero banner so what's
// previewed here matches what the finished plan screen will actually show.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PlanKind, formatDateTime } from '../types/plan';
import { colors, font, radius, shadow, spacing } from '../theme/theme';

type Props = {
  kind: PlanKind;
  gradient: [string, string];
  icon: string;
  title: string;
  location: string;
  startTime: Date;
};

export function PlanPreviewHeader({ kind, gradient, icon, title, location, startTime }: Props) {
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.topRow}>
        <View style={[styles.kindBadge, kind === 'outing' ? styles.outingBadge : styles.eventBadge]}>
          <Text style={[styles.kindBadgeText, kind === 'outing' ? styles.outingBadgeText : styles.eventBadgeText]}>
            {kind === 'outing' ? '🧑‍🤝‍🧑 Outing' : '🎫 Event'}
          </Text>
        </View>
        <Text style={styles.previewLabel}>PREVIEW</Text>
      </View>

      <Text style={styles.icon}>{icon}</Text>

      <View style={styles.bottomBlock}>
        <Text style={styles.title} numberOfLines={1}>{title.trim() || 'Untitled plan'}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>📅 {formatDateTime(startTime.toISOString())}</Text>
          {location.trim() ? <Text style={styles.meta} numberOfLines={1}>📍 {location.trim()}</Text> : null}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    margin: spacing.xl, marginBottom: spacing.md, borderRadius: radius.xl,
    padding: spacing.lg, height: 168, justifyContent: 'space-between', ...shadow.md,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kindBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  outingBadge: { backgroundColor: colors.outingLight },
  eventBadge: { backgroundColor: colors.eventLight },
  kindBadgeText: { fontWeight: font.weight.bold, fontSize: font.size.xs },
  outingBadgeText: { color: colors.outing },
  eventBadgeText: { color: colors.event },
  previewLabel: {
    color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: font.weight.bold, letterSpacing: 1,
  },
  icon: { fontSize: 44, alignSelf: 'center' },
  bottomBlock: { gap: 4 },
  title: { fontSize: font.size.xl, fontWeight: font.weight.heavy, color: '#fff' },
  metaRow: { flexDirection: 'row', gap: spacing.md },
  meta: { fontSize: font.size.xs, fontWeight: font.weight.medium, color: 'rgba(255,255,255,0.9)', flexShrink: 1 },
});
