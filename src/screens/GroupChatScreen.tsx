// src/screens/GroupChatScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput,
  TouchableOpacity, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GroupsStackParamList } from '../navigator/GroupsStack';

type Props = NativeStackScreenProps<GroupsStackParamList, 'GroupChat'>;

// ── Types & dummy data ──
type Message = {
  id: string;
  text: string;
  senderId: string;
  time: string;
};

type Member = { id: string; name: string; avatar: string };

const ME = 'me';

const MEMBERS: Record<string, Member> = {
  me:  { id: 'me',  name: 'You',    avatar: 'https://i.pravatar.cc/100?img=8' },
  u1:  { id: 'u1',  name: 'Rami',   avatar: 'https://i.pravatar.cc/100?img=11' },
  u2:  { id: 'u2',  name: 'Lina',   avatar: 'https://i.pravatar.cc/100?img=5' },
  u3:  { id: 'u3',  name: 'Karim',  avatar: 'https://i.pravatar.cc/100?img=13' },
};

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'Yo who\'s down for Downtown this weekend?', senderId: 'u1', time: '9:41' },
  { id: '2', text: 'I\'m in 🙌', senderId: 'u2', time: '9:42' },
  { id: '3', text: 'Same, what time?', senderId: 'me', time: '9:42' },
  { id: '4', text: 'Was thinking around 8?', senderId: 'u1', time: '9:43' },
  { id: '5', text: 'Works for me. Should we book a table?', senderId: 'u3', time: '9:45' },
  { id: '6', text: 'Yeah I\'ll handle it', senderId: 'me', time: '9:46' },
  { id: '7', text: 'Legend 🔥', senderId: 'u2', time: '9:46' },
];

// ── Message bubble ──
function MessageBubble({ message, showHeader }: { message: Message; showHeader: boolean }) {
  const mine = message.senderId === ME;
  const sender = MEMBERS[message.senderId];

  return (
    <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
      {/* avatar only for others, only on first message of a run */}
      {!mine && (
        <View style={styles.avatarSlot}>
          {showHeader && <Image source={{ uri: sender.avatar }} style={styles.avatar} />}
        </View>
      )}

      <View style={[styles.bubbleCol, mine && { alignItems: 'flex-end' }]}>
        {!mine && showHeader && <Text style={styles.senderName}>{sender.name}</Text>}
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
            {message.text}
          </Text>
        </View>
        <Text style={styles.time}>{message.time}</Text>
      </View>
    </View>
  );
}

// ── Screen ──
export function GroupChatScreen({ navigation, route}: Props) {
  const { groupName } = route.params;
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      senderId: ME,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMessage]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back-ios" size={22} color="#111" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{groupName}</Text>
          <Text style={styles.headerSub}>4 members</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item, index }) => {
            // show name/avatar only when the sender changes from the previous msg
            const prev = messages[index - 1];
            const showHeader = !prev || prev.senderId !== item.senderId;
            return <MessageBubble message={item} showHeader={showHeader} />;
          }}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#94A3B8"
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  headerSub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },

  listContent: { padding: 16, paddingBottom: 8 },

  bubbleRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '100%' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },

  avatarSlot: { width: 32, marginRight: 8, justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16 },

  bubbleCol: { maxWidth: '78%' },
  senderName: { fontSize: 12, color: '#64748B', marginBottom: 3, marginLeft: 4 },

  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleTheirs: { backgroundColor: '#F1F5F9', borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: '#B91C1C', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, color: '#0F172A', lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  time: { fontSize: 11, color: '#CBD5E1', marginTop: 3, marginHorizontal: 4 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  input: {
    flex: 1, maxHeight: 100, minHeight: 44,
    backgroundColor: '#F1F5F9', borderRadius: 22,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    fontSize: 15, color: '#0F172A',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, marginLeft: 8,
    backgroundColor: '#B91C1C',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#CBD5E1' },
  sendIcon: { color: '#fff', fontSize: 18, transform: [{ rotate: '0deg' }] },
});
