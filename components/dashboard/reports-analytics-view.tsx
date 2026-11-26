"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  BarChart2,
  PieChart as PieIcon
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { toast } from "sonner";

export function ReportsAnalyticsView() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");

  const monthlyData = [
    { month: "Jan", surat: 35, selesai: 32 },
    { month: "Feb", surat: 42, selesai: 38 },
    { month: "Mac", surat: 55, selesai: 50 },
    { month: "Apr", surat: 48, selesai: 44 },
    { month: "Mei", surat: 62, selesai: 58 },
    { month: "Jun", surat: 58, selesai: 52 },
    { month: "Jul", surat: 70, selesai: 64 },
    { month: "Ogo", surat: 65, selesai: 60 },
    { month: "Sep", surat: 75, selesai: 71 },
    { month: "Okt", surat: 80, selesai: 74 },
  ];

  const categoryData = [
    { name: "Kewangan & Zakat", value: 42, color: "#2563eb" },
    { name: "Bantuan & Asnaf", value: 28, color: "#0d9488" },
    { name: "Pembangunan Masjid", value: 18, color: "#d97706" },
    { name: "Pentadbiran & Am", value: 12, color: "#6366f1" },
  ];

  const deptPerformance = [
    { name: "Bahagian Agihan & Zakat", total: 48, selesai: 46, rate: 96, avgDays: 2.1 },
    { name: "Bahagian Kewangan & Baitulmal", total: 32, selesai: 30, rate: 94, avgDays: 2.4 },
    { name: "Bahagian Pembangunan & Wakaf", total: 24, selesai: 22, rate: 92, avgDays: 3.0 },
    { name: "Bahagian Dakwah & Komunikasi", total: 18, selesai: 18, rate: 100, avgDays: 1.8 },
    { name: "Bahagian Pentadbiran & Korporat", total: 12, selesai: 12, rate: 100, avgDays: 1.5 },
  ];

  const exportExcel = () => {
    const wsData = [
      ["LAPORAN PRESTASI PENGURUSAN SURAT MASUK (STSM - MAINS)"],
      ["Tahun Semasa:", selectedPeriod],
      ["Tarikh Dijana:", new Date().toLocaleDateString('ms-MY')],
      [],
      ["Bahagian", "Jumlah Surat", "Tindakan Selesai", "Kadar Pematuhan SLA (%)", "Purata Tempoh (Hari)"],
      ...deptPerformance.map(d => [d.name, d.total, d.selesai, `${d.rate}%`, d.avgDays])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Prestasi Bahagian");
    XLSX.writeFile(wb, `Laporan_Prestasi_Surat_MAINS_${selectedPeriod}.xlsx`);
    toast.success("Fail Excel berjaya dieksport!");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text("MAJLIS AGAMA ISLAM NEGERI SEMBILAN", 14, 20);
    doc.setFontSize(11);
    doc.text("SISTEM TINDAKAN SURAT MASUK (STSM)", 14, 27);
    doc.text(`LAPORAN AUDIT PRESTASI DAN KEPATUHAN SLA (${selectedPeriod})`, 14, 33);
    doc.line(14, 37, 196, 37);

    // Summary Stats
    doc.setFontSize(10);
    doc.text(`Tarikh Dijana: ${new Date().toLocaleDateString('ms-MY')}`, 14, 45);
    doc.text("Kadar Keseluruhan Pematuhan SLA: 94.8%", 14, 52);
    doc.text("Purata Masa Respons: 2.4 Hari", 14, 59);

    // Table Header
    let y = 72;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Bahagian", 14, y);
    doc.text("Jumlah", 110, y);
    doc.text("Selesai", 135, y);
    doc.text("Pematuhan SLA", 160, y);
    doc.line(14, y + 2, 196, y + 2);

    // Table Rows
    doc.setFont("helvetica", "normal");
    deptPerformance.forEach((d) => {
      y += 8;
      doc.text(d.name, 14, y);
      doc.text(d.total.toString(), 110, y);
      doc.text(d.selesai.toString(), 135, y);
      doc.text(`${d.rate}%`, 160, y);
    });

    doc.line(14, y + 5, 196, y + 5);
    doc.text("Dokumen ini dijana secara automatik oleh Sistem STSM MAINS.", 14, y + 15);

    doc.save(`Laporan_Audit_MAINS_${selectedPeriod}.pdf`);
    toast.success("Dokumen PDF rasmi berjaya dijana dan dimuat turun!");
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-lg border border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Laporan Eksekutif & Analisis Prestasi Surat
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Visualisasi pematuhan tempoh masa (SLA), beban tugas bahagian, dan penjanaan dokumen laporan rasmi berformat Excel dan PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={exportExcel}
            size="sm"
            className="rounded-xl h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-2 shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Eksport Excel (.xlsx)
          </Button>

          <Button
            onClick={exportPdf}
            size="sm"
            className="rounded-xl h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-2 shadow-md"
          >
            <FileText className="w-4 h-4" />
            Jana PDF Rasmi
          </Button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Kadar Pematuhan SLA", value: "94.8%", desc: "+2.3% sasaran tercapai", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
          { title: "Purata Masa Tindakan", value: "2.4 Hari", desc: "Sasaran Piagam: ≤ 5 Hari", icon: Clock, color: "text-blue-500 bg-blue-500/10" },
          { title: "Surat Selesai Dimaklumkan", value: "112 / 128", desc: "88% surat berjaya dijawab", icon: TrendingUp, color: "text-indigo-500 bg-indigo-500/10" },
          { title: "Tindakan Tertunggak", value: "3 Surat", desc: "Perlu pemantauan segera", icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{kpi.desc}</div>
            </Card>
          );
        })}
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Monthly Trend Bar Chart */}
        <Card className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Trend Penerimaan & Penyelesaian Surat (Bulanan)
            </CardTitle>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    fontSize: '12px', 
                    border: 'none' 
                  }} 
                />
                <Bar dataKey="surat" name="Surat Diterima" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="selesai" name="Tindakan Selesai" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut */}
        <Card className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              Pecahan Surat Mengikut Sektor
            </CardTitle>
          </CardHeader>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    fontSize: '12px', 
                    border: 'none' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Department SLA Matrix Table */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Matriks Pematuhan Piagam Pelanggan Mengikut Bahagian
          </h3>
          <span className="text-xs text-slate-400 font-mono">Tahun 2024</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 pb-2">
                <th className="py-2.5 font-bold">Nama Bahagian</th>
                <th className="py-2.5 font-bold">Jumlah Surat</th>
                <th className="py-2.5 font-bold">Selesai Dimaklumkan</th>
                <th className="py-2.5 font-bold">Purata Masa (Hari)</th>
                <th className="py-2.5 font-bold text-right">Pematuhan SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {deptPerformance.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{dept.name}</td>
                  <td className="py-3 font-mono text-slate-600 dark:text-slate-400">{dept.total}</td>
                  <td className="py-3 font-mono text-emerald-600 font-semibold">{dept.selesai}</td>
                  <td className="py-3 font-mono text-slate-600 dark:text-slate-400">{dept.avgDays} Hari</td>
                  <td className="py-3 text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {dept.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
