// src/components/EventBubble.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MapEvent, CATEGORY_STYLE } from '../types/map';

const MIN_SCALE = 0.45; // smallest a bubble shrinks to as it recedes

const bubbleSize = (count: number) => Math.min(76, Math.max(40, 32 + count * 1.2));

type Props = {
  event: MapEvent;
  onPress: () => void;
  dimmed: boolean;
  proximity: number; // 0 (far from scrubbed time) → 1 (exact match)
};

export function EventBubble({ event, onPress, dimmed, proximity }: Props) {
  const fullSize = bubbleSize(event.goingCount);
  const scale = MIN_SCALE + (1 - MIN_SCALE) * proximity;
  const targetSize = fullSize * scale;

  const animatedSize = useRef(new Animated.Value(targetSize)).current;

  useEffect(() => {
    Animated.timing(animatedSize, {
      toValue: targetSize,
      duration: 220,
      useNativeDriver: false, // width/height can't use the native driver
    }).start();
  }, [targetSize]);

  const cat = CATEGORY_STYLE[event.category];
  const friends = event.circleFriends;
  const hasFriends = friends.length > 0;
  const shownFriends = friends.slice(0, 2);
  const overflow = friends.length - shownFriends.length;

  return (
    <Marker lngLat={[event.longitude, event.latitude]} onPress={onPress}>
      <View style={[s.bubbleWrap, dimmed && { opacity: 0.55 }]}>
        <Animated.View
          style={[
            s.bubble,
            {
              width: animatedSize,
              height: animatedSize,
              borderRadius: fullSize / 2,
              borderWidth: hasFriends ? 3 : 2,
              borderColor: cat.border,
              backgroundColor: cat.bg,
            },
          ]}
        >
          <MaterialIcons name={cat.icon} size={fullSize * 0.34 * scale} color={cat.iconColor} />

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
        </Animated.View>
        <View style={s.bubbleLabel}>
          <Text style={s.bubbleLabelText} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
      </View>
    </Marker>
  );
}

const s = StyleSheet.create({
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
});
