// src/screens/MapScreen.tsx
import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Map } from '@maplibre/maplibre-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MapEvent, CATEGORY_STYLE, formatHour, formatDayLabel } from '../types/map';
import { EventBubble } from '../components/EventBubble';
import { TimeScrubber, buildHourSlots } from '../components/TimeScrubber';

const PROXIMITY_HOURS = 4; // events within this range fade in/out by distance

function hoursFromNow(h: number): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + h);
  return d;
}

function dateAt(year: number, month: number, day: number, hour: number): Date {
  return new Date(year, month, day, hour, 0, 0, 0);
}

// ── Dummy data ──
const EVENTS: MapEvent[] = [
  {
    id: '1',
    title: 'Rooftop Sunset Sessions',
    location: 'Mar Mikhael',
    date: hoursFromNow(3),
    latitude: 33.9010,
    longitude: 35.5190,
    goingCount: 34,
    circleFriends: [
      { id: 'f1', initials: 'R', color: '#F0997B', textColor: '#4A1B0C' },
      { id: 'f2', initials: 'L', color: '#AFA9EC', textColor: '#26215C' },
    ],
    isNew: false,
    category: 'nightlife',
  },
  {
    id: '2',
    title: 'Old Town Food Crawl',
    location: 'Gemmayzeh',
    date: hoursFromNow(5),
    latitude: 33.8955,
    longitude: 35.5155,
    goingCount: 12,
    circleFriends: [],
    isNew: false,
    category: 'food',
  },
  {
    id: '3',
    title: 'Beach Volley Night',
    location: 'Ramlet el Bayda',
    date: hoursFromNow(1),
    latitude: 33.8850,
    longitude: 35.4830,
    goingCount: 21,
    circleFriends: [],
    isNew: true,
    category: 'outdoors',
  },
  {
    id: '4',
    title: 'Morning Run Club',
    location: 'Corniche',
    date: hoursFromNow(27),
    latitude: 33.9020,
    longitude: 35.4900,
    goingCount: 8,
    circleFriends: [{ id: 'f3', initials: 'K', color: '#ED93B1', textColor: '#4B1528' }],
    isNew: false,
    category: 'outdoors',
  },
  {
      id: '5',
      title: 'August Beach Bonfire',
      location: 'Batroun',
      date: dateAt(2026, 7, 8, 20), // month is 0-indexed: 7 = August
      latitude: 34.2553,
      longitude: 35.6581,
      goingCount: 27,
      circleFriends: [{ id: 'f4', initials: 'S', color: '#5DCAA5', textColor: '#04342C' }],
      isNew: false,
      category: 'outdoors',
    },
    {
      id: '6',
      title: 'Summer Jazz Night',
      location: 'Downtown',
      date: dateAt(2026, 7, 15, 21),
      latitude: 33.8969,
      longitude: 35.5131,
      goingCount: 18,
      circleFriends: [],
      isNew: true,
      category: 'culture',
    },
    {
      id: '7',
      title: 'Midsummer Food Market',
      location: 'Gemmayzeh',
      date: dateAt(2026, 7, 22, 17),
      latitude: 33.8955,
      longitude: 35.5155,
      goingCount: 40,
      circleFriends: [
        { id: 'f5', initials: 'N', color: '#ED93B1', textColor: '#4B1528' },
        { id: 'f6', initials: 'T', color: '#F0997B', textColor: '#4A1B0C' },
      ],
      isNew: false,
      category: 'food',
    },
];

export function MapScreen() {
  const slots = useMemo(() => buildHourSlots(EVENTS), []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selected, setSelected] = useState<MapEvent | null>(null);
  const sheetY = useRef(new Animated.Value(300)).current;
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const scrubberOpacity = useRef(new Animated.Value(1)).current;
  const lastBubbleTap = useRef(0);

  const scrubTime = slots[selectedIndex]?.date;

  // events within PROXIMITY_HOURS of the scrubbed time, each scored by closeness
  const visibleWithProximity = useMemo(() => {
    if (!scrubTime) return [];
    return EVENTS.map(event => {
      const diffHours = Math.abs(event.date.getTime() - scrubTime.getTime()) / 3600000;
      const proximity = Math.max(0, 1 - diffHours / PROXIMITY_HOURS);
      return { event, proximity };
    }).filter(({ proximity }) => proximity > 0);
  }, [scrubTime]);

  const openSheet = (event: MapEvent) => {
    lastBubbleTap.current = Date.now();
    setSelected(event);
    Animated.parallel([
      Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
      Animated.timing(scrimOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(scrubberOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetY, { toValue: 300, duration: 180, useNativeDriver: true }),
      Animated.timing(scrimOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(scrubberOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => setSelected(null));
  };

  const handleMapPress = () => {
    if (Date.now() - lastBubbleTap.current < 300) return;
    closeSheet();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) sheetY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 80 || gesture.vy > 0.8) {
          closeSheet();
        } else {
          Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={s.container}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onPress={handleMapPress}
      >
        <Camera initialViewState={{ center: [35.5018, 33.8938], zoom: 12.5 }} />
        {visibleWithProximity.map(({ event, proximity }) => (
          <EventBubble
            key={event.id}
            event={event}
            proximity={proximity}
            onPress={() => openSheet(event)}
            dimmed={!!selected && selected.id !== event.id}
          />
        ))}
      </Map>

      <Animated.View
        pointerEvents={selected ? 'none' : 'box-none'}
        style={[s.scrubberSafe, { opacity: scrubberOpacity }]}
      >
        <SafeAreaView edges={['bottom']}>
          <TimeScrubber
            slots={slots}
            selectedIndex={selectedIndex}
            onChange={i => { setSelectedIndex(i); closeSheet(); }}
          />
        </SafeAreaView>
      </Animated.View>

      {selected && (
        <Animated.View pointerEvents="none" style={[s.scrim, { opacity: scrimOpacity }]} />
      )}

      {selected && (
        <Animated.View style={[s.sheet, { transform: [{ translateY: sheetY }] }]}>
          <View {...panResponder.panHandlers} style={s.dragZone}>
            <View style={s.sheetHandle} />
          </View>
          <View style={s.sheetHeader}>
            <View
              style={[s.sheetIcon, { backgroundColor: CATEGORY_STYLE[selected.category].bg }]}
            >
              <MaterialIcons
                name={CATEGORY_STYLE[selected.category].icon}
                size={26}
                color={CATEGORY_STYLE[selected.category].iconColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sheetTitle}>{selected.title}</Text>
              <Text style={s.sheetMeta}>
                {formatDayLabel(selected.date)} {formatHour(selected.date)} · {selected.location}
              </Text>
              {selected.circleFriends.length > 0 && (
                <View style={s.friendsRow}>
                  <MaterialIcons name="group" size={14} color="#B91C1C" />
                  <Text style={s.sheetFriends}>
                    {selected.circleFriends.length === 1
                      ? '1 friend'
                      : `${selected.circleFriends.length} friends`}{' '}
                    from your circles going
                  </Text>
                </View>
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

  scrubberSafe: { position: 'absolute', bottom: 0, left: 0, right: 0 },

  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  dragZone: { paddingTop: 10, paddingBottom: 10, marginHorizontal: -20 },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
  },
  sheetHeader: { flexDirection: 'row', gap: 12 },
  sheetIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: { fontSize: 19, fontWeight: '800', color: '#111' },
  sheetMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  friendsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  sheetFriends: { fontSize: 13, color: '#B91C1C', fontWeight: '600' },
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
