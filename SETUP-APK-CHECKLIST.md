# Setup APK dengan Capacitor - Checklist

## 📋 Persiapan

- [ ] Install Android Studio (jika belum ada)
- [ ] Install JDK 11 atau lebih tinggi
- [ ] Pastikan semua dependency project sudah terupdate

---

## 1️⃣ Install Capacitor Packages

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

**Optional (jika mau iOS juga):**

```bash
npm install @capacitor/ios
```

---

## 2️⃣ Buat File Konfigurasi Capacitor

**File baru: `capacitor.config.ts`**

```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.yourname.todoapp", // ← Ganti dengan ID unik kamu
  appName: "Todo App",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
```

---

## 3️⃣ Update `next.config.ts`

**Tambahkan konfigurasi export:**

```typescript
const nextConfig = {
  output: "export", // ← Tambahkan ini
  images: {
    unoptimized: true, // ← Tambahkan ini (karena static export)
  },
  // ... config lainnya tetap
};
```

---

## 4️⃣ Buat Environment Variables

**File baru: `.env.local`**

```bash
# API URL untuk production
NEXT_PUBLIC_API_URL=https://todo-app.vercel.app

# Atau jika pakai domain custom
# NEXT_PUBLIC_API_URL=https://yourdomain.com
```

**File baru: `.env.production`**

```bash
NEXT_PUBLIC_API_URL=https://todo-app.vercel.app
```

---

## 5️⃣ Update Semua API Calls

**Cari semua `fetch('/api/...)` dan ganti dengan:**

```javascript
// Sebelum:
fetch("/api/tasks");

// Sesudah:
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`);
```

**File yang perlu diupdate:**

- [ ] `components/HomeView.tsx`
- [ ] `components/TaskListView.tsx`
- [ ] `components/CalendarView.tsx`
- [ ] `components/ScheduleView.tsx`
- [ ] `components/SettingsView.tsx`
- [ ] `components/AddTaskModal.tsx`
- [ ] `hooks/useNotifications.ts`
- [ ] File lain yang pakai fetch/axios

---

## 6️⃣ Update `package.json` Scripts

**Tambahkan script baru:**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "build:mobile": "next build && npx cap sync",
  "open:android": "npx cap open android",
  "sync:android": "npx cap sync android"
}
```

---

## 7️⃣ Initialize Capacitor Android

```bash
# Build Next.js dulu
npm run build

# Initialize Capacitor
npx cap init

# Tambah platform Android
npx cap add android

# Sync files
npx cap sync
```

---

## 8️⃣ Konfigurasi Android (Optional tapi Recommended)

**Edit: `android/app/src/main/AndroidManifest.xml`**

Tambahkan permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

---

## 9️⃣ Build APK

**Via Android Studio:**

```bash
npm run open:android
```

Lalu di Android Studio:

1. Build → Generate Signed Bundle/APK
2. Pilih APK
3. Follow wizard
4. APK ada di: `android/app/build/outputs/apk/debug/app-debug.apk`

**Via Command Line (Debug APK):**

```bash
cd android
./gradlew assembleDebug
```

---

## 🔟 Testing & Installation

- [ ] Copy APK ke HP (via USB/Drive/WhatsApp)
- [ ] Enable "Install from Unknown Sources" di HP
- [ ] Install APK
- [ ] Test semua fitur:
  - [ ] Add task
  - [ ] Delete task
  - [ ] Update task
  - [ ] Calendar view
  - [ ] Notifications
  - [ ] Settings

---

## 📦 Plugin Tambahan (Optional - Nanti)

### Notifications

```bash
npm install @capacitor/push-notifications
```

### Calendar Access

```bash
npm install @capacitor-community/calendar
```

### Widget (Advanced)

```bash
npm install capacitor-widgetkit
```

---

## 🔔 FCM Push Notifikasi di Android (Browser / PWA)

Kalau notifikasi jalan di komputer tapi **gagal di Android** (browser atau saat buka dari “Add to Home Screen”):

1. **HTTPS wajib**  
   FCM hanya jalan di HTTPS. Kalau pakai `npm run dev` dan akses dari HP, gunakan URL HTTPS (mis. tunnel seperti ngrok) atau deploy ke Vercel lalu akses dari HP lewat URL production.

2. **VAPID key**  
   Di `.env` harus ada:

   ```bash
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-key-pair
   ```

   Ambil dari: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Key pair.

3. **Coba dari browser dulu, bukan hanya PWA**  
   Buka situs lewat **Chrome address bar** (bukan ikon “app” dari home screen), izinkan notifikasi, lalu tes. Kalau sudah jalan, baru tes lagi dari ikon PWA.

4. **Lihat error asli**  
   Di Settings → “Send Test Notification”, kalau gagal sekarang pesan error (mis. Service Worker gagal / FCM token gagal) akan tampil. Catat pesan itu untuk debug.

5. **Service worker tidak di-unregister**  
   Kode sekarang tidak lagi menghapus semua service worker (yang bikin Android/PWA rusak). Hanya FCM SW yang didaftarkan/dipakai.

6. **Cache service worker**  
   Di Android, coba: Chrome → Settings → Site settings → [situs kamu] → Clear & reset, lalu buka lagi dan izinkan notifikasi.

7. **Reminder terjadwal**  
   Reminder disimpan di DB dan dikirim oleh endpoint `/api/notifications/dispatch`:
   - **Vercel Hobby:** Cron hanya boleh **sekali per hari**. Di `vercel.json` dipakai jadwal `0 8 * * *` (sekali sehari ~08:00 UTC). Reminder yang jatuh tempo akan dikirim saat cron jalan (jadi bisa telat sampai 24 jam). Supaya reminder lebih tepat waktu, pakai **cron eksternal** (lihat bawah).
   - **Vercel Pro:** Bisa ganti di `vercel.json` ke `* * * * *` (tiap menit). Set env **CRON_SECRET** (min 16 karakter) di project settings.
   - **Cron eksternal (gratis, untuk Hobby):** Agar reminder tiap menit/beberapa menit jalan tanpa upgrade Pro:
     1. Buat akun di [cron-job.org](https://cron-job.org) (gratis).
     2. Buat job baru: URL `https://<domain-kamu>.vercel.app/api/notifications/dispatch`, method **GET**, jadwal tiap 1–5 menit.
     3. Di Vercel set env **CRON_SECRET** (string rahasia, min 16 karakter).
     4. Di cron-job.org tambah header: **Authorization** = `Bearer <CRON_SECRET yang sama>`.
     Setelah itu dispatch dipanggil oleh cron-job.org, reminder terkirim tepat waktu.
   - **Development (`npm run dev`):** Aplikasi memanggil dispatch tiap 1 menit dari client agar reminder jalan saat testing.

---

## ⚠️ Troubleshooting

### Error: "window is not defined"

- Pastikan kode yang pakai `window` dibungkus:
  ```javascript
  if (typeof window !== "undefined") {
    // kode yang pakai window
  }
  ```

### Error saat build

- Hapus folder `.next` dan `out`
- Run `npm run build:mobile` lagi

### APK tidak connect ke API

- Cek `NEXT_PUBLIC_API_URL` sudah benar
- Cek HP tersambung internet
- Cek CORS di Vercel (allow mobile origin)

---

## 📝 Notes

- Vercel tetap running untuk API/backend
- APK cuma frontend, masih butuh internet untuk CRUD
- Untuk production, build Release APK (bukan Debug)
- Untuk Play Store, perlu keystore & signing

---

## 🚀 Deployment Flow

1. **Web Version**: Push ke GitHub → Auto deploy ke Vercel
2. **APK Version**:
   - Build APK lokal
   - Share manual atau upload ke Play Store
   - User install manual

---

## ✅ Checklist Akhir

- [ ] APK berhasil di-build
- [ ] APK bisa di-install di HP
- [ ] Semua fitur CRUD jalan
- [ ] Notifications jalan (jika sudah setup)
- [ ] UI responsive di HP
- [ ] Tidak ada error di logcat
- [ ] Performance smooth

---

**Estimasi Total Waktu: 1-2 jam**

Good luck! 🎉
