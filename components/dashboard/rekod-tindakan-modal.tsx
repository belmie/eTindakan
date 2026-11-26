"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { N } from "@/lib/org-data";
import { SuratItem } from "@/lib/sla-utils";
import { CheckCircle, Play, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface RekodTindakanModalProps {
  surat: SuratItem | null;
  role: string;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedSurat: any) => void;
}

export function RekodTindakanModal({
  surat,
  role,
  token,
  open,
  onOpenChange,
  onSuccess
}: RekodTindakanModalProps) {
  const [statusTindakan, setStatusTindakan] = useState<'sedang' | 'telah'>('sedang');
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  if (!surat) return null;

  const currentEntry = (surat.penerima || {})[role];

  const handleSimpan = async () => {
    if (statusTindakan === 'telah' && !catatan.trim()) {
      toast.error("Catatan penyelesaian diperlukan untuk menandakan tindakan selesai.");
      return;
    }

    setLoading(true);
    try {
      const isRealDbSurat = typeof surat.id === 'number' || (!String(surat.id).startsWith('demo') && !isNaN(Number(surat.id)));
      if (token && isRealDbSurat) {
        try {
          const res = await fetch(`/api/surat/${surat.id}/rekod-tindakan`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              peranan: role,
              statusTindakan: statusTindakan,
              catatan: catatan.trim()
            })
          });

          if (res.ok) {
            const updated = await res.json();
            toast.success(statusTindakan === 'telah' ? "Tindakan direkod sebagai Selesai ✔" : "Status dikemaskini: Sedang Diambil Tindakan");
            onSuccess(updated);
            onOpenChange(false);
            setCatatan("");
            return;
          }
        } catch (apiErr) {
          console.warn("Backend tindakan fail, falling back locally:", apiErr);
        }
      }

      // Local update fallback for demo letters
      const updatedPenerima = { ...(surat.penerima || {}) };
      const todayStr = new Date().toISOString().slice(0, 10);
      if (updatedPenerima[role]) {
        updatedPenerima[role] = {
          ...updatedPenerima[role],
          status: statusTindakan,
          catatan: catatan.trim()
        };
      } else {
        updatedPenerima[role] = {
          status: statusTindakan,
          dari: null,
          tarikh: todayStr,
          arahan: 'Tindakan cawangan',
          catatan: catatan.trim()
        };
      }
      const updatedLog = [
        ...(surat.log || []),
        {
          jenis: statusTindakan === 'telah' ? ('selesai' as const) : ('sedang' as const),
          dari: role,
          kepada: [],
          teks: catatan.trim() || (statusTindakan === 'sedang' ? 'Tindakan dimulakan' : 'Tindakan selesai'),
          masa: new Date().toISOString(),
          oleh: N[role]?.ketua || role
        }
      ];
      const activeEntries = Object.entries(updatedPenerima).filter(([, v]) => v.status !== 'diturunkan');
      const allDone = activeEntries.length > 0 && activeEntries.every(([, v]) => v.status === 'telah');
      const updatedSurat = {
        ...surat,
        penerima: updatedPenerima,
        log: updatedLog,
        tarikhSelesai: allDone ? todayStr : (statusTindakan === 'telah' ? todayStr : surat.tarikhSelesai)
      };
      toast.success(statusTindakan === 'telah' ? "Tindakan direkod sebagai Selesai ✔" : "Status dikemaskini: Sedang Diambil Tindakan");
      onSuccess(updatedSurat);
      onOpenChange(false);
      setCatatan("");
    } catch (err: any) {
      toast.error(err.message || "Ralat sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            Kemaskini Status Tindakan Surat
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="font-mono font-semibold text-teal-700 dark:text-teal-400">{surat.noDaftar}</div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">{surat.perkara}</div>
            <div className="text-slate-500 text-[11px]">
              Tindakan bagi: <span className="font-semibold text-slate-700 dark:text-slate-200">{N[role]?.nama || role}</span>
            </div>
            {currentEntry?.arahan && (
              <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 italic">
                “{currentEntry.arahan}”
              </div>
            )}
          </div>

          {/* Status Choice */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Pilih Peringkat Status:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatusTindakan('sedang')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                  statusTindakan === 'sedang'
                    ? "bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <Play className="w-4 h-4 fill-amber-500 text-amber-500" />
                Sedang Diambil Tindakan
              </button>

              <button
                type="button"
                onClick={() => setStatusTindakan('telah')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                  statusTindakan === 'telah'
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Telah Diambil Tindakan
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Catatan / Laporan Tindakan {statusTindakan === 'telah' && <span className="text-red-500">*</span>}</span>
              {statusTindakan === 'telah' && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Wajib diisi untuk selesai
                </span>
              )}
            </label>
            <Textarea
              rows={3}
              placeholder={
                statusTindakan === 'telah'
                  ? "cth. Surat jawapan rasmi telah dikeluarkan pada 15 Nov 2026, fail ditutup."
                  : "cth. Mesyuarat penyelarasan telah dipanggil, draf minit dalam penyediaan."
              }
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              className="text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleSimpan}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
          >
            {loading ? "Menyimpan..." : "Simpan Tindakan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
