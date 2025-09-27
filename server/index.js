const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../lib/db/connection.ts').default;

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'stsm-secret-key';

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
    
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Nama pengguna atau kata laluan tidak betul' });
    }
    
    const user = result.rows[0];
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
    
    let query = `
      SELECT s.*, u1.full_name as created_by_name, u2.full_name as assigned_to_name
      FROM surat_masuk s
      LEFT JOIN users u1 ON s.created_by = u1.id
      LEFT JOIN users u2 ON s.assigned_to = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      query += ` AND s.status = $${paramCount}`;
      params.push(status);
    }
    
    if (assigned_to) {
      paramCount++;
      query += ` AND s.assigned_to = $${paramCount}`;
      params.push(assigned_to);
    }
    
    // Role-based filtering
    if (req.user.role === 'pegawai_pelaksana') {
      paramCount++;
      query += ` AND s.assigned_to = $${paramCount}`;
      params.push(req.user.id);
    }
    
    query += ` ORDER BY s.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM surat_masuk s WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;
    
    if (status) {
      countParamCount++;
      countQuery += ` AND s.status = $${countParamCount}`;
      countParams.push(status);
    }
    
    if (assigned_to) {
      countParamCount++;
      countQuery += ` AND s.assigned_to = $${countParamCount}`;
      countParams.push(assigned_to);
    }
    
    if (req.user.role === 'pegawai_pelaksana') {
      countParamCount++;
      countQuery += ` AND s.assigned_to = $${countParamCount}`;
      countParams.push(req.user.id);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      data: result.rows,
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
    
    // Insert letter
    const result = await pool.query(`
      INSERT INTO surat_masuk (
        no_rujukan, tarikh_terima, tarikh_surat, pengirim, alamat_pengirim,
        subjek, ringkasan, kategori, keutamaan, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      no_rujukan, tarikh_terima, tarikh_surat, pengirim, alamat_pengirim,
      subjek, ringkasan, kategori, keutamaan, req.user.id
    ]);
    
    const suratId = result.rows[0].id;
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await pool.query(`
          INSERT INTO lampiran (surat_id, nama_fail, url_fail, saiz_fail, jenis_fail, uploaded_by)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          suratId,
          file.originalname,
          `/uploads/${file.filename}`,
          file.size,
          file.mimetype,
          req.user.id
        ]);
      }
    }
    
    // Log action
    await pool.query(`
      INSERT INTO tindakan (surat_id, user_id, jenis_tindakan, catatan, status_baru)
      VALUES ($1, $2, $3, $4, $5)
    `, [suratId, req.user.id, 'daftar_surat', 'Surat baru didaftarkan', 'belum_mula']);
    
    res.status(201).json(result.rows[0]);
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
    
    const result = await pool.query(`
      UPDATE surat_masuk 
      SET assigned_to = $1, tarikh_akhir_tindakan = $2, status = 'dalam_proses', updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [assigned_to, tarikh_akhir_tindakan, id]);
    
    // Log action
    await pool.query(`
      INSERT INTO tindakan (surat_id, user_id, jenis_tindakan, catatan, status_lama, status_baru)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, req.user.id, 'agih_tindakan', 'Surat diagihkan untuk tindakan', 'belum_mula', 'dalam_proses']);
    
    // Create notification
    await pool.query(`
      INSERT INTO notifikasi (user_id, surat_id, jenis, mesej)
      VALUES ($1, $2, $3, $4)
    `, [assigned_to, id, 'tugasan_baru', 'Anda telah menerima tugasan surat baru']);
    
    res.json(result.rows[0]);
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
    
    const currentResult = await pool.query('SELECT status FROM surat_masuk WHERE id = $1', [id]);
    const oldStatus = currentResult.rows[0]?.status;
    
    const result = await pool.query(`
      UPDATE surat_masuk 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    
    // Log action
    await pool.query(`
      INSERT INTO tindakan (surat_id, user_id, jenis_tindakan, catatan, status_lama, status_baru)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, req.user.id, 'kemaskini_status', catatan || 'Status dikemaskini', oldStatus, status]);
    
    res.json(result.rows[0]);
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
    
    // Insert feedback
    const result = await pool.query(`
      INSERT INTO maklum_balas (surat_id, kepada, subjek, kandungan, cara_hantar, tarikh_hantar, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [id, kepada, subjek, kandungan, cara_hantar, tarikh_hantar, req.user.id]);
    
    // Update letter status
    await pool.query(`
      UPDATE surat_masuk 
      SET status = 'maklum_balas_dihantar', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);
    
    // Log action
    await pool.query(`
      INSERT INTO tindakan (surat_id, user_id, jenis_tindakan, catatan, status_lama, status_baru)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, req.user.id, 'hantar_maklum_balas', 'Maklum balas telah dihantar', 'selesai', 'maklum_balas_dihantar']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send feedback error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Get users for assignment
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, full_name, role, bahagian
      FROM users 
      WHERE is_active = true AND role IN ('pegawai_pelaksana', 'ketua_unit')
      ORDER BY full_name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Get notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.*, s.no_rujukan, s.subjek
      FROM notifikasi n
      LEFT JOIN surat_masuk s ON n.surat_id = s.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 20
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`
      UPDATE notifikasi 
      SET is_read = true 
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);
    
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
    const totalResult = await pool.query('SELECT COUNT(*) FROM surat_masuk');
    stats.total = parseInt(totalResult.rows[0].count);
    
    // By status
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM surat_masuk
      GROUP BY status
    `);
    stats.byStatus = statusResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});
    
    // This month
    const thisMonthResult = await pool.query(`
      SELECT COUNT(*) FROM surat_masuk
      WHERE DATE_TRUNC('month', tarikh_terima) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    stats.thisMonth = parseInt(thisMonthResult.rows[0].count);
    
    // Overdue
    const overdueResult = await pool.query(`
      SELECT COUNT(*) FROM surat_masuk
      WHERE tarikh_akhir_tindakan < CURRENT_DATE AND status NOT IN ('selesai', 'maklum_balas_dihantar')
    `);
    stats.overdue = parseInt(overdueResult.rows[0].count);
    
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Ralat sistem' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
