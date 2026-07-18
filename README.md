# BA.SEW Tracking Map

### Theo dõi GPS realtime trên trình duyệt — không cần cài app

<p align="center">
  <a href="https://thanhvu220809.github.io/Tracking_page/">
    <img src="https://img.shields.io/badge/🟢_Live_Map-Open_now-22c55e?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white" alt="OSM" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
</p>

<p align="center">
  <strong><a href="https://thanhvu220809.github.io/Tracking_page/">→ Mở bản đồ production</a></strong>
</p>

---

## ✨ Một dòng

Web map cho thiết bị **BA.SEW SOS/GPS**: xem vị trí hiện tại, lịch sử di chuyển, trạng thái online & geofence — mở link là dùng, zero install.

---

## 🗺️ Người dùng thấy gì

<table>
<tr>
<td width="50%" valign="top">

### Thiết bị
- Danh sách máy, online / offline  
- Đổi tên hiển thị  
- Last fix, tốc độ, số vệ tinh  
- Nguồn định vị & độ chính xác  

</td>
<td width="50%" valign="top">

### Bản đồ
- Marker vị trí realtime  
- Trail / lịch sử theo khung giờ  
- Geofence: trong / ngoài vùng nhà  
- Tile **OpenStreetMap** mượt  

</td>
</tr>
</table>

### UX tin cậy
Nếu JS lỗi trước khi app mount → **màn hình trạng thái boot** giải thích lỗi (không trang trắng).

---

## 🏗️ Công nghệ

```text
┌──────────────────┐         ┌───────────────────┐         ┌──────────────────┐
│  ESP32 tracker   │  POST   │  Edge backend     │   GET   │  Tracking Map    │
│  GPS + 4G/WiFi   │ ──────► │  Worker / relay   │ ──────► │  (repo này)      │
│  SOS device      │         │  store last+hist  │         │  Leaflet · React │
└──────────────────┘         └───────────────────┘         └──────────────────┘
```

| Tầng | Công nghệ |
|------|-----------|
| Map | **Leaflet** · OpenStreetMap tiles |
| UI | React · panel thiết bị · route modes |
| Hosting | **GitHub Pages** (static, zero server cost) |
| Data API | Cloudflare Workers **hoặc** self-host relay |
| Thiết bị | ESP32-S3 firmware (repo riêng) |

### API surface (backend)

| | Việc |
|--|------|
| Danh sách thiết bị | Last position + metadata |
| Vị trí 1 máy | Fix hiện tại |
| Lịch sử | Trail theo `from` / `to` / limit |
| Đổi tên | Rename hiển thị |
| Ingest (firmware) | `POST` điểm GPS từ field |

---

## 🔗 Hệ sinh thái

| Project | Vai trò |
|---------|---------|
| **[esp32_sim_neo10](https://github.com/ThanhVu220809/esp32_sim_neo10)** | Firmware + backend + source webtool |
| **[Landing_page](https://github.com/ThanhVu220809/Landing_page)** | Landing bán hàng · deep-link sang map |
| **Tracking_page (here)** | Host production map cho end-user |

```text
  Landing  ──“Trải nghiệm”──►  Tracking Map  ◄──API──  Cloud
                                    ▲
                              ESP32 field devices
```

---

## 🚀 Production

| | |
|--|--|
| **URL** | [thanhvu220809.github.io/Tracking_page](https://thanhvu220809.github.io/Tracking_page/) |
| **Loại** | Static SPA trên GitHub Pages |
| **Chi phí FE** | $0 hosting |
| **Bí mật** | Không embed service key — chỉ public API base |

---

## 💡 Vì sao tách repo map?

- Deploy Pages **nhanh & ổn** (artifact tĩnh)  
- Landing / firmware ship độc lập  
- Người thân chỉ cần **một URL** — không App Store, không login bắt buộc phía UI  

---

<p align="center">
  <sub>Open the map · watch the device · <strong>no app install</strong></sub>
</p>
