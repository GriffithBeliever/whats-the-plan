// src/components/Button.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, font, radius, spacing } from '../theme/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  small?: boolean;
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, icon, style, small }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        small && styles.small,
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon ? <Text style={[styles.icon, small && styles.iconSmall]}>{icon}</Text> : null}
          <Text style={[textVariantStyles[variant], small && styles.textSmall]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { fontSize: font.size.lg },
  iconSmall: { fontSize: font.size.md },
  disabled: { opacity: 0.5 },
  textSmall: { fontSize: font.size.sm },
});

const variantStyles: Record<Variant, ViewStyle> = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceMuted },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: colors.onPrimary, fontWeight: font.weight.bold, fontSize: font.size.md },
  secondary: { color: colors.text, fontWeight: font.weight.bold, fontSize: font.size.md },
  outline: { color: colors.text, fontWeight: font.weight.semibold, fontSize: font.size.md },
  ghost: { color: colors.primary, fontWeight: font.weight.semibold, fontSize: font.size.md },
  danger: { color: colors.onPrimary, fontWeight: font.weight.bold, fontSize: font.size.md },
});
