// src/components/Chip.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  tone?: 'default' | 'primary' | 'success' | 'muted';
};

export function Chip({ label, selected, onPress, onRemove, tone = 'default' }: Props) {
  const toneStyle = tone === 'primary' ? styles.tonePrimary : tone === 'success' ? styles.toneSuccess : tone === 'muted' ? styles.toneMuted : undefined;
  const toneTextStyle = tone === 'primary' ? styles.toneTextPrimary : tone === 'success' ? styles.toneTextSuccess : undefined;

  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, toneStyle, selected && styles.selected]}
    >
      <Text style={[styles.text, toneTextStyle, selected && styles.selectedText]} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? (
        <TouchableOpacity onPress={onRemove} hitSlop={8} style={styles.remove}>
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontSize: font.size.sm, fontWeight: font.weight.medium },
  selectedText: { color: colors.onPrimary },
  tonePrimary: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  toneTextPrimary: { color: colors.primaryDark },
  toneSuccess: { backgroundColor: colors.successLight, borderColor: colors.successLight },
  toneTextSuccess: { color: colors.success },
  toneMuted: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  remove: { marginLeft: spacing.xs },
  removeText: { color: colors.textMuted, fontSize: font.size.xs },
});
