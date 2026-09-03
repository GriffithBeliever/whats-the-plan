// src/screens/CreateEventScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PlansStackParamList } from '../navigator/PlansStack';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Category, CATEGORY_STYLE } from '../types/map';

type Props = NativeStackScreenProps<PlansStackParamList, 'CreateEvent'>;

type ThemeSwatch = { id: string; label: string; colors: [string, string] };

const THEMES: ThemeSwatch[] = [
  { id: 'sunset', label: 'Sunset', colors: ['#F97066', '#B91C1C'] },
  { id: 'ocean', label: 'Ocean', colors: ['#38BDF8', '#0E7490'] },
  { id: 'forest', label: 'Forest', colors: ['#84CC16', '#166534'] },
  { id: 'berry', label: 'Berry', colors: ['#E879F9', '#86198F'] },
  { id: 'midnight', label: 'Midnight', colors: ['#334155', '#0F172A'] },
  { id: 'gold', label: 'Gold', colors: ['#FDE68A', '#B45309'] },
];

const CATEGORIES: Category[] = ['food', 'nightlife', 'outdoors', 'culture', 'other'];

const WHEN_OPTIONS = ['Today', 'Tomorrow', 'This Weekend', 'Next Week'];

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function CreateEventScreen({ navigation }: Props) {
  const [theme, setTheme] = useState<ThemeSwatch>(THEMES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('outdoors');
  const [when, setWhen] = useState(WHEN_OPTIONS[0]);
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [descFocused, setDescFocused] = useState(false);

  const cat = CATEGORY_STYLE[category];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back-ios" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Event</Text>
        <View style={s.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Live preview card */}
          <LinearGradient
            colors={theme.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.preview}
          >
            <View style={s.previewTopRow}>
              <View style={s.previewCatChip}>
                <MaterialIcons name={cat.icon} size={14} color="#fff" />
                <Text style={s.previewCatText}>{capitalize(category)}</Text>
              </View>
              <Text style={s.previewWhen}>{when}</Text>
            </View>
            <Text style={s.previewTitle} numberOfLines={2}>
              {title.trim() || 'Your event title'}
            </Text>
            <Text style={s.previewMeta} numberOfLines={1}>
              {location.trim() || 'Add a location'} · up to {capacity} going
            </Text>
          </LinearGradient>

          {/* Theme swatches */}
          <Text style={s.sectionLabel}>Theme</Text>
          <View style={s.swatchRow}>
            {THEMES.map(t => (
              <TouchableOpacity key={t.id} onPress={() => setTheme(t)} activeOpacity={0.8}>
                <LinearGradient
                  colors={t.colors}
                  style={[s.swatch, theme.id === t.id && s.swatchSelected]}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Event title"
            placeholder="Rooftop sunset sessions"
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <View style={s.descContainer}>
            <Text style={s.descLabel}>Description</Text>
            <View style={[s.descWrapper, descFocused && s.descFocused]}>
              <TextInput
                style={s.descInput}
                placeholder="What's the vibe? Who should come?"
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                onFocus={() => setDescFocused(true)}
                onBlur={() => setDescFocused(false)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Category picker */}
          <Text style={s.sectionLabel}>Category</Text>
          <View style={s.chipRow}>
            {CATEGORIES.map(c => {
              const catStyle = CATEGORY_STYLE[c];
              const selected = category === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    s.catChip,
                    { backgroundColor: catStyle.bg, borderColor: selected ? catStyle.border : 'transparent' },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setCategory(c)}
                >
                  <MaterialIcons name={catStyle.icon} size={16} color={catStyle.iconColor} />
                  <Text style={[s.catChipText, { color: catStyle.iconColor }]}>{capitalize(c)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* When */}
          <Text style={s.sectionLabel}>When</Text>
          <View style={s.chipRow}>
            {WHEN_OPTIONS.map(w => (
              <TouchableOpacity
                key={w}
                style={[s.whenChip, when === w && s.whenChipSelected]}
                activeOpacity={0.8}
                onPress={() => setWhen(w)}
              >
                <Text style={[s.whenChipText, when === w && s.whenChipTextSelected]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Location"
            placeholder="Where's it happening?"
            value={location}
            onChangeText={setLocation}
          />

          {/* Capacity stepper */}
          <Text style={s.sectionLabel}>Capacity</Text>
          <View style={s.stepperRow}>
            <TouchableOpacity
              style={s.stepperBtn}
              activeOpacity={0.7}
              onPress={() => setCapacity(c => Math.max(1, c - 5))}
            >
              <MaterialIcons name="remove" size={20} color="#B91C1C" />
            </TouchableOpacity>
            <Text style={s.stepperValue}>{capacity} going</Text>
            <TouchableOpacity
              style={s.stepperBtn}
              activeOpacity={0.7}
              onPress={() => setCapacity(c => c + 5)}
            >
              <MaterialIcons name="add" size={20} color="#B91C1C" />
            </TouchableOpacity>
          </View>

          <Button label="Broadcast" onPress={() => navigation.goBack()} style={s.broadcastBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },

  scrollContent: { padding: 20, paddingBottom: 40 },

  // Live preview
  preview: {
    height: 150,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  previewTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  previewCatText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  previewWhen: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  previewTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  previewMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: '#111',
    marginBottom: 10,
  },

  // Theme swatches
  swatchRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: '#111' },

  // Description
  descContainer: { marginBottom: 16 },
  descLabel: { fontSize: 14, fontWeight: '500', color: '#0F172A', marginBottom: 4 },
  descWrapper: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  descFocused: { borderColor: '#B91C1C' },
  descInput: { fontSize: 16, color: '#0F172A', minHeight: 90 },

  // Category / when chip rows
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  catChipText: { fontSize: 13, fontWeight: '600' },

  whenChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  whenChipSelected: { backgroundColor: '#B91C1C', borderColor: '#B91C1C' },
  whenChipText: { fontSize: 13, fontWeight: '600', color: '#111' },
  whenChipTextSelected: { color: '#fff' },

  // Capacity stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#B91C1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 16, fontWeight: '700', color: '#111', minWidth: 90, textAlign: 'center' },

  broadcastBtn: { marginTop: 4 },
});
