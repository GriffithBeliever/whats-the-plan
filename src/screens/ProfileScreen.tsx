// src/screens/ProfileScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// ── Types & dummy data ──
type ReputationTier = 'Newcomer' | 'Regular' | 'Trusted Host' | 'Community Leader';

type Activity = {
  id: string;
  kind: 'hosted' | 'joined' | 'rated';
  text: string;
  time: string;
};

type ProfileData = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
  bio: string;
  tier: ReputationTier;
  hostRating: number;
  hostedCount: number;
  showUpRate: number;
  activity: Activity[];
};

const MY_PROFILE: ProfileData = {
  id: 'me',
  name: 'John Doe',
  email: 'john.d@hotmail.com',
  avatar: 'https://i.pravatar.cc/150?img=8',
  memberSince: 'Jan 2025',
  bio: 'Always down for a spontaneous plan. Coffee, hikes, late dinners.',
  tier: 'Trusted Host',
  hostRating: 4.6,
  hostedCount: 60,
  showUpRate: 93,
  activity: [
    { id: '1', kind: 'hosted', text: 'Hosted “After Work Chill” in Downtown', time: '2d ago' },
    { id: '2', kind: 'joined', text: 'Joined “Weekend Hike” with University Bros', time: '5d ago' },
    { id: '3', kind: 'rated', text: 'Got a 5★ rating as host', time: '1w ago' },
  ],
};

const OTHER_PROFILE: ProfileData = {
  id: 'u1',
  name: 'Rami Haddad',
  email: '',
  avatar: 'https://i.pravatar.cc/150?img=11',
  memberSince: 'Mar 2025',
  bio: 'Weekend hikes & late dinners. Will always say yes to brunch.',
  tier: 'Regular',
  hostRating: 4.2,
  hostedCount: 14,
  showUpRate: 88,
  activity: [
    { id: '1', kind: 'joined', text: 'Joined “Downtown Night” with WorkFore', time: '1d ago' },
    { id: '2', kind: 'hosted', text: 'Hosted “Sunday Brunch” in Beirut', time: '4d ago' },
    { id: '3', kind: 'rated', text: 'Got a 4★ rating as host', time: '2w ago' },
  ],
};

const TIER_COLOR: Record<ReputationTier, string> = {
  Newcomer: '#64748B',
  Regular: '#0EA5E9',
  'Trusted Host': '#B91C1C',
  'Community Leader': '#9333EA',
};

const ACTIVITY_ICON: Record<Activity['kind'], string> = {
  hosted: 'event-available',
  joined: 'group-add',
  rated: 'star',
};

type Props = {
  isOwnProfile?: boolean;
};

export function ProfileScreen({ isOwnProfile = true }: Props) {
  const data = isOwnProfile ? MY_PROFILE : OTHER_PROFILE;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{data.name}</Text>
            {isOwnProfile && data.email ? (
              <Text style={styles.meta}>{data.email}</Text>
            ) : (
              <Text style={styles.meta}>Member since {data.memberSince}</Text>
            )}
          </View>
          <Image source={{ uri: data.avatar }} style={styles.avatar} />
        </View>

        {/* Bio */}
        <Text style={styles.bio}>{data.bio}</Text>

        {/* Tier */}
        <View style={styles.tierWrap}>
          <View style={[styles.tierBadge, { backgroundColor: TIER_COLOR[data.tier] }]}>
            <MaterialIcons name="verified" size={16} color="#fff" />
            <Text style={styles.tierText}>{data.tier}</Text>
          </View>
        </View>

        {/* Host vs Participant */}
        <View style={styles.repRow}>
          <View style={styles.repCard}>
            <Text style={styles.repLabel}>As Host</Text>
            <Text style={styles.repValue}>{data.hostRating.toFixed(1)}★</Text>
            <Text style={styles.repSub}>{data.hostedCount} events hosted</Text>
          </View>
          <View style={styles.repCard}>
            <Text style={styles.repLabel}>As Participant</Text>
            <Text style={styles.repValue}>{data.showUpRate}%</Text>
            <Text style={styles.repSub}>show-up rate</Text>
          </View>
        </View>

        {/* Primary action */}
        <View style={styles.actionRow}>
          {isOwnProfile ? (
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <MaterialIcons name="edit" size={18} color="#111" />
              <Text style={styles.editText}>Edit profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.primaryAction} activeOpacity={0.8}>
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.primaryActionText}>Invite to a plan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.8}>
                <MaterialIcons name="chat-bubble-outline" size={20} color="#B91C1C" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Recent activity */}
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={styles.activityList}>
          {data.activity.map(item => (
            <View key={item.id} style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <MaterialIcons name={ACTIVITY_ICON[item.kind]} size={18} color="#64748B" />
              </View>
              <Text style={styles.activityText}>{item.text}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 12,
  },
  name: { fontSize: 30, fontWeight: '800', color: '#111' },
  meta: { fontSize: 14, color: '#64748B', marginTop: 4 },
  avatar: { width: 56, height: 56, borderRadius: 28 },

  bio: {
    fontSize: 15, color: '#334155', lineHeight: 22,
    paddingHorizontal: 24, marginTop: 12,
  },

  tierWrap: { paddingHorizontal: 24, marginTop: 16 },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6,
  },
  tierText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  repRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginTop: 16 },
  repCard: {
    flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14,
    padding: 14, alignItems: 'center',
  },
  repLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
  repValue: { fontSize: 26, fontWeight: '800', color: '#111', marginVertical: 4 },
  repSub: { fontSize: 12, color: '#64748B' },

  actionRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginTop: 20 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingVertical: 13, gap: 6,
  },
  editText: { fontSize: 16, fontWeight: '600', color: '#111' },
  primaryAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#B91C1C', borderRadius: 14, paddingVertical: 14, gap: 6,
  },
  primaryActionText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryAction: {
    width: 52, borderWidth: 1.5, borderColor: '#B91C1C', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: '#111',
    paddingHorizontal: 24, marginTop: 28, marginBottom: 12,
  },
  activityList: { paddingHorizontal: 24, paddingBottom: 24 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  activityText: { flex: 1, fontSize: 14, color: '#334155', lineHeight: 20 },
  activityTime: { fontSize: 12, color: '#94A3B8', marginLeft: 8 },
});
