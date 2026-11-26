const sql = require('mssql');
const bcrypt = require('bcryptjs');
const fs = require('fs');

let env = {};
try {
  const content = fs.readFileSync('.env', 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2 && !parts[0].startsWith('#')) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
} catch(e) {}

const config = {
  user: env.DB_USER || 'rdsuser',
  password: env.DB_PASSWORD || 'P@$$w0rd2024',
  server: env.DB_SERVER || '202.165.22.1',
  database: env.DB_DATABASE || 'stsm_mains',
  port: parseInt(env.DB_PORT || '1433'),
  options: { encrypt: false, trustServerCertificate: true }
};

const RAW_KERANI = `
1139	MA1139	MA00001139	Syazwani Bt Ismail	890404595272	14	Jabatan Perbendaharaan	1076	Bahagian Perakaunan	2223	Unit Akaun & Aset	2223	Unit Akaun & Aset	10	Pembantu Tadbir	9	Gred 1	syazwani@mains.gov.my	0173665430	MA1360	Mohammad Tarmidi Bin Amran	MA1018	Noor Aishah Binti Ghazalli	1	67	68	70
1172	MA1172	MA00001172	Roziana Binti Kamaruddin	820425145146	16	Jabatan Wakaf & Mal	1066	Bahagian Wakaf	2169	Unit Agihan Wakaf	2169	Unit Agihan Wakaf	10	Pembantu Tadbir	9	Gred 1	roziana@mains.gov.my	013-6048251	MA1023	Srirahayu Binti Sarifin	MA1222	Ahmad Naim Bin Azlan	1	95	96	99
1325	MA1325	MA00001325	Muhammad Haziq Bin Hashim	991214145775	20	Tiada	1083	Daerah Tampin	2190	Unit Pengurusan Daerah Tampin	2190	Unit Pengurusan Daerah Tampin	10	Pembantu Tadbir	9	Gred 1	haziqhashim@mains.gov.my	010-4252630	MA1093	Nur Hidayah Binti Mazlan	MA1218	Junaidi Bin Yahaya	1	114	115	118
1130	MA1130	MA00001130	Nurul Ikhwani Syafiqah Binti Junaiday	971112045302	20	Tiada	1084	Daerah Kuala Pilah	2193	Unit Pengurusan Daerah Kuala Pilah	2193	Unit Pengurusan Daerah Kuala Pilah	10	Pembantu Tadbir	9	Gred 1	nurul.ikhwani@mains.gov.my	0172256466	MA1009	Aida Yusrina Binti Mat Yusof	MA1224	Syed Mazlan Bin Syed Azizan	1	147	151	1153
1271	MA1271	MA00001271	Nurliyana Bte Rosnan	941130055144	15	Jabatan Pentadbiran	1069	Bahagian Sumber Manusia & Khidmat Pengurusan	2173	Unit Pentadbiran	2173	Unit Pentadbiran	10	Pembantu Tadbir	9	Gred 1	nurliyana_rosnan@mains.gov.my	01110686562	MA1082	Yusri Bin Khamis	MA1020	Wan Aminuddin Bin Wan Abdullah	1	329	5562	5376
1312	MA1312	MA00001312	Nur Farah Arina Binti Rostam	990716055038	17	Pejabat Timbalan Setiausaha (Operasi)	1093	Bahagian Majikan & Ejen	2219	Unit Sektor Awam	2219	Unit Sektor Awam	10	Pembantu Tadbir	9	Gred 1	arina@mains.gov.my	01110924778	MA1046	Jumiatul Adawiyah Binti Ismail	MA1068	Zana Ruslinda Binti Ujang	1	333	366	5504
1315	MA1315	MA00001315	Zatil Syakila Binti Muhammad Zaid	940720055166	15	Jabatan Pentadbiran	1069	Bahagian Sumber Manusia & Khidmat Pengurusan	2173	Unit Pentadbiran	2173	Unit Pentadbiran	10	Pembantu Tadbir	9	Gred 1	syakila@mains.gov.my	0136641294	MA1082	Yusri Bin Khamis	MA1020	Wan Aminuddin Bin Wan Abdullah	1	342	372	5510
1314	MA1314	MA00001314	Nurul Naabihah Binti Zakaria	961026055062	17	Pejabat Timbalan Setiausaha (Operasi)	1093	Bahagian Majikan & Ejen	2220	Unit Sektor Swasta	2220	Unit Sektor Swasta	10	Pembantu Tadbir	9	Gred 1	naabihah@mains.gov.my	0136236534	MA1080	Mohd Iqbal Bin Amad Salbani 	MA1068	Zana Ruslinda Binti Ujang	1	344	370	5509
1245	MA1245	MA00001245	Nurul Dania Binti Mohamed Eusop	940314085706	20	Tiada	1087	Cawangan Seremban 2	2205	Unit Pengurusan Cawangan Seremban 2	2205	Unit Pengurusan Cawangan Seremban 2	10	Pembantu Tadbir	9	Gred 1	dania@mains.gov.my	011-60671153	MA1081	Nordiyana Binti Othman	MA1217	Zaharudin Bin Mat Derus	1	345	382	5367
1249	MA1249	MA00001249	Siti Nor Asrina Binti Md Astalia	870216115288	20	Tiada	1089	Cawangan Gemas	2211	Unit Pengurusan Cawangan Gemas	2211	Unit Pengurusan Cawangan Gemas	10	Pembantu Tadbir	9	Gred 1	asrina@mains.gov.my	0179539503	MA1186	Yusof Bin Abdul Rahim	MA1177	Che Rozita Binti Che Rahman	1	347	383	5359
1246	MA1246	MA00001246	Muhammad Shahrul Shazly Bin Paid	970308105165	18	Jabatan Zakat	1075	Bahagian Agihan	2166	Unit Sosioekonomi 	2166	Unit Sosioekonomi 	10	Pembantu Tadbir	9	Gred 1	shazly@mains.gov.my	0136616759	MA1044	Zaharim Bin Kusinni @ Zuriat	MA1078	Mohd Hasni Bin Zulkifle	1	348	340	4357
1251	MA1251	MA00001251	Nur Farah Suhaida Binti Khalit 	990710055352	16	Jabatan Wakaf & Mal	1078	Bahagian Mal	2172	Unit Mal	2172	Unit Mal	10	Pembantu Tadbir	9	Gred 1	farah_suhaida@mains.gov.my	0196259210	MA1138	Muhammad Hamizan Bin Mahat	MA1222	Ahmad Naim Bin Azlan	1	349	361	5381
1309	MA1309	MA00001309	Mohd Haziq Ilham Bin Masri	980309055605	14	Jabatan Perbendaharaan	1076	Bahagian Perakaunan	2223	Unit Akaun & Aset	2223	Unit Akaun & Aset	10	Pembantu Tadbir	9	Gred 1	ilham@mains.gov.my	011-21000164	MA1360	Mohammad Tarmidi Bin Amran	MA1018	Noor Aishah Binti Ghazalli	1	351	384	5502
1319	MA1319	MA00001319	Nurazah Binti Mohd Dahalan	azzadahalan@gmail.com	14	Jabatan Perbendaharaan	1076	Bahagian Perakaunan	2150	Unit Hasil & Pelaburan 	2150	Unit Hasil & Pelaburan 	10	Pembantu Tadbir	9	Gred 1	nurazah@mains.gov.my	0122745986	MA1017	Fatin Nabilah Binti Suboh	MA1018	Noor Aishah Binti Ghazalli	1	356	349	5497
1299	MA1299	MA00001299	Muhammad Shafiq Nasrullah Bin Zainol	971116595037	17	Pejabat Timbalan Setiausaha (Operasi)	1070	Bahagian Dakwah & Pemasaran	2156	Unit Dakwah Zakat & Wakaf	2156	Unit Dakwah Zakat & Wakaf	10	Pembantu Tadbir	9	Gred 1	shafiqnasrullah@mains.gov.my	0189604197	MA1112	Abdul Hadi Bin Abd Aziz	MA1148	Bukhari Bin Safian 	1	357	388	5386
1311	MA1311	MA00001311	Norhizatulfitriah Binti Mohd Zin	000206050346	19	Pejabat Timbalan Setiausaha (Pengurusan)	1034	Tiada	2218	Tiada	19	Pejabat Timbalan Setiausaha (Pengurusan)	10	Pembantu Tadbir	9	Gred 1	hizatul@mains.gov.my	013-2967074	MA1005	Mohamad Idris Bin Ramli	MA1005	Mohamad Idris Bin Ramli	1	359	369	5508
1244	MA1244	MA00001244	Balqis Binti Abdul Talib	970421565032	17	Pejabat Timbalan Setiausaha (Operasi)	1093	Bahagian Majikan & Ejen	2221	Unit Ejen Zakat & Wakaf	2221	Unit Ejen Zakat & Wakaf	10	Pembantu Tadbir	9	Gred 1	balqis@mains.gov.my	011-10503104	MA1074	Mohd Azwan Bin Zulkipli	MA1068	Zana Ruslinda Binti Ujang	1	364	392	5366
1268	MA1268	MA00001268	Suria Binti Ismail	930923055394	20	Tiada	1081	Daerah Rembau	2187	Unit Pengurusan Daerah Rembau	2187	Unit Pengurusan Daerah Rembau	10	Pembantu Tadbir	9	Gred 1	suria@mains.gov.my	017-3803924	MA1090	Shahirah Binti Ab Rahman	MA1024	Azura Binti Muhamad Alias	1	373	363	5362
1252	MA1252	MA00001252	Wahidah Binti Mohd Ganni	930508055178	14	Jabatan Perbendaharaan	1077	Bahagian Kewangan	2225	Unit Perolehan & Pinjaman	2225	Unit Perolehan & Pinjaman	10	Pembantu Tadbir	9	Gred 1	wahidah@mains.gov.my	017-6427296	MA1058	Nurhasna Binti Husaeni	MA1007	Nor Azlin Bt Arop@othman	1	382	416	5377
1260	MA1260	MA00001260	Nur Nadhirah Bt Mohamad Rafi	971022145326	16	Jabatan Wakaf & Mal	1066	Bahagian Wakaf	2168	Unit Aset Wakaf	2168	Unit Aset Wakaf	10	Pembantu Tadbir	9	Gred 1	nadhirah@mains.gov.my	0196730939	MA1050	Mohamad Zhafri Bin Ibrahim	MA1015	Alimazri Bin Mauludin	1	399	1455	5371
1261	MA1261	MA00001261	Intan Nurqamarina Binti Zainorin	971130055256	20	Tiada	1088	Cawangan Senawang	2208	Unit Pengurusan Cawangan Senawang	2208	Unit Pengurusan Cawangan Senawang	10	Pembantu Tadbir	9	Gred 1	qamarina@mains.gov.my		MA1100	Maizatul Akma Binti Mohamad	MA1164	Norazlina Binti Maarof	1	3413	5564	5368
1347	MA1347	MA00001347	Ahmad Shahidan Bin Suhaizan 	990618055149	15	Jabatan Pentadbiran	1069	Bahagian Sumber Manusia & Khidmat Pengurusan	2173	Unit Pentadbiran	2173	Unit Pentadbiran	10	Pembantu Tadbir	9	Gred 1	shahidan@mains.gov.my	017-887 2349	MA1082	Yusri Bin Khamis	MA1020	Wan Aminuddin Bin Wan Abdullah	1	7423	9580	14651
1349	MA1349	MA00001349	Qamarul Haqeem Bin Mohd	971216107221	15	Jabatan Pentadbiran	1072	Bahagian Kaunseling & Pembangunan Sahsiah	2216	Kompleks Darul Asnaf Sri Sendayan	2216	Kompleks Darul Asnaf Sri Sendayan	10	Pembantu Tadbir	9	Gred 1	qamarul@mains.gov.my	0122641029	MA1276	Mohd Syafiq Bin Abd Rashid	MA1069	Fadilah Binti Mohamed	1	8424	9579	14650
1308	MA1308	MA00001308	Mohd Arif Bin Mohd Asri	971010265005	15	Jabatan Pentadbiran	1072	Bahagian Kaunseling & Pembangunan Sahsiah	2217	Kompleks Darul Asnaf Seri Tanjung	2217	Kompleks Darul Asnaf Seri Tanjung	10	Pembantu Tadbir	9	Gred 1	arif@mains.gov.my	011-28528631	MA1105	Muhammad Hazwan Bin Amran	MA1069	Fadilah Binti Mohamed	1	8460	365	5501
1344	MA1344	MA00001344	Mohammad Muhaimin Bin Razali	930912016007	14	Jabatan Perbendaharaan	1077	Bahagian Kewangan	2224	Unit Belanjawan & Perbelanjaan	2224	Unit Belanjawan & Perbelanjaan	10	Pembantu Tadbir	9	Gred 1	muhaimin@mains.gov.my	01126739788	MA1058	Nurhasna Binti Husaeni	MA1007	Nor Azlin Bt Arop@othman	1	8462	10580	14652
1253	MA1253	MA00001253	Nursyafiqah Binti Azly	990802055368	20	Tiada	1086	Daerah Jelebu	2196	Unit Pengurusan Daerah Jelebu	2196	Unit Pengurusan Daerah Jelebu	10	Pembantu Tadbir	9	Gred 1	nursyafiqah@mains.gov.my	012-312 2704	MA1350	Mohamad Izrin Shah Bin Azizan	MA1219	Hazmi Bin Abd Kadir	1	8465	5565	5382
1365	MA1365	MA00001365	Zulkifli Bin Amran	010504050087	17	Pejabat Timbalan Setiausaha (Operasi)	1070	Bahagian Dakwah & Pemasaran	2157	Unit Kaunter Bergerak	2157	Unit Kaunter Bergerak	10	Pembantu Tadbir	9	Gred 1	zulkifli_amran@mains.gov.my	01120941574	MA1204	Mohd Shahrizad Bin Abu Kasim	MA1148	Bukhari Bin Safian 	1	8497	13707	18734
1369	MA1369	MA00001369	Muhammad Hariz Bin Mohd Fadzil	011104050277	20	Tiada	1082	Daerah Jempol	2199	Unit Pengurusan Daerah Jempol	2199	Unit Pengurusan Daerah Jempol	10	Pembantu Tadbir	9	Gred 1	muhammad_hariz@mains.gov.my	0134441920	MA1220	Muhamad Izwan Bin Shuib	MA1221	Muttaqin Bin Mohd Fakiri	1	8739	13720	18781
1372	MA1372	MA00001372	Aiman Nurhakim Bin Anuar	981121015913	16	Jabatan Wakaf & Mal	1066	Bahagian Wakaf	2168	Unit Aset Wakaf	2168	Unit Aset Wakaf	10	Pembantu Tadbir	9	Gred 1	aiman_nurhakim@mains.gov.my	0193500754	MA1050	Mohamad Zhafri Bin Ibrahim	MA1222	Ahmad Naim Bin Azlan	1	8742	13726	18788
1373	MA1373	MA00001373	Muhammad Danial Hafuza Bin Zainal Abiddin	970407016571	15	Jabatan Pentadbiran	1069	Bahagian Sumber Manusia & Khidmat Pengurusan	2173	Unit Pentadbiran	2173	Unit Pentadbiran	10	Pembantu Tadbir	9	Gred 1	danial_hafuza@mains.gov.my	0192788766	MA1082	Yusri Bin Khamis	MA1020	Wan Aminuddin Bin Wan Abdullah	1	8745	13737	18795
3007	MA3007	MA00003007	Mar Danial Nabil Bin Omar	030724050327	5	Pejabat Setiausaha MAINS	1091	Tiada (SU)	2155	Unit Integriti	2155	Unit Integriti	10	Pembantu Tadbir	9	Gred 1	mar_danial@mains.gov.my	011-14416176	MA1076	Mohd Azreen Bin Abu Bakar	MA1003	Zainal Bin Said	1	8771	13764	18903
3003	MA3003	MA00003003	Adlan Aiman Bin Azmi	980905055935	5	Pejabat Setiausaha MAINS	1091	Tiada (SU)	2153	Unit Undang-Undang	2153	Unit Undang-Undang	10	Pembantu Tadbir	9	Gred 1	adlan_aiman@mains.gov.my	0192411255	MA1376	Romy Norfidzy Bin Roslan	MA1003	Zainal Bin Said	1	8772	13765	18899
`;

function determineBahagian(rawJabatan, rawBahagian, rawUnit) {
  if (rawUnit && rawUnit !== 'Tiada') return rawUnit.trim();
  if (rawBahagian && rawBahagian !== 'Tiada') return rawBahagian.trim();
  if (rawJabatan && rawJabatan !== 'Tiada') return rawJabatan.trim();
  return 'Pejabat MAINS';
}

async function insertKerani() {
  console.log('Connecting to MSSQL Database...');
  const pool = await sql.connect(config);
  const defaultPasswordHash = await bcrypt.hash('password', 10);

  const lines = RAW_KERANI.trim().split('\n').filter(l => l.trim().length > 0);
  console.log(`Processing ${lines.length} kerani records...`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const line of lines) {
    const cols = line.split('\t').map(c => c.trim());
    if (cols.length < 18) continue;

    const staffId = cols[1];
    const fullName = cols[3];
    const rawJabatan = cols[6];
    const rawBahagian = cols[8];
    const rawUnit = cols[10];
    const email = cols[17].toLowerCase();
    const phone = cols[18];

    let username = email.split('@')[0].trim().toLowerCase();
    if (!username) {
      username = staffId.toLowerCase();
    }

    const role = 'kerani';
    const bahagian = determineBahagian(rawJabatan, rawBahagian, rawUnit);

    const existing = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .query('SELECT id, username, email FROM users WHERE username = @username OR email = @email');

    if (existing.recordset.length > 0) {
      const existingUser = existing.recordset[0];
      await pool.request()
        .input('id', sql.Int, existingUser.id)
        .input('full_name', sql.NVarChar, fullName)
        .input('email', sql.NVarChar, email)
        .input('role', sql.NVarChar, role)
        .input('bahagian', sql.NVarChar, bahagian)
        .query(`
          UPDATE users 
          SET full_name = @full_name,
              email = @email,
              role = @role,
              bahagian = @bahagian,
              is_active = 1,
              updated_at = GETDATE()
          WHERE id = @id
        `);
      updatedCount++;
      console.log(`[KEMASKINI] ${staffId} | ${username} | ${fullName} (${role}) -> ${bahagian}`);
    } else {
      await pool.request()
        .input('username', sql.NVarChar, username)
        .input('email', sql.NVarChar, email)
        .input('password_hash', sql.NVarChar, defaultPasswordHash)
        .input('full_name', sql.NVarChar, fullName)
        .input('role', sql.NVarChar, role)
        .input('bahagian', sql.NVarChar, bahagian)
        .query(`
          INSERT INTO users (username, email, password_hash, full_name, role, bahagian, is_active, created_at, updated_at)
          VALUES (@username, @email, @password_hash, @full_name, @role, @bahagian, 1, GETDATE(), GETDATE())
        `);
      createdCount++;
      console.log(`[DAFTAR BARU] ${staffId} | ${username} | ${fullName} (${role}) -> ${bahagian}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Selesai memproses kerani!`);
  console.log(`Daftar Baru : ${createdCount}`);
  console.log(`Dikemaskini : ${updatedCount}`);
  console.log(`Jumlah Rekod: ${lines.length}`);
  console.log(`========================================\n`);

  const summary = await pool.request().query(`
    SELECT role, COUNT(*) as count 
    FROM users 
    WHERE is_active = 1 
    GROUP BY role
  `);
  console.log('Ringkasan pengguna aktif mengikut peranan:');
  summary.recordset.forEach(r => {
    console.log(` - ${r.role}: ${r.count} orang`);
  });

  const total = await pool.request().query('SELECT COUNT(*) as total FROM users WHERE is_active = 1');
  console.log(`Jumlah keseluruhan pengguna aktif: ${total.recordset[0].total}`);

  process.exit(0);
}

insertKerani().catch(err => {
  console.error('Ralat memasukkan data kerani:', err);
  process.exit(1);
});
