// src/components/Stepper.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme/theme';

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
};

export function Stepper({ value, onChange, min = 0, max = 999, step = 1, suffix }: Props) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.btn, value <= min && styles.btnDisabled]}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - step))}
      >
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{value}{suffix ? ` ${suffix}` : ''}</Text>
      <TouchableOpacity
        style={[styles.btn, value >= max && styles.btnDisabled]}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + step))}
      >
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  btn: {
    width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  value: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.text, minWidth: 60, textAlign: 'center' },
});
