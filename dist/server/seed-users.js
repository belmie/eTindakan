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

async function updatePasswords() {
  const pool = await sql.connect(config);
  const hash = await bcrypt.hash('password', 10);
  
  // Update admin password
  await pool.request()
    .input('hash', sql.NVarChar, hash)
    .query("UPDATE users SET password_hash = @hash WHERE username = 'admin'");
  console.log('Admin password updated to password');

  // Check existing users
  const existing = await pool.request().query("SELECT username FROM users");
  const usernames = existing.recordset.map(u => u.username);

  if (!usernames.includes('ketua')) {
    await pool.request()
      .input('hash', sql.NVarChar, hash)
      .query("INSERT INTO users (username, email, password_hash, full_name, role, bahagian) VALUES ('ketua', 'ketua@mains.gov.my', @hash, 'Ustaz Ahmad Farhan (Ketua Unit)', 'ketua_unit', 'Bahagian Agihan & Zakat')");
    console.log('Ketua user created');
  } else {
    await pool.request()
      .input('hash', sql.NVarChar, hash)
      .query("UPDATE users SET password_hash = @hash WHERE username = 'ketua'");
    console.log('Ketua password updated');
  }

  if (!usernames.includes('kerani')) {
    await pool.request()
      .input('hash', sql.NVarChar, hash)
      .query("INSERT INTO users (username, email, password_hash, full_name, role, bahagian) VALUES ('kerani', 'kerani@mains.gov.my', @hash, 'Puan Siti Aminah (Kerani)', 'kerani', 'Unit Pendaftaran Surat')");
    console.log('Kerani user created');
  } else {
    await pool.request()
      .input('hash', sql.NVarChar, hash)
      .query("UPDATE users SET password_hash = @hash WHERE username = 'kerani'");
    console.log('Kerani password updated');
  }

  console.log('All users successfully verified!');
  process.exit(0);
}

updatePasswords().catch(e => {
  console.error('Error updating users:', e);
  process.exit(1);
});
