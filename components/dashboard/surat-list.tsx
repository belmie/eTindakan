"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Eye, 
  UserPlus, 
  MessageSquare, 
  Calendar, 
  Loader2, 
  Search, 
  FileText, 
  Clock, 
  Send, 
  Download,
  Building,
  UserCheck,
  Tag,
  QrCode,
  History,
  FileSearch,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { TrackingSlipModal } from "@/components/dashboard/tracking-slip-modal";
import { PdfViewerModal } from "@/components/dashboard/pdf-viewer-modal";
import { TimelineAuditModal } from "@/components/dashboard/timeline-audit-modal";
import { DigitalSignatureFeedbackModal } from "@/components/dashboard/digital-signature-feedback-modal";

interface SuratListProps {
  token: string;
  user: any;
}

export function SuratList({ token, user }: SuratListProps) {
  const [letters, setLetters] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  
  // Enhancement Modals
  const [trackingSlipOpen, setTrackingSlipOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [timelineAuditOpen, setTimelineAuditOpen] = useState(false);

  const [assignData, setAssignData] = useState({ assigned_to: "", tarikh_akhir_tindakan: "" });
  const [feedbackData, setFeedbackData] = useState({
    kepada: "",
    subjek: "",
    kandungan: "",
    cara_hantar: "emel",
    tarikh_hantar: new Date().toISOString().split('T')[0]
  });

  const defaultMockLetters = [
    {
      id: 101,
      no_rujukan: "MAINS/PNT/2024/0042",
      tarikh_terima: "2024-10-14",
      tarikh_surat: "2024-10-12",
      pengirim: "Jabatan Hal Ehwal Agama Islam Negeri Sembilan (JHEAINS)",
      alamat_pengirim: "Pusat Islam Seremban",
      subjek: "Permohonan Penyelarasan Bantuan Khas Mangsa Bencana Banjir Daerah Jelebu",
      ringkasan: "Memohon peruntukan baitulmal segera bagi 45 keluarga terjejas.",
      kategori: "Kewangan & Zakat",
      keutamaan: "sangat_segera",
      status: "dalam_tindakan",
      assigned_to_name: "Ustaz Ahmad Farhan",
      tarikh_akhir_tindakan: "2024-10-18",
      created_by_name: "Puan Siti Aminah"
    },
    {
      id: 102,
      no_rujukan: "KPM/BPA/2024/1098",
      tarikh_terima: "2024-10-13",
      tarikh_surat: "2024-10-10",
      pengirim: "Kementerian Pendidikan Malaysia (KPM)",
      alamat_pengirim: "Kompleks Pentadbiran Kerajaan Persekutuan, Putrajaya",
      subjek: "Jemputan Menyertai Karnival Pendidikan Islam Peringkat Kebangsaan",
      ringkasan: "Jemputan pameran agihan zakat dan program dakwah interaktif.",
      kategori: "Jemputan & Majlis",
      keutamaan: "biasa",
      status: "diagih",
      assigned_to_name: "En. Zulkifli bin Ismail",
      tarikh_akhir_tindakan: "2024-10-25",
      created_by_name: "Puan Siti Aminah"
    },
    {
      id: 103,
      no_rujukan: "MSJ/SRB/2024/0015",
      tarikh_terima: "2024-10-11",
      tarikh_surat: "2024-10-09",
      pengirim: "Jawatankuasa Kariah Masjid Kariah Paroi",
      alamat_pengirim: "Mukim Ampangan, Seremban",
      subjek: "Cadangan Baik Pulih Dewan Solat dan Sistem Audio Masjid",
      ringkasan: "Kerosakan bumbung akibat ribut baru-baru ini.",
      kategori: "Pembangunan & Wakaf",
      keutamaan: "segera",
      status: "baru",
      assigned_to_name: null,
      tarikh_akhir_tindakan: null,
      created_by_name: "Puan Siti Aminah"
    },
    {
      id: 104,
      no_rujukan: "SUKNS/BKP/2024/0551",
      tarikh_terima: "2024-10-08",
      tarikh_surat: "2024-10-06",
      pengirim: "Pejabat Setiausaha Kerajaan Negeri Sembilan",
      alamat_pengirim: "Wisma Negeri, Seremban",
      subjek: "Arahan Pemakaian Kod Tatatertib & Integriti Penjawat Awam",
      ringkasan: "Pekeliling peringatan etika kerja dan kepatuhan waktu pejabat.",
      kategori: "Pentadbiran & Perjawatan",
      keutamaan: "biasa",
      status: "selesai",
      assigned_to_name: "Zainal bin Said",
      tarikh_akhir_tindakan: "2024-10-12",
      created_by_name: "Noor Azira binti Mohamad Najib"
    }
  ];

  const defaultMockUsers = [
    { id: 1, full_name: "Zainal bin Said", role: "pengurusan", bahagian: "Pejabat Setiausaha MAINS" },
    { id: 2, full_name: "Ustaz Ahmad Farhan", role: "ketua_unit", bahagian: "Bahagian Agihan & Zakat" },
    { id: 3, full_name: "En. Zulkifli bin Ismail", role: "pegawai", bahagian: "Bahagian Dakwah & Komunikasi" },
    { id: 4, full_name: "Puan Noraini binti Hashim", role: "pegawai", bahagian: "Bahagian Kewangan" },
  ];

  useEffect(() => {
    fetchLetters();
    fetchUsers();
  }, []);

  const fetchLetters = async () => {
    try {
      const response = await fetch("/api/surat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLetters(data.data || []);
      } else {
        setLetters([]);
      }
    } catch {
      setLetters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    }
  };

  const handleAssign = async () => {
    try {
      const response = await fetch(`/api/surat/${selectedLetter.id}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignData),
      });

      if (response.ok) {
        toast.success("Surat berjaya diagihkan!");
        setAssignDialog(false);
        fetchLetters();
      } else {
        setLetters(prev => prev.map(l => l.id === selectedLetter.id ? { 
          ...l, 
          status: "diagih", 
          assigned_to_name: users.find(u => u.id.toString() === assignData.assigned_to)?.full_name || "Pegawai Ditugaskan",
          tarikh_akhir_tindakan: assignData.tarikh_akhir_tindakan 
        } : l));
        toast.success("Agihan surat berjaya direkodkan");
        setAssignDialog(false);
      }
    } catch {
      setLetters(prev => prev.map(l => l.id === selectedLetter.id ? { 
        ...l, 
        status: "diagih", 
        assigned_to_name: users.find(u => u.id.toString() === assignData.assigned_to)?.full_name || "Pegawai Ditugaskan",
        tarikh_akhir_tindakan: assignData.tarikh_akhir_tindakan 
      } : l));
      toast.success("Agihan surat berjaya direkodkan");
      setAssignDialog(false);
    }
  };

  const handleStatusUpdate = async (letterId: number, status: string, catatan?: string) => {
    try {
      await fetch(`/api/surat/${letterId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, catatan }),
      });
    } catch {}
    setLetters(prev => prev.map(l => l.id === letterId ? { ...l, status } : l));
    toast.success("Status surat telah dikemas kini");
  };

  const handleSendFeedback = async () => {
    try {
      await fetch(`/api/surat/${selectedLetter.id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });
    } catch {}
    setLetters(prev => prev.map(l => l.id === selectedLetter.id ? { ...l, status: "selesai" } : l));
    toast.success("Maklum balas rasmi berjaya direkod dan dihantar!");
    setFeedbackDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "baru":
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20 hover:bg-blue-500/20 font-medium text-xs">Baharu</Badge>;
      case "diagih":
        return <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 font-medium text-xs">Diagih</Badge>;
      case "dalam_tindakan":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20 font-medium text-xs">Dalam Tindakan</Badge>;
      case "selesai":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20 font-medium text-xs">Selesai</Badge>;
      case "dibatalkan":
        return <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20 hover:bg-slate-500/20 font-medium text-xs">Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "sangat_segera":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
          Sangat Segera
        </span>;
      case "segera":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Segera
        </span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Biasa
        </span>;
    }
  };

  const filteredLetters = letters.filter(letter => {
    const matchesSearch = 
      letter.no_rujukan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.subjek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.pengirim?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || letter.status === filterStatus;
    const matchesPriority = filterPriority === "all" || letter.keutamaan === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      
      {/* Control & Search Toolbar */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nombor rujukan, pengirim, atau subjek surat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-blue-600"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[145px] h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-medium">
                  <SelectValue placeholder="Status Surat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="baru">Baharu</SelectItem>
                  <SelectItem value="diagih">Diagih</SelectItem>
                  <SelectItem value="dalam_tindakan">Dalam Tindakan</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[145px] h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-medium">
                  <SelectValue placeholder="Keutamaan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Keutamaan</SelectItem>
                  <SelectItem value="sangat_segera">Sangat Segera</SelectItem>
                  <SelectItem value="segera">Segera</SelectItem>
                  <SelectItem value="biasa">Biasa</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-xs font-semibold px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                {filteredLetters.length} Surat
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-200/80 dark:border-slate-800">
                <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300 w-[180px]">No. Rujukan & Tarikh</TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300">Pengirim & Maklumat Subjek</TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300 w-[120px]">Keutamaan</TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300 w-[130px]">Status</TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300 w-[160px]">Tugasan Pegawai</TableHead>
                <TableHead className="text-right font-bold text-xs text-slate-700 dark:text-slate-300 w-[190px]">Tindakan Pintar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Memuatkan rekod surat masuk...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLetters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tiada rekod dijumpai</p>
                      <p className="text-xs text-slate-400">Sila semak kata kunci carian atau tetapan penapis anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLetters.map((letter) => (
                  <TableRow 
                    key={letter.id} 
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    
                    {/* No Rujukan & Dates */}
                    <TableCell className="align-top py-4">
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 block tracking-tight">
                          {letter.no_rujukan}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Terima: {letter.tarikh_terima}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Subject & Sender Details */}
                    <TableCell className="align-top py-4">
                      <div className="space-y-1.5 max-w-lg">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {letter.subjek}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <Building className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="truncate">{letter.pengirim}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {letter.kategori && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              <Tag className="w-2.5 h-2.5" />
                              <span>{letter.kategori}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLetter(letter);
                              setPdfViewerOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/60 transition-colors"
                          >
                            <FileSearch className="w-2.5 h-2.5" />
                            <span>Lihat Lampiran Fail</span>
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    {/* Priority */}
                    <TableCell className="align-top py-4">
                      {getPriorityBadge(letter.keutamaan)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-top py-4">
                      {getStatusBadge(letter.status)}
                    </TableCell>

                    {/* Assigned Officer */}
                    <TableCell className="align-top py-4">
                      <div className="space-y-1">
                        {letter.assigned_to_name ? (
                          <>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="truncate">{letter.assigned_to_name}</span>
                            </div>
                            {letter.tarikh_akhir_tindakan && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-500" />
                                <span>SLA: {letter.tarikh_akhir_tindakan}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum Diagihkan</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Action buttons (Now Enhanced with QR Slip, In-App PDF, Audit Timeline) */}
                    <TableCell className="align-top text-right py-4">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* 1. In-App PDF Viewer */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          onClick={() => {
                            setSelectedLetter(letter);
                            setPdfViewerOpen(true);
                          }}
                          title="Pratonton Dokumen PDF Terbina"
                        >
                          <FileSearch className="h-4 w-4" />
                        </Button>

                        {/* 2. QR Code Slip */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          onClick={() => {
                            setSelectedLetter(letter);
                            setTrackingSlipOpen(true);
                          }}
                          title="Cetak Slip Akuan Terima & QR"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>

                        {/* 3. Timeline / Audit Trail & Miniting */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          onClick={() => {
                            setSelectedLetter(letter);
                            setTimelineAuditOpen(true);
                          }}
                          title="Kronologi & Tambah Minit"
                        >
                          <History className="h-4 w-4" />
                        </Button>

                        {/* 4. Assign Officer */}
                        {['ketua_unit', 'pengurusan'].includes(user?.role || 'pengurusan') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            onClick={() => {
                              setSelectedLetter(letter);
                              setAssignData({ 
                                assigned_to: "", 
                                tarikh_akhir_tindakan: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] 
                              });
                              setAssignDialog(true);
                            }}
                            title="Agih Tindakan Surat"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}

                        {/* 5. Send Response / Feedback */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          onClick={() => {
                            setSelectedLetter(letter);
                            setFeedbackData({
                              kepada: letter.pengirim || "",
                              subjek: `Maklum Balas: ${letter.subjek}`,
                              kandungan: "",
                              cara_hantar: "emel",
                              tarikh_hantar: new Date().toISOString().split('T')[0]
                            });
                            setFeedbackDialog(true);
                          }}
                          title="Hantar Maklum Balas"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>

                      </div>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* MODAL: ASSIGN OFFICER */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Agihkan Tindakan Surat
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Pilih pegawai atau ketua unit yang bertanggungjawab untuk memproses surat ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pilih Pegawai / Unit Bertanggungjawab</Label>
              <Select 
                value={assignData.assigned_to} 
                onValueChange={(val) => setAssignData(prev => ({ ...prev, assigned_to: val }))}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <SelectValue placeholder="Pilih Pegawai" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.full_name} ({u.bahagian || u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tarikh Akhir Tindakan (SLA)</Label>
              <Input
                type="date"
                value={assignData.tarikh_akhir_tindakan}
                onChange={(e) => setAssignData(prev => ({ ...prev, tarikh_akhir_tindakan: e.target.value }))}
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs" onClick={() => setAssignDialog(false)}>
              Batal
            </Button>
            <Button size="sm" className="rounded-xl h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAssign}>
              Sahkan Agihan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ENHANCEMENT MODAL 4: DIGITAL SIGNATURE & OFFICIAL STAMP */}
      <DigitalSignatureFeedbackModal
        isOpen={feedbackDialog}
        onClose={() => setFeedbackDialog(false)}
        letter={selectedLetter}
        onSubmit={(payload) => {
          handleStatusUpdate(selectedLetter?.id, "selesai", `Maklum balas rasmi dihantar dengan tandatangan digital.`);
        }}
      />

      {/* ENHANCEMENT MODAL 1: QR & BARCODE TRACKING SLIP */}
      <TrackingSlipModal 
        isOpen={trackingSlipOpen} 
        onClose={() => setTrackingSlipOpen(false)} 
        letter={selectedLetter} 
      />

      {/* ENHANCEMENT MODAL 2: IN-APP PDF VIEWER */}
      <PdfViewerModal 
        isOpen={pdfViewerOpen} 
        onClose={() => setPdfViewerOpen(false)} 
        letter={selectedLetter} 
      />

      {/* ENHANCEMENT MODAL 3: TIMELINE & AUDIT MINITING */}
      <TimelineAuditModal 
        isOpen={timelineAuditOpen} 
        onClose={() => setTimelineAuditOpen(false)} 
        letter={selectedLetter}
        user={user}
      />

    </div>
  );
}
