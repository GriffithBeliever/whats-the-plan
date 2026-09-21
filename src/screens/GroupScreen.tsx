// src/screens/GroupScreen.tsx
import React, { useLayoutEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigator/RootStack';
import { useCurrentUser, useGroup, usePlan, usePlanActions } from '../state/AppStateContext';
import { EmptyState } from '../components/EmptyState';
import { colors, font, radius, spacing } from '../theme/theme';

type Route = RouteProp<RootStackParamList, 'Group'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'Group'>;

export function GroupScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const plan = usePlan(params.planId);
  const group = useGroup(params.planId);
  const { sendMessage } = usePlanActions();
  const me = useCurrentUser();
  const [text, setText] = useState('');

  useLayoutEffect(() => {
    if (plan) navigation.setOptions({ title: plan.title });
  }, [navigation, plan]);

  if (!plan || !group) {
    return (
      <View style={styles.center}>
        <EmptyState icon="💬" title="No group chat here" subtitle="This plan doesn't have a group chat." />
      </View>
    );
  }

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(group.id, trimmed);
    setText('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          data={group.messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => {
            const mine = item.senderId === me.id;
            return (
              <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                {!mine ? <Text style={styles.avatar}>{item.senderEmoji}</Text> : null}
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  {!mine ? <Text style={styles.sender}>{item.senderName.split(' ')[0]}</Text> : null}
                  <Text style={[styles.messageText, mine && styles.messageTextMine]}>{item.text}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<EmptyState icon="👋" title="Say hi!" subtitle="Be the first to send a message to the group." />}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message the group…"
            placeholderTextColor={colors.textFaint}
            multiline
          />
          <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={onSend} disabled={!text.trim()}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  messages: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, maxWidth: '85%' },
  bubbleRowMine: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avatar: { fontSize: 20 },
  bubble: { borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  sender: { fontSize: font.size.xs, fontWeight: font.weight.bold, color: colors.primary, marginBottom: 2 },
  messageText: { fontSize: font.size.base, color: colors.text },
  messageTextMine: { color: colors.onPrimary },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, padding: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  input: {
    flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: radius.lg, paddingHorizontal: spacing.md,
    paddingVertical: 10, fontSize: font.size.base, color: colors.text, maxHeight: 100,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendText: { color: colors.onPrimary, fontSize: font.size.md },
});
