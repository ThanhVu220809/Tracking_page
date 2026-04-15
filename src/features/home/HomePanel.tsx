import { useEffect, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import type { AppCopy } from "../../i18n";
import { clearDeviceHome, setDeviceHome } from "../../services/api/trackerApi";
import type { TrackerDeviceSummary } from "../../types/tracker";

export type HomePickMode = "idle" | "picking";

type HomePanelProps = {
  copy: AppCopy;
  device: TrackerDeviceSummary | null;
  onCancelPick: () => void;
  onDraftChange: (pos: { lat: number; lng: number } | null) => void;
  onHomeCleared: () => void;
  onHomeSaved: (homeLat: number, homeLng: number, distanceToHomeM: number) => void;
  onStartPick: () => void;
  pendingPick: { lat: number; lng: number } | null;
  pickMode: HomePickMode;
};

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

function formatDistance(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "--";
  if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
  return `${Math.round(value)} m`;
}

function formatCoordPair(lat?: number, lng?: number, copy?: AppCopy) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return copy ? copy.homeUnsetLabel : "--";
  }

  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function HomePanel({
  copy,
  device,
  onCancelPick,
  onDraftChange,
  onHomeCleared,
  onHomeSaved,
  onStartPick,
  pendingPick,
  pickMode,
}: HomePanelProps) {
  const [latStr, setLatStr] = useState("");
  const [lngStr, setLngStr] = useState("");
  const [radiusStr, setRadiusStr] = useState("0");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "cleared" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (pendingPick) {
      setLatStr(pendingPick.lat.toFixed(6));
      setLngStr(pendingPick.lng.toFixed(6));
      setStatus("idle");
    }
  }, [pendingPick]);

  useEffect(() => {
    if (device?.homeLat !== undefined && device.homeLat !== null) {
      setLatStr(device.homeLat.toFixed(6));
      setLngStr((device.homeLng ?? 0).toFixed(6));
    } else {
      setLatStr("");
      setLngStr("");
    }

    setRadiusStr(String(device?.geoRadiusM && device.geoRadiusM > 0 ? Math.round(device.geoRadiusM) : 0));
    setStatus("idle");
    setErrMsg("");
  }, [device?.deviceId]);

  const parsedLat = Number.parseFloat(latStr.replace(",", "."));
  const parsedLng = Number.parseFloat(lngStr.replace(",", "."));
  const parsedRadius = Math.max(0, Number.parseInt(radiusStr, 10) || 0);

  const isValidCoords =
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLng) &&
    Math.abs(parsedLat) <= 90 &&
    Math.abs(parsedLng) <= 180;

  useEffect(() => {
    if (isValidCoords) {
      onDraftChange({ lat: parsedLat, lng: parsedLng });
    } else {
      onDraftChange(null);
    }
  }, [isValidCoords, onDraftChange, parsedLat, parsedLng]);

  if (!device) {
    return <div className="panel-empty">{copy.chooseDevice}</div>;
  }

  const previewDistance =
    isValidCoords && Number.isFinite(device.lat) && Number.isFinite(device.lng)
      ? haversineM(device.lat, device.lng, parsedLat, parsedLng)
      : null;

  const selectedAddress = isValidCoords
    ? formatCoordPair(parsedLat, parsedLng, copy)
    : formatCoordPair(device.homeLat, device.homeLng, copy);

  const handleUseCurrentPos = () => {
    setLatStr(device.lat.toFixed(6));
    setLngStr(device.lng.toFixed(6));
    setStatus("idle");
  };

  const handleSave = async () => {
    if (!isValidCoords) return;

    try {
      setStatus("saving");
      setErrMsg("");
      const result = await setDeviceHome(device, parsedLat, parsedLng, parsedRadius);
      onHomeSaved(result.homeLat!, result.homeLng!, result.distanceToHomeM);
      setStatus("ok");
    } catch (error) {
      setStatus("error");
      setErrMsg(error instanceof Error ? error.message : copy.homeSaving);
    }
  };

  const handleClear = async () => {
    try {
      setStatus("saving");
      setErrMsg("");
      await clearDeviceHome(device);
      onHomeCleared();
      setLatStr("");
      setLngStr("");
      setRadiusStr("0");
      setStatus("cleared");
    } catch (error) {
      setStatus("error");
      setErrMsg(error instanceof Error ? error.message : copy.clearHomeBtn);
    }
  };

  return (
    <div className="panel-stack">
      <article className="summary-card summary-card--soft">
        <div>
          <p className="card-kicker">{copy.homeTitle}</p>
          <h3>{device.homeSet ? copy.homeSetLabel : copy.homeUnsetLabel}</h3>
          <p className="card-subline">{copy.homePanelDesc}</p>
        </div>
      </article>

      {pickMode === "picking" ? (
        <div className="panel-alert">
          <AppIcon name="location" size={15} />
          <span>{copy.pickOnMapHint}</span>
        </div>
      ) : null}

      {status === "error" ? <div className="panel-alert panel-alert--error">{errMsg}</div> : null}
      {status === "ok" ? <div className="panel-alert panel-alert--success">{copy.homeSaved}</div> : null}
      {status === "cleared" ? <div className="panel-alert panel-alert--success">{copy.homeCleared}</div> : null}

      <div className="form-grid">
        <label className="form-field">
          <span>{copy.latitude}</span>
          <input
            className="text-input"
            value={latStr}
            onChange={(event) => setLatStr(event.target.value)}
            placeholder={copy.latPlaceholder}
          />
        </label>

        <label className="form-field">
          <span>{copy.longitude}</span>
          <input
            className="text-input"
            value={lngStr}
            onChange={(event) => setLngStr(event.target.value)}
            placeholder={copy.lngPlaceholder}
          />
        </label>

        <label className="form-field form-field--full">
          <span>{copy.geoRadiusLabel}</span>
          <input
            className="text-input"
            value={radiusStr}
            onChange={(event) => setRadiusStr(event.target.value)}
            inputMode="numeric"
            placeholder="0"
          />
          <small className="field-hint">{copy.geoRadiusHint}</small>
        </label>
      </div>

      <div className="detail-list">
        <div className="detail-row">
          <span>{copy.homeLabel}</span>
          <strong>{selectedAddress}</strong>
        </div>
        <div className="detail-row">
          <span>{copy.distanceToHome}</span>
          <strong>{formatDistance(previewDistance ?? device.distanceToHomeM ?? null)}</strong>
        </div>
      </div>

      <div className="inline-actions inline-actions--stack">
        <button
          className="action-btn action-btn--primary"
          onClick={pickMode === "picking" ? onCancelPick : onStartPick}
          type="button"
        >
          <AppIcon name="location" size={16} />
          <span>{pickMode === "picking" ? copy.cancelPickOnMapBtn : copy.pickOnMapBtn}</span>
        </button>

        <button className="action-btn" onClick={handleUseCurrentPos} type="button">
          <AppIcon name="refresh" size={16} />
          <span>{copy.useCurrentPos}</span>
        </button>

        <button
          className="action-btn"
          disabled={!isValidCoords || status === "saving"}
          onClick={handleSave}
          type="button"
        >
          <AppIcon name="saved" size={16} />
          <span>{status === "saving" ? copy.homeSaving : copy.setHomeBtn}</span>
        </button>

        {device.homeSet ? (
          <button
            className="action-btn action-btn--danger"
            disabled={status === "saving"}
            onClick={handleClear}
            type="button"
          >
            <AppIcon name="close" size={16} />
            <span>{copy.clearHomeBtn}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
