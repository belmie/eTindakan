# Cara Upload Projek STSM ke GitHub

Kerana authentication diperlukan untuk push ke GitHub, berikut adalah langkah manual untuk upload projek:

## Pilihan 1: Upload Manual (Mudah)

1. **Download semua fail projek**
   - Buka terminal/command prompt di komputer anda
   - Clone projek ini: `git clone [URL_PROJEK_INI]`
   - Atau download sebagai ZIP dari interface web

2. **Upload ke GitHub anda**
   - Pergi ke https://github.com/belmie/eTindakan
   - Klik "uploading an existing file" atau "Add file" > "Upload files"
   - Drag & drop semua folder dan fail projek
   - Commit dengan mesej: "Initial commit: STSM - Sistem Tindakan Surat Masuk"

## Pilihan 2: Git Command Line

Jika anda ada Git di komputer:

```bash
# Clone projek ini ke komputer anda
git clone [URL_PROJEK_INI] stsm-local
cd stsm-local

# Tukar remote ke repositori anda
git remote remove origin
git remote add origin https://github.com/belmie/eTindakan.git

# Push ke GitHub anda (akan minta username/password atau token)
git push -u origin main
```

## Pilihan 3: GitHub Desktop

1. Download GitHub Desktop
2. Clone projek ini
3. Tukar remote repository ke https://github.com/belmie/eTindakan.git
4. Push changes

## Struktur Projek yang Telah Siap

```
stsm-mains/
├── app/                    # Next.js pages
├── components/            # React components
├── lib/                   # Database & utilities
├── server/               # Express.js backend
├── public/               # Static files
├── README.md             # Dokumentasi lengkap
├── package.json          # Dependencies
└── .gitignore           # Git ignore rules
```

## Selepas Upload ke GitHub

1. **Setup Environment Variables** di platform hosting:
   ```
   PGUSER=your_db_user
   PGPASSWORD=your_db_password
   PGHOST=your_db_host
   PGPORT=5432
   PGDATABASE=stsm_mains
   JWT_SECRET=your_secret_key
   ```

2. **Deploy ke platform pilihan**:
   - Vercel (untuk frontend)
   - Railway/Heroku (untuk fullstack)
   - VPS sendiri

3. **Setup Database**:
   - Import `lib/db/schema.sql` ke PostgreSQL database anda
   - Update connection settings

## Sokongan

Jika ada masalah, hubungi:
- Email: wanhelmimuzzamil@gmail.com
- GitHub: https://github.com/belmie/eTindakan

Projek STSM telah siap dan berfungsi sepenuhnya!
