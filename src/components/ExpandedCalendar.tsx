// src/components/ExpandedCalendar.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { MapEvent, CATEGORY_STYLE } from '../types/map';
import { HourSlot } from './TimeScrubber';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MONTHS_RANGE = 3;

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function monthDiff(a: Date, b: Date) {
  return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());
}

function buildMonthGrid(monthDate: Date, slots: HourSlot[]) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = new Map<number, MapEvent[]>();
  slots.forEach(slot => {
    if (slot.date.getFullYear() === year && slot.date.getMonth() === month) {
      const dom = slot.date.getDate();
      if (slot.events.length > 0) {
        eventsByDate.set(dom, [...(eventsByDate.get(dom) ?? []), ...slot.events]);
      }
    }
  });

  const cells: { day: number | null; events: MapEvent[] }[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ day: null, events: [] });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, events: eventsByDate.get(d) ?? [] });

  return { cells, monthLabel: monthDate.toLocaleDateString([], { month: 'long', year: 'numeric' }) };
}

function useStableArray<T>(init: () => T[]): T[] {
  const ref = useRef<T[] | null>(null);
  if (ref.current === null) ref.current = init();
  return ref.current;
}

type Props = {
  slots: HourSlot[];
  selectedDate: Date;                  // currently active date on the scrubber — sync anchor
  onSelectDay: (date: Date) => void;    // tapping a day navigates + closes
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function ExpandedCalendar({ slots, selectedDate, onSelectDay }: Props) {
  const today = new Date();
  const months = useStableArray<Date>(() => {
    const arr: Date[] = [];
    for (let i = -MONTHS_RANGE; i <= MONTHS_RANGE; i++) {
      arr.push(new Date(today.getFullYear(), today.getMonth() + i, 1));
    }
    return arr;
  });

  // open on the month the scrubber is currently viewing, not always "today"
  const initialIndex = Math.max(
    0,
    Math.min(months.length - 1, MONTHS_RANGE + monthDiff(selectedDate, today)),
  );
  const scrollRef = useRef<ScrollView>(null);
  const [monthIndex, setMonthIndex] = useState(initialIndex);

  useEffect(() => {
    // snap to the right page on mount without an animated jump
    scrollRef.current?.scrollTo({ x: initialIndex * SCREEN_WIDTH, animated: false });
  }, []);

  const handlePageEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setMonthIndex(i);
  };

  const activeMonth = months[monthIndex];
  const { monthLabel } = buildMonthGrid(activeMonth, slots);

  return (
    <View style={s.container}>
      <Text style={s.monthLabel}>{monthLabel}</Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handlePageEnd}
        contentOffset={{ x: initialIndex * SCREEN_WIDTH, y: 0 }}
      >
        {months.map((m, mi) => {
          const { cells } = buildMonthGrid(m, slots);
          return (
            <View key={monthKey(m)} style={{ width: SCREEN_WIDTH, paddingHorizontal: 16 }}>
              <View style={s.weekdayRow}>
                {WEEKDAYS.map((w, i) => (
                  <Text key={i} style={s.weekdayText}>{w}</Text>
                ))}
              </View>
              <View style={s.grid}>
                {cells.map((cell, i) => {
                  const isToday =
                    cell.day === today.getDate() &&
                    m.getMonth() === today.getMonth() &&
                    m.getFullYear() === today.getFullYear();
                  const isSelected =
                    cell.day === selectedDate.getDate() &&
                    m.getMonth() === selectedDate.getMonth() &&
                    m.getFullYear() === selectedDate.getFullYear();
                  const hasEvents = cell.events.length > 0;
                  const disabled = cell.day == null || !hasEvents;

                  return (
                    <TouchableOpacity
                      key={i}
                      style={s.cell}
                      disabled={disabled}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (cell.day == null) return;
                        onSelectDay(new Date(m.getFullYear(), m.getMonth(), cell.day));
                      }}
                    >
                      {cell.day != null && (
                        <View
                          style={[
                            s.cellInner,
                            isToday && s.cellToday,
                            isSelected && !isToday && s.cellSelected,
                            !hasEvents && s.cellDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              s.cellDay,
                              isToday && s.cellDayToday,
                              !hasEvents && s.cellDayDisabled,
                            ]}
                          >
                            {cell.day}
                          </Text>
                          {hasEvents && (
                            <View style={s.cellDots}>
                              {cell.events.slice(0, 3).map((e, di) => (
                                <View
                                  key={di}
                                  style={[
                                    s.cellDot,
                                    { backgroundColor: CATEGORY_STYLE[e.category].iconColor },
                                  ]}
                                />
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  monthLabel: { fontSize: 14, fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: 8 },
  weekdayRow: { flexDirection: 'row', marginBottom: 4 },
  weekdayText: { flex: 1, textAlign: 'center', fontSize: 10, color: '#94A3B8' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, paddingVertical: 3, alignItems: 'center' },
  cellInner: { width: 32, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cellToday: { backgroundColor: '#111' },
  cellSelected: { backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#B91C1C' },
  cellDisabled: { opacity: 0.4 },
  cellDay: { fontSize: 13, color: '#111' },
  cellDayToday: { color: '#fff', fontWeight: '700' },
  cellDayDisabled: { color: '#CBD5E1' },
  cellDots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  cellDot: { width: 3, height: 3, borderRadius: 2 },
});
