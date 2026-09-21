// src/components/PlanCard.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, font, radius, shadow, spacing } from '../theme/theme';
import { Plan, formatDateTime, isPlanFull } from '../types/plan';

type Props = {
  plan: Plan;
  onPress: () => void;
  variant?: 'grid' | 'row';
  joined?: boolean;
};

export function PlanCard({ plan, onPress, variant = 'grid', joined }: Props) {
  const kindLabel = plan.kind === 'outing' ? 'Outing' : 'Event';

  if (variant === 'row') {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.row}>
        <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rowIcon}>
          <Text style={styles.rowIconText}>{plan.icon}</Text>
        </LinearGradient>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle} numberOfLines={1}>{plan.title}</Text>
          <Text style={styles.rowMeta} numberOfLines={1}>{formatDateTime(plan.startTime)} · {plan.location}</Text>
        </View>
        <View style={[styles.kindBadge, plan.kind === 'outing' ? styles.outingBadge : styles.eventBadge]}>
          <Text style={[styles.kindBadgeText, plan.kind === 'outing' ? styles.outingBadgeText : styles.eventBadgeText]}>{kindLabel}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.grid}>
      <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gridGradient}>
        <View style={styles.gridTopRow}>
          <View style={[styles.kindBadge, styles.badgeOnGradient]}>
            <Text style={styles.badgeOnGradientText}>{kindLabel}</Text>
          </View>
          {joined ? (
            <View style={styles.joinedBadge}><Text style={styles.joinedBadgeText}>✓</Text></View>
          ) : null}
        </View>
        <Text style={styles.gridIcon}>{plan.icon}</Text>
        <View style={styles.gridBottom}>
          <Text style={styles.gridTitle} numberOfLines={2}>{plan.title}</Text>
          <Text style={styles.gridMeta} numberOfLines={1}>{formatDateTime(plan.startTime)}</Text>
          <Text style={styles.gridMeta} numberOfLines={1}>📍 {plan.location}</Text>
          <View style={styles.gridFooterRow}>
            <Text style={styles.gridFooterText}>{plan.participantIds.length} going</Text>
            {isPlanFull(plan) ? (
              <Text style={styles.gridFooterText}>· Full</Text>
            ) : !plan.isPublic ? (
              <Text style={styles.gridFooterText}>· Private</Text>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  grid: { width: '48%', marginBottom: spacing.lg, borderRadius: radius.lg, ...shadow.sm },
  gridGradient: { borderRadius: radius.lg, padding: spacing.md, minHeight: 168, justifyContent: 'space-between' },
  gridTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  gridIcon: { fontSize: 30, marginVertical: spacing.sm },
  gridBottom: { gap: 2 },
  gridTitle: { color: '#fff', fontSize: font.size.md, fontWeight: font.weight.bold },
  gridMeta: { color: 'rgba(255,255,255,0.88)', fontSize: font.size.xs },
  gridFooterRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  gridFooterText: { color: 'rgba(255,255,255,0.85)', fontSize: font.size.xs, fontWeight: font.weight.semibold },

  kindBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  outingBadge: { backgroundColor: colors.outingLight },
  eventBadge: { backgroundColor: colors.eventLight },
  kindBadgeText: { fontSize: font.size.xs, fontWeight: font.weight.bold },
  outingBadgeText: { color: colors.outing },
  eventBadgeText: { color: colors.event },
  badgeOnGradient: { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeOnGradientText: { color: '#fff', fontSize: font.size.xs, fontWeight: font.weight.bold },
  joinedBadge: { backgroundColor: '#fff', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  joinedBadgeText: { color: colors.success, fontWeight: font.weight.bold, fontSize: font.size.xs },

  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm, ...shadow.sm,
  },
  rowIcon: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  rowIconText: { fontSize: 20 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.text },
  rowMeta: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },
});
