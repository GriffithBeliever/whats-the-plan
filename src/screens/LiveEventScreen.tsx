// src/screens/LiveEventScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import HERO_IMAGE from '../assets/image-test.jpeg';

// Warm desert palette used for the page wash below the hero image.
const PALETTE = {
  accent: '#C2703A',
  accentSoft: '#FBEEDC',
  accentDeep: '#8A4A22',
  base: '#2A1608', // the solid dark tone the page settles into below the hero
};

// ── Types & dummy data ──
type Attendee = { id: string; initials: string; color: string; textColor: string };

type ActivityItem = {
  id: string;
  icon: string;
  text: string;
  time: string;
};

type OrderItem = {
  id: string;
  icon: string;
  label: string;
  price: number;
};

const EVENT = {
  title: 'Dune part three',
  startedAt: '8:00',
  endsIn: '1h 12m',
};

const ATTENDEES: Attendee[] = [
  { id: 'a1', initials: 'R', color: '#F0997B', textColor: '#4A1B0C' },
  { id: 'a2', initials: 'L', color: '#AFA9EC', textColor: '#26215C' },
  { id: 'a3', initials: 'K', color: '#ED93B1', textColor: '#4B1528' },
];
const ATTENDEE_OVERFLOW = 7;

const ACTIVITY: ActivityItem[] = [
  { id: 'ac1', icon: 'local-cafe', text: 'Rami ordered a refill', time: '2m' },
  { id: 'ac2', icon: 'person-add', text: 'Karim checked in', time: '6m' },
  { id: 'ac3', icon: 'local-cafe', text: 'Lina ordered a snack pack', time: '11m' },
];

const ORDER_ITEMS: OrderItem[] = [
  { id: 'o1', icon: 'local-cafe', label: 'Refill drink', price: 3 },
  { id: 'o2', icon: 'icecream', label: 'Snack pack', price: 5 },
];

// ── Components ──
function AttendeeStack() {
  return (
    <View style={s.attendeeRow}>
      {ATTENDEES.map((a, i) => (
        <View
          key={a.id}
          style={[
            s.attendeeAvatar,
            { backgroundColor: a.color, marginLeft: i === 0 ? 0 : -10, zIndex: ATTENDEES.length - i },
          ]}
        >
          <Text style={[s.attendeeInitials, { color: a.textColor }]}>{a.initials}</Text>
        </View>
      ))}
      {ATTENDEE_OVERFLOW > 0 && (
        <View style={[s.attendeeAvatar, s.attendeeOverflow, { marginLeft: -10 }]}>
          <Text style={s.attendeeOverflowText}>+{ATTENDEE_OVERFLOW}</Text>
        </View>
      )}
    </View>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <View style={s.activityRow}>
      <MaterialIcons name={item.icon} size={16} color="rgba(255,255,255,0.7)" />
      <Text style={s.activityText} numberOfLines={1}>{item.text}</Text>
      <Text style={s.activityTime}>{item.time}</Text>
    </View>
  );
}

function OrderCard({ item, onPress }: { item: OrderItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.orderCard} activeOpacity={0.7} onPress={onPress}>
      <MaterialIcons name={item.icon} size={20} color="rgba(255,255,255,0.85)" />
      <Text style={s.orderLabel}>{item.label}</Text>
      <Text style={s.orderPrice}>${item.price}</Text>
    </TouchableOpacity>
  );
}

// ── Screen ──
export function LiveEventScreen() {
  const [checkedIn, setCheckedIn] = useState(false);

  const handleOrder = (item: OrderItem) => {
    // stub — wire to real ordering/payment later
    console.log('ordered', item.label);
  };

  return (
    // Solid base color behind everything — this is what the hero image's
    // bottom gradient blends into, so the wash reads as continuous down
    // the whole screen rather than "image, then a hard cut to a new color".
    <View style={[s.pageBase, { backgroundColor: PALETTE.base }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero image, with a gradient scrim fading INTO the page base color */}
          <ImageBackground source={HERO_IMAGE} style={s.hero} imageStyle={s.heroImage}>
            <LinearGradient
              colors={['transparent', 'transparent', PALETTE.base]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.liveBadge}>
              <View style={s.liveDot} />
              <Text style={s.liveBadgeText}>live now</Text>
            </View>
            <View style={s.heroTextWrap}>
              <Text style={s.heroTitle}>{EVENT.title}</Text>
              <Text style={s.heroMeta}>
                Started {EVENT.startedAt} · ends in {EVENT.endsIn}
              </Text>
            </View>
          </ImageBackground>

          {/* Everything below sits on the same solid base color, no seam */}
          <View style={s.body}>
            <Text style={s.peopleHeading}>
              {ATTENDEES.length + ATTENDEE_OVERFLOW} people here
            </Text>
            <AttendeeStack />

            <Text style={s.sectionTitle}>Right now</Text>
            <View style={s.activityCard}>
              {ACTIVITY.map(item => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </View>

            <Text style={s.sectionTitle}>Order to your seat</Text>
            <View style={s.orderGrid}>
              {ORDER_ITEMS.map(item => (
                <OrderCard key={item.id} item={item} onPress={() => handleOrder(item)} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <TouchableOpacity style={s.splitBtn} activeOpacity={0.8}>
            <Text style={s.splitBtnText}>Split the bill</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.hereBtn, checkedIn && s.hereBtnActive]}
            activeOpacity={0.8}
            onPress={() => setCheckedIn(v => !v)}
          >
            {checkedIn && (
              <MaterialIcons name="check" size={16} color={PALETTE.accentDeep} style={s.hereCheckIcon} />
            )}
            <Text style={[s.hereBtnText, checkedIn && s.hereBtnTextActive]}>
              {checkedIn ? "You're here" : "I'm here"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  pageBase: { flex: 1 },
  safe: { flex: 1 },

  hero: { height: 200, justifyContent: 'flex-end' },
  heroImage: {},
  liveBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#B91C1C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  heroTextWrap: { padding: 16 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroMeta: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  body: { paddingHorizontal: 20, paddingTop: 16 },
  peopleHeading: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 10 },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.9)',
    marginTop: 22, marginBottom: 10,
  },

  attendeeRow: { flexDirection: 'row' },
  attendeeAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#2A1608',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeInitials: { fontSize: 12, fontWeight: '700' },
  attendeeOverflow: { backgroundColor: 'rgba(255,255,255,0.15)' },
  attendeeOverflowText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },

  activityCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  activityText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  activityTime: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },

  orderGrid: { flexDirection: 'row', gap: 10 },
  orderCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 6,
  },
  orderLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  orderPrice: { fontSize: 13, fontWeight: '700', color: '#FBEEDC' },

  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  splitBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingVertical: 13,
  },
  splitBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  hereBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBEEDC',
    borderRadius: 14,
    paddingVertical: 13,
  },
  hereBtnActive: { backgroundColor: 'rgba(255,255,255,0.9)' },
  hereCheckIcon: { marginRight: 4 },
  hereBtnText: { fontSize: 14, fontWeight: '700', color: '#8A4A22' },
  hereBtnTextActive: { color: '#8A4A22' },
});
