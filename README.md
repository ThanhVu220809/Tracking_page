# BA.SEW Web Tracking

Repo web tracking BA.SEW, san sang deploy len GitHub Pages bang GitHub Actions.

## Noi dung chinh

- `src/app`: app shell, state va layout chinh.
- `src/features/map`: ban do tracking.
- `src/features/devices`: danh sach va chi tiet thiet bi.
- `src/features/history`: lich su di chuyen.
- `src/features/home`: HOME/geofence.
- `src/features/branding`: showcase logo, anh san pham va QR.
- `src/img`: logo va anh can dung cho tracking.
- `.github/workflows/deploy-pages.yml`: tu dong build va deploy GitHub Pages.

Tab browser va header tracking dung logo BA.SEW tu `src/img/logo.png`.

## Deploy GitHub Pages

1. Tao repo GitHub rieng cho tracking.
2. Upload toan bo noi dung ben trong folder `web-tracking` len root repo moi.
3. Vao `Settings -> Pages`.
4. O `Build and deployment`, chon `Source: GitHub Actions`.
5. Neu can doi backend API, vao `Settings -> Secrets and variables -> Actions -> Variables`, them:

```env
TRACKER_API_BASE=https://your-worker-domain.example.com
```

Neu khong set bien nay, app se dung API mac dinh trong `webpack.config.cjs`.

Sau khi push len `main` hoac `master`, workflow se build va deploy thu muc `dist` len GitHub Pages.

## Chay local

```bash
npm install
npm run dev
```

Mac dinh dev server chay o:

```text
http://localhost:3000
```

## API dang dung

- `GET /api/devices`
- `GET /api/location?deviceId=...`
- `GET /api/history?deviceId=...&from=...&to=...&limit=...`
- `POST /api/device/rename`

## Build local

```bash
npm run build
```

Khong upload `node_modules` hoac `dist`; GitHub Actions se tu cai dependencies va build lai.
