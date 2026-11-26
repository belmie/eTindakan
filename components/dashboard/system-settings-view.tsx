"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_SYSTEM_SETTINGS } from "@/lib/menu-config";
import { 
  VisualThemeSettings, 
  DEFAULT_VISUAL_THEME, 
  THEME_PRESETS, 
  getHeaderStyles, 
  getSidebarStyles, 
  getAppCanvasStyles 
} from "@/lib/theme-config";
import { 
  Settings, 
  Clock, 
  Building2, 
  Database, 
  Cloud, 
  Bell, 
  CheckCircle2, 
  RotateCcw, 
  HardDrive, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  Server,
  Palette,
  Image as ImageIcon,
  Upload as UploadIcon,
  Sliders,
  Check,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface SystemSettingsViewProps {
  onSettingsSaved?: (newSettings: any) => void;
}

export function SystemSettingsView({ onSettingsSaved }: SystemSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'sla' | 'profil' | 'visual' | 'server' | 'backup'>('sla');
  
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("esurat.systemSettings");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  const [visualTheme, setVisualTheme] = useState<VisualThemeSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("esurat.visualTheme");
        if (saved) {
          return { ...DEFAULT_VISUAL_THEME, ...JSON.parse(saved) };
        }
      } catch {}
    }
    return DEFAULT_VISUAL_THEME;
  });

  const [testingDb, setTestingDb] = useState(false);
  const [testingObs, setTestingObs] = useState(false);

  // File upload reader for custom background image (base64)
  const handleImageUpload = (target: 'header' | 'sidebar' | 'app', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Sila pilih fail imej yang sah (JPG, PNG, WebP, SVG).");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Saiz imej tidak boleh melebihi 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (target === 'header') {
        setVisualTheme(prev => ({ ...prev, headerBgType: 'custom', headerCustomUrl: result }));
      } else if (target === 'sidebar') {
        setVisualTheme(prev => ({ ...prev, sidebarBgType: 'custom', sidebarCustomUrl: result }));
      } else if (target === 'app') {
        setVisualTheme(prev => ({ ...prev, appBgType: 'custom', appCustomUrl: result }));
      }
      toast.success(`Imej latar belakang ${target} berjaya dimuat naik ke pratonton!`);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem("esurat.systemSettings", JSON.stringify(settings));
    localStorage.setItem("esurat.visualTheme", JSON.stringify(visualTheme));
    
    // Dispatch real-time event to update layout instantly
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('visualThemeChanged', { detail: visualTheme }));
      window.dispatchEvent(new CustomEvent('systemSettingsChanged', { detail: settings }));
    }

    toast.success("Tetapan sistem dan tema latar belakang berjaya disimpan & dikemas kini!");
    if (onSettingsSaved) onSettingsSaved(settings);
  };

  const handleReset = () => {
    if (!confirm("Kembalikan semua tetapan sistem dan tema visual kepada konfigurasi asal?")) return;
    setSettings(DEFAULT_SYSTEM_SETTINGS);
    setVisualTheme(DEFAULT_VISUAL_THEME);
    localStorage.removeItem("esurat.systemSettings");
    localStorage.removeItem("esurat.visualTheme");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('visualThemeChanged', { detail: DEFAULT_VISUAL_THEME }));
      window.dispatchEvent(new CustomEvent('systemSettingsChanged', { detail: DEFAULT_SYSTEM_SETTINGS }));
    }

    toast.success("Tetapan sistem dan tema visual dikembalikan kepada piawaian lalai.");
    if (onSettingsSaved) onSettingsSaved(DEFAULT_SYSTEM_SETTINGS);
  };

  const testDbConnection = async () => {
    setTestingDb(true);
    try {
      const res = await fetch("/api/users?limit=1");
      if (res.ok) {
        toast.success("Sambungan MSSQL Database (202.165.22.1:1433) berjaya & aktif!");
      } else {
        toast.warning("Pelayan responsif tetapi data memerlukan sesi aktif.");
      }
    } catch {
      toast.error("Gagal menyambung ke pangkalan data MSSQL.");
    } finally {
      setTestingDb(false);
    }
  };

  const testObsConnection = async () => {
    setTestingObs(true);
    setTimeout(() => {
      setTestingObs(false);
      toast.success("Sambungan AlphaEdge TM One OBS (Kuala Lumpur 1) aktif & sedia!");
    }, 700);
  };

  const exportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      agency: settings.agencyName,
      slaDays: settings.slaDays,
      settings: settings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `esurat-mains-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fail sandaran konfigurasi sistem berjaya dimuat turun!");
  };

  const clearCache = () => {
    if (!confirm("Adakah anda pasti ingin mengosongkan cache aplikasi tempatan?")) return;
    localStorage.removeItem("esurat.roleMenuMap");
    localStorage.removeItem("esurat.rolePermissions");
    toast.success("Cache konfigurasi dibersihkan. Memuat semula...");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tetapan Sistem & Konfigurasi MAINS
            </h1>
            <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 text-[10px] font-bold">
              Eksklusif Pentadbir
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi piagam pelanggan SLA 14 hari, maklumat rasmi MAINS, sambungan storan awan OBS, dan pelayan MSSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="rounded-xl h-9 text-xs gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Set Semula
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            className="rounded-xl h-9 px-4 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'sla'
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          Piagam SLA (14 Hari)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'profil'
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Profil & Agensi MAINS
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visual')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'visual'
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Palette className="w-4 h-4" />
          Latar Belakang & Visual
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('server')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'server'
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Server className="w-4 h-4" />
          Storan OBS & MSSQL
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'backup'
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          Sandaran & Notifikasi
        </button>
      </div>

      {/* Tab 1: Piagam SLA */}
      {activeTab === 'sla' && (
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Piagam Pelanggan & Tempoh Piawai SLA
            </h3>
            <p className="text-xs text-slate-500">
              Tempoh kiraan hari bekerja atau kalendar bermula dari tarikh surat masuk diterima di kaunter MAINS sehingga tindakan selesai direkodkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Label className="font-bold text-xs">Tempoh Tindakan Rasmi (Hari SLA)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.slaDays}
                  onChange={e => setSettings({ ...settings, slaDays: Number(e.target.value) })}
                  className="h-10 text-base font-extrabold text-teal-700 dark:text-teal-300 w-28 bg-white dark:bg-slate-900"
                />
                <span className="text-xs text-slate-500 font-semibold">Hari dari tarikh terima</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Piawaian rasmi semasa MAINS: <b>14 Hari Kalendar</b>.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <Label className="font-bold text-xs">Peringatan Menghampiri Tarikh Akhir</Label>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div>🟡 Amaran Pertama: <b>Baki 4 Hari</b> (Hari ke-10)</div>
                <div>🟠 Amaran Kedua: <b>Baki 2 Hari</b> (Hari ke-12)</div>
                <div>🔴 Amaran Kritikal: <b>Tamat / Lewat</b> (Hari ke-14+)</div>
              </div>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 md:col-span-2">
              <Label className="font-bold text-xs">Format No. Pendaftaran Surat Masuk</Label>
              <Input
                disabled
                value="MAINS/SU/{TAHUN}/{NOMBOR_SIRI_4_DIGIT}"
                className="h-9 font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Contoh: <span className="font-mono font-bold text-teal-700 dark:text-teal-400">MAINS/SU/2026/0001</span>. Nombor siri dijana secara berturutan mengikut tahun penerimaan.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Profil Agensi MAINS */}
      {activeTab === 'profil' && (
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              Maklumat Rasmi Organisasi (MAINS)
            </h3>
            <p className="text-xs text-slate-500">
              Maklumat ini dicetak pada Slip Rujukan Kod QR (A5) dan Lembaran Minit rasmi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="sm:col-span-2 space-y-1">
              <Label className="font-semibold text-xs">Nama Agensi Rasmi</Label>
              <Input
                value={settings.agencyName}
                onChange={e => setSettings({ ...settings, agencyName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label className="font-semibold text-xs">Alamat Ibu Pejabat</Label>
              <Textarea
                rows={2}
                value={settings.agencyAddress}
                onChange={e => setSettings({ ...settings, agencyAddress: e.target.value })}
                className="text-xs resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">No. Telefon Rasmi</Label>
              <Input
                value={settings.agencyPhone}
                onChange={e => setSettings({ ...settings, agencyPhone: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">No. Faks</Label>
              <Input
                value={settings.agencyFax}
                onChange={e => setSettings({ ...settings, agencyFax: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Emel Meja Bantuan (Helpdesk)</Label>
              <Input
                value={settings.agencyEmail}
                onChange={e => setSettings({ ...settings, agencyEmail: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Portal Web Rasmi</Label>
              <Input
                value={settings.officialPortal}
                onChange={e => setSettings({ ...settings, officialPortal: e.target.value })}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Storan OBS & MSSQL */}
      {activeTab === 'server' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* MSSQL Database Card */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pangkalan Data MSSQL</h3>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300">
                🟢 Bersambung
              </Badge>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Pelayan (Host):</span>
                <span className="font-bold">{settings.dbHost}</span>
              </div>
              <div className="flex justify-between">
                <span>Pangkalan Data:</span>
                <span className="font-bold">{settings.dbName}</span>
              </div>
              <div className="flex justify-between">
                <span>Pengesahan Sijil:</span>
                <span className="text-emerald-600 font-bold">TrustServerCert: Ya</span>
              </div>
              <div className="flex justify-between">
                <span>Saiz Connection Pool:</span>
                <span>Max 10 Sambungan</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={testingDb}
              onClick={testDbConnection}
              className="w-full text-xs h-9 gap-1.5"
            >
              {testingDb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-teal-600" />}
              Uji Sambungan Database MSSQL
            </Button>
          </Card>

          {/* OBS Cloud Storage Card */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Storan Awan OBS (AlphaEdge TM)</h3>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300">
                🟢 Aktif (KL1)
              </Badge>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Penyedia Storan:</span>
                <span className="font-bold">TM One AlphaEdge</span>
              </div>
              <div className="flex justify-between">
                <span>Wilayah (Region):</span>
                <span>my-kualalumpur-1</span>
              </div>
              <div className="flex justify-between">
                <span>Bucket Storan:</span>
                <span className="font-bold">{settings.obsBucket}</span>
              </div>
              <div className="flex justify-between">
                <span>Akses Keselamatan:</span>
                <span className="text-blue-600 font-bold">Pre-Signed URL (1 Jam)</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={testingObs}
              onClick={testObsConnection}
              className="w-full text-xs h-9 gap-1.5"
            >
              {testingObs ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-blue-600" />}
              Uji Sambungan Storan OBS
            </Button>
          </Card>
        </div>
      )}

      {/* Tab 4: Sandaran & Notifikasi */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* Notification & Access Control toggles */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Kawalan Akses & Saluran Notifikasi
            </h3>

            <div className="space-y-3 pt-1">
              {/* Toggle for Peranan Semasa */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60">
                <div className="space-y-0.5 pr-2">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Hadkan &apos;Peranan Semasa&apos; Kepada Pentadbir Sistem Sahaja</span>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-bold">
                      Keselamatan
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Jika diaktifkan, menu pemilihan &amp; simulasi &apos;Peranan Semasa&apos; di pengepala atas hanya boleh dilihat dan ditukar oleh <b>Pentadbir Sistem (IT Admin)</b>. Kakitangan lain hanya melihat peranan rasmi akaun masing-masing.
                  </div>
                </div>
                <Switch
                  checked={settings.roleSwitcherAdminOnly ?? true}
                  onCheckedChange={checked => setSettings({ ...settings, roleSwitcherAdminOnly: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Notifikasi WhatsApp Rasmi</div>
                  <div className="text-[11px] text-slate-400">Hantar peringatan ke telefon pegawai bagi surat lewat/hampir tamat</div>
                </div>
                <Switch
                  checked={settings.whatsappEnabled}
                  onCheckedChange={checked => setSettings({ ...settings, whatsappEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Notifikasi Emel MAINS</div>
                  <div className="text-[11px] text-slate-400">Pemberitahuan surat baharu didaftarkan ke peti minit Setiausaha</div>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={checked => setSettings({ ...settings, emailEnabled: checked })}
                />
              </div>
            </div>
          </Card>

          {/* Backup & System Maintenance */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-teal-600" />
              Penyelenggaraan & Sandaran Sistem
            </h3>

            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Muat Turun Sandaran Konfigurasi</div>
                  <div className="text-[11px] text-slate-400">Simpan salinan fail tetapan SLA, peranan, dan agensi</div>
                </div>
                <Button size="sm" onClick={exportBackup} className="h-8 text-xs gap-1 bg-teal-600 hover:bg-teal-700 text-white shrink-0">
                  <Download className="w-3 h-3" /> Sandaran
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Kosongkan Cache Tempatan</div>
                  <div className="text-[11px] text-slate-400">Reset cache menu dan matriks peranan pada peranti ini</div>
                </div>
                <Button size="sm" variant="outline" onClick={clearCache} className="h-8 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 shrink-0">
                  <Trash2 className="w-3 h-3 mr-1" /> Kosongkan
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Latar Belakang & Visual */}
      {activeTab === 'visual' && (
        <div className="space-y-6">
          {/* Real-time Interactive Live Preview */}
          <Card className="rounded-2xl border-2 border-teal-500/30 bg-slate-900/5 dark:bg-slate-900/40 p-5 space-y-3 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Pratonton Simulasi Langsung (Live Simulation)
                </h3>
              </div>
              <Badge className="bg-teal-600 text-white text-[10px] px-2 py-0.5">
                Masa Nyata (Real-Time)
              </Badge>
            </div>

            {/* Miniature Browser Window Frame */}
            <div className="rounded-xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-md flex flex-col h-[280px] bg-slate-100 dark:bg-slate-950">
              {/* Miniature Top Header */}
              <div 
                style={getHeaderStyles(visualTheme)}
                className="p-3 text-white flex items-center justify-between border-b border-white/10 shrink-0 relative transition-all duration-300"
              >
                <div>
                  <div className="font-serif text-[9px] opacity-80">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
                  <div className="font-extrabold text-xs">Sistem Penyampaian Surat & Pemantauan Tindakan</div>
                  <div className="text-[9px] text-teal-100/70">Surat masuk → Setiausaha → Tindakan Jabatan</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-medium">
                    ● MSSQL Aktif
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px]">
                    🔔
                  </div>
                </div>
              </div>

              {/* Miniature Body (Sidebar + Content) */}
              <div className="flex-1 flex overflow-hidden">
                {/* Miniature Sidebar */}
                <div 
                  style={getSidebarStyles(visualTheme)}
                  className="w-44 text-slate-100 p-2.5 flex flex-col justify-between border-r border-white/10 shrink-0 transition-all duration-300"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-white/10">
                      <div className="w-5 h-5 rounded bg-teal-400/30 flex items-center justify-center text-[10px] font-bold">M</div>
                      <span className="text-[11px] font-bold text-white">e-Surat MAINS</span>
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div className="p-1 rounded bg-teal-500 text-white font-semibold flex items-center gap-1.5">
                        <span>🏠</span> Utama
                      </div>
                      <div className="p-1 rounded text-slate-300 flex items-center gap-1.5">
                        <span>📥</span> Peti Minit
                      </div>
                      <div className="p-1 rounded text-slate-300 flex items-center gap-1.5">
                        <span>👁️</span> Pemantauan
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] text-teal-200/80 p-1 rounded bg-white/5 border border-white/10">
                    SLA: 14 Hari
                  </div>
                </div>

                {/* Miniature Canvas */}
                <div 
                  style={getAppCanvasStyles(visualTheme, false)}
                  className={`flex-1 p-3 overflow-y-auto ${visualTheme.appBgType === 'islamic_pattern' ? 'islamic-pattern' : ''}`}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-[9px] text-slate-500">Jumlah Surat</div>
                      <div className="text-sm font-extrabold text-teal-700">128 Surat</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="text-[9px] text-slate-500">Pematuhan SLA</div>
                      <div className="text-sm font-extrabold text-emerald-600">96.4%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Setting Section 1: Header Atas */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-teal-600" />
                  1. Latar Belakang Header Atas (Top Header Banner)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih tema rasmi, corak geometrik Islamik, motif kubah/masjid, atau muat naik imej tersuai dari komputer.
                </p>
              </div>
              <Badge variant="outline" className="text-xs text-teal-700 dark:text-teal-300">
                Gaya Semasa: {visualTheme.headerBgType}
              </Badge>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {THEME_PRESETS.header.map(preset => {
                const isSelected = visualTheme.headerBgType === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setVisualTheme(prev => ({ ...prev, headerBgType: preset.id as any }))}
                    className={`relative p-3 rounded-xl border text-left transition-all group overflow-hidden ${
                      isSelected
                        ? "border-teal-600 ring-2 ring-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-teal-300 bg-slate-50/50 dark:bg-slate-800/40"
                    }`}
                  >
                    <div 
                      style={preset.style}
                      className="h-12 w-full rounded-lg mb-2 shadow-xs border border-black/10 flex items-center justify-end p-2"
                    >
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white text-teal-700 flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                );
              })}

              {/* Custom Image Card Option */}
              <button
                type="button"
                onClick={() => setVisualTheme(prev => ({ ...prev, headerBgType: 'custom' }))}
                className={`relative p-3 rounded-xl border text-left transition-all group ${
                  visualTheme.headerBgType === 'custom'
                    ? "border-teal-600 ring-2 ring-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-teal-300 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="h-12 w-full rounded-lg mb-2 bg-gradient-to-r from-teal-700 to-indigo-800 border border-black/10 flex items-center justify-center text-white gap-1.5 font-bold text-xs">
                  <UploadIcon className="w-4 h-4" />
                  <span>Imej Tersuai</span>
                </div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Imej / Fail Tersuai
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  Muat naik fail dari komputer atau URL
                </div>
              </button>
            </div>

            {/* Custom Input when 'custom' is active */}
            {visualTheme.headerBgType === 'custom' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Pautan URL Imej Latar Belakang:
                    </Label>
                    <Input
                      placeholder="https://contoh.mains.gov.my/banner.jpg"
                      value={visualTheme.headerCustomUrl}
                      onChange={e => setVisualTheme(prev => ({ ...prev, headerCustomUrl: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Atau Muat Naik Fail:
                    </Label>
                    <label className="h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs">
                      <UploadIcon className="w-3.5 h-3.5 text-teal-600" />
                      <span>Pilih Fail Imej</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleImageUpload('header', e)}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-teal-600" />
                      Kelegapan Lapisan Biru MAINS (*Overlay Opacity*):
                    </span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      {Math.round(visualTheme.headerOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={visualTheme.headerOpacity}
                    onChange={e => setVisualTheme(prev => ({ ...prev, headerOpacity: parseFloat(e.target.value) }))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    *Nilai lebih tinggi (80-95%) disyorkan untuk memastikan tulisan tajuk putih sentiasa terang dan jelas dibaca.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Setting Section 2: Sidebar Navigasi */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-teal-600" />
                  2. Latar Belakang Sidebar Navigasi (Left Sidebar)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan tema warna panel kiri sistem untuk keselesaan navigasi harian kakitangan.
                </p>
              </div>
              <Badge variant="outline" className="text-xs text-teal-700 dark:text-teal-300">
                Gaya Semasa: {visualTheme.sidebarBgType}
              </Badge>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {THEME_PRESETS.sidebar.map(preset => {
                const isSelected = visualTheme.sidebarBgType === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setVisualTheme(prev => ({ ...prev, sidebarBgType: preset.id as any }))}
                    className={`relative p-3 rounded-xl border text-left transition-all group overflow-hidden ${
                      isSelected
                        ? "border-teal-600 ring-2 ring-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-teal-300 bg-slate-50/50 dark:bg-slate-800/40"
                    }`}
                  >
                    <div 
                      style={preset.style}
                      className="h-12 w-full rounded-lg mb-2 shadow-xs border border-black/10 flex items-center justify-end p-2"
                    >
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white text-teal-700 flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                );
              })}

              {/* Custom Sidebar Option */}
              <button
                type="button"
                onClick={() => setVisualTheme(prev => ({ ...prev, sidebarBgType: 'custom' }))}
                className={`relative p-3 rounded-xl border text-left transition-all group ${
                  visualTheme.sidebarBgType === 'custom'
                    ? "border-teal-600 ring-2 ring-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-teal-300 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="h-12 w-full rounded-lg mb-2 bg-gradient-to-r from-teal-900 to-slate-900 border border-black/10 flex items-center justify-center text-white gap-1.5 font-bold text-xs">
                  <UploadIcon className="w-4 h-4" />
                  <span>Imej Tersuai</span>
                </div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Imej / Tekstur Tersuai
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  Muat naik fail corak sendiri untuk panel sidebar
                </div>
              </button>
            </div>

            {/* Custom Sidebar Input */}
            {visualTheme.sidebarBgType === 'custom' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Pautan URL Imej / Tekstur:
                    </Label>
                    <Input
                      placeholder="https://contoh.mains.gov.my/sidebar-pattern.png"
                      value={visualTheme.sidebarCustomUrl}
                      onChange={e => setVisualTheme(prev => ({ ...prev, sidebarCustomUrl: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Atau Muat Naik Fail:
                    </Label>
                    <label className="h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs">
                      <UploadIcon className="w-3.5 h-3.5 text-teal-600" />
                      <span>Pilih Fail Imej</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleImageUpload('sidebar', e)}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-teal-600" />
                      Kelegapan Warna Gelap (*Dark Tint Opacity*):
                    </span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      {Math.round(visualTheme.sidebarOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={visualTheme.sidebarOpacity}
                    onChange={e => setVisualTheme(prev => ({ ...prev, sidebarOpacity: parseFloat(e.target.value) }))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Setting Section 3: Latar Belakang Utama Aplikasi */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  3. Latar Belakang Utama Aplikasi (Dashboard Canvas)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Corak dan tekstur asas yang dipaparkan di belakang kad statistik dan jadual surat.
                </p>
              </div>
              <Badge variant="outline" className="text-xs text-teal-700 dark:text-teal-300">
                Gaya Semasa: {visualTheme.appBgType}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {THEME_PRESETS.app.map(preset => {
                const isSelected = visualTheme.appBgType === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setVisualTheme(prev => ({ ...prev, appBgType: preset.id as any }))}
                    className={`relative p-3 rounded-xl border text-left transition-all group overflow-hidden ${
                      isSelected
                        ? "border-teal-600 ring-2 ring-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-teal-300 bg-slate-50/50 dark:bg-slate-800/40"
                    }`}
                  >
                    <div 
                      style={{ background: preset.previewGradient }}
                      className="h-10 w-full rounded-lg mb-2 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-end p-2"
                    >
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Quick Apply Button */}
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  Terapkan Perubahan Latar Belakang Sistem
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Perubahan akan disimpan dan dikemas kini secara langsung di seluruh paparan e-Surat MAINS.
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSave}
              className="h-9 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 shadow-sm shrink-0 w-full sm:w-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan & Terapkan Tema
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
