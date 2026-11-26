"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SuratItem, fmtD } from "@/lib/sla-utils";
import {
  Link2,
  Unlink,
  Search,
  CheckCircle2,
  FileText,
  Calendar,
  User,
  ArrowRight
} from "lucide-react";

interface LinkSuratModalProps {
  surat: SuratItem | null;
  allSurat: SuratItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveLink: (suratId: string | number, targetLetterId: string | number | null) => Promise<void> | void;
}

export function LinkSuratModal({
  surat,
  allSurat,
  open,
  onOpenChange,
  onSaveLink
}: LinkSuratModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);

  // Find current linked letter if any
  const currentLinkedLetter = useMemo(() => {
    if (!surat || !surat.surat_berkaitan_id) return null;
    return allSurat.find(s => String(s.id) === String(surat.surat_berkaitan_id)) || null;
  }, [surat, allSurat]);

  // Filter candidates: exclude self
  const candidates = useMemo(() => {
    if (!surat) return [];
    const term = searchTerm.toLowerCase().trim();
    return allSurat
      .filter(s => String(s.id) !== String(surat.id))
      .filter(s => {
        if (!term) return true;
        const noD = (s.noDaftar || "").toLowerCase();
        const noR = (s.noRujukan || "").toLowerCase();
        const sub = (s.perkara || "").toLowerCase();
        const pen = (s.pengirim || "").toLowerCase();
        return noD.includes(term) || noR.includes(term) || sub.includes(term) || pen.includes(term);
      })
      .slice(0, 30);
  }, [allSurat, surat, searchTerm]);

  if (!surat) return null;

  const handleLink = async (targetId: string | number | null) => {
    setLoading(true);
    try {
      await onSaveLink(surat.id, targetId);
      onOpenChange(false);
    } catch (err) {
      console.error("Gagal pautkan surat:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[88vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
            <Link2 className="w-5 h-5" />
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Pautkan Surat Berkaitan / Rujukan Kes
            </DialogTitle>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pautkan surat ini kepada surat rujukan terdahulu (contoh: surat susulan, jawapan, atau rayuan) untuk membina rantaian kronologi kes.
          </p>
        </DialogHeader>

        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Current Letter Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Surat Semasa
            </div>
            <div className="font-mono font-bold text-teal-700 dark:text-teal-400 mt-0.5">
              {surat.noDaftar}
            </div>
            <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
              {surat.perkara}
            </div>
          </div>

          {/* Current Link Status */}
          {surat.surat_berkaitan_id ? (
            <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold">
                  <Link2 className="w-4 h-4" />
                  <span>Sedang Dipautkan Kepada:</span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {currentLinkedLetter?.noDaftar || surat.berkaitan_no_daftar || `Surat ID #${surat.surat_berkaitan_id}`}
                </div>
                <div className="text-slate-600 dark:text-slate-300 line-clamp-2">
                  {currentLinkedLetter?.perkara || surat.berkaitan_perkara || "Perkara surat rujukan"}
                </div>
                {currentLinkedLetter && (
                  <div className="text-[11px] text-slate-500">
                    Pengirim: {currentLinkedLetter.pengirim} · Tarikh: {fmtD(currentLinkedLetter.tarikhSurat)}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="destructive"
                disabled={loading}
                onClick={() => handleLink(null)}
                className="h-7 text-xs gap-1 shrink-0 bg-red-600 hover:bg-red-700 text-white"
              >
                <Unlink className="w-3.5 h-3.5" />
                Nyahpaut
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs">
              Surat ini belum dipautkan ke mana-mana surat rujukan terdahulu. Sila cari dan pilih surat di bawah untuk memautkan rujukan.
            </div>
          )}

          {/* Search Box */}
          <div className="space-y-2 pt-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
              Pilih Surat Rujukan Terdahulu:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Cari No Daftar, No Rujukan, Perkara, atau Pengirim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Letter Candidates List */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
            {candidates.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Tiada surat yang sepadan dengan carian.
              </div>
            ) : (
              candidates.map((c) => {
                const isCurrent = String(c.id) === String(surat.surat_berkaitan_id);
                const isSelected = selectedId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-3 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-950/60 border-l-4 border-l-teal-600"
                        : isCurrent
                        ? "bg-blue-50/50 dark:bg-blue-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-700 dark:text-teal-400 text-[11px]">
                          {c.noDaftar}
                        </span>
                        {isCurrent && (
                          <Badge className="bg-blue-600 text-white text-[9px] px-1.5 py-0">
                            Pautan Semasa
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] text-slate-500">
                          {c.kategori}
                        </Badge>
                      </div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                        {c.perkara}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-3">
                        <span>Pengirim: {c.pengirim}</span>
                        <span>Tarikh: {fmtD(c.tarikhSurat)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      disabled={loading || isCurrent}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLink(c.id);
                      }}
                      className={`h-7 text-xs px-2.5 gap-1 shrink-0 ${
                        isSelected ? "bg-teal-600 hover:bg-teal-700 text-white" : ""
                      }`}
                    >
                      <Link2 className="w-3 h-3" />
                      {isCurrent ? "Dipautkan" : "Pautkan"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {candidates.length} surat tersedia untuk dipautkan
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
