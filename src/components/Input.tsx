// src/components/Input.tsx
import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, font, radius, spacing } from '../theme/theme';

type Props = {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  secureToggle?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  multiline?: boolean;
  error?: string;
  helper?: string;
  maxLength?: number;
};

export function Input({
  label, value, onChangeText, placeholder, secureTextEntry, secureToggle,
  keyboardType, autoCapitalize = 'sentences', multiline, error, helper, maxLength,
}: Props) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError, multiline && styles.fieldMultiline]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={secureTextEntry && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
        {secureToggle ? (
          <TouchableOpacity onPress={() => setHidden(h => !h)} hitSlop={10}>
            <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.textMuted, marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  fieldFocused: { borderColor: colors.primary },
  fieldError: { borderColor: colors.danger },
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: spacing.sm },
  input: { flex: 1, paddingVertical: 12, fontSize: font.size.base, color: colors.text },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top' },
  toggle: { color: colors.primary, fontWeight: font.weight.semibold, fontSize: font.size.sm },
  error: { color: colors.danger, fontSize: font.size.xs, marginTop: spacing.xs },
  helper: { color: colors.textMuted, fontSize: font.size.xs, marginTop: spacing.xs },
});
