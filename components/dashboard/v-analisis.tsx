"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SuratItem,
  statusOf,
  lewat,
  dalamTempoh,
  diff,
  addD,
  today,
  pd,
  ymd,
  pad,
  BLN
} from "@/lib/sla-utils";
import { ORDER, N, JENIS_LBL, shortNm } from "@/lib/org-data";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { TrendingUp, BarChart3, Clock, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

interface VAnalisisProps {
  suratList: SuratItem[];
  onOpenSurat: (surat: SuratItem) => void;
  onFilterOrg: (orgId: string) => void;
}

export function VAnalisis({ suratList, onOpenSurat, onFilterOrg }: VAnalisisProps) {
  const [period, setPeriod] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('bulanan');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [levelFilter, setLevelFilter] = useState<'peringkat1' | 'bahagian' | 'unit'>('peringkat1');

  // Compute time buckets
  const buckets = useMemo(() => {
    const t = today();
    const B: { label: string; start: string; end: string }[] = [];

    if (period === 'harian') {
      for (let i = 13; i >= 0; i--) {
        const d = addD(t, -i);
        B.push({ label: `${d.slice(8)}/${d.slice(5, 7)}`, start: d, end: d });
      }
    } else if (period === 'mingguan') {
      const d0 = pd(t);
      const dow = (d0.getDay() + 6) % 7;
      const mon = addD(t, -dow);
      for (let i = 11; i >= 0; i--) {
        const a = addD(mon, -7 * i);
        B.push({ label: `${a.slice(8)}/${a.slice(5, 7)}`, start: a, end: addD(a, 6) });
      }
    } else if (period === 'bulanan') {
      for (let m = 0; m < 12; m++) {
        const a = `${selectedYear}-${pad(m + 1)}-01`;
        const e = new Date(selectedYear, m + 1, 0);
        B.push({ label: BLN[m], start: a, end: ymd(e) });
      }
    } else {
      const cy = new Date().getFullYear();
      for (let i = 4; i >= 0; i--) {
        const yy = cy - i;
        B.push({ label: String(yy), start: `${yy}-01-01`, end: `${yy}-12-31` });
      }
    }
    return B;
  }, [period, selectedYear]);

  // Window letters
  const startBound = buckets[0]?.start || "";
  const endBound = buckets[buckets.length - 1]?.end || "";

  const windowSurat = useMemo(() => {
    return suratList.filter(s => s.tarikhTerima >= startBound && s.tarikhTerima <= endBound);
  }, [suratList, startBound, endBound]);

  // Window Stats
  const stats = useMemo(() => {
    let akan = 0, sedang = 0, telah = 0, lwt = 0, dlm = 0;
    const selesaiList: number[] = [];

    windowSurat.forEach(s => {
      const st = statusOf(s);
      if (st === 'akan') akan++;
      else if (st === 'sedang') sedang++;
      else if (st === 'telah') {
        telah++;
        if (s.tarikhSelesai) {
          selesaiList.push(diff(s.tarikhTerima, s.tarikhSelesai));
        }
      }

      if (lewat(s)) lwt++;
      if (dalamTempoh(s)) dlm++;
    });

    const avgDays = selesaiList.length > 0
      ? (selesaiList.reduce((a, b) => a + b, 0) / selesaiList.length).toFixed(1)
      : "—";

    const pat = telah > 0 ? Math.round((dlm / telah) * 100) : null;

    return {
      total: windowSurat.length,
      akan,
      sedang,
      telah,
      lewat: lwt,
      avgDays,
      pematuhan: pat
    };
  }, [windowSurat]);

  // Trend Chart Data
  const trendData = useMemo(() => {
    return buckets.map(b => {
      const diterima = suratList.filter(s => s.tarikhTerima >= b.start && s.tarikhTerima <= b.end).length;
      const selesai = suratList.filter(s => s.tarikhSelesai && s.tarikhSelesai.slice(0, 10) >= b.start && s.tarikhSelesai.slice(0, 10) <= b.end).length;
      return {
        label: b.label,
        Diterima: diterima,
        Diselesaikan: selesai
      };
    });
  }, [buckets, suratList]);

  // SLA Compliance Chart Data
  const slaData = useMemo(() => {
    return buckets.map(b => {
      const finished = suratList.filter(s => s.tarikhTerima >= b.start && s.tarikhTerima <= b.end && statusOf(s) === 'telah');
      const inTime = finished.filter(dalamTempoh).length;
      const pct = finished.length > 0 ? Math.round((inTime / finished.length) * 100) : null;
      return {
        label: b.label,
        Pematuhan: pct
      };
    });
  }, [buckets, suratList]);

  // Category Breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    windowSurat.forEach(s => {
      map[s.kategori] = (map[s.kategori] || 0) + 1;
    });
    return Object.entries(map)
      .map(([k, v]) => ({ name: k, total: v }))
      .sort((a, b) => b.total - a.total);
  }, [windowSurat]);

  // Level Filter for Organizational Performance Table
  const orgTableRows = useMemo(() => {
    const nodes = ORDER.filter(id => {
      const j = N[id]?.jenis;
      if (levelFilter === 'peringkat1') {
        return j === 'ts' || j === 'jabatan' || (j === 'pejabat' && id !== 'su');
      }
      if (levelFilter === 'bahagian') return j === 'bahagian';
      return j === 'unit';
    });

    return nodes.map(id => {
      const list = windowSurat.filter(s => (s.penerima || {})[id]);
      if (list.length === 0) return null;

      let akan = 0, sedang = 0, telah = 0, lwt = 0, dlm = 0;
      list.forEach(s => {
        const entry = s.penerima[id];
        if (entry.status === 'telah') {
          telah++;
          if (dalamTempoh(s)) dlm++;
        } else if (entry.status === 'sedang') {
          sedang++;
        } else {
          akan++;
        }
        if (lewat(s)) lwt++;
      });

      const pat = telah > 0 ? Math.round((dlm / telah) * 100) : null;

      return {
        id,
        nama: shortNm(id),
        ketua: N[id]?.ketua,
        total: list.length,
        akan,
        sedang,
        telah,
        lewat: lwt,
        pematuhan: pat
      };
    }).filter(Boolean).sort((a: any, b: any) => b.total - a.total);
  }, [windowSurat, levelFilter]);

  const years = useMemo(() => {
    const list = new Set(suratList.map(s => pd(s.tarikhTerima).getFullYear()));
    list.add(new Date().getFullYear());
    return Array.from(list).sort((a, b) => b - a);
  }, [suratList]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header & Period Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Analisis Surat & Prestasi SLA Tindakan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Laporan berasaskan tarikh surat diterima · Piagam Pelanggan MAINS (SLA 14 Hari).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs font-semibold">
            {(['harian', 'mingguan', 'bulanan', 'tahunan'] as const).map(p => (
              <motion.button
                key={p}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  period === p
                    ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {p}
              </motion.button>
            ))}
          </div>

          {period === 'bulanan' && (
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Surat Diterima</div>
          <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-400 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Dalam tempoh terpilih</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Akan Diambil</div>
          <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">{stats.akan}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.total > 0 ? `${Math.round((stats.akan / stats.total) * 100)}%` : "0%"} daripada jumlah
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">Sedang Diambil</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{stats.sedang}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.total > 0 ? `${Math.round((stats.sedang / stats.total) * 100)}%` : "0%"} daripada jumlah
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Telah Diambil</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.telah}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.total > 0 ? `${Math.round((stats.telah / stats.total) * 100)}%` : "0%"} selesai
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 shadow-sm">
          <div className="text-xs font-semibold text-red-600 dark:text-red-400">Lewat &gt; 14 Hari</div>
          <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{stats.lewat}</div>
          <div className="text-[11px] text-red-500/80 mt-0.5">Belum selesai &gt; 14 hari</div>
        </div>

        <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 shadow-sm">
          <div className="text-xs font-semibold text-teal-800 dark:text-teal-300">Purata Hari Selesai</div>
          <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 mt-1">{stats.avgDays} hari</div>
          <div className="text-[11px] text-teal-600/80 mt-0.5">Pematuhan: {stats.pematuhan !== null ? `${stats.pematuhan}%` : "—"}</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Bar Chart */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Trend: Surat Diterima vs Diselesaikan
            </h3>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
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
                  <Bar dataKey="Diselesaikan" fill="#eb6834" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* SLA Compliance Line Chart */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Pematuhan Tempoh SLA 14 Hari (% Selesai Dalam Tempoh)
            </h3>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={slaData}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b3d5c",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                    formatter={(val: any) => [`${val}%`, "Pematuhan 14H"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="Pematuhan"
                    stroke="#0aa3a3"
                    strokeWidth={2.5}
                    dot={{ fill: "#0aa3a3", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizational Performance Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Prestasi Mengikut Peringkat Organisasi MAINS
            </h3>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLevelFilter('peringkat1')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  levelFilter === 'peringkat1'
                    ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Pejabat / Jabatan / Daerah
              </button>
              <button
                type="button"
                onClick={() => setLevelFilter('bahagian')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  levelFilter === 'bahagian'
                    ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Bahagian
              </button>
              <button
                type="button"
                onClick={() => setLevelFilter('unit')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  levelFilter === 'unit'
                    ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Unit
              </button>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Cawangan / Bahagian</th>
                  <th className="p-3 text-right">Surat</th>
                  <th className="p-3 text-right">Akan</th>
                  <th className="p-3 text-right">Sedang</th>
                  <th className="p-3 text-right">Telah</th>
                  <th className="p-3 text-right">Lewat</th>
                  <th className="p-3 text-right">Pematuhan 14 Hari</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orgTableRows.length > 0 ? (
                  orgTableRows.map((row: any) => (
                    <tr
                      key={row.id}
                      onClick={() => onFilterOrg(row.id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{row.nama}</div>
                        <div className="text-[10px] text-slate-400">{row.ketua}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-700 dark:text-slate-300">{row.total}</td>
                      <td className="p-3 text-right text-slate-500">{row.akan}</td>
                      <td className="p-3 text-right text-amber-600">{row.sedang}</td>
                      <td className="p-3 text-right text-emerald-600">{row.telah}</td>
                      <td className="p-3 text-right font-bold" style={{ color: row.lewat ? "#d03b3b" : "inherit" }}>
                        {row.lewat}
                      </td>
                      <td className="p-3 text-right font-extrabold" style={{ color: row.pematuhan !== null && row.pematuhan >= 80 ? "#0ca30c" : row.pematuhan !== null && row.pematuhan >= 60 ? "#fab219" : "#d03b3b" }}>
                        {row.pematuhan !== null ? `${row.pematuhan}%` : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                      Tiada rekod data bagi kategori peringkat ini dalam tempoh terpilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
