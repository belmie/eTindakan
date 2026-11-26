import { 
  Home, 
  Upload, 
  Inbox, 
  Eye, 
  BarChart3, 
  FolderTree, 
  Users, 
  Layers, 
  ShieldCheck, 
  Settings,
  FileText
} from "lucide-react";

export interface MenuItemConfig {
  id: string;
  label: string;
  desc: string;
  iconName: string;
  defaultRoles: string[];
  isAdminOnly?: boolean;
}

export const ALL_MENU_ITEMS: MenuItemConfig[] = [
  {
    id: "utama",
    label: "Utama",
    desc: "Papan pemuka statistik surat, amaran lewat SLA & aktiviti terkini.",
    iconName: "Home",
    defaultRoles: ["pentadbir_sistem", "pengurusan", "ketua_unit", "pegawai_pelaksana", "kerani"]
  },
  {
    id: "daftar",
    label: "Daftar Surat",
    desc: "Pendaftaran surat masuk baharu individu atau pukal beserta muat naik lampiran.",
    iconName: "Upload",
    defaultRoles: ["pentadbir_sistem", "pengurusan", "kerani"]
  },
  {
    id: "peti",
    label: "Peti Minit",
    desc: "Peti masuk surat rasmi untuk tindakan, meminitkan ke bawah atau merekodkan penyelesaian.",
    iconName: "Inbox",
    defaultRoles: ["pentadbir_sistem", "pengurusan", "ketua_unit", "pegawai_pelaksana", "kerani"]
  },
  {
    id: "pantau",
    label: "Pemantauan",
    desc: "Pemantauan menyeluruh status surat cawangan MAINS dalam tempoh SLA 14 hari.",
    iconName: "Eye",
    defaultRoles: ["pentadbir_sistem", "pengurusan", "ketua_unit", "pegawai_pelaksana", "kerani"]
  },
  {
    id: "analisis",
    label: "Analisis",
    desc: "Laporan analitik harian, mingguan, bulanan & tahunan serta kadar pematuhan SLA.",
    iconName: "BarChart3",
    defaultRoles: ["pentadbir_sistem", "pengurusan"]
  },
  {
    id: "struktur",
    label: "Struktur Organisasi",
    desc: "Hierarki rasmi agihan minit MAINS dan direktori pegawai (WhatsApp & Emel).",
    iconName: "FolderTree",
    defaultRoles: ["pentadbir_sistem", "pengurusan", "ketua_unit"]
  },
  {
    id: "pengguna",
    label: "Pengurusan Pengguna",
    desc: "Direktori kakitangan, daftar pengguna baharu, kemaskini peranan & reset kata laluan.",
    iconName: "Users",
    defaultRoles: ["pentadbir_sistem"],
    isAdminOnly: true
  },
  {
    id: "pengurusan_menu",
    label: "Pengurusan Menu",
    desc: "Kawal selia paparan menu navigasi sistem mengikut peranan kakitangan.",
    iconName: "Layers",
    defaultRoles: ["pentadbir_sistem"],
    isAdminOnly: true
  },
  {
    id: "pengurusan_peranan",
    label: "Pengurusan Peranan",
    desc: "Matriks kebenaran hak akses (RBAC), skop kuasa & penetapan had tindakan.",
    iconName: "ShieldCheck",
    defaultRoles: ["pentadbir_sistem"],
    isAdminOnly: true
  },
  {
    id: "tetapan_sistem",
    label: "Tetapan Sistem",
    desc: "Konfigurasi SLA MAINS, maklumat agensi, notifikasi, status OBS cloud & MSSQL.",
    iconName: "Settings",
    defaultRoles: ["pentadbir_sistem"],
    isAdminOnly: true
  }
];

export interface RolePermissionDetail {
  id: string;
  name: string;
  desc: string;
  category: "surat" | "minit" | "cetakan" | "analisis" | "pentadbiran";
}

export const PERMISSION_LIST: RolePermissionDetail[] = [
  { id: "daftar_surat", name: "Daftar Surat Masuk", desc: "Mendaftar surat masuk individu", category: "surat" },
  { id: "pukal_surat", name: "Pendaftaran Pukal", desc: "Mendaftar banyak surat serentak", category: "surat" },
  { id: "minit_bawah", name: "Minitkan Arahan ke Bawah", desc: "Menurunkan minit arahan ke peringkat bawahan", category: "minit" },
  { id: "rekod_tindakan", name: "Rekod Tindakan Selesai", desc: "Menandakan tindakan selesai beserta bukti", category: "minit" },
  { id: "paut_surat", name: "Pautkan Surat Rujukan", desc: "Menghubungkan surat susulan kepada rujukan terdahulu", category: "surat" },
  { id: "cetak_slip", name: "Cetak Slip QR (A5)", desc: "Menjana slip pengesanan dan kod QR", category: "cetakan" },
  { id: "cetak_minit", name: "Cetak Lembaran Minit", desc: "Mencetak borang catatan minit fizikal", category: "cetakan" },
  { id: "lihat_analisis", name: "Laporan Analitik & SLA", desc: "Melihat graf prestasi dan kepatuhan cawangan", category: "analisis" },
  { id: "urus_pengguna", name: "Pengurusan Pengguna", desc: "Menambah, mengubah dan menyahaktifkan kakitangan", category: "pentadbiran" },
  { id: "urus_menu", name: "Pengurusan Menu", desc: "Menyesuaikan paparan menu mengikut peranan", category: "pentadbiran" },
  { id: "urus_peranan", name: "Pengurusan Peranan (RBAC)", desc: "Menetapkan matriks kebenaran hak akses", category: "pentadbiran" },
  { id: "tetapan_sistem", name: "Tetapan Sistem", desc: "Mengubah tempoh SLA rasmi dan konfigurasi agensi", category: "pentadbiran" }
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  pentadbir_sistem: [
    "daftar_surat", "pukal_surat", "minit_bawah", "rekod_tindakan", "paut_surat", 
    "cetak_slip", "cetak_minit", "lihat_analisis", "urus_pengguna", "urus_menu", 
    "urus_peranan", "tetapan_sistem"
  ],
  pengurusan: [
    "daftar_surat", "minit_bawah", "rekod_tindakan", "paut_surat", 
    "cetak_slip", "cetak_minit", "lihat_analisis"
  ],
  ketua_unit: [
    "minit_bawah", "rekod_tindakan", "paut_surat", "cetak_slip", "cetak_minit"
  ],
  pegawai_pelaksana: [
    "rekod_tindakan", "paut_surat", "cetak_slip"
  ],
  kerani: [
    "daftar_surat", "pukal_surat", "paut_surat", "cetak_slip", "cetak_minit"
  ]
};

export const DEFAULT_SYSTEM_SETTINGS = {
  slaDays: 14,
  agencyName: "Majlis Agama Islam Negeri Sembilan (MAINS)",
  agencyAddress: "Menara MAINS, Jalan Dato' Sheikh Ahmad, 70000 Seremban, Negeri Sembilan Darul Khusus",
  agencyPhone: "+606-765 1402 / 1403",
  agencyFax: "+606-762 0648",
  agencyEmail: "esurat@mains.gov.my",
  officialPortal: "https://www.mains.gov.my",
  obsEndpoint: "https://obs.my-kualalumpur-1.alphaedge.tmone.com.my",
  obsBucket: "surat-masuk",
  dbHost: "202.165.22.1:1433",
  dbName: "stsm_mains",
  whatsappEnabled: true,
  emailEnabled: true,
  autoReminderDays: [10, 12, 14],
  environment: "Pengeluaran (Production Live)",
  roleSwitcherAdminOnly: true
};
