import { useEffect, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import type { AppCopy } from "../../i18n";
import type { TrackerDeviceSummary } from "../../types/tracker";

type DeviceDetailsProps = {
  copy: AppCopy;
  device: TrackerDeviceSummary | null;
  loading: boolean;
  onFetchCurrentLocation: (deviceId: string) => Promise<void>;
  onRename: (deviceId: string, deviceName: string) => Promise<void>;
};

function formatCoordinate(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(6) : "--";
}

function formatDistance(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return "--";
  if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
  return `${Math.round(value)} m`;
}

function formatSpeed(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  return `${value.toFixed(1)} km/h`;
}

export function DeviceDetails({
  copy,
  device,
  loading,
  onFetchCurrentLocation,
  onRename,
}: DeviceDetailsProps) {
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setDraftName(device?.deviceName ?? "");
  }, [device?.deviceId, device?.deviceName]);

  if (loading) {
    return <div className="panel-empty">{copy.loadingDevices}</div>;
  }

  if (!device) {
    return <div className="panel-empty">{copy.chooseDevice}</div>;
  }

  return (
    <div className="panel-stack">
      <article className="summary-card">
        <div>
          <p className="card-kicker">{copy.selectedDevice}</p>
          <h3>{device.deviceName || device.deviceId}</h3>
          <p className="card-subline">{device.deviceId}</p>
        </div>

        <span className={`status-chip ${device.online ? "is-online" : "is-offline"}`}>
          <span className="status-chip__dot" />
          {device.online ? copy.statusOnline : copy.statusOffline}
        </span>
      </article>

      <div className="inline-actions">
        <button
          className="action-btn action-btn--primary"
          disabled={refreshing}
          onClick={async () => {
            setRefreshing(true);
            try {
              await onFetchCurrentLocation(device.deviceId);
            } finally {
              setRefreshing(false);
            }
          }}
          type="button"
        >
          <AppIcon name="refresh" size={15} />
          <span>{refreshing ? copy.fetchingLocation : copy.fetchCurrentLocation}</span>
        </button>
      </div>

      <label className="form-field">
        <span>{copy.renamePlaceholder}</span>
        <div className="input-inline">
          <input
            className="text-input"
            onChange={(event) => setDraftName(event.target.value)}
            placeholder={copy.renamePlaceholder}
            value={draftName}
          />
          <button
            className="action-btn"
            disabled={saving || !draftName.trim() || draftName.trim() === device.deviceName}
            onClick={async () => {
              setSaving(true);
              try {
                await onRename(device.deviceId, draftName.trim());
              } finally {
                setSaving(false);
              }
            }}
            type="button"
          >
            <AppIcon name="edit" size={14} />
            <span>{saving ? copy.saving : copy.save}</span>
          </button>
        </div>
      </label>

      <div className="metrics-grid">
        <article className="metric-card">
          <p className="metric-label">{copy.latitude}</p>
          <p className="metric-value">{formatCoordinate(device.lat)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">{copy.longitude}</p>
          <p className="metric-value">{formatCoordinate(device.lng)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">{copy.accuracy}</p>
          <p className="metric-value">{formatDistance(device.locAccuracyM)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">{copy.speed}</p>
          <p className="metric-value">{formatSpeed(device.speedKmph)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">{copy.satellites}</p>
          <p className="metric-value">{device.satellites ?? "--"}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">{copy.sourceLabel}</p>
          <p className="metric-value">{device.locSource || copy.unknownSource}</p>
        </article>
      </div>

      <div className="detail-list">
        <div className="detail-row">
          <span>{copy.distanceToHome}</span>
          <strong>{formatDistance(device.distanceToHomeM)}</strong>
        </div>
        <div className="detail-row">
          <span>{copy.geofence}</span>
          <strong>{device.geoEnabled ? copy.enabled : copy.disabled}</strong>
        </div>
        <div className="detail-row">
          <span>{copy.insideGeofence}</span>
          <strong>{device.insideGeofence ? copy.yes : copy.no}</strong>
        </div>
      </div>
    </div>
  );
}
