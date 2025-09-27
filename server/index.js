const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'stsm-secret-key';

// MSSQL Configuration
const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
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
      SELECT s.*, u1.full_name as created_by_name, u2.full_name as assigned_to_name
      FROM surat_masuk s
      LEFT JOIN users u1 ON s.created_by = u1.id
      LEFT JOIN users u2 ON s.assigned_to = u2.id
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
      data: result.recordset,
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
      tarikh_terima,
      tarikh_surat,
      pengirim,
      alamat_pengirim,
      subjek,
      ringkasan,
      kategori,
      keutamaan
    } = req.body;
    
    const request = pool.request();
    request.input('no_rujukan', sql.NVarChar, no_rujukan);
    request.input('tarikh_terima', sql.Date, tarikh_terima);
    request.input('tarikh_surat', sql.Date, tarikh_surat);
    request.input('pengirim', sql.NVarChar, pengirim);
    request.input('alamat_pengirim', sql.NText, alamat_pengirim);
    request.input('subjek', sql.NVarChar, subjek);
    request.input('ringkasan', sql.NText, ringkasan);
    request.input('kategori', sql.NVarChar, kategori);
    request.input('keutamaan', sql.NVarChar, keutamaan);
    request.input('created_by', sql.Int, req.user.id);
    
    const result = await request.query(`
      INSERT INTO surat_masuk (
        no_rujukan, tarikh_terima, tarikh_surat, pengirim, alamat_pengirim,
        subjek, ringkasan, kategori, keutamaan, created_by
      ) 
      OUTPUT INSERTED.*
      VALUES (@no_rujukan, @tarikh_terima, @tarikh_surat, @pengirim, @alamat_pengirim,
              @subjek, @ringkasan, @kategori, @keutamaan, @created_by)
    `);
    
    const suratId = result.recordset[0].id;
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileRequest = pool.request();
        fileRequest.input('surat_id', sql.Int, suratId);
        fileRequest.input('nama_fail', sql.NVarChar, file.originalname);
        fileRequest.input('url_fail', sql.NVarChar, `/uploads/${file.filename}`);
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

// Get users for assignment
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const request = pool.request();
    const result = await request.query(`
      SELECT id, username, full_name, role, bahagian
      FROM users 
      WHERE is_active = 1 AND role IN ('pegawai_pelaksana', 'ketua_unit')
      ORDER BY full_name
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
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
