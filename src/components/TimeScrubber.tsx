// src/components/TimeScrubber.tsx
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { MapEvent, CATEGORY_STYLE, formatHour, formatDayLabel } from '../types/map';

const ITEM_WIDTH = 46;
const HOURS_SPAN = 60;

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

function occupiedInDirection(
  indices: number[],
  target: number,
  velocity: number,
): number {
  if (Math.abs(velocity) < 0.05) {
    return indices.reduce((closest, i) =>
      Math.abs(i - target) < Math.abs(closest - target) ? i : closest,
    indices[0]);
  }

  if (velocity > 0) {
    const ahead = indices.filter(i => i >= target);
    return ahead.length > 0 ? ahead[0] : indices[indices.length - 1];
  } else {
    const behind = indices.filter(i => i <= target);
    return behind.length > 0 ? behind[behind.length - 1] : indices[0];
  }
}

type Props = {
  slots: HourSlot[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

export function TimeScrubber({ slots, selectedIndex, onChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const occupied = useRef(occupiedIndices(slots)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  if (occupied.length === 0) {
    return (
      <View style={s.scrubberEmpty}>
        <Text style={s.scrubberEmptyText}>No upcoming plans nearby yet</Text>
      </View>
    );
  }

  const selected = slots[selectedIndex];
  const sidePadding = trackWidth > 0 ? (trackWidth - ITEM_WIDTH) / 2 : 0;

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const rawIndex = Math.round(x / ITEM_WIDTH);
    const velocity = e.nativeEvent.velocity?.x ?? 0;
    const snapIndex = occupiedInDirection(occupied, rawIndex, velocity);

    const alreadyThere = Math.abs(x - snapIndex * ITEM_WIDTH) < 2;
    if (!alreadyThere) {
      scrollRef.current?.scrollTo({ x: snapIndex * ITEM_WIDTH, animated: true });
    }
    onChange(snapIndex);
  };

  const jumpToFirst = () => {
    const first = occupied[0];
    scrollRef.current?.scrollTo({ x: first * ITEM_WIDTH, animated: true });
    onChange(first);
  };

  return (
    <View>
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
          <TouchableOpacity onPress={jumpToFirst} style={s.nowPill} activeOpacity={0.8}>
            <Text style={s.nowPillText}>Earliest</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
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

  eventDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  nowPill: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  nowPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  scrubberEmpty: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 20,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  scrubberEmptyText: { fontSize: 13, color: '#94A3B8' },
});
