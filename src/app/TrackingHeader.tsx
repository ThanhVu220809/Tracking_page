import { AppIcon } from "../components/AppIcon";
import type { AppCopy } from "../i18n";

type TrackingHeaderProps = {
  copy: AppCopy;
  devicesCount: number;
  embedMode: boolean;
  logoSrc: string;
  onlineCount: number;
  onRefresh: () => void;
  onToggleLocale: () => void;
  onTogglePanel: () => void;
  panelCollapsed: boolean;
  refreshingDevices: boolean;
};

export function TrackingHeader({
  copy,
  devicesCount,
  embedMode,
  logoSrc,
  onlineCount,
  onRefresh,
  onToggleLocale,
  onTogglePanel,
  panelCollapsed,
  refreshingDevices,
}: TrackingHeaderProps) {
  return (
    <header className="tracking-header">
      <div className="tracking-header__brand">
        <img className="tracking-header__logo" src={logoSrc} alt="Logo BA.SEW" />
        <div>
          <p className="tracking-header__kicker">{copy.brand}</p>
          <h1>{copy.webTracking}</h1>
          <p className="tracking-header__desc">{copy.headerDescription}</p>
        </div>
      </div>

      <div className="tracking-header__actions">
        {embedMode ? <span className="badge badge--soft">{copy.embedModeLabel}</span> : null}

        <span className="badge badge--status">
          {onlineCount}/{devicesCount} {copy.onlineCountLabel}
        </span>

        <button className="ghost-btn" onClick={onRefresh} disabled={refreshingDevices} type="button">
          <AppIcon name="refresh" size={15} />
          <span>{refreshingDevices ? copy.refreshingData : copy.refreshData}</span>
        </button>

        <button className="ghost-btn" onClick={onToggleLocale} type="button">
          <span>{copy.languageToggle}</span>
        </button>

        <button className="ghost-btn ghost-btn--accent" onClick={onTogglePanel} type="button">
          <AppIcon name="menu" size={15} />
          <span>{panelCollapsed ? copy.showPanel : copy.hidePanel}</span>
        </button>
      </div>
    </header>
  );
}
