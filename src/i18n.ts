export type Locale = "vi" | "en";
export type ThemeMode = "light" | "dark";

export type AppCopy = {
  brand: string;
  webTracking: string;
  headerDescription: string;
  mapLiveTitle: string;
  mapLiveHint: string;
  footerNote: string;
  footerCopyright: string;
  footerCredit: string;
  embedModeLabel: string;

  loadingDevices: string;
  noDevices: string;
  noDevicesHint: string;
  chooseDevice: string;
  deviceLabel: string;
  selectedDevice: string;
  lastUpdated: string;
  refreshData: string;
  refreshingData: string;

  languageToggle: string;
  englishLabel: string;
  vietnameseLabel: string;

  online: string;
  offline: string;
  statusOnline: string;
  statusOffline: string;
  connectionStatus: string;
  onlineCountLabel: string;
  unknownSource: string;

  searchPlaceholder: string;
  searchButton: string;
  searchLoading: string;
  searchEmpty: string;

  historyToggle: string;
  routeModeOff: string;
  routeModeSelected: string;
  routeModeAll: string;
  satelliteLabel: string;
  roadmapLabel: string;
  zoomIn: string;
  zoomOut: string;
  focusSelected: string;

  showPanel: string;
  hidePanel: string;
  expandMap: string;
  collapseMap: string;

  renamePlaceholder: string;
  save: string;
  saving: string;
  fetchCurrentLocation: string;
  fetchingLocation: string;
  latitude: string;
  longitude: string;
  satellites: string;
  speed: string;
  accuracy: string;
  sourceLabel: string;
  geofence: string;
  enabled: string;
  disabled: string;
  distanceToHome: string;
  insideGeofence: string;
  yes: string;
  no: string;

  movementHistory: string;
  historyTitle: string;
  pointsLabel: string;
  loadingHistory: string;
  noHistory: string;
  rangeLabels: Record<"24h" | "3d" | "7d", string>;
  historyStartLabel: string;
  historyLatestLabel: string;

  homeLabel: string;
  homeSetLabel: string;
  homeUnsetLabel: string;
  cancelPickOnMapBtn: string;
  homeTitle: string;
  homePanelDesc: string;
  setHomeBtn: string;
  clearHomeBtn: string;
  pickOnMapBtn: string;
  pickOnMapHint: string;
  latPlaceholder: string;
  lngPlaceholder: string;
  homeSaved: string;
  homeCleared: string;
  homeSaving: string;
  draftPendingLabel: string;
  useCurrentPos: string;
  geoRadiusLabel: string;
  geoRadiusHint: string;

  distanceLabel: string;
  durationLabel: string;
  routeFallback: string;

  tabDevices: string;
  tabHistory: string;
  tabHome: string;
  tabShowcase: string;

  showcaseTitle: string;
  showcaseSubtitle: string;
  productsTitle: string;
  processTitle: string;
  processSubtitle: string;
  qrTitle: string;
  qrCaption: string;
  qrDescription: string;
  brandStory: string;

  mapDataAttribution: string;
};

export const translations: Record<Locale, AppCopy> = {
  vi: {
    brand: "BA.SEW",
    webTracking: "BA.SEW Tracking",
    headerDescription: "Theo dõi thiết bị theo thời gian thực với bản đồ trực tiếp, lịch sử di chuyển và vùng an toàn.",
    mapLiveTitle: "Bản đồ trực tiếp",
    mapLiveHint: "Bản đồ được ưu tiên diện tích lớn để dễ quan sát vị trí, lộ trình và vùng an toàn.",
    footerNote: "BA.SEW Tracking - Dữ liệu GPS hiển thị trực tiếp.",
    footerCopyright: "© 2026 BA.SEW. All rights reserved.",
    footerCredit: "Dev by Thanh Vũ",
    embedModeLabel: "Chế độ nhúng",

    loadingDevices: "Đang tải danh sách thiết bị...",
    noDevices: "Không có dữ liệu thiết bị.",
    noDevicesHint: "Kiểm tra thiết bị đã gửi dữ liệu và API tracking đang hoạt động.",
    chooseDevice: "Vui lòng chọn thiết bị để xem chi tiết.",
    deviceLabel: "Thiết bị đã chọn",
    selectedDevice: "Thiết bị",
    lastUpdated: "Cập nhật lúc",
    refreshData: "Làm mới dữ liệu",
    refreshingData: "Đang làm mới...",

    languageToggle: "EN",
    englishLabel: "English",
    vietnameseLabel: "Tiếng Việt",

    online: "Đang hoạt động",
    offline: "Mất kết nối",
    statusOnline: "Đang hoạt động",
    statusOffline: "Mất kết nối",
    connectionStatus: "Trạng thái kết nối",
    onlineCountLabel: "thiết bị hoạt động",
    unknownSource: "Không rõ nguồn",

    searchPlaceholder: "Tìm địa chỉ hoặc địa điểm...",
    searchButton: "Tìm",
    searchLoading: "Đang tìm dữ liệu...",
    searchEmpty: "Không có kết quả phù hợp.",

    historyToggle: "Lịch sử di chuyển",
    routeModeOff: "Đường về HOME: Tắt",
    routeModeSelected: "Đường về HOME: Thiết bị đã chọn",
    routeModeAll: "Đường về HOME: Tất cả thiết bị",
    satelliteLabel: "Ảnh vệ tinh",
    roadmapLabel: "Bản đồ đường",
    zoomIn: "Phóng to",
    zoomOut: "Thu nhỏ",
    focusSelected: "Đưa về thiết bị đã chọn",

    showPanel: "Mở bảng điều khiển",
    hidePanel: "Ẩn bớt thông tin",
    expandMap: "Mở rộng bản đồ",
    collapseMap: "Hiện bảng điều khiển",

    renamePlaceholder: "Đổi tên thiết bị",
    save: "Lưu",
    saving: "Đang lưu...",
    fetchCurrentLocation: "Lấy vị trí hiện tại",
    fetchingLocation: "Đang lấy vị trí...",
    latitude: "Vĩ độ",
    longitude: "Kinh độ",
    satellites: "Số vệ tinh",
    speed: "Tốc độ",
    accuracy: "Độ chính xác",
    sourceLabel: "Nguồn dữ liệu",
    geofence: "Vùng an toàn",
    enabled: "Bật",
    disabled: "Tắt",
    distanceToHome: "Khoảng cách tới HOME",
    insideGeofence: "Đang trong vùng an toàn",
    yes: "Có",
    no: "Không",

    movementHistory: "Lịch sử di chuyển",
    historyTitle: "Hành trình thiết bị",
    pointsLabel: "điểm",
    loadingHistory: "Đang tải lịch sử...",
    noHistory: "Không có dữ liệu trong khoảng thời gian này.",
    rangeLabels: {
      "24h": "24 giờ",
      "3d": "3 ngày",
      "7d": "7 ngày",
    },
    historyStartLabel: "Bắt đầu",
    historyLatestLabel: "Mới nhất",

    homeLabel: "HOME",
    homeSetLabel: "Đã thiết lập HOME",
    homeUnsetLabel: "Chưa thiết lập HOME",
    cancelPickOnMapBtn: "Hủy chọn trên bản đồ",
    homeTitle: "Thiết lập vùng an toàn",
    homePanelDesc: "Chọn trực tiếp trên bản đồ hoặc nhập tọa độ để đặt vị trí HOME cho thiết bị.",
    setHomeBtn: "Lưu HOME",
    clearHomeBtn: "Xóa HOME",
    pickOnMapBtn: "Chọn trên bản đồ",
    pickOnMapHint: "Nhấn vào bản đồ để chọn vị trí HOME.",
    latPlaceholder: "Ví dụ: 10.901100",
    lngPlaceholder: "Ví dụ: 106.806200",
    homeSaved: "Đã lưu HOME thành công.",
    homeCleared: "Đã xóa HOME.",
    homeSaving: "Đang lưu HOME...",
    draftPendingLabel: "Chờ lưu",
    useCurrentPos: "Dùng vị trí hiện tại",
    geoRadiusLabel: "Bán kính vùng an toàn (m)",
    geoRadiusHint: "Để 0 để tắt geofence.",

    distanceLabel: "Tổng quãng đường",
    durationLabel: "Thời lượng",
    routeFallback: "Đường ước tính",

    tabDevices: "Thiết bị",
    tabHistory: "Lịch sử",
    tabHome: "Vùng an toàn",
    tabShowcase: "BA.SEW",

    showcaseTitle: "BA.SEW Web Tracking",
    showcaseSubtitle: "Giải pháp theo dõi thiết bị rõ ràng, trực quan và sẵn sàng triển khai thực tế.",
    productsTitle: "Hình ảnh sản phẩm",
    processTitle: "Quá trình phát triển thực tế",
    processSubtitle: "Những hình ảnh triển khai giúp tăng độ tin cậy cho sản phẩm.",
    qrTitle: "Liên hệ nhanh",
    qrCaption: "Quét QR để liên hệ nhanh qua Zalo",
    qrDescription: "Mở Zalo để được hỗ trợ demo, tích hợp và triển khai nhanh.",
    brandStory: "BA.SEW tập trung vào trải nghiệm tracking mượt, rõ và dễ dùng cho cả đội vận hành lẫn khách hàng cuối.",

    mapDataAttribution: "Dữ liệu bản đồ: OpenStreetMap, CARTO, Esri",
  },
  en: {
    brand: "BA.SEW",
    webTracking: "BA.SEW Tracking",
    headerDescription: "Track devices in real time with live map view, movement history, and safe-zone controls.",
    mapLiveTitle: "Live Map",
    mapLiveHint: "Map-first layout optimized for both desktop and mobile screens.",
    footerNote: "BA.SEW Tracking - Live view from GPS data.",
    footerCopyright: "© 2026 BA.SEW. All rights reserved.",
    footerCredit: "Dev by Thanh Vũ",
    embedModeLabel: "Embed mode",

    loadingDevices: "Loading devices...",
    noDevices: "No device data available.",
    noDevicesHint: "Please check tracker data ingestion and tracking API status.",
    chooseDevice: "Select a device to view details.",
    deviceLabel: "Selected device",
    selectedDevice: "Device",
    lastUpdated: "Updated at",
    refreshData: "Refresh data",
    refreshingData: "Refreshing...",

    languageToggle: "VI",
    englishLabel: "English",
    vietnameseLabel: "Vietnamese",

    online: "Online",
    offline: "Offline",
    statusOnline: "Online",
    statusOffline: "Offline",
    connectionStatus: "Connection status",
    onlineCountLabel: "devices online",
    unknownSource: "Unknown source",

    searchPlaceholder: "Search for places or addresses...",
    searchButton: "Search",
    searchLoading: "Searching...",
    searchEmpty: "No matching results.",

    historyToggle: "Movement history",
    routeModeOff: "HOME route: Off",
    routeModeSelected: "HOME route: Selected device",
    routeModeAll: "HOME route: All devices",
    satelliteLabel: "Satellite",
    roadmapLabel: "Road map",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    focusSelected: "Focus selected device",

    showPanel: "Show control panel",
    hidePanel: "Hide details",
    expandMap: "Expand map",
    collapseMap: "Show panel",

    renamePlaceholder: "Rename device",
    save: "Save",
    saving: "Saving...",
    fetchCurrentLocation: "Fetch current location",
    fetchingLocation: "Fetching location...",
    latitude: "Latitude",
    longitude: "Longitude",
    satellites: "Satellites",
    speed: "Speed",
    accuracy: "Accuracy",
    sourceLabel: "Source",
    geofence: "Safe zone",
    enabled: "Enabled",
    disabled: "Disabled",
    distanceToHome: "Distance to HOME",
    insideGeofence: "Inside safe zone",
    yes: "Yes",
    no: "No",

    movementHistory: "Movement history",
    historyTitle: "Device timeline",
    pointsLabel: "points",
    loadingHistory: "Loading history...",
    noHistory: "No data in this time range.",
    rangeLabels: {
      "24h": "24 hours",
      "3d": "3 days",
      "7d": "7 days",
    },
    historyStartLabel: "Start",
    historyLatestLabel: "Latest",

    homeLabel: "HOME",
    homeSetLabel: "HOME configured",
    homeUnsetLabel: "HOME not configured",
    cancelPickOnMapBtn: "Cancel map pick",
    homeTitle: "Safe-zone setup",
    homePanelDesc: "Pick directly on map or enter coordinates to define HOME for the device.",
    setHomeBtn: "Save HOME",
    clearHomeBtn: "Clear HOME",
    pickOnMapBtn: "Pick on map",
    pickOnMapHint: "Click on map to select HOME position.",
    latPlaceholder: "Example: 10.901100",
    lngPlaceholder: "Example: 106.806200",
    homeSaved: "HOME saved successfully.",
    homeCleared: "HOME cleared.",
    homeSaving: "Saving HOME...",
    draftPendingLabel: "Pending",
    useCurrentPos: "Use current position",
    geoRadiusLabel: "Safe-zone radius (m)",
    geoRadiusHint: "Set 0 to disable geofence.",

    distanceLabel: "Total distance",
    durationLabel: "Duration",
    routeFallback: "Estimated line",

    tabDevices: "Devices",
    tabHistory: "History",
    tabHome: "Safe zone",
    tabShowcase: "BA.SEW",

    showcaseTitle: "BA.SEW Web Tracking",
    showcaseSubtitle: "A clear and smooth tracking experience ready for real deployments.",
    productsTitle: "Product visuals",
    processTitle: "Real development process",
    processSubtitle: "Field implementation snapshots that prove product maturity.",
    qrTitle: "Quick contact",
    qrCaption: "Scan QR for quick Zalo contact",
    qrDescription: "Open Zalo for demo requests, integrations, and deployment support.",
    brandStory: "BA.SEW focuses on a smooth, clear tracking UX for operators and end users.",

    mapDataAttribution: "Map data: OpenStreetMap, CARTO, Esri",
  },
};

export function formatRelativeAge(ageSeconds: number, locale: Locale) {
  if (ageSeconds < 60) {
    return locale === "vi" ? `${ageSeconds} giây trước` : `${ageSeconds}s ago`;
  }

  if (ageSeconds < 3600) {
    const minutes = Math.floor(ageSeconds / 60);
    return locale === "vi" ? `${minutes} phút trước` : `${minutes}m ago`;
  }

  if (ageSeconds < 86400) {
    const hours = Math.floor(ageSeconds / 3600);
    return locale === "vi" ? `${hours} giờ trước` : `${hours}h ago`;
  }

  const days = Math.floor(ageSeconds / 86400);
  return locale === "vi" ? `${days} ngày trước` : `${days}d ago`;
}

export function formatTimestamp(timestamp: number, locale: Locale, withDate = true) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    ...(withDate ? { day: "2-digit", month: "short" } : {}),
  }).format(timestamp);
}
