"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SuratItem, nextNoDaftar, today, addD, fmtD, heurInfo } from "@/lib/sla-utils";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Layers
} from "lucide-react";
import { toast } from "sonner";

interface SuratFormAdvancedProps {
  token: string | null;
  existingSurat: SuratItem[];
  onSuccess: (newSurat?: any) => void;
}

const KATEGORI_OPTIONS = [
  "Pentadbiran",
  "Zakat",
  "Wakaf",
  "Kewangan",
  "Aduan",
  "Jemputan",
  "ICT",
  "Lain-lain"
];

const KEUTAMAAN_OPTIONS = ["Biasa", "Segera", "Sangat Segera"] as const;

export function SuratFormAdvanced({ token, existingSurat, onSuccess }: SuratFormAdvancedProps) {
  const [mode, setMode] = useState<'satu' | 'pukal'>('satu');

  // Single mode state
  const [perkara, setPerkara] = useState("");
  const [pengirim, setPengirim] = useState("");
  const [noRujukan, setNoRujukan] = useState("");
  const [tarikhSurat, setTarikhSurat] = useState("");
  const [tarikhTerima, setTarikhTerima] = useState(today());
  const [kategori, setKategori] = useState("Pentadbiran");
  const [keutamaan, setKeutamaan] = useState<'Biasa' | 'Segera' | 'Sangat Segera'>("Biasa");
  const [catatan, setCatatan] = useState("");
  const [suratBerkaitanId, setSuratBerkaitanId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bulk mode state
  const [bulkRows, setBulkRows] = useState<Array<{
    id: number;
    file: File | null;
    perkara: string;
    pengirim: string;
    noRujukan: string;
    tarikhSurat: string;
    kategori: string;
    keutamaan: 'Biasa' | 'Segera' | 'Sangat Segera';
  }>>([]);
  const [bulkCommonPengirim, setBulkCommonPengirim] = useState("");
  const [bulkCommonKategori, setBulkCommonKategori] = useState("Pentadbiran");

  // Handle single file upload and heuristic extraction
  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);

    // Heuristics from filename
    const info = heurInfo("", selectedFile.name);
    if (!perkara && info.perkara) setPerkara(info.perkara);
    if (!pengirim && info.pengirim) setPengirim(info.pengirim);
    if (!noRujukan && info.noRujukan) setNoRujukan(info.noRujukan);
    if (info.kategori) setKategori(info.kategori);

    setAutoFilled(true);
    toast.success("Maklumat surat telah diisi secara automatik berdasarkan nama fail.");
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perkara.trim() || !pengirim.trim()) {
      toast.error("Sila isi Perkara dan Pengirim.");
      return;
    }

    setLoading(true);
    try {
      const generatedNoDaftar = nextNoDaftar(tarikhTerima, existingSurat);
      const formData = new FormData();
      formData.append("no_daftar", generatedNoDaftar);
      formData.append("subjek", perkara.trim());
      formData.append("pengirim", pengirim.trim());
      formData.append("no_rujukan", noRujukan.trim() || "-");
      formData.append("tarikh_terima", tarikhTerima);
      formData.append("tarikh_surat", tarikhSurat || tarikhTerima);
      formData.append("kategori", kategori);
      formData.append("keutamaan", keutamaan);
      formData.append("catatan", catatan.trim());
      if (suratBerkaitanId) {
        formData.append("surat_berkaitan_id", suratBerkaitanId);
      }

      const initialPenerima = {
        su: {
          status: "akan",
          dari: null,
          tarikh: tarikhTerima,
          arahan: "Surat baharu didaftarkan & diserahkan kepada Setiausaha"
        }
      };
      formData.append("penerima_data", JSON.stringify(initialPenerima));

      if (file) {
        formData.append("lampiran", file);
      }

      const res = await fetch("/api/surat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal mendaftar surat");
      }

      const newSurat = await res.json();
      toast.success(`Surat ${generatedNoDaftar} berjaya didaftarkan dan dihantar ke Peti Minit Setiausaha!`);
      onSuccess(newSurat);
    } catch (err: any) {
      toast.error(err.message || "Ralat mendaftar surat");
    } finally {
      setLoading(false);
    }
  };

  // Bulk add files
  const handleBulkFiles = (files: FileList) => {
    const newRows = Array.from(files).map((f, i) => {
      const info = heurInfo("", f.name);
      return {
        id: Date.now() + i,
        file: f,
        perkara: info.perkara || f.name.replace(/\.[^.]+$/, ""),
        pengirim: info.pengirim || bulkCommonPengirim,
        noRujukan: info.noRujukan || "",
        tarikhSurat: today(),
        kategori: info.kategori || bulkCommonKategori,
        keutamaan: "Biasa" as const
      };
    });
    setBulkRows(prev => [...prev, ...newRows]);
    toast.success(`${files.length} fail ditambah ke senarai pendaftaran pukal.`);
  };

  const handleBulkSubmit = async () => {
    if (bulkRows.length === 0) return;

    setLoading(true);
    let successCount = 0;

    for (const r of bulkRows) {
      try {
        const formData = new FormData();
        formData.append("subjek", r.perkara.trim());
        formData.append("pengirim", (r.pengirim || bulkCommonPengirim || "Pengirim Tidak Dinyatakan").trim());
        formData.append("no_rujukan", r.noRujukan.trim() || "-");
        formData.append("tarikh_terima", tarikhTerima);
        formData.append("tarikh_surat", r.tarikhSurat || tarikhTerima);
        formData.append("kategori", r.kategori || bulkCommonKategori);
        formData.append("keutamaan", r.keutamaan);

        const initialPenerima = {
          su: {
            status: "akan",
            dari: null,
            tarikh: tarikhTerima,
            arahan: "Surat baharu didaftarkan (Pukal)"
          }
        };
        formData.append("penerima_data", JSON.stringify(initialPenerima));

        if (r.file) {
          formData.append("lampiran", r.file);
        }

        const res = await fetch("/api/surat", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (res.ok) successCount++;
      } catch (e) {
        console.warn("Failed bulk item:", e);
      }
    }

    setLoading(false);
    toast.success(`${successCount} daripada ${bulkRows.length} surat berjaya didaftarkan!`);
    setBulkRows([]);
    onSuccess();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Daftar Surat Masuk MAINS
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Surat yang didaftarkan akan terus masuk ke Peti Minit <b>Setiausaha MAINS</b> dengan tempoh SLA 14 hari.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs font-semibold">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMode('satu')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'satu'
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Satu Surat
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMode('pukal')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'pukal'
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Banyak Surat (Pukal)
          </motion.button>
        </div>
      </div>

      {mode === 'satu' ? (
        /* Single Form */
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={handleSingleSubmit}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs"
        >
          {/* File Upload Drop Area */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Muat Naik Dokumen Surat (PDF / Imej)
            </label>
            <div className="relative border-2 border-dashed border-teal-200 dark:border-teal-900/60 rounded-xl p-6 text-center hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all cursor-pointer group">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2 transition-transform group-hover:scale-110" />
              {file ? (
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{file.name}</div>
                  <div className="text-[11px] text-teal-600 mt-0.5">
                    {Math.round(file.size / 1024)} KB · Klik untuk tukar fail
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Klik untuk pilih fail atau heret fail ke sini
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    PDF atau imej dokumen surat · Perkara & rujukan diekstrak secara pintar
                  </div>
                </div>
              )}
            </div>

            <AnimatePresence>
              {autoFilled && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-[11px] font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                  Maklumat diisi secara automatik. Sila semak sebelum mendaftar.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Perkara / Tajuk Surat <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="cth. Permohonan bantuan zakat pendidikan asnaf"
                value={perkara}
                onChange={e => setPerkara(e.target.value)}
                className="text-xs h-9 font-medium"
              />
            </div>

            {/* Sender */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Pengirim / Organisasi <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="cth. Jabatan Hal Ehwal Agama Islam N. Sembilan"
                value={pengirim}
                onChange={e => setPengirim(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {/* Ref Number */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                No. Rujukan Pengirim
              </label>
              <Input
                placeholder="cth. JHEAINS/100/2/15"
                value={noRujukan}
                onChange={e => setNoRujukan(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>

            {/* Tarikh Surat */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Tarikh Pada Surat
              </label>
              <Input
                type="date"
                value={tarikhSurat}
                onChange={e => setTarikhSurat(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {/* Tarikh Terima */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Tarikh Diterima <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={tarikhTerima}
                onChange={e => setTarikhTerima(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Kategori
              </label>
              <select
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {KATEGORI_OPTIONS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Keutamaan */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Keutamaan
              </label>
              <select
                value={keutamaan}
                onChange={e => setKeutamaan(e.target.value as any)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {KEUTAMAAN_OPTIONS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Surat Berkaitan / Pautan Rujukan */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Pautan Surat Rujukan / Kes Terdahulu (Pilihan)</span>
                <span className="text-[10px] text-slate-400 font-normal">cth. surat jawapan atau tindakan susulan</span>
              </label>
              <select
                value={suratBerkaitanId}
                onChange={e => setSuratBerkaitanId(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Tiada Pautan (Surat Baharu Bersendirian) --</option>
                {existingSurat.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.noDaftar} — {s.perkara} ({s.pengirim})
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Catatan Pendaftar
              </label>
              <Textarea
                rows={2}
                placeholder="Catatan tambahan (pilihan)..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              Tarikh akhir SLA automatik: <b>{fmtD(addD(tarikhTerima, 14))}</b> (14 hari)
            </span>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs h-9 px-4 gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? "Menyimpan Surat..." : "Daftar & Hantar ke Setiausaha"}
            </Button>
          </div>
        </motion.form>
      ) : (
        /* Bulk Mode */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs"
        >
          {/* Common attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Tarikh Diterima (Semua) <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={tarikhTerima}
                onChange={e => setTarikhTerima(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Pengirim Biasa (Pilihan)
              </label>
              <Input
                placeholder="Jika sama untuk semua surat"
                value={bulkCommonPengirim}
                onChange={e => setBulkCommonPengirim(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Kategori Biasa
              </label>
              <select
                value={bulkCommonKategori}
                onChange={e => setBulkCommonKategori(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                {KATEGORI_OPTIONS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Multiple File Drop Area */}
          <div className="relative border-2 border-dashed border-teal-200 dark:border-teal-900/60 rounded-xl p-6 text-center hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all cursor-pointer">
            <input
              type="file"
              multiple
              accept="application/pdf,image/*"
              onChange={e => e.target.files && handleBulkFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Klik untuk pilih BANYAK fail serentak
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Setiap fail akan menjadi satu pendaftaran surat berasingan
            </div>
          </div>

          {/* Bulk Rows List */}
          {bulkRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Senarai Surat ({bulkRows.length} fail sedia didaftarkan)
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setBulkRows([])}
                  className="text-xs text-red-600 hover:text-red-700 h-7"
                >
                  Kosongkan Senarai
                </Button>
              </div>

              <div className="space-y-2">
                {bulkRows.map((r, idx) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex items-start gap-3"
                  >
                    <span className="font-mono font-bold text-slate-400 mt-2 shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Perkara surat..."
                          value={r.perkara}
                          onChange={e => {
                            const val = e.target.value;
                            setBulkRows(prev => prev.map(x => x.id === r.id ? { ...x, perkara: val } : x));
                          }}
                          className="text-xs h-8 font-medium"
                        />
                      </div>
                      <Input
                        placeholder={bulkCommonPengirim ? `Pengirim (${bulkCommonPengirim})` : "Pengirim..."}
                        value={r.pengirim}
                        onChange={e => {
                          const val = e.target.value;
                          setBulkRows(prev => prev.map(x => x.id === r.id ? { ...x, pengirim: val } : x));
                        }}
                        className="text-xs h-8"
                      />
                      <Input
                        placeholder="No. Rujukan..."
                        value={r.noRujukan}
                        onChange={e => {
                          const val = e.target.value;
                          setBulkRows(prev => prev.map(x => x.id === r.id ? { ...x, noRujukan: val } : x));
                        }}
                        className="text-xs h-8 font-mono"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setBulkRows(prev => prev.filter(x => x.id !== r.id))}
                      className="text-slate-400 hover:text-red-600 h-8 w-8 p-0 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-end">
                <Button
                  onClick={handleBulkSubmit}
                  disabled={loading}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs h-9 px-4 gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {loading ? "Mendaftar Semua..." : `Daftar Semua (${bulkRows.length} Surat)`}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
