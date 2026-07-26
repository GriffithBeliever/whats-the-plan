import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';

// Standard step-by-point-count sizing/coloring, the same convention used in
// Mapbox/Supercluster clustering examples (small/medium/large tiers keyed to
// point_count breakpoints), tuned to this app's typical cluster sizes.
function tierFor(count: number) {
  if (count >= 10) return { diameter: 62, color: '#B91C1C', fontSize: 18 };
  if (count >= 5) return { diameter: 52, color: '#DC2626', fontSize: 16 };
  return { diameter: 44, color: '#EF4444', fontSize: 14 };
}

type Props = {
  center: [number, number];
  count: number;
  onPress: () => void;
};

export function ClusterMarker({ center, count, onPress }: Props) {
  const { diameter, color, fontSize } = tierFor(count);

  return (
    <Marker lngLat={center} onPress={onPress}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View
          style={[
            s.circle,
            {
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundColor: color,
            },
          ]}
        >
          <Text style={[s.count, { fontSize }]}>{count}</Text>
        </View>
      </TouchableOpacity>
    </Marker>
  );
}

const s = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  count: { fontWeight: '700', color: '#fff' },
});
