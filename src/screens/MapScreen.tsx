// src/screens/MapScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker, Camera, Map } from '@maplibre/maplibre-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// ── Types & dummy data ──
type TimeFilter = 'Now' | 'Tonight' | 'Tomorrow' | 'Weekend';

type MapEvent = {
  id: string;
  title: string;
  location: string;
  time: string;
  timeFilter: TimeFilter;
  latitude: number;
  longitude: number;
  goingCount: number;
  circleFriendsGoing: string[];
  isNew: boolean;
};

const EVENTS: MapEvent[] = [
  {
    id: '1',
    title: 'Rooftop Sunset Sessions',
    location: 'Mar Mikhael',
    time: '7:00 PM',
    timeFilter: 'Tonight',
    latitude: 33.9010,
    longitude: 35.5190,
    goingCount: 34,
    circleFriendsGoing: ['Rami', 'Lina'],
    isNew: false,
  },
  {
    id: '2',
    title: 'Old Town Food Crawl',
    location: 'Gemmayzeh',
    time: '8:30 PM',
    timeFilter: 'Tonight',
    latitude: 33.8955,
    longitude: 35.5155,
    goingCount: 12,
    circleFriendsGoing: [],
    isNew: false,
  },
  {
    id: '3',
    title: 'Beach Volley Night',
    location: 'Ramlet el Bayda',
    time: '6:00 PM',
    timeFilter: 'Tonight',
    latitude: 33.8850,
    longitude: 35.4830,
    goingCount: 21,
    circleFriendsGoing: [],
    isNew: true,
  },
  {
    id: '4',
    title: 'Morning Run Club',
    location: 'Corniche',
    time: '7:00 AM',
    timeFilter: 'Tomorrow',
    latitude: 33.9020,
    longitude: 35.4900,
    goingCount: 8,
    circleFriendsGoing: ['Karim'],
    isNew: false,
  },
];

const FILTERS: TimeFilter[] = ['Now', 'Tonight', 'Tomorrow', 'Weekend'];

// bubble diameter scales with attendance, clamped so small events stay visible
const bubbleSize = (count: number) => Math.min(76, Math.max(40, 32 + count * 1.2));

// ── Bubble marker ──
function EventBubble({ event, onPress }: { event: MapEvent; onPress: () => void }) {
  const size = bubbleSize(event.goingCount);
  const hasFriends = event.circleFriendsGoing.length > 0;

  return (
    <Marker lngLat={[event.longitude, event.latitude]} onPress={onPress}>
      <View style={s.bubbleWrap}>
        <View
          style={[
            s.bubble,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: hasFriends ? '#B91C1C' : '#64748B',
              backgroundColor: hasFriends
                ? 'rgba(185,28,28,0.15)'
                : 'rgba(100,116,139,0.15)',
            },
          ]}
        >
          <Text style={[s.bubbleCount, hasFriends && { color: '#B91C1C' }]}>
            {event.goingCount}
          </Text>
          {event.isNew && (
            <View style={s.newBadge}>
              <Text style={s.newBadgeText}>new</Text>
            </View>
          )}
        </View>
        <View style={s.bubbleLabel}>
          <Text style={s.bubbleLabelText} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
      </View>
    </Marker>
  );
}

// ── Screen ──
export function MapScreen() {
  const [filter, setFilter] = useState<TimeFilter>('Tonight');
  const [selected, setSelected] = useState<MapEvent | null>(null);
  const sheetY = useRef(new Animated.Value(300)).current;
  const lastBubbleTap = useRef(0);

  const visible = EVENTS.filter(e => e.timeFilter === filter);

  const openSheet = (event: MapEvent) => {
    lastBubbleTap.current = Date.now();
    setSelected(event);
    Animated.spring(sheetY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetY, {
      toValue: 300,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setSelected(null));
  };

  const handleMapPress = () => {
    // ignore the map-press that can accompany a bubble tap
    if (Date.now() - lastBubbleTap.current < 300) return;
    closeSheet();
  };

  return (
    <View style={s.container}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onPress={handleMapPress}
      >
        <Camera
          initialViewState={{
            center: [35.5018, 33.8938], // [lng, lat]
            zoom: 12.5,
          }}
        />
        {visible.map(event => (
          <EventBubble
            key={event.id}
            event={event}
            onPress={() => openSheet(event)}
          />
        ))}
      </Map>

      {/* Time filter chips */}
      <SafeAreaView edges={['top']} style={s.chipsSafe} pointerEvents="box-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[s.chip, filter === f && s.chipActive]}
              onPress={() => {
                setFilter(f);
                closeSheet();
              }}
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, filter === f && s.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Bottom sheet */}
      {selected && (
        <Animated.View style={[s.sheet, { transform: [{ translateY: sheetY }] }]}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <View style={s.sheetIcon}>
              <MaterialIcons name="local-activity" size={26} color="#B91C1C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sheetTitle}>{selected.title}</Text>
              <Text style={s.sheetMeta}>
                {filter} {selected.time} · {selected.location}
              </Text>
              {selected.circleFriendsGoing.length > 0 && (
                <Text style={s.sheetFriends}>
                  {selected.circleFriendsGoing[0]}
                  {selected.circleFriendsGoing.length > 1 &&
                    ` + ${selected.circleFriendsGoing.length - 1} more`}{' '}
                  from your circles going
                </Text>
              )}
            </View>
          </View>
          <View style={s.sheetActions}>
            <TouchableOpacity style={s.imInBtn} activeOpacity={0.8}>
              <Text style={s.imInText}>I'm in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.shareBtn} activeOpacity={0.8}>
              <MaterialIcons name="share" size={20} color="#B91C1C" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  chipsSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  chipsRow: { paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#fff' },

  bubbleWrap: { alignItems: 'center' },
  bubble: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleCount: { fontSize: 15, fontWeight: '800', color: '#475569' },
  newBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF9F27',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  newBadgeText: { fontSize: 9, fontWeight: '700', color: '#412402' },
  bubbleLabel: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 3,
    maxWidth: 110,
  },
  bubbleLabelText: { fontSize: 10, fontWeight: '600', color: '#111' },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: { flexDirection: 'row', gap: 12 },
  sheetIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: '#111' },
  sheetMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  sheetFriends: {
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '600',
    marginTop: 4,
  },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  imInBtn: {
    flex: 1,
    backgroundColor: '#B91C1C',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  imInText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  shareBtn: {
    width: 52,
    borderWidth: 1.5,
    borderColor: '#B91C1C',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
