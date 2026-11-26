const fs = require('fs');
const sql = require('mssql');

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const dbConfig = {
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  server: env.DB_SERVER,
  database: env.DB_DATABASE,
  port: parseInt(env.DB_PORT || '1433'),
  options: { encrypt: false, trustServerCertificate: true }
};

async function runMigration() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Connected to MSSQL...');

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'surat_masuk' AND COLUMN_NAME = 'no_daftar')
        ALTER TABLE surat_masuk ADD no_daftar NVARCHAR(100) NULL;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'surat_masuk' AND COLUMN_NAME = 'tarikh_selesai')
        ALTER TABLE surat_masuk ADD tarikh_selesai DATE NULL;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'surat_masuk' AND COLUMN_NAME = 'penerima_data')
        ALTER TABLE surat_masuk ADD penerima_data NVARCHAR(MAX) NULL;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'surat_masuk' AND COLUMN_NAME = 'log_data')
        ALTER TABLE surat_masuk ADD log_data NVARCHAR(MAX) NULL;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'surat_masuk' AND COLUMN_NAME = 'catatan')
        ALTER TABLE surat_masuk ADD catatan NVARCHAR(MAX) NULL;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'surat_masuk' AND COLUMN_NAME = 'surat_berkaitan_id')
        ALTER TABLE surat_masuk ADD surat_berkaitan_id INT NULL;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'hubungan_organisasi')
      BEGIN
        CREATE TABLE hubungan_organisasi (
          id NVARCHAR(50) PRIMARY KEY,
          nama NVARCHAR(150),
          tel NVARCHAR(50),
          emel NVARCHAR(150),
          cc NVARCHAR(150),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
      END
    `);

    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
