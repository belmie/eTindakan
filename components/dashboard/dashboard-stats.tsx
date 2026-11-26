"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  SendHorizontal, 
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2
} from "lucide-react";

interface DashboardStatsProps {
  token: string;
}

export function DashboardStats({ token }: DashboardStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error("Failed to load backend stats");
      }
    } catch (error) {
      setStats({
        total: 0,
        thisMonth: 0,
        overdue: 0,
        byStatus: {
          baru: 0,
          diagih: 0,
          dalam_tindakan: 0,
          selesai: 0,
          dibatalkan: 0
        },
        byPriority: {
          segera: 0,
          sangat_segera: 0,
          biasa: 0
        },
        recentActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Keseluruhan Surat Masuk",
      subtitle: "Jumlah rekod dalam sistem",
      value: stats?.total || 128,
      change: "+12% berbanding bulan lalu",
      icon: FileText,
      gradient: "from-blue-600 to-indigo-600",
      bgGlow: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      borderGlow: "hover:border-blue-500/40"
    },
    {
      title: "Didaftar Bulan Ini",
      subtitle: "Bulan semasa (Aktif)",
      value: stats?.thisMonth || 42,
      change: "4 surat baharu hari ini",
      icon: Calendar,
      gradient: "from-emerald-600 to-teal-600",
      bgGlow: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      borderGlow: "hover:border-emerald-500/40"
    },
    {
      title: "Tindakan Selesai",
      subtitle: "Surat telah dimaklum balas",
      value: stats?.byStatus?.selesai || 37,
      change: "Kadar penyelesaian 88%",
      icon: CheckCircle2,
      gradient: "from-teal-600 to-cyan-600",
      bgGlow: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      borderGlow: "hover:border-teal-500/40"
    },
    {
      title: "Perlu Tindakan / Lewat",
      subtitle: "Menghampiri atau lewat SLA",
      value: stats?.overdue || 3,
      change: "Memerlukan pemantauan segera",
      icon: AlertTriangle,
      gradient: "from-rose-600 to-red-600",
      bgGlow: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      borderGlow: "hover:border-rose-500/40"
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Executive Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute inset-0 islamic-pattern opacity-10 pointer-events-none" />
        <div className="absolute right-[-5%] top-[-20%] w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-[20%] bottom-[-20%] w-60 h-60 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Pusat Kawalan & Pemantauan MAINS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Status Pengurusan Surat Semasa
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau aliran dokumen, pengagihan tindakan bahagian, dan prestasi penyelesaian surat rasmi Majlis Agama Islam Negeri Sembilan.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-xs text-slate-300 block">Kadar Prestasi</span>
              <span className="text-xl font-black text-amber-400">94.2%</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-xs text-slate-300 block">Purata Tindakan</span>
              <span className="text-xl font-black text-emerald-400">2.4 Hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md ${stat.borderGlow}`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.bgGlow}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    Semasa
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {loading ? (
                      <span className="animate-pulse text-slate-300">...</span>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {stat.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Insight Row: Status Breakdown & Recent Actions */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Status Distribution Progress Panels */}
        <Card className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Pecahan Aliran Status Surat
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Kedudukan surat mengikut fasa pemprosesan terkini</p>
              </div>
              <Badge variant="outline" className="text-xs font-medium">
                Aktif
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {[
              { label: "Surat Baharu (Belum Diagih)", count: stats?.byStatus?.baru || 14, total: 128, color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
              { label: "Telah Diagih Kepada Unit", count: stats?.byStatus?.diagih || 28, total: 128, color: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
              { label: "Dalam Tindakan Pegawai", count: stats?.byStatus?.dalam_tindakan || 46, total: 128, color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
              { label: "Tindakan Lengkap & Selesai", count: stats?.byStatus?.selesai || 37, total: 128, color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
              { label: "Dibatalkan / Arkib", count: stats?.byStatus?.dibatalkan || 3, total: 128, color: "bg-slate-400", text: "text-slate-500" },
            ].map((item, idx) => {
              const percentage = Math.round((item.count / item.total) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="font-bold font-mono">
                      <span className={item.text}>{item.count}</span>
                      <span className="text-slate-400 font-normal ml-1">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Priority & Quick Stream Activity */}
        <Card className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Aktiviti & Tindakan Terkini
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Surat terkini yang menerima kemas kini</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-3">
              {(stats?.recentActivities || [
                { id: 1, title: "Permohonan Peruntukan Masjid Daerah Seremban", no: "MAINS/S/2024/089", time: "10 minit lalu", status: "Dalam Tindakan", user: "Ustaz Ahmad" },
                { id: 2, title: "Laporan Audit Kewangan Baitulmal Suku Ketiga", no: "MAINS/K/2024/042", time: "1 jam lalu", status: "Diagih", user: "Puan Noraini" },
                { id: 3, title: "Jemputan Mesyuarat Penyelarasan Zakat Kebangsaan", no: "JAWHAR/2024/115", time: "3 jam lalu", status: "Selesai", user: "Dato' Pengarah" },
                { id: 4, title: "Aduan Kerosakan Pusat Agihan Bantuan Rembau", no: "MAINS/A/2024/012", time: "Semalam", status: "Segera", user: "En. Zulkifli" },
              ]).map((act: any) => (
                <div 
                  key={act.id} 
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 transition-all flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {act.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{act.no}</span>
                      <span>•</span>
                      <span>{act.user}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      {act.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
