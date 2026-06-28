// src/screens/auth/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    // STUBBED: pretend we created the user and triggered an OTP send
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    navigation.navigate('OTP', { phone });   // verification comes next
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Sign Up</Text>
        <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        <Input label="Username" value={username} onChangeText={setUsername}
          placeholder="username" autoCapitalize="none" />
        <Input label="Phone Number" value={phone} onChangeText={setPhone}
          placeholder="+961 ..." keyboardType="phone-pad" />
        <Input label="Password" value={password} onChangeText={setPassword}
          placeholder="••••••••" secureTextEntry secureToggle />
        <Button label="Sign Up" onPress={handleSignUp} loading={loading} />
        <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 24, paddingTop: 48 },
  title: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 24 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#B91C1C', fontWeight: '600' },
});
