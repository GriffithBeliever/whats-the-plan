// src/screens/CreatePlanScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/RootStack';
import { colors, font, radius, spacing } from '../theme/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CreatePlanScreen() {
  const navigation = useNavigation<Nav>();
  const [isPublic, setIsPublic] = useState(true);
  const [hasGroupChat, setHasGroupChat] = useState(true);

  const go = (kind: 'CreateOuting' | 'CreateEvent') => navigation.navigate(kind, { isPublic, hasGroupChat });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.settings}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Public plan</Text>
            <Text style={styles.rowSubtitle}>Shows up in Search and the Map for everyone.</Text>
          </View>
          <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Group chat</Text>
            <Text style={styles.rowSubtitle}>Let participants talk with each other.</Text>
          </View>
          <Switch value={hasGroupChat} onValueChange={setHasGroupChat} trackColor={{ true: colors.primary }} />
        </View>
      </View>

      <Text style={styles.prompt}>What are you planning?</Text>

      <View style={styles.choiceRow}>
        <TouchableOpacity style={[styles.choice, styles.outingChoice]} activeOpacity={0.85} onPress={() => go('CreateOuting')}>
          <Text style={styles.choiceIcon}>🧑‍🤝‍🧑</Text>
          <Text style={styles.choiceTitle}>Outing</Text>
          <Text style={styles.choiceSubtitle}>Small friend group{'\n'}(up to 15)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.choice, styles.eventChoice]} activeOpacity={0.85} onPress={() => go('CreateEvent')}>
          <Text style={styles.choiceIcon}>🎫</Text>
          <Text style={styles.choiceTitle}>Event</Text>
          <Text style={styles.choiceSubtitle}>Open to anyone{'\n'}(unlimited)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  settings: { gap: spacing.lg, marginBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  rowTitle: { fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.text },
  rowSubtitle: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },
  prompt: { fontSize: font.size.md, fontWeight: font.weight.semibold, color: colors.text, marginBottom: spacing.md },
  choiceRow: { flex: 1, flexDirection: 'row', gap: spacing.md },
  choice: { flex: 1, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', gap: 6 },
  outingChoice: { backgroundColor: colors.outingLight },
  eventChoice: { backgroundColor: colors.eventLight },
  choiceIcon: { fontSize: 40 },
  choiceTitle: { fontSize: font.size.xl, fontWeight: font.weight.heavy, color: colors.text },
  choiceSubtitle: { fontSize: font.size.xs, color: colors.textMuted, textAlign: 'center' },
});
