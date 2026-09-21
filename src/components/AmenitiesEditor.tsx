// src/components/AmenitiesEditor.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../theme/theme';
import { Chip } from './Chip';
import { Input } from './Input';
import { Button } from './Button';

const SUGGESTIONS = [
  'Free Parking', 'Welcome Drink', 'Live DJ', 'Photo Booth',
  'Goodie Bag', 'Free WiFi', 'Coat Check', 'Shuttle Service',
];

type Props = {
  value: string[];
  onChange: (amenities: string[]) => void;
};

export function AmenitiesEditor({ value, onChange }: Props) {
  const [custom, setCustom] = useState('');

  const toggle = (label: string) => {
    if (value.includes(label)) onChange(value.filter(a => a !== label));
    else onChange([...value, label]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setCustom('');
  };

  return (
    <View>
      <Text style={styles.hint}>Free perks included just for joining.</Text>
      <View style={styles.row}>
        {SUGGESTIONS.map(s => (
          <Chip key={s} label={s} selected={value.includes(s)} onPress={() => toggle(s)} />
        ))}
        {value.filter(v => !SUGGESTIONS.includes(v)).map(customLabel => (
          <Chip key={customLabel} label={customLabel} selected onRemove={() => toggle(customLabel)} />
        ))}
      </View>
      <View style={styles.addRow}>
        <View style={styles.addInput}>
          <Input value={custom} onChangeText={setCustom} placeholder="Add your own…" />
        </View>
        <Button label="Add" variant="secondary" small onPress={addCustom} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: font.size.xs, color: colors.textMuted, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  addInput: { flex: 1 },
});
