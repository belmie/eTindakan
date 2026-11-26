"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SuratItem,
  statusOf,
  lewat,
  hampir,
  baki,
  due,
  fmtD,
  holdersTxt,
  ST_CONFIG
} from "@/lib/sla-utils";
import { ORDER, N, depth, isDesc } from "@/lib/org-data";
import { Search, Download, RefreshCw, Eye, FileText, CheckCircle2, Clock, Link2 } from "lucide-react";

interface VPantauProps {
  suratList: SuratItem[];
  initialStatus?: string;
  initialOrg?: string;
  onOpenDrawer: (surat: SuratItem) => void;
}

export function VPantau({
  suratList,
  initialStatus = "semua",
  initialOrg = "",
  onOpenDrawer
}: VPantauProps) {
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState(initialOrg);
  const [fromTarikh, setFromTarikh] = useState("");
  const [toTarikh, setToTarikh] = useState("");

  // Counts for pills
  const counts = useMemo(() => {
    let akan = 0, sedang = 0, telah = 0, lwt = 0, hmp = 0;
    suratList.forEach(s => {
      const st = statusOf(s);
      if (st === 'akan') akan++;
      else if (st === 'sedang') sedang++;
      else if (st === 'telah') telah++;

      if (lewat(s)) lwt++;
      if (hampir(s)) hmp++;
    });

    return {
      semua: suratList.length,
      akan,
      sedang,
      telah,
      lewat: lwt,
      hampir: hmp
    };
  }, [suratList]);

  // Filtered letters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suratList.filter(s => {
      if (statusFilter === 'lewat' && !lewat(s)) return false;
      if (statusFilter === 'hampir' && !hampir(s)) return false;
      if (['akan', 'sedang', 'telah'].includes(statusFilter) && statusOf(s) !== statusFilter) return false;

      if (orgFilter) {
        const keys = Object.keys(s.penerima || {});
        if (!keys.some(k => k === orgFilter || isDesc(k, orgFilter))) return false;
      }

      if (fromTarikh && s.tarikhTerima < fromTarikh) return false;
      if (toTarikh && s.tarikhTerima > toTarikh) return false;

      if (q) {
        const matchText = `${s.perkara} ${s.pengirim} ${s.noDaftar} ${s.noRujukan || ""}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      const aDone = statusOf(a) === 'telah';
      const bDone = statusOf(b) === 'telah';
      if (aDone !== bDone) return aDone ? 1 : -1;
      return aDone ? (b.tarikhSelesai || "").localeCompare(a.tarikhSelesai || "") : baki(a) - baki(b);
    });
  }, [suratList, statusFilter, orgFilter, fromTarikh, toTarikh, search]);

  const handleReset = () => {
    setStatusFilter("semua");
    setSearch("");
    setOrgFilter("");
    setFromTarikh("");
    setToTarikh("");
  };

  const handleExportCSV = () => {
    const headers = [
      "No. Daftar",
      "No. Rujukan",
      "Perkara",
      "Pengirim",
      "Kategori",
      "Keutamaan",
      "Tarikh Diterima",
      "Tarikh Akhir (14H)",
      "Tarikh Selesai",
      "Status",
      "Lewat",
      "Pemegang Semasa"
    ];

    const rows = filtered.map(s => [
      s.noDaftar,
      s.noRujukan || "",
      s.perkara,
      s.pengirim,
      s.kategori,
      s.keutamaan,
      s.tarikhTerima,
      due(s),
      s.tarikhSelesai || "",
      ST_CONFIG[statusOf(s)]?.label || "",
      lewat(s) ? "Ya" : "Tidak",
      holdersTxt(s)
    ]);

    const csvContent = "\ufeff" + [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `esurat-mains-pemantauan-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusPills = [
    { id: 'semua', label: 'Semua', count: counts.semua },
    { id: 'akan', label: 'Akan', count: counts.akan, dot: '#6f8ba3' },
    { id: 'sedang', label: 'Sedang', count: counts.sedang, dot: '#fab219' },
    { id: 'telah', label: 'Telah', count: counts.telah, dot: '#0ca30c' },
    { id: 'lewat', label: 'Lewat', count: counts.lewat, dot: '#d03b3b' },
    { id: 'hampir', label: 'Hampir Tamat', count: counts.hampir, dot: '#ec835a' },
  ];

  const orgOptions = ORDER.filter(id => N[id]?.jenis !== 'unit');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pemantauan Tindakan Surat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Semua surat dan status tindakan cawangan MAINS — tempoh tindakan 14 hari dari tarikh diterima.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCSV}
          className="text-xs h-9 gap-1.5 self-start sm:self-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          Muat Turun CSV (Excel)
        </Button>
      </div>

      {/* Status Chips Toolbar */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 w-max">
          {statusPills.map(p => (
            <motion.button
              key={p.id}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                statusFilter === p.id
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/60 dark:hover:bg-slate-700/50"
              }`}
            >
              {p.dot && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.dot }} />}
              {p.label}
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                statusFilter === p.id
                  ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}>
                {p.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Filter Inputs Toolbar */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari perkara, pengirim, no. daftar, rujukan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 w-full"
          />
        </div>

        <select
          value={orgFilter}
          onChange={e => setOrgFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto sm:max-w-[280px]"
        >
          <option value="">Semua Pejabat / Jabatan / Bahagian</option>
          {orgOptions.map(id => {
            const d = depth(id);
            return (
              <option key={id} value={id}>
                {" ".repeat(d)}{d > 0 ? "└ " : ""}{N[id]?.nama}
              </option>
            );
          })}
        </select>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="date"
            value={fromTarikh}
            onChange={e => setFromTarikh(e.target.value)}
            className="h-9 text-xs flex-1 sm:w-[135px]"
            title="Dari Tarikh Diterima"
          />
          <span className="text-slate-400 text-xs">-</span>
          <Input
            type="date"
            value={toTarikh}
            onChange={e => setToTarikh(e.target.value)}
            className="h-9 text-xs flex-1 sm:w-[135px]"
            title="Hingga Tarikh Diterima"
          />
        </div>

        {(search || orgFilter || fromTarikh || toTarikh || statusFilter !== "semua") && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="text-xs h-9 px-2.5 text-slate-500 hover:text-slate-900 gap-1 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Set Semula
          </Button>
        )}
      </div>

      <div className="text-[11px] text-slate-400">
        Memaparkan <b>{filtered.length}</b> surat daripada keseluruhan {suratList.length} rekod
      </div>

      {/* Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">No. Daftar / Perkara</th>
                <th className="p-3 hidden md:table-cell">Pengirim</th>
                <th className="p-3 whitespace-nowrap">Diterima</th>
                <th className="p-3 whitespace-nowrap hidden lg:table-cell">Tarikh Akhir</th>
                <th className="p-3">Tempoh SLA (14H)</th>
                <th className="p-3 hidden sm:table-cell">Pemegang Semasa</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length > 0 ? (
                filtered.map(s => {
                  const st = statusOf(s);
                  const rem = baki(s);
                  const isLwt = lewat(s);
                  const isNear = hampir(s);
                  const isDone = st === 'telah';

                  const used = Math.min(14, Math.max(0, 14 - rem));
                  const pct = Math.max(5, Math.min(100, (used / 14) * 100));

                  const stConf = ST_CONFIG[st] || ST_CONFIG.akan;

                  return (
                    <tr
                      key={s.id}
                      onClick={() => onOpenDrawer(s)}
                      className="hover:bg-teal-50/60 dark:hover:bg-teal-950/30 cursor-pointer transition-all duration-150 active:bg-teal-100/50"
                    >
                      <td className="p-3 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-400">
                            {s.noDaftar}
                          </span>
                          {s.surat_berkaitan_id && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-0.5 transition-transform hover:scale-105" title="Surat ini mempunyai rujukan kes terdahulu">
                              <Link2 className="w-2.5 h-2.5" />
                              Pautan
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                          {s.perkara}
                        </div>
                      </td>

                      <td className="p-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                        {s.pengirim}
                      </td>

                      <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {fmtD(s.tarikhTerima)}
                      </td>

                      <td className="p-3 whitespace-nowrap hidden lg:table-cell font-semibold text-slate-700 dark:text-slate-300">
                        {fmtD(due(s))}
                      </td>

                      <td className="p-3 min-w-[120px]">
                        <div className="font-bold text-[11px]" style={{ color: isDone ? "#0ca30c" : isLwt ? "#d03b3b" : isNear ? "#ec835a" : "inherit" }}>
                          {isDone ? "Selesai" : isLwt ? `Lewat ${-rem} hari` : rem === 0 ? "Tamat hari ini" : `Baki ${rem} hari`}
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${isDone ? "bg-emerald-500" : isLwt ? "bg-red-500" : isNear ? "bg-amber-500" : "bg-teal-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      <td className="p-3 hidden sm:table-cell text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                        {holdersTxt(s)}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stConf.bg} ${stConf.text}`}>
                            {stConf.short}
                          </span>
                          {isLwt && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse-red">
                              Lewat
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Tiada surat sepadan dengan kriteria carian atau penapis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
