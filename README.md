# BA.SEW Tracking Map

**Web map realtime theo dõi thiết bị SOS/GPS BA.SEW** — mở trình duyệt là xem vị trí, không cần cài app.

<p align="center">
  <a href="https://thanhvu220809.github.io/Tracking_page/">
    <img alt="Live" src="https://img.shields.io/badge/Live-thanhvu220809.github.io-2ea44f?style=for-the-badge&logo=githubpages&logoColor=white" />
  </a>
  <img alt="Leaflet" src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img alt="OpenStreetMap" src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white" />
</p>

<p align="center">
  <strong><a href="https://thanhvu220809.github.io/Tracking_page/">→ Mở bản đồ live</a></strong>
</p>

---

## Đây là gì?

Repo này là **bản production build** của webtool theo dõi GPS — static files deploy lên GitHub Pages.

Người thân / admin mở link → thấy:

- Danh sách thiết bị online/offline
- Marker vị trí hiện tại trên **Leaflet + OpenStreetMap**
- Lịch sử di chuyển / route
- Trạng thái geofence (trong/ngoài vùng an toàn)
- Đổi tên thiết bị, lọc khoảng thời gian lịch sử

Firmware ESP32 POST toạ độ lên backend; map này **poll / đọc API** và vẽ.

---

## Chỗ đứng trong hệ sinh thái BA.SEW

```text
┌─────────────────┐     HTTP POST /update      ┌──────────────────────┐
│  ESP32-S3       │ ─────────────────────────► │  Cloudflare Worker   │
│  GPS + 4G/WiFi  │                            │  hoặc selfhost-relay │
│  SOS button     │ ◄──── config / portal ──── │  (KV / JSON store)   │
└─────────────────┘                            └──────────┬───────────┘
                                                          │
                     GET /api/devices · /api/location     │
                     GET /api/history · rename            │
                                                          ▼
                                               ┌──────────────────────┐
                                               │  Tracking_page       │
                                               │  (repo này · Pages)  │
                                               │  Leaflet map UI      │
                                               └──────────────────────┘
                                                          ▲
                                                          │ deep-link
                                               ┌──────────────────────┐
                                               │  Landing_page        │
                                               │  section “Trải nghiệm”│
                                               └──────────────────────┘
```

| Repo | Vai trò |
|---|---|
| [`esp32_sim_neo10`](https://github.com/ThanhVu220809/esp32_sim_neo10) | Firmware + Worker + **source webtool** |
| [`Landing_page`](https://github.com/ThanhVu220809/Landing_page) | Landing bán hàng, link sang map này |
| **Tracking_page (here)** | Host tĩnh map production |

Source React của map nằm trong firmware monorepo:  
`esp32_sim_neo10/webtool/` — repo này chỉ giữ **artifact deploy** để Pages phục vụ nhanh, ổn định.

---

## API mà map đang nói chuyện

Backend (Worker / relay) expose:

| Method | Path | Mục đích |
|---|---|---|
| `GET` | `/api/devices` | Danh sách thiết bị + last fix |
| `GET` | `/api/location?deviceId=` | Vị trí hiện tại 1 máy |
| `GET` | `/api/history?deviceId=&from=&to=&limit=` | Trail lịch sử |
| `POST` | `/api/device/rename` | Đổi tên hiển thị |
| `POST` | `/update` | Firmware đẩy điểm GPS (không gọi từ UI) |

Payload thiết bị gồm: lat/lng, timestamp, satellites, speed, nguồn định vị, geofence home/radius/inside, online age…

---

## UX đáng chú ý

- **Boot status card** — nếu JS lỗi trước khi React mount, user vẫn thấy lý do (không màn hình trắng)
- Map tiles OSM · marker custom · panel thiết bị
- Phù hợp demo “không cần app” trên mobile browser

---

## Deploy

GitHub Pages, source: branch `main` (static root).

```text
https://thanhvu220809.github.io/Tracking_page/
```

Khi rebuild từ `esp32_sim_neo10/webtool`:

```bash
cd webtool
npm ci
# TRACKER_API_BASE=https://your-worker.example.com
npm run build
# copy dist/* → repo Tracking_page → push
```

---

## Bảo mật / vận hành (ghi chú)

- API base URL được bake vào bundle lúc build — rotate Worker URL thì cần rebuild
- Không commit secret; Worker dùng Cloudflare KV / token riêng phía edge
- Pages chỉ host static — zero server cost cho frontend

---

<p align="center">
  Open the map · watch the device · <strong>no app install</strong>
</p>
