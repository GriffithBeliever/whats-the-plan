// src/screens/ProfileScreen.tsx
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/RootStack';
import { useCurrentUser, useOrganizedPlans, useMyPlans } from '../state/AppStateContext';
import { Avatar } from '../components/Avatar';
import { PlanCard } from '../components/PlanCard';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { notImplemented } from '../utils/alerts';
import { colors, font, spacing } from '../theme/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const user = useCurrentUser();
  const myPlans = useMyPlans();
  const organized = useOrganizedPlans();
  const { signOut } = useAuth();

  const recent = useMemo(
    () => [...myPlans].sort((a, b) => b.startTime.localeCompare(a.startTime)).slice(0, 3),
    [myPlans],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => notImplemented('Editing your cover photo')}>
          <LinearGradient colors={user.bannerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner} />
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => notImplemented('Editing your profile photo')}>
            <Avatar emoji={user.avatarEmoji} gradient={user.avatarGradient} size={84} ring />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.bio}>{user.bio}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{myPlans.length}</Text>
            <Text style={styles.statLabel}>Plans</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{organized.length}</Text>
            <Text style={styles.statLabel}>Organized</Text>
          </View>
        </View>

        <Button label="✨ Organize a Plan" onPress={() => navigation.navigate('CreatePlan')} style={styles.organizeBtn} />

        <View style={styles.section}>
          <SectionHeader title="Recent Events" />
          {recent.length === 0 ? (
            <EmptyState icon="🎈" title="No recent events" subtitle="Plans you organize or join will show up here." />
          ) : (
            recent.map(plan => (
              <PlanCard key={plan.id} plan={plan} variant="row" onPress={() => navigation.navigate('Plan', { planId: plan.id })} />
            ))
          )}
        </View>

        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  banner: { height: 130, width: '100%' },
  headerRow: { paddingHorizontal: spacing.xl, marginTop: -42 },
  name: { fontSize: font.size.xxl, fontWeight: font.weight.heavy, color: colors.text, marginTop: spacing.md, marginHorizontal: spacing.xl },
  username: { fontSize: font.size.sm, color: colors.textMuted, marginHorizontal: spacing.xl, marginTop: 2 },
  bio: { fontSize: font.size.sm, color: colors.textMuted, marginHorizontal: spacing.xl, marginTop: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.xxl, marginHorizontal: spacing.xl, marginTop: spacing.lg },
  stat: { alignItems: 'flex-start' },
  statNumber: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  statLabel: { fontSize: font.size.xs, color: colors.textMuted },
  organizeBtn: { marginHorizontal: spacing.xl, marginTop: spacing.xl },
  section: { marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  signOut: { alignItems: 'center', marginTop: spacing.xl },
  signOutText: { color: colors.danger, fontWeight: font.weight.semibold },
});
