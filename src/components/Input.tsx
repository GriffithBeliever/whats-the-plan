// src/components/Input.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  secureToggle?: boolean;
}

export function Input({
  label,
  error,
  secureToggle = false,
  secureTextEntry,
  ...rest
}: InputProps) {
  const [secure, setSecure] = useState(secureTextEntry ?? false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.wrapper, focused && styles.focused, !!error && styles.errorBorder]}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          {...rest}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setSecure(s => !s)} hitSlop={8}>
            <Text style={styles.toggle}>{secure ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#0F172A', marginBottom: 4 },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  focused: { borderColor: '#B91C1C' },
  errorBorder: { borderColor: '#EF4444' },
  input: { flex: 1, height: 52, fontSize: 16, color: '#0F172A' },
  toggle: { fontSize: 14, color: '#B91C1C', fontWeight: '500' },
  error: { fontSize: 12, color: '#EF4444', marginTop: 4 },
});
