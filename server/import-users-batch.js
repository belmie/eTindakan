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

const RAW_DATA = `
1010	MA1010	MA00001010	Mohd Zailani Bin Hj. Yunus	781221035579	15	Jabatan Pentadbiran	10	Bahagian Teknologi Maklumat	1016	Unit Pembangunan ICT	1016	Unit Pembangunan ICT	53	Ketua Unit	4	Gred 10	zailani@mains.gov.my	0192283124	MA1008	Norpisah Binti Zakaria	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	1	1	1	1
1008	MA1008	MA00001008	Norpisah Binti Zakaria	710316065502	15	Jabatan Pentadbiran	10	Bahagian Teknologi Maklumat	2218	Tiada	10	Bahagian Teknologi Maklumat	4	Ketua Penolong Pengarah	3	Gred 12	norpisah@mains.gov.my	0192283171	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	MA1005	Mohamad Idris Bin Ramli	1	4	4	4
1011	MA1011	MA00001011	Mahadzir Imri Bin Ab Malek	810128055241	15	Jabatan Pentadbiran	10	Bahagian Teknologi Maklumat	1019	Unit Pengoperasian ICT	1019	Unit Pengoperasian ICT	53	Ketua Unit	4	Gred 10	imri@mains.gov.my	0192282994	MA1008	Norpisah Binti Zakaria	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	1	8	9	10
1018	MA1018	MA00001018	Noor Aishah Binti Ghazalli	890601055558	14	Jabatan Perbendaharaan	1076	Bahagian Perakaunan	2218	Tiada	1076	Bahagian Perakaunan	4	Ketua Penolong Pengarah	4	Gred 10	nooraishah@mains.gov.my	013-3424819	MA1002	Azzerol Effendi Bin Abdul Kadir	MA1005	Mohamad Idris Bin Ramli	1	9	10	11
1051	MA1051	MA00001051	Syafiah Binti Abdul Jalil	930703016756	16	Jabatan Wakaf & Mal	1078	Bahagian Mal	2170	Unit Pusaka 	2170	Unit Pusaka 	53	Ketua Unit	5	Gred 9	syafiah@mains.gov.my	0176008223	MA1222	Ahmad Naim Bin Azlan	MA1006	Norazman Bin Amat	1	14	15	16
1017	MA1017	MA00001017	Fatin Nabilah Binti Suboh	900905055254	14	Jabatan Perbendaharaan	1076	Bahagian Perakaunan	2150	Unit Hasil & Pelaburan 	2150	Unit Hasil & Pelaburan 	53	Ketua Unit	5	Gred 9	fatinnabilah@mains.gov.my	0102935628	MA1018	Noor Aishah Binti Ghazalli	MA1002	Azzerol Effendi Bin Abdul Kadir	1	15	16	17
1079	MA1079	MA00001079	Abdul Muiz Bin Shafie	940715055305	20	Tiada	1087	Cawangan Seremban 2	2203	Unit Operasi (1) Cawangan Seremban 2	2203	Unit Operasi (1) Cawangan Seremban 2	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	abdulmuiz@mains.gov.my	0197277012	MA1217	Zaharudin Bin Mat Derus	MA1005	Mohamad Idris Bin Ramli	1	17	18	19
1038	MA1038	MA00001038	Muhibuddin Bin Abu Bakar	880411055427	19	Pejabat Timbalan Setiausaha (Pengurusan)	1071	Bahagian Perancangan & Penyelidikan	2218	Tiada	1071	Bahagian Perancangan & Penyelidikan	4	Ketua Penolong Pengarah	4	Gred 10	muhibuddin@mains.gov.my	0137998444	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	18	19	20
1039	MA1039	MA00001039	Muhammad Abu Dhirar Bin Burhanuddin	890930066143	18	Jabatan Zakat	1073	Bahagian Kutipan	2160	Unit Zakat Perniagaan	2160	Unit Zakat Perniagaan	53	Ketua Unit	5	Gred 9	abudhirar@mains.gov.my	0178763392	MA1069	Fadilah Binti Mohamed	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	1	19	20	21
1002	MA1002	MA00001002	Azzerol Effendi Bin Abdul Kadir	770628086219	14	Jabatan Perbendaharaan	1034	Tiada	2218	Tiada	14	Jabatan Perbendaharaan	3	Pengarah	2	Gred 13	azzerol@mains.gov.my	0176711170	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	20	21	22
1058	MA1058	MA00001058	Nurhasna Binti Husaeni	921007055482	14	Jabatan Perbendaharaan	1077	Bahagian Kewangan	2225	Unit Perolehan & Pinjaman	2225	Unit Perolehan & Pinjaman	53	Ketua Unit	5	Gred 9	hasna@mains.gov.my	017-3601727	MA1007	Nor Azlin Bt Arop@othman	MA1002	Azzerol Effendi Bin Abdul Kadir	1	22	23	24
1083	MA1083	MA00001083	Mohd Haffis Bin Abdul Nasir	851123055411	20	Tiada	1080	Daerah Port Dickson	2182	Unit Operasi (1) Daerah Port Dickson	2182	Unit Operasi (1) Daerah Port Dickson	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	haffis@mains.gov.my	0132660649	MA1070	Nur Azizah Binti Abdul Aziz	MA1005	Mohamad Idris Bin Ramli	1	24	25	26
1106	MA1106	MA00001106	Khairul Aifaa Bin Md Salleh	890103235193	20	Tiada	1085	Cawangan Nilai	2200	Unit Operasi (1) Cawangan Nilai	2200	Unit Operasi (1) Cawangan Nilai	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	khairul_aifaa@mains.gov.my	0176390899	MA1077	Che Som Binti Omar	MA1005	Mohamad Idris Bin Ramli	1	28	29	30
1164	MA1164	MA00001164	Norazlina Binti Maarof	780627045094	20	Tiada	1088	Cawangan Senawang	2218	Tiada	1088	Cawangan Senawang	34	Pegawai Mains Cawangan	4	Gred 10	norazlina@mains.gov.my	0123647484	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	43	44	45
1003	MA1003	MA00001003	Zainal Bin Said	741002055573	5	Pejabat Setiausaha MAINS	1034	Tiada	2218	Tiada	5	Pejabat Setiausaha MAINS	2	Setiausaha	1016	KHAS C	zainal@mains.gov.my	0129210667	MA4001	Tan Sri Dato Seri Mohd Shahrom Bin Dato Hj Nordin	MA4001	Tan Sri Dato Seri Mohd Shahrom Bin Dato Hj Nordin	1	44	45	46
1090	MA1090	MA00001090	Shahirah Binti Ab Rahman	910403055026	20	Tiada	1081	Daerah Rembau	2187	Unit Pengurusan Daerah Rembau	2187	Unit Pengurusan Daerah Rembau	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	shahirah@mains.gov.my	019-6804578	MA1024	Azura Binti Muhamad Alias	MA1005	Mohamad Idris Bin Ramli	1	55	56	57
1007	MA1007	MA00001007	Nor Azlin Bt Arop@othman	740612055314	14	Jabatan Perbendaharaan	1077	Bahagian Kewangan	2218	Tiada	1077	Bahagian Kewangan	4	Ketua Penolong Pengarah	3	Gred 12	azlin@mains.gov.my	019 2282895	MA1002	Azzerol Effendi Bin Abdul Kadir	MA1005	Mohamad Idris Bin Ramli	1	56	57	58
1015	MA1015	MA00001015	Alimazri Bin Mauludin	860110595253	18	Jabatan Zakat	1073	Bahagian Kutipan	2218	Tiada	1073	Bahagian Kutipan	4	Ketua Penolong Pengarah	4	Gred 10	alimazri@mains.gov.my	0123148041	MA1022	Mahadi Bin Ali	MA1005	Mohamad Idris Bin Ramli	1	57	58	59
1033	MA1033	MA00001033	Azilawati Bt Abdullah	771213035932	15	Jabatan Pentadbiran	1069	Bahagian Sumber Manusia & Khidmat Pengurusan	2174	Unit Sumber Manusia & Latihan	2174	Unit Sumber Manusia & Latihan	53	Ketua Unit	1020	Gred 7	azilawati@mains.gov.my	0136257708	MA1020	Wan Aminuddin Bin Wan Abdullah	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	1	59	60	62
1044	MA1044	MA00001044	Zaharim Bin Kusinni @ Zuriat	780201105723	18	Jabatan Zakat	1075	Bahagian Agihan	2166	Unit Sosioekonomi 	2166	Unit Sosioekonomi 	53	Ketua Unit	5	Gred 9	zaharim@mains.gov.my	0197195723	MA1078	Mohd Hasni Bin Zulkifle	MA1022	Mahadi Bin Ali	1	61	62	64
1096	MA1096	MA00001096	Siti Nur Liyana Binti Zolkifli	941219145990	19	Pejabat Timbalan Setiausaha (Pengurusan)	1071	Bahagian Perancangan & Penyelidikan	2178	Unit Kajian Analitik	2178	Unit Kajian Analitik	53	Ketua Unit	5	Gred 9	nurliyana@mains.gov.my	013-3106433	MA1038	Muhibuddin Bin Abu Bakar	MA1005	Mohamad Idris Bin Ramli	1	62	63	65
1103	MA1103	MA00001103	Noor Fathihah Binti Osman	881204065598	18	Jabatan Zakat	1075	Bahagian Agihan	2165	Unit Kebajikan & Kesihatan	2165	Unit Kebajikan & Kesihatan	53	Ketua Unit	5	Gred 9	fathihah@mains.gov.my	0136303995	MA1078	Mohd Hasni Bin Zulkifle	MA1022	Mahadi Bin Ali	1	63	64	66
1111	MA1111	MA00001111	Siti Syazwani Binti Shamshul Kamar	880405055252	16	Jabatan Wakaf & Mal	1078	Bahagian Mal	2171	Unit Hibah & Wasiat	2171	Unit Hibah & Wasiat	53	Ketua Unit	5	Gred 9	sitisyazwani@mains.gov.my	0136698869	MA1222	Ahmad Naim Bin Azlan	MA1006	Norazman Bin Amat	1	65	66	68
1046	MA1046	MA00001046	Jumiatul Adawiyah Binti Ismail	881230595090	17	Pejabat Timbalan Setiausaha (Operasi)	1093	Bahagian Majikan & Ejen	2219	Unit Sektor Awam	2219	Unit Sektor Awam	53	Ketua Unit	5	Gred 9	jumiatul@mains.gov.my	013-2898970	MA1068	Zana Ruslinda Binti Ujang	MA1005	Mohamad Idris Bin Ramli	1	74	75	77
1138	MA1138	MA00001138	Muhammad Hamizan Bin Mahat	921017015695	16	Jabatan Wakaf & Mal	1078	Bahagian Mal	2172	Unit Mal	2172	Unit Mal	53	Ketua Unit	6	Gred 6	hamizan@mains.gov.my	011-39865854	MA1222	Ahmad Naim Bin Azlan	MA1006	Norazman Bin Amat	1	77	78	80
1094	MA1094	MA00001094	Siti Hajar Binti Mohamad Daud	901017055402	20	Tiada	1085	Cawangan Nilai	2202	Unit Pengurusan Cawangan Nilai	2202	Unit Pengurusan Cawangan Nilai	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	hajar@mains.gov.my	0136127092	MA1077	Che Som Binti Omar	MA1005	Mohamad Idris Bin Ramli	1	78	79	81
1100	MA1100	MA00001100	Maizatul Akma Binti Mohamad	830626055322	20	Tiada	1088	Cawangan Senawang	2208	Unit Pengurusan Cawangan Senawang	2208	Unit Pengurusan Cawangan Senawang	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	maizatulakma@mains.gov.my	010-4043308	MA1164	Norazlina Binti Maarof	MA1005	Mohamad Idris Bin Ramli	1	79	80	82
1074	MA1074	MA00001074	Mohd Azwan Bin Zulkipli	790210055069	17	Pejabat Timbalan Setiausaha (Operasi)	1093	Bahagian Majikan & Ejen	2221	Unit Ejen Zakat & Wakaf	2221	Unit Ejen Zakat & Wakaf	53	Ketua Unit	6	Gred 6	azwan@mains.gov.my	0192282904	MA1068	Zana Ruslinda Binti Ujang	MA1005	Mohamad Idris Bin Ramli	1	81	82	84
1104	MA1104	MA00001104	Nur Izzati Binti Adnan	890926125614	20	Tiada	1086	Daerah Jelebu	2195	Unit Operasi (2) Daerah Jelebu	2195	Unit Operasi (2) Daerah Jelebu	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	nurizzati@mains.gov.my	011-11236549	MA1219	Hazmi Bin Abd Kadir	MA1005	Mohamad Idris Bin Ramli	1	83	84	86
1071	MA1071	MA00001071	Siti Hajar Binti Hasim	841008055054	20	Tiada	1080	Daerah Port Dickson	2184	Unit Pengurusan Daerah Port Dickson	2184	Unit Pengurusan Daerah Port Dickson	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	sitihajar@mains.gov.my	012-6953575	MA1070	Nur Azizah Binti Abdul Aziz	MA1005	Mohamad Idris Bin Ramli	1	84	85	87
1093	MA1093	MA00001093	Nur Hidayah Binti Mazlan	890803055054	20	Tiada	1083	Daerah Tampin	2190	Unit Pengurusan Daerah Tampin	2190	Unit Pengurusan Daerah Tampin	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	hidayahmazlan@mains.gov.my	010-269 6496	MA1218	Junaidi Bin Yahaya	MA1005	Mohamad Idris Bin Ramli	1	86	87	89
1177	MA1177	MA00001177	Che Rozita Binti Che Rahman	760127035270	20	Tiada	1089	Cawangan Gemas	2218	Tiada	1089	Cawangan Gemas	34	Pegawai Mains Cawangan	4	Gred 10	cherozita@mains.gov.my	0138114699	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	87	88	90
1204	MA1204	MA00001204	Mohd Shahrizad Bin Abu Kasim	800320055111	17	Pejabat Timbalan Setiausaha (Operasi)	1070	Bahagian Dakwah & Pemasaran	2157	Unit Kaunter Bergerak	2157	Unit Kaunter Bergerak	53	Ketua Unit	6	Gred 6	shahrizad@mains.gov.my	011-10648003	MA1148	Bukhari Bin Safian 	MA1005	Mohamad Idris Bin Ramli	1	101	102	105
1057	MA1057	MA00001057	Syed Abdul Basit Bin Syed Mohamad	900902055435	20	Tiada	1081	Daerah Rembau	2185	Unit Operasi (1) Daerah Rembau	2185	Unit Operasi (1) Daerah Rembau	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	syedbasit@mains.gov.my	0138670530	MA1024	Azura Binti Muhamad Alias	MA1005	Mohamad Idris Bin Ramli	1	102	103	106
1069	MA1069	MA00001069	Fadilah Binti Mohamed	770818055464	15	Jabatan Pentadbiran	1072	Bahagian Kaunseling & Pembangunan Sahsiah	2218	Tiada	1072	Bahagian Kaunseling & Pembangunan Sahsiah	4	Ketua Penolong Pengarah	4	Gred 10	fadilah@mains.gov.my	0192486747	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	MA1005	Mohamad Idris Bin Ramli	1	103	104	107
1076	MA1076	MA00001076	Mohd Azreen Bin Abu Bakar	911118016233	5	Pejabat Setiausaha MAINS	1091	Tiada (SU)	2155	Unit Integriti	2155	Unit Integriti	53	Ketua Unit	5	Gred 9	azreen@mains.gov.my	019-7850757	MA1003	Zainal Bin Said	MA1003	Zainal Bin Said	1	104	105	108
1048	MA1048	MA00001048	Norhafizah Binti Daud	841231055356	18	Jabatan Zakat	1075	Bahagian Agihan	2164	Unit Pendidikan	2164	Unit Pendidikan	53	Ketua Unit	5	Gred 9	norhafizahdaud@mains.gov.my	0133172467	MA1078	Mohd Hasni Bin Zulkifle	MA1022	Mahadi Bin Ali	1	105	106	109
1186	MA1186	MA00001186	Yusof Bin Abdul Rahim	840522055175	20	Tiada	1089	Cawangan Gemas	2211	Unit Pengurusan Cawangan Gemas	2211	Unit Pengurusan Cawangan Gemas	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	yusof@mains.gov.my	013-2366746	MA1177	Che Rozita Binti Che Rahman	MA1005	Mohamad Idris Bin Ramli	1	106	107	110
1099	MA1099	MA00001099	Siti Hawa Binti Majid	831211055018	20	Tiada	1087	Cawangan Seremban 2	2204	Unit Operasi (2) Cawangan Seremban 2	2204	Unit Operasi (2) Cawangan Seremban 2	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	sitihawa@mains.gov.my	0196985310	MA1217	Zaharudin Bin Mat Derus	MA1005	Mohamad Idris Bin Ramli	1	115	116	119
1021	MA1021	MA00001021	Zamri Bin Ahmad Suhaimi	750515065763	20	Tiada	1079	Daerah Seremban	2218	Tiada	1079	Daerah Seremban	33	Pegawai Mains Daerah	4	Gred 10	zamri@mains.gov.my	019-2282542	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	122	123	126
1040	MA1040	MA00001040	Nawwar Munirah Binti Abdul Gani	900304105076	19	Pejabat Timbalan Setiausaha (Pengurusan)	1071	Bahagian Perancangan & Penyelidikan	2176	Unit Perancangan	2176	Unit Perancangan	53	Ketua Unit	5	Gred 9	nawwar@mains.gov.my	0192288604	MA1038	Muhibuddin Bin Abu Bakar	MA1005	Mohamad Idris Bin Ramli	1	126	127	130
1077	MA1077	MA00001077	Che Som Binti Omar	791102025676	20	Tiada	1085	Cawangan Nilai	2218	Tiada	1085	Cawangan Nilai	34	Pegawai Mains Cawangan	4	Gred 10	chesom@mains.gov.my	017-4863365	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	128	129	132
1082	MA1082	MA00001082	Yusri Bin Khamis	811105055497	15	Jabatan Pentadbiran	1069	Bahagian Sumber Manusia & Khidmat Pengurusan	2173	Unit Pentadbiran	2173	Unit Pentadbiran	53	Ketua Unit	5	Gred 9	yusri@mains.gov.my	0126144464	MA1020	Wan Aminuddin Bin Wan Abdullah	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	1	129	130	133
1023	MA1023	MA00001023	Srirahayu Binti Sarifin	870224055190	16	Jabatan Wakaf & Mal	1066	Bahagian Wakaf	2169	Unit Agihan Wakaf	2169	Unit Agihan Wakaf	53	Ketua Unit	5	Gred 9	rahayu@mains.gov.my	013-2973139	MA1222	Ahmad Naim Bin Azlan	MA1006	Norazman Bin Amat	1	130	132	1134
1081	MA1081	MA00001081	Nordiyana Binti Othman	841124016116	20	Tiada	1087	Cawangan Seremban 2	2205	Unit Pengurusan Cawangan Seremban 2	2205	Unit Pengurusan Cawangan Seremban 2	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	nordiyana@mains.gov.my	013-3286046	MA1217	Zaharudin Bin Mat Derus	MA1005	Mohamad Idris Bin Ramli	1	132	134	1136
1022	MA1022	MA00001022	Mahadi Bin Ali	750713115135	18	Jabatan Zakat	1034	Tiada	2218	Tiada	18	Jabatan Zakat	3	Pengarah	2	Gred 13	mahadi@mains.gov.my	0192351271	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	133	135	1137
1052	MA1052	MA00001052	Noorhazwani Binti Mohd Zulanafi	860715595352	20	Tiada	1079	Daerah Seremban	2180	Unit Operasi (2) Daerah Seremban	2180	Unit Operasi (2) Daerah Seremban	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	hazwani@mains.gov.my	013-3186775	MA1021	Zamri Bin Ahmad Suhaimi	MA1005	Mohamad Idris Bin Ramli	1	134	137	1139
1055	MA1055	MA00001055	Kasmani Binti Hj. Ismail	790424035258	20	Tiada	1079	Daerah Seremban	2181	Unit Pengurusan Daerah Seremban	2181	Unit Pengurusan Daerah Seremban	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	kasmani@mains.gov.my	0139923001	MA1021	Zamri Bin Ahmad Suhaimi	MA1005	Mohamad Idris Bin Ramli	1	145	149	1151
1028	MA1028	MA00001028	Nurul Athirah Binti Ramli	930806055096	20	Tiada	1083	Daerah Tampin	2189	Unit Operasi (2) Daerah Tampin	2189	Unit Operasi (2) Daerah Tampin	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	athirah@mains.gov.my	01114963552	MA1218	Junaidi Bin Yahaya	MA1005	Mohamad Idris Bin Ramli	1	146	150	1152
1009	MA1009	MA00001009	Aida Yusrina Binti Mat Yusof	740906055432	20	Tiada	1084	Daerah Kuala Pilah	2193	Unit Pengurusan Daerah Kuala Pilah	2193	Unit Pengurusan Daerah Kuala Pilah	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	aida@mains.gov.my	0186604474	MA1224	Syed Mazlan Bin Syed Azizan	MA1005	Mohamad Idris Bin Ramli	1	149	153	1155
1092	MA1092	MA00001092	Nursyahidah Binti Abu Bakar 	850713055126	20	Tiada	1084	Daerah Kuala Pilah	2192	Unit Operasi (2) Daerah Kuala Pilah	2192	Unit Operasi (2) Daerah Kuala Pilah	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	syahidah@mains.gov.my	0176057230	MA1224	Syed Mazlan Bin Syed Azizan	MA1005	Mohamad Idris Bin Ramli	1	150	154	1156
1026	MA1026	MA00001026	Noor Azira Binti Mohamad Najib	810924075534	5	Pejabat Setiausaha MAINS	1068	Bahagian Komunikasi Korporat	2151	Unit Urusetia	2151	Unit Urusetia	53	Ketua Unit	5	Gred 9	azira@mains.gov.my	0123210475	MA1225	Syammil Izuddin Bin Mohamed Yusoff	MA1003	Zainal Bin Said	1	151	155	1157
1005	MA1005	MA00001005	Mohamad Idris Bin Ramli	770918087631	19	Pejabat Timbalan Setiausaha (Pengurusan)	1034	Tiada	2218	Tiada	19	Pejabat Timbalan Setiausaha (Pengurusan)	49	Timbalan Setiausaha (Pengurusan)	1	Gred 14	idris@mains.gov.my	0192282902	MA1003	Zainal Bin Said	MA1003	Zainal Bin Said	1	152	156	1158
1098	MA1098	MA00001098	Sharifah Marshitah Bt S Mokhtar	830119055504	20	Tiada	1088	Cawangan Senawang	2207	Unit Operasi (2) Cawangan Senawang	2207	Unit Operasi (2) Cawangan Senawang	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	marshitah@mains.gov.my	0193343425	MA1164	Norazlina Binti Maarof	MA1005	Mohamad Idris Bin Ramli	1	156	160	2161
1047	MA1047	MA00001047	Syahirah Binti Md Yusof	870626055310	20	Tiada	1081	Daerah Rembau	2186	Unit Operasi (2) Daerah Rembau	2186	Unit Operasi (2) Daerah Rembau	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	syahirah@mains.gov.my	013-6366054	MA1024	Azura Binti Muhamad Alias	MA1005	Mohamad Idris Bin Ramli	1	159	163	2164
1075	MA1075	MA00001075	Zamru Bin Samsudin	740602065439	20	Tiada	1084	Daerah Kuala Pilah	2191	Unit Operasi (1) Daerah Kuala Pilah	2191	Unit Operasi (1) Daerah Kuala Pilah	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	zamru@mains.gov.my	019-2827856	MA1224	Syed Mazlan Bin Syed Azizan	MA1005	Mohamad Idris Bin Ramli	1	165	170	2172
1050	MA1050	MA00001050	Mohamad Zhafri Bin Ibrahim	891006055347	16	Jabatan Wakaf & Mal	1066	Bahagian Wakaf	2168	Unit Aset Wakaf	2168	Unit Aset Wakaf	53	Ketua Unit	5	Gred 9	zhafri@mains.gov.my	0133781618	MA1222	Ahmad Naim Bin Azlan	MA1006	Norazman Bin Amat	1	173	178	2180
1006	MA1006	MA00001006	Norazman Bin Amat	710316055419	16	Jabatan Wakaf & Mal	1034	Tiada	2218	Tiada	16	Jabatan Wakaf & Mal	3	Pengarah	2	Gred 13	norazman@mains.gov.my	012-2727532	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	178	183	2185
1068	MA1068	MA00001068	Zana Ruslinda Binti Ujang	780717055392	17	Pejabat Timbalan Setiausaha (Operasi)	1093	Bahagian Majikan & Ejen	2218	Tiada	1093	Bahagian Majikan & Ejen	4	Ketua Penolong Pengarah	4	Gred 10	zanaruslinda@mains.gov.my	0196177399	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	179	184	2186
1148	MA1148	MA00001148	Bukhari Bin Safian 	880528265145	17	Pejabat Timbalan Setiausaha (Operasi)	1070	Bahagian Dakwah & Pemasaran	2218	Tiada	1070	Bahagian Dakwah & Pemasaran	4	Ketua Penolong Pengarah	4	Gred 10	bukhari@mains.gov.my	0195008746	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	181	186	2188
1200	MA1200	MA00001200	Mohd Hatta Bin Othman	870309565149	15	Jabatan Pentadbiran	1072	Bahagian Kaunseling & Pembangunan Sahsiah	2147	Unit Kaunseling	2147	Unit Kaunseling	53	Ketua Unit	5	Gred 9	hattaothman@mains.gov.my	0192575153	MA1069	Fadilah Binti Mohamed	MA1005	Mohamad Idris Bin Ramli	1	182	187	2189
1149	MA1149	MA00001149	Noriana Binti Samat	890110115296	17	Pejabat Timbalan Setiausaha (Operasi)	1070	Bahagian Dakwah & Pemasaran	2156	Unit Dakwah Zakat & Wakaf	2156	Unit Dakwah Zakat & Wakaf	53	Ketua Unit	5	Gred 9	noriana@mains.gov.my	0183524376	MA1148	Bukhari Bin Safian 	MA1005	Mohamad Idris Bin Ramli	1	183	188	2191
1206	MA1206	MA00001206	Mohd Irfan Aqil Bin Kamaruddin	970529055595	18	Jabatan Zakat	1073	Bahagian Kutipan	2222	Unit Wakalah & Tugas Khas	2222	Unit Wakalah & Tugas Khas	53	Ketua Unit	6	Gred 6	irfan@mains.gov.my	0133561244	MA1015	Alimazri Bin Mauludin	MA1022	Mahadi Bin Ali	1	188	193	2197
1080	MA1080	MA00001080	Mohd Iqbal Bin Amad Salbani 	850120055059	17	Pejabat Timbalan Setiausaha (Operasi)	1093	Bahagian Majikan & Ejen	2220	Unit Sektor Swasta	2220	Unit Sektor Swasta	53	Ketua Unit	6	Gred 6	iqbal@mains.gov.my	019-3992005	MA1068	Zana Ruslinda Binti Ujang	MA1005	Mohamad Idris Bin Ramli	1	191	196	2200
1020	MA1020	MA00001020	Wan Aminuddin Bin Wan Abdullah	721231115017	15	Jabatan Pentadbiran	1069	Bahagian Sumber Manusia & Khidmat Pengurusan	2218	Tiada	1069	Bahagian Sumber Manusia & Khidmat Pengurusan	4	Ketua Penolong Pengarah	3	Gred 12	wanaminuddin@mains.gov.my	012-3923671	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	MA1005	Mohamad Idris Bin Ramli	1	193	198	2202
1024	MA1024	MA00001024	Azura Binti Muhamad Alias	770305055004	20	Tiada	1081	Daerah Rembau	2218	Tiada	1081	Daerah Rembau	33	Pegawai Mains Daerah	4	Gred 10	azuraalias@mains.gov.my	0167130645	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	206	211	3213
1070	MA1070	MA00001070	Nur Azizah Binti Abdul Aziz	760914055342	20	Tiada	1080	Daerah Port Dickson	2218	Tiada	1080	Daerah Port Dickson	33	Pegawai Mains Daerah	4	Gred 10	nurazizah@mains.gov.my	0192416655	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	213	218	3220
1078	MA1078	MA00001078	Mohd Hasni Bin Zulkifle	771017056007	18	Jabatan Zakat	1075	Bahagian Agihan	2218	Tiada	1075	Bahagian Agihan	4	Ketua Penolong Pengarah	4	Gred 10	hasni@mains.gov.my	0192634281	MA1022	Mahadi Bin Ali	MA1005	Mohamad Idris Bin Ramli	1	336	138	1140
1041	MA1041	MA00001041	Nuraaina Diyana Binti Norman	890807055406	5	Pejabat Setiausaha MAINS	1091	Tiada (SU)	2218	Tiada	1091	Tiada (SU)	23	Setiausaha Pejabat	7	Gred 5	nuraaina@mains.gov.my	0133338366	MA1003	Zainal Bin Said	MA1003	Zainal Bin Said	1	337	136	1138
1254	MA1254	MA00001254	Siti Noor Hafizah Binti Che Jusoh	920823055400	15	Jabatan Pentadbiran	1072	Bahagian Kaunseling & Pembangunan Sahsiah	2147	Unit Kaunseling	2147	Unit Kaunseling	53	Ketua Unit	5	Gred 9	noorhafizah@mains.gov.my	01110212308	MA1069	Fadilah Binti Mohamed	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	1	352	428	4350
1306	MA1306	MA00001306	Nur Ainie Edzanie Binti Mohammad Ridzwa	950914055008	14	Jabatan Perbendaharaan	1077	Bahagian Kewangan	2224	Unit Belanjawan & Perbelanjaan	2224	Unit Belanjawan & Perbelanjaan	53	Ketua Unit	5	Gred 9	edzanie@mains.gov.my	0142200646	MA1007	Nor Azlin Bt Arop@othman	MA1002	Azzerol Effendi Bin Abdul Kadir	1	358	364	5500
1258	MA1258	MA00001258	Mohd Hafiz Bin Abu Yazid	850613055057	20	Tiada	1079	Daerah Seremban	2179	Unit Operasi (1) Daerah Seremban	2179	Unit Operasi (1) Daerah Seremban	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	hafizyazid@mains.gov.my	013-9935961	MA1021	Zamri Bin Ahmad Suhaimi	MA1005	Mohamad Idris Bin Ramli	1	367	362	4355
1225	MA1225	MA00001225	Syammil Izuddin Bin Mohamed Yusoff	910119086327	5	Pejabat Setiausaha MAINS	1068	Bahagian Komunikasi Korporat	2218	Tiada	1068	Bahagian Komunikasi Korporat	4	Ketua Penolong Pengarah	4	Gred 10	syammil@mains.gov.my	01133199521	MA1003	Zainal Bin Said	MA1003	Zainal Bin Said	1	368	398	5513
1228	MA1228	MA00001228	Mohammad Zaim Fithri Bin Mohd Hanif	940322145983	20	Tiada	1089	Cawangan Gemas	2209	Unit Operasi (1) Cawangan Gemas	2209	Unit Operasi (1) Cawangan Gemas	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	zaim@mains.gov.my	011-14755431	MA1177	Che Rozita Binti Che Rahman	MA1005	Mohamad Idris Bin Ramli	1	370	401	5518
1217	MA1217	MA00001217	Zaharudin Bin Mat Derus	700508055481	20	Tiada	1087	Cawangan Seremban 2	2218	Tiada	1087	Cawangan Seremban 2	34	Pegawai Mains Cawangan	4	Gred 10	zaharudin@mains.gov.my	0193390621	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	375	409	5520
1256	MA1256	MA00001256	Ahmadiah Bin Malek	931221055255	20	Tiada	1082	Daerah Jempol	2198	Unit Operasi (2) Daerah Jempol	2198	Unit Operasi (2) Daerah Jempol	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	ahmadiah@mains.gov.my	0193030821	MA1221	Muttaqin Bin Mohd Fakiri	MA1005	Mohamad Idris Bin Ramli	1	376	415	5363
1238	MA1238	MA00001238	Mohd Muzzammil Bin Ismail	870408235137	5	Pejabat Setiausaha MAINS	1068	Bahagian Komunikasi Korporat	2152	Unit Komunikasi Korporat	2152	Unit Komunikasi Korporat	53	Ketua Unit	5	Gred 9	muzzammil@mains.gov.my	0126064675	MA1225	Syammil Izuddin Bin Mohamed Yusoff	MA1003	Zainal Bin Said	1	379	421	5372
1218	MA1218	MA00001218	Junaidi Bin Yahaya	710119086291	20	Tiada	1083	Daerah Tampin	2218	Tiada	1083	Daerah Tampin	33	Pegawai Mains Daerah	4	Gred 10	junaidi@mains.gov.my	0182880371	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	383	402	5521
1257	MA1257	MA00001257	Norkhaleeda Binti Abas	931111055326	20	Tiada	1085	Cawangan Nilai	2201	Unit Operasi (2) Cawangan Nilai	2201	Unit Operasi (2) Cawangan Nilai	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	khaleeda@mains.gov.my	013-9933806	MA1077	Che Som Binti Omar	MA1005	Mohamad Idris Bin Ramli	1	384	425	4352
1219	MA1219	MA00001219	Hazmi Bin Abd Kadir	000000000000	20	Tiada	1086	Daerah Jelebu	2218	Tiada	1086	Daerah Jelebu	33	Pegawai Mains Daerah	4	Gred 10	hazmi@mains.gov.my	013- 273 7807	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	386	427	5523
1227	MA1227	MA00001227	Hasrul Nizam Bin Sidek	880301055207	20	Tiada	1089	Cawangan Gemas	2210	Unit Operasi (2) Cawangan Gemas	2210	Unit Operasi (2) Cawangan Gemas	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	hasrul@mains.gov.my	0136513747	MA1177	Che Rozita Binti Che Rahman	MA1005	Mohamad Idris Bin Ramli	1	387	410	5525
1304	MA1304	MA00001304	Nor Azura Binti Abdul Malek	840928055490	5	Pejabat Setiausaha MAINS	1091	Tiada (SU)	2154	Unit Audit Dalam	2154	Unit Audit Dalam	53	Ketua Unit	5	Gred 9	norazura@mains.gov.my	0126756278	MA1003	Zainal Bin Said	MA1003	Zainal Bin Said	1	389	429	5526
1224	MA1224	MA00001224	Syed Mazlan Bin Syed Azizan	890316065781	20	Tiada	1084	Daerah Kuala Pilah	2218	Tiada	1084	Daerah Kuala Pilah	33	Pegawai Mains Daerah	4	Gred 10	mazlan@mains.gov.my	011-23007473	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	400	434	5519
1305	MA1305	MA00001305	Mohd Hazim Bin Hassan	900223045577	15	Jabatan Pentadbiran	1069	Bahagian Sumber Manusia & Khidmat Pengurusan	2175	Unit Teknikal & Pengurusan Projek	2175	Unit Teknikal & Pengurusan Projek	53	Ketua Unit	5	Gred 9	hazim@mains.gov.my	0193223538	MA1020	Wan Aminuddin Bin Wan Abdullah	MA1382	Muhammad Aszam Bin Gambaris@ Watimin	1	1401	6566	5527
1223	MA1223	MA00001223	Muhammad Nawawi Bin Husin	000000000000	20	Tiada	1082	Daerah Jempol	2199	Unit Pengurusan Daerah Jempol	2199	Unit Pengurusan Daerah Jempol	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	nawawi@mains.gov.my	0142324378	MA1225	Syammil Izuddin Bin Mohamed Yusoff	MA1005	Mohamad Idris Bin Ramli	1	1404	430	5515
1230	MA1230	MA00001230	Nabil Fikri Bin Md Ridzwan	891024045185	20	Tiada	1083	Daerah Tampin	2188	Unit Operasi (1) Daerah Tampin	2188	Unit Operasi (1) Daerah Tampin	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	fikri@mains.gov.my	0136486582	MA1218	Junaidi Bin Yahaya	MA1005	Mohamad Idris Bin Ramli	1	3411	1494	5517
1289	MA1289	MA00001289	Mohammad Nasrullah Bin Mohammad Nasir	000000000000	20	Tiada	1086	Daerah Jelebu	2194	Unit Operasi (1) Daerah Jelebu	2194	Unit Operasi (1) Daerah Jelebu	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	m.nasrullah@mains.gov.my	0133116273	MA1219	Hazmi Bin Abd Kadir	MA1005	Mohamad Idris Bin Ramli	1	3418	5563	5546
1221	MA1221	MA00001221	Muttaqin Bin Mohd Fakiri	860120595257	20	Tiada	1082	Daerah Jempol	2218	Tiada	1082	Daerah Jempol	33	Pegawai Mains Daerah	4	Gred 10	muttaqin@mains.gov.my	013-6607562	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	3420	1491	5524
1350	MA1350	MA00001350	Mohamad Izrin Shah Bin Azizan	931006055279	20	Tiada	1086	Daerah Jelebu	2196	Unit Pengurusan Daerah Jelebu	2196	Unit Pengurusan Daerah Jelebu	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	izrin@mains.gov.my	011-37671203	MA1219	Hazmi Bin Abd Kadir	MA1005	Mohamad Idris Bin Ramli	1	8454	13586	18655
1343	MA1343	MA00001343	Muhammad Farhan Bin Rudhuan	950103055637	20	Tiada	1088	Cawangan Senawang	2206	Unit Operasi (1) Cawangan Senawang	2206	Unit Operasi (1) Cawangan Senawang	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	farhan@mains.gov.my	0173451014	MA1164	Norazlina Binti Maarof	MA1005	Mohamad Idris Bin Ramli	1	8458	10579	15648
1220	MA1220	MA00001220	Muhamad Izwan Bin Shuib	871020055601	20	Tiada	1082	Daerah Jempol	2199	Unit Pengurusan Daerah Jempol	2199	Unit Pengurusan Daerah Jempol	58	Penolong Pegawai Mains Daerah/Cawangan (Pengurusan)	5	Gred 9	izwan@mains.gov.my	0182793978	MA1221	Muttaqin Bin Mohd Fakiri	MA1005	Mohamad Idris Bin Ramli	1	8461	1490	5401
1222	MA1222	MA00001222	Ahmad Naim Bin Azlan	860716595493	16	Jabatan Wakaf & Mal	1066	Bahagian Wakaf	2218	Tiada	1066	Bahagian Wakaf	4	Ketua Penolong Pengarah	4	Gred 10	naimazlan@mains.gov.my	019-6049606	MA1006	Norazman Bin Amat	MA1005	Mohamad Idris Bin Ramli	1	8464	1492	5514
1239	MA1239	MA00001239	Muhammad Izzul Naqiyudin Bin Azman	950811055603	19	Pejabat Timbalan Setiausaha (Pengurusan)	1071	Bahagian Perancangan & Penyelidikan	2177	Unit Kajian Syariah	2177	Unit Kajian Syariah	53	Ketua Unit	5	Gred 9	izzul@mains.gov.my	0166097578	MA1038	Muhibuddin Bin Abu Bakar	MA1005	Mohamad Idris Bin Ramli	1	8466	6574	5356
1064	MA1064	MA00001064	Mohammad Hafifi Bin Abdul Hadi	850914015091	5	Pejabat Setiausaha MAINS	1068	Bahagian Komunikasi Korporat	2158	Unit Media Baharu	2158	Unit Media Baharu	53	Ketua Unit	5	Gred 9	m.hafifi@mains.gov.my	019-228 3835	MA1225	Syammil Izuddin Bin Mohamed Yusoff	MA1003	Zainal Bin Said	1	8468	7	8
1266	MA1266	MA00001266	Muhamad Ariffuddin Bin Bahkri	950724055111	20	Tiada	1082	Daerah Jempol	2197	Unit Operasi (1) Daerah Jempol	2197	Unit Operasi (1) Daerah Jempol	57	Penolong Pegawai Mains Daerah/Cawangan (Operasi 1)	5	Gred 9	ariffuddin@mains.gov.my	0187706244	MA1221	Muttaqin Bin Mohd Fakiri	MA1005	Mohamad Idris Bin Ramli	1	8760	424	5361
1226	MA1226	MA00001226	Zainal Bin Samdin 	04    061971	20	Tiada	1080	Daerah Port Dickson	2183	Unit Operasi (2) Daerah Port Dickson	2183	Unit Operasi (2) Daerah Port Dickson	59	Penolong Pegawai Mains Daerah/Cawangan (Operasi 2)	5	Gred 9	zainalsamdin@mains.gov.my	0102169287	MA1070	Nur Azizah Binti Abdul Aziz	MA1005	Mohamad Idris Bin Ramli	1	8761	1493	5522
1382	MA1382	MA00001382	Muhammad Aszam Bin Gambaris@ Watimin	850222085507	15	Jabatan Pentadbiran	1034	Tiada	2218	Tiada	15	Jabatan Pentadbiran	3	Pengarah	2	Gred 13	aszam@mains.gov.my	0194732569	MA1005	Mohamad Idris Bin Ramli	MA1003	Zainal Bin Said	1	8763	13759	18875
`;

function determineRole(jawatan, bahagian, unit, nama) {
  const j = (jawatan || '').toLowerCase();
  const n = (nama || '').toLowerCase();
  const b = (bahagian || '').toLowerCase();
  const u = (unit || '').toLowerCase();

  // IT Admin / Pentadbir Sistem
  if (n.includes('zailani') || u.includes('pembangunan ict')) {
    return 'pentadbir_sistem';
  }

  // Pengurusan Tertinggi (Setiausaha, Timbalan Setiausaha)
  if (j.includes('setiausaha') || j.includes('timbalan setiausaha')) {
    return 'pengurusan';
  }

  // Ketua Bahagian / Ketua Penolong Pengarah / Pengarah / Pegawai Cawangan / Daerah / Ketua Unit
  if (
    j.includes('pengarah') ||
    j.includes('ketua penolong pengarah') ||
    j.includes('ketua unit') ||
    j.includes('pegawai mains daerah') ||
    j.includes('pegawai mains cawangan')
  ) {
    return 'ketua_unit';
  }

  // Kerani
  if (j.includes('kerani') || j.includes('urusetia') || j.includes('pembantu tadbir')) {
    return 'kerani';
  }

  // Default to pegawai_pelaksana (contohnya: Penolong Pegawai Mains Daerah/Cawangan)
  return 'pegawai_pelaksana';
}

function determineBahagian(rawJabatan, rawBahagian, rawUnit) {
  if (rawUnit && rawUnit !== 'Tiada') {
    return rawUnit.trim();
  }
  if (rawBahagian && rawBahagian !== 'Tiada') {
    return rawBahagian.trim();
  }
  if (rawJabatan && rawJabatan !== 'Tiada') {
    return rawJabatan.trim();
  }
  return 'Pejabat MAINS';
}

async function insertUsers() {
  console.log('Connecting to MSSQL Database...');
  const pool = await sql.connect(config);
  const defaultPasswordHash = await bcrypt.hash('password', 10);

  const lines = RAW_DATA.trim().split('\n').filter(l => l.trim().length > 0);
  console.log(`Processing ${lines.length} user records...`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const line of lines) {
    const cols = line.split('\t').map(c => c.trim());
    if (cols.length < 18) continue;

    const staffId = cols[1]; // e.g. MA1010
    const fullName = cols[3]; // e.g. Mohd Zailani Bin Hj. Yunus
    const rawJabatan = cols[6]; // e.g. Jabatan Pentadbiran
    const rawBahagian = cols[8]; // e.g. Bahagian Teknologi Maklumat
    const rawUnit = cols[10]; // e.g. Unit Pembangunan ICT
    const rawJawatan = cols[14]; // e.g. Ketua Unit / Pengarah / Penolong Pegawai ...
    const email = cols[17].toLowerCase(); // e.g. zailani@mains.gov.my
    const phone = cols[18]; // e.g. 0192283124

    // Username derived from email prefix: e.g. zailani@mains.gov.my -> zailani
    let username = email.split('@')[0].trim().toLowerCase();
    if (!username) {
      username = staffId.toLowerCase();
    }

    const role = determineRole(rawJawatan, rawBahagian, rawUnit, fullName);
    const bahagian = determineBahagian(rawJabatan, rawBahagian, rawUnit);

    // Check if user already exists by username OR email
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
  console.log(`Selesai memproses data!`);
  console.log(`Daftar Baru : ${createdCount}`);
  console.log(`Dikemaskini : ${updatedCount}`);
  console.log(`Jumlah Rekod: ${lines.length}`);
  console.log(`========================================\n`);

  // Ringkasan peranan dalam pangkalan data
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

insertUsers().catch(err => {
  console.error('Ralat memasukkan data pengguna:', err);
  process.exit(1);
});
