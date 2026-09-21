// src/components/EmojiPicker.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius } from '../theme/theme';
import { icons } from '../theme/theme';

type Props = {
  value: string;
  onChange: (icon: string) => void;
};

export function EmojiPicker({ value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {icons.map(icon => {
        const selected = icon === value;
        return (
          <TouchableOpacity
            key={icon}
            onPress={() => onChange(icon)}
            style={[styles.cell, selected && styles.selected]}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{icon}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent',
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  emoji: { fontSize: 20 },
});
