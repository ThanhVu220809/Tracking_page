import { formatRelativeAge, formatTimestamp, type AppCopy, type Locale } from "../../i18n";
import type { TrackerHistoryPoint } from "../../types/tracker";

type HistoryTimelineProps = {
  copy: AppCopy;
  loading: boolean;
  locale: Locale;
  points: TrackerHistoryPoint[];
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

function formatDistance(distanceM: number) {
  if (distanceM >= 1000) return `${(distanceM / 1000).toFixed(2)} km`;
  return `${Math.round(distanceM)} m`;
}

function formatDurationMs(durationMs: number, locale: Locale) {
  const seconds = Math.max(0, Math.round(durationMs / 1000));
  if (seconds < 60) return locale === "vi" ? `${seconds} giây` : `${seconds}s`;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return locale === "vi" ? `${minutes} phút` : `${minutes} min`;

  const hours = (minutes / 60).toFixed(1).replace(/\.0$/, "");
  return locale === "vi" ? `${hours} giờ` : `${hours} h`;
}

export function HistoryTimeline({ copy, loading, locale, points }: HistoryTimelineProps) {
  if (loading) {
    return <div className="panel-empty">{copy.loadingHistory}</div>;
  }

  if (!points.length) {
    return <div className="panel-empty">{copy.noHistory}</div>;
  }

  const ordered = points.slice().sort((a, b) => b.timestamp - a.timestamp);
  const totalDistance = ordered.reduce((sum, point, index) => {
    const next = ordered[index + 1];
    if (!next) return sum;
    return sum + haversineM(point.lat, point.lng, next.lat, next.lng);
  }, 0);

  const duration = ordered.length > 1 ? ordered[0].timestamp - ordered[ordered.length - 1].timestamp : 0;

  return (
    <div className="panel-stack">
      <div className="metrics-grid metrics-grid--two">
        <article className="metric-card">
          <p className="metric-label">{copy.distanceLabel}</p>
          <p className="metric-value">{formatDistance(totalDistance)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">{copy.durationLabel}</p>
          <p className="metric-value">{formatDurationMs(duration, locale)}</p>
        </article>
      </div>

      <div className="timeline-list">
        {ordered.map((point) => {
          const ageSeconds = Math.max(0, Math.round((Date.now() - point.timestamp) / 1000));

          return (
            <article className="timeline-item" key={`${point.deviceId}-${point.timestamp}`}>
              <span className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-top">
                  <strong>{formatTimestamp(point.timestamp, locale)}</strong>
                  <span>{formatRelativeAge(ageSeconds, locale)}</span>
                </div>
                <p className="timeline-coords">
                  {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
