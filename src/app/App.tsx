import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppIcon } from "../components/AppIcon";
import { PanelFooter } from "./PanelFooter";
import { PanelTabs } from "./PanelTabs";
import { TrackingHeader } from "./TrackingHeader";
import type { PanelTab } from "./appTypes";
import { BrandingShowcase } from "../features/branding/BrandingShowcase";
import { DeviceDetails } from "../features/devices/DeviceDetails";
import { DeviceSidebar } from "../features/devices/DeviceSidebar";
import { HistoryTimeline } from "../features/history/HistoryTimeline";
import { HomePanel, type HomePickMode } from "../features/home/HomePanel";
import {
  TrackerMap,
  type MapLayerMode,
  type RouteMode,
  type TrackerMapController,
} from "../features/map/TrackerMap";
import { formatTimestamp, translations, type Locale } from "../i18n";
import {
  fetchDeviceLocation,
  fetchDevices,
  fetchHistory,
  renameDevice,
} from "../services/api/trackerApi";
import type { HistoryRange, TrackerDeviceSummary, TrackerHistoryPoint } from "../types/tracker";
import logo from "../img/logo.png";

const REFRESH_INTERVAL_MS = 60000;
const RANGE_OPTIONS: HistoryRange[] = ["24h", "3d", "7d"];

const STORAGE_KEYS = {
  locale: "basew-tracking-locale",
} as const;

function getInitialLocale(): Locale {
  const saved = window.localStorage.getItem(STORAGE_KEYS.locale);
  if (saved === "vi" || saved === "en") return saved;
  return "vi";
}

function detectEmbedMode() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("embed") === "1" || params.get("mode") === "embed") {
    return true;
  }

  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function cycleRouteMode(current: RouteMode): RouteMode {
  if (current === "off") return "selected";
  if (current === "selected") return "all";
  return "off";
}

export function App() {
  const [devices, setDevices] = useState<TrackerDeviceSummary[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("24h");
  const [history, setHistory] = useState<TrackerHistoryPoint[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshingDevices, setRefreshingDevices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<PanelTab>("devices");
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [routeMode, setRouteMode] = useState<RouteMode>("off");
  const [mapLayer, setMapLayer] = useState<MapLayerMode>("roadmap");

  const [pickMode, setPickMode] = useState<HomePickMode>("idle");
  const [pendingPick, setPendingPick] = useState<{ lat: number; lng: number } | null>(null);
  const [draftHome, setDraftHome] = useState<{ lat: number; lng: number } | null>(null);

  const [mapController, setMapController] = useState<TrackerMapController | null>(null);
  const [scaleBar, setScaleBar] = useState({ label: "50 m", width: 64 });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const embedMode = useMemo(() => detectEmbedMode(), []);

  const copy = translations[locale];

  const onlineCount = devices.filter((device) => device.online).length;
  const selectedDevice = useMemo(
    () => devices.find((device) => device.deviceId === selectedDeviceId) ?? null,
    [devices, selectedDeviceId],
  );

  const visibleDraftHome = useMemo(() => {
    if (!draftHome) return null;

    if (
      selectedDevice?.homeSet &&
      typeof selectedDevice.homeLat === "number" &&
      typeof selectedDevice.homeLng === "number"
    ) {
      const sameLat = Math.abs(selectedDevice.homeLat - draftHome.lat) < 0.000001;
      const sameLng = Math.abs(selectedDevice.homeLng - draftHome.lng) < 0.000001;
      if (sameLat && sameLng) return null;
    }

    return draftHome;
  }, [draftHome, selectedDevice]);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEYS.locale, locale);
    setScaleBar((current) => ({ ...current, label: locale === "vi" ? current.label : current.label }));
  }, [locale]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!searchWrapRef.current) return;
      if (searchWrapRef.current.contains(event.target as Node)) return;
      setShowSearchResults(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (embedMode) {
      setPanelCollapsed(false);
    }
  }, [embedMode]);

  const loadDevices = useCallback(async (showSpinner: boolean) => {
    try {
      if (showSpinner) {
        setLoadingDevices(true);
      } else {
        setRefreshingDevices(true);
      }

      const nextDevices = await fetchDevices();
      setDevices(nextDevices);
      setLastUpdatedAt(Date.now());
      setSelectedDeviceId((current) => {
        if (current && nextDevices.some((device) => device.deviceId === current)) return current;
        return nextDevices[0]?.deviceId ?? null;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.noDevicesHint);
    } finally {
      setLoadingDevices(false);
      setRefreshingDevices(false);
    }
  }, [copy.noDevicesHint]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!cancelled) {
        await loadDevices(true);
      }
    };

    bootstrap();

    const timer = window.setInterval(() => {
      if (!cancelled) {
        void loadDevices(false);
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [loadDevices]);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      if (!selectedDeviceId) {
        setHistory([]);
        return;
      }

      try {
        setLoadingHistory(true);
        const points = await fetchHistory(selectedDeviceId, historyRange);
        if (!cancelled) {
          setHistory(points);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : copy.noHistory);
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [copy.noHistory, historyRange, selectedDeviceId]);

  useEffect(() => {
    setPickMode("idle");
    setPendingPick(null);
  }, [selectedDeviceId]);

  const handleRename = async (deviceId: string, nextName: string) => {
    const trimmed = nextName.trim();
    if (!trimmed) return;

    const updatedName = await renameDevice(deviceId, trimmed);
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === deviceId ? { ...device, deviceName: updatedName } : device,
      ),
    );
  };

  const handleFetchCurrentLocation = async (deviceId: string) => {
    const current = await fetchDeviceLocation(deviceId);
    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === deviceId ? { ...device, ...current } : device,
      ),
    );
    setLastUpdatedAt(Date.now());
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPendingPick({ lat, lng });
    setPickMode("idle");
    setActiveTab("home");
    setPanelCollapsed(false);
  };

  const handleHomeSaved = (homeLat: number, homeLng: number, distanceToHomeM: number) => {
    setPendingPick(null);
    setDraftHome(null);
    setPickMode("idle");

    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === selectedDeviceId
          ? { ...device, distanceToHomeM, homeLat, homeLng, homeSet: true }
          : device,
      ),
    );
  };

  const handleHomeCleared = () => {
    setPendingPick(null);
    setDraftHome(null);
    setPickMode("idle");

    setDevices((prev) =>
      prev.map((device) =>
        device.deviceId === selectedDeviceId
          ? {
            ...device,
            distanceToHomeM: -1,
            geoEnabled: false,
            geoRadiusM: 0,
            homeLat: undefined,
            homeLng: undefined,
            homeSet: false,
            insideGeofence: false,
          }
          : device,
      ),
    );
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      );
      const data = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;

      const results = data.map((item) => ({
        name: item.display_name,
        lat: Number.parseFloat(item.lat),
        lng: Number.parseFloat(item.lon),
      }));

      setSearchResults(results);
      setShowSearchResults(true);
    } catch {
      setSearchResults([]);
      setShowSearchResults(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSelect = (lat: number, lng: number, name: string) => {
    setSearchQuery(name);
    setShowSearchResults(false);
    setSearchResults([]);
    mapController?.focusOnCoordinates?.(lat, lng);
  };

  const renderPanelContent = () => {
    if (activeTab === "devices") {
      return (
        <div className="panel-stack">
          <DeviceSidebar
            copy={copy}
            devices={devices}
            loading={loadingDevices}
            locale={locale}
            onSelect={setSelectedDeviceId}
            selectedDeviceId={selectedDeviceId}
          />

          <DeviceDetails
            copy={copy}
            device={selectedDevice}
            loading={loadingDevices}
            onFetchCurrentLocation={handleFetchCurrentLocation}
            onRename={handleRename}
          />
        </div>
      );
    }

    if (activeTab === "history") {
      return <HistoryTimeline copy={copy} loading={loadingHistory} locale={locale} points={history} />;
    }

    if (activeTab === "home") {
      return (
        <HomePanel
          copy={copy}
          device={selectedDevice}
          onCancelPick={() => setPickMode("idle")}
          onDraftChange={setDraftHome}
          onHomeCleared={handleHomeCleared}
          onHomeSaved={handleHomeSaved}
          onStartPick={() => setPickMode("picking")}
          pendingPick={pendingPick}
          pickMode={pickMode}
        />
      );
    }

    return <BrandingShowcase copy={copy} />;
  };

  return (
    <div className={`tracking-app ${embedMode ? "is-embed" : ""} ${panelCollapsed ? "is-panel-collapsed" : ""}`}>
      <TrackingHeader
        copy={copy}
        devicesCount={devices.length}
        embedMode={embedMode}
        logoSrc={logo}
        onlineCount={onlineCount}
        onRefresh={() => void loadDevices(false)}
        onToggleLocale={() => setLocale((current) => (current === "vi" ? "en" : "vi"))}
        onTogglePanel={() => setPanelCollapsed((current) => !current)}
        panelCollapsed={panelCollapsed}
        refreshingDevices={refreshingDevices}
      />

      <main className="tracking-layout">
        <section className="tracking-map-section">
          <article className="map-card">
            <div className="map-card__top">
              <div>
                <h2>{copy.mapLiveTitle}</h2>
                <p>{copy.mapLiveHint}</p>
              </div>

              <div className="map-card__chips">
                <button
                  className={`chip-btn ${showHistory ? "is-active" : ""}`}
                  onClick={() => {
                    setShowHistory((current) => !current);
                    setActiveTab("history");
                    setPanelCollapsed(false);
                  }}
                  type="button"
                >
                  <AppIcon name="history" size={14} />
                  <span>{copy.historyToggle}</span>
                </button>

                <button
                  className={`chip-btn ${routeMode !== "off" ? "is-active" : ""}`}
                  onClick={() => setRouteMode((current) => cycleRouteMode(current))}
                  type="button"
                >
                  <AppIcon name="route" size={14} />
                  <span>
                    {routeMode === "off"
                      ? copy.routeModeOff
                      : routeMode === "selected"
                        ? copy.routeModeSelected
                        : copy.routeModeAll}
                  </span>
                </button>
              </div>
            </div>

            <div className="map-search" ref={searchWrapRef}>
              <AppIcon name="search" size={16} />
              <input
                aria-label={copy.searchPlaceholder}
                className="map-search__input"
                placeholder={copy.searchPlaceholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setShowSearchResults(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleSearch(searchQuery);
                  }
                }}
              />
              <button
                className="map-search__button"
                onClick={() => void handleSearch(searchQuery)}
                type="button"
              >
                {copy.searchButton}
              </button>

              {showSearchResults ? (
                <div className="map-search__results" role="listbox">
                  {searchLoading ? <div className="map-search__empty">{copy.searchLoading}</div> : null}

                  {!searchLoading && !searchResults.length ? (
                    <div className="map-search__empty">{copy.searchEmpty}</div>
                  ) : null}

                  {!searchLoading
                    ? searchResults.map((result) => (
                      <button
                        className="map-search__result"
                        key={`${result.lat}-${result.lng}-${result.name}`}
                        onClick={() => handleSearchSelect(result.lat, result.lng, result.name)}
                        type="button"
                      >
                        <strong>{result.name}</strong>
                        <span>{result.lat.toFixed(5)}, {result.lng.toFixed(5)}</span>
                      </button>
                    ))
                    : null}
                </div>
              ) : null}
            </div>

            <div className="map-stage">
              <TrackerMap
                devices={devices}
                draftHome={visibleDraftHome}
                draftPendingLabel={copy.draftPendingLabel}
                history={history}
                homeLabel={copy.homeLabel}
                historyStartLabel={copy.historyStartLabel}
                historyLatestLabel={copy.historyLatestLabel}
                distanceLabel={copy.distanceLabel}
                durationLabel={copy.durationLabel}
                routeFallbackLabel={copy.routeFallback}
                locale={locale}
                mapLayer={mapLayer}
                onControllerReady={setMapController}
                onMapClick={handleMapClick}
                onScaleChange={setScaleBar}
                pickMode={pickMode}
                routeMode={routeMode}
                selectedDeviceId={selectedDeviceId}
                showHistory={showHistory}
                theme="light"
              />

              <button
                className="map-layer-btn"
                onClick={() =>
                  setMapLayer((current) => (current === "roadmap" ? "satellite" : "roadmap"))
                }
                type="button"
              >
                <AppIcon name="layers" size={15} />
                <span>{mapLayer === "roadmap" ? copy.satelliteLabel : copy.roadmapLabel}</span>
              </button>

              <div className="map-controls">
                <button
                  className="map-control-btn"
                  onClick={() => mapController?.focusSelected()}
                  title={copy.focusSelected}
                  type="button"
                >
                  <AppIcon name="location" size={16} />
                </button>
                <button
                  className="map-control-btn"
                  onClick={() => mapController?.zoomIn()}
                  title={copy.zoomIn}
                  type="button"
                >
                  <AppIcon name="plus" size={16} />
                </button>
                <button
                  className="map-control-btn"
                  onClick={() => mapController?.zoomOut()}
                  title={copy.zoomOut}
                  type="button"
                >
                  <AppIcon name="minus" size={16} />
                </button>
              </div>

              <div className="map-scale-bar">
                <span className="map-scale-bar__line" style={{ width: `${scaleBar.width}px` }} />
                <span>{scaleBar.label}</span>
              </div>
            </div>

            <div className="map-card__bottom">
              <div>
                <p className="map-card__status-line">
                  <strong>{copy.selectedDevice}:</strong>{" "}
                  {selectedDevice?.deviceName || selectedDevice?.deviceId || copy.chooseDevice}
                </p>
                <p className="map-card__muted">
                  {selectedDevice
                    ? `${copy.connectionStatus}: ${selectedDevice.online ? copy.online : copy.offline}`
                    : copy.noDevicesHint}
                </p>
                <p className="map-card__muted">{copy.mapDataAttribution}</p>
              </div>

              <div className="map-card__meta">
                <span className={`status-chip ${selectedDevice?.online ? "is-online" : "is-offline"}`}>
                  <span className="status-chip__dot" />
                  {selectedDevice?.online ? copy.online : copy.offline}
                </span>
                <button className="ghost-link" onClick={() => setPanelCollapsed((value) => !value)} type="button">
                  {panelCollapsed ? copy.collapseMap : copy.expandMap}
                </button>
              </div>
            </div>
          </article>
        </section>

        <aside className={`tracking-side-panel ${panelCollapsed ? "is-hidden" : ""}`}>
          <PanelTabs activeTab={activeTab} copy={copy} onChange={setActiveTab} />

          <div className="panel-toolbar">
            {activeTab !== "showcase" ? (
              <>
                <label className="form-field">
                  <span>{copy.deviceLabel}</span>
                  <select
                    className="select-input"
                    value={selectedDeviceId ?? ""}
                    onChange={(event) => setSelectedDeviceId(event.target.value || null)}
                  >
                    {!devices.length ? <option value="">{copy.noDevices}</option> : null}
                    {devices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.deviceName || device.deviceId}
                      </option>
                    ))}
                  </select>
                </label>

                {activeTab === "history" ? (
                  <div className="range-row">
                    {RANGE_OPTIONS.map((range) => (
                      <button
                        key={range}
                        className={`range-chip ${historyRange === range ? "is-active" : ""}`}
                        onClick={() => setHistoryRange(range)}
                        type="button"
                      >
                        {copy.rangeLabels[range]}
                      </button>
                    ))}
                  </div>
                ) : null}

                {lastUpdatedAt ? (
                  <p className="panel-toolbar__meta">
                    {copy.lastUpdated}: {formatTimestamp(lastUpdatedAt, locale)}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="panel-toolbar__meta">{copy.showcaseSubtitle}</p>
            )}
          </div>

          <div className="panel-content">
            {error ? <div className="panel-alert panel-alert--error">{error}</div> : null}
            {renderPanelContent()}
          </div>

          <PanelFooter copy={copy} logoSrc={logo} />
        </aside>
      </main>
    </div>
  );
}
