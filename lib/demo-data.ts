import { SuratItem, addD, today, pd, diff, statusOf, active } from "./sla-utils";
import { ORDER, N, kids, ancestors, isDesc } from "./org-data";

export function generateDemoSurat(count = 25): SuratItem[] {
  let seed = 20261119;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const pick = <T>(a: T[]): T => a[Math.floor(rnd() * a.length)];
  const units = ORDER.filter(id => N[id]?.jenis === 'unit');

  const pengirimList = [
    'Jabatan Hal Ehwal Agama Islam Negeri Sembilan',
    'Pejabat Setiausaha Kerajaan Negeri Sembilan',
    'Jabatan Kemajuan Islam Malaysia (JAKIM)',
    'Lembaga Hasil Dalam Negeri (LHDN)',
    'Pejabat Tanah dan Galian Negeri Sembilan',
    'Majlis Bandaraya Seremban (MBS)',
    'Universiti Sains Islam Malaysia (USIM)',
    'Yayasan Wakaf Malaysia',
    'Pejabat Daerah & Tanah Kuala Pilah',
    'Persatuan Kebajikan Asnaf Negeri Sembilan',
    'Masjid Negeri Sembilan'
  ];

  const T: Record<string, string[]> = {
    'Zakat': [
      'Permohonan bantuan zakat pendidikan asnaf fakir miskin',
      'Kerjasama kempen potongan zakat pendapatan majikan',
      'Penyata zakat perniagaan tahunan syarikat',
      'Rayuan bantuan perubatan kronik asnaf'
    ],
    'Wakaf': [
      'Cadangan pembangunan tanah wakaf khas perumahan',
      'Permohonan penyewaan premis perniagaan aset wakaf',
      'Penyerahan dokumen ikrar wakaf am hartanah'
    ],
    'Kewangan': [
      'Tuntutan bayaran pembekal perkhidmatan ICT',
      'Laporan audit penyata kewangan tahunan',
      'Permohonan peruntukan tambahan penyelenggaraan bangunan'
    ],
    'Pentadbiran': [
      'Pelantikan wakil mesyuarat penyelarasan agensi agama',
      'Pekeliling perkhidmatan pentadbiran am terkini',
      'Permohonan latihan kompetensi pegawai pengurusan'
    ],
    'Aduan': [
      'Aduan perkhidmatan kaunter cawangan daerah',
      'Aduan kelewatan pengagihan bantuan kecemasan',
      'Aduan kerosakan kemudahan kompleks kebajikan'
    ],
    'Jemputan': [
      'Jemputan perasmian majlis sambutan Maal Hijrah peringkat negeri',
      'Jemputan mesyuarat jawatankuasa fatwa negeri',
      'Jemputan karnival usahawan asnaf MAINS'
    ],
    'ICT': [
      'Permohonan capaian sistem e-Surat & pengkalan data',
      'Laporan penyelenggaraan perkakasan pelayan pusat'
    ]
  };

  const out: SuratItem[] = [];
  const tdy = today();
  const counter: Record<number, number> = {};

  for (let i = 0; i < count; i++) {
    const age = Math.floor(Math.pow(rnd(), 1.6) * 40);
    const terima = addD(tdy, -age);
    const kat = pick(Object.keys(T));
    const y = pd(terima).getFullYear();
    counter[y] = (counter[y] || 0) + 1;

    const s: SuratItem = {
      id: `demo-${i + 1}`,
      demo: true,
      noDaftar: `MAINS/SU/${y}/${String(counter[y]).padStart(4, '0')}`,
      noRujukan: `${pick(['JHEAINS', 'SUK.NS', 'JAKIM', 'LHDN', 'PTG', 'MBS', 'USIM', 'YWM'])}/${100 + Math.floor(rnd() * 800)}/${Math.floor(rnd() * 90 + 10)}`,
      tarikhSurat: addD(terima, -Math.floor(rnd() * 5) - 1),
      tarikhTerima: terima,
      pengirim: pick(pengirimList),
      perkara: pick(T[kat]),
      kategori: kat,
      keutamaan: rnd() < 0.15 ? 'Sangat Segera' : rnd() < 0.35 ? 'Segera' : 'Biasa',
      catatan: '',
      penerima: {
        su: {
          status: 'akan',
          dari: null,
          tarikh: terima,
          arahan: 'Surat baharu didaftarkan'
        }
      },
      log: [
        {
          jenis: 'daftar',
          dari: null,
          kepada: ['su'],
          teks: 'Surat didaftarkan & diserahkan kepada Setiausaha MAINS',
          masa: pd(terima).toISOString(),
          oleh: 'Pendaftar Sistem'
        }
      ],
      dicipta: pd(terima).toISOString()
    };

    const target = pick(units);
    const path = ancestors(target);
    const stopAt = rnd() < 0.2 ? Math.max(1, path.length - 2) : path.length - 1;
    let d = terima;

    for (let k = 0; k < stopAt; k++) {
      const from = path[k];
      const to = path[k + 1];
      d = addD(d, rnd() < 0.5 ? 0 : 1);
      if (diff(d, tdy) < 0) break;

      const tos = [to];
      s.penerima[from].status = 'diturunkan';
      const ar = pick([
        'Untuk tindakan segera',
        'Sila ambil tindakan sewajarnya',
        'Sila kaji & kemukakan syor',
        'Untuk tindakan & makluman',
        'Sila selaraskan & laporkan'
      ]);

      tos.forEach(t => {
        s.penerima[t] = {
          status: 'akan',
          dari: from,
          tarikh: d,
          arahan: ar
        };
      });

      s.log.push({
        jenis: 'minit',
        dari: from,
        kepada: tos,
        teks: ar,
        masa: pd(d).toISOString(),
        oleh: N[from]?.ketua || from
      });
    }

    // Active nodes actions
    Object.entries(s.penerima).filter(([, v]) => v.status !== 'diturunkan').forEach(([h]) => {
      const r = rnd();
      let st: 'akan' | 'sedang' | 'telah' = 'akan';
      if (age > 20) st = 'telah';
      else if (age >= 14) st = r < 0.65 ? 'telah' : r < 0.85 ? 'sedang' : 'akan';
      else st = r < 0.3 ? 'telah' : r < 0.7 ? 'sedang' : 'akan';

      if (st === 'akan') return;

      const ds = addD(d, 1 + Math.floor(rnd() * 2));
      s.penerima[h].status = 'sedang';
      s.log.push({
        jenis: 'sedang',
        dari: h,
        kepada: [],
        teks: 'Tindakan dimulakan oleh cawangan',
        masa: pd(ds).toISOString(),
        oleh: N[h]?.ketua || h
      });

      if (st === 'telah') {
        const isLate = rnd() < 0.15;
        const de = addD(terima, isLate ? 15 + Math.floor(rnd() * 6) : Math.min(13, diff(terima, ds) + 2));
        s.penerima[h].status = 'telah';
        s.log.push({
          jenis: 'selesai',
          dari: h,
          kepada: [],
          teks: pick([
            'Surat jawapan rasmi telah dikeluarkan',
            'Bantuan telah diluluskan & dimaklumkan kepada pemohon',
            'Mesyuarat telah dihadiri & laporan dikemukakan',
            'Tindakan selesai sepenuhnya, fail ditutup'
          ]),
          masa: pd(de).toISOString(),
          oleh: N[h]?.ketua || h
        });
        s.tarikhSelesai = de;
      }
    });

    out.push(s);
  }

  // Pre-link a couple of demo letters as related cases (Urutan 3)
  if (out.length >= 6) {
    out[2].surat_berkaitan_id = out[0].id;
    out[2].berkaitan_no_daftar = out[0].noDaftar;
    out[2].berkaitan_perkara = out[0].perkara;
    out[2].perkara = `[Jawapan/Susulan] ${out[2].perkara}`;

    out[5].surat_berkaitan_id = out[1].id;
    out[5].berkaitan_no_daftar = out[1].noDaftar;
    out[5].berkaitan_perkara = out[1].perkara;
    out[5].perkara = `[Rayuan/Lanjutan] ${out[5].perkara}`;
  }

  return out;
}
