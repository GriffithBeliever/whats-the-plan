// src/components/TimeScrubber.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, PanResponder,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { MapEvent, CATEGORY_STYLE, formatHour, formatDayLabel } from '../types/map';
import { ExpandedCalendar } from './ExpandedCalendar';

const ITEM_WIDTH = 46;
const HOURS_SPAN = 60;
const SNAP_RADIUS_HOURS = 2;
const EXPANDED_HEIGHT = 320;

export type HourSlot = {
  date: Date;
  isDayStart: boolean;
  events: MapEvent[];
};

export function buildHourSlots(events: MapEvent[]): HourSlot[] {
  const base = new Date();
  base.setMinutes(0, 0, 0);

  const byHourKey = new Map<string, MapEvent[]>();
  events.forEach(e => {
    const key = e.date.toISOString().slice(0, 13);
    if (!byHourKey.has(key)) byHourKey.set(key, []);
    byHourKey.get(key)!.push(e);
  });

  const slots: HourSlot[] = [];
  for (let i = 0; i < HOURS_SPAN; i++) {
    const d = new Date(base);
    d.setHours(base.getHours() + i);
    const key = d.toISOString().slice(0, 13);
    slots.push({
      date: d,
      isDayStart: i === 0 || d.getHours() === 0,
      events: byHourKey.get(key) ?? [],
    });
  }
  return slots;
}

function occupiedIndices(slots: HourSlot[]): number[] {
  return slots.reduce<number[]>((acc, slot, i) => {
    if (slot.events.length > 0) acc.push(i);
    return acc;
  }, []);
}

function nearestOccupied(occupied: number[], target: number): number {
  return occupied.reduce((closest, i) =>
    Math.abs(i - target) < Math.abs(closest - target) ? i : closest,
  occupied[0]);
}

function buildDayCells(slots: HourSlot[]) {
  const byDay = new Map<string, { date: Date; indices: number[] }>();
  slots.forEach((slot, i) => {
    const key = slot.date.toDateString();
    if (!byDay.has(key)) byDay.set(key, { date: slot.date, indices: [] });
    byDay.get(key)!.indices.push(i);
  });
  return Array.from(byDay.values()).map(({ date, indices }) => {
    const categories = new Set<string>();
    let busiestIndex = indices[0];
    let busiestCount = -1;
    indices.forEach(i => {
      slots[i].events.forEach(e => {
        categories.add(e.category);
        if (e.goingCount > busiestCount) {
          busiestCount = e.goingCount;
          busiestIndex = i;
        }
      });
    });
    return { date, categories: Array.from(categories), busiestIndex };
  });
}

// find the busiest hour on a given calendar date, if any
function busiestIndexForDate(slots: HourSlot[], date: Date): number | null {
  let best: number | null = null;
  let bestCount = -1;
  slots.forEach((slot, i) => {
    if (slot.date.toDateString() !== date.toDateString()) return;
    slot.events.forEach(e => {
      if (e.goingCount > bestCount) {
        bestCount = e.goingCount;
        best = i;
      }
    });
  });
  return best;
}

type Props = {
  slots: HourSlot[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

export function TimeScrubber({ slots, selectedIndex, onChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const occupied = useRef(occupiedIndices(slots)).current;
  const dayCells = useRef(buildDayCells(slots)).current;
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

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const rawIndex = Math.max(0, Math.min(slots.length - 1, Math.round(x / ITEM_WIDTH)));
    const nearest = nearestOccupied(occupied, rawIndex);
    const withinSnapRadius = Math.abs(nearest - rawIndex) <= SNAP_RADIUS_HOURS;

    if (withinSnapRadius && nearest !== rawIndex) {
      scrollRef.current?.scrollTo({ x: nearest * ITEM_WIDTH, animated: true });
      onChange(nearest);
    } else {
      onChange(rawIndex);
    }
  };

  // smoother spring, clamped so it never overshoots past 0/1 (which would show negative height)
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
    const idx = busiestIndexForDate(slots, date);
    if (idx != null) goTo(idx);
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dayStrip}>
          {dayCells.map((cell, i) => {
            const isToday = cell.date.toDateString() === today.toDateString();
            return (
              <TouchableOpacity
                key={i}
                style={s.dayCellWrap}
                activeOpacity={0.7}
                onPress={() => goTo(cell.busiestIndex)}
              >
                <Text style={s.dayCellLabel}>
                  {cell.date.toLocaleDateString([], { weekday: 'short' })}
                </Text>
                <View style={[s.dayCell, isToday && s.dayCellToday]}>
                  <Text style={[s.dayCellNum, isToday && s.dayCellNumToday]}>
                    {cell.date.getDate()}
                  </Text>
                </View>
                <View style={s.dayCellDots}>
                  {cell.categories.slice(0, 3).map((c, ci) => (
                    <View
                      key={ci}
                      style={[
                        s.dayDot,
                        { backgroundColor: CATEGORY_STYLE[c as keyof typeof CATEGORY_STYLE].iconColor },
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: sidePadding }}
                onMomentumScrollEnd={handleMomentumEnd}
                scrollEventThrottle={16}
              >
                {slots.map((slot, i) => {
                  const isMajor = slot.date.getHours() % 3 === 0;
                  const isSelected = i === selectedIndex;
                  const hasEvent = slot.events.length > 0;
                  const busiest = hasEvent
                    ? slot.events.reduce((a, b) => (a.goingCount > b.goingCount ? a : b))
                    : null;
                  const eventColor = busiest ? CATEGORY_STYLE[busiest.category].iconColor : null;

                  return (
                    <View key={i} style={s.slot}>
                      {slot.isDayStart && (
                        <Text style={s.slotDayMark} numberOfLines={1}>
                          {formatDayLabel(slot.date)}
                        </Text>
                      )}
                      {hasEvent ? (
                        <View
                          style={[
                            s.eventDot,
                            { backgroundColor: eventColor! },
                            isSelected && s.eventDotActive,
                          ]}
                        >
                          {slot.events.length > 1 && (
                            <Text style={s.eventDotCount}>{slot.events.length}</Text>
                          )}
                        </View>
                      ) : (
                        <View
                          style={[
                            s.slotTick,
                            isMajor && s.slotTickMajor,
                            isSelected && s.slotTickActive,
                          ]}
                        />
                      )}
                      {(isMajor || hasEvent) && (
                        <Text style={[s.slotLabel, isSelected && s.slotLabelActive]}>
                          {formatHour(slot.date)}
                        </Text>
                      )}
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

        <View style={s.scrubberLabelRow}>
          <View>
            <Text style={s.scrubberDay}>{formatDayLabel(selected.date)}</Text>
            <Text style={s.scrubberHour}>
              {formatHour(selected.date)}
              {selected.events.length > 1 ? ` · ${selected.events.length} plans` : ''}
            </Text>
          </View>
          {selectedIndex !== occupied[0] && (
            <TouchableOpacity onPress={() => goTo(occupied[0])} style={s.nowPill} activeOpacity={0.8}>
              <Text style={s.nowPillText}>Earliest</Text>
            </TouchableOpacity>
          )}
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

  dayStrip: { backgroundColor: '#fff', paddingHorizontal: 12, paddingTop: 4 },
  dayCellWrap: { alignItems: 'center', width: 46, marginHorizontal: 3 },
  dayCellLabel: { fontSize: 10, color: '#94A3B8', marginBottom: 3 },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellToday: { backgroundColor: '#111' },
  dayCellNum: { fontSize: 13, color: '#111' },
  dayCellNumToday: { color: '#fff', fontWeight: '700' },
  dayCellDots: { flexDirection: 'row', gap: 2, marginTop: 3, height: 5 },
  dayDot: { width: 4, height: 4, borderRadius: 2 },

  scrubberTrack: { height: 56, justifyContent: 'center', backgroundColor: '#fff' },
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
  slotTick: { width: 2, height: 12, borderRadius: 1, backgroundColor: 'rgba(100,116,139,0.35)' },
  slotTickMajor: { height: 18, backgroundColor: 'rgba(71,85,105,0.6)' },
  slotTickActive: { height: 22, backgroundColor: '#B91C1C', width: 3 },

  eventDot: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  eventDotActive: { width: 22, height: 22, borderRadius: 11 },
  eventDotCount: { fontSize: 8, fontWeight: '700', color: '#fff' },

  slotLabel: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  slotLabelActive: { color: '#111', fontWeight: '700' },
  scrubberIndicator: {
    position: 'absolute',
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
  nowPill: { backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  nowPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  scrubberEmpty: { backgroundColor: '#fff', paddingVertical: 20, alignItems: 'center' },
  scrubberEmptyText: { fontSize: 13, color: '#94A3B8' },
});
