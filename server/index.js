const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { uploadToOBS, getSignedOBSUrl } = require('./obs-service');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'stsm-secret-key';

// MSSQL Configuration
const dbConfig = {
  user: process.env.DB_USER || 'rdsuser',
  password: process.env.DB_PASSWORD || 'P@$$w0rd2024',
  server: process.env.DB_SERVER || '202.165.22.1',
  database: process.env.DB_DATABASE || 'stsm_mains',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

// Initialize database connection
const initDB = async () => {
  try {
    pool = await sql.connect(dbConfig);
    console.log('Connected to MSSQL database');
  } catch (err) {
    console.error('Database connection failed:', err);
    // For development, create a mock pool to prevent crashes
    pool = {
      request: () => ({
        input: () => ({ query: () => ({ recordset: [] }) }),
        query: () => ({ recordset: [] })
      })
    };
  }
};

initDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Jenis fail tidak dibenarkan'));
    }
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token akses diperlukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak sah' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const request = pool.request();
    request.input('username', sql.NVarChar, username);
    
    const result = await request.query(`
      SELECT * FROM users WHERE username = @username AND is_active = 1
    `);
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Nama pengguna atau kata laluan tidak betul' });
    }
    
    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Nama pengguna atau kata laluan tidak betul' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        bahagian: user.bahagian
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Get all letters
app.get('/api/surat', authenticateToken, async (req, res) => {
  try {
    const { status, assigned_to, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const request = pool.request();
    let query = `
      SELECT s.*, 
             u1.full_name as created_by_name, 
             u2.full_name as assigned_to_name,
             s_rel.no_daftar as berkaitan_no_daftar,
             s_rel.subjek as berkaitan_perkara,
             (SELECT TOP 1 l.url_fail FROM lampiran l WHERE l.surat_id = s.id ORDER BY l.id DESC) as url_fail,
             (SELECT TOP 1 l.nama_fail FROM lampiran l WHERE l.surat_id = s.id ORDER BY l.id DESC) as nama_fail
      FROM surat_masuk s
      LEFT JOIN users u1 ON s.created_by = u1.id
      LEFT JOIN users u2 ON s.assigned_to = u2.id
      LEFT JOIN surat_masuk s_rel ON s.surat_berkaitan_id = s_rel.id
      WHERE 1=1
    `;
    
    if (status) {
      query += ` AND s.status = @status`;
      request.input('status', sql.NVarChar, status);
    }
    
    if (assigned_to) {
      query += ` AND s.assigned_to = @assigned_to`;
      request.input('assigned_to', sql.Int, assigned_to);
    }
    
    // Role-based filtering
    if (req.user.role === 'pegawai_pelaksana') {
      query += ` AND s.assigned_to = @user_id`;
      request.input('user_id', sql.Int, req.user.id);
    }
    
    query += ` ORDER BY s.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));
    
    const result = await request.query(query);
    
    // Resolve pre-signed URLs and parse JSON fields
    const lettersWithSignedUrls = await Promise.all(
      result.recordset.map(async (letter) => {
        let penerima = {};
        try {
          penerima = letter.penerima_data ? JSON.parse(letter.penerima_data) : {};
        } catch {
          penerima = {};
        }
        if (Object.keys(penerima).length === 0) {
          penerima = {
            su: { status: letter.status === 'selesai' ? 'telah' : 'akan', dari: null, tarikh: letter.tarikh_terima, arahan: 'Surat berdaftar' }
          };
        }

        let log = [];
        try {
          log = letter.log_data ? JSON.parse(letter.log_data) : [];
        } catch {
          log = [];
        }

        let lampiranUrl = letter.url_fail;
        if (letter.url_fail && letter.url_fail.includes('alphaedge.tmone.com.my')) {
          lampiranUrl = await getSignedOBSUrl(letter.url_fail);
        }

        return {
          ...letter,
          noDaftar: letter.no_daftar || `MAINS/SU/${new Date(letter.tarikh_terima).getFullYear() || 2024}/${String(letter.id).padStart(4, '0')}`,
          noRujukan: letter.no_rujukan,
          tarikhSurat: letter.tarikh_surat ? new Date(letter.tarikh_surat).toISOString().slice(0, 10) : '',
          tarikhTerima: letter.tarikh_terima ? new Date(letter.tarikh_terima).toISOString().slice(0, 10) : '',
          tarikhSelesai: letter.tarikh_selesai ? new Date(letter.tarikh_selesai).toISOString().slice(0, 10) : null,
          pengirim: letter.pengirim,
          perkara: letter.subjek,
          kategori: letter.kategori || 'Pentadbiran',
          keutamaan: letter.keutamaan || 'Biasa',
          catatan: letter.catatan || letter.ringkasan || '',
          surat_berkaitan_id: letter.surat_berkaitan_id || null,
          berkaitan_no_daftar: letter.berkaitan_no_daftar || null,
          berkaitan_perkara: letter.berkaitan_perkara || null,
          penerima,
          log,
          lampiran: letter.nama_fail ? {
            nama: letter.nama_fail,
            url: lampiranUrl,
            jenis: letter.nama_fail.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
          } : null,
          url_fail: lampiranUrl,
          lampiran_url: lampiranUrl
        };
      })
    );
    
    // Get total count
    const countRequest = pool.request();
    let countQuery = 'SELECT COUNT(*) as total FROM surat_masuk s WHERE 1=1';
    
    if (status) {
      countQuery += ` AND s.status = @status`;
      countRequest.input('status', sql.NVarChar, status);
    }
    
    if (assigned_to) {
      countQuery += ` AND s.assigned_to = @assigned_to`;
      countRequest.input('assigned_to', sql.Int, assigned_to);
    }
    
    if (req.user.role === 'pegawai_pelaksana') {
      countQuery += ` AND s.assigned_to = @user_id`;
      countRequest.input('user_id', sql.Int, req.user.id);
    }
    
    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;
    
    res.json({
      data: lettersWithSignedUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get letters error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Create new letter
app.post('/api/surat', authenticateToken, upload.array('lampiran'), async (req, res) => {
  try {
    const {
      no_rujukan,
      no_daftar,
      tarikh_terima,
      tarikh_surat,
      pengirim,
      alamat_pengirim,
      subjek,
      ringkasan,
      kategori,
      keutamaan,
      penerima_data,
      log_data,
      catatan,
      surat_berkaitan_id
    } = req.body;

    // Calculate tarikh_akhir_tindakan (14 days SLA)
    const terimaDate = new Date(tarikh_terima);
    const akhirDate = new Date(terimaDate);
    akhirDate.setDate(akhirDate.getDate() + 14);
    const tarikh_akhir = akhirDate.toISOString().slice(0, 10);

    // Generate no_daftar if not provided
    let finalNoDaftar = no_daftar;
    if (!finalNoDaftar) {
      const year = terimaDate.getFullYear() || new Date().getFullYear();
      const countReq = pool.request();
      countReq.input('yearPrefix', sql.NVarChar, `%/${year}/%`);
      const countRes = await countReq.query("SELECT COUNT(*) as cnt FROM surat_masuk WHERE no_daftar LIKE @yearPrefix");
      const nextNum = (countRes.recordset[0]?.cnt || 0) + 1;
      finalNoDaftar = `MAINS/SU/${year}/${String(nextNum).padStart(4, '0')}`;
    }

    const defaultPenerima = JSON.stringify({
      su: { status: 'akan', dari: null, tarikh: tarikh_terima, arahan: 'Surat baharu didaftarkan' }
    });

    const defaultLog = JSON.stringify([
      {
        jenis: 'daftar',
        dari: null,
        kepada: ['su'],
        teks: 'Surat didaftarkan & diserahkan kepada Setiausaha MAINS',
        masa: new Date().toISOString(),
        oleh: req.user.full_name || req.user.username
      }
    ]);

    const request = pool.request();
    request.input('no_rujukan', sql.NVarChar, no_rujukan);
    request.input('no_daftar', sql.NVarChar, finalNoDaftar);
    request.input('tarikh_terima', sql.Date, tarikh_terima);
    request.input('tarikh_surat', sql.Date, tarikh_surat);
    request.input('tarikh_akhir_tindakan', sql.Date, tarikh_akhir);
    request.input('pengirim', sql.NVarChar, pengirim);
    request.input('alamat_pengirim', sql.NText, alamat_pengirim || '');
    request.input('subjek', sql.NVarChar, subjek);
    request.input('ringkasan', sql.NText, ringkasan || '');
    request.input('kategori', sql.NVarChar, kategori || 'Pentadbiran');
    request.input('keutamaan', sql.NVarChar, keutamaan || 'Biasa');
    request.input('catatan', sql.NVarChar, catatan || '');
    request.input('surat_berkaitan_id', sql.Int, surat_berkaitan_id ? parseInt(surat_berkaitan_id) : null);
    request.input('penerima_data', sql.NVarChar, typeof penerima_data === 'object' ? JSON.stringify(penerima_data) : (penerima_data || defaultPenerima));
    request.input('log_data', sql.NVarChar, typeof log_data === 'object' ? JSON.stringify(log_data) : (log_data || defaultLog));
    request.input('created_by', sql.Int, req.user.id);
    
    const result = await request.query(`
      INSERT INTO surat_masuk (
        no_rujukan, no_daftar, tarikh_terima, tarikh_surat, tarikh_akhir_tindakan, pengirim, alamat_pengirim,
        subjek, ringkasan, kategori, keutamaan, catatan, surat_berkaitan_id, penerima_data, log_data, created_by, status
      ) 
      OUTPUT INSERTED.*
      VALUES (@no_rujukan, @no_daftar, @tarikh_terima, @tarikh_surat, @tarikh_akhir_tindakan, @pengirim, @alamat_pengirim,
              @subjek, @ringkasan, @kategori, @keutamaan, @catatan, @surat_berkaitan_id, @penerima_data, @log_data, @created_by, 'belum_mula')
    `);
    
    const suratId = result.recordset[0].id;
    
    // Handle file uploads to TM One OBS & Database
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        let fileUrl = `/uploads/${file.filename}`;
        
        // Upload to Object Storage Service (OBS)
        try {
          const obsKey = `surat/${suratId}/${Date.now()}-${file.originalname}`;
          fileUrl = await uploadToOBS(file.path, obsKey, file.mimetype);
          console.log(`[OBS] Lampiran ${file.originalname} dimuat naik ke cloud OBS: ${fileUrl}`);
        } catch (obsErr) {
          console.warn('[OBS] Muat naik ke OBS gagal, sandaran menggunakan storan lokal:', obsErr.message);
        }

        const fileRequest = pool.request();
        fileRequest.input('surat_id', sql.Int, suratId);
        fileRequest.input('nama_fail', sql.NVarChar, file.originalname);
        fileRequest.input('url_fail', sql.NVarChar, fileUrl);
        fileRequest.input('saiz_fail', sql.BigInt, file.size);
        fileRequest.input('jenis_fail', sql.NVarChar, file.mimetype);
        fileRequest.input('uploaded_by', sql.Int, req.user.id);
        
        await fileRequest.query(`
          INSERT INTO lampiran (surat_id, nama_fail, url_fail, saiz_fail, jenis_fail, uploaded_by)
          VALUES (@surat_id, @nama_fail, @url_fail, @saiz_fail, @jenis_fail, @uploaded_by)
        `);
      }
    }
    
    // Log action
    const actionRequest = pool.request();
    actionRequest.input('surat_id', sql.Int, suratId);
    actionRequest.input('user_id', sql.Int, req.user.id);
    actionRequest.input('jenis_tindakan', sql.NVarChar, 'daftar_surat');
    actionRequest.input('catatan', sql.NText, 'Surat baru didaftarkan');
    actionRequest.input('status_baru', sql.NVarChar, 'belum_mula');
    
    await actionRequest.query(`
      INSERT INTO tindakan (surat_id, user_id, jenis_tindakan, catatan, status_baru)
      VALUES (@surat_id, @user_id, @jenis_tindakan, @catatan, @status_baru)
    `);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Create letter error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Hierarchical miniting (Minit ke Bawah)
app.put('/api/surat/:id/minit-hierarki', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { dari, kepada, arahan } = req.body; // dari: 'su', kepada: ['bdp', 'jz'], arahan: '...'

    if (!dari || !kepada || !Array.isArray(kepada) || kepada.length === 0 || !arahan) {
      return res.status(400).json({ error: 'Parameter minit tidak lengkap' });
    }

    const getReq = pool.request();
    getReq.input('id', sql.Int, id);
    const getRes = await getReq.query('SELECT * FROM surat_masuk WHERE id = @id');
    if (getRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Surat tidak dijumpai' });
    }

    const surat = getRes.recordset[0];
    let penerima = {};
    try {
      penerima = surat.penerima_data ? JSON.parse(surat.penerima_data) : {};
    } catch {
      penerima = {};
    }

    let log = [];
    try {
      log = surat.log_data ? JSON.parse(surat.log_data) : [];
    } catch {
      log = [];
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    // Update 'dari' node to 'diturunkan'
    if (penerima[dari]) {
      penerima[dari].status = 'diturunkan';
    } else {
      penerima[dari] = {
        status: 'diturunkan',
        dari: null,
        tarikh: todayStr,
        arahan: 'Diminitkan'
      };
    }

    // Assign to child nodes
    kepada.forEach(k => {
      penerima[k] = {
        status: 'akan',
        dari: dari,
        tarikh: todayStr,
        arahan: arahan
      };
    });

    // Add log
    log.push({
      jenis: 'minit',
      dari: dari,
      kepada: kepada,
      teks: arahan,
      masa: new Date().toISOString(),
      oleh: req.user.full_name || req.user.username
    });

    const updReq = pool.request();
    updReq.input('id', sql.Int, id);
    updReq.input('penerima_data', sql.NVarChar, JSON.stringify(penerima));
    updReq.input('log_data', sql.NVarChar, JSON.stringify(log));
    updReq.input('status', sql.NVarChar, 'dalam_proses');

    const updRes = await updReq.query(`
      UPDATE surat_masuk
      SET penerima_data = @penerima_data, log_data = @log_data, status = @status, updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    res.json(updRes.recordset[0]);
  } catch (error) {
    console.error('Minit error:', error);
    res.status(500).json({ error: 'Ralat minit surat' });
  }
});

// Rekod Tindakan (Sedang / Telah)
app.put('/api/surat/:id/rekod-tindakan', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { peranan, statusTindakan, catatan } = req.body; // statusTindakan: 'sedang' | 'telah'

    if (!peranan || !statusTindakan || !['sedang', 'telah'].includes(statusTindakan)) {
      return res.status(400).json({ error: 'Status tindakan tidak sah' });
    }

    const getReq = pool.request();
    getReq.input('id', sql.Int, id);
    const getRes = await getReq.query('SELECT * FROM surat_masuk WHERE id = @id');
    if (getRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Surat tidak dijumpai' });
    }

    const surat = getRes.recordset[0];
    let penerima = {};
    try {
      penerima = surat.penerima_data ? JSON.parse(surat.penerima_data) : {};
    } catch {
      penerima = {};
    }

    let log = [];
    try {
      log = surat.log_data ? JSON.parse(surat.log_data) : [];
    } catch {
      log = [];
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    if (penerima[peranan]) {
      penerima[peranan].status = statusTindakan;
      penerima[peranan].catatan = catatan || '';
    } else {
      penerima[peranan] = {
        status: statusTindakan,
        dari: null,
        tarikh: todayStr,
        arahan: 'Tindakan langsung',
        catatan: catatan || ''
      };
    }

    log.push({
      jenis: statusTindakan === 'telah' ? 'selesai' : 'sedang',
      dari: peranan,
      kepada: [],
      teks: catatan || (statusTindakan === 'sedang' ? 'Tindakan dimulakan' : 'Tindakan selesai'),
      masa: new Date().toISOString(),
      oleh: req.user.full_name || req.user.username
    });

    // Check if all active recipients are 'telah'
    const activeEntries = Object.entries(penerima).filter(([, v]) => v.status !== 'diturunkan');
    const allDone = activeEntries.length > 0 && activeEntries.every(([, v]) => v.status === 'telah');
    const tarikhSelesai = allDone ? todayStr : (statusTindakan === 'telah' ? todayStr : null);
    const overallStatus = allDone ? 'selesai' : 'dalam_proses';

    const updReq = pool.request();
    updReq.input('id', sql.Int, id);
    updReq.input('penerima_data', sql.NVarChar, JSON.stringify(penerima));
    updReq.input('log_data', sql.NVarChar, JSON.stringify(log));
    updReq.input('status', sql.NVarChar, overallStatus);
    updReq.input('tarikh_selesai', sql.Date, tarikhSelesai);

    const updRes = await updReq.query(`
      UPDATE surat_masuk
      SET penerima_data = @penerima_data,
          log_data = @log_data,
          status = @status,
          tarikh_selesai = COALESCE(@tarikh_selesai, tarikh_selesai),
          updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    res.json(updRes.recordset[0]);
  } catch (error) {
    console.error('Rekod tindakan error:', error);
    res.status(500).json({ error: 'Ralat merekod tindakan' });
  }
});

// Rekod Notifikasi WhatsApp / Emel
app.post('/api/surat/:id/notifikasi-log', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { dari, kepadaId, saluran, teks } = req.body;

    const getReq = pool.request();
    getReq.input('id', sql.Int, id);
    const getRes = await getReq.query('SELECT log_data FROM surat_masuk WHERE id = @id');
    if (getRes.recordset.length === 0) return res.status(404).json({ error: 'Surat tidak dijumpai' });

    let log = [];
    try {
      log = getRes.recordset[0].log_data ? JSON.parse(getRes.recordset[0].log_data) : [];
    } catch {
      log = [];
    }

    log.push({
      jenis: 'notifikasi',
      dari: dari || req.user.role,
      kepada: kepadaId ? [kepadaId] : [],
      teks: `Notifikasi ${saluran || 'sistem'} dihantar: ${teks || ''}`,
      masa: new Date().toISOString(),
      oleh: req.user.full_name || req.user.username
    });

    const updReq = pool.request();
    updReq.input('id', sql.Int, id);
    updReq.input('log_data', sql.NVarChar, JSON.stringify(log));
    await updReq.query('UPDATE surat_masuk SET log_data = @log_data, updated_at = GETDATE() WHERE id = @id');

    res.json({ success: true });
  } catch (error) {
    console.error('Log notifikasi error:', error);
    res.status(500).json({ error: 'Ralat log notifikasi' });
  }
});

// Organisasi Hubungan (WhatsApp & Emel directory)
app.get('/api/organisasi/hubungan', authenticateToken, async (req, res) => {
  try {
    const request = pool.request();
    const result = await request.query('SELECT * FROM hubungan_organisasi');
    const map = {};
    result.recordset.forEach(r => {
      map[r.id] = { nama: r.nama, tel: r.tel, emel: r.emel, cc: r.cc };
    });
    res.json(map);
  } catch (error) {
    console.error('Get hubungan error:', error);
    res.json({});
  }
});

app.put('/api/organisasi/hubungan/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, tel, emel, cc } = req.body;

    const request = pool.request();
    request.input('id', sql.NVarChar, id);
    request.input('nama', sql.NVarChar, nama || '');
    request.input('tel', sql.NVarChar, tel || '');
    request.input('emel', sql.NVarChar, emel || '');
    request.input('cc', sql.NVarChar, cc || '');

    await request.query(`
      MERGE INTO hubungan_organisasi AS target
      USING (SELECT @id AS id) AS source
      ON target.id = source.id
      WHEN MATCHED THEN
        UPDATE SET nama = @nama, tel = @tel, emel = @emel, cc = @cc, updated_at = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (id, nama, tel, emel, cc, updated_at)
        VALUES (@id, @nama, @tel, @emel, @cc, GETDATE());
    `);

    res.json({ success: true });
  } catch (error) {
    console.error('Save hubungan error:', error);
    res.status(500).json({ error: 'Ralat simpan hubungan' });
  }
});

// Pautkan Surat Berkaitan / Rujukan Terdahulu
app.put('/api/surat/:id/pautkan', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { surat_berkaitan_id } = req.body; // number or null to unlink

    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'ID surat tidak sah' });
    }

    const targetId = (surat_berkaitan_id !== null && surat_berkaitan_id !== undefined && !isNaN(parseInt(surat_berkaitan_id)))
      ? parseInt(surat_berkaitan_id)
      : null;

    if (targetId && targetId === numericId) {
      return res.status(400).json({ error: 'Surat tidak boleh dipautkan kepada dirinya sendiri' });
    }

    const getReq = pool.request();
    getReq.input('id', sql.Int, numericId);
    const getRes = await getReq.query('SELECT * FROM surat_masuk WHERE id = @id');
    if (getRes.recordset.length === 0) return res.status(404).json({ error: 'Surat tidak dijumpai' });

    let targetLetter = null;
    if (targetId) {
      const targetReq = pool.request();
      targetReq.input('targetId', sql.Int, targetId);
      const targetRes = await targetReq.query('SELECT id, no_daftar, subjek FROM surat_masuk WHERE id = @targetId');
      if (targetRes.recordset.length === 0) {
        return res.status(404).json({ error: 'Surat rujukan yang ingin dipautkan tidak wujud' });
      }
      targetLetter = targetRes.recordset[0];
    }

    const surat = getRes.recordset[0];
    let log = [];
    try {
      log = surat.log_data ? JSON.parse(surat.log_data) : [];
    } catch {
      log = [];
    }

    const logText = targetLetter 
      ? `Dipautkan ke surat rujukan: ${targetLetter.no_daftar || ('ID #' + targetLetter.id)} (${targetLetter.subjek})`
      : 'Pautan surat rujukan terdahulu dipadamkan';

    log.push({
      jenis: 'pautan',
      dari: req.user.role || 'pentadbir',
      kepada: [],
      teks: logText,
      masa: new Date().toISOString(),
      oleh: req.user.full_name || req.user.username
    });

    const updReq = pool.request();
    updReq.input('id', sql.Int, id);
    updReq.input('surat_berkaitan_id', sql.Int, targetId);
    updReq.input('log_data', sql.NVarChar, JSON.stringify(log));

    const updRes = await updReq.query(`
      UPDATE surat_masuk
      SET surat_berkaitan_id = @surat_berkaitan_id,
          log_data = @log_data,
          updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    res.json(updRes.recordset[0]);
  } catch (error) {
    console.error('Pautkan surat error:', error);
    res.status(500).json({ error: 'Ralat memautkan surat' });
  }
});

// Assign letter
app.put('/api/surat/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, tarikh_akhir_tindakan } = req.body;
    
    const request = pool.request();
    request.input('assigned_to', sql.Int, assigned_to);
    request.input('tarikh_akhir_tindakan', sql.Date, tarikh_akhir_tindakan);
    request.input('id', sql.Int, id);
    
    const result = await request.query(`
      UPDATE surat_masuk 
      SET assigned_to = @assigned_to, tarikh_akhir_tindakan = @tarikh_akhir_tindakan, 
          status = 'dalam_proses', updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    
    // Log action
    const actionRequest = pool.request();
    actionRequest.input('surat_id', sql.Int, id);
    actionRequest.input('user_id', sql.Int, req.user.id);
    actionRequest.input('jenis_tindakan', sql.NVarChar, 'agih_tindakan');
    actionRequest.input('catatan', sql.NText, 'Surat diagihkan untuk tindakan');
    actionRequest.input('status_lama', sql.NVarChar, 'belum_mula');
    actionRequest.input('status_baru', sql.NVarChar, 'dalam_proses');
    
    await actionRequest.query(`
      INSERT INTO tindakan (surat_id, user_id, jenis_tindakan, catatan, status_lama, status_baru)
      VALUES (@surat_id, @user_id, @jenis_tindakan, @catatan, @status_lama, @status_baru)
    `);
    
    // Create notification
    const notifRequest = pool.request();
    notifRequest.input('user_id', sql.Int, assigned_to);
    notifRequest.input('surat_id', sql.Int, id);
    notifRequest.input('jenis', sql.NVarChar, 'tugasan_baru');
    notifRequest.input('mesej', sql.NText, 'Anda telah menerima tugasan surat baru');
    
    await notifRequest.query(`
      INSERT INTO notifikasi (user_id, surat_id, jenis, mesej)
      VALUES (@user_id, @surat_id, @jenis, @mesej)
    `);
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Assign letter error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Update letter status
app.put('/api/surat/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;
    
    // Get current status
    const currentRequest = pool.request();
    currentRequest.input('id', sql.Int, id);
    const currentResult = await currentRequest.query('SELECT status FROM surat_masuk WHERE id = @id');
    const oldStatus = currentResult.recordset[0]?.status;
    
    const request = pool.request();
    request.input('status', sql.NVarChar, status);
    request.input('id', sql.Int, id);
    
    const result = await request.query(`
      UPDATE surat_masuk 
      SET status = @status, updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    
    // Log action
    const actionRequest = pool.request();
    actionRequest.input('surat_id', sql.Int, id);
    actionRequest.input('user_id', sql.Int, req.user.id);
    actionRequest.input('jenis_tindakan', sql.NVarChar, 'kemaskini_status');
    actionRequest.input('catatan', sql.NText, catatan || 'Status dikemaskini');
    actionRequest.input('status_lama', sql.NVarChar, oldStatus);
    actionRequest.input('status_baru', sql.NVarChar, status);
    
    await actionRequest.query(`
      INSERT INTO tindakan (surat_id, user_id, jenis_tindakan, catatan, status_lama, status_baru)
      VALUES (@surat_id, @user_id, @jenis_tindakan, @catatan, @status_lama, @status_baru)
    `);
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Send feedback
app.post('/api/surat/:id/maklum-balas', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { kepada, subjek, kandungan, cara_hantar, tarikh_hantar } = req.body;
    
    const request = pool.request();
    request.input('surat_id', sql.Int, id);
    request.input('kepada', sql.NVarChar, kepada);
    request.input('subjek', sql.NVarChar, subjek);
    request.input('kandungan', sql.NText, kandungan);
    request.input('cara_hantar', sql.NVarChar, cara_hantar);
    request.input('tarikh_hantar', sql.Date, tarikh_hantar);
    request.input('created_by', sql.Int, req.user.id);
    
    const result = await request.query(`
      INSERT INTO maklum_balas (surat_id, kepada, subjek, kandungan, cara_hantar, tarikh_hantar, created_by)
      OUTPUT INSERTED.*
      VALUES (@surat_id, @kepada, @subjek, @kandungan, @cara_hantar, @tarikh_hantar, @created_by)
    `);
    
    // Update letter status
    const updateRequest = pool.request();
    updateRequest.input('id', sql.Int, id);
    await updateRequest.query(`
      UPDATE surat_masuk 
      SET status = 'maklum_balas_dihantar', updated_at = GETDATE()
      WHERE id = @id
    `);
    
    // Log action
    const actionRequest = pool.request();
    actionRequest.input('surat_id', sql.Int, id);
    actionRequest.input('user_id', sql.Int, req.user.id);
    actionRequest.input('jenis_tindakan', sql.NVarChar, 'hantar_maklum_balas');
    actionRequest.input('catatan', sql.NText, 'Maklum balas telah dihantar');
    actionRequest.input('status_lama', sql.NVarChar, 'selesai');
    actionRequest.input('status_baru', sql.NVarChar, 'maklum_balas_dihantar');
    
    await actionRequest.query(`
      INSERT INTO tindakan (surat_id, user_id, jenis_tindakan, catatan, status_lama, status_baru)
      VALUES (@surat_id, @user_id, @jenis_tindakan, @catatan, @status_lama, @status_baru)
    `);
    
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Send feedback error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Helper: check if user role has system administrator privileges
const isSystemAdmin = (role) => ['pengurusan', 'pentadbir_sistem', 'admin', 'pentadbir'].includes(role);

// Get all users (or filter by role)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query;
    const request = pool.request();
    let query = `
      SELECT id, username, email, full_name, role, bahagian, is_active
      FROM users 
      WHERE is_active = 1
    `;
    if (role && role !== 'semua') {
      if (role === 'pentadbir_sistem' || role === 'admin' || role === 'pentadbir') {
        query += ` AND (role = 'pentadbir_sistem' OR role = 'admin' OR role = 'pentadbir')`;
      } else {
        request.input('role', sql.NVarChar, role);
        query += ` AND role = @role`;
      }
    }
    query += ` ORDER BY full_name`;
    const result = await request.query(query);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Create new user (Pentadbir only)
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (!isSystemAdmin(req.user.role)) {
      return res.status(403).json({ error: 'Hanya pentadbir sistem dibenarkan mendaftar pengguna' });
    }

    const { username, email, password, full_name, role, bahagian } = req.body;
    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Sila lengkapkan semua maklumat wajib' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const request = pool.request();
    request.input('username', sql.NVarChar, username);
    request.input('email', sql.NVarChar, email);
    request.input('password_hash', sql.NVarChar, password_hash);
    request.input('full_name', sql.NVarChar, full_name);
    request.input('role', sql.NVarChar, role);
    request.input('bahagian', sql.NVarChar, bahagian || 'Umum');

    const result = await request.query(`
      INSERT INTO users (username, email, password_hash, full_name, role, bahagian, is_active)
      OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.full_name, INSERTED.role, INSERTED.bahagian
      VALUES (@username, @email, @password_hash, @full_name, @role, @bahagian, 1)
    `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Create user error:', error);
    if (error.number === 2627) {
      return res.status(400).json({ error: 'Nama pengguna atau emel telah wujud dalam sistem' });
    }
    res.status(500).json({ error: 'Ralat mendaftar pengguna' });
  }
});

// Update user details (Kemaskini Pengguna)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, bahagian, password } = req.body;

    // Check permission: only admin or self can update
    if (!isSystemAdmin(req.user.role) && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Tiada kebenaran untuk mengemas kini akaun ini' });
    }

    const request = pool.request();
    request.input('id', sql.Int, id);
    request.input('full_name', sql.NVarChar, full_name || null);
    request.input('email', sql.NVarChar, email || null);
    request.input('bahagian', sql.NVarChar, bahagian || null);

    let updateQuery = `
      UPDATE users 
      SET full_name = ISNULL(@full_name, full_name), 
          email = ISNULL(@email, email), 
          bahagian = ISNULL(@bahagian, bahagian),
          updated_at = GETDATE()
    `;

    // Only admin can change role
    if (isSystemAdmin(req.user.role) && role) {
      request.input('role', sql.NVarChar, role);
      updateQuery += `, role = @role`;
    }

    // Optional password update
    if (password && password.trim() !== '') {
      const password_hash = await bcrypt.hash(password, 10);
      request.input('password_hash', sql.NVarChar, password_hash);
      updateQuery += `, password_hash = @password_hash`;
    }

    updateQuery += `
      OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.full_name, INSERTED.role, INSERTED.bahagian
      WHERE id = @id
    `;

    const result = await request.query(updateQuery);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemui' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Ralat mengemas kini maklumat pengguna' });
  }
});

// Toggle user active status or delete
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (!isSystemAdmin(req.user.role)) {
      return res.status(403).json({ error: 'Hanya pentadbir sistem dibenarkan memadam pengguna' });
    }

    const { id } = req.params;
    const request = pool.request();
    request.input('id', sql.Int, id);

    await request.query(`
      UPDATE users SET is_active = 0, updated_at = GETDATE() WHERE id = @id
    `);

    res.json({ success: true, message: 'Akaun pengguna telah dinyahaktifkan' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Ralat menyahaktifkan pengguna' });
  }
});

// Get notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const request = pool.request();
    request.input('user_id', sql.Int, req.user.id);
    
    const result = await request.query(`
      SELECT TOP 20 n.*, s.no_rujukan, s.subjek
      FROM notifikasi n
      LEFT JOIN surat_masuk s ON n.surat_id = s.id
      WHERE n.user_id = @user_id
      ORDER BY n.created_at DESC
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = pool.request();
    request.input('id', sql.Int, id);
    request.input('user_id', sql.Int, req.user.id);
    
    await request.query(`
      UPDATE notifikasi 
      SET is_read = 1 
      WHERE id = @id AND user_id = @user_id
    `);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {};
    
    // Total letters
    const totalRequest = pool.request();
    const totalResult = await totalRequest.query('SELECT COUNT(*) as total FROM surat_masuk');
    stats.total = totalResult.recordset[0].total;
    
    // By status
    const statusRequest = pool.request();
    const statusResult = await statusRequest.query(`
      SELECT status, COUNT(*) as count
      FROM surat_masuk
      GROUP BY status
    `);
    stats.byStatus = statusResult.recordset.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});
    
    // This month
    const thisMonthRequest = pool.request();
    const thisMonthResult = await thisMonthRequest.query(`
      SELECT COUNT(*) as count FROM surat_masuk
      WHERE YEAR(tarikh_terima) = YEAR(GETDATE()) AND MONTH(tarikh_terima) = MONTH(GETDATE())
    `);
    stats.thisMonth = thisMonthResult.recordset[0].count;
    
    // Overdue
    const overdueRequest = pool.request();
    const overdueResult = await overdueRequest.query(`
      SELECT COUNT(*) as count FROM surat_masuk
      WHERE tarikh_akhir_tindakan < CAST(GETDATE() AS DATE) AND status NOT IN ('selesai', 'maklum_balas_dihantar')
    `);
    stats.overdue = overdueResult.recordset[0].count;
    
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
