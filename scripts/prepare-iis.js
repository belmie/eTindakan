const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');

console.log('=== MENYEDIAKAN PAKEJ STANDALONE UNTUK IIS (PORT 5130) ===');

if (!fs.existsSync(standaloneDir)) {
  console.error('Ralat: Direktori .next/standalone tidak wujud. Sila jalankan `npm run build` terlebih dahulu.');
  process.exit(1);
}

// 1. Copy .next/static to .next/standalone/.next/static
if (fs.existsSync(staticSrc)) {
  console.log('1. Menyalin .next/static ke .next/standalone/.next/static...');
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log('   ✓ Static assets berjaya disalin.');
}

// 2. Copy public to .next/standalone/public
if (fs.existsSync(publicSrc)) {
  console.log('2. Menyalin public ke .next/standalone/public...');
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log('   ✓ Public files berjaya disalin.');
}

// 3. Salin web.config ke standalone
const webConfigSrc = path.join(rootDir, 'web.config');
const webConfigDest = path.join(standaloneDir, 'web.config');
if (fs.existsSync(webConfigSrc)) {
  console.log('3. Menyalin web.config ke .next/standalone/web.config...');
  fs.copyFileSync(webConfigSrc, webConfigDest);
  console.log('   ✓ web.config berjaya disalin (Reverse Proxy ke Port 5130).');
}

// 4. Konfigurasi PORT 5130 untuk server.js
const standaloneEnvPath = path.join(standaloneDir, '.env');
let envContent = fs.existsSync(standaloneEnvPath) ? fs.readFileSync(standaloneEnvPath, 'utf8') : '';
if (/^PORT=\d+/m.test(envContent)) {
  envContent = envContent.replace(/^PORT=\d+/m, 'PORT=5130');
} else {
  envContent += '\nPORT=5130\n';
}
envContent = envContent.replace(/^DB_PORT=5130/m, 'DB_PORT=1433');
fs.writeFileSync(standaloneEnvPath, envContent, 'utf8');
console.log('4. Menetapkan PORT=5130 dalam .next/standalone/.env...');
console.log('   ✓ Port lalai ditetapkan ke 5130.');

// 5. Pastikan server.js menggunakan port 5130 sebagai lalai
const standaloneServerJsPath = path.join(standaloneDir, 'server.js');
if (fs.existsSync(standaloneServerJsPath)) {
  let serverJsContent = fs.readFileSync(standaloneServerJsPath, 'utf8');
  serverJsContent = serverJsContent.replace('parseInt(process.env.PORT, 10) || 3000', 'parseInt(process.env.PORT, 10) || 5130');
  fs.writeFileSync(standaloneServerJsPath, serverJsContent, 'utf8');
  console.log('5. Mengemas kini server.js lalai port ke 5130...');
}

console.log('\n✓ Pakej IIS Standalone telah sedia di direktori: .next/standalone');
console.log('Anda boleh menjalankan frontend produksi menggunakan:');
console.log('  cd .next/standalone');
console.log('  node server.js   --> Akan berjalan di http://localhost:5130\n');
