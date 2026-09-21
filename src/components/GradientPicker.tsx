// src/components/GradientPicker.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { gradients } from '../theme/theme';

type Props = {
  value: [string, string];
  onChange: (g: [string, string]) => void;
};

export function GradientPicker({ value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {gradients.map((g, i) => {
        const selected = g[0] === value[0] && g[1] === value[1];
        return (
          <TouchableOpacity key={i} onPress={() => onChange(g)} activeOpacity={0.85}>
            <LinearGradient
              colors={g}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.swatch, selected && styles.selected]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 40, height: 40, borderRadius: 12 },
  selected: { borderWidth: 3, borderColor: '#0F172A' },
});
