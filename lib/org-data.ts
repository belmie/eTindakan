export interface OrgNode {
  id: string;
  p: string | null;
  nama: string;
  jenis: 'pejabat' | 'ts' | 'jabatan' | 'bahagian' | 'unit';
  jaw: string;
  ketua: string;
  ord: number;
}

export interface HubContact {
  nama?: string;
  tel?: string;
  emel?: string;
  cc?: string;
}

// [id, parent, nama, jenis, jawatan ketua, nama ketua]
export const ORG_RAW: [string, string | null, string, 'pejabat' | 'ts' | 'jabatan' | 'bahagian' | 'unit', string, string][] = [
  ['su', null, 'Pejabat Setiausaha MAINS', 'pejabat', 'Setiausaha', 'Zainal bin Said'],
  ['bkk', 'su', 'Bahagian Komunikasi Korporat', 'bahagian', 'Ketua Penolong Pengarah', 'Syammil Izuddin bin Mohamed Yusoff'],
  ['bkk-urs', 'bkk', 'Unit Urusetia', 'unit', 'Ketua Unit', 'Noor Azira binti Mohamad Najib'],
  ['bkk-kk', 'bkk', 'Unit Komunikasi Korporat', 'unit', 'Ketua Unit', 'Mohd Muzzammil bin Ismail'],
  ['bkk-mb', 'bkk', 'Unit Media Baharu', 'unit', 'Ketua Unit', 'Mohammad Hafifi bin Abdul Hadi'],
  ['uu', 'su', 'Unit Undang-Undang', 'unit', 'Penasihat Undang-Undang', 'Romy Norfidzy bin Roslan'],
  ['uad', 'su', 'Unit Audit Dalam', 'unit', 'Ketua Unit', 'Nor Azura binti Abdul Malek'],
  ['uin', 'su', 'Unit Integriti', 'unit', 'Ketua Unit', 'Mohd Azreen bin Abu Bakar'],
  ['tso', 'su', 'Pejabat Timbalan Setiausaha (Operasi)', 'ts', 'Timbalan Setiausaha (Operasi)', '(Kosong)'],
  ['bdp', 'tso', 'Bahagian Dakwah & Pemasaran', 'bahagian', 'Ketua Penolong Pengarah', 'Bukhari bin Safian'],
  ['bdp-dzw', 'bdp', 'Unit Dakwah Zakat & Wakaf', 'unit', 'Ketua Unit', 'Noriana binti Samat'],
  ['bdp-kb', 'bdp', 'Unit Kaunter Bergerak', 'unit', 'Ketua Unit', 'Mohd Shahrizad bin Abu Kasim'],
  ['bme', 'tso', 'Bahagian Majikan & Ejen', 'bahagian', 'Ketua Penolong Pengarah', 'Zana Ruslinda binti Ujang'],
  ['bme-sa', 'bme', 'Unit Sektor Awam', 'unit', 'Ketua Unit', 'Jumiatul Adawiyah binti Ismail'],
  ['bme-ss', 'bme', 'Unit Sektor Swasta', 'unit', 'Ketua Unit', 'Mohd Iqbal bin Amad Salbani'],
  ['bme-ej', 'bme', 'Unit Ejen Zakat & Wakaf', 'unit', 'Ketua Unit', 'Mohd Azwan bin Zulkipli'],
  ['jz', 'tso', 'Jabatan Zakat', 'jabatan', 'Pengarah', 'Mahadi bin Ali'],
  ['jz-k', 'jz', 'Bahagian Kutipan', 'bahagian', 'Ketua Penolong Pengarah', 'Alimazri bin Mauludin'],
  ['jz-k-zp', 'jz-k', 'Unit Zakat Perniagaan', 'unit', 'Ketua Unit', '(Kosong)'],
  ['jz-k-wtk', 'jz-k', 'Unit Wakalah & Tugas Khas', 'unit', 'Ketua Unit', 'Mohd Irfan Aqil bin Kamaruddin'],
  ['jz-a', 'jz', 'Bahagian Agihan', 'bahagian', 'Ketua Penolong Pengarah', 'Mohd Hasni bin Zulkifle'],
  ['jz-a-pd', 'jz-a', 'Unit Pendidikan', 'unit', 'Ketua Unit', 'Norhafizah binti Daud'],
  ['jz-a-kk', 'jz-a', 'Unit Kebajikan & Kesihatan', 'unit', 'Ketua Unit', 'Noor Fathihah binti Osman'],
  ['jz-a-se', 'jz-a', 'Unit Sosioekonomi', 'unit', 'Ketua Unit', 'Zaharim bin Kusinni @ Zuriat'],
  ['jwm', 'tso', 'Jabatan Wakaf & Mal', 'jabatan', 'Pengarah', 'Norazman bin Amat'],
  ['jwm-ksa', 'jwm', 'Kompleks As Saadah', 'unit', 'Ketua Kompleks', 'Dewifazirah binti Azmi'],
  ['jwm-bc', 'jwm', 'Balai Cerap Negeri Sembilan', 'unit', 'Ketua Kompleks', 'Siti Sarah binti Nordin'],
  ['jwm-w', 'jwm', 'Bahagian Wakaf', 'bahagian', 'Ketua Penolong Pengarah', 'Ahmad Naim bin Azlan'],
  ['jwm-w-aw', 'jwm-w', 'Unit Aset Wakaf', 'unit', 'Ketua Unit', 'Mohamad Zhafri bin Ibrahim'],
  ['jwm-w-ag', 'jwm-w', 'Unit Agihan Wakaf', 'unit', 'Ketua Unit', 'Srirahayu binti Sarifin'],
  ['jwm-m', 'jwm', 'Bahagian Mal', 'bahagian', 'Ketua Penolong Pengarah', '(Kosong)'],
  ['jwm-m-pk', 'jwm-m', 'Unit Pusaka', 'unit', 'Ketua Unit', 'Syafiah binti Abdul Jalil'],
  ['jwm-m-hw', 'jwm-m', 'Unit Hibah & Wasiat', 'unit', 'Ketua Unit', 'Siti Syazwani binti Shamshul Kamar'],
  ['jwm-m-ml', 'jwm-m', 'Unit Mal', 'unit', 'Ketua Unit', 'Muhammad Hamizan bin Mahat'],
  ['tsp', 'su', 'Pejabat Timbalan Setiausaha (Pengurusan)', 'ts', 'Timbalan Setiausaha (Pengurusan)', 'Mohamad Idris bin Ramli'],
  ['bpp', 'tsp', 'Bahagian Perancangan & Penyelidikan', 'bahagian', 'Ketua Penolong Pengarah', 'Muhibuddin bin Abu Bakar'],
  ['bpp-pr', 'bpp', 'Unit Perancangan', 'unit', 'Ketua Unit', 'Nawwar Munirah binti Abdul Gani'],
  ['bpp-ks', 'bpp', 'Unit Kajian Syariah', 'unit', 'Ketua Unit', 'Muhammad Izzul Naqiyudin bin Azman'],
  ['bpp-ka', 'bpp', 'Unit Kajian Analitik', 'unit', 'Ketua Unit', 'Siti Nur Liyana binti Zolkifli'],
  ['jp', 'tsp', 'Jabatan Pentadbiran', 'jabatan', 'Pengarah', 'Muhammad Aszam bin Gambaris @ Watimin'],
  ['jp-sm', 'jp', 'Bahagian Sumber Manusia & Khidmat Pengurusan', 'bahagian', 'Ketua Penolong Pengarah', 'Wan Aminuddin bin Wan Abdullah'],
  ['jp-sm-pt', 'jp-sm', 'Unit Pentadbiran', 'unit', 'Ketua Unit', 'Yusri bin Khamis'],
  ['jp-sm-sml', 'jp-sm', 'Unit Sumber Manusia & Latihan', 'unit', 'Ketua Unit', 'Azilawati binti Abdullah'],
  ['jp-sm-tp', 'jp-sm', 'Unit Teknikal & Pengurusan Projek', 'unit', 'Ketua Unit', 'Mohd Hazim bin Hassan'],
  ['jp-kps', 'jp', 'Bahagian Kaunseling & Pembangunan Sahsiah', 'bahagian', 'Ketua Penolong Pengarah', 'Fadilah binti Mohamed'],
  ['jp-kps-k', 'jp-kps', 'Unit Kaunseling', 'unit', 'Ketua Unit', 'Siti Noor Hafizah binti Che Jusoh'],
  ['jp-kps-dst', 'jp-kps', 'Darul Asnaf Seri Tanjung', 'unit', 'Ketua Kompleks', 'Muhammad Hazwan bin Amran'],
  ['jp-kps-dss', 'jp-kps', 'Darul Asnaf Sri Sendayan', 'unit', 'Ketua Kompleks', 'Mohd Syafiq bin Abd Rashid'],
  ['jp-tm', 'jp', 'Bahagian Teknologi Maklumat', 'bahagian', 'Ketua Penolong Pengarah', 'Norpisah binti Zakaria'],
  ['jp-tm-op', 'jp-tm', 'Unit Pengoperasian ICT', 'unit', 'Ketua Unit', 'Mahadzir Imri bin Ab Malek'],
  ['jp-tm-pb', 'jp-tm', 'Unit Pembangunan ICT', 'unit', 'Ketua Unit', 'Mohd Zailani bin Yunus'],
  ['jpb', 'tsp', 'Jabatan Perbendaharaan', 'jabatan', 'Pengarah', 'Azzerol Effendi bin Abdul Kadir'],
  ['jpb-pa', 'jpb', 'Bahagian Perakaunan', 'bahagian', 'Ketua Penolong Pengarah', 'Noor Aishah binti Ghazalli'],
  ['jpb-pa-aa', 'jpb-pa', 'Unit Akaun & Aset', 'unit', 'Ketua Unit', '(Kosong)'],
  ['jpb-pa-hp', 'jpb-pa', 'Unit Hasil & Pelaburan', 'unit', 'Ketua Unit', 'Fatin Nabilah binti Suboh'],
  ['jpb-kw', 'jpb', 'Bahagian Kewangan', 'bahagian', 'Ketua Penolong Pengarah', 'Nor Azlin bt Arop@Othman'],
  ['jpb-kw-bp', 'jpb-kw', 'Unit Belanjawan & Perbelanjaan', 'unit', 'Ketua Unit', 'Nur Ainie Edzanie binti Mohammad Ridzwa'],
  ['jpb-kw-pp', 'jpb-kw', 'Unit Perolehan & Pinjaman', 'unit', 'Ketua Unit', 'Nurhasna binti Husaeni'],
];

// Daerah & Cawangan (di bawah TSO)
const DAERAH: [string, string, string, string, string][] = [
  ['srb', 'Daerah Seremban', 'Zamri b Ahmad Suhaimi', 'Mohd Hafiz bin Abu Yazid', 'Kasmani binti Ismail'],
  ['pd', 'Daerah Port Dickson', 'Nur Azizah binti Abdul Aziz', 'Mohd Haffis bin Abdul Nasir', 'Siti Hajar binti Hasim'],
  ['rbu', 'Daerah Rembau', 'Azura binti Muhamad Alias', 'Syed Abdul Basit bin Syed Mohamad', 'Shahirah binti Ab Rahman'],
  ['tpn', 'Daerah Tampin', 'Junaidi bin Yahaya', 'Nabil Fikri bin Md Ridzwan', 'Nur Hidayah binti Mazlan'],
  ['kp', 'Daerah Kuala Pilah', 'Syed Mazlan bin Syed Azizan', 'Zamru bin Samsudin', 'Aida Yusrina binti Mat Yusof'],
  ['jlb', 'Daerah Jelebu', 'Hazmi bin Abd Kadir', 'Mohammad Nasrullah bin Mohammad Nasir', 'Mohamad Izrin Shah bin Azizan'],
  ['jmp', 'Daerah Jempol', 'Muttaqin bin Mohd Fakiri', 'Muhamad Ariffuddin bin Bakhri', 'Muhamad Izwan bin Shuib'],
  ['nil', 'Cawangan Nilai', 'Che Som binti Omar', 'Khairul Aifaa bin Md Salleh', 'Siti Hajar binti Mohamad Daud'],
  ['s2', 'Cawangan Seremban 2', 'Zaharudin bin Mat Derus', 'Abdul Muiz bin Shafie', 'Nordiyana binti Othman'],
  ['snw', 'Cawangan Senawang', 'Norazlina binti Maarof', 'Muhammad Farhan bin Rudhuan', 'Maizatul Akma binti Mohamad'],
  ['gms', 'Cawangan Gemas', 'Che Rozita binti Che Rahman', 'Mohammad Zaim Fithri bin Mohd Hanif', 'Yusof bin Abdul Rahim'],
];

DAERAH.forEach(([id, nm, k, o, p]) => {
  const caw = nm.startsWith('Cawangan');
  ORG_RAW.push(['d-' + id, 'tso', 'Pejabat MAINS ' + nm, 'pejabat', caw ? 'Pegawai MAINS Cawangan' : 'Pegawai MAINS Daerah', k]);
  ORG_RAW.push(['d-' + id + '-op', 'd-' + id, 'Unit Operasi (' + nm.replace(/^(Daerah|Cawangan) /, '') + ')', 'unit', 'Penolong Pegawai (Operasi 1)', o]);
  ORG_RAW.push(['d-' + id + '-pg', 'd-' + id, 'Unit Pengurusan (' + nm.replace(/^(Daerah|Cawangan) /, '') + ')', 'unit', 'Penolong Pegawai (Pengurusan)', p]);
});

export const N: Record<string, OrgNode> = {};
export const KIDS: Record<string, string[]> = {};

ORG_RAW.forEach(([id, p, nama, jenis, jaw, ketua], i) => {
  N[id] = { id, p, nama, jenis, jaw, ketua, ord: i };
  (KIDS[p || '_'] = KIDS[p || '_'] || []).push(id);
});

export const kids = (id: string): string[] => KIDS[id] || [];

export function depth(id: string): number {
  let d = 0;
  let n: OrgNode | undefined = N[id];
  while (n && n.p) {
    d++;
    n = N[n.p];
  }
  return d;
}

export function ancestors(id: string): string[] {
  const a: string[] = [];
  let n: OrgNode | undefined = N[id];
  while (n) {
    a.unshift(n.id);
    n = n.p ? N[n.p] : undefined;
  }
  return a;
}

export function descendants(id: string): string[] {
  const out: string[] = [];
  function walk(x: string) {
    kids(x).forEach(k => {
      out.push(k);
      walk(k);
    });
  }
  walk(id);
  return out;
}

export function isDesc(id: string, anc: string): boolean {
  let n: OrgNode | undefined = N[id];
  while (n) {
    if (n.id === anc) return true;
    n = n.p ? N[n.p] : undefined;
  }
  return false;
}

export const ORDER: string[] = [];
(function walk(x: string) {
  ORDER.push(x);
  kids(x).forEach(walk);
})('su');

export const JENIS_LBL: Record<string, string> = {
  pejabat: 'Pejabat',
  ts: 'Pejabat TS',
  jabatan: 'Jabatan',
  bahagian: 'Bahagian',
  unit: 'Unit'
};

export const shortNm = (id: string): string => {
  if (!N[id]) return id;
  return N[id].nama
    .replace('Pejabat Timbalan Setiausaha', 'TS')
    .replace('Pejabat MAINS ', '');
};

export const INITIAL_HUB: Record<string, HubContact> = {
  su: { nama: 'Zainal bin Said', tel: '0192001122', emel: 'setiausaha@mains.gov.my' },
  tso: { nama: 'Timbalan Setiausaha Operasi', tel: '0193002233', emel: 'tsoperas@mains.gov.my' },
  tsp: { nama: 'Mohamad Idris bin Ramli', tel: '0194003344', emel: 'tspengurusan@mains.gov.my' },
  jz: { nama: 'Mahadi bin Ali', tel: '0195004455', emel: 'pengarahzakat@mains.gov.my' },
  jwm: { nama: 'Norazman bin Amat', tel: '0196005566', emel: 'pengarahwakaf@mains.gov.my' },
  jp: { nama: 'Muhammad Aszam bin Gambaris', tel: '0197006677', emel: 'pengarahpentadbiran@mains.gov.my' },
  jpb: { nama: 'Azzerol Effendi bin Abdul Kadir', tel: '0198007788', emel: 'bendahari@mains.gov.my' },
};
