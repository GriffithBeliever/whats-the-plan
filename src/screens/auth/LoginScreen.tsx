// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigator/AuthStack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, font, spacing } from '../../theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    // STUBBED: any phone number "sends" a code
    await new Promise<void>(resolve => setTimeout(resolve, 400));
    setLoading(false);
    navigation.navigate('OTP', { phone: phone.trim() || '+1 555 0100' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.brand}>🎉</Text>
        <Text style={styles.title}>What's the Plan</Text>
        <Text style={styles.subtitle}>Log in to see what's happening around you.</Text>

        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 555 000 0000"
          keyboardType="phone-pad"
          helper="Testing build: any number works, any code works."
        />
        <Button label="Continue" onPress={handleContinue} loading={loading} />

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkText}>New here? Create an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.xxl, justifyContent: 'center' },
  brand: { fontSize: 44, marginBottom: spacing.md },
  title: { fontSize: font.size.display, fontWeight: font.weight.heavy, color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: font.size.md, color: colors.textMuted, marginBottom: spacing.xxl },
  link: { marginTop: spacing.xl, alignItems: 'center' },
  linkText: { color: colors.primary, fontWeight: font.weight.semibold },
});
