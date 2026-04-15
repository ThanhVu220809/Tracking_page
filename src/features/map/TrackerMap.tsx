import "leaflet/dist/leaflet.css";
import { divIcon, point, type Map as LeafletMap } from "leaflet";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { Circle, CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip } from "react-leaflet";
import { formatTimestamp, type Locale, type ThemeMode } from "../../i18n";
import type { TrackerDeviceSummary, TrackerHistoryPoint } from "../../types/tracker";
import type { HomePickMode } from "../home/HomePanel";

export type RouteMode = "off" | "selected" | "all";
export type MapLayerMode = "roadmap" | "satellite";

export type TrackerMapController = {
  focusSelected: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  focusOnCoordinates?: (lat: number, lng: number) => void;
};

type TrackerMapProps = {
  devices: TrackerDeviceSummary[];
  history: TrackerHistoryPoint[];
  homeLabel: string;
  draftPendingLabel: string;
  historyStartLabel: string;
  historyLatestLabel: string;
  distanceLabel: string;
  durationLabel: string;
  routeFallbackLabel: string;
  locale: Locale;
  selectedDeviceId: string | null;
  theme: ThemeMode;
  mapLayer: MapLayerMode;
  pickMode: HomePickMode;
  routeMode: RouteMode;
  showHistory: boolean;
  draftHome: { lat: number; lng: number } | null;
  onControllerReady?: (controller: TrackerMapController | null) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onScaleChange?: (details: { label: string; width: number }) => void;
};

type RouteRequest = {
  deviceId: string;
  deviceName: string;
  selected: boolean;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
};

type RoadRoute = {
  deviceId: string;
  deviceName: string;
  selected: boolean;
  positions: [number, number][];
  distanceM: number;
  durationS: number;
  source: "osrm" | "fallback";
};

type CachedRoute = {
  positions: [number, number][];
  distanceM: number;
  durationS: number;
  source: "osrm" | "fallback";
};

const draftIcon = divIcon({
  html: '<div class="tracking-draft-pin__glyph">&#128205;</div>',
  className: "tracking-draft-pin",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  tooltipAnchor: [0, -28],
});

const selectedDeviceIcon = divIcon({
  html: '<div class="tracking-pin"><span class="tracking-pin__core"></span></div>',
  className: "tracking-pin-icon",
  iconSize: [34, 48],
  iconAnchor: [17, 46],
  tooltipAnchor: [0, -36],
});

const DEFAULT_CENTER: [number, number] = [10.901146, 106.806184];
const OSRM_BASE = "https://router.project-osrm.org";
const MAX_ROUTE_CONCURRENCY = 2;
const MAX_ROUTE_POINTS = 120;
const BOOTSTRAP_EPSILON = 0.00005;
const roadRouteCache = new Map<string, CachedRoute>();

function hasCoords(lat?: number | null, lng?: number | null) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  );
}

function isBootstrapHistoryPoint(point: TrackerHistoryPoint) {
  const source = (point.locSource || "").trim().toLowerCase();
  const looksLikeBootstrapCoord =
    Math.abs(point.lat - DEFAULT_CENTER[0]) <= BOOTSTRAP_EPSILON &&
    Math.abs(point.lng - DEFAULT_CENTER[1]) <= BOOTSTRAP_EPSILON;
  const isSyntheticSource = !source || source === "home" || source === "none" || source === "unknown";

  return looksLikeBootstrapCoord && isSyntheticSource;
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distanceM: number): string {
  if (distanceM >= 1000) return `${(distanceM / 1000).toFixed(2)} km`;
  return `${Math.round(distanceM)} m`;
}

function formatDuration(durationS: number, locale: Locale): string {
  if (durationS < 60) {
    const seconds = Math.max(1, Math.round(durationS));
    return locale === "vi" ? `${seconds} giây` : `${seconds} s`;
  }

  if (durationS < 3600) {
    const minutes = Math.round(durationS / 60);
    return locale === "vi" ? `${minutes} phút` : `${minutes} min`;
  }

  const hours = (durationS / 3600).toFixed(1).replace(/\.0$/, "");
  return locale === "vi" ? `${hours} giờ` : `${hours} h`;
}

function formatHistoryPointTooltip(point: TrackerHistoryPoint): string {
  return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
}

function formatScaleLabel(distanceM: number, locale: Locale): string {
  if (distanceM >= 1000) {
    const km = (distanceM / 1000).toFixed(1).replace(/\.0$/, "");
    return `${km} km`;
  }

  const meters = Math.round(distanceM);
  return locale === "vi" ? `${meters} m` : `${meters} m`;
}

function computeScaleDetails(map: LeafletMap, locale: Locale) {
  const size = map.getSize();
  const y = Math.round(size.y / 2);
  const left = map.containerPointToLatLng(point(16, y));
  const right = map.containerPointToLatLng(point(96, y));
  const meters = map.distance(left, right);

  const candidates = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  const target = Math.max(5, meters);
  const distanceM =
    candidates.find((candidate) => candidate >= target * 0.6) ?? candidates[candidates.length - 1];
  const width = Math.round((distanceM / meters) * 80);

  return {
    label: formatScaleLabel(distanceM, locale),
    width: Math.max(34, Math.min(width, 126)),
  };
}

function ScaleObserver({
  locale,
  onScaleChange,
}: {
  locale: Locale;
  onScaleChange?: (details: { label: string; width: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onScaleChange) return;

    const update = () => {
      onScaleChange(computeScaleDetails(map, locale));
    };

    update();
    map.on("zoomend moveend resize", update);

    return () => {
      map.off("zoomend moveend resize", update);
    };
  }, [locale, map, onScaleChange]);

  return null;
}

function MapRecentering({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    const [prevLat, prevLng] = prevCenter.current;
    const changed = Math.abs(prevLat - center[0]) > 0.000001 || Math.abs(prevLng - center[1]) > 0.000001;

    if (changed) {
      map.flyTo(center, Math.max(map.getZoom(), 15), { duration: 0.55 });
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

function downsamplePositions(positions: [number, number][], maxPoints = MAX_ROUTE_POINTS): [number, number][] {
  if (positions.length <= maxPoints) return positions;

  const sampled: [number, number][] = [];
  const lastIndex = positions.length - 1;

  for (let i = 0; i < maxPoints; i += 1) {
    const index = Math.round((i / (maxPoints - 1)) * lastIndex);
    sampled.push(positions[index]);
  }

  return sampled;
}

function buildRouteKey(request: RouteRequest): string {
  return [
    request.deviceId,
    request.startLat.toFixed(6),
    request.startLng.toFixed(6),
    request.endLat.toFixed(6),
    request.endLng.toFixed(6),
  ].join(":");
}

function fallbackRoute(request: RouteRequest): CachedRoute {
  return {
    positions: [
      [request.startLat, request.startLng],
      [request.endLat, request.endLng],
    ],
    distanceM: haversineM(request.startLat, request.startLng, request.endLat, request.endLng),
    durationS: 0,
    source: "fallback",
  };
}

async function fetchRoadRoute(request: RouteRequest, signal: AbortSignal): Promise<CachedRoute> {
  const key = buildRouteKey(request);
  const cached = roadRouteCache.get(key);
  if (cached) return cached;

  const url =
    `${OSRM_BASE}/route/v1/driving/` +
    `${request.startLng},${request.startLat};${request.endLng},${request.endLat}` +
    "?overview=simplified&geometries=geojson&steps=false&alternatives=false";

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`OSRM ${response.status}`);

    const data = (await response.json()) as {
      code?: string;
      routes?: Array<{
        distance?: number;
        duration?: number;
        geometry?: { coordinates?: [number, number][] };
      }>;
    };

    const route = data.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (data.code !== "Ok" || !route || !coords || coords.length < 2) {
      throw new Error(data.code || "NoRoute");
    }

    const mapped: CachedRoute = {
      positions: downsamplePositions(coords.map(([lng, lat]) => [lat, lng])),
      distanceM: route.distance ?? 0,
      durationS: route.duration ?? 0,
      source: "osrm",
    };

    roadRouteCache.set(key, mapped);
    return mapped;
  } catch {
    const fallback = fallbackRoute(request);
    roadRouteCache.set(key, fallback);
    return fallback;
  }
}

function MapClickListener({
  active,
  onMapClick,
}: {
  active: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      if (active) onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function MapControllerBridge({
  center,
  onControllerReady,
}: {
  center: [number, number];
  onControllerReady?: (controller: TrackerMapController | null) => void;
}) {
  const map = useMap();
  const centerRef = useRef(center);

  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  useEffect(() => {
    if (!onControllerReady) return;

    onControllerReady({
      focusSelected: () => {
        map.flyTo(centerRef.current, Math.max(map.getZoom(), 16), { duration: 0.55 });
      },
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      focusOnCoordinates: (lat: number, lng: number) => {
        map.flyTo([lat, lng], 16, { duration: 0.55 });
      },
    });

    return () => onControllerReady(null);
  }, [map, onControllerReady]);

  return null;
}

export function TrackerMap({
  devices,
  history,
  homeLabel,
  draftPendingLabel,
  historyStartLabel,
  historyLatestLabel,
  distanceLabel,
  durationLabel,
  routeFallbackLabel,
  locale,
  selectedDeviceId,
  theme,
  mapLayer,
  pickMode,
  routeMode,
  showHistory,
  draftHome,
  onControllerReady,
  onMapClick,
  onScaleChange,
}: TrackerMapProps) {
  const [roadRoutes, setRoadRoutes] = useState<RoadRoute[]>([]);

  const visibleDevices = useMemo(
    () => devices.filter((device) => hasCoords(device.lat, device.lng)),
    [devices],
  );

  const visibleHistory = useMemo(
    () =>
      history
        .filter((point) => hasCoords(point.lat, point.lng) && !isBootstrapHistoryPoint(point))
        .sort((a, b) => a.timestamp - b.timestamp),
    [history],
  );

  const historyStart = visibleHistory[0] ?? null;
  const historyLatest = visibleHistory[visibleHistory.length - 1] ?? null;
  const intermediateHistory = visibleHistory.length > 2 ? visibleHistory.slice(1, -1) : [];

  const shouldShowHistoryStart =
    historyStart !== null &&
    historyLatest !== null &&
    historyStart !== historyLatest &&
    (Math.abs(historyStart.lat - historyLatest.lat) > BOOTSTRAP_EPSILON ||
      Math.abs(historyStart.lng - historyLatest.lng) > BOOTSTRAP_EPSILON);

  const selectedDevice = visibleDevices.find((device) => device.deviceId === selectedDeviceId) ?? null;

  const center = useMemo<[number, number]>(
    () =>
      selectedDevice
        ? [selectedDevice.lat, selectedDevice.lng]
        : visibleDevices[0]
          ? [visibleDevices[0].lat, visibleDevices[0].lng]
          : DEFAULT_CENTER,
    [selectedDevice, visibleDevices],
  );

  const tileConfig = useMemo(
    () =>
      mapLayer === "satellite"
        ? {
          attribution: "&copy; Esri & contributors",
          subdomains: [] as string[],
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        }
        : {
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          subdomains: ["a", "b", "c", "d"],
          url:
            theme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        },
    [mapLayer, theme],
  );

  const routeRequests = useMemo<RouteRequest[]>(() => {
    if (routeMode === "off") return [];

    return visibleDevices
      .filter(
        (device) =>
          hasCoords(device.homeLat, device.homeLng) &&
          device.homeSet &&
          (routeMode === "all" || device.deviceId === selectedDeviceId),
      )
      .map((device) => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        selected: device.deviceId === selectedDeviceId,
        startLat: device.lat,
        startLng: device.lng,
        endLat: device.homeLat as number,
        endLng: device.homeLng as number,
      }));
  }, [routeMode, selectedDeviceId, visibleDevices]);

  const routeRequestKey = useMemo(() => routeRequests.map(buildRouteKey).join("|"), [routeRequests]);

  useEffect(() => {
    if (!routeRequests.length) {
      setRoadRoutes([]);
      return;
    }

    const controller = new AbortController();

    const loadRoutes = async () => {
      const routes: RoadRoute[] = [];

      for (let i = 0; i < routeRequests.length; i += MAX_ROUTE_CONCURRENCY) {
        const chunk = routeRequests.slice(i, i + MAX_ROUTE_CONCURRENCY);
        const chunkRoutes = await Promise.all(
          chunk.map(async (request) => {
            const route = await fetchRoadRoute(request, controller.signal);
            return {
              deviceId: request.deviceId,
              deviceName: request.deviceName,
              selected: request.selected,
              ...route,
            } satisfies RoadRoute;
          }),
        );

        if (controller.signal.aborted) return;
        routes.push(...chunkRoutes);
      }

      if (!controller.signal.aborted) {
        startTransition(() => {
          setRoadRoutes(routes);
        });
      }
    };

    loadRoutes().catch(() => {
      if (!controller.signal.aborted) {
        startTransition(() => {
          setRoadRoutes([]);
        });
      }
    });

    return () => controller.abort();
  }, [routeRequestKey, routeRequests]);

  return (
    <section className="tracking-map-panel" style={{ cursor: pickMode === "picking" ? "crosshair" : undefined }}>
      <MapContainer
        center={center}
        className="tracking-map-canvas"
        scrollWheelZoom
        zoom={15}
        zoomControl={false}
      >
        <TileLayer attribution={tileConfig.attribution} subdomains={tileConfig.subdomains} url={tileConfig.url} />

        <MapRecentering center={center} />
        <MapClickListener active={pickMode === "picking"} onMapClick={onMapClick ?? (() => {})} />
        <MapControllerBridge center={center} onControllerReady={onControllerReady} />
        <ScaleObserver locale={locale} onScaleChange={onScaleChange} />

        {visibleDevices.map((device) =>
          device.deviceId === selectedDeviceId ? (
            <Marker
              key={device.deviceId}
              position={[device.lat, device.lng]}
              icon={selectedDeviceIcon}
              zIndexOffset={900}
            >
              <Tooltip direction="top" offset={[0, -30]}>
                <div>
                  <strong>{device.deviceName || device.deviceId}</strong>
                  <div className="map-tooltip__subline">{device.deviceId}</div>
                </div>
              </Tooltip>
            </Marker>
          ) : (
            <CircleMarker
              key={device.deviceId}
              center={[device.lat, device.lng]}
              radius={6}
              pathOptions={{
                color: "#FFFFFF",
                fillColor: device.online ? "#6B4F3A" : "#9C7B5D",
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div>
                  <strong>{device.deviceName || device.deviceId}</strong>
                  <div className="map-tooltip__subline">{device.deviceId}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ),
        )}

        {showHistory && visibleHistory.length > 1 ? (
          <>
            <Polyline
              positions={visibleHistory.map((point) => [point.lat, point.lng])}
              pathOptions={{ color: "rgba(255,255,255,0.95)", weight: 8, opacity: 0.96 }}
            />
            <Polyline
              positions={visibleHistory.map((point) => [point.lat, point.lng])}
              pathOptions={{ color: "#6B4F3A", weight: 4.8, opacity: 0.9 }}
            />
          </>
        ) : null}

        {showHistory
          ? intermediateHistory.map((point) => (
            <CircleMarker
              key={`${point.deviceId}-${point.timestamp}`}
              center={[point.lat, point.lng]}
              radius={6}
              pathOptions={{
                color: "#ffffff",
                fillColor: "#6B4F3A",
                fillOpacity: 0.96,
                weight: 2.5,
              }}
            >
              <Tooltip className="history-point-tooltip" direction="top" offset={[0, -8]}>
                <div className="history-point-tooltip__body">
                  <strong>{formatTimestamp(point.timestamp, locale)}</strong>
                  <div>{point.lat.toFixed(6)}, {point.lng.toFixed(6)}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))
          : null}

        {showHistory && shouldShowHistoryStart && historyStart ? (
          <CircleMarker
            center={[historyStart.lat, historyStart.lng]}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#2D8A45",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip className="history-point-tooltip history-point-tooltip--key" direction="top" offset={[0, -10]} permanent>
              <div className="history-point-tooltip__body">
                <span className="history-point-tooltip__tag">{historyStartLabel}</span>
                <strong>{formatTimestamp(historyStart.timestamp, locale)}</strong>
                <div>{formatHistoryPointTooltip(historyStart)}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ) : null}

        {showHistory && historyLatest ? (
          <CircleMarker
            center={[historyLatest.lat, historyLatest.lng]}
            radius={10}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#D14E3A",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip className="history-point-tooltip history-point-tooltip--key" direction="top" offset={[0, -10]} permanent>
              <div className="history-point-tooltip__body">
                <span className="history-point-tooltip__tag">{historyLatestLabel}</span>
                <strong>{formatTimestamp(historyLatest.timestamp, locale)}</strong>
                <div>{formatHistoryPointTooltip(historyLatest)}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ) : null}

        {roadRoutes.map((route) => (
          <Polyline
            key={`route-${route.deviceId}`}
            positions={route.positions}
            pathOptions={{
              color: route.selected ? "#4A3426" : "#9C7B5D",
              weight: route.selected ? 4.2 : 2.8,
              opacity: route.selected ? 0.9 : 0.65,
              dashArray: route.source === "fallback" ? "8 6" : undefined,
            }}
          >
            <Tooltip direction="top" sticky>
              <div>
                <strong>{route.deviceName || route.deviceId}</strong>
                <div>{distanceLabel}: {formatDistance(route.distanceM)}</div>
                <div>
                  {durationLabel}: {route.durationS > 0 ? formatDuration(route.durationS, locale) : routeFallbackLabel}
                </div>
              </div>
            </Tooltip>
          </Polyline>
        ))}

        {selectedDevice?.homeSet && hasCoords(selectedDevice.homeLat, selectedDevice.homeLng) ? (
          <>
            <CircleMarker
              center={[selectedDevice.homeLat as number, selectedDevice.homeLng as number]}
              radius={9}
              pathOptions={{
                color: "#4A3426",
                fillColor: "#B78E68",
                fillOpacity: 0.92,
                weight: 2,
              }}
            >
              <Tooltip direction="top">{homeLabel}</Tooltip>
            </CircleMarker>

            {selectedDevice.geoEnabled && (selectedDevice.geoRadiusM ?? 0) > 0 ? (
              <Circle
                center={[selectedDevice.homeLat as number, selectedDevice.homeLng as number]}
                radius={selectedDevice.geoRadiusM as number}
                pathOptions={{
                  color: "#6B4F3A",
                  opacity: 0.62,
                  fillColor: "#9C7B5D",
                  fillOpacity: 0.1,
                  dashArray: "6 4",
                }}
              />
            ) : null}
          </>
        ) : null}

        {visibleDevices
          .filter((device) => device.deviceId !== selectedDeviceId && device.homeSet && hasCoords(device.homeLat, device.homeLng))
          .map((device) => (
            <CircleMarker
              key={`home-${device.deviceId}`}
              center={[device.homeLat as number, device.homeLng as number]}
              radius={5}
              pathOptions={{
                color: "#7F6A58",
                fillColor: "#7F6A58",
                fillOpacity: 0.56,
                weight: 1,
              }}
            >
              <Tooltip direction="top">{device.deviceName || device.deviceId}</Tooltip>
            </CircleMarker>
          ))}

        {draftHome ? (
          <Marker position={[draftHome.lat, draftHome.lng]} icon={draftIcon} zIndexOffset={1000}>
            <Tooltip direction="top" permanent offset={[0, -28]} className="draft-home-tooltip">
              {homeLabel} ({draftPendingLabel})
            </Tooltip>
          </Marker>
        ) : null}
      </MapContainer>
    </section>
  );
}
