"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { N, depth, descendants, shortNm, JENIS_LBL } from "@/lib/org-data";
import { SuratItem } from "@/lib/sla-utils";
import { Send, FileText, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";

interface MinitModalProps {
  surat: SuratItem | null;
  role: string;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedSurat: any, chosenReceivers: string[]) => void;
}

const QUICK_CHIPS = [
  "Untuk tindakan segera",
  "Sila ambil tindakan sewajarnya",
  "Sila kaji & kemukakan syor",
  "Untuk makluman & tindakan",
  "Sila selaraskan & laporkan kepada saya",
  "Sila hadir / wakilkan",
  "Sila sediakan draf jawapan"
];

export function MinitModal({
  surat,
  role,
  token,
  open,
  onOpenChange,
  onSuccess
}: MinitModalProps) {
  const [selectedReceivers, setSelectedReceivers] = useState<string[]>([]);
  const [arahan, setArahan] = useState("");
  const [search, setSearch] = useState("");
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!surat) return null;

  const desc = descendants(role);
  const baseDepth = depth(role);

  const filteredNodes = desc.filter(d => {
    const node = N[d];
    if (!node) return false;
    const dd = depth(d) - baseDepth;
    const matchSearch = search.trim() === "" ||
      node.nama.toLowerCase().includes(search.toLowerCase()) ||
      node.ketua.toLowerCase().includes(search.toLowerCase());

    if (search.trim() !== "") return matchSearch;
    return showAllLevels || dd === 1 || selectedReceivers.includes(d);
  });

  const toggleReceiver = (id: string) => {
    setSelectedReceivers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleMinit = async () => {
    if (selectedReceivers.length === 0) {
      toast.error("Sila pilih sekurang-kurangnya satu penerima minit.");
      return;
    }
    if (!arahan.trim()) {
      toast.error("Sila nyatakan arahan minit.");
      return;
    }

    setLoading(true);
    try {
      const isRealDbSurat = typeof surat.id === 'number' || (!String(surat.id).startsWith('demo') && !isNaN(Number(surat.id)));
      if (token && isRealDbSurat) {
        try {
          const res = await fetch(`/api/surat/${surat.id}/minit-hierarki`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              dari: role,
              kepada: selectedReceivers,
              arahan: arahan.trim()
            })
          });

          if (res.ok) {
            const updated = await res.json();
            toast.success(`Minit berjaya dihantar kepada ${selectedReceivers.map(shortNm).join(", ")}`);
            onSuccess(updated, selectedReceivers);
            onOpenChange(false);
            setSelectedReceivers([]);
            setArahan("");
            return;
          }
        } catch (apiErr) {
          console.warn("Backend minit fail, falling back locally:", apiErr);
        }
      }

      // Local update fallback for demo letters
      const updatedPenerima = { ...(surat.penerima || {}) };
      if (updatedPenerima[role]) {
        updatedPenerima[role] = { ...updatedPenerima[role], status: 'diturunkan' };
      }
      const todayStr = new Date().toISOString().slice(0, 10);
      selectedReceivers.forEach(r => {
        updatedPenerima[r] = {
          status: 'akan',
          dari: role,
          tarikh: todayStr,
          arahan: arahan.trim(),
          catatan: ''
        };
      });
      const updatedLog = [
        ...(surat.log || []),
        {
          jenis: 'minit' as const,
          dari: role,
          kepada: selectedReceivers,
          teks: arahan.trim(),
          masa: new Date().toISOString(),
          oleh: N[role]?.ketua || role
        }
      ];
      const updatedSurat = {
        ...surat,
        penerima: updatedPenerima,
        log: updatedLog
      };
      toast.success(`Minit berjaya dihantar kepada ${selectedReceivers.map(shortNm).join(", ")}`);
      onSuccess(updatedSurat, selectedReceivers);
      onOpenChange(false);
      setSelectedReceivers([]);
      setArahan("");
    } catch (err: any) {
      toast.error(err.message || "Ralat menghantar minit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            <Send className="w-5 h-5 text-teal-600" />
            Minit Surat ke Peringkat Bawahan
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Info Card */}
          <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 text-xs text-slate-700 dark:text-slate-300">
            <div className="font-mono font-semibold text-teal-800 dark:text-teal-300">{surat.noDaftar}</div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{surat.perkara}</div>
            <div className="text-slate-500 mt-1">
              Minit oleh: <span className="font-semibold text-slate-700 dark:text-slate-200">{N[role]?.nama || role}</span> · Pengirim: {surat.pengirim}
            </div>
          </div>

          {/* Penerima Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label>Minit Kepada (Boleh pilih lebih daripada satu) <span className="text-red-500">*</span></label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 font-normal">
                <input
                  type="checkbox"
                  checked={showAllLevels}
                  onChange={e => setShowAllLevels(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                Papar semua cawangan di bawah
              </label>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari cawangan, bahagian, unit, atau nama ketua..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
              {filteredNodes.length > 0 ? (
                filteredNodes.map(d => {
                  const node = N[d];
                  const dd = depth(d) - baseDepth;
                  const isChecked = selectedReceivers.includes(d);
                  return (
                    <div
                      key={d}
                      onClick={() => toggleReceiver(d)}
                      className={`flex items-start gap-3 p-2.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${
                        isChecked ? "bg-teal-50/60 dark:bg-teal-950/20" : ""
                      }`}
                      style={{ paddingLeft: `${Math.max(12, 12 + (dd - 1) * 20)}px` }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <div className="text-xs flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${dd === 1 ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                            {node.nama}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                            {JENIS_LBL[node.jenis]}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {node.jaw}: {node.ketua}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Tiada unit bawahan dijumpai.
                </div>
              )}
            </div>
          </div>

          {/* Quick Arahan Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilihan Arahan Minit Pantas:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setArahan(chip)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                    arahan === chip
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Arahan Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Arahan / Ulasan Minit <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={3}
              placeholder="Tulis ulasan, arahan spesifik, atau panduan tindakan..."
              value={arahan}
              onChange={e => setArahan(e.target.value)}
              className="text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">
            {selectedReceivers.length} cawangan dipilih
          </div>
          <div className="flex items-center gap-2">
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
              onClick={handleMinit}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {loading ? "Menghantar..." : "Hantar Minit"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
