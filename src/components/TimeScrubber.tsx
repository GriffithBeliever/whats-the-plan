// src/components/TimeScrubber.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, PanResponder,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MapEvent, CATEGORY_STYLE, formatDayLabel } from '../types/map';
import { ExpandedCalendar } from './ExpandedCalendar';

const ITEM_WIDTH = 64;
const EXPANDED_HEIGHT = 320;

export type DaySlot = {
  date: Date;
  events: MapEvent[];
};

// spans from just before today to just past the latest event, always including today
export function buildDaySlots(events: MapEvent[]): DaySlot[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDays = events.map(e => {
    const d = new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate());
    return d.getTime();
  });

  const minTime = Math.min(today.getTime(), ...eventDays);
  const maxTime = Math.max(today.getTime(), ...eventDays);

  const start = new Date(minTime);
  start.setDate(start.getDate() - 2);
  const end = new Date(maxTime);
  end.setDate(end.getDate() + 2);

  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  const byDay = new Map<string, MapEvent[]>();
  events.forEach(e => {
    const key = new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate()).toDateString();
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(e);
  });

  const slots: DaySlot[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    slots.push({ date: d, events: byDay.get(d.toDateString()) ?? [] });
  }
  return slots;
}

export function findTodayIndex(slots: DaySlot[]): number {
  const today = new Date().toDateString();
  const idx = slots.findIndex(s => s.date.toDateString() === today);
  return idx >= 0 ? idx : 0;
}

function occupiedIndices(slots: DaySlot[]): number[] {
  return slots.reduce<number[]>((acc, slot, i) => {
    if (slot.events.length > 0) acc.push(i);
    return acc;
  }, []);
}

function closestPrevOccupied(occupied: number[], current: number): number {
  const behind = occupied.filter(i => i < current);
  return behind.length > 0 ? behind[behind.length - 1] : occupied[0];
}

function closestNextOccupied(occupied: number[], current: number): number {
  const ahead = occupied.filter(i => i > current);
  return ahead.length > 0 ? ahead[0] : occupied[occupied.length - 1];
}

type Props = {
  slots: DaySlot[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

export function TimeScrubber({ slots, selectedIndex, onChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const occupied = useRef(occupiedIndices(slots)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const expandProgress = useRef(new Animated.Value(0)).current;
  const progressValueRef = useRef(0);
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const id = expandProgress.addListener(({ value }) => {
      progressValueRef.current = value;
    });
    return () => expandProgress.removeListener(id);
  }, []);

  if (occupied.length === 0) {
    return (
      <View style={s.scrubberEmpty}>
        <Text style={s.scrubberEmptyText}>No upcoming plans nearby yet</Text>
      </View>
    );
  }

  const selected = slots[selectedIndex];
  const sidePadding = trackWidth > 0 ? (trackWidth - ITEM_WIDTH) / 2 : 0;
  const today = new Date();

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * ITEM_WIDTH, animated: true });
    onChange(index);
  };

  // always latches to whichever day lands nearest center — plain paging
  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const rawIndex = Math.max(0, Math.min(slots.length - 1, Math.round(x / ITEM_WIDTH)));
    onChange(rawIndex);
  };

  const animateTo = (target: number, onDone?: () => void) => {
    Animated.spring(expandProgress, {
      toValue: target,
      useNativeDriver: false,
      bounciness: 0,
      speed: 14,
      overshootClamping: true,
    }).start(onDone);
  };

  const collapse = () => animateTo(0, () => setExpanded(false));
  const expand = () => { setExpanded(true); animateTo(1); };
  const toggleExpanded = () => (expanded ? collapse() : expand());

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        expandProgress.stopAnimation();
        setDragging(true);
      },
      onPanResponderMove: (_, g) => {
        const startValue = progressValueRef.current;
        const progress = Math.max(0, Math.min(1, startValue - g.dy / EXPANDED_HEIGHT));
        expandProgress.setValue(progress);
      },
      onPanResponderRelease: (_, g) => {
        setDragging(false);
        const shouldExpand = progressValueRef.current > 0.35 || g.vy < -0.5;
        if (shouldExpand) expand();
        else collapse();
      },
    }),
  ).current;

  const handleSelectDayFromCalendar = (date: Date) => {
    const idx = slots.findIndex(s2 => s2.date.toDateString() === date.toDateString());
    if (idx >= 0) goTo(idx);
    collapse();
  };

  const animatedHeight = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, EXPANDED_HEIGHT],
    extrapolate: 'clamp',
  });

  return (
    <View style={s.root}>
      <Animated.View style={[s.expandedWrap, { height: animatedHeight }]}>
        {(expanded || dragging) && (
          <ExpandedCalendar
            slots={slots}
            selectedDate={selected.date}
            onSelectDay={handleSelectDayFromCalendar}
          />
        )}
      </Animated.View>

      <View {...panResponder.panHandlers} style={s.handleZone}>
        <TouchableOpacity
          onPress={toggleExpanded}
          hitSlop={{ top: 10, bottom: 10, left: 40, right: 40 }}
        >
          <View style={s.handle} />
        </TouchableOpacity>
      </View>

      <View style={s.collapsedWrap}>
        <View style={s.stripRow}>
          <TouchableOpacity
            style={s.jumpBtn}
            onPress={() => goTo(closestPrevOccupied(occupied, selectedIndex))}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-left" size={22} color="#64748B" />
          </TouchableOpacity>

          <View
            style={s.scrubberTrack}
            onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
          >
            {trackWidth > 0 && (
              <>
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
                    const isSelected = i === selectedIndex;
                    const isToday = slot.date.toDateString() === today.toDateString();
                    const categories = Array.from(new Set(slot.events.map(e => e.category)));

                    return (
                      <View key={i} style={s.dayCellWrap}>
                        <Text style={[s.dayWeekday, isSelected && s.dayWeekdayActive]}>
                          {slot.date.toLocaleDateString([], { weekday: 'short' })}
                        </Text>
                        <View
                          style={[
                            s.dayNumWrap,
                            isToday && s.dayNumToday,
                            isSelected && !isToday && s.dayNumSelected,
                          ]}
                        >
                          <Text
                            style={[
                              s.dayNum,
                              isToday && s.dayNumTextToday,
                              isSelected && !isToday && s.dayNumTextSelected,
                            ]}
                          >
                            {slot.date.getDate()}
                          </Text>
                        </View>
                        <View style={s.dayDots}>
                          {categories.slice(0, 3).map((c, ci) => (
                            <View
                              key={ci}
                              style={[s.dayDot, { backgroundColor: CATEGORY_STYLE[c].iconColor }]}
                            />
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
                <View
                  pointerEvents="none"
                  style={[s.scrubberIndicator, { left: trackWidth / 2 - 1 }]}
                />
              </>
            )}
          </View>

          <TouchableOpacity
            style={s.jumpBtn}
            onPress={() => goTo(closestNextOccupied(occupied, selectedIndex))}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-right" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* centered label — always refers to the currently selected day */}
        <View style={s.centerLabel}>
          <Text style={s.centerLabelDay}>{formatDayLabel(selected.date)}</Text>
          <Text style={s.centerLabelSub}>
            {selected.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            {selected.events.length > 0
              ? ` · ${selected.events.length} plan${selected.events.length > 1 ? 's' : ''}`
              : ' · nothing planned'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { backgroundColor: '#fff' },
  expandedWrap: { backgroundColor: '#fff', overflow: 'hidden' },

  handleZone: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: 10 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#CBD5E1' },

  collapsedWrap: { backgroundColor: '#fff' },

  stripRow: { flexDirection: 'row', alignItems: 'center' },
  jumpBtn: { width: 30, height: 70, alignItems: 'center', justifyContent: 'center' },

  scrubberTrack: { flex: 1, height: 70, justifyContent: 'center' },
  dayCellWrap: { width: ITEM_WIDTH, alignItems: 'center' },
  dayWeekday: { fontSize: 11, color: '#94A3B8', marginBottom: 4 },
  dayWeekdayActive: { color: '#111', fontWeight: '600' },
  dayNumWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumToday: { backgroundColor: '#111' },
  dayNumSelected: { backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#B91C1C' },
  dayNum: { fontSize: 16, color: '#111' },
  dayNumTextToday: { color: '#fff', fontWeight: '700' },
  dayNumTextSelected: { color: '#B91C1C', fontWeight: '700' },
  dayDots: { flexDirection: 'row', gap: 3, marginTop: 5, height: 5 },
  dayDot: { width: 5, height: 5, borderRadius: 3 },

  scrubberIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(185,28,28,0.2)',
  },

  centerLabel: { alignItems: 'center', paddingVertical: 12, backgroundColor: '#fff' },
  centerLabelDay: { fontSize: 20, fontWeight: '800', color: '#111' },
  centerLabelSub: { fontSize: 13, color: '#64748B', marginTop: 2 },

  scrubberEmpty: { backgroundColor: '#fff', paddingVertical: 20, alignItems: 'center' },
  scrubberEmptyText: { fontSize: 13, color: '#94A3B8' },
});
