// src/components/MapCanvas.tsx
// The "canvas" of the Map tab: a real MapLibre map (OpenFreeMap tiles — free,
// no API key) with the day's plans dropped on as markers, camera auto-fit to
// whatever's showing. Fully self-contained — MapsScreen just hands it the
// day's plans and gets told what was tapped.
//
// Zooming/panning is real now, so the old fixed-canvas pixel-clustering (built
// because that canvas had no way to separate overlapping pins) isn't needed —
// pinch/zoom does that job natively. `onSelect` still takes an array so a
// future cluster layer can report multiple plans without changing the API.
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, Map, Marker, type LngLat, type LngLatBounds } from '@maplibre/maplibre-react-native';
import { Plan } from '../types/plan';
import { EmptyState } from './EmptyState';
import { colors, radius, shadow, spacing } from '../theme/theme';

// Exported so other embedded maps (e.g. the location picker in the create-plan
// form) use the same free tile source and fallback center instead of
// duplicating them.
export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
// Falls back to roughly where the seed data is centered, so the map still
// looks intentional (not "null island") on a day with zero plans.
export const DEFAULT_CENTER: LngLat = [-73.99, 40.73];
const DEFAULT_ZOOM = 11;
const CAMERA_PADDING = { left: 48, right: 48, top: 48, bottom: 48 };
// Minimum bounds size in degrees (~650m) so a single plan — or several at the
// same spot — doesn't hand MapLibre a zero-area box and over-zoom.
const MIN_SPAN = 0.006;

type Props = {
  // The day's plans to drop onto the map.
  plans: Plan[];
  // Called with the tapped plan, as a single-item array (kept as an array so
  // a future cluster layer can report a group without an API change).
  onSelect: (plans: Plan[]) => void;
};

function computeBounds(plans: Plan[]): LngLatBounds | null {
  if (plans.length === 0) return null;
  const lats = plans.map(p => p.latitude);
  const lngs = plans.map(p => p.longitude);
  const west = Math.min(...lngs), east = Math.max(...lngs);
  const south = Math.min(...lats), north = Math.max(...lats);
  if (east - west < MIN_SPAN && north - south < MIN_SPAN) {
    const cLng = (west + east) / 2, cLat = (south + north) / 2;
    return [cLng - MIN_SPAN, cLat - MIN_SPAN, cLng + MIN_SPAN, cLat + MIN_SPAN];
  }
  return [west, south, east, north];
}

export function MapCanvas({ plans, onSelect }: Props) {
  const bounds = useMemo(() => computeBounds(plans), [plans]);

  return (
    <View style={styles.canvas}>
      <Map mapStyle={MAP_STYLE}>
        <Camera
          {...(bounds ? { bounds } : { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })}
          padding={CAMERA_PADDING}
          duration={450}
        />
        {plans.map(plan => (
          <Marker key={plan.id} lngLat={[plan.longitude, plan.latitude]} onPress={() => onSelect([plan])}>
            <View style={[styles.marker, { backgroundColor: plan.gradient[1] }]}>
              <Text style={styles.markerIcon}>{plan.icon}</Text>
            </View>
          </Marker>
        ))}
      </Map>
      {plans.length === 0 ? (
        <View style={styles.canvasEmpty} pointerEvents="none">
          <View style={styles.canvasEmptyCard}>
            <EmptyState icon="🗺️" title="No plans on this day" subtitle="Try another date on the dial below." />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1, marginHorizontal: spacing.xl, marginBottom: spacing.md, borderRadius: radius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
  },
  canvasEmpty: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  canvasEmptyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow.lg },
  marker: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff', ...shadow.md,
  },
  markerIcon: { fontSize: 16 },
});
