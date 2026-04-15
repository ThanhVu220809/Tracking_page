import { AppIcon, type IconName } from "../components/AppIcon";
import type { AppCopy } from "../i18n";
import type { PanelTab } from "./appTypes";

type PanelTabsProps = {
  activeTab: PanelTab;
  copy: AppCopy;
  onChange: (tab: PanelTab) => void;
};

export function PanelTabs({ activeTab, copy, onChange }: PanelTabsProps) {
  const tabs: Array<{ icon: IconName; id: PanelTab; label: string }> = [
    { id: "devices", icon: "device", label: copy.tabDevices },
    { id: "history", icon: "recent", label: copy.tabHistory },
    { id: "home", icon: "home", label: copy.tabHome },
    { id: "showcase", icon: "saved", label: copy.tabShowcase },
  ];

  return (
    <div className="panel-tabs">
      {tabs.map((tab) => (
        <button
          className={`panel-tab ${activeTab === tab.id ? "is-active" : ""}`}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          <AppIcon name={tab.icon} size={14} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
