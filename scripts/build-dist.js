const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

console.log('========================================================');
console.log('  MEMBINA PAKEJ PENGELUARAN PENUH UNTUK IIS (DIST)     ');
console.log('========================================================\n');

// 1. Jalankan build:iis terlebih dahulu
console.log('1. Menjalankan Next.js Production Build...');
execSync('npm run build:iis', { stdio: 'inherit', cwd: rootDir });

// 2. Bersihkan dan cipta folder dist
console.log('\n2. Menyediakan folder dist/ ...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 3. Salin kandungan .next/standalone ke dist
console.log('3. Menyalin fail teras standalone ke dist/ ...');
fs.cpSync(standaloneDir, distDir, { recursive: true });

// 4. Salin server backend ke dist/server
console.log('4. Menyalin fail backend API ke dist/server/ ...');
const serverSrc = path.join(rootDir, 'server');
const serverDest = path.join(distDir, 'server');
fs.cpSync(serverSrc, serverDest, { recursive: true });

// 5. Salin web.config ke root dist
console.log('5. Menyediakan web.config untuk IIS ...');
const webConfigSrc = path.join(rootDir, 'web.config');
const webConfigDest = path.join(distDir, 'web.config');
if (fs.existsSync(webConfigSrc)) {
  fs.copyFileSync(webConfigSrc, webConfigDest);
  console.log('   ✓ web.config (Reverse Proxy Port 5130) sedia.');
}

// 6. Selaraskan konfigurasi .env dalam dist
console.log('6. Menyelaraskan dist/.env ...');
const envDest = path.join(distDir, '.env');
let envContent = fs.existsSync(envDest) ? fs.readFileSync(envDest, 'utf8') : '';
if (/^PORT=\d+/m.test(envContent)) {
  envContent = envContent.replace(/^PORT=\d+/m, 'PORT=5130');
} else {
  envContent += '\nPORT=5130\n';
}
envContent = envContent.replace(/^DB_PORT=5130/m, 'DB_PORT=1433');
fs.writeFileSync(envDest, envContent, 'utf8');

// 7. Pastikan server.js guna 5130 sebagai default
const serverJsDest = path.join(distDir, 'server.js');
if (fs.existsSync(serverJsDest)) {
  let sContent = fs.readFileSync(serverJsDest, 'utf8');
  sContent = sContent.replace('parseInt(process.env.PORT, 10) || 3000', 'parseInt(process.env.PORT, 10) || 5130');
  fs.writeFileSync(serverJsDest, sContent, 'utf8');
}

// 8. Lengkapkan modul backend pengeluaran ke dist/node_modules
console.log('7. Melengkapkan modul pengeluaran ke dist/node_modules/ ...');
try {
  const rootNm = path.join(rootDir, 'node_modules');
  const distNm = path.join(distDir, 'node_modules');
  if (!fs.existsSync(distNm)) fs.mkdirSync(distNm, { recursive: true });

  const entries = fs.readdirSync(rootNm);
  const exclude = ['@eslint', '@types', 'eslint', 'typescript', 'tailwindcss', 'postcss', 'prettier', 'jest', 'turbo'];

  for (const entry of entries) {
    if (exclude.some(x => entry.startsWith(x))) continue;
    const srcPath = path.join(rootNm, entry);
    const destPath = path.join(distNm, entry);
    if (!fs.existsSync(destPath)) {
      try {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } catch (err) {}
    }
  }
  console.log('   ✓ Pustaka pengeluaran siap disalin.');
} catch (e) {
  console.warn('   ⚠ Nota modul:', e.message);
}

// 9. Cipta fail pelancar 1-klik (start-server.bat)
console.log('8. Mencipta fail permulaan 1-klik (start-server.bat)...');
const batContent = `@echo off
title STSM MAINS - Pelayan Pengeluaran (Port 5130)
echo ========================================================
echo   STSM MAINS - Memulakan Servis Pengeluaran
echo ========================================================
echo.
echo [1/2] Memulakan Backend Express API (Port 3001)...
start "STSM Backend (3001)" cmd /k "node server/index.js"
timeout /t 2 /nobreak > nul

echo [2/2] Memulakan Frontend Next.js (Port 5130)...
start "STSM Frontend (5130)" cmd /k "node server.js"

echo.
echo ========================================================
echo   Servis Berjaya Dijalankan!
echo   Frontend : http://localhost:5130
echo   Backend  : http://localhost:3001
echo ========================================================
pause
`;
fs.writeFileSync(path.join(distDir, 'start-server.bat'), batContent, 'utf8');

// 10. Cipta ecosystem.config.js untuk PM2
console.log('9. Mencipta konfigurasi PM2 (ecosystem.config.js)...');
const ecoContent = `module.exports = {
  apps: [
    {
      name: "stsm-frontend",
      script: "server.js",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PORT: 5130,
        NODE_ENV: "production"
      }
    },
    {
      name: "stsm-backend",
      script: "server/index.js",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PORT: 3001,
        NODE_ENV: "production"
      }
    }
  ]
};
`;
fs.writeFileSync(path.join(distDir, 'ecosystem.config.js'), ecoContent, 'utf8');

// 11. Cipta panduan teks PANDUAN_SETUP_IIS.txt
console.log('10. Mencipta fail ringkas PANDUAN_SETUP_IIS.txt...');
const txtGuide = `================================================================================
   PANDUAN SETUP MANUAL SISTEM STSM DI PELAYAN WINDOWS IIS SERVER
================================================================================

Folder "dist" ini mengandungi keseluruhan sistem STSM yang telah siap dibina
untuk pengeluaran (Turnkey Production Package).

--------------------------------------------------------------------------------
LANGKAH 1: SALIN FOLDER INI KE PELAYAN IIS
--------------------------------------------------------------------------------
1. Salin keseluruhan isi kandungan folder "dist" ini ke pelayan anda, contohnya ke:
   C:\\inetpub\\wwwroot\\stsm-mains\\

--------------------------------------------------------------------------------
LANGKAH 2: SETUP LAMAN WEB DI IIS MANAGER
--------------------------------------------------------------------------------
1. Buka IIS Manager (Run -> inetmgr).
2. Pastikan modul berikut telah dipasang di pelayan:
   - URL Rewrite 2.1
   - Application Request Routing (ARR) 3.0 (Enable Proxy: True)
3. Klik kanan "Sites" -> "Add Website...".
4. Masukkan maklumat:
   - Site Name     : STSM-MAINS
   - Physical Path : C:\\inetpub\\wwwroot\\stsm-mains\\ (folder dist yang anda salin)
   - Binding       : Port 80 (atau nama domain cth: stsm.mains.gov.my)
5. Klik OK.
   (Fail web.config yang disertakan akan terus memproksikan trafik ke Port 5130)

--------------------------------------------------------------------------------
LANGKAH 3: MENJALANKAN APLIKASI
--------------------------------------------------------------------------------
Pilihan A (Paling Mudah):
- Dwiklik sahaja pada fail "start-server.bat". Kedua-dua Frontend (5130) dan
  Backend (3001) akan berjalan serentak.

Pilihan B (Gunakan PM2 - Disyorkan untuk Windows Server):
- Buka command prompt di folder ini dan jalankan:
    pm2 start ecosystem.config.js
    pm2 save

--------------------------------------------------------------------------------
SELESAI!
Sistem kini boleh dilayari melalui pelayan IIS anda.
================================================================================
`;
fs.writeFileSync(path.join(distDir, 'PANDUAN_SETUP_IIS.txt'), txtGuide, 'utf8');

console.log('\n========================================================');
console.log('✓ BINAAN SELESAI DENGAN JAYANYA!');
console.log('Pakej manual upload IIS sedia di dalam folder: dist/');
console.log('========================================================\n');
