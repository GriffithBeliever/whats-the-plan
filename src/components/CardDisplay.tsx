// src/components/CardDisplay.tsx
// The interactive (or greyed-out) presentation of a single PlanCard inside
// PlanScreen / LivePlanScreen. Ordering/queueing itself always works locally
// (there's no real backend yet, so there's nothing to "fail"); only the
// InstaPay purchase and the plan's ticket price go through the payment stub,
// since those are the moments real money would actually move.
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme/theme';
import { ItemCard, PlanCard, ServiceCard, InstaPayCard } from '../types/plan';
import { usePlanActions } from '../state/AppStateContext';
import { paymentStub } from '../utils/alerts';

const CARD_META = {
  service: { icon: '⏳', label: 'Service' },
  item: { icon: '🛍️', label: 'Item' },
  instapay: { icon: '⚡', label: 'Insta-Pay' },
} as const;

type Props = {
  card: PlanCard;
  planId: string;
  joined: boolean;
  isLive: boolean;
};

export function CardDisplay({ card, planId, joined, isLive }: Props) {
  const { orderItem, toggleServiceQueue, claimInstaPay } = usePlanActions();
  const meta = CARD_META[card.kind];
  const canAct = joined && (isLive || card.preorderEnabled);

  return (
    <View style={[styles.card, !joined && styles.cardDimmed]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{meta.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{card.description}</Text>
        </View>
        <Text style={styles.price}>{card.price > 0 ? `$${card.price}` : 'Free'}</Text>
      </View>

      {joined && !canAct ? (
        <Text style={styles.note}>Available for preorder, or once the plan goes live.</Text>
      ) : null}

      {card.kind === 'service' ? (
        <ServiceBody card={card} disabled={!canAct} onToggle={() => toggleServiceQueue(planId, card.id)} />
      ) : card.kind === 'item' ? (
        <ItemBody
          card={card}
          disabled={!canAct}
          onOrder={delta => orderItem(planId, card.id, delta)}
        />
      ) : (
        <InstaPayBody
          card={card}
          disabled={!canAct}
          onBuy={() => {
            if (card.price > 0) paymentStub(card.price, card.title, () => claimInstaPay(planId, card.id));
            else claimInstaPay(planId, card.id);
          }}
        />
      )}

      {!joined ? <View style={styles.lockOverlay} pointerEvents="none" /> : null}
    </View>
  );
}

function ServiceBody({ card, disabled, onToggle }: { card: ServiceCard; disabled: boolean; onToggle: () => void }) {
  const queued = card.myQueuePosition != null;
  return (
    <View style={styles.body}>
      <Text style={styles.meta}>~{card.estimatedWaitMinutes} min wait · {card.queueLength} in queue</Text>
      {queued ? <Text style={styles.metaStrong}>You're #{card.myQueuePosition} in line</Text> : null}
      <TouchableOpacity
        style={[styles.actionBtn, queued && styles.actionBtnOutline, disabled && styles.actionBtnDisabled]}
        disabled={disabled}
        onPress={onToggle}
      >
        <Text style={[styles.actionText, queued && styles.actionTextOutline]}>{queued ? 'Leave Queue' : 'Join Queue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ItemBody({ card, disabled, onOrder }: { card: ItemCard; disabled: boolean; onOrder: (delta: number) => void }) {
  const soldOut = !card.unlimited && (card.quantityRemaining ?? 0) <= 0;
  return (
    <View style={styles.body}>
      <Text style={styles.meta}>
        {card.unlimited ? 'Unlimited' : soldOut ? 'Sold out' : `${card.quantityRemaining} left`}
      </Text>
      <View style={styles.qtyRow}>
        <TouchableOpacity
          style={[styles.qtyBtn, (disabled || card.myOrderedCount <= 0) && styles.actionBtnDisabled]}
          disabled={disabled || card.myOrderedCount <= 0}
          onPress={() => onOrder(-1)}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{card.myOrderedCount}</Text>
        <TouchableOpacity
          style={[styles.qtyBtn, (disabled || soldOut) && styles.actionBtnDisabled]}
          disabled={disabled || soldOut}
          onPress={() => onOrder(1)}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InstaPayBody({ card, disabled, onBuy }: { card: InstaPayCard; disabled: boolean; onBuy: () => void }) {
  return (
    <View style={styles.body}>
      <TouchableOpacity
        style={[styles.actionBtn, (disabled || card.claimed) && styles.actionBtnDisabled]}
        disabled={disabled || card.claimed}
        onPress={onBuy}
      >
        <Text style={styles.actionText}>{card.claimed ? 'Claimed ✓' : 'Buy Now'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  cardDimmed: { opacity: 0.55 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  icon: { fontSize: 20 },
  headerText: { flex: 1 },
  title: { fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.text },
  description: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: font.size.sm, fontWeight: font.weight.bold, color: colors.primary },
  note: { fontSize: font.size.xs, color: colors.warning, marginTop: spacing.sm },
  body: { marginTop: spacing.sm },
  meta: { fontSize: font.size.xs, color: colors.textMuted, marginBottom: spacing.sm },
  metaStrong: { fontSize: font.size.xs, color: colors.primary, fontWeight: font.weight.bold, marginBottom: spacing.sm },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 10, alignItems: 'center' },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  actionBtnDisabled: { opacity: 0.4 },
  actionText: { color: colors.onPrimary, fontWeight: font.weight.bold, fontSize: font.size.sm },
  actionTextOutline: { color: colors.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, alignSelf: 'flex-start' },
  qtyBtn: {
    width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  qtyBtnText: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text },
  qtyValue: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text, minWidth: 20, textAlign: 'center' },
  lockOverlay: { ...StyleSheet.absoluteFill, borderRadius: radius.lg },
});
