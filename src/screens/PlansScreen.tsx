// src/screens/PlansScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Image, ImageBackground, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Dummy data ──
type Plan = {
  id: string;
  title: string;
  subtitle: string;
  daysLeft: number;
  image: string;
};

type Circle = {
  id: string;
  name: string;
  memberCount: number;
  avatars: string[]; // up to 3 shown, rest as +N
};

const PLANS: Plan[] = [
  {
    id: '1',
    title: 'Downtown',
    subtitle: 'After Work Chill',
    daysLeft: 3,
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
  },
  {
    id: '2',
    title: 'Beachside',
    subtitle: 'Sunday Brunch',
    daysLeft: 5,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  },
  {
    id: '3',
    title: 'Mountains',
    subtitle: 'Weekend Hike',
    daysLeft: 8,
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
  },
];

const CIRCLES: Circle[] = [
  {
    id: '1',
    name: 'University Bros',
    memberCount: 8,
    avatars: [
      'https://i.pravatar.cc/100?img=11',
      'https://i.pravatar.cc/100?img=12',
      'https://i.pravatar.cc/100?img=13',
    ],
  },
  {
    id: '2',
    name: 'WorkFore',
    memberCount: 3,
    avatars: [
      'https://i.pravatar.cc/100?img=14',
      'https://i.pravatar.cc/100?img=15',
      'https://i.pravatar.cc/100?img=16',
    ],
  },
];

// ── Components ──
function PlanCard({ plan }: { plan: Plan }) {
  return (
    <View style={styles.cardWrap}>
      <ImageBackground
        source={{ uri: plan.image }}
        style={styles.card}
        imageStyle={styles.cardImage}
      >
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>{plan.title}</Text>
        </View>
      </ImageBackground>
      <Text style={styles.cardSubtitle}>{plan.subtitle}</Text>
      <Text style={styles.cardDays}>{plan.daysLeft} days left</Text>
    </View>
  );
}

function AvatarStack({ avatars, extra }: { avatars: string[]; extra: number }) {
  return (
    <View style={styles.stack}>
      {avatars.map((uri, i) => (
        <Image
          key={i}
          source={{ uri }}
          style={[styles.avatar, { marginLeft: i === 0 ? 0 : -12, zIndex: i }]}
        />
      ))}
      {extra > 0 && (
        <View style={[styles.avatar, styles.avatarExtra, { marginLeft: -12 }]}>
          <Text style={styles.avatarExtraText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

function CircleRow({ circle }: { circle: Circle }) {
  const shown = circle.avatars.slice(0, 3);
  const extra = circle.memberCount - shown.length;
  return (
    <TouchableOpacity style={styles.circleRow} activeOpacity={0.7}>
      <View style={styles.circleInfo}>
        <Text style={styles.circleName}>{circle.name}</Text>
        <Text style={styles.circleMembers}>{circle.memberCount} Members</Text>
      </View>
      <AvatarStack avatars={shown} extra={extra} />
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ── Screen ──
export function PlansScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Plans</Text>

        <Text style={styles.section}>This Week</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </ScrollView>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.sectionTight}>Active Circles</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {CIRCLES.map(circle => (
          <CircleRow key={circle.id} circle={circle} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  h1: {
    fontSize: 32, fontWeight: '800', color: '#111',
    paddingHorizontal: 20, paddingTop: 8,
  },
  section: {
    fontSize: 16, fontWeight: '600', color: '#64748B',
    paddingHorizontal: 20, marginTop: 20, marginBottom: 12,
  },
  sectionTight: {
    fontSize: 16, fontWeight: '700', color: '#111',
  },

  // Carousel
  carousel: { paddingLeft: 20, paddingRight: 8 },
  cardWrap: { marginRight: 16, width: 300 },
  card: { height: 150, justifyContent: 'flex-end' },
  cardImage: { borderRadius: 16 },
  cardOverlay: { padding: 16 },
  cardTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  cardSubtitle: {
    fontSize: 18, fontWeight: '700', color: '#111', marginTop: 12,
  },
  cardDays: { fontSize: 14, color: '#B91C1C', marginTop: 2 },

  // Divider
  divider: {
    height: 1, backgroundColor: '#E2E8F0',
    marginHorizontal: 20, marginTop: 24,
  },

  // Active Circles row header
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 8,
  },
  viewAll: { fontSize: 14, fontWeight: '600', color: '#B91C1C' },

  // Circle rows
  circleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  circleInfo: { flex: 1 },
  circleName: { fontSize: 18, fontWeight: '700', color: '#111' },
  circleMembers: { fontSize: 14, color: '#B91C1C', marginTop: 2 },

  // Avatar stack
  stack: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: '#fff',
  },
  avatarExtra: {
    backgroundColor: '#B91C1C',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarExtraText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chevron: { fontSize: 24, color: '#CBD5E1', fontWeight: '300' },
});
