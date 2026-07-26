// src/screens/MapScreen.tsx
import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
  PanResponder, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker, Camera, Map } from '@maplibre/maplibre-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 46;
const HOURS_SPAN = 60;
const WINDOW_HOURS = 2;

// ── Types ──
type Category = 'food' | 'nightlife' | 'outdoors' | 'culture' | 'other';
type Friend = { id: string; initials: string; color: string; textColor: string };

type MapEvent = {
  id: string;
  title: string;
  location: string;
  date: Date;
  latitude: number;
  longitude: number;
  goingCount: number;
  circleFriends: Friend[];
  isNew: boolean;
  category: Category;
};

const CATEGORY_STYLE: Record<Category,
  { bg: string; border: string; icon: string; iconColor: string }
> = {
  food:      { bg: '#FAECE7', border: '#D85A30', icon: 'restaurant',  iconColor: '#712B13' },
  nightlife: { bg: '#EEEDFE', border: '#7F77DD', icon: 'music-note',  iconColor: '#3C3489' },
  outdoors:  { bg: '#EAF3DE', border: '#639922', icon: 'terrain',     iconColor: '#27500A' },
  culture:   { bg: '#E1F5EE', border: '#1D9E75', icon: 'palette',     iconColor: '#085041' },
  other:     { bg: '#F1EFE8', border: '#888780', icon: 'place',       iconColor: '#444441' },
};

function hoursFromNow(h: number): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + h);
  return d;
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
];

const bubbleSize = (count: number) => Math.min(76, Math.max(40, 32 + count * 1.2));

// ── Time scrubber slots ──
type Slot = { date: Date; isDayStart: boolean };

function buildSlots(): Slot[] {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  const slots: Slot[] = [];
  for (let i = 0; i < HOURS_SPAN; i++) {
    const d = new Date(base);
    d.setHours(base.getHours() + i);
    slots.push({ date: d, isDayStart: i === 0 || d.getHours() === 0 });
  }
  return slots;
}

function formatHour(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric' });
}
function formatDayLabel(d: Date): string {
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const tmr = new Date(today);
  tmr.setDate(today.getDate() + 1);
  if (d.toDateString() === tmr.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'short' });
}

function TimeScrubber({
  slots, selectedIndex, onChange,
}: { slots: Slot[]; selectedIndex: number; onChange: (i: number) => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const sidePadding = (SCREEN_WIDTH - ITEM_WIDTH) / 2;
  const selected = slots[selectedIndex];

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.max(0, Math.min(slots.length - 1, Math.round(x / ITEM_WIDTH)));
    onChange(index);
  };

  const jumpToNow = () => {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
    onChange(0);
  };

  return (
    <View>
      <View style={s.scrubberTrack}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: sidePadding }}
          onMomentumScrollEnd={handleMomentumEnd}
          scrollEventThrottle={16}
        >
          {slots.map((slot, i) => {
            const isMajor = slot.date.getHours() % 3 === 0;
            const isSelected = i === selectedIndex;
            return (
              <View key={i} style={s.slot}>
                {slot.isDayStart && (
                  <Text style={s.slotDayMark} numberOfLines={1}>
                    {formatDayLabel(slot.date)}
                  </Text>
                )}
                <View
                  style={[
                    s.slotTick,
                    isMajor && s.slotTickMajor,
                    isSelected && s.slotTickActive,
                  ]}
                />
                {isMajor && (
                  <Text style={[s.slotLabel, isSelected && s.slotLabelActive]}>
                    {formatHour(slot.date)}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
        <View pointerEvents="none" style={s.scrubberIndicator} />
      </View>

      <View style={s.scrubberLabelRow}>
        <View>
          <Text style={s.scrubberDay}>{formatDayLabel(selected.date)}</Text>
          <Text style={s.scrubberHour}>{formatHour(selected.date)}</Text>
        </View>
        {selectedIndex !== 0 && (
          <TouchableOpacity onPress={jumpToNow} style={s.nowPill} activeOpacity={0.8}>
            <Text style={s.nowPillText}>Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Bubble marker ──
function EventBubble({
  event, onPress, dimmed,
}: { event: MapEvent; onPress: () => void; dimmed: boolean }) {
  const size = bubbleSize(event.goingCount);
  const cat = CATEGORY_STYLE[event.category];
  const friends = event.circleFriends;
  const hasFriends = friends.length > 0;
  const shownFriends = friends.slice(0, 2);
  const overflow = friends.length - shownFriends.length;

  return (
    <Marker lngLat={[event.longitude, event.latitude]} onPress={onPress}>
      <View style={[s.bubbleWrap, dimmed && { opacity: 0.55 }]}>
        <View
          style={[
            s.bubble,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: hasFriends ? 3 : 2,
              borderColor: cat.border,
              backgroundColor: cat.bg,
            },
          ]}
        >
          <MaterialIcons name={cat.icon} size={size * 0.34} color={cat.iconColor} />

          <View style={[s.countBadge, { backgroundColor: cat.iconColor }]}>
            <Text style={s.countBadgeText}>{event.goingCount}</Text>
          </View>

          {hasFriends && (
            <View style={s.friendsCluster}>
              {shownFriends.map((f, i) => (
                <View
                  key={f.id}
                  style={[
                    s.friendAvatar,
                    { backgroundColor: f.color, marginLeft: i === 0 ? 0 : -6, zIndex: 2 - i },
                  ]}
                >
                  <Text style={[s.friendInitials, { color: f.textColor }]}>{f.initials}</Text>
                </View>
              ))}
              {overflow > 0 && (
                <View style={[s.friendAvatar, s.friendOverflow, { marginLeft: -6 }]}>
                  <Text style={s.friendOverflowText}>+{overflow}</Text>
                </View>
              )}
            </View>
          )}

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
  const slots = useMemo(buildSlots, []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selected, setSelected] = useState<MapEvent | null>(null);
  const sheetY = useRef(new Animated.Value(300)).current;
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const scrubberOpacity = useRef(new Animated.Value(1)).current;
  const lastBubbleTap = useRef(0);

  const scrubTime = slots[selectedIndex].date;

  const visible = EVENTS.filter(e => {
    const diffHours = Math.abs(e.date.getTime() - scrubTime.getTime()) / 3600000;
    return diffHours <= WINDOW_HOURS;
  });

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
        {visible.map(event => (
          <EventBubble
            key={event.id}
            event={event}
            onPress={() => openSheet(event)}
            dimmed={!!selected && selected.id !== event.id}
          />
        ))}
      </Map>

      {/* Time scrubber — bottom, fades out while sheet is open */}
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

      {/* Scrim */}
      {selected && (
        <Animated.View pointerEvents="none" style={[s.scrim, { opacity: scrimOpacity }]} />
      )}

      {/* Bottom sheet */}
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

  // Time scrubber
  scrubberSafe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrubberTrack: {
    height: 56,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  slot: { width: ITEM_WIDTH, alignItems: 'center' },
  slotDayMark: {
    position: 'absolute',
    top: -18,
    fontSize: 10,
    fontWeight: '700',
    color: '#B91C1C',
    width: 70,
    textAlign: 'center',
  },
  slotTick: {
    width: 2,
    height: 12,
    borderRadius: 1,
    backgroundColor: 'rgba(100,116,139,0.35)',
  },
  slotTickMajor: { height: 18, backgroundColor: 'rgba(71,85,105,0.6)' },
  slotTickActive: { height: 22, backgroundColor: '#B91C1C', width: 3 },
  slotLabel: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  slotLabelActive: { color: '#B91C1C', fontWeight: '700' },
  scrubberIndicator: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 1,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(185,28,28,0.25)',
  },
  scrubberLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  scrubberDay: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  scrubberHour: { fontSize: 22, fontWeight: '800', color: '#111', marginTop: -2 },
  nowPill: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  nowPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  bubbleWrap: { alignItems: 'center' },
  bubble: { alignItems: 'center', justifyContent: 'center', position: 'relative' },

  countBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    minWidth: 18,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 9,
    alignItems: 'center',
  },
  countBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },

  friendsCluster: { position: 'absolute', top: -8, left: -10, flexDirection: 'row' },
  friendAvatar: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendInitials: { fontSize: 7, fontWeight: '700' },
  friendOverflow: { backgroundColor: '#64748B' },
  friendOverflowText: { fontSize: 6, fontWeight: '700', color: '#fff' },

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

  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.25)' },

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
