// src/screens/auth/OTPScreen.tsx
import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;
const LEN = 6;

export function OTPScreen({ route }: Props) {
  const { phone } = route.params;
  const { signIn } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const refs = useRef<(TextInput | null)[]>([]);

  const onChange = (text: string, i: number) => {
    const c = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits]; next[i] = c; setDigits(next); setError('');
    if (c && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const verify = async () => {
    const code = digits.join('');
    if (code.length < LEN) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    // STUBBED: 123456 is "correct"
    if (code === '123456') {
      await signIn('fake-token-123');   // ← into the app
    } else {
      setError('Incorrect code (try 123456)');
      setDigits(Array(LEN).fill('')); refs.current[0]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>Code sent to {phone}</Text>
        <View style={styles.row}>
          {digits.map((d, i) => (
            <TextInput key={i} ref={r => { refs.current[i] = r; }}
              style={[styles.box, d && styles.boxFilled, !!error && styles.boxError]}
              value={d} onChangeText={t => onChange(t, i)}
              keyboardType="number-pad" maxLength={1} textAlign="center" />
          ))}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button label="Verify" onPress={verify} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 32 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  box: { width: 48, height: 56, borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E2E8F0', backgroundColor: '#fff', fontSize: 22, fontWeight: '700' },
  boxFilled: { borderColor: '#B91C1C' },
  boxError: { borderColor: '#EF4444' },
  error: { color: '#EF4444', textAlign: 'center', marginBottom: 16 },
});
