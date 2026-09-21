// src/components/EmptyState.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../theme/theme';

type Props = {
  icon?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function EmptyState({ icon = '🗒️', title, subtitle, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl },
  icon: { fontSize: 44, marginBottom: spacing.md },
  title: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: font.size.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, maxWidth: 260 },
});
