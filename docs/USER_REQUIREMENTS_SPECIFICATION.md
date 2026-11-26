# DOKUMEN SPESIFIKASI KEPERLUAN PENGGUNA SISTEM (USER REQUIREMENTS SPECIFICATION - URS)
## SISTEM TINDAKAN SURAT MASUK (STSM)
**MAJLIS AGAMA ISLAM NEGERI SEMBILAN (MAINS)**

---

### MAKLUMAT DOKUMEN
- **Nama Projek**: Sistem Tindakan Surat Masuk (STSM) MAINS
- **Versi Dokumen**: 1.0
- **Status**: Lengkap / Diluluskan
- **Tarikh Dokumen**: 21 November 2026
- **Agensi**: Majlis Agama Islam Negeri Sembilan (MAINS)
- **Kategori**: Dokumentasi Kejuruteraan Perisian & Analisis Keperluan

---

## 1. PENGENALAN & LATAR BELAKANG PROJEK

### 1.1 Latar Belakang
Majlis Agama Islam Negeri Sembilan (MAINS) menerima sejumlah besar surat rasmi harian daripada agensi kerajaan, sektor swasta, institusi pendidikan, pertubuhan bukan kerajaan (NGO), dan orang awam. Pengurusan surat fizikal secara manual mendedahkan agensi kepada risiko kelewatan tindakan, kesukaran pengesanan lokasi fizikal surat, ketidakpatuhan Piagam Pelanggan/SLA (Service Level Agreement), dan ketiadaan jejak audit digital yang telus.

Sistem Tindakan Surat Masuk (STSM) dibangunkan sebagai sistem pengurusan surat dan pergerakan minit digital hujung-ke-hujung (*end-to-end*) untuk merekod, mengagih, meminitkan arahan secara hierarki, memantau tindakan, dan merekod maklum balas rasmi MAINS secara masa-nyata (*real-time*).

### 1.2 Objektif Sistem
1. **Digitalisasi Pendaftaran Surat**: Membolehkan pendaftaran surat masuk secara individu atau pukal beserta lampiran digital (PDF/Imej) dan pengecaman metadata secara automatik.
2. **Pengagihan Minit Berhierarki**: Menyeragamkan aliran arahan daripada Setiausaha MAINS turun kepada Timbalan Setiausaha (Operasi/Pengurusan), Pengarah Jabatan, Ketua Penolong Pengarah Bahagian, Ketua Unit, hingga ke Pegawai Cawangan/Daerah.
3. **Pematuhan SLA 14 Hari**: Memastikan setiap surat diambil tindakan dalam tempoh Piagam Pelanggan (14 hari bekerja/kalendar) dengan penunjuk visual amaran lewat dan pemberitahuan pintar.
4. **Penyelarasan Fizikal & Digital (Slip QR A5 & Lembaran Minit A4)**: Memudahkan pergerakan fail fizikal menggunakan Slip Pengesanan Berkod QR A5 dan Lembaran Minit Rasmi A4 yang boleh dicetak.
5. **Ketelusan & Jejak Audit (Audit Trail)**: Merekodkan sejarah lengkap setiap tindakan, minit, semakan, dan status pegawai yang bertanggungjawab bagi tujuan tadbir urus dan integriti.

---

## 2. SKOP SISTEM & PERSEKITARAN OPERASI

### 2.1 Skop Pengguna & Liputan Agensi
Sistem merangkumi seluruh hierarki pentadbiran MAINS:
- **Peringkat Pengurusan Tertinggi**: Pejabat Setiausaha MAINS, Pejabat Timbalan Setiausaha Operasi (TSO), Pejabat Timbalan Setiausaha Pengurusan (TSP).
- **Peringkat Jabatan & Bahagian**:
  - Jabatan Zakat (Kutipan, Agihan).
  - Jabatan Wakaf & Mal (Wakaf, Mal, Kompleks As-Saadah, Balai Cerap).
  - Jabatan Pentadbiran (Sumber Manusia, Kaunseling, Teknologi Maklumat, Pengurusan Projek).
  - Jabatan Perbendaharaan (Perakaunan, Kewangan, Belanjawan, Perolehan).
  - Unit-unit Khas (Unit Undang-Undang, Unit Audit Dalam, Unit Integriti, Komunikasi Korporat).
- **Peringkat Cawangan & Daerah**: 11 Pejabat MAINS Daerah & Cawangan (Seremban, Port Dickson, Rembau, Tampin, Kuala Pilah, Jelebu, Jempol, Nilai, Seremban 2, Senawang, Gemas).

### 2.2 Arkitektur Teknologi
- **Antaramuka Pengguna (Frontend)**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
- **Pelayan Aplikasi (Backend API)**: Node.js + Express.js RESTful API, Autentikasi JWT, Pengendalian Muat Naik Multer.
- **Pangkalan Data (Database)**: Microsoft SQL Server (MSSQL 2019/2022 / Azure SQL) dengan sambungan terurus `mssql`.
- **Storan Objek Awan**: Huawei Cloud / S3-compatible Object Storage Service (OBS) & Sandaran Storan Tempatan (`uploads/`).

---

## 3. PROFIL PENGGUNA & MATRIKS HAK AKSES (RBAC)

Sistem menetapkan 5 peranan utama berasaskan Role-Based Access Control (RBAC):

| Kod Peranan | Nama Peranan | Penerangan Tanggungjawab Utama |
|---|---|---|
| `pentadbir_sistem` | Pentadbir Sistem (Admin) | Kawalan penuh sistem, pengurusan akaun pengguna, konfigurasi menu navigasi, konfigurasi RBAC, tetapan SLA agensi, dan penyelenggaraan pangkalan data. |
| `pengurusan` | Pengurusan Tertinggi (Setiausaha / TSO / TSP) | Menerima surat terus daripada pendaftaran, menurunkan minit arahan dasar/tindakan kepada ketua jabatan/bahagian, memantau laporan analitik dan prestasi SLA agensi. |
| `ketua_unit` | Ketua Unit / Pegawai Bahagian / Pengarah | Menerima minit arahan daripada pihak pengurusan, memperincikan arahan dan meminitkan ke peringkat bawahan (Pegawai Pelaksana/Cawangan), serta memperaku tindakan selesai. |
| `pegawai_pelaksana` | Pegawai Pelaksana / Pegawai Operasi Cawangan | Melaksanakan arahan fizikal/teknikal, mengemas kini status tindakan (Sedang/Telah), memuat naik bukti dokumen/maklum balas, dan melengkapkan tandatangan digital. |
| `kerani` | Kerani Pendaftaran / Urusetia Pejabat | Menerima surat fizikal/emel, mengimbas dokumen, mendaftar surat (individu/pukal), mencetak Slip Kod QR A5 dan Lembaran Minit A4, memautkan surat berkaitan. |

### Matriks Kebenaran Hak Akses (12 Modul Kuasa)
1. `daftar_surat`: Mendaftar surat masuk individu.
2. `pukal_surat`: Mendaftar surat masuk secara kelompok (batch).
3. `minit_bawah`: Menurunkan minit arahan ke peringkat bawahan dalam hierarki.
4. `rekod_tindakan`: Merekod kemajuan tindakan (Sedang/Telah) dan maklum balas selesai.
5. `paut_surat`: Memautkan rujukan surat baharu kepada surat induk terdahulu.
6. `cetak_slip`: Menjana dan mencetak Slip Pengesanan QR bersaiz A5.
7. `cetak_minit`: Menjana dan mencetak Lembaran Minit Tindakan fizikal A4 / PDF.
8. `lihat_analisis`: Melihat papan pemuka statistik lanjutan dan kepatuhan SLA.
9. `urus_pengguna`: Menambah, mengemas kini profil, dan menyahaktifkan pengguna.
10. `urus_menu`: Mengawal selia keterlihatan menu navigasi mengikut peranan.
11. `urus_peranan`: Mengubah suai matriks kebenaran RBAC secara dinamik.
12. `tetapan_sistem`: Mengubah tempoh SLA rasmi, maklumat agensi, dan integrasi pelayan.

---

## 4. KEPERLUAN FUNGSIAN SISTEM (FUNCTIONAL REQUIREMENTS)

### MODUL 1: AUTENTIKASI & KAWALAN KESELAMATAN (AUTH)
- **FR-AUTH-01**: Pengguna mesti memasukkan *username* dan *password* yang sah untuk log masuk ke dalam sistem.
- **FR-AUTH-02**: Sistem mesti menyulitkan kata laluan pengguna menggunakan algoritma *hashing* bcrypt dengan salt minimum 10 pusingan.
- **FR-AUTH-03**: Sistem mesti menjana JSON Web Token (JWT) yang mengandungi identiti pengguna, id nod organisasi, dan peranan bagi setiap sesi yang sah.
- **FR-AUTH-04**: Sistem mesti membolehkan log keluar selamat dan menamatkan token sesi serta-merta pada pelayar.
- **FR-AUTH-05**: Pengguna yang tidak aktif (*is_active = 0*) mesti dihalang daripada mengakses sistem.

### MODUL 2: PENDAFTARAN SURAT MASUK (REGISTER)
- **FR-REG-01 (Penomboran Automatik)**: Sistem mesti menjana Nombor Daftar Masuk unik secara automatik mengikut format piawai MAINS: `MAINS/SU/{TAHUN}/{NO_SIRI_4_DIGIT}` (contoh: `MAINS/SU/2026/0001`).
- **FR-REG-02 (Pendaftaran Individu)**: Sistem mesti menyediakan borang pendaftaran surat yang merangkumi medan mandatori:
  - Perkara / Subjek Surat
  - Pengirim (Agensi / Syarikat / Individu)
  - Nombor Rujukan Pengirim
  - Tarikh Terima (Lalai: Tarikh Hari Ini)
  - Tarikh Surat
  - Kategori (Pentadbiran, Zakat, Wakaf, Kewangan, Aduan, Jemputan, ICT, Lain-lain)
  - Tahap Keutamaan (Biasa, Segera, Sangat Segera)
  - Catatan Tambahan (Pilihan)
- **FR-REG-03 (Pengecaman Heuristik / AI Metadata)**: Apabila fail lampiran dipilih, sistem mesti menganalisis nama fail dan corak teks untuk mengekstrak No Rujukan, Perkara, Pengirim, dan Kategori secara automatik bagi mempercepat proses input.
- **FR-REG-04 (Pendaftaran Pukal / Bulk Registration)**: Sistem mesti menyokong pemilihan pelbagai fail serentak untuk pendaftaran beramai-ramai dalam bentuk grid jadual dengan tetapan pengirim dan kategori sepunya.
- **FR-REG-05 (Destinasi Lalai Surat Baharu)**: Setiap surat baharu yang didaftarkan mesti dihantar secara automatik ke Peti Minit Pejabat Setiausaha MAINS (`su`) dengan status penerima `akan`.

### MODUL 3: PENGURUSAN LAMPIRAN & PAPARAN DOKUMEN (ATTACHMENT)
- **FR-ATT-01**: Sistem mesti membenarkan muat naik fail lampiran berformat `.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`, `.xls`, `.xlsx` dengan saiz maksimum 10MB setiap fail.
- **FR-ATT-02**: Sistem mesti menyokong penyimpanan dwi-saluran: storan pelayan tempatan (`uploads/`) dan penyelarasan ke Storan Objek Awan (OBS).
- **FR-ATT-03 (Penonton Dokumen Terbina Dalam)**: Sistem mesti menyediakan modal pelihat PDF dan imej interaktif terus dalam pelayar tanpa memerlukan muat turun perisian luar.

### MODUL 4: PETI MINIT & AGIHAN ARAHAN BERHIERARKI (MINITING)
- **FR-MNT-01**: Peti minit mesti memaparkan senarai surat mengikut 3 tab:
  - *Perlu Tindakan*: Surat yang ditujukan kepada peranan semasa dan memerlukan tindakan.
  - *Diminitkan*: Surat yang telah diminitkan oleh pengguna kepada pegawai bawahan.
  - *Selesai*: Surat yang telah selesai diambil tindakan sepenuhnya.
- **FR-MNT-02 (Penurunan Minit Mengikut Hierarki)**: Pengguna hanya dibenarkan meminitkan surat kepada nod subordinat/bawahan yang sah dalam struktur organisasi MAINS (contoh: Setiausaha -> TSO/TSP/Pengarah; Pengarah -> Ketua Unit).
- **FR-MNT-03 (Quick Action Chips)**: Sistem mesti menyediakan pilihan arahan pantas standard kerajaan, seperti:
  - "Untuk tindakan segera"
  - "Sila ambil tindakan sewajarnya"
  - "Sila kaji & kemukakan syor"
  - "Untuk makluman & tindakan"
  - "Sila selaraskan & laporkan kepada saya"
  - "Sila sediakan draf jawapan"
- **FR-MNT-04**: Apabila minit diturunkan, status penerima semasa bertukar kepada `diturunkan`, dan penerima baharu ditambah dengan status `akan`. Log tindakan audit mesti dijana secara automatik.

### MODUL 5: PEREKODAN TINDAKAN & MAKLUM BALAS (ACTION & FEEDBACK)
- **FR-ACT-01**: Penerima aktif dibenarkan menukar status tindakan peribadi daripada `akan` kepada `sedang` (Sedang Diambil Tindakan) atau `telah` (Telah Diambil Tindakan).
- **FR-ACT-02**: Apabila status ditanda sebagai `telah` (Selesai), medan Catatan Penyelesaian adalah WAJIB diisi.
- **FR-ACT-03 (Penutupan Keseluruhan Surat)**: Status keseluruhan surat hanya bertukar kepada `telah` (Selesai Sepenuhnya) apabila SEMUA penerima aktif telah melengkapkan tindakan masing-masing. Tarikh selesai (`tarikh_selesai`) akan direkodkan.
- **FR-ACT-04 (Tandatangan Digital Maklum Balas)**: Sistem mesti menyediakan modul tandatangan digital kanvas untuk pengesahan pegawai sebelum menghantar maklum balas penyelesaian rasmi.

### MODUL 6: PENGESANAN SLA 14 HARI & AMARAN LEWAT (SLA TRACKING)
- **FR-SLA-01 (Kiraan Tarikh Sasaran)**: Tarikh sasaran penyelesaian dikira secara automatik: `Tarikh Terima + 14 Hari Kalendar`.
- **FR-SLA-02 (Penunjuk Visual Status SLA)**:
  - 🟢 **Dalam Tempoh / Telah Selesai**: Tindakan selesai sebelum atau pada hari ke-14.
  - 🟡 **Amaran Segera (Hampir Lewat)**: Baki masa antara 0 hingga 3 hari sebelum tamat tempoh.
  - 🔴 **Lewat (>14 Hari)**: Melebihi 14 hari dari tarikh terima dan belum diselesaikan sepenuhnya.
  - 🔵 **Diminitkan**: Status sedang berada di peringkat cawangan/unit bawahan.
- **FR-SLA-03 (Pemberitahuan Peringatan)**: Sistem mesti membolehkan penghantaran mesej notifikasi segera melalui saluran WhatsApp dan Emel terus kepada pegawai yang bertanggungjawab bagi surat yang menghampiri atau telah melebihi SLA.

### MODUL 7: CETAKAN & INTEGRASI DOKUMEN FIZIKAL (PRINT & QR)
- **FR-PRN-01 (Slip Pengesanan QR A5)**: Sistem mesti berupaya menjana Slip Pengesanan Surat Masuk bersaiz format A5 Lanskap/Potret yang mengandungi:
  - Kod QR Beresolusi Tinggi (membawa pautan pengesanan langsung).
  - Nombor Daftar Surat & Nombor Rujukan Pengirim.
  - Tarikh Terima, Tarikh Surat & Had Masa SLA (14 Hari).
  - Nama Pengirim & Ringkasan Perkara.
  - Ruangan Tanda Tangan & Cap Penerimaan Fail.
- **FR-PRN-02 (Lembaran Minit Tindakan A4)**: Sistem mesti boleh menjana borang fizikal A4 format rasmi MAINS yang memaparkan jadual kronologi minit arahan lengkap berserta tandatangan penyerahan.
- **FR-PRN-03**: Sistem mesti membolehkan eksport lembaran minit ke format PDF sedia cetak.

### MODUL 8: PAUTAN SURAT BERKAITAN (LETTER LINKING)
- **FR-LNK-01**: Sistem mesti membenarkan carian dan pemautan mana-mana surat susulan/jawapan kepada surat induk sedia ada.
- **FR-LNK-02**: Antaramuka mesti memaparkan lencana rujukan pautan silang (*cross-reference badge*) yang membolehkan pengguna beralih antara surat berkaitan dalam satu klik.

### MODUL 9: STRUKTUR ORGANISASI & DIREKTORI PEGAWAI (ORGANIZATION DIRECTORY)
- **FR-ORG-01**: Sistem mesti memaparkan carta salasilah hierarki penuh MAINS (Pejabat SU -> TSO/TSP -> Jabatan -> Bahagian -> Unit -> Daerah & Cawangan).
- **FR-ORG-02**: Pengguna boleh melihat profil setiap nod termasuk nama jawatan, nama pemegang jawatan, status jawatan (Terisi/Kosong), nombor telefon, emel rasmi, dan pautan terus WhatsApp.
- **FR-ORG-03**: Sistem membenarkan pentadbir mengemas kini maklumat hubungan pegawai secara terus dalam pangkalan data.

### MODUL 10: ANALISIS & LAPORAN PRESTASI (ANALYTICS)
- **FR-RPT-01**: Sistem mesti memaparkan kad statistik masa-nyata: Jumlah Surat Masuk, Dalam Tempoh SLA, Amaran Lewat (Baki <= 3 hari), dan Terlewat (> 14 hari).
- **FR-RPT-02**: Menyediakan carta visual interaktif bagi:
  - Trend kemasukan surat (Harian, Mingguan, Bulanan, Tahunan).
  - Taburan kategori surat (Zakat, Wakaf, Pentadbiran, dll.).
  - Indeks Peratusan Pematuhan SLA mengikut Bahagian dan Daerah.
- **FR-RPT-03**: Menyokong penapisan laporan mengikut julat tarikh, jabatan, dan status tindakan.

### MODUL 11: PENTADBIRAN SISTEM (ADMINISTRATION)
- **FR-ADM-01 (Pengurusan Pengguna)**: Pentadbir boleh mendaftar kakitangan baharu, menyunting maklumat profil, menetapkan peranan, mereset kata laluan, dan menukar status aktif/tidak aktif.
- **FR-ADM-02 (Pengurusan Menu Dinamik)**: Pentadbir boleh menetapkan menu mana yang boleh dilihat oleh setiap peranan tanpa perlu mengubah kod atur cara.
- **FR-ADM-03 (Pengurusan Peranan RBAC)**: Pentadbir boleh mengaktifkan atau mematikan mana-mana daripada 12 matriks kebenaran mengikut peranan.
- **FR-ADM-04 (Tetapan Sistem & SLA)**: Membolehkan pengubahan tempoh had masa SLA lalai (lalai: 14 hari), nama agensi, alamat pejabat, nombor telefon, nombor faks, dan emel rasmi.
- **FR-ADM-05 (Pemantauan Pelayan & Sandaran)**: Memaparkan status sambungan MSSQL, OBS Storage, dan butang sandaran data (*database export/backup*).

---

## 5. KEPERLUAN BUKAN FUNGSIAN (NON-FUNCTIONAL REQUIREMENTS)

### 5.1 Prestasi (Performance)
- **NFR-PERF-01**: Masa tindak balas pemuatan papan pemuka utama tidak melebihi 2 saat pada rangkaian LAN/WAN pejabat.
- **NFR-PERF-02**: Carian dan penapisan senarai surat mesti dilaksanakan secara responsif (< 500ms) menggunakan indeks pangkalan data yang dioptimumkan.

### 5.2 Keselamatan (Security)
- **NFR-SEC-01**: Semua komunikasi data melalui protokol selamat HTTPS dan sokongan token JWT terenkripsi.
- **NFR-SEC-02**: Perlindungan terhadap serangan SQL Injection menggunakan *parameterized queries* pada pelayan Express dan MSSQL.
- **NFR-SEC-03**: Perlindungan terhadap Cross-Site Scripting (XSS) dan pematuhan Content-Security-Policy.
- **NFR-SEC-04**: Muat naik fail dihadkan kepada jenis MIME dokumen yang sah dengan pemeriksaan saiz maksimum 10MB.

### 5.3 Kebolehpercayaan & Ketersediaan (Reliability & Availability)
- **NFR-REL-01**: Ketersediaan sistem disasarkan pada 99.5% waktu operasi pejabat waktu bekerja.
- **NFR-REL-02**: Pangkalan data disandarkan secara berkala (harian dan mingguan) bagi mengelakkan kehilangan data.

### 5.4 Kebolehgunaan & Reka Bentuk Antaramuka (Usability & Accessibility)
- **NFR-USE-01**: Antaramuka moden yang mesra pengguna berasaskan garis panduan reka bentuk kerajaan dan menyokong Mod Cerah (Light Mode) serta Mod Gelap (Dark Mode).
- **NFR-USE-02**: Susun atur responsif yang menyokong paparan komputer meja (*desktop*), komputer riba, dan tablet.

### 5.5 Pematuhan Tadbir Urus & Audit (Compliance & Audit Trail)
- **NFR-AUD-01**: Setiap penambahan surat, pengagihan minit, perubahan status, dan catatan tindakan mesti direkodkan dalam jadual `tindakan` atau `log_data` lengkap dengan cap masa (`created_at`) dan identiti pegawai (`user_id`).
