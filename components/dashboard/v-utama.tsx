"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SuratItem,
  statusOf,
  lewat,
  hampir,
  dalamTempoh,
  baki,
  holdersTxt,
  due,
  fmtD,
  fmtDT,
  diff,
  addD,
  today,
  ST_CONFIG
} from "@/lib/sla-utils";
import { N, shortNm, isDesc } from "@/lib/org-data";
import {
  Inbox,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Bell,
  Send,
  Calendar,
  Layers
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface VUtamaProps {
  suratList: SuratItem[];
  onOpenSurat: (surat: SuratItem) => void;
  onNavigate: (view: string, filterStatus?: string, filterOrg?: string) => void;
  onSendBatchNotification: (letters: SuratItem[]) => void;
}

export function VUtama({
  suratList,
  onOpenSurat,
  onNavigate,
  onSendBatchNotification
}: VUtamaProps) {
  // Statistics
  const stats = useMemo(() => {
    let akan = 0;
    let sedang = 0;
    let telah = 0;
    let lewatCount = 0;
    let hampirCount = 0;
    let dlmCount = 0;

    suratList.forEach(s => {
      const st = statusOf(s);
      if (st === 'akan') akan++;
      else if (st === 'sedang') sedang++;
      else if (st === 'telah') telah++;

      if (lewat(s)) lewatCount++;
      if (hampir(s)) hampirCount++;
      if (dalamTempoh(s)) dlmCount++;
    });

    const pat = telah > 0 ? Math.round((dlmCount / telah) * 100) : null;

    return {
      jumlah: suratList.length,
      akan,
      sedang,
      telah,
      lewat: lewatCount,
      hampir: hampirCount,
      dlm: dlmCount,
      pematuhan: pat
    };
  }, [suratList]);

  // Overdue & Near-due priority list
  const priorityList = useMemo(() => {
    return suratList
      .filter(s => lewat(s) || hampir(s))
      .sort((a, b) => baki(a) - baki(b))
      .slice(0, 8);
  }, [suratList]);

  // Recent activity log
  const recentActivities = useMemo(() => {
    const list: { surat: SuratItem; log: any }[] = [];
    suratList.forEach(s => {
      (s.log || []).forEach(l => {
        list.push({ surat: s, log: l });
      });
    });
    return list.sort((a, b) => b.log.masa.localeCompare(a.log.masa)).slice(0, 6);
  }, [suratList]);

  // 14-day rolling trend chart
  const chartData = useMemo(() => {
    const t = today();
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = addD(t, -i);
      const label = `${d.slice(8)}/${d.slice(5, 7)}`;
      const diterima = suratList.filter(s => s.tarikhTerima === d).length;
      const selesai = suratList.filter(s => s.tarikhSelesai && s.tarikhSelesai.slice(0, 10) === d).length;
      result.push({ date: label, Diterima: diterima, Selesai: selesai });
    }
    return result;
  }, [suratList]);

  // Pejabat Timbalan Setiausaha breakdown
  const branchBreakdown = useMemo(() => {
    const branches = [
      { id: 'su', label: 'Terus di bawah Setiausaha', ketua: N['su']?.ketua },
      { id: 'tso', label: 'Pejabat TS (Operasi)', ketua: N['tso']?.ketua },
      { id: 'tsp', label: 'Pejabat TS (Pengurusan)', ketua: N['tsp']?.ketua }
    ];

    return branches.map(b => {
      const list = suratList.filter(s => {
        const keys = Object.keys(s.penerima || {});
        if (b.id === 'su') {
          return keys.includes('su') || (!keys.includes('tso') && !keys.includes('tsp'));
        }
        return keys.some(k => k === b.id || isDesc(k, b.id));
      });

      let akan = 0, sedang = 0, telah = 0, lwt = 0;
      list.forEach(s => {
        const st = statusOf(s);
        if (st === 'akan') akan++;
        else if (st === 'sedang') sedang++;
        else if (st === 'telah') telah++;
        if (lewat(s)) lwt++;
      });

      return {
        ...b,
        total: list.length,
        akan,
        sedang,
        telah,
        lewat: lwt
      };
    });
  }, [suratList]);

  return (
    <div className="space-y-6">
      {/* Page Title & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Assalamualaikum 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ringkasan keseluruhan surat masuk & pemantauan tindakan MAINS · {fmtD(today())}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onNavigate("daftar")}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-9 px-3.5 gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Daftar Surat
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("peti")}
            className="text-xs h-9 px-3.5 gap-1.5"
          >
            <Inbox className="w-3.5 h-3.5 text-teal-600" />
            Peti Minit
          </Button>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {/* Total */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.96 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("pantau", "semua")}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse-glow" />
            Jumlah Surat
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {stats.jumlah}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Semua berdaftar</div>
        </motion.div>

        {/* Akan */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.96 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("pantau", "akan")}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Akan Diambil
          </div>
          <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-200 mt-1">
            {stats.akan}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Belum mula</div>
        </motion.div>

        {/* Sedang */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.96 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("pantau", "sedang")}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Sedang Diambil
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {stats.sedang}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Dalam proses</div>
        </motion.div>

        {/* Telah */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.96 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("pantau", "telah")}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Telah Diambil
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.telah}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tindakan selesai</div>
        </motion.div>

        {/* Lewat */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.96 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("pantau", "lewat")}
          className={`p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 shadow-sm transition-shadow hover:shadow-md cursor-pointer group ${stats.lewat > 0 ? "ring-1 ring-red-500/30" : ""}`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
            <span className={`w-2 h-2 rounded-full bg-red-500 ${stats.lewat > 0 ? "animate-pulse-red" : ""}`} />
            Lewat &gt; 14 Hari
          </div>
          <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
            {stats.lewat}
          </div>
          <div className="text-[11px] text-red-500/80 mt-0.5">{stats.hampir} hampir tamat</div>
        </motion.div>

        {/* Pematuhan 14 Hari */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.96 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } }
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            Pematuhan 14H
          </div>
          <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 mt-1">
            {stats.pematuhan !== null ? `${stats.pematuhan}%` : "—"}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{stats.dlm}/{stats.telah} dalam tempoh</div>
        </motion.div>
      </motion.div>

      {/* Grid: Trend Chart & Urgent Attention */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Rolling 14-day chart */}
        <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Surat Diterima vs Diselesaikan
                </h3>
                <p className="text-[11px] text-slate-400">Aktiviti 14 hari terakhir</p>
              </div>
            </div>

            <div className="h-60 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b3d5c",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="Diterima" fill="#2a78d6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="Selesai" fill="#0aa3a3" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Perlu Perhatian Segera */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col card-hover-lift">
          <CardContent className="p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                Perlu Perhatian Segera
              </div>
              {priorityList.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendBatchNotification(priorityList)}
                  className="h-7 text-[11px] px-2.5 gap-1 border-red-300 text-red-700 dark:text-red-300 hover:bg-red-50"
                >
                  <Bell className="w-3 h-3" />
                  Peringatan
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
              {priorityList.length > 0 ? (
                priorityList.map(s => {
                  const rem = baki(s);
                  const isLwt = rem < 0;
                  return (
                    <motion.div
                      key={s.id}
                      whileHover={{ x: 3, transition: { duration: 0.15 } }}
                      onClick={() => onOpenSurat(s)}
                      className="pt-2 first:pt-0 flex items-start justify-between gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-600">
                          {s.perkara}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Pemegang: {holdersTxt(s)}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isLwt
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {isLwt ? `Lewat ${-rem} hari` : `Baki ${rem} hari`}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                  Alhamdulillah, tiada surat lewat atau menghampiri tarikh akhir.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grid: Recent Activities & Pejabat TS Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Aktiviti Terkini */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Aktiviti Minit & Tindakan Terkini
            </h3>
            <div className="space-y-3">
              {recentActivities.map(({ surat, log }, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  onClick={() => onOpenSurat(surat)}
                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    {log.jenis === 'minit' ? <Send className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {log.jenis === 'minit'
                        ? `Diminit: ${shortNm(log.dari || "")} → ${log.kepada?.map(shortNm).join(", ")}`
                        : log.teks || "Tindakan direkodkan"}
                    </div>
                    <div className="text-slate-500 text-[11px] truncate">{surat.perkara}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{fmtDT(log.masa)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pejabat Timbalan Setiausaha Breakdown */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Status Mengikut Pejabat Timbalan Setiausaha
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Peringkat</th>
                    <th className="p-3 text-right">Surat</th>
                    <th className="p-3">Agihan Status</th>
                    <th className="p-3 text-right">Lewat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {branchBreakdown.map(b => {
                    const total = b.total || 1;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => onNavigate("pantau", "semua", b.id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{b.label}</div>
                          <div className="text-[10px] text-slate-400">{b.ketua}</div>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">
                          {b.total}
                        </td>
                        <td className="p-3">
                          <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 w-28">
                            <div style={{ width: `${(b.telah / total) * 100}%` }} className="bg-emerald-500 transition-all duration-500" title={`Telah: ${b.telah}`} />
                            <div style={{ width: `${(b.sedang / total) * 100}%` }} className="bg-amber-500 transition-all duration-500" title={`Sedang: ${b.sedang}`} />
                            <div style={{ width: `${(b.akan / total) * 100}%` }} className="bg-slate-400 transition-all duration-500" title={`Akan: ${b.akan}`} />
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold" style={{ color: b.lewat ? "#d03b3b" : "inherit" }}>
                          {b.lewat}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-3 pt-1">
              <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Telah</span>
              <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Sedang</span>
              <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Akan</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
