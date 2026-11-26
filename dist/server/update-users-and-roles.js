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

// Users based on the screenshot and org-data.ts
const USERS_TO_SYNC = [
  // 1. Pengurusan Tertinggi (SU & TS)
  {
    username: 'pentadbir',
    email: 'setiausaha@mains.gov.my',
    full_name: 'Zainal bin Said (Setiausaha MAINS)',
    role: 'pengurusan',
    bahagian: 'Pejabat Setiausaha MAINS'
  },
  {
    username: 'zainal.said',
    email: 'zainal@mains.gov.my',
    full_name: 'Zainal bin Said',
    role: 'pengurusan',
    bahagian: 'Pejabat Setiausaha MAINS'
  },
  {
    username: 'tso',
    email: 'tso@mains.gov.my',
    full_name: 'Pejabat Timbalan Setiausaha (Operasi)',
    role: 'pengurusan',
    bahagian: 'Pejabat Timbalan Setiausaha (Operasi)'
  },
  {
    username: 'tsp',
    email: 'tsp@mains.gov.my',
    full_name: 'Mohamad Idris bin Ramli (Timbalan Setiausaha Pengurusan)',
    role: 'pengurusan',
    bahagian: 'Pejabat Timbalan Setiausaha (Pengurusan)'
  },

  // 2. Pentadbir Sistem (IT Admin)
  {
    username: 'admin',
    email: 'admin@mains.gov.my',
    full_name: 'Administrator Sistem IT (Pentadbir)',
    role: 'pentadbir_sistem',
    bahagian: 'Unit Pembangunan ICT'
  },
  {
    username: 'zailani.yunus',
    email: 'zailani@mains.gov.my',
    full_name: 'Mohd Zailani bin Yunus (Ketua Unit)',
    role: 'pentadbir_sistem',
    bahagian: 'Unit Pembangunan ICT'
  },

  // 3. Peringkat Setiausaha - Unit Terus & Bahagian Komunikasi Korporat (Daripada Screenshot)
  {
    username: 'syammil.yusoff',
    email: 'syammil@mains.gov.my',
    full_name: 'Syammil Izuddin bin Mohamed Yusoff (KPP)',
    role: 'ketua_unit',
    bahagian: 'Bahagian Komunikasi Korporat'
  },
  {
    username: 'kerani',
    email: 'urusetia@mains.gov.my',
    full_name: 'Noor Azira binti Mohamad Najib (Urusetia / Kerani)',
    role: 'kerani',
    bahagian: 'Unit Urusetia'
  },
  {
    username: 'azira.najib',
    email: 'azira@mains.gov.my',
    full_name: 'Noor Azira binti Mohamad Najib (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Urusetia'
  },
  {
    username: 'muzzammil.ismail',
    email: 'muzzammil@mains.gov.my',
    full_name: 'Mohd Muzzammil bin Ismail (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Komunikasi Korporat'
  },
  {
    username: 'hafifi.hadi',
    email: 'hafifi@mains.gov.my',
    full_name: 'Mohammad Hafifi bin Abdul Hadi (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Media Baharu'
  },
  {
    username: 'romy.roslan',
    email: 'romy@mains.gov.my',
    full_name: 'Romy Norfidzy bin Roslan (Penasihat Undang-Undang)',
    role: 'ketua_unit',
    bahagian: 'Unit Undang-Undang'
  },
  {
    username: 'azura.malek',
    email: 'azura.audit@mains.gov.my',
    full_name: 'Nor Azura binti Abdul Malek (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Audit Dalam'
  },
  {
    username: 'azreen.bakar',
    email: 'azreen@mains.gov.my',
    full_name: 'Mohd Azreen bin Abu Bakar (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Integriti'
  },

  // 4. Bahagian Dakwah & Pemasaran (Daripada Screenshot)
  {
    username: 'bukhari.safian',
    email: 'bukhari@mains.gov.my',
    full_name: 'Bukhari bin Safian (KPP)',
    role: 'ketua_unit',
    bahagian: 'Bahagian Dakwah & Pemasaran'
  },
  {
    username: 'noriana.samat',
    email: 'noriana@mains.gov.my',
    full_name: 'Noriana binti Samat (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Dakwah Zakat & Wakaf'
  },
  {
    username: 'shahrizad.kasim',
    email: 'shahrizad@mains.gov.my',
    full_name: 'Mohd Shahrizad bin Abu Kasim (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Kaunter Bergerak'
  },

  // 5. Bahagian Majikan & Ejen (Daripada Screenshot)
  {
    username: 'zana.ujang',
    email: 'zana@mains.gov.my',
    full_name: 'Zana Ruslinda binti Ujang (KPP)',
    role: 'ketua_unit',
    bahagian: 'Bahagian Majikan & Ejen'
  },
  {
    username: 'jumiatul.ismail',
    email: 'jumiatul@mains.gov.my',
    full_name: 'Jumiatul Adawiyah binti Ismail (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Sektor Awam'
  },
  {
    username: 'iqbal.salbani',
    email: 'iqbal@mains.gov.my',
    full_name: 'Mohd Iqbal bin Amad Salbani (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Sektor Swasta'
  },
  {
    username: 'azwan.zulkipli',
    email: 'azwan@mains.gov.my',
    full_name: 'Mohd Azwan bin Zulkipli (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Ejen Zakat & Wakaf'
  },

  // 6. Jabatan Zakat & Bahagian Kutipan (Daripada Screenshot)
  {
    username: 'mahadi.ali',
    email: 'mahadi@mains.gov.my',
    full_name: 'Mahadi bin Ali (Pengarah Jabatan Zakat)',
    role: 'ketua_unit',
    bahagian: 'Jabatan Zakat'
  },
  {
    username: 'alimazri.mauludin',
    email: 'alimazri@mains.gov.my',
    full_name: 'Alimazri bin Mauludin (KPP)',
    role: 'ketua_unit',
    bahagian: 'Bahagian Kutipan'
  },
  {
    username: 'irfan.aqil',
    email: 'irfan@mains.gov.my',
    full_name: 'Mohd Irfan Aqil bin Kamaruddin (Ketua Unit)',
    role: 'ketua_unit',
    bahagian: 'Unit Wakalah & Tugas Khas'
  },

  // 7. Ketua Unit & Pegawai Lain (Demo & Pelaksana)
  {
    username: 'ketua',
    email: 'ketua@mains.gov.my',
    full_name: 'Ustaz Ahmad Farhan (Ketua Penolong Pengarah)',
    role: 'ketua_unit',
    bahagian: 'Bahagian Agihan & Zakat'
  },
  {
    username: 'pegawai',
    email: 'pegawai@mains.gov.my',
    full_name: 'En. Zulkifli bin Ismail (Pegawai Tindakan)',
    role: 'pegawai_pelaksana',
    bahagian: 'Bahagian Dakwah & Pemasaran'
  },
  {
    username: 'pelaksana.integriti',
    email: 'integriti.staff@mains.gov.my',
    full_name: 'Ahmad Syafiq (Pegawai Integriti)',
    role: 'pegawai_pelaksana',
    bahagian: 'Unit Integriti'
  },
  {
    username: 'pelaksana.ict',
    email: 'ict.staff@mains.gov.my',
    full_name: 'Siti Nurhaliza (Pegawai Sokongan ICT)',
    role: 'pegawai_pelaksana',
    bahagian: 'Unit Pembangunan ICT'
  }
];

async function runSync() {
  console.log('Connecting to database...');
  const pool = await sql.connect(config);
  const passwordHash = await bcrypt.hash('password', 10);

  console.log(`Synchronizing ${USERS_TO_SYNC.length} users into [users] table...`);

  for (const u of USERS_TO_SYNC) {
    // Check if user exists by username
    const res = await pool.request()
      .input('username', sql.NVarChar, u.username)
      .query('SELECT id, username, email FROM users WHERE username = @username');

    if (res.recordset.length > 0) {
      // Update
      await pool.request()
        .input('username', sql.NVarChar, u.username)
        .input('email', sql.NVarChar, u.email)
        .input('full_name', sql.NVarChar, u.full_name)
        .input('role', sql.NVarChar, u.role)
        .input('bahagian', sql.NVarChar, u.bahagian)
        .input('password_hash', sql.NVarChar, passwordHash)
        .query(`
          UPDATE users 
          SET email = @email,
              full_name = @full_name,
              role = @role,
              bahagian = @bahagian,
              password_hash = @password_hash,
              is_active = 1,
              updated_at = GETDATE()
          WHERE username = @username
        `);
      console.log(`[UPDATED] User: ${u.username} (${u.role}) - ${u.bahagian}`);
    } else {
      // Insert
      await pool.request()
        .input('username', sql.NVarChar, u.username)
        .input('email', sql.NVarChar, u.email)
        .input('password_hash', sql.NVarChar, passwordHash)
        .input('full_name', sql.NVarChar, u.full_name)
        .input('role', sql.NVarChar, u.role)
        .input('bahagian', sql.NVarChar, u.bahagian)
        .query(`
          INSERT INTO users (username, email, password_hash, full_name, role, bahagian, is_active, created_at, updated_at)
          VALUES (@username, @email, @password_hash, @full_name, @role, @bahagian, 1, GETDATE(), GETDATE())
        `);
      console.log(`[CREATED] User: ${u.username} (${u.role}) - ${u.bahagian}`);
    }
  }

  // Summary
  const countRes = await pool.request().query('SELECT count(*) as total, role FROM users GROUP BY role');
  console.log('\n--- RINGKASAN PENGGUNA MENGIKUT PERANAN ---');
  countRes.recordset.forEach(r => {
    console.log(`Peranan: ${r.role} -> ${r.total} orang`);
  });

  const totalRes = await pool.request().query('SELECT count(*) as total FROM users');
  console.log(`Jumlah Keseluruhan Pengguna Aktif: ${totalRes.recordset[0].total}`);

  process.exit(0);
}

runSync().catch(err => {
  console.error('Error synchronizing users:', err);
  process.exit(1);
});
