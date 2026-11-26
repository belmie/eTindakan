const sql = require('mssql');
const bcrypt = require('bcryptjs');
const fs = require('fs');

let env = {};
try {
  const content = fs.readFileSync('.env', 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2 && !parts[0].startsWith('#')) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
} catch(e) {}

const config = {
  user: env.DB_USER || 'rdsuser',
  password: env.DB_PASSWORD || 'P@$$w0rd2024',
  server: env.DB_SERVER || '202.165.22.1',
  database: env.DB_DATABASE || 'stsm_mains',
  port: parseInt(env.DB_PORT || '1433'),
  options: { encrypt: false, trustServerCertificate: true }
};

async function seedPegawai() {
  const pool = await sql.connect(config);
  const hash = await bcrypt.hash('password', 10);
  
  const existing = await pool.request().query("SELECT username FROM users WHERE username = 'pegawai'");
  if (existing.recordset.length === 0) {
    await pool.request()
      .input('hash', sql.NVarChar, hash)
      .query("INSERT INTO users (username, email, password_hash, full_name, role, bahagian) VALUES ('pegawai', 'pegawai@mains.gov.my', @hash, 'En. Zulkifli bin Ismail (Pegawai Tindakan)', 'pegawai_pelaksana', 'Bahagian Dakwah & Komunikasi')");
    console.log('User pegawai created!');
  } else {
    await pool.request()
      .input('hash', sql.NVarChar, hash)
      .query("UPDATE users SET password_hash = @hash, role = 'pegawai_pelaksana' WHERE username = 'pegawai'");
    console.log('User pegawai updated!');
  }
  process.exit(0);
}

seedPegawai().catch(e => { console.error(e); process.exit(1); });
