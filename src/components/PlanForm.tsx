// src/components/PlanForm.tsx
// Shared body of CreateOutingScreen and CreateEventScreen — identical per the
// guidelines except for participant capacity (capped vs unlimited) and the
// outing-only split-bill toggle.
import React, { useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigator/RootStack';
import { NewPlanInput, useCreatePlan } from '../state/AppStateContext';
import { PlanCard, PlanKind, clampOutingCapacity } from '../types/plan';
import { colors, font, gradients, icons, radius, spacing } from '../theme/theme';
import { Input } from './Input';
import { Button } from './Button';
import { Chip } from './Chip';
import { Stepper } from './Stepper';
import { SegmentedControl } from './SegmentedControl';
import { GradientPicker } from './GradientPicker';
import { EmojiPicker } from './EmojiPicker';
import { AmenitiesEditor } from './AmenitiesEditor';
import { CardsEditor } from './CardsEditor';
import { SectionHeader } from './SectionHeader';
import { PlanPreviewHeader } from './PlanPreviewHeader';
import { LocationPicker } from './LocationPicker';
import { DEFAULT_CENTER } from './MapCanvas';
import { notImplemented } from '../utils/alerts';

type QuickOption = { label: string; dayOffset: number; hour: number };

function daysUntilNextSaturday(): number {
  const day = new Date().getDay(); // 0=Sun..6=Sat
  return (6 - day + 7) % 7;
}

function quickOptions(): QuickOption[] {
  return [
    { label: 'Tonight', dayOffset: 0, hour: 19 },
    { label: 'Tomorrow', dayOffset: 1, hour: 18 },
    { label: 'This Weekend', dayOffset: daysUntilNextSaturday(), hour: 18 },
    { label: 'Next Week', dayOffset: 7, hour: 18 },
  ];
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  kind: PlanKind;
  isPublic: boolean;
  hasGroupChat: boolean;
};

export function PlanForm({ kind, isPublic, hasGroupChat }: Props) {
  const navigation = useNavigation<Nav>();
  const createPlan = useCreatePlan();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dayOffset, setDayOffset] = useState(kind === 'outing' ? 3 : 7);
  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState<'00' | '30'>('00');
  const [gradient, setGradient] = useState(gradients[0]);
  const [icon, setIcon] = useState(icons[0]);
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [splitBillEnabled, setSplitBillEnabled] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [ticketPrice, setTicketPrice] = useState('10');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [cards, setCards] = useState<PlanCard[]>([]);
  const [latitude, setLatitude] = useState(DEFAULT_CENTER[1]);
  const [longitude, setLongitude] = useState(DEFAULT_CENTER[0]);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const startTime = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute === '00' ? 0 : 30, 0, 0);
    return d;
  }, [dayOffset, hour, minute]);

  const titleValid = title.trim().length > 0;
  const locationValid = location.trim().length > 0;
  const canSubmit = titleValid && locationValid;

  const applyQuickOption = (option: QuickOption) => {
    setDayOffset(option.dayOffset);
    setHour(option.hour);
    setMinute('00');
  };

  const submit = () => {
    if (!canSubmit) {
      setSubmitAttempted(true);
      return;
    }
    const input: NewPlanInput = {
      kind,
      title: title.trim(),
      description: description.trim() || `Join us for ${title.trim()} at ${location.trim()}.`,
      location: location.trim(),
      latitude,
      longitude,
      startTime: startTime.toISOString(),
      gradient,
      icon,
      isPublic,
      hasGroupChat,
      maxParticipants: kind === 'outing' ? clampOutingCapacity(maxParticipants) : null,
      splitBillEnabled: kind === 'outing' ? splitBillEnabled : false,
      isPaid,
      ticketPrice: isPaid ? Math.max(0, Number(ticketPrice) || 0) : 0,
      amenities,
      cards,
    };
    const id = createPlan(input);
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'MainTabs' }, { name: 'Plan', params: { planId: id } }],
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <PlanPreviewHeader kind={kind} gradient={gradient} icon={icon} title={title} location={location} startTime={startTime} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Input
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder={kind === 'outing' ? 'Beach Bonfire' : 'Summer Music Festival'}
        required
        error={submitAttempted && !titleValid ? 'Title is required' : undefined}
      />
      <Input label="Description" value={description} onChangeText={setDescription} placeholder="What's the plan?" multiline />
      <Input
        label="Location"
        value={location}
        onChangeText={setLocation}
        placeholder="Where's it happening?"
        required
        error={submitAttempted && !locationValid ? 'Location is required' : undefined}
      />
      <View style={styles.mapField}>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          gradient={gradient}
          icon={icon}
          onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>When</Text>
        <View style={styles.chipRow}>
          {quickOptions().map(option => (
            <Chip
              key={option.label}
              label={option.label}
              selected={dayOffset === option.dayOffset && hour === option.hour}
              onPress={() => applyQuickOption(option)}
            />
          ))}
        </View>
        <Text style={styles.whenManualLabel}>Or set it manually</Text>
        <View style={styles.whenRow}>
          <View style={styles.whenControl}>
            <Text style={styles.whenControlLabel}>Days from now</Text>
            <Stepper value={dayOffset} onChange={setDayOffset} min={0} max={90} />
          </View>
          <View style={styles.whenControl}>
            <Text style={styles.whenControlLabel}>Hour</Text>
            <Stepper value={hour} onChange={setHour} min={0} max={23} />
          </View>
        </View>
        <SegmentedControl value={minute} onChange={setMinute} options={[{ value: '00', label: ':00' }, { value: '30', label: ':30' }]} />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Background</Text>
        <GradientPicker value={gradient} onChange={setGradient} />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Icon</Text>
        <EmojiPicker value={icon} onChange={setIcon} />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Maximum participants</Text>
        {kind === 'outing' ? (
          <Stepper value={maxParticipants} onChange={v => setMaxParticipants(clampOutingCapacity(v))} min={2} max={15} suffix="people" />
        ) : (
          <Text style={styles.unlimitedBadge}>Unlimited</Text>
        )}
      </View>

      {kind === 'outing' ? (
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Split the bill</Text>
            <Text style={styles.fieldHint}>Total cost divides evenly among attendees.</Text>
          </View>
          <Switch value={splitBillEnabled} onValueChange={setSplitBillEnabled} trackColor={{ true: colors.primary }} />
        </View>
      ) : null}

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Paid entry</Text>
          <Text style={styles.fieldHint}>Charge a ticket price to join.</Text>
        </View>
        <Switch value={isPaid} onValueChange={setIsPaid} trackColor={{ true: colors.primary }} />
      </View>

      {isPaid ? (
        <>
          <Input
            label="Ticket price ($)"
            value={ticketPrice}
            onChangeText={t => setTicketPrice(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.paymentRow} onPress={() => notImplemented('Changing your payout method')}>
            <Text style={styles.paymentIcon}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Payment method</Text>
              <Text style={styles.fieldHint}>Demo card •••• 4242 — required so attendees can pay you</Text>
            </View>
            <Text style={styles.paymentChange}>Change</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Complementary amenities" />
        <AmenitiesEditor value={amenities} onChange={setAmenities} />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Cards" />
        <Text style={styles.fieldHint}>Add Service, Item, or Insta-Pay cards for attendees to use.</Text>
        <View style={{ height: spacing.sm }} />
        <CardsEditor cards={cards} onChange={setCards} isPaid={isPaid} />
      </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={kind === 'outing' ? '📣 Broadcast Outing' : '📣 Publish Event'}
          onPress={submit}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 0, paddingBottom: spacing.xxxl },
  mapField: { marginBottom: spacing.lg },
  field: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.text, marginBottom: spacing.sm },
  fieldHint: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  whenManualLabel: { fontSize: font.size.xs, color: colors.textMuted, marginBottom: spacing.sm },
  whenRow: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.md },
  whenControl: { gap: spacing.xs },
  whenControlLabel: { fontSize: font.size.xs, color: colors.textMuted },
  unlimitedBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.eventLight, color: colors.event,
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full,
    fontWeight: font.weight.bold, fontSize: font.size.sm, overflow: 'hidden',
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  paymentRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surfaceMuted,
    padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg,
  },
  paymentIcon: { fontSize: 22 },
  paymentChange: { color: colors.primary, fontWeight: font.weight.semibold, fontSize: font.size.sm },
  section: { marginTop: spacing.md, marginBottom: spacing.lg },
  footer: {
    padding: spacing.xl, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
});
