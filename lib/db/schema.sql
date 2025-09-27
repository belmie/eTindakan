-- Database Schema for STSM (Sistem Tindakan Surat Masuk)

-- Users table for authentication and role management
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('kerani', 'ketua_unit', 'pegawai_pelaksana', 'pengurusan')),
    bahagian VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incoming letters table
CREATE TABLE surat_masuk (
    id SERIAL PRIMARY KEY,
    no_rujukan VARCHAR(50) UNIQUE NOT NULL,
    tarikh_terima DATE NOT NULL,
    tarikh_surat DATE NOT NULL,
    pengirim VARCHAR(200) NOT NULL,
    alamat_pengirim TEXT,
    subjek VARCHAR(500) NOT NULL,
    ringkasan TEXT,
    kategori VARCHAR(100),
    keutamaan VARCHAR(20) DEFAULT 'biasa' CHECK (keutamaan IN ('rendah', 'biasa', 'tinggi', 'kritikal')),
    status VARCHAR(30) DEFAULT 'belum_mula' CHECK (status IN ('belum_mula', 'dalam_proses', 'selesai', 'maklum_balas_dihantar')),
    tarikh_akhir_tindakan DATE,
    created_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File attachments table
CREATE TABLE lampiran (
    id SERIAL PRIMARY KEY,
    surat_id INTEGER REFERENCES surat_masuk(id) ON DELETE CASCADE,
    nama_fail VARCHAR(255) NOT NULL,
    url_fail VARCHAR(500) NOT NULL,
    saiz_fail BIGINT,
    jenis_fail VARCHAR(50),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action tracking table
CREATE TABLE tindakan (
    id SERIAL PRIMARY KEY,
    surat_id INTEGER REFERENCES surat_masuk(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    jenis_tindakan VARCHAR(50) NOT NULL,
    catatan TEXT,
    status_lama VARCHAR(30),
    status_baru VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback/Response table
CREATE TABLE maklum_balas (
    id SERIAL PRIMARY KEY,
    surat_id INTEGER REFERENCES surat_masuk(id) ON DELETE CASCADE,
    kepada VARCHAR(200) NOT NULL,
    subjek VARCHAR(500) NOT NULL,
    kandungan TEXT NOT NULL,
    cara_hantar VARCHAR(50) DEFAULT 'emel' CHECK (cara_hantar IN ('emel', 'pos', 'faks', 'tangan')),
    tarikh_hantar DATE NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifikasi (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    surat_id INTEGER REFERENCES surat_masuk(id),
    jenis VARCHAR(50) NOT NULL,
    mesej TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_surat_masuk_status ON surat_masuk(status);
CREATE INDEX idx_surat_masuk_assigned_to ON surat_masuk(assigned_to);
CREATE INDEX idx_surat_masuk_created_by ON surat_masuk(created_by);
CREATE INDEX idx_surat_masuk_tarikh_terima ON surat_masuk(tarikh_terima);
CREATE INDEX idx_notifikasi_user_id ON notifikasi(user_id);
CREATE INDEX idx_notifikasi_is_read ON notifikasi(is_read);

-- Insert default admin user
INSERT INTO users (username, email, password_hash, full_name, role, bahagian) VALUES 
('admin', 'admin@mains.gov.my', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator Sistem', 'pengurusan', 'IT');
