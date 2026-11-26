"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { N, shortNm, descendants } from "@/lib/org-data";
import {
  SuratItem,
  baki,
  lewat,
  hampir,
  statusOf,
  nodeStatus,
  fmtD,
  ST_CONFIG
} from "@/lib/sla-utils";
import {
  Inbox,
  Send,
  CheckCircle2,
  Bell,
  Eye,
  FileText,
  Clock,
  ChevronRight,
  Info,
  Link2
} from "lucide-react";

interface VPetiProps {
  suratList: SuratItem[];
  role: string;
  onOpenDrawer: (surat: SuratItem) => void;
  onOpenMinit: (surat: SuratItem) => void;
  onOpenRekod: (surat: SuratItem) => void;
  onOpenNotify: (surat: SuratItem) => void;
  onViewDoc: (surat: SuratItem) => void;
}

export function VPeti({
  suratList,
  role,
  onOpenDrawer,
  onOpenMinit,
  onOpenRekod,
  onOpenNotify,
  onViewDoc
}: VPetiProps) {
  const [activeTab, setActiveTab] = useState<'perlu' | 'turun' | 'selesai'>('perlu');

  const node = N[role];

  // Filter letters assigned to this role
  const allAssigned = suratList.filter(s => (s.penerima || {})[role]);

  const g = {
    perlu: [] as SuratItem[],
    turun: [] as SuratItem[],
    selesai: [] as SuratItem[]
  };

  allAssigned.forEach(s => {
    const entry = s.penerima[role];
    if (entry.status === 'diturunkan') {
      g.turun.push(s);
    } else if (entry.status === 'telah') {
      g.selesai.push(s);
    } else {
      g.perlu.push(s);
    }
  });

  // Sort: Perlu & Turun by urgency (least days remaining first), Selesai by completed date
  g.perlu.sort((a, b) => baki(a) - baki(b));
  g.turun.sort((a, b) => baki(a) - baki(b));
  g.selesai.sort((a, b) => (b.tarikhSelesai || "").localeCompare(a.tarikhSelesai || ""));

  const currentList = g[activeTab];

  const hasDescendants = descendants(role).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Peti Minit — {node?.nama || role}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {node?.jaw}: <span className="font-semibold text-slate-700 dark:text-slate-300">{node?.ketua}</span> · Gunakan pemilih peranan di atas untuk menukar paparan cawangan lain.
        </p>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 w-max sm:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('perlu')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'perlu'
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Perlu Tindakan
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              {g.perlu.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('turun')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'turun'
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Telah Diminit
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              {g.turun.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('selesai')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'selesai'
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Selesai
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {g.selesai.length}
            </span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <AnimatePresence mode="wait">
        {currentList.length > 0 ? (
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {currentList.map(s => {
              const entry = s.penerima[role];
              const isTurun = entry.status === 'diturunkan';
              const myst = isTurun ? nodeStatus(s, role) || 'akan' : entry.status;
              const stConf = ST_CONFIG[myst] || ST_CONFIG.akan;

              const rem = baki(s);
              const isLwt = lewat(s) && entry.status !== 'telah';
              const isNear = hampir(s) && entry.status !== 'telah';
              const isDone = entry.status === 'telah';

              const used = Math.min(14, Math.max(0, 14 - rem));
              const pct = Math.max(5, Math.min(100, (used / 14) * 100));

              // Downstream recipients
              const childReceivers = isTurun
                ? Object.entries(s.penerima)
                    .filter(([, v]) => v.dari === role)
                    .map(([k]) => shortNm(k))
                    .join(", ")
                : "";

              return (
                <motion.div
                  key={s.id}
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.97 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 transition-shadow hover:shadow-lg ${
                    isTurun
                      ? "border-l-4 border-l-blue-500"
                      : isDone
                      ? "border-l-4 border-l-emerald-500"
                      : isLwt
                      ? "border-l-4 border-l-red-500 ring-1 ring-red-500/20"
                      : isNear
                      ? "border-l-4 border-l-amber-500"
                      : "border-l-4 border-l-teal-500"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top line badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-400">
                        {s.noDaftar}
                      </span>
                      {s.keutamaan !== "Biasa" && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.keutamaan === 'Sangat Segera' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                          {s.keutamaan}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {s.kategori}
                      </span>
                      {s.surat_berkaitan_id && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <Link2 className="w-2.5 h-2.5" />
                          Rujukan Kes
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${stConf.bg} ${stConf.text}`}>
                        {isTurun ? "Diminit" : stConf.short}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onOpenDrawer(s)}
                      className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-teal-600 transition-colors"
                    >
                      {s.perkara}
                    </h3>

                    {/* Meta */}
                    <div className="text-[11px] text-slate-500">
                      Daripada: <span className="font-semibold text-slate-700 dark:text-slate-300">{s.pengirim}</span> · Terima: {fmtD(s.tarikhTerima)}
                    </div>

                    {/* Supervisor Note */}
                    {entry.dari && (
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-teal-700 dark:text-teal-400">Minit {shortNm(entry.dari)}</span> ({fmtD(entry.tarikh)}):
                        <div className="italic mt-0.5">“{entry.arahan}”</div>
                      </div>
                    )}

                    {/* Downstream status */}
                    {isTurun && childReceivers && (
                      <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
                        Diminit kepada: <span className="font-bold">{childReceivers}</span>
                      </div>
                    )}

                    {/* SLA Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-400">SLA 14 Hari:</span>
                        <span className={isLwt ? "text-red-600 font-bold" : isNear ? "text-amber-600 font-bold" : isDone ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"}>
                          {isDone ? "Selesai" : isLwt ? `Lewat ${-rem} hari` : rem === 0 ? "Tamat hari ini" : `Baki ${rem} hari`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${isDone ? "bg-emerald-500" : isLwt ? "bg-red-500" : isNear ? "bg-amber-500" : "bg-teal-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                    {s.lampiran?.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDoc(s)}
                        className="text-xs h-7 px-2 gap-1 text-slate-600 hover:text-teal-600 active:scale-95 transition-transform"
                      >
                        <Eye className="w-3 h-3" />
                        Lihat
                      </Button>
                    )}

                    {hasDescendants && (entry.status === 'akan' || entry.status === 'sedang') && (
                      <Button
                        size="sm"
                        onClick={() => onOpenMinit(s)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2.5 gap-1 active:scale-95 transition-transform shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        Minit
                      </Button>
                    )}

                    {(entry.status === 'akan' || entry.status === 'sedang') && (
                      <Button
                        size="sm"
                        onClick={() => onOpenRekod(s)}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7 px-2.5 gap-1 active:scale-95 transition-transform shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Tindakan
                      </Button>
                    )}

                    {entry.status !== 'telah' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenNotify(s)}
                        className="text-xs h-7 px-2 text-slate-500 hover:text-slate-900 active:scale-95 transition-transform"
                      >
                        <Bell className="w-3 h-3" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onOpenDrawer(s)}
                      className="text-xs h-7 px-2 text-slate-600 hover:text-teal-600 ml-auto active:scale-95 transition-transform"
                    >
                      Butiran
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50"
          >
            <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2 animate-float-soft" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {activeTab === 'perlu' ? "Tiada surat menunggu tindakan anda." : "Tiada surat dalam senarai ini."}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'perlu' ? "Surat yang diminitkan kepada anda akan dipaparkan di sini." : "Semua rekod telah dikemaskini."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
