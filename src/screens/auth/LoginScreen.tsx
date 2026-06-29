// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigator/AuthStack';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // STUBBED: pretend we verified credentials and got a token
    await new Promise<void>(r => setTimeout(r, 600));
    await signIn('fake-token-123');   // ← this flips the app into MainTabs
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>What's the PLAN</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <Input label="Username" value={username} onChangeText={setUsername}
          placeholder="username" autoCapitalize="none" />
        <Input label="Password" value={password} onChangeText={setPassword}
          placeholder="••••••••" secureTextEntry secureToggle />

        <Button label="Log In" onPress={handleLogin} loading={loading} />

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkText}>No account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#B91C1C', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 32 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#1E3A8A', fontWeight: '600' },
});
