// src/components/DateDial.tsx
// A horizontally scrollable "wheel" of dates: whichever date sits on the
// dial's centerline is the selected one. Selection tracks the center live
// while scrolling/flinging (not just once it settles), and tapping a date
// scrolls it to center. Fully self-contained — callers just get an
// onChange(date) and don't need to know about day widths, padding, or
// scroll-offset math.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import { colors, font, radius, spacing } from '../theme/theme';
import { sameDay } from '../utils/date';

// 'clockTick' is the exact constant Android's own spinner/date-picker uses
// while scrolling through values; 'impactLight' distinguishes a deliberate
// tap-to-select from that continuous scrubbing tick.
const hapticOptions = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

const DAY_WIDTH = 60;
const DAYS_BEFORE = 14;
const DAYS_AFTER = 60;
const TOTAL_DAYS = DAYS_BEFORE + DAYS_AFTER;

type Props = {
  // Called with the centered date whenever it changes (including once on
  // mount, with today's date). Pass a stable (e.g. useCallback'd) function —
  // it's read via a ref internally, so an identity change alone won't
  // trigger an extra call, but a fresh closure every render still means
  // you're relying on the latest one only being invoked on real changes.
  onChange: (date: Date) => void;
};

export function DateDial({ onChange }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(DAYS_BEFORE);
  const [dialWidth, setDialWidth] = useState(0);
  const dialRef = useRef<FlatList<Date>>(null);
  const didCenterInitially = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // While true, onScroll must not touch selection: a scroll we started
  // ourselves (tap-to-select, initial centering) passes through every date
  // between the old and new one, and none of those are a real selection —
  // only the date the user actually asked for is. Cleared once we observe
  // the dial has arrived (or, as a backstop, once any momentum settles), or
  // immediately if the user grabs the dial mid-animation, since a real drag
  // always takes over.
  const suppressTracking = useRef(false);
  const sidePadding = dialWidth > DAY_WIDTH ? (dialWidth - DAY_WIDTH) / 2 : 0;

  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + (i - DAYS_BEFORE));
      return d;
    });
  }, []);

  useEffect(() => {
    onChangeRef.current(dates[selectedIndex]);
  }, [dates, selectedIndex]);

  const scrollToIndex = (index: number, animated: boolean) => {
    suppressTracking.current = true;
    dialRef.current?.scrollToOffset({ offset: index * DAY_WIDTH, animated });
  };

  const selectIndex = (index: number) => {
    if (index !== selectedIndex) trigger('impactLight', hapticOptions);
    setSelectedIndex(index);
    scrollToIndex(index, true);
  };

  // Centers "today" under the dial's fixed centerline on first measure. Done
  // via scrollToOffset (not initialScrollIndex) because the centering math
  // depends on dialWidth, which is only known after the first layout pass.
  useEffect(() => {
    if (dialWidth > 0 && !didCenterInitially.current) {
      didCenterInitially.current = true;
      scrollToIndex(DAYS_BEFORE, false);
    }
  }, [dialWidth]);

  const onDialScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.max(0, Math.min(TOTAL_DAYS - 1, Math.round(e.nativeEvent.contentOffset.x / DAY_WIDTH)));
    if (suppressTracking.current) {
      if (idx === selectedIndex) suppressTracking.current = false;
      return;
    }
    if (idx !== selectedIndex) {
      trigger('clockTick', hapticOptions);
      setSelectedIndex(idx);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={dialRef}
        style={styles.dialList}
        data={dates}
        horizontal
        keyExtractor={(_, i) => String(i)}
        showsHorizontalScrollIndicator={false}
        onLayout={e => setDialWidth(e.nativeEvent.layout.width)}
        getItemLayout={(_, index) => ({ length: DAY_WIDTH, offset: sidePadding + DAY_WIDTH * index, index })}
        snapToInterval={DAY_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={[styles.dial, { paddingHorizontal: sidePadding }]}
        onScroll={onDialScroll}
        onScrollBeginDrag={() => { suppressTracking.current = false; }}
        onMomentumScrollEnd={() => { suppressTracking.current = false; }}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const active = index === selectedIndex;
          const isToday = sameDay(item, new Date());
          const label = `${item.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${isToday ? ', today' : ''}`;
          return (
            <TouchableOpacity
              style={[styles.dayCell, active && styles.dayCellActive]}
              onPress={() => selectIndex(index)}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.dayWeekday, active && styles.dayTextActive]}>{item.toLocaleDateString(undefined, { weekday: 'short' })}</Text>
              <Text style={[styles.dayNumber, active && styles.dayTextActive]}>{item.getDate()}</Text>
              {isToday ? <View style={[styles.todayDot, active && styles.todayDotActive]} /> : null}
            </TouchableOpacity>
          );
        }}
      />
      {/* Marks where the centerline is, independent of scroll position, so
          it reads as "line a date up here" rather than just "this one
          happens to be red". Drawn on top, purely decorative — never touches. */}
      <View style={styles.centerMarkLeft} pointerEvents="none" />
      <View style={styles.centerMarkRight} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 96 },
  dialList: { flex: 1 },
  dial: { paddingBottom: spacing.lg, alignItems: 'center' },
  centerMarkLeft: {
    position: 'absolute', left: '50%', marginLeft: -(DAY_WIDTH / 2) - 3, top: 6, bottom: 22,
    width: 2, borderRadius: 1, backgroundColor: colors.borderStrong,
  },
  centerMarkRight: {
    position: 'absolute', left: '50%', marginLeft: DAY_WIDTH / 2 + 1, top: 6, bottom: 22,
    width: 2, borderRadius: 1, backgroundColor: colors.borderStrong,
  },
  dayCell: { width: DAY_WIDTH - 8, marginHorizontal: 4, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.surface },
  dayCellActive: { backgroundColor: colors.primary },
  dayWeekday: { fontSize: 10, color: colors.textMuted, fontWeight: font.weight.semibold },
  dayNumber: { fontSize: font.size.md, color: colors.text, fontWeight: font.weight.bold, marginTop: 2 },
  dayTextActive: { color: colors.onPrimary },
  todayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 4 },
  todayDotActive: { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.18)' },
});
