// src/screens/MapScreen.tsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, ScrollView,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Map } from '@maplibre/maplibre-react-native';
import type {CameraRef} from '@maplibre/maplibre-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MapEvent, CATEGORY_STYLE, formatHour, formatDayLabel } from '../types/map';
import { EventBubble } from '../components/EventBubble';
import { ClusterMarker } from '../components/ClusterMarker';
import { TimeScrubber, buildDaySlots, findTodayIndex } from '../components/TimeScrubber';
import { useClusteredEvents } from '../utils/clusterEvents';

function hoursFromNow(h: number): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + h);
  return d;
}

function dateAt(year: number, month: number, day: number, hour: number): Date {
  return new Date(year, month, day, hour, 0, 0, 0);
}

// Fallback map focus when the user isn't attending any upcoming event — a
// stand-in for real device geolocation, which this app doesn't integrate yet.
const PLACEHOLDER_USER_LOCATION: [number, number] = [35.5018, 33.8938];

// ── Dummy data (unchanged) ──
const EVENTS: MapEvent[] = [
  {
    id: '1', title: 'Rooftop Sunset Sessions', location: 'Mar Mikhael',
    date: hoursFromNow(3), latitude: 33.9010, longitude: 35.5190,
    goingCount: 34,
    circleFriends: [
      { id: 'f1', initials: 'R', color: '#F0997B', textColor: '#4A1B0C' },
      { id: 'f2', initials: 'L', color: '#AFA9EC', textColor: '#26215C' },
    ],
    isNew: false, category: 'nightlife', isAttending: true,
  },
  {
    id: '2', title: 'Old Town Food Crawl', location: 'Gemmayzeh',
    date: hoursFromNow(5), latitude: 33.8955, longitude: 35.5155,
    goingCount: 12, circleFriends: [], isNew: false, category: 'food', isAttending: false,
  },
  {
    id: '3', title: 'Beach Volley Night', location: 'Ramlet el Bayda',
    date: hoursFromNow(1), latitude: 33.8850, longitude: 35.4830,
    goingCount: 21, circleFriends: [], isNew: true, category: 'outdoors', isAttending: true,
  },
  {
    id: '4', title: 'Morning Run Club', location: 'Corniche',
    date: hoursFromNow(27), latitude: 33.9020, longitude: 35.4900,
    goingCount: 8,
    circleFriends: [{ id: 'f3', initials: 'K', color: '#ED93B1', textColor: '#4B1528' }],
    isNew: false, category: 'outdoors', isAttending: false,
  },
  {
    id: '5', title: 'August Beach Bonfire', location: 'Batroun',
    date: dateAt(2026, 7, 8, 20), latitude: 34.2553, longitude: 35.6581,
    goingCount: 27,
    circleFriends: [{ id: 'f4', initials: 'S', color: '#5DCAA5', textColor: '#04342C' }],
    isNew: false, category: 'outdoors', isAttending: false,
  },
  {
    id: '6', title: 'Summer Jazz Night', location: 'Downtown',
    date: dateAt(2026, 7, 15, 21), latitude: 33.8969, longitude: 35.5131,
    goingCount: 18, circleFriends: [], isNew: true, category: 'culture', isAttending: false,
  },
  {
    id: '7', title: 'Midsummer Food Market', location: 'Gemmayzeh',
    date: dateAt(2026, 7, 22, 17), latitude: 33.8955, longitude: 35.5155,
    goingCount: 40,
    circleFriends: [
      { id: 'f5', initials: 'N', color: '#ED93B1', textColor: '#4B1528' },
      { id: 'f6', initials: 'T', color: '#F0997B', textColor: '#4A1B0C' },
    ],
    isNew: false, category: 'food', isAttending: false,
  },
];

// Soonest event (from now) the user has confirmed attendance for, if any.
const upcomingAttendingEvent = EVENTS
  .filter(e => e.isAttending && e.date.getTime() >= Date.now())
  .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null;

const initialCamera = upcomingAttendingEvent
  ? { center: [upcomingAttendingEvent.longitude, upcomingAttendingEvent.latitude] as [number, number], zoom: 15 }
  : { center: PLACEHOLDER_USER_LOCATION, zoom: 12.5 };

const ROW_HEIGHT = 56; // fixed so the list's scroll offset maps exactly to a row index

// ── Compact list row for the day's events ──
function DayEventRow({ event, onPress }: { event: MapEvent; onPress: () => void }) {
  const cat = CATEGORY_STYLE[event.category];
  return (
    <TouchableOpacity style={s.eventRow} activeOpacity={0.7} onPress={onPress}>
      <View style={[s.eventRowIcon, { backgroundColor: cat.bg }]}>
        <MaterialIcons name={cat.icon} size={18} color={cat.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.eventRowTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={s.eventRowMeta}>
          {formatHour(event.date)} · {event.location} · {event.goingCount} going
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

export function MapScreen() {
  const slots = useMemo(() => buildDaySlots(EVENTS), []);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (!upcomingAttendingEvent) return findTodayIndex(slots);
    const idx = slots.findIndex(slot => slot.events.some(e => e.id === upcomingAttendingEvent.id));
    return idx >= 0 ? idx : findTodayIndex(slots);
  });
  const [selected, setSelected] = useState<MapEvent | null>(null);
  const sheetY = useRef(new Animated.Value(300)).current;
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const scrubberOpacity = useRef(new Animated.Value(1)).current;
  const lastBubbleTap = useRef(0);
  const cameraRef = useRef<CameraRef>(null);
  const [zoom, setZoom] = useState(initialCamera.zoom); // matches Camera's initialViewState
  const listScrollRef = useRef<ScrollView>(null);
  const [listHeight, setListHeight] = useState(0);
  const flownRowIndexRef = useRef(-1);

  const visible = slots[selectedIndex]?.events ?? [];
  const { items: clusterItems, getExpansionZoom } = useClusteredEvents(visible, zoom);

  const flyTo = (event: MapEvent) => {
    cameraRef.current?.flyTo({center:[event.longitude, event.latitude], duration:600});
  };

  const flyToCluster = (center: [number, number], clusterId: number) => {
    cameraRef.current?.flyTo({ center, zoom: getExpansionZoom(clusterId), duration: 600 });
  };

  const recenterToMe = () => {
    cameraRef.current?.flyTo({ center: PLACEHOLDER_USER_LOCATION, zoom: 14, duration: 600 });
  };

  const openSheet = (event: MapEvent) => {
    lastBubbleTap.current = Date.now();
    setSelected(event);
    Animated.parallel([
      Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
      Animated.timing(scrimOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(scrubberOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  // list row tap: move the camera AND open the sheet
  const handleListPress = (event: MapEvent) => {
    flyTo(event);
    openSheet(event);
  };

  // scrubbing the day event list: fly the camera to whichever event settles
  // nearest the list's center, once per event (not on every scroll frame)
  const handleListScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (visible.length === 0 || listHeight === 0) return;
    const y = e.nativeEvent.contentOffset.y;
    const center = y + listHeight / 2 - ROW_HEIGHT / 2;
    const idx = Math.max(0, Math.min(visible.length - 1, Math.round(center / ROW_HEIGHT)));
    if (idx !== flownRowIndexRef.current) {
      flownRowIndexRef.current = idx;
      flyTo(visible[idx]);
    }
  };

  // new day selected: reset the list to the top and let it re-sync on next scroll
  useEffect(() => {
    listScrollRef.current?.scrollTo({ y: 0, animated: false });
    flownRowIndexRef.current = -1;
  }, [selectedIndex]);

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
        onRegionIsChanging={e => setZoom(e.nativeEvent.zoom)}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{ center: initialCamera.center, zoom: initialCamera.zoom }}
        />
        {clusterItems.map(item =>
          item.type === 'event' ? (
            <EventBubble
              key={item.event.id}
              event={item.event}
              proximity={1}
              onPress={() => openSheet(item.event)}
              dimmed={!!selected && selected.id !== item.event.id}
            />
          ) : (
            <ClusterMarker
              key={`cluster-${item.id}`}
              center={item.center}
              count={item.events.length}
              onPress={() => {
                lastBubbleTap.current = Date.now();
                flyToCluster(item.center, item.id);
              }}
            />
          ),
        )}
      </Map>

      {/* Day event list — floats above the scrubber */}
      {visible.length > 0 && !selected && (
        <View style={s.listWrap} pointerEvents="box-none">
          <ScrollView
            ref={listScrollRef}
            horizontal={false}
            style={s.listScroll}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
            onLayout={e => setListHeight(e.nativeEvent.layout.height)}
            onScroll={handleListScroll}
            scrollEventThrottle={16}
          >
            {visible.map(event => (
              <DayEventRow key={event.id} event={event} onPress={() => handleListPress(event)} />
            ))}
          </ScrollView>
        </View>
      )}

      {!upcomingAttendingEvent && !selected && (
        <TouchableOpacity style={s.locateBtn} activeOpacity={0.8} onPress={recenterToMe}>
          <MaterialIcons name="my-location" size={22} color="#B91C1C" />
        </TouchableOpacity>
      )}

      <Animated.View
        pointerEvents={selected ? 'none' : 'box-none'}
        style={[s.scrubberSafe, { opacity: scrubberOpacity }]}
      >
        <SafeAreaView edges={['bottom']}>
          <TimeScrubber
            slots={slots}
            selectedIndex={selectedIndex}
            onChange={i => { setSelectedIndex(i); if (selected) closeSheet(); }}
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
            <View style={[s.sheetIcon, { backgroundColor: CATEGORY_STYLE[selected.category].bg }]}>
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

  listWrap: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    maxHeight: 180,
  },
  listScroll: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  listContent: { paddingVertical: 4 },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    paddingHorizontal: 14,
    gap: 10,
  },
  eventRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventRowTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  eventRowMeta: { fontSize: 11, color: '#94A3B8', marginTop: 1 },

  locateBtn: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },

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
