"use client";

import { motion } from "motion/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { N, shortNm, depth, descendants } from "@/lib/org-data";
import {
  SuratItem,
  due,
  baki,
  lewat,
  hampir,
  statusOf,
  fmtD,
  fmtDT,
  ST_CONFIG
} from "@/lib/sla-utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bell,
  Eye,
  Calendar,
  User,
  ArrowRight,
  QrCode,
  Printer,
  Link2,
  ExternalLink
} from "lucide-react";

interface DetailDrawerProps {
  surat: SuratItem | null;
  role: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMinit: (surat: SuratItem) => void;
  onRekod: (surat: SuratItem) => void;
  onNotify: (surat: SuratItem) => void;
  onViewDoc: (surat: SuratItem) => void;
  onPrintSlip?: (surat: SuratItem) => void;
  onPrintMinute?: (surat: SuratItem) => void;
  onLinkSurat?: (surat: SuratItem) => void;
  onSelectSurat?: (surat: SuratItem) => void;
  allSurat?: SuratItem[];
}

export function DetailDrawer({
  surat,
  role,
  open,
  onOpenChange,
  onMinit,
  onRekod,
  onNotify,
  onViewDoc,
  onPrintSlip,
  onPrintMinute,
  onLinkSurat,
  onSelectSurat,
  allSurat = []
}: DetailDrawerProps) {
  if (!surat) return null;

  const st = statusOf(surat);
  const rem = baki(surat);
  const isLate = lewat(surat);
  const isNear = hampir(surat);
  const isDone = st === 'telah';

  // Find parent letter if linked
  const parentLetter = surat.surat_berkaitan_id
    ? allSurat.find(s => String(s.id) === String(surat.surat_berkaitan_id)) || null
    : null;

  // Find child letters (surat susulan / jawapan yang merujuk kepada surat ini)
  const childLetters = allSurat.filter(s => String(s.surat_berkaitan_id) === String(surat.id));

  const usedDays = Math.min(14, Math.max(0, 14 - rem));
  const pct = Math.max(5, Math.min(100, (usedDays / 14) * 100));

  const roleEntry = (surat.penerima || {})[role];
  const canAct = roleEntry && (roleEntry.status === 'akan' || roleEntry.status === 'sedang');
  const canMinit = descendants(role).length > 0 && canAct;

  const sortedReceivers = Object.entries(surat.penerima || {}).sort((a, b) => {
    return (N[a[0]]?.ord ?? 999) - (N[b[0]]?.ord ?? 999);
  });

  const sortedLogs = [...(surat.log || [])].sort((a, b) => a.masa.localeCompare(b.masa));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <SheetHeader className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
              {surat.noDaftar}
            </span>
            {surat.keutamaan !== "Biasa" && (
              <Badge variant={surat.keutamaan === "Sangat Segera" ? "destructive" : "secondary"} className={`text-[10px] ${surat.keutamaan === "Sangat Segera" ? "animate-pulse-red" : ""}`}>
                {surat.keutamaan}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] ml-auto">
              {surat.kategori}
            </Badge>
          </div>
          <SheetTitle className="text-base font-bold text-slate-900 dark:text-white mt-1 text-left line-clamp-2">
            {surat.perkara}
          </SheetTitle>
        </SheetHeader>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* SLA Days Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-600 dark:text-slate-300">Tempoh Tindakan (SLA 14 Hari):</span>
              <span className={isLate ? "text-red-600 font-extrabold" : isNear ? "text-amber-600 font-extrabold" : isDone ? "text-emerald-600 font-extrabold" : "text-teal-700 dark:text-teal-300 font-extrabold"}>
                {isDone
                  ? `Selesai ${surat.tarikhSelesai ? fmtD(surat.tarikhSelesai) : ""}`
                  : isLate
                  ? `Lewat ${-rem} hari`
                  : rem === 0
                  ? "Tamat hari ini"
                  : `Baki ${rem} hari`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isDone ? "bg-emerald-500" : isLate ? "bg-red-500" : isNear ? "bg-amber-500" : "bg-teal-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Official Document & Tracking Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {onPrintSlip && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPrintSlip(surat)}
                className="h-9 sm:h-8 text-[11px] gap-1 px-2 border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-300 justify-start sm:justify-center active:scale-95 transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">Slip QR & Rujukan (A5)</span>
              </Button>
            )}
            {onPrintMinute && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPrintMinute(surat)}
                className="h-9 sm:h-8 text-[11px] gap-1 px-2 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 justify-start sm:justify-center active:scale-95 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Cetak Lembaran Minit</span>
              </Button>
            )}
            {onLinkSurat && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onLinkSurat(surat)}
                className="h-9 sm:h-8 text-[11px] gap-1 px-2 border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 justify-start sm:justify-center active:scale-95 transition-all"
              >
                <Link2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{surat.surat_berkaitan_id ? "Pautan Kes Berkaitan" : "Pautkan Surat Rujukan"}</span>
              </Button>
            )}
          </div>

          {/* Role Action Banner */}
          {canAct && (
            <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex flex-wrap items-center justify-between gap-2 shadow-sm animate-fade-in">
              <span className="font-semibold text-teal-900 dark:text-teal-200">
                Tindakan anda ({shortNm(role)}):
              </span>
              <div className="flex items-center gap-1.5">
                {canMinit && (
                  <Button
                    size="sm"
                    onClick={() => onMinit(surat)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2.5 gap-1 active:scale-95 transition-all"
                  >
                    <Send className="w-3 h-3" />
                    Minit ke Bawah
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => onRekod(surat)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7 px-2.5 gap-1 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Rekod Tindakan
                </Button>
              </div>
            </div>
          )}

          {/* Metadata KV */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Maklumat Terperinci
            </h4>
            <div className="grid grid-cols-3 gap-2 py-1 text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-400">Pengirim:</span>
              <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">{surat.pengirim}</span>

              <span className="font-medium text-slate-400">No. Rujukan:</span>
              <span className="col-span-2 font-mono text-slate-800 dark:text-slate-200">{surat.noRujukan || "—"}</span>

              <span className="font-medium text-slate-400">Tarikh Surat:</span>
              <span className="col-span-2 text-slate-800 dark:text-slate-200">{fmtD(surat.tarikhSurat)}</span>

              <span className="font-medium text-slate-400">Tarikh Diterima:</span>
              <span className="col-span-2 text-slate-800 dark:text-slate-200">{fmtD(surat.tarikhTerima)}</span>

              <span className="font-medium text-slate-400">Tarikh Akhir (14H):</span>
              <span className="col-span-2 font-bold text-slate-800 dark:text-slate-200">{fmtD(due(surat))}</span>

              {surat.tarikhSelesai && (
                <>
                  <span className="font-medium text-slate-400">Tarikh Selesai:</span>
                  <span className="col-span-2 font-bold text-emerald-600">{fmtD(surat.tarikhSelesai)}</span>
                </>
              )}

              {surat.catatan && (
                <>
                  <span className="font-medium text-slate-400">Catatan:</span>
                  <span className="col-span-2 italic text-slate-700 dark:text-slate-300">{surat.catatan}</span>
                </>
              )}
            </div>
          </div>

          {/* Attachment Preview Box */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                Dokumen Lampiran
              </h4>
              {surat.lampiran?.url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDoc(surat)}
                  className="h-6 text-[11px] gap-1 px-2 text-teal-600"
                >
                  <Eye className="w-3 h-3" /> Lihat Fail
                </Button>
              )}
            </div>

            {surat.lampiran ? (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{surat.lampiran.nama}</div>
                    <div className="text-[10px] text-slate-400">Format: {surat.lampiran.jenis || "PDF/Imej"}</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onViewDoc(surat)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7 shrink-0"
                >
                  Buka
                </Button>
              </div>
            ) : (
              <div className="p-3 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Tiada dokumen dimuat naik untuk surat ini.
              </div>
            )}
          </div>

          {/* Rantaian Surat Berkaitan / Rujukan Kes (Urutan 3) */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-teal-600" />
                Rantaian Surat Berkaitan / Rujukan
              </h4>
              {onLinkSurat && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onLinkSurat(surat)}
                  className="h-6 text-[10px] text-teal-600 px-1.5"
                >
                  {surat.surat_berkaitan_id ? "Tukar Pautan" : "+ Pautkan"}
                </Button>
              )}
            </div>

            {/* Parent letter */}
            {surat.surat_berkaitan_id ? (
              <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Surat Rujukan Terdahulu
                  </span>
                  {parentLetter && onSelectSurat && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectSurat(parentLetter)}
                      className="h-5 text-[10px] text-blue-700 dark:text-blue-300 p-0 hover:underline gap-1"
                    >
                      Buka Surat <ExternalLink className="w-2.5 h-2.5" />
                    </Button>
                  )}
                </div>
                <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {parentLetter?.noDaftar || surat.berkaitan_no_daftar || `Surat ID #${surat.surat_berkaitan_id}`}
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                  {parentLetter?.perkara || surat.berkaitan_perkara || "Perkara rujukan"}
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-[11px] flex items-center justify-center gap-1.5">
                <span>Tiada rujukan terdahulu.</span>
                {onLinkSurat && (
                  <button
                    onClick={() => onLinkSurat(surat)}
                    className="text-teal-600 font-semibold hover:underline"
                  >
                    Pautkan sekarang
                  </button>
                )}
              </div>
            )}

            {/* Child Letters (Surat Susulan / Jawapan Berkaitan) */}
            {childLetters.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Surat Jawapan / Tindakan Susulan ({childLetters.length}):
                </div>
                <div className="space-y-1">
                  {childLetters.map(child => (
                    <div
                      key={child.id}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[10px] font-bold text-teal-700 dark:text-teal-400">
                          {child.noDaftar}
                        </div>
                        <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                          {child.perkara}
                        </div>
                      </div>
                      {onSelectSurat && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSelectSurat(child)}
                          className="h-6 text-[10px] text-teal-600 px-2 shrink-0"
                        >
                          Lihat
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Multi-level Status per Node */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Status Setiap Peringkat Cawangan
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
              {sortedReceivers.map(([orgId, entry]) => {
                const node = N[orgId];
                const conf = ST_CONFIG[entry.status] || ST_CONFIG.akan;
                const d = depth(orgId);
                return (
                  <div
                    key={orgId}
                    className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                    style={{ paddingLeft: `${Math.max(10, 10 + d * 12)}px` }}
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {node?.nama || orgId}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {node?.ketua} {entry.catatan ? `· ${entry.catatan}` : ""}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${conf.bg} ${conf.text}`}>
                      {conf.short}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chronological Timeline Audit Log */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 pb-6">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Kronologi Minit & Jejak Tindakan
            </h4>
            <div className="relative pl-5 border-l-2 border-slate-200 dark:border-slate-700 space-y-4 my-2">
              {sortedLogs.map((l, idx) => {
                const isMinit = l.jenis === 'minit';
                const isSelesai = l.jenis === 'selesai';
                const isNotif = l.jenis === 'notifikasi';
                const isSedang = l.jenis === 'sedang';

                return (
                  <div key={idx} className="relative group transition-all">
                    <div
                      className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 transition-transform group-hover:scale-125 ${
                        isSelesai
                          ? "bg-emerald-500"
                          : isMinit
                          ? "bg-blue-500"
                          : isSedang
                          ? "bg-amber-500"
                          : isNotif
                          ? "bg-purple-500"
                          : "bg-teal-500"
                      }`}
                    />
                    <div className="group-hover:translate-x-1 transition-transform">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {isMinit
                          ? `Diminit: ${shortNm(l.dari || "")} → ${l.kepada.map(shortNm).join(", ")}`
                          : isSelesai
                          ? `Tindakan Selesai (${shortNm(l.dari || "")})`
                          : isSedang
                          ? `Tindakan Dimulakan (${shortNm(l.dari || "")})`
                          : isNotif
                          ? "Pemberitahuan Dihantar"
                          : "Surat Didaftarkan"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {fmtDT(l.masa)} {l.oleh ? `· oleh ${l.oleh}` : ""}
                      </div>
                      {l.teks && (
                        <div className="mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                          {l.teks}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNotify(surat)}
            className="text-xs gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-teal-600" />
            Hantar Notifikasi
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Tutup
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
