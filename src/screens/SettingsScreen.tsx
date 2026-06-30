// src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export function SettingsScreen() {
  const { signOut } = useAuth();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Your settings will live here.</Text>
        <Button label="Log out" onPress={signOut} variant="outline" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 32 },
});
