// src/screens/GroupsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Image, TextInput, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GroupsStackParamList } from '../navigator/GroupsStack';

type Props = NativeStackScreenProps<GroupsStackParamList, 'GroupsList'>;

// ── Dummy data ──
type Group = {
  id: string;
  name: string;
  description: string;
  image: string;
};

const GROUPS: Group[] = [
  {
    id: '1',
    name: 'Beirut',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting.....',
    image: 'https://images.unsplash.com/photo-1559666126-84f389727b9a?w=200',
  },
  {
    id: '2',
    name: 'Aley',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting.....',
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=200',
  },
  {
    id: '3',
    name: 'Jbeil',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting.....',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200',
  },
  {
    id: '4',
    name: 'Jabal',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting.....',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200',
  },
];

// ── Components ──
function AddGroupRow({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.groupRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.addCircle}>
        <Text style={styles.addPlus}>+</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>Create a group</Text>
        <Text style={styles.groupDesc}>Start a new circle and invite people.</Text>
      </View>
    </TouchableOpacity>
  );
}

function GroupRow({ group, onPress }: { group: Group; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.groupRow} activeOpacity={0.7} onPress={onPress}>
      <Image source={{ uri: group.image }} style={styles.groupImage} />
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupDesc} numberOfLines={2}>{group.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Screen ──
export function GroupsScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');

  const filtered = GROUPS.filter(g =>
    g.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Groups</Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Add group (only when not searching) */}
        {query.length === 0 && <AddGroupRow onPress={() => {}} />}

        {/* Group list */}
        {filtered.map(group => (
          <GroupRow 
            key={group.id} 
            group={group} 
            onPress={() =>
              navigation.navigate('GroupChat', {
                groupId: group.id,
                groupName: group.name,
              })
            }
          />
        ))}

        {filtered.length === 0 && (
          <Text style={styles.empty}>No groups match "{query}"</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  h1: {
    fontSize: 32, fontWeight: '800', color: '#111',
    paddingHorizontal: 20, paddingTop: 8, marginBottom: 16,
  },

  // Search bar
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRadius: 12,
    marginHorizontal: 20, paddingHorizontal: 14, marginBottom: 8,
  },
  searchIcon: { fontSize: 20, color: '#94A3B8', marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: '#0F172A' },

  // Group row (shared by add-row and real rows)
  groupRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  groupImage: { width: 64, height: 64, borderRadius: 32 },
  addCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  addPlus: { fontSize: 32, color: '#94A3B8', fontWeight: '300', marginTop: -2 },
  groupInfo: { flex: 1, marginLeft: 16 },
  groupName: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 2 },
  groupDesc: { fontSize: 14, color: '#64748B', lineHeight: 20 },

  empty: {
    textAlign: 'center', color: '#94A3B8',
    marginTop: 32, fontSize: 14,
  },
});
