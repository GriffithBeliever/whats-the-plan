// src/components/CardsEditor.tsx
// Used by the CreateOuting/CreateEvent forms to build up a plan's list of
// Service / Item / Insta-Pay cards: a grid of tiles ending in a "+"
// placeholder that opens a type picker, then a form sheet per card kind.
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme/theme';
import { CardKind, InstaPayCard, ItemCard, PlanCard, ServiceCard } from '../types/plan';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Input } from './Input';
import { Stepper } from './Stepper';

const CARD_META: Record<CardKind, { icon: string; label: string; blurb: string }> = {
  service: { icon: '⏳', label: 'Service Card', blurb: 'A queued service, one request per person' },
  item: { icon: '🛍️', label: 'Item Card', blurb: 'A priced item people can order' },
  instapay: { icon: '⚡', label: 'Insta-Pay Card', blurb: 'Buy instantly, skipping the cart' },
};

function emptyCard(kind: CardKind): PlanCard {
  const id = `card-${Date.now()}`;
  const base = { id, title: '', description: '', price: 0, preorderEnabled: true };
  if (kind === 'service') {
    return { ...base, kind: 'service', estimatedWaitMinutes: 10, queueLength: 0, myQueuePosition: null } as ServiceCard;
  }
  if (kind === 'item') {
    return { ...base, kind: 'item', unlimited: true, quantityTotal: null, quantityRemaining: null, myOrderedCount: 0 } as ItemCard;
  }
  return { ...base, kind: 'instapay', preorderEnabled: false, claimed: false } as InstaPayCard;
}

type Props = {
  cards: PlanCard[];
  onChange: (cards: PlanCard[]) => void;
  isPaid: boolean;
};

export function CardsEditor({ cards, onChange, isPaid }: Props) {
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [editing, setEditing] = useState<PlanCard | null>(null);

  const openNew = (kind: CardKind) => {
    setTypeSheetOpen(false);
    setEditing(emptyCard(kind));
  };

  const isNew = (card: PlanCard) => !cards.some(c => c.id === card.id);

  const save = (card: PlanCard) => {
    if (isNew(card)) onChange([...cards, card]);
    else onChange(cards.map(c => (c.id === card.id ? card : c)));
    setEditing(null);
  };

  const remove = (id: string) => {
    onChange(cards.filter(c => c.id !== id));
    setEditing(null);
  };

  return (
    <View>
      <View style={styles.grid}>
        {cards.map(card => (
          <TouchableOpacity key={card.id} style={styles.tile} onPress={() => setEditing(card)} activeOpacity={0.8}>
            <Text style={styles.tileIcon}>{CARD_META[card.kind].icon}</Text>
            <Text style={styles.tileTitle} numberOfLines={1}>{card.title || 'Untitled'}</Text>
            <Text style={styles.tilePrice}>{isPaid && card.price > 0 ? `$${card.price}` : 'Free'}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.placeholder} onPress={() => setTypeSheetOpen(true)} activeOpacity={0.7}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      </View>

      <BottomSheet visible={typeSheetOpen} onClose={() => setTypeSheetOpen(false)} title="Add a card">
        {(Object.keys(CARD_META) as CardKind[]).map(kind => (
          <TouchableOpacity key={kind} style={styles.typeRow} onPress={() => openNew(kind)} activeOpacity={0.7}>
            <Text style={styles.typeIcon}>{CARD_META[kind].icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.typeLabel}>{CARD_META[kind].label}</Text>
              <Text style={styles.typeBlurb}>{CARD_META[kind].blurb}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </BottomSheet>

      <CardFormSheet
        card={editing}
        isPaid={isPaid}
        onClose={() => setEditing(null)}
        onSave={save}
        onRemove={editing && !isNew(editing) ? () => remove(editing.id) : undefined}
      />
    </View>
  );
}

function CardFormSheet({
  card, isPaid, onClose, onSave, onRemove,
}: {
  card: PlanCard | null;
  isPaid: boolean;
  onClose: () => void;
  onSave: (c: PlanCard) => void;
  onRemove?: () => void;
}) {
  const [draft, setDraft] = useState<PlanCard | null>(card);

  React.useEffect(() => setDraft(card), [card]);

  if (!draft) return <BottomSheet visible={false} onClose={onClose}><View /></BottomSheet>;

  const meta = CARD_META[draft.kind];
  const patch = (fields: Partial<PlanCard>) => setDraft({ ...draft, ...fields } as PlanCard);

  return (
    <BottomSheet visible={!!card} onClose={onClose} title={`${meta.icon} ${meta.label}`}>
      <Input label="Title" value={draft.title} onChangeText={t => patch({ title: t })} placeholder="e.g. Welcome Drink" />
      <Input label="Description" value={draft.description} onChangeText={t => patch({ description: t })} placeholder="What does this include?" multiline />

      {isPaid ? (
        <Input
          label="Price ($, 0 = free)"
          value={String(draft.price)}
          onChangeText={t => patch({ price: Math.max(0, Number(t.replace(/[^0-9]/g, '')) || 0) })}
          keyboardType="number-pad"
        />
      ) : null}

      {draft.kind === 'service' ? (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Estimated wait time</Text>
          <Stepper
            value={(draft as ServiceCard).estimatedWaitMinutes}
            onChange={v => patch({ estimatedWaitMinutes: v } as Partial<ServiceCard>)}
            min={5} max={120} step={5} suffix="min"
          />
        </View>
      ) : null}

      {draft.kind === 'item' ? (
        <>
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Unlimited quantity</Text>
            <Switch
              value={(draft as ItemCard).unlimited}
              onValueChange={v => patch({ unlimited: v, quantityTotal: v ? null : 20, quantityRemaining: v ? null : 20 } as Partial<ItemCard>)}
              trackColor={{ true: colors.primary }}
            />
          </View>
          {!(draft as ItemCard).unlimited ? (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Quantity available</Text>
              <Stepper
                value={(draft as ItemCard).quantityTotal ?? 20}
                onChange={v => patch({ quantityTotal: v, quantityRemaining: v } as Partial<ItemCard>)}
                min={1} max={500} step={5}
              />
            </View>
          ) : null}
        </>
      ) : null}

      {draft.kind !== 'instapay' ? (
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Allow preorder</Text>
            <Text style={styles.fieldHint}>Lets attendees reserve this before the plan starts.</Text>
          </View>
          <Switch value={draft.preorderEnabled} onValueChange={v => patch({ preorderEnabled: v })} trackColor={{ true: colors.primary }} />
        </View>
      ) : null}

      <View style={styles.actions}>
        {onRemove ? <Button label="Remove" variant="outline" onPress={onRemove} style={{ flex: 1 }} /> : null}
        <Button
          label="Save"
          onPress={() => onSave(draft)}
          disabled={!draft.title.trim()}
          style={{ flex: 1 }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: 92, height: 92, borderRadius: radius.md, backgroundColor: colors.surfaceMuted,
    borderWidth: 1, borderColor: colors.border, padding: spacing.sm, justifyContent: 'space-between',
  },
  tileIcon: { fontSize: 18 },
  tileTitle: { fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.text },
  tilePrice: { fontSize: font.size.xs, color: colors.textMuted },
  placeholder: {
    width: 92, height: 92, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.borderStrong,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  plus: { fontSize: 28, color: colors.textMuted, fontWeight: font.weight.bold },

  typeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  typeIcon: { fontSize: 24 },
  typeLabel: { fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.text },
  typeBlurb: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },

  field: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.text, marginBottom: spacing.sm },
  fieldHint: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
