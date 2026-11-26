"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  Building, 
  Mail, 
  Loader2,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Info,
  Shield,
  Layers,
  FileText,
  Send,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { ORG_RAW } from "@/lib/org-data";

interface UserManagementViewProps {
  token: string;
  currentUser: any;
}

export const ROLE_CONFIG: Record<string, {
  label: string;
  shortLabel: string;
  desc: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: any;
  color: string;
}> = {
  pentadbir_sistem: {
    label: "Pentadbir Sistem (IT Admin)",
    shortLabel: "Pentadbir Sistem",
    desc: "Akses penuh sistem, pengurusan akaun kakitangan, konfigurasi keselamatan & audit jejak.",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-700 dark:text-rose-400",
    badgeBorder: "border-rose-500/30",
    icon: ShieldCheck,
    color: "from-rose-600 to-red-700"
  },
  pengurusan: {
    label: "Pengurusan Tertinggi (SU / TS)",
    shortLabel: "Pengurusan Tertinggi",
    desc: "Peti Minit Utama Setiausaha/Timbalan, minit arahan peringkat tertinggi, pemantauan SLA & analitik.",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-700 dark:text-amber-400",
    badgeBorder: "border-amber-500/30",
    icon: Shield,
    color: "from-amber-600 to-yellow-700"
  },
  ketua_unit: {
    label: "Ketua Bahagian / Unit",
    shortLabel: "Ketua Bahagian",
    desc: "Menerima minit daripada SU/TS, meminitkan arahan kepada pegawai tindakan & pemantauan cawangan.",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-700 dark:text-emerald-400",
    badgeBorder: "border-emerald-500/30",
    icon: Building,
    color: "from-emerald-600 to-teal-700"
  },
  pegawai_pelaksana: {
    label: "Pegawai Pelaksana (Tindakan)",
    shortLabel: "Pegawai Pelaksana",
    desc: "Menerima tugasan surat, mengemas kini tindakan (Sedang / Selesai) & memuat naik surat jawapan/bukti.",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-700 dark:text-purple-400",
    badgeBorder: "border-purple-500/30",
    icon: Layers,
    color: "from-purple-600 to-indigo-700"
  },
  kerani: {
    label: "Kerani Pendaftaran (Unit Surat)",
    shortLabel: "Kerani Pendaftaran",
    desc: "Pendaftaran surat masuk baharu (individu / pukal), cetakan Slip Kod QR A5 & pemfailan rekod.",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-700 dark:text-sky-400",
    badgeBorder: "border-sky-500/30",
    icon: FileText,
    color: "from-sky-600 to-blue-700"
  }
};

export const BAHAGIAN_LIST: string[] = Array.from(
  new Set(ORG_RAW.map(item => item[2]))
).sort((a, b) => a.localeCompare(b));

// Normalize role string
export const normalizeRole = (role: string): string => {
  if (!role) return "pegawai_pelaksana";
  const r = role.toLowerCase().trim();
  if (r === "pentadbir_sistem" || r === "admin") return "pentadbir_sistem";
  if (r === "pengurusan" || r === "su" || r === "ts" || r === "pentadbir") return "pengurusan";
  if (r === "ketua_unit" || r === "ketua") return "ketua_unit";
  if (r === "pegawai_pelaksana" || r === "pegawai") return "pegawai_pelaksana";
  if (r === "kerani") return "kerani";
  return r;
};

export function UserManagementView({ token, currentUser }: UserManagementViewProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Create user form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "password",
    full_name: "",
    role: "pegawai_pelaksana",
    bahagian: "Bahagian Pentadbiran & Korporat"
  });

  // Edit user form
  const [editData, setEditData] = useState({
    id: 0,
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "pegawai_pelaksana",
    bahagian: ""
  });

  const isUserAdmin = useMemo(() => {
    const r = normalizeRole(currentUser?.role || "");
    return r === "pentadbir_sistem" || r === "pengurusan";
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        // Fallback default users if API fails
        setUsers(getDefaultUsers());
      }
    } catch {
      setUsers(getDefaultUsers());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultUsers = () => [
    {
      id: 1,
      username: "admin",
      full_name: "Administrator Sistem IT (Pentadbir)",
      email: "admin@mains.gov.my",
      role: "pentadbir_sistem",
      bahagian: "Unit Pembangunan ICT",
      is_active: true
    },
    {
      id: 5,
      username: "pentadbir",
      full_name: "Zainal bin Said (Setiausaha MAINS)",
      email: "setiausaha@mains.gov.my",
      role: "pengurusan",
      bahagian: "Pejabat Setiausaha MAINS",
      is_active: true
    },
    {
      id: 2,
      username: "syammil.yusoff",
      full_name: "Syammil Izuddin bin Mohamed Yusoff (KPP Komunikasi Korporat)",
      email: "syammil@mains.gov.my",
      role: "ketua_unit",
      bahagian: "Bahagian Komunikasi Korporat",
      is_active: true
    },
    {
      id: 3,
      username: "azreen.bakar",
      full_name: "Mohd Azreen bin Abu Bakar (Ketua Unit Integriti)",
      email: "azreen@mains.gov.my",
      role: "ketua_unit",
      bahagian: "Unit Integriti",
      is_active: true
    },
    {
      id: 4,
      username: "kerani",
      full_name: "Noor Azira binti Mohamad Najib (Urusetia / Kerani)",
      email: "urusetia@mains.gov.my",
      role: "kerani",
      bahagian: "Unit Urusetia",
      is_active: true
    },
    {
      id: 6,
      username: "pegawai",
      full_name: "En. Zulkifli bin Ismail (Pegawai Tindakan)",
      email: "pegawai@mains.gov.my",
      role: "pegawai_pelaksana",
      bahagian: "Bahagian Dakwah & Pemasaran",
      is_active: true
    }
  ];

  // Role counts
  const roleStats = useMemo(() => {
    let pentadbirCount = 0;
    let pengurusanCount = 0;
    let ketuaCount = 0;
    let pegawaiCount = 0;
    let keraniCount = 0;

    users.forEach(u => {
      const r = normalizeRole(u.role);
      if (r === "pentadbir_sistem") pentadbirCount++;
      else if (r === "pengurusan") pengurusanCount++;
      else if (r === "ketua_unit") ketuaCount++;
      else if (r === "pegawai_pelaksana") pegawaiCount++;
      else if (r === "kerani") keraniCount++;
    });

    return {
      total: users.length,
      pentadbir: pentadbirCount,
      pengurusan: pengurusanCount,
      ketua: ketuaCount,
      pegawai: pegawaiCount,
      kerani: keraniCount
    };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Role filter
      if (selectedRoleFilter !== "semua") {
        const norm = normalizeRole(user.role);
        if (norm !== selectedRoleFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (user.full_name || "").toLowerCase().includes(q);
        const matchUser = (user.username || "").toLowerCase().includes(q);
        const matchEmail = (user.email || "").toLowerCase().includes(q);
        const matchBahagian = (user.bahagian || "").toLowerCase().includes(q);
        return matchName || matchUser || matchEmail || matchBahagian;
      }

      return true;
    });
  }, [users, selectedRoleFilter, searchQuery]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.full_name.trim() || !formData.email.trim()) {
      toast.error("Sila lengkapkan maklumat wajib.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ralat mendaftar pengguna");
      }

      toast.success(`Pengguna ${data.full_name} (${formData.username}) berjaya didaftarkan!`);
      setModalOpen(false);
      setFormData({
        username: "",
        email: "",
        password: "password",
        full_name: "",
        role: "pegawai_pelaksana",
        bahagian: "Bahagian Pentadbiran & Korporat"
      });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Ralat sistem mendaftar pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/users/${editData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ralat mengemas kini maklumat pengguna");
      }

      toast.success(`Maklumat ${data.full_name} berjaya dikemas kini!`);
      setEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Ralat sistem mengemas kini pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`Adakah anda pasti ingin menyahaktifkan akaun pengguna ${name}? Akaun yang dinyahaktifkan tidak akan dapat log masuk, namun rekod jejak surat kekal terpelihara.`)) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success(`Akaun ${name} telah berjaya dinyahaktifkan.`);
        fetchUsers();
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyahaktifkan akaun");
      }
    } catch (err: any) {
      toast.error(err.message || "Ralat menyahaktifkan akaun");
    }
  };

  const openEditModal = (staff: any) => {
    setEditData({
      id: staff.id,
      username: staff.username,
      email: staff.email,
      password: "",
      full_name: staff.full_name,
      role: normalizeRole(staff.role),
      bahagian: staff.bahagian || ""
    });
    setEditModalOpen(true);
  };

  const copyCredentials = (staff: any) => {
    const txt = `Nama: ${staff.full_name}\nID: ${staff.username}\nEmel: ${staff.email}\nPeranan: ${ROLE_CONFIG[normalizeRole(staff.role)]?.label || staff.role}\nBahagian: ${staff.bahagian || 'MAINS'}`;
    navigator.clipboard.writeText(txt);
    toast.success("Maklumat pengguna disalin ke papan keratan (clipboard)!");
  };

  const roleFilterTabs = [
    { id: "semua", label: "Semua Pengguna", count: roleStats.total },
    { id: "pentadbir_sistem", label: "🛡️ Pentadbir Sistem", count: roleStats.pentadbir },
    { id: "pengurusan", label: "🏛️ Pengurusan Tertinggi", count: roleStats.pengurusan },
    { id: "ketua_unit", label: "🏢 Ketua Bahagian", count: roleStats.ketua },
    { id: "pegawai_pelaksana", label: "⚡ Pegawai Pelaksana", count: roleStats.pegawai },
    { id: "kerani", label: "📝 Kerani Pendaftaran", count: roleStats.kerani },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pengurusan Pengguna & Peranan
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Mod Pentadbir
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kawal selia akses pengguna sistem e-Surat MAINS, penetapan peranan kakitangan, dan agihan kuasa mengikut jabatan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMatrix(!showMatrix)}
            className="rounded-xl h-10 px-3.5 text-xs gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Info className="w-4 h-4 text-teal-600" />
            <span>Matriks Peranan</span>
            {showMatrix ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </Button>

          {isUserAdmin && (
            <Button 
              onClick={() => setModalOpen(true)}
              className="rounded-xl h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2 shadow-md shadow-teal-600/25 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              + Daftar Pengguna Baharu
            </Button>
          )}
        </div>
      </div>

      {/* Role Stats KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Pengguna</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {roleStats.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Akaun kakitangan aktif</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Pentadbir Sistem</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {roleStats.pentadbir}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Kawalan penuh IT & akses</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pengurusan & Ketua</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {roleStats.pengurusan + roleStats.ketua}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">SU, TS & Ketua Bahagian</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm card-hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Pelaksana & Kerani</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {roleStats.pegawai + roleStats.kerani}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pegawai tindakan & pendaftar</div>
        </div>
      </div>

      {/* Role Permission Matrix Card (Expandable) */}
      <AnimatePresence>
        {showMatrix && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-white border border-teal-800/40 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-sm sm:text-base">Panduan Tahap Kuasa & Tanggungjawab Peranan</h3>
                </div>
                <button onClick={() => setShowMatrix(false)} className="text-xs text-slate-400 hover:text-white">Tutup ×</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${cfg.badgeText}`} />
                        <span className="font-bold text-white text-xs">{cfg.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {cfg.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Security Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-base shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Log Masuk Semasa: {currentUser?.full_name || currentUser?.username}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_CONFIG[normalizeRole(currentUser?.role || "")]?.badgeBg} ${ROLE_CONFIG[normalizeRole(currentUser?.role || "")]?.badgeText} ${ROLE_CONFIG[normalizeRole(currentUser?.role || "")]?.badgeBorder}`}>
                {ROLE_CONFIG[normalizeRole(currentUser?.role || "")]?.shortLabel || currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{currentUser?.username}</span> · Cawangan: {currentUser?.bahagian || "MAINS Seremban"}
            </p>
          </div>
        </div>

        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            const currentRecord = users.find(u => u.username === currentUser?.username) || currentUser;
            openEditModal(currentRecord);
          }}
          className="rounded-xl border-slate-200 dark:border-slate-800 text-xs shrink-0 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Edit className="w-3.5 h-3.5 mr-1 text-teal-600" />
          Kemaskini Profil Saya
        </Button>
      </div>

      {/* Toolbar: Role Filter Pills & Search */}
      <div className="space-y-3">
        {/* Role Pills Toolbar */}
        <div className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 w-max">
            {roleFilterTabs.map(tab => (
              <motion.button
                key={tab.id}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRoleFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  selectedRoleFilter === tab.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedRoleFilter === tab.id
                    ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  {tab.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Cari kakitangan mengikut nama penuh, ID pengguna, emel, atau bahagian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Users Count Info */}
      <div className="text-[11px] text-slate-400 flex items-center justify-between">
        <span>Memaparkan <b>{filteredUsers.length}</b> kakitangan daripada {users.length} jumlah pengguna</span>
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-teal-600 hover:underline">
            Padam carian
          </button>
        )}
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
          Memuatkan direktori kakitangan & peranan...
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((staff) => {
            const roleKey = normalizeRole(staff.role);
            const roleCfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG.pegawai_pelaksana;
            const Icon = roleCfg.icon;

            return (
              <motion.div
                key={staff.id || staff.username}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
              >
                <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden h-full">
                  <CardContent className="p-5 space-y-3.5">
                    
                    {/* Header: Avatar + Name + Role Badge */}
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${roleCfg.color} text-white font-bold flex items-center justify-center text-base shadow-sm shrink-0 mt-0.5`}>
                        {staff.full_name?.charAt(0) || "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-slate-900 dark:text-white leading-snug break-words">
                          {staff.full_name}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border leading-none ${roleCfg.badgeBg} ${roleCfg.badgeText} ${roleCfg.badgeBorder}`}>
                            <Icon className="w-2.5 h-2.5" />
                            {roleCfg.shortLabel}
                          </span>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      {isUserAdmin && (
                        <div className="flex items-center gap-0.5 shrink-0 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
                          <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            className="p-1 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-xs"
                            title="Kemaskini Maklumat & Peranan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyCredentials(staff)}
                            className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-xs"
                            title="Salin Maklumat Pengguna"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {staff.id !== currentUser?.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(staff.id, staff.full_name)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-xs"
                              title="Nyahaktifkan Akaun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Department and Email */}
                    <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{staff.bahagian || "Pejabat MAINS"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">{staff.email}</span>
                      </div>
                    </div>

                    {/* Footer Row: User ID */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">ID Pengguna:</span>
                      <span className="font-mono font-bold text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-900/60">
                        {staff.username}
                      </span>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Tiada pengguna dijumpai untuk peranan atau carian terpilih.
        </div>
      )}

      {/* MODAL 1: CREATE USER */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              Daftar Akaun Kakitangan Baharu
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Cipta akaun pengguna sistem e-Surat MAINS dan tetapkan peranan serta cawangan tugas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-3.5 my-2 text-xs">
            
            <div className="space-y-1">
              <Label className="font-semibold text-xs">Nama Penuh Kakitangan *</Label>
              <Input
                required
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Contoh: Ustaz Khairul Anuar bin Sulaiman"
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-semibold text-xs">ID Pengguna (Username) *</Label>
                <Input
                  required
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().trim() }))}
                  placeholder="Contoh: khairul"
                  className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-xs">Kata Laluan Awal *</Label>
                <Input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Emel Rasmi MAINS *</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Contoh: khairul@mains.gov.my"
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Peranan Akses Sistem *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pentadbir_sistem">🛡️ Pentadbir Sistem (IT Admin - Akses Penuh)</SelectItem>
                  <SelectItem value="pengurusan">🏛️ Pengurusan Tertinggi (Setiausaha / Timbalan SU)</SelectItem>
                  <SelectItem value="ketua_unit">🏢 Ketua Bahagian / Unit</SelectItem>
                  <SelectItem value="pegawai_pelaksana">⚡ Pegawai Pelaksana (Tindakan)</SelectItem>
                  <SelectItem value="kerani">📝 Kerani Pendaftaran (Unit Surat Masuk)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Bahagian / Sektor / Cawangan</Label>
              <Select
                value={formData.bahagian}
                onValueChange={(val) => setFormData(prev => ({ ...prev, bahagian: val }))}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {BAHAGIAN_LIST.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" size="sm" className="rounded-xl h-9 text-xs" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} size="sm" className="rounded-xl h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                Daftar Pengguna
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: EDIT USER */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-teal-600" />
              Kemaskini Maklumat & Peranan Pengguna
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kemas kini maklumat peribadi, tetapkan peranan baharu, atau reset kata laluan bagi akaun <b>{editData.username}</b>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-3.5 my-2 text-xs">
            
            <div className="space-y-1">
              <Label className="font-semibold text-xs">Nama Penuh Kakitangan *</Label>
              <Input
                required
                value={editData.full_name}
                onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Emel Rasmi MAINS *</Label>
              <Input
                required
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            {isUserAdmin && (
              <div className="space-y-1">
                <Label className="font-semibold text-xs">Peranan Akses Sistem *</Label>
                <Select 
                  value={editData.role} 
                  onValueChange={(val) => setEditData(prev => ({ ...prev, role: val }))}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pentadbir_sistem">🛡️ Pentadbir Sistem (IT Admin - Akses Penuh)</SelectItem>
                    <SelectItem value="pengurusan">🏛️ Pengurusan Tertinggi (Setiausaha / Timbalan SU)</SelectItem>
                    <SelectItem value="ketua_unit">🏢 Ketua Bahagian / Unit</SelectItem>
                    <SelectItem value="pegawai_pelaksana">⚡ Pegawai Pelaksana (Tindakan)</SelectItem>
                    <SelectItem value="kerani">📝 Kerani Pendaftaran (Unit Surat Masuk)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Bahagian / Cawangan</Label>
              <Select
                value={editData.bahagian}
                onValueChange={(val) => setEditData(prev => ({ ...prev, bahagian: val }))}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {BAHAGIAN_LIST.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <Label className="font-semibold text-xs text-slate-500">
                Tukar Kata Laluan (Biarkan kosong jika tidak berubah)
              </Label>
              <Input
                type="password"
                value={editData.password}
                onChange={(e) => setEditData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Kata laluan baharu..."
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" size="sm" className="rounded-xl h-9 text-xs" onClick={() => setEditModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} size="sm" className="rounded-xl h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
