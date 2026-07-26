import { useCallback, useMemo } from 'react';
import Supercluster from 'supercluster';
import { MapEvent } from '../types/map';

export type ClusterItem =
  | { type: 'event'; event: MapEvent }
  | { type: 'cluster'; id: number; center: [number, number]; events: MapEvent[] };

type EventPointProps = { eventId: string };

// Dataset is small (single-digit events per day slot), so querying the whole
// world in one shot is cheap and avoids deriving real map bounds from
// onRegionIsChanging just to shrink the query.
const WORLD_BBOX: [number, number, number, number] = [-180, -85, 180, 85];

const CLUSTER_OPTIONS = {
  radius: 60,
  maxZoom: 17,
  minZoom: 0,
  minPoints: 2,
};

function toPointFeature(event: MapEvent): Supercluster.PointFeature<EventPointProps> {
  return {
    type: 'Feature',
    properties: { eventId: event.id },
    geometry: { type: 'Point', coordinates: [event.longitude, event.latitude] },
  };
}

export function useClusteredEvents(events: MapEvent[], zoom: number) {
  // Rebuild the spatial index only when the underlying event set changes
  // (day-slot switch), not on every zoom tick.
  const index = useMemo(() => {
    const idx = new Supercluster<EventPointProps>(CLUSTER_OPTIONS);
    idx.load(events.map(toPointFeature));
    return idx;
  }, [events]);

  const eventsById = useMemo(() => new Map(events.map(e => [e.id, e])), [events]);

  const items = useMemo<ClusterItem[]>(() => {
    if (events.length === 0) return [];
    return index.getClusters(WORLD_BBOX, Math.floor(zoom)).map((feature): ClusterItem => {
      if ('cluster' in feature.properties && feature.properties.cluster) {
        const clusterId = feature.properties.cluster_id;
        const leaves = index.getLeaves(clusterId, Infinity);
        const clusterEvents = leaves
          .map(leaf => eventsById.get(leaf.properties.eventId)!)
          .sort((a, b) => b.goingCount - a.goingCount);
        return {
          type: 'cluster',
          id: clusterId,
          center: feature.geometry.coordinates as [number, number],
          events: clusterEvents,
        };
      }
      const event = eventsById.get(feature.properties.eventId)!;
      return { type: 'event', event };
    });
  }, [index, eventsById, zoom, events.length]);

  // Reuses `index` — cluster IDs are only meaningful relative to the tree
  // that produced them.
  const getExpansionZoom = useCallback(
    (clusterId: number) => index.getClusterExpansionZoom(clusterId),
    [index],
  );

  return { items, getExpansionZoom };
}
