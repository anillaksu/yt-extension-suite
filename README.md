# YouTube Media Player Accelerator & Monetized Extension Suite

Ticari kullanıma ve Shopify satışına uygun, Google Cloud Run ve Firestore üzerinde çalışan lisans doğrulama altyapısına sahip Manifest V3 Chrome Uzantısı.

---

## 📁 Proje Dizin Yapısı

```
D:/yt-extension-507011/
├── backend/                       # Cloud Run Lisans & Webhook Mikroservisi
│   ├── server.js                  # Express API (Shopify Webhook + Verify)
│   ├── package.json               # Bağımlılıklar (Firestore, Express, Helmet, CORS)
│   ├── Dockerfile                 # Node 20 Alpine Cloud Run Container
│   └── .env.example               # Örnek çevre değişkenleri
├── extension/                     # Chrome Manifest V3 Uzantısı
│   ├── manifest.json              # Uzantı manifesti (MAIN world script + DNR rules)
│   ├── interceptor.js             # 0ms gecikmesiz YouTube Player API yakalayıcı (MAIN)
│   ├── content.js                 # Statik reklam temizleyici & Anti-adblock kalkanı
│   ├── background.js              # Cihaz parmak izi & lisans senkronizasyonu
│   ├── rules.json                 # Ağ seviyesinde reklam & tracker engelleme
│   ├── popup/                     # Kullanıcı arayüzü (HTML, CSS, JS)
│   └── icons/                     # 16x16, 48x48, 128x128 PNG ikonları
├── scripts/
│   ├── build-extension.js         # Kod şifreleme (Obfuscation) & ZIP paketleyici
│   ├── generate-icons.js          # İkon oluşturucu
│   └── deploy-gcp.ps1             # Otomatik GCP Cloud Run canlıya alma scripti
├── dist/                          # Derlenmiş ve şifrelenmiş mağaza paketi
│   ├── extension/                 # Mağazaya yüklenebilecek açılmış klasör
│   └── yt-accelerator-extension-v1.0.0.zip
└── package.json                   # Kök yönetim ve derleme komutları
```

---

## 🚀 Hızlı Başlangıç

### 1. Uzantıyı Derleme & Şifreleme (Obfuscation)
```bash
npm run build
```
Bu komut `interceptor.js` ve `content.js` dosyalarını tersine mühendisliğe karşı şifreler, `dist/` klasörüne çıkarır ve `dist/yt-accelerator-extension-v1.0.0.zip` paketini oluşturur.

### 2. Backend'i Yerel Olarak Çalıştırma
```bash
cd backend
npm run dev
```
Servis `http://localhost:8080` üzerinde dinlemeye başlar.

### 3. Google Cloud Run'a Tek Tıkla Canlıya Alma
PowerShell üzerinden:
```powershell
npm run deploy:gcp
```
veya doğrudan:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-gcp.ps1
```

---

## 🛍️ Shopify Webhook Kurulumu

1. Shopify Yönetici Panelinize gidin: **Ayarlar (Settings) > Bildirimler (Notifications) > Webhook'lar (Webhooks)**.
2. **Webhook Oluştur (Create Webhook)** butonuna tıklayın:
   - **Olay (Event):** `Sipariş ödendi (Order creation / Order payment)`
   - **Biçim (Format):** `JSON`
   - **URL:** `https://<CLOUD_RUN_URL>/api/shopify/order-paid`
   - **Webhook API sürümü:** En güncel kararlı sürüm
3. Webhook imzalama gizli anahtarını (Webhook signing secret) `backend/.env` içindeki `SHOPIFY_WEBHOOK_SECRET` alanına ekleyin.
