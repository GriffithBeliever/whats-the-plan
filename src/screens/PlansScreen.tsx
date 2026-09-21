// src/screens/PlansScreen.tsx
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/RootStack';
import { usePlans, useMyPlans, useMyGroups } from '../state/AppStateContext';
import { PlanCard } from '../components/PlanCard';
import { GroupTile } from '../components/GroupTile';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { colors, font, spacing } from '../theme/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PlansScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const allPlans = usePlans();
  const myPlans = useMyPlans();
  const myGroups = useMyGroups();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allPlans.filter(p => p.isPublic && (p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)));
  }, [query, allPlans]);

  const sortedGroups = useMemo(() => {
    return [...myGroups].sort((a, b) => {
      const at = a.messages[a.messages.length - 1]?.createdAt ?? '';
      const bt = b.messages[b.messages.length - 1]?.createdAt ?? '';
      return bt.localeCompare(at);
    });
  }, [myGroups]);

  const openPlan = (planId: string) => navigation.navigate('Plan', { planId });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Plans</Text>
      </View>

      <View style={styles.searchWrap}>
        <Input value={query} onChangeText={setQuery} placeholder="🔍 Search events by name or place" />
      </View>

      {query.trim() ? (
        <FlatList
          data={results}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <PlanCard plan={item} variant="row" onPress={() => openPlan(item.id)} />}
          ListEmptyComponent={<EmptyState icon="🔍" title="No plans match your search" subtitle="Try a different name or location." />}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
          <SectionHeader title="My Plans" />
          {myPlans.length === 0 ? (
            <EmptyState icon="🗓️" title="No plans yet" subtitle="Join an event from Search or the Map, or organize your own from Profile." />
          ) : (
            <View style={styles.grid}>
              {myPlans.map(plan => (
                <PlanCard key={plan.id} plan={plan} onPress={() => openPlan(plan.id)} joined />
              ))}
            </View>
          )}

          <View style={styles.groupsSection}>
            <SectionHeader title="Groups" />
            {sortedGroups.length === 0 ? (
              <EmptyState icon="💬" title="No group chats yet" subtitle="Plans with a group chat enabled will show up here." />
            ) : (
              sortedGroups.map(group => {
                const plan = myPlans.find(p => p.id === group.planId);
                if (!plan) return null;
                return (
                  <GroupTile
                    key={group.id}
                    plan={plan}
                    group={group}
                    onPress={() => navigation.navigate('Group', { planId: plan.id })}
                  />
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title: { fontSize: font.size.xxxl, fontWeight: font.weight.heavy, color: colors.text },
  searchWrap: { paddingHorizontal: spacing.xl, marginTop: spacing.md },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  groupsSection: { marginTop: spacing.lg },
});
