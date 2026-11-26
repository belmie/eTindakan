# Panduan Deployment Sistem STSM di Windows IIS Server (Port 5130)

Panduan ini menerangkan langkah-langkah menyediakan dan menjalankan sistem **STSM (Sistem Tindakan Surat Masuk)** di atas **Microsoft IIS (Internet Information Services)** pada Windows Server menggunakan **Port 5130**.

---

## 1. Keperluan Awal (Prerequisites)

Sebelum memulakan, pastikan pelayan Windows Server mempunyai:
1. **Node.js** (Versi 18 LTS atau 20+ LTS).
2. **Microsoft IIS** dengan modul berikut diaktifkan:
   - **URL Rewrite Module 2.1** ([Download dari Microsoft](https://www.iis.net/downloads/microsoft/url-rewrite))
   - **Application Request Routing (ARR) 3.0** ([Download dari Microsoft](https://www.iis.net/downloads/microsoft/application-request-routing))
3. **PM2** (Process Manager) untuk memastikan aplikasi sentiasa berjalan di latar belakang:
   ```cmd
   npm install -g pm2
   npm install -g pm2-windows-service
   ```

---

## 2. Cara Membina Projek (Build)

Jalankan arahan berikut di terminal projek:
```cmd
npm run build:iis
```
Arahan ini akan:
1. Mengkompil kod Next.js ke mod produksi optimum.
2. Menjana fail binaan kendiri (*standalone*) dalam `.next/standalone`.
3. Menyalin semua fail statik (`public`, `.next/static`) dan `web.config` ke dalam folder standalone.
4. Menetapkan port lalai ke **Port 5130**.

---

## 3. Konfigurasi Application Request Routing (ARR) di IIS

1. Buka **IIS Manager** (`inetmgr`).
2. Di panel kiri, klik pada **Server Name** (nama pelayan anda).
3. Di panel tengah, dwiklik pada **Application Request Routing (ARR)**.
4. Di panel kanan (Actions), klik **Server Proxy Settings...**.
5. Tandakan (tick) pada checkbox **Enable proxy**.
6. Klik **Apply** di panel kanan atas.

---

## 4. Setup Laman Web di IIS

1. Di **IIS Manager**, klik kanan pada **Sites** > **Add Website...**.
2. Masukkan maklumat:
   - **Site name**: `STSM-MAINS`
   - **Physical path**: `C:\Users\user\Desktop\My WorkBench\Sistem Surat Masuk\.next\standalone` (atau folder salinan anda di `C:\inetpub\wwwroot\stsm\`)
   - **Binding**: Port `80` atau nama domain (contoh: `stsm.mains.gov.my`).
3. Klik **OK**.
4. Fail `web.config` yang telah disediakan akan automatik mengarahkan trafik (reverse proxy) daripada port 80 ke servis Next.js di **`http://localhost:5130`**.

---

## 5. Menjalankan Servis Aplikasi Menggunakan PM2

Gunakan fail konfigurasi `ecosystem.config.js` yang telah disediakan untuk menjalankan kedua-dua frontend (port 5130) dan backend (port 3001):

```cmd
# Jalankan kedua-dua frontend (port 5130) dan backend (port 3001)
pm2 start ecosystem.config.js

# Simpan senarai proses PM2
pm2 save

# Semak status servis
pm2 status
```

### Atau Menjalankan Secara Manual:
1. **Frontend (Port 5130)**:
   ```cmd
   cd .next\standalone
   node server.js
   ```
2. **Backend (Port 3001)**:
   ```cmd
   node server/index.js
   ```

---

## 6. Ringkasan Senibina Aliran Trafik

```
Pengguna Pelayar (Browser)
       │
       ▼
[ Pelayan IIS ] (Port 80 / 443 HTTPS)
       │  (Melalui web.config Reverse Proxy)
       ▼
[ Next.js Standalone ] (Port 5130)
       │  (Routing API / Uploads)
       ▼
[ Express Backend ] (Port 3001)
       │
       ▼
[ Microsoft SQL Server ] (Port 1433)
```
