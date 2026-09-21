// src/components/PlanDetails.tsx
// Shared by PlanScreen and LivePlanScreen — per the guidelines these are the
// same view, just gated by whether the plan is currently live.
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/RootStack';
import { Plan, formatDateTime, isPlanFull, isPlanLive, ItemCard } from '../types/plan';
import { useCurrentUser, useIsJoined, usePlanActions, useUserById } from '../state/AppStateContext';
import { useNowTick } from '../utils/useNowTick';
import { Avatar } from '../components/Avatar';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { CardDisplay } from '../components/CardDisplay';
import { SectionHeader } from '../components/SectionHeader';
import { colors, font, radius, spacing } from '../theme/theme';
import { paymentStub } from '../utils/alerts';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PlanDetails({ plan }: { plan: Plan }) {
  const navigation = useNavigation<Nav>();
  const me = useCurrentUser();
  const joined = useIsJoined(plan.id);
  const organizer = useUserById(plan.organizerId);
  const { joinPlan } = usePlanActions();
  const now = useNowTick();
  const isLive = isPlanLive(plan, now);
  const full = isPlanFull(plan);

  const pendingTotal = useMemo(
    () => plan.cards.reduce((sum, c) => (c.kind === 'item' && c.price > 0 ? sum + c.price * (c as ItemCard).myOrderedCount : sum), 0),
    [plan.cards],
  );

  const handleJoin = () => {
    if (plan.isPaid && plan.ticketPrice > 0) {
      paymentStub(plan.ticketPrice, plan.title, () => joinPlan(plan.id));
    } else {
      joinPlan(plan.id);
    }
  };

  const handlePay = () => paymentStub(pendingTotal, `${plan.title} order`, () => {});

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={[styles.kindBadge, plan.kind === 'outing' ? styles.outingBadge : styles.eventBadge]}>
            <Text style={[styles.kindBadgeText, plan.kind === 'outing' ? styles.outingBadgeText : styles.eventBadgeText]}>
              {plan.kind === 'outing' ? '🧑‍🤝‍🧑 Outing' : '🎫 Event'}
            </Text>
          </View>
          {isLive ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.heroIcon}>{plan.icon}</Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.title}>{plan.title}</Text>

        <TouchableOpacity style={styles.organizerRow} activeOpacity={0.7}>
          <Avatar emoji={organizer.avatarEmoji} gradient={organizer.avatarGradient} size={28} />
          <Text style={styles.organizerText}>
            Organized by {organizer.id === me.id ? 'you' : organizer.name}
          </Text>
        </TouchableOpacity>

        <View style={styles.metaBlock}>
          <Text style={styles.metaRow}>📅 {formatDateTime(plan.startTime)}</Text>
          <Text style={styles.metaRow}>📍 {plan.location}</Text>
          <Text style={styles.metaRow}>
            👥 {plan.participantIds.length}{plan.maxParticipants ? ` / ${plan.maxParticipants}` : ''} going{full ? ' · Full' : ''}
          </Text>
          <Text style={styles.metaRow}>{plan.isPaid && plan.ticketPrice > 0 ? `🎟️ $${plan.ticketPrice} entry` : '🎟️ Free entry'}</Text>
          {!plan.isPublic ? <Text style={styles.metaRow}>🔒 Private plan</Text> : null}
          {plan.splitBillEnabled ? <Text style={styles.metaRow}>🧾 Bill split among attendees</Text> : null}
        </View>

        <Text style={styles.description}>{plan.description}</Text>

        {plan.amenities.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="What's included" />
            <View style={styles.chipRow}>
              {plan.amenities.map(a => <Chip key={a} label={a} tone="primary" />)}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title={plan.kind === 'outing' ? 'Cards' : 'At this event'} />
          {plan.cards.map(card => (
            <CardDisplay key={card.id} card={card} planId={plan.id} joined={joined} isLive={isLive} />
          ))}
          {!joined ? <Text style={styles.lockedNote}>Join to order, preorder, or queue for these.</Text> : null}
        </View>

        {joined && plan.hasGroupChat ? (
          <Button
            label="💬 Open Group Chat"
            variant="secondary"
            onPress={() => navigation.navigate('Group', { planId: plan.id })}
            style={styles.groupBtn}
          />
        ) : null}
      </View>

      <View style={styles.footer}>
        {!joined ? (
          <Button
            label={full ? 'Plan is Full' : plan.isPaid && plan.ticketPrice > 0 ? `Join · $${plan.ticketPrice}` : 'Join Plan'}
            onPress={handleJoin}
            disabled={full}
          />
        ) : (
          <>
            <View style={styles.joinedPill}>
              <Text style={styles.joinedPillText}>🎉 You're in</Text>
            </View>
            {pendingTotal > 0 ? (
              <Button label={`Pay Now — $${pendingTotal}`} onPress={handlePay} style={styles.payBtn} />
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxxl },
  hero: { height: 180, padding: spacing.lg, justifyContent: 'space-between' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heroIcon: { fontSize: 56, alignSelf: 'center' },
  kindBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  outingBadge: { backgroundColor: colors.outingLight },
  eventBadge: { backgroundColor: colors.eventLight },
  kindBadgeText: { fontWeight: font.weight.bold, fontSize: font.size.xs },
  outingBadgeText: { color: colors.outing },
  eventBadgeText: { color: colors.event },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.live },
  liveText: { color: '#fff', fontWeight: font.weight.bold, fontSize: font.size.xs },
  body: { padding: spacing.xl },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.heavy, color: colors.text },
  organizerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  organizerText: { fontSize: font.size.sm, color: colors.textMuted, fontWeight: font.weight.medium },
  metaBlock: { marginTop: spacing.lg, gap: 6 },
  metaRow: { fontSize: font.size.sm, color: colors.text },
  description: { fontSize: font.size.sm, color: colors.textMuted, marginTop: spacing.lg, lineHeight: 20 },
  section: { marginTop: spacing.xxl },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  lockedNote: { fontSize: font.size.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
  groupBtn: { marginTop: spacing.lg },
  footer: { paddingHorizontal: spacing.xl, gap: spacing.md },
  joinedPill: { backgroundColor: colors.successLight, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center' },
  joinedPillText: { color: colors.success, fontWeight: font.weight.bold, fontSize: font.size.md },
  payBtn: {},
});
