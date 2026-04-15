import { formatRelativeAge, type AppCopy, type Locale } from "../../i18n";
import type { TrackerDeviceSummary } from "../../types/tracker";

type DeviceSidebarProps = {
  copy: AppCopy;
  devices: TrackerDeviceSummary[];
  locale: Locale;
  loading: boolean;
  onSelect: (deviceId: string) => void;
  selectedDeviceId: string | null;
};

export function DeviceSidebar({
  copy,
  devices,
  locale,
  loading,
  onSelect,
  selectedDeviceId,
}: DeviceSidebarProps) {
  if (loading) {
    return <div className="panel-empty">{copy.loadingDevices}</div>;
  }

  if (!devices.length) {
    return <div className="panel-empty">{copy.noDevices}</div>;
  }

  const onlineCount = devices.filter((device) => device.online).length;

  return (
    <section className="device-list" aria-label={copy.deviceLabel}>
      <div className="device-list__head">
        <div>
          <p className="card-kicker">{copy.deviceLabel}</p>
          <h3>{copy.tabDevices}</h3>
        </div>
        <span className="badge badge--soft">
          {onlineCount}/{devices.length}
        </span>
      </div>

      <div className="device-list__items">
        {devices.map((device) => {
          const active = device.deviceId === selectedDeviceId;

          return (
            <button
              className={`device-list__item ${active ? "is-active" : ""}`}
              key={device.deviceId}
              onClick={() => onSelect(device.deviceId)}
              type="button"
            >
              <span className={`device-list__dot ${device.online ? "is-online" : "is-offline"}`} />
              <span className="device-list__body">
                <strong>{device.deviceName || device.deviceId}</strong>
                <span>{device.deviceId}</span>
              </span>
              <span className="device-list__meta">
                <span>{device.online ? copy.online : copy.offline}</span>
                <span>{formatRelativeAge(device.ageSeconds, locale)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
