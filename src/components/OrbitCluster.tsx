// src/components/OrbitCluster.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MapEvent, CATEGORY_STYLE } from '../types/map';

const HUB_SIZE = 60;
const SATELLITE_MIN = 26;
const SATELLITE_MAX = 40;

// fixed-ish but slightly irregular offsets so satellites don't look mechanically spaced
const SATELLITE_SLOTS = [
  { dx: -34, dy: -30 },
  { dx: 40, dy: -18 },
  { dx: 38, dy: 32 },
  { dx: -12, dy: 42 },
];

type Props = {
  events: MapEvent[];        // pre-sorted, [0] is the hub (busiest)
  onPressEvent: (event: MapEvent) => void;
  isMoving: boolean;
};

function Satellite({
  event, dx, dy, size, isMoving, delay, onPress,
}: {
  event: MapEvent; dx: number; dy: number; size: number;
  isMoving: boolean; delay: number; onPress: () => void;
}) {
  const cat = CATEGORY_STYLE[event.category];
  const jiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isMoving) {
      Animated.timing(jiggle, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(jiggle, { toValue: 1, duration: 180, delay, useNativeDriver: true }),
        Animated.timing(jiggle, { toValue: -1, duration: 360, useNativeDriver: true }),
        Animated.timing(jiggle, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isMoving]);

  const rotate = jiggle.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  return (
    <Animated.View style={{ transform: [{ translateX: dx }, { translateY: dy }, { rotate }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View
          style={[
            os.satellite,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: cat.iconColor,
            },
          ]}
        >
          <MaterialIcons name={cat.icon} size={size * 0.42} color="#fff" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function OrbitCluster({ events, onPressEvent, isMoving }: Props) {
  const hub = events[0];
  const satellites = events.slice(1, 1 + SATELLITE_SLOTS.length);
  const overflow = events.length - 1 - satellites.length;
  const hubCat = CATEGORY_STYLE[hub.category];
  const hubJiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isMoving) {
      Animated.timing(hubJiggle, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hubJiggle, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(hubJiggle, { toValue: -1, duration: 400, useNativeDriver: true }),
        Animated.timing(hubJiggle, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isMoving]);

  const hubRotate = hubJiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-3deg', '3deg'] });

  return (
    <Marker lngLat={[hub.longitude, hub.latitude]} onPress={() => onPressEvent(hub)}>
      <View style={os.wrap}>
        {satellites.map((event, i) => (
          <Satellite
            key={event.id}
            event={event}
            dx={SATELLITE_SLOTS[i].dx}
            dy={SATELLITE_SLOTS[i].dy}
            size={Math.max(SATELLITE_MIN, SATELLITE_MAX - i * 5)}
            isMoving={isMoving}
            delay={i * 90}
            onPress={() => onPressEvent(event)}
          />
        ))}

        {overflow > 0 && (
          <View style={[os.satellite, os.overflow, { transform: [{ translateX: 30 }, { translateY: 34 }] }]}>
            <Text style={os.overflowText}>+{overflow}</Text>
          </View>
        )}

        <Animated.View style={[os.hubTouch, { transform: [{ rotate: hubRotate }] }]}>
          <TouchableOpacity onPress={() => onPressEvent(hub)} activeOpacity={0.85}>
            <View style={[os.hub, { backgroundColor: hubCat.iconColor }]}>
              <MaterialIcons name={hubCat.icon} size={HUB_SIZE * 0.4} color="#fff" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Marker>
  );
}

const os = StyleSheet.create({
  wrap: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  hubTouch: { position: 'absolute', zIndex: 5 },
  hub: {
    width: HUB_SIZE,
    height: HUB_SIZE,
    borderRadius: HUB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  satellite: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  overflow: { backgroundColor: '#5F5E5A', width: 22, height: 22, borderRadius: 11 },
  overflowText: { fontSize: 9, fontWeight: '700', color: '#fff' },
});
