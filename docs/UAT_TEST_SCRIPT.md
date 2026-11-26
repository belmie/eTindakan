# SKRIP UJIAN PENERIMAAN PENGGUNA (USER ACCEPTANCE TESTING - UAT)
## SISTEM TINDAKAN SURAT MASUK (STSM)
**MAJLIS AGAMA ISLAM NEGERI SEMBILAN (MAINS)**

---

### MAKLUMAT DOKUMEN UAT
- **Nama Projek**: Sistem Tindakan Surat Masuk (STSM) MAINS
- **Versi Dokumen**: 1.0
- **Fasa Ujian**: User Acceptance Testing (UAT)
- **Tarikh Ujian**: 21 - 25 November 2026
- **Lokasi Ujian**: Makmal Komputer / Bilik Mesyuarat Menara MAINS & Pejabat Daerah/Cawangan
- **Persekitaran Ujian**: UAT Staging Server (`http://localhost:3000` / `http://stsm-uat.mains.gov.my`)
- **Pangkalan Data**: MSSQL Server (Pangkalan Data Ujian: `stsm_mains_uat`)

---

## 1. PENGENALAN & OBJEKTIF UAT

### 1.1 Objektif
1. Mengesahkan bahawa semua fungsi sistem yang dibangunkan memenuhi Spesifikasi Keperluan Pengguna (URS).
2. Memastikan aliran kerja pendaftaran surat masuk, penurunan minit arahan berhierarki, perekodan tindakan, pematuhan SLA 14 hari, dan penjanaan dokumen rasmi beroperasi dengan lancar dan bebas ralat.
3. Memastikan keserasian antaramuka, keselamatan hak akses mengikut peranan (RBAC), serta kesediaan sistem untuk pelaksanaan fasa *Go-Live*.

### 1.2 Kriteria Penerimaan (Acceptance Criteria)
- **Kadar Kejayaan Minimum**: 100% kes ujian tahap Kritikal & Tinggi (*Critical & High*) mesti Lulus (PASS).
- **Ralat Terbuka (Open Bugs)**: Sifar (0) isu *Severity 1 (Blocker/Critical)*. Sebarang isu *Severity 2/3* mesti mempunyai pelan pembetulan yang dipersetujui.
- **Pengesahan Rasmi**: Ditandatangani oleh wakil penguji daripada setiap bahagian dan pentadbir sistem MAINS.

---

## 2. PROFIL PENGUJI (TESTER PROFILES)

| ID Penguji | Nama Pegawai | Jawatan / Bahagian | Peranan Diuji | Tandatangan |
|---|---|---|---|---|
| UAT-P1 | Puan Noor Azira binti Najib | Unit Urusetia, BKK | `kerani` | _______________ |
| UAT-P2 | Encik Zainal bin Said | Pejabat Setiausaha MAINS | `pengurusan` | _______________ |
| UAT-P3 | Tuan Mahadi bin Ali | Pengarah, Jabatan Zakat | `ketua_unit` | _______________ |
| UAT-P4 | Encik Mohd Hasni bin Zulkifle | KPP, Bahagian Agihan Zakat | `ketua_unit` | _______________ |
| UAT-P5 | Encik Zamri bin Ahmad Suhaimi | Pegawai MAINS Daerah Seremban | `pegawai_pelaksana` | _______________ |
| UAT-P6 | Puan Norpisah binti Zakaria | KPP, Bahagian Teknologi Maklumat | `pentadbir_sistem` | _______________ |

---

## 3. PANDUAN PENGISIAN STATUS KES UJIAN

- **LULUS (PASS)**: Hasil sebenar menepati hasil yang dijangka.
- **GAGAL (FAIL)**: Hasil sebenar tidak menepati hasil yang dijangka atau sistem mengeluarkan ralat.
- **BLOCKED**: Ujian tidak dapat diteruskan kerana terdapat isu prasyarat atau kegagalan modul lain.

---

## 4. JADUAL MATRIKS KES UJIAN UAT (DETAILED TEST CASES)

### MODUL 1: AUTENTIKASI & KAWALAN HAK AKSES (AUTH & RBAC)

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-AUTH-01** | Log Masuk Berjaya | Pelayan aktif, pelayar dibuka pada halaman `/` | 1. Masukkan Username.<br>2. Masukkan Password yang sah.<br>3. Klik "Log Masuk Sistem". | Username: `admin`<br>Password: `password` | Berjaya log masuk, mesej selamat datang dipaparkan, pengguna dibawa ke Papan Pemuka Utama (`utama`). | [ ] Lulus<br>[ ] Gagal | |
| **UAT-AUTH-02** | Log Masuk Gagal (Kata Laluan Tidak Sah) | Halaman log masuk | 1. Masukkan Username sah.<br>2. Masukkan Password salah.<br>3. Klik "Log Masuk". | Username: `admin`<br>Password: `salah123` | Sistem memaparkan notifikasi ralat amaran: "Nama pengguna atau kata laluan tidak sah". Akses disekat. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-AUTH-03** | Log Keluar Selamat | Pengguna sedang log masuk | 1. Klik butang "Log Keluar" pada bahagian kanan pengepala (header). | Sesi aktif pengguna | Sesi ditamatkan serta-merta, token JWT dipadam daripada storan, antaramuka kembali ke borang log masuk. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-AUTH-04** | Sekatan Menu Mengikut Peranan | Log masuk sebagai Kerani (`kerani`) | 1. Periksa menu pada bar sisi.<br>2. Cuba akses URL modul admin secara manual. | Peranan: Kerani | Menu Pentadbir (Pengurusan Pengguna, Menu, Peranan, Tetapan) tidak dipaparkan dan tidak boleh diakses. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 2: PENDAFTARAN SURAT MASUK INDIVIDU (REGISTRATION)

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-REG-01** | Penomboran Automatik Format MAINS | Log masuk peranan `kerani` atau `pentadbir_sistem` | 1. Klik menu "Daftar Surat".<br>2. Lihat medan "Nombor Daftar". | Tarikh Terima: Semasa | Sistem memaparkan format nombor pendaftaran siri seterusnya secara automatik: `MAINS/SU/{TAHUN}/{SIRI_4_DIGIT}`. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-REG-02** | Muat Naik Lampiran & Pengecaman Heuristik | Pada halaman Daftar Surat | 1. Pilih fail surat PDF/gambar.<br>2. Muat naik ke dalam zon seretan. | Fail: `Surat_Rayuan_Bantuan_Zakat_Perniagaan_Ahmad_2026.pdf` | Sistem memuat naik fail, membaca tajuk, dan auto-isi medan Perkara, Pengirim, dan Kategori ('Zakat'). Toast notifikasi kejayaan auto-isi dipaparkan. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-REG-03** | Validasi Medan Mandatori | Pada borang pendaftaran | 1. Biarkan ruangan Perkara dan Pengirim kosong.<br>2. Klik butang "Daftar Surat Masuk". | Medan kosong | Sistem menghalang penghantaran dan memaparkan mesej amaran merah: "Sila isi Perkara dan Pengirim". | [ ] Lulus<br>[ ] Gagal | |
| **UAT-REG-04** | Pendaftaran Surat Tunggal Berjaya | Borang diisi lengkap | 1. Isi Perkara, Pengirim, No Rujukan, Tarikh, Kategori, Keutamaan.<br>2. Lampirkan fail dokumen.<br>3. Klik "Daftar Surat Masuk". | Pengirim: "Jabatan Hal Ehwal Agama Islam Negeri Sembilan"<br>Perkara: "Permohonan Penyelarasan Agihan Wakaf"<br>Kategori: "Wakaf"<br>Keutamaan: "Segera" | Surat berjaya didaftarkan, nombor daftar disahkan, rekod disimpan dalam pangkalan data, dan dihantar ke Peti Minit Setiausaha (`su`). | [ ] Lulus<br>[ ] Gagal | |
| **UAT-REG-05** | Had Saiz & Format Lampiran | Borang pendaftaran | 1. Cuba muat naik fail berformat `.exe` atau fail melebihi saiz 10MB. | Fail: `program.exe` atau fail > 10MB | Sistem menolak muat naik dan memaparkan amaran: "Jenis fail tidak dibenarkan" atau saiz fail melebihi had. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 3: PENDAFTARAN PUKAL (BULK REGISTRATION)

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-BLK-01** | Beralih ke Mod Pukal | Halaman Daftar Surat | 1. Klik butang togol mod ke "Pendaftaran Pukal". | - | Antaramuka beralih ke mod pendaftaran kelompok dengan ruangan zon fail pukal dan tetapan sepunya. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-BLK-02** | Muat Naik Berbilang Dokumen | Mod Pendaftaran Pukal | 1. Pilih 3 fail PDF berbeza serentak.<br>2. Masukkan Pengirim Sepunya.<br>3. Pilih Kategori Sepunya. | 3 fail PDF,<br>Pengirim: "Pejabat Daerah Seremban",<br>Kategori: "Pentadbiran" | 3 baris borang dijana dalam jadual grid. Pengirim dan Kategori terisi secara automatik bagi setiap baris. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-BLK-03** | Simpan Pendaftaran Pukal | Jadual grid pukal lengkap | 1. Klik butang "Simpan Semua Pendaftaran Pukal". | 3 dokumen dalam jadual | Ketiga-tiga surat didaftarkan serentak dengan 3 nombor daftar berturutan (contoh: `.../0002`, `.../0003`, `.../0004`). | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 4: PETI MINIT & PENURUNAN ARAHAN HIERARKI (MINITING)

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-MNT-01** | Paparan Surat dalam Peti Minit | Log masuk sebagai Setiausaha (`su`) | 1. Klik menu "Peti Minit".<br>2. Semak tab "Perlu Tindakan". | Surat baharu didaftarkan | Surat yang baru didaftarkan berada dalam senarai "Perlu Tindakan" dengan status "Akan Diambil Tindakan". | [ ] Lulus<br>[ ] Gagal | |
| **UAT-MNT-02** | Buka Laci Butiran Surat (Drawer) | Peti Minit mengandungi surat | 1. Klik pada salah satu baris surat. | Surat pilihan | Laci butiran terbuka dari sebelah kanan memaparkan No Daftar, Pengirim, Perkara, Keutamaan, Had SLA, dan lampiran dokumen. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-MNT-03** | Buka Modal Minit Arahan | Pada Laci Butiran atau senarai surat | 1. Klik butang "Minitkan Arahan" (ikon ✉️). | Surat pilihan | Tetingkap modal minit terbuka memaparkan senarai pegawai subordinat MAINS dan ruangan arahan minit. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-MNT-04** | Pemilihan Penerima & Frasa Pantas (Chips) | Modal Minit dibuka | 1. Pilih penerima: `Pengarah Jabatan Zakat`.<br>2. Klik cip arahan pantas: *"Sila kaji & kemukakan syor"*.<br>3. Tambah catatan tambahan. | Penerima: `jz`<br>Arahan: Cip Pantas | Frasa pantas dimasukkan ke dalam kotak teks arahan secara automatik dan boleh disunting. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-MNT-05** | Hantar Minit Arahan Berjaya | Penerima dan arahan diisi | 1. Klik butang "Hantar Minit Arahan". | - | Minit berjaya dihantar. Surat pada profil Setiausaha beralih ke tab "Diminitkan". Log audit minit dikemas kini dengan cap masa. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-MNT-06** | Penerimaan Minit oleh Pegawai Bawahan | Log masuk sebagai Pengarah Zakat (`jz`) | 1. Akses menu "Peti Minit".<br>2. Semak tab "Perlu Tindakan". | ID Peranan: `jz` | Surat yang diminitkan oleh Setiausaha kini berada dalam Peti Minit Pengarah Zakat untuk tindakan selanjutnya. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 5: PEREKODAN TINDAKAN & MAKLUM BALAS SELESAI (ACTION)

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-ACT-01** | Kemaskini Status kepada "Sedang Diambil Tindakan" | Pegawai mempunyai surat dalam tab Perlu Tindakan | 1. Klik butang "Rekod Tindakan".<br>2. Pilih radio "Sedang Diambil Tindakan".<br>3. Klik "Simpan". | Status: `sedang` | Lencana status bertukar kepada warna kuning/jingga ("Sedang Diambil Tindakan"). Rekod audit mencatatkan permulaan tindakan. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ACT-02** | Validasi Catatan untuk Status Selesai | Pada modal Rekod Tindakan | 1. Pilih radio "Telah Selesai".<br>2. Biarkan catatan kosong.<br>3. Klik "Simpan". | Catatan: kosong | Sistem mengeluarkan amaran: "Catatan penyelesaian diperlukan untuk menandakan tindakan selesai". Status tidak dikemas kini. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ACT-03** | Rekod Tindakan Selesai Penuh | Pada modal Rekod Tindakan | 1. Pilih "Telah Selesai".<br>2. Taip ulasan terperinci tindakan yang telah diambil.<br>3. Klik "Simpan". | Catatan: "Siasatan lapangan telah dibuat dan kelulusan agihan telah disempurnakan." | Status tindakan bertukar kepada hijau ("Telah Diambil Tindakan"). Tarikh selesai direkodkan. Surat berpindah ke tab "Selesai". | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ACT-04** | Tandatangan Digital Maklum Balas | Buka modal Maklum Balas Surat | 1. Lengkapkan borang maklum balas rasmi.<br>2. Lakar tandatangan pada pad digital.<br>3. Klik "Hantar Maklum Balas". | Kanvas Tandatangan | Tandatangan digital berjaya disimpan bersama rekod maklum balas rasmi MAINS. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 6: PENJANAAN & CETAKAN DOKUMEN RASMI (PRINT & QR)

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-PRN-01** | Penjanaan Slip Kod QR Pengesanan (A5) | Buka butiran mana-mana surat | 1. Klik butang "Cetak Slip QR" (ikon 🖨️). | Surat sedia ada | Modal Slip Pengesanan terbuka dalam format A5 memaparkan Kod QR, No Daftar, Tarikh Terima, SLA 14 Hari, Pengirim & Perkara. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-PRN-02** | Imbasan Kod QR Slip Berfungsi | Cetak atau imbas Kod QR pada skrin | 1. Buka aplikasi kamera / pengimbas telefon pintar.<br>2. Imbas Kod QR pada slip. | Kod QR dijana | Imbasan membuka pautan sistem yang merujuk terus kepada rekod nombor pendaftaran surat tersebut. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-PRN-03** | Cetakan Lembaran Minit Tindakan (A4) | Buka butiran surat dengan beberapa minit | 1. Klik butang "Lembaran Minit". | Surat dengan sejarah minit | Modal Lembaran Minit A4 terbuka memaparkan kepala surat MAINS, jadual urutan minit lengkap dari atas ke bawah, tarikh dan catatan. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-PRN-04** | Eksport PDF Lembaran Minit | Pada modal Lembaran Minit | 1. Klik butang "Muat Turun PDF" atau "Cetak". | - | Dokumen PDF format A4 rasmi dijana dan sedia disimpan atau dicetak ke pencetak fizikal. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 7: PAUTAN SURAT BERKAITAN (LINK SURAT)

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-LNK-01** | Carian Surat untuk Dipautkan | Buka butiran surat kedua | 1. Klik butang "Pautkan Surat" (ikon 🔗).<br>2. Taip no pendaftaran atau kata kunci tajuk surat pertama. | Carian: no daftar surat pertama | Sistem menyenaraikan surat yang sepadan dengan kriteria carian tanpa menyenaraikan dirinya sendiri. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-LNK-02** | Sahkan Pautan Surat Berkaitan | Calon surat dipilih | 1. Pilih surat sasaran.<br>2. Klik butang "Sahkan Pautan Surat". | Pautan surat sasaran | Notifikasi kejayaan dipaparkan. Lencana pautan biru muncul pada kedua-dua surat memaparkan nombor rujukan surat berkait. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-LNK-03** | Navigasi Pantas Antara Surat Berkait | Surat telah dipautkan | 1. Klik pada lencana rujukan surat berkait. | - | Sistem membuka terus rekod butiran surat berkaitan yang dipautkan dalam satu klik. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 8: PEMANTAUAN SLA 14 HARI & NOTIFIKASI PERINGATAN

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-SLA-01** | Kiraan Baki Hari SLA 14 Hari | Paparan senarai surat | 1. Buka menu "Pemantauan".<br>2. Semak lajur "Had Masa & Baki Hari". | Surat didaftarkan tarikh tertentu | Sistem memaparkan tarikh sasaran (`Tarikh Terima + 14 Hari`) dan baki hari yang tepat mengikut tarikh semasa. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-SLA-02** | Pengesanan Status Lewat (>14 Hari) | Surat dengan tarikh terima >14 hari lalu dan belum selesai | 1. Cari surat yang melebihi 14 hari.<br>2. Semak lencana status. | Tarikh terima lampau | Lencana merah "Lewat > 14 Hari" dipaparkan dengan petunjuk bilangan hari lewat (contoh: Lewat 3 hari). | [ ] Lulus<br>[ ] Gagal | |
| **UAT-SLA-03** | Pengesanan Amaran Segera (Baki <= 3 Hari) | Surat dengan baki hari 1-3 hari | 1. Semak senarai pemantauan. | Baki 2 hari | Lencana amaran segera (kuning/jingga) dipaparkan untuk memberi perhatian segera. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-SLA-04** | Hantar Notifikasi Peringatan WhatsApp / Emel | Surat lewat atau hampir lewat | 1. Klik ikon loceng/notifikasi pada baris surat.<br>2. Pilih penghantaran melalui WhatsApp atau Emel. | Nombor telefon/emel pegawai bertindak | Tetingkap notifikasi dibuka dengan draf peringatan rasmi yang telah diformatkan berserta nombor pendaftaran dan tarikh tamat tempoh. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 9: PAPARAN DOKUMEN & LAMPIRAN (DOCUMENT VIEWER)

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-ATT-01** | Buka Penonton Dokumen PDF | Surat mempunyai lampiran PDF | 1. Buka Laci Butiran Surat.<br>2. Klik butang "Lihat Dokumen". | Fail PDF dimuat naik | Dokumen PDF dipaparkan terus dalam modal *Document Viewer* terbina dalam dengan fungsi zum (*zoom*) dan navigasi halaman. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ATT-02** | Buka Lampiran Imej (JPG/PNG) | Surat mempunyai lampiran imej | 1. Klik ikon lampiran imej. | Fail imej | Imej dipaparkan dengan jelas dan nisbah saiz yang betul dalam modal paparan. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 10: STRUKTUR ORGANISASI & DIREKTORI PEGAWAI

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-ORG-01** | Paparan Hierarki Organisasi Penuh | Akses menu "Struktur Organisasi" | 1. Semak carta salasilah MAINS dari Setiausaha hingga ke 11 Cawangan. | - | Seluruh carta struktur MAINS dipaparkan mengikut urutan rasmi hierarki dan tahap kedalaman (*depth*). | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ORG-02** | Semakan Butiran Pegawai & Cawangan | Pada carta organisasi | 1. Klik pada nod "Pejabat MAINS Daerah Port Dickson". | Nod: `d-pd` | Maklumat jawatan ketua, nama penyandang, nombor telefon, nombor WhatsApp, dan emel rasmi dipaparkan dengan lengkap. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ORG-03** | Pautan Terus WhatsApp / Emel | Pada kad pegawai | 1. Klik ikon WhatsApp atau Emel. | Pegawai terpilih | Pautan membuka terus aplikasi WhatsApp Web atau klien emel dengan nombor/alamat yang tepat. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 11: ANALISIS & LAPORAN PRESTASI

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-RPT-01** | Papan Pemuka Statistik Utama | Akses menu "Utama" | 1. Semak 4 kad metrik utama di bahagian atas. | Data pangkalan data | Kad memaparkan angka tepat: Jumlah Surat Masuk, Dalam Tempoh SLA, Amaran Lewat (<=3 Hari), dan Terlewat (>14 Hari). | [ ] Lulus<br>[ ] Gagal | |
| **UAT-RPT-02** | Laporan Graf & Analitis | Akses menu "Analisis" | 1. Buka halaman Analisis.<br>2. Tukar penapis julat (Bulanan / Tahunan). | - | Carta bar tren surat dan carta pai taburan kategori memaparkan graf interaktif Recharts dengan data yang sepadan. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-RPT-03** | Analisis Indeks Pematuhan SLA (%) | Halaman Analisis | 1. Semak peratusan pematuhan SLA agensi. | - | Peratusan dikira tepat: `(Surat Selesai Dalam Tempoh / Jumlah Surat Selesai) * 100%`. | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 12: PENTADBIRAN SISTEM (ADMINISTRATION)

| No. Ujian | Modul / Fungsi | Prasyarat | Langkah Pengujian | Data Ujian | Hasil Dijangka | Status (Lulus/Gagal) | Catatan / Isu |
|---|---|---|---|---|---|---|---|
| **UAT-ADM-01** | Tambah Pengguna Baharu | Log masuk sebagai `pentadbir_sistem` | 1. Buka menu "Pengurusan Pengguna".<br>2. Klik "Tambah Pengguna".<br>3. Lengkapkan borang dan simpan. | Nama: "Ahmad Albab"<br>Username: `ahmad`<br>Email: `ahmad@mains.gov.my`<br>Peranan: `ketua_unit`<br>Bahagian: `Kewangan` | Pengguna baharu berjaya disimpan dalam pangkalan data dan disenaraikan dalam direktori pengguna. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ADM-02** | Reset Kata Laluan Pengguna | Senarai pengguna dibuka | 1. Klik butang "Reset Password" pada salah seorang pengguna.<br>2. Sahkan tindakan. | Pengguna terpilih | Kata laluan berjaya di-reset ke kata laluan lalai (`password`). Pengguna boleh log masuk dengan kata laluan baharu tersebut. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ADM-03** | Pengurusan Menu Dinamik | Buka menu "Pengurusan Menu" | 1. Buang tanda semak menu "Daftar Surat" untuk peranan `pegawai_pelaksana`.<br>2. Klik simpan. | Peranan: Pegawai Pelaksana | Apabila log masuk sebagai Pegawai Pelaksana, menu "Daftar Surat" tidak lagi kelihatan pada bar sisi. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ADM-04** | Matriks Peranan & Kebenaran (RBAC) | Buka menu "Pengurusan Peranan" | 1. Semak matriks 12 kebenaran mengikut 5 peranan utama.<br>2. Ubah salah satu kebenaran dan simpan. | - | Matriks berjaya dikemas kini dan berkuat kuasa serta-merta pada sistem. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ADM-05** | Kemaskini Tetapan SLA & Profil Agensi | Buka menu "Tetapan Sistem" | 1. Ubah tempoh SLA atau nombor telefon agensi.<br>2. Klik "Simpan Tetapan". | SLA: 14 Hari<br>Agensi: MAINS | Tetapan baharu disimpan dan digunakan secara global pada kepala dokumen cetakan dan pengiraan SLA. | [ ] Lulus<br>[ ] Gagal | |
| **UAT-ADM-06** | Semakan Sambungan Pangkalan Data & Storan | Tab Pelayan / Sistem | 1. Semak status penunjuk MSSQL dan OBS Storan. | - | Penunjuk memaparkan status sambungan hijau: "MSSQL Connected" & "OBS Cloud Active". | [ ] Lulus<br>[ ] Gagal | |

---

### MODUL 13: UJIAN ALIRAN HUJUNG-KE-HUJUNG (END-TO-END WORKFLOW)

| No. Ujian | Senario Aliran Kerja Penuh | Penguji Terlibat | Langkah Aliran Kerja | Hasil Yang Diharapkan | Status (Lulus/Gagal) |
|---|---|---|---|---|---|
| **UAT-E2E-01** | **Kitaran Hayat Lengkap Surat Masuk (End-to-End Lifecycle)**:<br>Daftar -> Setiausaha -> Pengarah -> Ketua Unit -> Pelaksana Cawangan -> Cetak QR & Minit -> Selesai Tindakan | Kerani, Setiausaha, Pengarah, Pegawai Daerah | 1. **Kerani**: Daftar surat permohonan bantuan zakat baharu beserta lampiran PDF.<br>2. **Kerani**: Cetak Slip Kod QR A5 untuk fail fizikal.<br>3. **Setiausaha**: Buka Peti Minit, semak surat, minitkan kepada Pengarah Zakat dengan arahan pantas *"Sila kaji & kemukakan syor"*.<br>4. **Pengarah Zakat**: Terima surat, minitkan arahan kepada Pegawai MAINS Daerah Seremban.<br>5. **Pegawai Daerah**: Buka surat, semak baki hari SLA, rekod status *"Sedang Diambil Tindakan"*.<br>6. **Pegawai Daerah**: Selesaikan urusan siasatan, muat naik ulasan selesai, tanda *"Telah Selesai"*.<br>7. **Urusetia**: Cetak Lembaran Minit A4 yang lengkap dengan kronologi perjalanan surat.<br>8. **Pihak Pengurusan**: Semak laporan Analisis, sahkan bahawa surat tersebut direkodkan sebagai *"Selesai Dalam Tempoh SLA"*. | Seluruh rantaian proses daripada pendaftaran hingga penutupan fail berjalan lancar tanpa ralat. Status surat bertukar secara tepat pada setiap peringkat hierarki dan jejak audit terperinci direkodkan dengan sempurna. | [ ] LULUS<br>[ ] GAGAL |

---

## 5. BORANG PERAKUAN & KELULUSAN PENERIMAAN PENGGUNA (UAT SIGN-OFF)

### RUMUSAN KEPUTUSAN UJIAN
- **Jumlah Kes Ujian**: 38 Kes Ujian
- **Bilangan Kes Lulus**: ______ Kes
- **Bilangan Kes Gagal**: ______ Kes
- **Peratusan Lulus**: ______ %

### PERAKUAN WAKIL PENGUJI & JAWATANKUASA
Dengan ini diperakui bahawa Sistem Tindakan Surat Masuk (STSM) Majlis Agama Islam Negeri Sembilan telah diuji secara komprehensif mengikut kes-kes ujian yang ditetapkan dalam dokumen ini. 

Sistem ini didapati:
- [ ] **DILULUSKAN TANPA SYARAT** (Sedia untuk pelaksanaan *Go-Live*).
- [ ] **DILULUSKAN BERSYARAT** (Tertakluk kepada penyelesaian isu-isu kecil yang disenaraikan dalam catatan).
- [ ] **TIDAK DILULUSKAN** (Perlu penambahbaikan semula dan pengujian pusingan kedua).

#### TANDATANGAN PENGESAHAN:

| Disemak & Disahkan Oleh: | Diperaku & Diluluskan Oleh: |
|---|---|
| **Nama**: ____________________________________ | **Nama**: ____________________________________ |
| **Jawatan**: Ketua Penolong Pengarah, BTM MAINS | **Jawatan**: Setiausaha / Timbalan Setiausaha MAINS |
| **Tarikh**: _________________________________ | **Tarikh**: _________________________________ |
| **Tandatangan**: | **Tandatangan**: |
| | |
| ____________________________________________ | ____________________________________________ |

---
*Dokumen Tamat. Hak Cipta Terpelihara Majlis Agama Islam Negeri Sembilan (MAINS).*
