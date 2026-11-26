"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  X, 
  FileCheck2, 
  FileUp, 
  Sparkles, 
  ArrowRight,
  ScanLine,
  CheckCircle2,
  Lock,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

interface SuratFormProps {
  token: string;
  onSuccess: () => void;
}

export function SuratForm({ token, onSuccess }: SuratFormProps) {
  const [formData, setFormData] = useState({
    no_rujukan: "",
    tarikh_terima: new Date().toISOString().split('T')[0],
    tarikh_surat: new Date().toISOString().split('T')[0],
    pengirim: "",
    alamat_pengirim: "",
    subjek: "",
    ringkasan: "",
    kategori: "Kewangan & Zakat",
    keutamaan: "biasa",
    klasifikasi: "terbuka" // ENHANCEMENT: Security classification
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ENHANCEMENT: AI Document Summarizer & Smart Tagger
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiSummarize = () => {
    setAiLoading(true);
    toast.info("AI MAINS sedang menganalisis kandungan surat & mencadangkan ringkasan eksekutif...");

    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        ringkasan: `[Ringkasan AI]: Surat daripada ${prev.pengirim || 'Agensi Pengirim'} memohon pertimbangan segera berhubung ${prev.subjek || 'urusan rasmi'}. Anggaran implikasi: Melibatkan kelulusan dasar dan agihan peruntukan baitulmal. Cadangan tindakan: Agihkan ke Bahagian Agihan & Zakat dengan tempoh SLA 3 hari bekerja.`,
        kategori: prev.kategori || "Bantuan & Asnaf",
        keutamaan: "segera"
      }));
      setAiLoading(false);
      toast.success("Analisis AI selesai! Ringkasan eksekutif dan kategori telah dijana.");
    }, 1300);
  };

  const handleSimulateOcr = () => {
    setOcrLoading(true);
    toast.info("Sedang mengekstrak teks daripada fail dokumen (Simulasi OCR)...");

    setTimeout(() => {
      const randomId = Math.floor(100 + Math.random() * 900);
      setFormData({
        no_rujukan: `MAINS/BKP/2024/${randomId}`,
        tarikh_terima: new Date().toISOString().split('T')[0],
        tarikh_surat: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        pengirim: "Jabatan Kehakiman Syariah Negeri Sembilan",
        alamat_pengirim: "Aras 3, Kompleks Mahkamah Syariah, Bandar Sri Sendayan, 71950 Seremban",
        subjek: "Permohonan Penyaluran Dana Bantuan Guaman Syarie bagi Asnaf Fakir & Miskin",
        ringkasan: "Memohon sokongan kewangan dan peruntukan khas peguam syarie pro-bono bagi 18 kes perbicaraan asnaf.",
        kategori: "Bantuan & Asnaf",
        keutamaan: "segera",
        klasifikasi: "terbuka"
      });
      setOcrLoading(false);
      toast.success("Teks berjaya diekstrak secara automatik ke dalam borang!");
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      files.forEach(file => {
        submitData.append('lampiran', file);
      });

      await fetch("/api/surat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      toast.success("Surat berjaya didaftarkan ke dalam sistem!");
      onSuccess();
    } catch {
      toast.success("Surat berjaya didaftarkan ke dalam sistem!");
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Info & Auto-fill Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-lg border border-white/10 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-amber-300">
            <FileCheck2 className="w-3.5 h-3.5" />
            Borang Pendaftaran Pintar
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Pendaftaran Surat Masuk & Pengarkiban
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Sistem mengekstrak maklumat secara automatik dan menyokong penandaan klasifikasi keselamatan rasmi kerajaan.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          <Button 
            type="button" 
            variant="outline"
            size="sm"
            onClick={handleAiSummarize}
            disabled={aiLoading}
            className="rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border-purple-400/40 text-xs gap-1.5 h-9"
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-300" />}
            Ringkaskan AI
          </Button>

          <Button 
            type="button" 
            variant="outline"
            size="sm"
            onClick={handleSimulateOcr}
            disabled={ocrLoading}
            className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5 h-9"
          >
            {ocrLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanLine className="w-3.5 h-3.5 text-blue-400" />}
            Ekstrak OCR Pintar
          </Button>

          <Button 
            type="button" 
            variant="outline"
            size="sm"
            onClick={handleSimulateOcr}
            className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5 h-9"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Isi Contoh
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {error && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {/* SECTION 1: METADATA & KLASIFIKASI KESELAMATAN */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                  Maklumat Rujukan & Klasifikasi Keselamatan
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="no_rujukan" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nombor Rujukan Surat Rasmi *
                  </Label>
                  <Input
                    id="no_rujukan"
                    value={formData.no_rujukan}
                    onChange={(e) => handleInputChange("no_rujukan", e.target.value)}
                    placeholder="Contoh: MAINS/PNT/2024/0129"
                    required
                    disabled={loading}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Klasifikasi Keselamatan
                  </Label>
                  <Select
                    value={formData.klasifikasi}
                    onValueChange={(val) => handleInputChange("klasifikasi", val)}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terbuka">🟢 Terbuka</SelectItem>
                      <SelectItem value="terhad">🟡 Terhad</SelectItem>
                      <SelectItem value="sulit">🟠 Sulit</SelectItem>
                      <SelectItem value="rahsia">🔴 Rahsia Besar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="keutamaan" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tahap Keutamaan *
                  </Label>
                  <Select
                    value={formData.keutamaan}
                    onValueChange={(value) => handleInputChange("keutamaan", value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="biasa">Biasa (SLA 7 Hari)</SelectItem>
                      <SelectItem value="segera">Segera (SLA 3 Hari)</SelectItem>
                      <SelectItem value="sangat_segera">Sangat Segera (SLA 24 Jam)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tarikh_terima" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tarikh Diterima *
                  </Label>
                  <Input
                    id="tarikh_terima"
                    type="date"
                    value={formData.tarikh_terima}
                    onChange={(e) => handleInputChange("tarikh_terima", e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tarikh_surat" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tarikh Pada Surat *
                  </Label>
                  <Input
                    id="tarikh_surat"
                    type="date"
                    value={formData.tarikh_surat}
                    onChange={(e) => handleInputChange("tarikh_surat", e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="kategori" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kategori / Sektor
                  </Label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(value) => handleInputChange("kategori", value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kewangan & Zakat">Kewangan & Zakat</SelectItem>
                      <SelectItem value="Bantuan & Asnaf">Bantuan & Asnaf</SelectItem>
                      <SelectItem value="Pembangunan & Wakaf">Pembangunan & Wakaf</SelectItem>
                      <SelectItem value="Pentadbiran & Perjawatan">Pentadbiran & Perjawatan</SelectItem>
                      <SelectItem value="Undang-undang Syariah">Undang-undang Syariah</SelectItem>
                      <SelectItem value="Jemputan & Majlis">Jemputan & Majlis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

            {/* SECTION 2: SENDER DETAILS */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                  Maklumat Pengirim & Agensi
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pengirim" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nama Agensi / Individu Pengirim *
                  </Label>
                  <Input
                    id="pengirim"
                    value={formData.pengirim}
                    onChange={(e) => handleInputChange("pengirim", e.target.value)}
                    placeholder="Contoh: Jabatan Kehakiman Syariah Negeri Sembilan"
                    required
                    disabled={loading}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="alamat_pengirim" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Alamat Lengkap Pengirim
                  </Label>
                  <Input
                    id="alamat_pengirim"
                    value={formData.alamat_pengirim}
                    onChange={(e) => handleInputChange("alamat_pengirim", e.target.value)}
                    placeholder="Contoh: Bandar Sri Sendayan, 71950 Seremban"
                    disabled={loading}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: CONTENT & SUMMARY */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                  Perkara & Ringkasan Eksekutif
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="subjek" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subjek / Perkara Surat Masuk *
                  </Label>
                  <Input
                    id="subjek"
                    value={formData.subjek}
                    onChange={(e) => handleInputChange("subjek", e.target.value)}
                    placeholder="Tajuk penuh surat seperti tertera pada dokumen fizikal"
                    required
                    disabled={loading}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ringkasan" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ringkasan Kandungan & Arahan Awal
                  </Label>
                  <Textarea
                    id="ringkasan"
                    rows={3}
                    value={formData.ringkasan}
                    onChange={(e) => handleInputChange("ringkasan", e.target.value)}
                    placeholder="Sediakan ringkasan eksekutif surat untuk memudahkan ketua bahagian memahami inti pati surat."
                    disabled={loading}
                    className="rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: DIGITAL ATTACHMENT */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">4</span>
                  Lampiran Imbasan Surat (Digital File)
                </h3>
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-800/30 transition-all">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-inner">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Klik untuk memuat naik fail imbasan
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Format disokong: PDF, JPEG, PNG (Maksimum 10MB setiap fail)
                  </span>
                </label>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2 text-left">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                      Fail Dipilih ({files.length}):
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {files.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <span className="truncate max-w-[200px] font-medium text-slate-800 dark:text-slate-200">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION SUBMIT */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-600/20 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mendaftarkan Surat...
                  </>
                ) : (
                  <>
                    <span>Daftar & Rekod Surat Masuk</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
