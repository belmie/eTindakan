const sql = require('mssql');
const fs = require('fs');
const path = require('path');

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

async function clearDummyData() {
  console.log('Connecting to MSSQL...');
  const pool = await sql.connect(config);

  // Check foreign keys referencing surat_masuk
  const fks = await pool.request().query(`
    SELECT 
      OBJECT_NAME(f.parent_object_id) AS TableName,
      COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
      OBJECT_NAME (f.referenced_object_id) AS ReferenceTableName
    FROM sys.foreign_keys AS f
    INNER JOIN sys.foreign_key_columns AS fc 
      ON f.OBJECT_ID = fc.constraint_object_id
    WHERE OBJECT_NAME (f.referenced_object_id) = 'surat_masuk'
  `);
  console.log('Foreign keys referencing surat_masuk:', fks.recordset);

  console.log('\n--- Deleting dummy transactions ---');
  
  // 1. Delete notifikasi
  const resNoti = await pool.request().query('DELETE FROM notifikasi');
  console.log(`Deleted ${resNoti.rowsAffected[0]} from notifikasi`);

  // 2. Delete maklum_balas
  const resMB = await pool.request().query('DELETE FROM maklum_balas');
  console.log(`Deleted ${resMB.rowsAffected[0]} from maklum_balas`);

  // 3. Delete tindakan
  const resTindakan = await pool.request().query('DELETE FROM tindakan');
  console.log(`Deleted ${resTindakan.rowsAffected[0]} from tindakan`);

  // 4. Delete lampiran
  const resLampiran = await pool.request().query('DELETE FROM lampiran');
  console.log(`Deleted ${resLampiran.rowsAffected[0]} from lampiran`);

  // 5. Delete surat_masuk
  const resSurat = await pool.request().query('DELETE FROM surat_masuk');
  console.log(`Deleted ${resSurat.rowsAffected[0]} from surat_masuk`);

  // 6. Reseed tables
  console.log('\n--- Resetting identity seeds ---');
  await pool.request().query(`DBCC CHECKIDENT ('surat_masuk', RESEED, 0)`);
  await pool.request().query(`DBCC CHECKIDENT ('lampiran', RESEED, 0)`);
  await pool.request().query(`DBCC CHECKIDENT ('tindakan', RESEED, 0)`);
  await pool.request().query(`DBCC CHECKIDENT ('maklum_balas', RESEED, 0)`);
  await pool.request().query(`DBCC CHECKIDENT ('notifikasi', RESEED, 0)`);
  console.log('Identities successfully reseeded to 0.');

  // 7. Clear local uploads folder
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log(`\n--- Cleaning local uploads folder (${files.length} files found) ---`);
    for (const file of files) {
      const fullPath = path.join(uploadsDir, file);
      if (fs.lstatSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted upload file: ${file}`);
      }
    }
  }

  console.log('\n=== PEMBERSIHAN SELESAI ===');
  process.exit(0);
}

clearDummyData().catch(err => {
  console.error('Pembersihan gagal:', err);
  process.exit(1);
});
