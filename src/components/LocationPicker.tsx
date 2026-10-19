// src/components/LocationPicker.tsx
// A small embedded MapLibre map used by the create-plan form to pin the
// plan's real coordinates — tap anywhere to drop the marker there. Markers in
// this MapLibre binding have no `draggable` prop, so tap-to-place (rather
// than drag-to-reposition) is the supported interaction.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Camera, Map, Marker, type LngLat, type PressEvent, type PressEventWithFeatures,
} from '@maplibre/maplibre-react-native';
import { NativeSyntheticEvent } from 'react-native';
import { MAP_STYLE } from './MapCanvas';
import { colors, radius, spacing } from '../theme/theme';

const ZOOM = 13;

type Props = {
  latitude: number;
  longitude: number;
  gradient: [string, string];
  icon: string;
  onChange: (latitude: number, longitude: number) => void;
};

export function LocationPicker({ latitude, longitude, gradient, icon, onChange }: Props) {
  const center: LngLat = [longitude, latitude];

  const handlePress = (event: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>) => {
    const [lng, lat] = event.nativeEvent.lngLat;
    onChange(lat, lng);
  };

  return (
    <View style={styles.wrap}>
      <Map mapStyle={MAP_STYLE} onPress={handlePress}>
        <Camera center={center} zoom={ZOOM} duration={300} />
        <Marker lngLat={center}>
          <View style={[styles.marker, { backgroundColor: gradient[1] }]}>
            <Text style={styles.markerIcon}>{icon}</Text>
          </View>
        </Marker>
      </Map>
      <Text style={styles.hint}>Tap the map to set the exact spot</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 200, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
  },
  marker: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  markerIcon: { fontSize: 14 },
  hint: {
    position: 'absolute', bottom: spacing.sm, alignSelf: 'center', backgroundColor: 'rgba(15,23,42,0.72)',
    color: '#fff', fontSize: 11, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full,
  },
});
