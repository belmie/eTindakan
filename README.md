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
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer

## Pemasangan

### Prasyarat
- Node.js 18+
- PostgreSQL 12+
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
```bash
# Cipta database
createdb stsm_mains

# Import schema
psql -d stsm_mains -f lib/db/schema.sql
```

4. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
PGUSER=postgres
PGPASSWORD=your_password
PGHOST=localhost
PGPORT=5432
PGDATABASE=stsm_mains
JWT_SECRET=your_jwt_secret
```

5. **Jalankan aplikasi**
```bash
# Frontend (port 3000)
npm run dev

# Backend (port 3001)
node server/index.js
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
