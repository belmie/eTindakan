-- Database Schema for STSM (Sistem Tindakan Surat Masuk) - Microsoft SQL Server

-- Users table for authentication and role management
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('kerani', 'ketua_unit', 'pegawai_pelaksana', 'pengurusan')),
    bahagian NVARCHAR(100),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Incoming letters table
CREATE TABLE surat_masuk (
    id INT IDENTITY(1,1) PRIMARY KEY,
    no_rujukan NVARCHAR(50) UNIQUE NOT NULL,
    tarikh_terima DATE NOT NULL,
    tarikh_surat DATE NOT NULL,
    pengirim NVARCHAR(200) NOT NULL,
    alamat_pengirim NTEXT,
    subjek NVARCHAR(500) NOT NULL,
    ringkasan NTEXT,
    kategori NVARCHAR(100),
    keutamaan NVARCHAR(20) DEFAULT 'biasa' CHECK (keutamaan IN ('rendah', 'biasa', 'tinggi', 'kritikal')),
    status NVARCHAR(30) DEFAULT 'belum_mula' CHECK (status IN ('belum_mula', 'dalam_proses', 'selesai', 'maklum_balas_dihantar')),
    tarikh_akhir_tindakan DATE,
    created_by INT REFERENCES users(id),
    assigned_to INT REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- File attachments table
CREATE TABLE lampiran (
    id INT IDENTITY(1,1) PRIMARY KEY,
    surat_id INT REFERENCES surat_masuk(id) ON DELETE CASCADE,
    nama_fail NVARCHAR(255) NOT NULL,
    url_fail NVARCHAR(500) NOT NULL,
    saiz_fail BIGINT,
    jenis_fail NVARCHAR(50),
    uploaded_by INT REFERENCES users(id),
    uploaded_at DATETIME2 DEFAULT GETDATE()
);

-- Action tracking table
CREATE TABLE tindakan (
    id INT IDENTITY(1,1) PRIMARY KEY,
    surat_id INT REFERENCES surat_masuk(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    jenis_tindakan NVARCHAR(50) NOT NULL,
    catatan NTEXT,
    status_lama NVARCHAR(30),
    status_baru NVARCHAR(30),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Feedback/Response table
CREATE TABLE maklum_balas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    surat_id INT REFERENCES surat_masuk(id) ON DELETE CASCADE,
    kepada NVARCHAR(200) NOT NULL,
    subjek NVARCHAR(500) NOT NULL,
    kandungan NTEXT NOT NULL,
    cara_hantar NVARCHAR(50) DEFAULT 'emel' CHECK (cara_hantar IN ('emel', 'pos', 'faks', 'tangan')),
    tarikh_hantar DATE NOT NULL,
    created_by INT REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Notifications table
CREATE TABLE notifikasi (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT REFERENCES users(id),
    surat_id INT REFERENCES surat_masuk(id),
    jenis NVARCHAR(50) NOT NULL,
    mesej NTEXT NOT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE()
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
