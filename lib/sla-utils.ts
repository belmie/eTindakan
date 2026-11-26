import { N, shortNm, isDesc } from './org-data';

export const TEMPOH = 14;

export const BLN = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

export const pad = (n: number | string): string => String(n).padStart(2, '0');

export const ymd = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const pd = (s: string): Date => {
  if (!s) return new Date();
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12);
};

export const today = (): string => ymd(new Date());

export const addD = (s: string, n: number): string => {
  const d = pd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
};

export const diff = (a: string, b: string): number => {
  return Math.round((pd(b).getTime() - pd(a).getTime()) / 864e5);
};

export const fmtD = (s?: string | null): string => {
  if (!s) return '—';
  const d = pd(s);
  return `${pad(d.getDate())} ${BLN[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtDT = (s?: string | null): string => {
  if (!s) return '—';
  const d = new Date(s);
  return `${pad(d.getDate())} ${BLN[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export interface PenerimaEntry {
  status: 'akan' | 'sedang' | 'telah' | 'diturunkan';
  dari?: string | null;
  tarikh: string;
  arahan: string;
  catatan?: string;
  dilihat?: string | null;
  dibaca?: string | null;
}

export interface LogEntry {
  jenis: 'daftar' | 'minit' | 'sedang' | 'selesai' | 'catatan' | 'notifikasi';
  dari?: string | null;
  kepada: string[];
  teks: string;
  masa: string;
  oleh?: string | null;
}

export interface SuratItem {
  id: string | number;
  noDaftar: string;
  noRujukan: string;
  tarikhSurat: string;
  tarikhTerima: string;
  tarikhSelesai?: string | null;
  pengirim: string;
  perkara: string;
  kategori: string;
  keutamaan: 'Biasa' | 'Segera' | 'Sangat Segera';
  catatan?: string;
  surat_berkaitan_id?: number | string | null;
  berkaitan_no_daftar?: string | null;
  berkaitan_perkara?: string | null;
  lampiran?: {
    nama: string;
    url?: string;
    saiz?: number;
    jenis?: string;
  } | null;
  penerima: Record<string, PenerimaEntry>;
  log: LogEntry[];
  dicipta?: string;
  kemaskini?: string;
  demo?: boolean;
}

export function active(s: SuratItem): [string, PenerimaEntry][] {
  return Object.entries(s.penerima || {}).filter(([, v]) => v.status !== 'diturunkan');
}

export function statusOf(s: SuratItem): 'akan' | 'sedang' | 'telah' {
  const a = active(s);
  if (a.length && a.every(([, v]) => v.status === 'telah')) return 'telah';
  if (a.some(([, v]) => v.status === 'sedang' || v.status === 'telah')) return 'sedang';
  return 'akan';
}

export const due = (s: SuratItem): string => addD(s.tarikhTerima, TEMPOH);

export const baki = (s: SuratItem): number => diff(today(), due(s));

export const lewat = (s: SuratItem): boolean => statusOf(s) !== 'telah' && baki(s) < 0;

export const hampir = (s: SuratItem): boolean => statusOf(s) !== 'telah' && baki(s) >= 0 && baki(s) <= 3;

export const dalamTempoh = (s: SuratItem): boolean =>
  statusOf(s) === 'telah' && !!s.tarikhSelesai && s.tarikhSelesai.slice(0, 10) <= due(s);

export function nodeStatus(s: SuratItem, id: string): 'akan' | 'sedang' | 'telah' | 'diturunkan' | null {
  const e = (s.penerima || {})[id];
  if (!e) return null;
  if (e.status !== 'diturunkan') return e.status;
  const sub = active(s).filter(([k]) => isDesc(k, id)).map(([, v]) => v.status);
  if (!sub.length) return 'akan';
  if (sub.every(x => x === 'telah')) return 'telah';
  if (sub.some(x => x === 'sedang' || x === 'telah')) return 'sedang';
  return 'akan';
}

export const ST_CONFIG = {
  akan: { label: 'Akan Diambil Tindakan', short: 'Akan', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', dot: '#6f8ba3' },
  sedang: { label: 'Sedang Diambil Tindakan', short: 'Sedang', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', dot: '#fab219' },
  telah: { label: 'Telah Diambil Tindakan', short: 'Telah', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', dot: '#0ca30c' },
  lewat: { label: 'Lewat > 14 Hari', short: 'Lewat', bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-700 dark:text-red-300', dot: '#d03b3b' },
  diturunkan: { label: 'Diminit ke bawah', short: 'Diminit', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', dot: '#2a78d6' },
};

export function holdersTxt(s: SuratItem): string {
  const a = active(s).map(([k]) => shortNm(k));
  return a.length ? a.join(', ') : '—';
}

export function nextNoDaftar(dateStr: string, list: SuratItem[]): string {
  const y = pd(dateStr).getFullYear();
  let mx = 0;
  list.forEach(s => {
    const m = /\/(\d{4})\/(\d{4,})$/.exec(s.noDaftar || '');
    if (m && +m[1] === y) mx = Math.max(mx, +m[2]);
  });
  return `MAINS/SU/${y}/${String(mx + 1).padStart(4, '0')}`;
}

const ACR = new Set(['MAINS','JAKIM','JHEAINS','JAINS','LHDN','ICT','NS','MBS','USIM','PTG','YWM','KPI','SPA','JPA','SUK','MAIS','MAIWP','JKR','PDRM','KDN','KPM','UiTM','IPT','IPTA','B40','PPR','PBT','MPPD','MPS','MPN','MDKP','MDJ','MDT','MDR','UPSI','UKM','UM','UPM','USM','UTM','UIAM','BIMB','RHB','CIMB','TNB','SPRM','KKM','KWSP','PERKESO','LZS','PPZ','TH','YB','YAB','YBHG','SDN','BHD']);
const KECIL = new Set(['dan','di','bagi','untuk','ke','dari','daripada','yang','atau','dengan','oleh','pada','dalam','serta','tentang','mengenai','of','and','the','for','to','in','on']);

export function niceCase(s?: string | null): string {
  const str = String(s || '').replace(/\s+/g, ' ').trim().replace(/^[-–:.\s]+|[-–:.\s]+$/g, '');
  const letters = str.replace(/[^A-Za-z]/g, '');
  if (!letters || letters !== letters.toUpperCase()) return str;
  return str.split(' ').map((w, i) => {
    const bare = w.replace(/[^A-Za-z0-9]/g, '');
    if (ACR.has(bare.toUpperCase()) && bare.length <= 7) return w;
    const l = w.toLowerCase();
    if (i && KECIL.has(l)) return l;
    return l.replace(/(^|[(\/\-"'])([a-z])/g, (_, a, b) => a + b.toUpperCase());
  }).join(' ');
}

export function heurInfo(text: string, filename?: string) {
  const L = String(text || '').split(/\n/).map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const o: { noRujukan: string; perkara: string; pengirim: string; tarikhSurat: string; kategori: string } = {
    noRujukan: '',
    perkara: '',
    pengirim: '',
    tarikhSurat: '',
    kategori: 'Pentadbiran'
  };

  // Find reference number
  for (const l of L) {
    if (o.noRujukan) break;
    const m = l.match(/(?:ruj(?:ukan)?\.?\s*kami|our\s*ref(?:erence)?|no\.?\s*ruj(?:ukan)?\s*(?:kami)?|ruj(?:ukan)?\.?|ref\.?)\s*[:：]\s*([A-Za-z0-9][A-Za-z0-9.\/\-()&: ]{3,60})/i);
    if (m && !/(ruj(?:ukan)?\.?\s*tuan|your\s*ref)/i.test(l.slice(0, (m.index || 0) + 14))) {
      o.noRujukan = m[1].replace(/\s{2,}.*$/, '').replace(/\s+(Tarikh|Date)\b.*$/i, '').trim();
    }
  }

  // Find subject / title
  for (let i = 0; i < L.length && !o.perkara; i++) {
    const m = L[i].match(/(?:^|\s)(?:per(?:kara)?|tajuk(?:\s+surat)?|re|subject|subjek)\s*[.:：\-–]\s*(.*)$/i);
    if (m) {
      let s = m[1].trim();
      let j = i + 1;
      if (!s && j < L.length) { s = L[j]; j++; }
      o.perkara = s;
    }
  }

  // Fallback title from filename
  if (!o.perkara && filename) {
    o.perkara = filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  }

  // Sender heuristics
  const ORGW = /(JABATAN|MAJLIS|KEMENTERIAN|PEJABAT|LEMBAGA|UNIVERSITI|SYARIKAT|BERHAD|BHD|YAYASAN|PERSATUAN|BANK|KOLEJ|SEKOLAH|INSTITUT|PERBADANAN|AGENSI|SURUHANJAYA|KERAJAAN|JAWATANKUASA|MASJID|PERTUBUHAN)/i;
  for (const l of L.slice(0, 10)) {
    if (ORGW.test(l) && l.length <= 90 && !/^(ruj|tarikh|date|kepada|to)\b/i.test(l)) {
      o.pengirim = l;
      break;
    }
  }

  o.perkara = niceCase(o.perkara).slice(0, 200);
  o.pengirim = niceCase(o.pengirim).slice(0, 120);

  // Category heuristics
  const low = (o.perkara + ' ' + text).toLowerCase();
  if (low.includes('zakat') || low.includes('asnaf')) o.kategori = 'Zakat';
  else if (low.includes('wakaf') || low.includes('tanah wakaf') || low.includes('mal')) o.kategori = 'Wakaf';
  else if (low.includes('kewangan') || low.includes('bayaran') || low.includes('peruntukan') || low.includes('invois')) o.kategori = 'Kewangan';
  else if (low.includes('aduan') || low.includes('bantahan')) o.kategori = 'Aduan';
  else if (low.includes('jemputan') || low.includes('majlis') || low.includes('undangan')) o.kategori = 'Jemputan';
  else if (low.includes('ict') || low.includes('sistem') || low.includes('rangkaian')) o.kategori = 'ICT';

  return o;
}
