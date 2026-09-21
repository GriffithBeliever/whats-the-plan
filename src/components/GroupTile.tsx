// src/components/GroupTile.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, font, radius, shadow, spacing } from '../theme/theme';
import { Plan } from '../types/plan';
import { Group } from '../types/social';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

type Props = {
  plan: Plan;
  group: Group;
  onPress: () => void;
};

export function GroupTile({ plan, group, onPress }: Props) {
  const last = group.messages[group.messages.length - 1];
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
        <Text style={styles.avatarIcon}>{plan.icon}</Text>
      </LinearGradient>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{plan.title}</Text>
        <Text style={styles.preview} numberOfLines={1}>
          {last ? `${last.senderId === 'me' ? 'You' : last.senderName.split(' ')[0]}: ${last.text}` : 'Say hi to the group 👋'}
        </Text>
      </View>
      {last ? <Text style={styles.time}>{timeAgo(last.createdAt)}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm, ...shadow.sm,
  },
  avatar: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarIcon: { fontSize: 20 },
  body: { flex: 1 },
  title: { fontSize: font.size.base, fontWeight: font.weight.bold, color: colors.text },
  preview: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },
  time: { fontSize: font.size.xs, color: colors.textFaint, marginLeft: spacing.sm },
});
