# STSM - Sistem Tindakan Surat Masuk

Sistem pengurusan surat masuk untuk Majlis Agama Islam Negeri Sembilan (MAINS).

## Ciri-ciri Utama

- ✅ **Pendaftaran Surat Masuk** - Daftar surat dengan lampiran digital
- ✅ **Pengagihan Tindakan** - Agih surat kepada pegawai berkaitan
- ✅ **Penjejakan Status** - Pantau status surat secara real-time
- ✅ **Maklum Balas** - Hantar respons kepada pengirim surat
- ✅ **Dashboard & Laporan** - Statistik dan analisis surat
- ✅ **Pengurusan Pengguna** - Role-based access control

## Peranan Pengguna

1. **Kerani Pejabat** - Merekod surat masuk
2. **Pegawai Bahagian/Ketua Unit** - Terima dan agih tindakan
3. **Pegawai Pelaksana** - Laksana arahan dan hantar maklum balas
4. **Pengurusan Atasan** - Pantau status dan jana laporan

## Teknologi

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: Microsoft SQL Server
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer

## Pemasangan

### Prasyarat
- Node.js 18+
- Microsoft SQL Server 2019+ atau SQL Server Express
- Git

### Langkah Pemasangan

1. **Clone repositori**
```bash
git clone https://github.com/belmie/eTindakan.git
cd eTindakan
```

2. **Install dependencies**
```bash
npm install
# atau
bun install
```

3. **Setup database**
```sql
-- Cipta database baru
CREATE DATABASE stsm_mains;
GO

-- Gunakan database
USE stsm_mains;
GO

-- Import schema dari lib/db/schema.sql
```

4. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_SERVER=localhost
DB_DATABASE=stsm_mains
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true
JWT_SECRET=your_jwt_secret_key_here
```

5. **Jalankan aplikasi**
```bash
# Frontend (port 3000)
npm run dev

# Backend (port 3001)
node server/index.js
```

## Konfigurasi SQL Server

### SQL Server Express (Percuma)
1. Download SQL Server Express dari Microsoft
2. Install dengan Mixed Mode Authentication
3. Set password untuk user 'sa'
4. Enable TCP/IP protocol
5. Restart SQL Server service

### Connection String
```
Server: localhost,1433
Database: stsm_mains
User: sa
Password: [your_password]
```

## Penggunaan

### Login Lalai
- **Username**: admin
- **Password**: password

### Aliran Kerja
1. Kerani daftar surat masuk baru
2. Ketua Unit agih kepada Pegawai Pelaksana
3. Pegawai Pelaksana kemaskini status dan hantar maklum balas
4. Pengurusan pantau kemajuan melalui dashboard

## Status Surat

- **Belum Mula** - Surat baru didaftarkan
- **Dalam Proses** - Surat telah diagihkan
- **Selesai** - Tindakan telah selesai
- **Maklum Balas Dihantar** - Respons telah dihantar

## Struktur Projek

```
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── forms/           # Form components
│   └── ui/              # shadcn/ui components
├── lib/                  # Utilities and database
│   └── db/              # Database connection and schema
├── server/              # Express.js backend
└── public/              # Static assets
```

## Database Schema

### Jadual Utama
- **users** - Pengguna sistem
- **surat_masuk** - Surat masuk
- **lampiran** - Fail lampiran
- **tindakan** - Log tindakan
- **maklum_balas** - Respons/maklum balas
- **notifikasi** - Notifikasi sistem

## Deployment

### Windows Server + IIS
1. Install Node.js di server
2. Install SQL Server
3. Configure IIS dengan iisnode
4. Set environment variables
5. Deploy aplikasi

### Cloud Deployment
- **Azure**: App Service + SQL Database
- **AWS**: EC2 + RDS SQL Server
- **Google Cloud**: Compute Engine + Cloud SQL

## Troubleshooting

### Connection Issues
```bash
# Test SQL Server connection
sqlcmd -S localhost -U sa -P YourPassword
```

### Common Errors
- **Login failed**: Check SQL Server authentication mode
- **Network error**: Enable TCP/IP protocol
- **Permission denied**: Check user permissions

## Sumbangan

1. Fork repositori ini
2. Cipta branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## Lesen

Projek ini adalah hak milik Majlis Agama Islam Negeri Sembilan.

## Sokongan

Untuk sokongan teknikal, hubungi:
- Email: support@mains.gov.my
- Tel: +60-6-xxx-xxxx
- GitHub: https://github.com/belmie/eTindakan
