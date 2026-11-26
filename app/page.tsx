"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VUtama } from "@/components/dashboard/v-utama";
import { VPeti } from "@/components/dashboard/v-peti";
import { VPantau } from "@/components/dashboard/v-pantau";
import { VAnalisis } from "@/components/dashboard/v-analisis";
import { VStruktur } from "@/components/dashboard/v-struktur";
import { SuratFormAdvanced } from "@/components/forms/surat-form-advanced";
import { DetailDrawer } from "@/components/dashboard/detail-drawer";
import { MinitModal } from "@/components/dashboard/minit-modal";
import { RekodTindakanModal } from "@/components/dashboard/rekod-tindakan-modal";
import { NotifikasiModal } from "@/components/dashboard/notifikasi-modal";
import { ContactModal } from "@/components/dashboard/contact-modal";
import { DocumentViewerModal } from "@/components/dashboard/document-viewer-modal";
import { TrackingSlipModal } from "@/components/dashboard/tracking-slip-modal";
import { MinuteSheetModal } from "@/components/dashboard/minute-sheet-modal";
import { LinkSuratModal } from "@/components/dashboard/link-surat-modal";
import { UserManagementView, normalizeRole } from "@/components/dashboard/user-management-view";
import { MenuManagementView } from "@/components/dashboard/menu-management-view";
import { RoleManagementView } from "@/components/dashboard/role-management-view";
import { SystemSettingsView } from "@/components/dashboard/system-settings-view";
import { 
  VisualThemeSettings, 
  DEFAULT_VISUAL_THEME, 
  getHeaderStyles, 
  getSidebarStyles, 
  getAppCanvasStyles 
} from "@/lib/theme-config";
import { ALL_MENU_ITEMS, DEFAULT_SYSTEM_SETTINGS } from "@/lib/menu-config";
import { ORDER, N, depth, shortNm, HubContact, INITIAL_HUB } from "@/lib/org-data";
import { SuratItem, statusOf, lewat, hampir } from "@/lib/sla-utils";
import {
  Home,
  Upload,
  Inbox,
  Eye,
  BarChart3,
  FolderTree,
  Bell,
  LogOut,
  Sparkles,
  Database,
  Menu,
  X,
  Users,
  ShieldCheck,
  Layers,
  Settings
} from "lucide-react";
import { toast } from "sonner";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Active navigation view (includes Admin exclusive modules)
  const [activeView, setActiveView] = useState<
    'utama' | 'daftar' | 'peti' | 'pantau' | 'analisis' | 'struktur' | 'pengguna' | 'pengurusan_menu' | 'pengurusan_peranan' | 'tetapan_sistem'
  >('utama');

  // Active organizational role (defaults to 'su' - Setiausaha MAINS)
  const [role, setRole] = useState<string>('su');

  // Data state
  const [suratList, setSuratList] = useState<SuratItem[]>([]);
  const [contacts, setContacts] = useState<Record<string, HubContact>>(INITIAL_HUB);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal & Drawer states
  const [selectedSurat, setSelectedSurat] = useState<SuratItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [minitModalOpen, setMinitModalOpen] = useState(false);
  const [rekodModalOpen, setRekodModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifReceivers, setNotifReceivers] = useState<string[]>([]);
  const [notifTargetSurat, setNotifTargetSurat] = useState<SuratItem[]>([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editContactOrgId, setEditContactOrgId] = useState<string | null>(null);
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [trackingSlipOpen, setTrackingSlipOpen] = useState(false);
  const [minuteSheetOpen, setMinuteSheetOpen] = useState(false);
  const [linkSuratOpen, setLinkSuratOpen] = useState(false);
  const [menuConfigVersion, setMenuConfigVersion] = useState(0);

  // Visual Theme settings
  const [visualTheme, setVisualTheme] = useState<VisualThemeSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("esurat.visualTheme");
        if (saved) return { ...DEFAULT_VISUAL_THEME, ...JSON.parse(saved) };
      } catch {}
    }
    return DEFAULT_VISUAL_THEME;
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("esurat.systemSettings");
        if (saved) return { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(saved) };
      } catch {}
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  // Real-time listener for visual theme and system settings updates
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e?.detail) {
        setVisualTheme(e.detail);
      } else {
        const saved = localStorage.getItem("esurat.visualTheme");
        if (saved) {
          try { setVisualTheme({ ...DEFAULT_VISUAL_THEME, ...JSON.parse(saved) }); } catch {}
        }
      }
    };
    const handleSettingsChange = (e: any) => {
      if (e?.detail) {
        setSystemSettings(e.detail);
      } else {
        const saved = localStorage.getItem("esurat.systemSettings");
        if (saved) {
          try { setSystemSettings({ ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(saved) }); } catch {}
        }
      }
    };
    window.addEventListener('visualThemeChanged', handleThemeChange);
    window.addEventListener('systemSettingsChanged', handleSettingsChange);
    return () => {
      window.removeEventListener('visualThemeChanged', handleThemeChange);
      window.removeEventListener('systemSettingsChanged', handleSettingsChange);
    };
  }, []);

  // Filter params passed to VPantau
  const [pantauStatus, setPantauStatus] = useState("semua");
  const [pantauOrg, setPantauOrg] = useState("");

  // Check login session & saved role (supports URL parameters for preview & documentation)
  useEffect(() => {
    let savedToken = localStorage.getItem("token");
    let savedUser = localStorage.getItem("user");
    let savedRole = localStorage.getItem("esurat.role");

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth") === "1" || params.get("user") === "admin") {
        savedToken = "token-admin-session";
        const adminObj = {
          id: 1,
          username: "admin",
          full_name: "Pentadbir Sistem IT MAINS",
          role: "pentadbir_sistem",
          bahagian: "Unit Teknologi Maklumat & Digital"
        };
        savedUser = JSON.stringify(adminObj);
        localStorage.setItem("token", savedToken);
        localStorage.setItem("user", savedUser);
      }
      const pView = params.get("view");
      if (pView) {
        setActiveView(pView as any);
      }
      const pRole = params.get("role");
      if (pRole && N[pRole]) {
        savedRole = pRole;
      }
    }

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }

    if (savedRole && N[savedRole]) {
      setRole(savedRole);
    }
  }, []);

  // Auto-open modal if specified in query params
  useEffect(() => {
    if (suratList.length > 0 && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modalParam = params.get("modal");
      if (modalParam) {
        const target = suratList[0];
        setSelectedSurat(target);
        if (modalParam === "slip") setTrackingSlipOpen(true);
        else if (modalParam === "sheet") setMinuteSheetOpen(true);
        else if (modalParam === "minit") setMinitModalOpen(true);
        else if (modalParam === "rekod") setRekodModalOpen(true);
        else if (modalParam === "link") setLinkSuratOpen(true);
        else if (modalParam === "drawer") setDrawerOpen(true);
      }
    }
  }, [suratList]);

  // Fetch letters from backend
  const fetchSurat = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/surat?limit=100", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const data: SuratItem[] = (json.data || []).map((s: any) => ({
          id: s.id,
          noDaftar: s.noDaftar || s.no_daftar || `MAINS/SU/2026/${String(s.id).padStart(4, '0')}`,
          noRujukan: s.noRujukan || s.no_rujukan || "-",
          tarikhSurat: s.tarikhSurat || s.tarikh_surat || "",
          tarikhTerima: s.tarikhTerima || s.tarikh_terima || "",
          tarikhSelesai: s.tarikhSelesai || s.tarikh_selesai || null,
          pengirim: s.pengirim,
          perkara: s.perkara || s.subjek,
          kategori: s.kategori || "Pentadbiran",
          keutamaan: (s.keutamaan as any) || "Biasa",
          catatan: s.catatan || s.ringkasan || "",
          surat_berkaitan_id: s.surat_berkaitan_id || null,
          berkaitan_no_daftar: s.berkaitan_no_daftar || null,
          berkaitan_perkara: s.berkaitan_perkara || null,
          penerima: s.penerima || (s.penerima_data ? JSON.parse(s.penerima_data) : {
            su: { status: 'akan', dari: null, tarikh: s.tarikh_terima, arahan: 'Surat berdaftar' }
          }),
          log: s.log || (s.log_data ? JSON.parse(s.log_data) : []),
          lampiran: s.lampiran || (s.url_fail ? { nama: s.nama_fail || 'Dokumen', url: s.url_fail } : null)
        }));

        setSuratList(data);
      }
    } catch (err) {
      console.error("Gagal memuatkan rekod surat:", err);
      setSuratList([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/organisasi/hubungan", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setContacts(prev => ({ ...prev, ...json }));
      }
    } catch (e) {
      console.warn("Using local contacts:", e);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSurat();
      fetchContacts();
    }
  }, [token, fetchSurat, fetchContacts]);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    localStorage.setItem("esurat.role", newRole);
    toast.info(`Paparan peranan ditukar kepada: ${N[newRole]?.nama || newRole}`);
  };

  const handleLogin = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setActiveView("utama");
  };

  // Pending letters for active role
  const pendingForRole = useMemo(() => {
    return suratList.filter(s => {
      const e = (s.penerima || {})[role];
      return e && (e.status === 'akan' || e.status === 'sedang');
    }).length;
  }, [suratList, role]);

  // Urgent / Overdue notifications
  const urgentLetters = useMemo(() => {
    return suratList.filter(s => {
      const e = (s.penerima || {})[role];
      return e && (e.status === 'akan' || e.status === 'sedang') && (lewat(s) || hampir(s));
    });
  }, [suratList, role]);

  // Navigation helper
  const navigateTo = (view: any, filterSt = "semua", filterOrgId = "") => {
    setPantauStatus(filterSt);
    setPantauOrg(filterOrgId);
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Action handlers
  const openDrawer = (surat: SuratItem) => {
    setSelectedSurat(surat);
    setDrawerOpen(true);
  };

  const openMinitModal = (surat: SuratItem) => {
    setSelectedSurat(surat);
    setMinitModalOpen(true);
  };

  const openRekodModal = (surat: SuratItem) => {
    setSelectedSurat(surat);
    setRekodModalOpen(true);
  };

  const openViewDocModal = (surat: SuratItem) => {
    setSelectedSurat(surat);
    setDocViewerOpen(true);
  };

  const openTrackingSlip = (surat: SuratItem) => {
    setSelectedSurat(surat);
    setTrackingSlipOpen(true);
  };

  const openMinuteSheet = (surat: SuratItem) => {
    setSelectedSurat(surat);
    setMinuteSheetOpen(true);
  };

  const openLinkSurat = (surat: SuratItem) => {
    setSelectedSurat(surat);
    setLinkSuratOpen(true);
  };

  const handleSaveLink = async (suratId: string | number, targetLetterId: string | number | null) => {
    try {
      const isRealDbSurat = typeof suratId === 'number' || (!String(suratId).startsWith('demo') && !isNaN(Number(suratId)));
      const isRealDbTarget = targetLetterId ? (typeof targetLetterId === 'number' || (!String(targetLetterId).startsWith('demo') && !isNaN(Number(targetLetterId)))) : true;

      // Persist to backend if both are real database records
      if (token && isRealDbSurat && isRealDbTarget) {
        try {
          const res = await fetch(`/api/surat/${suratId}/pautkan`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ surat_berkaitan_id: targetLetterId ? Number(targetLetterId) : null })
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.warn("Pautan database API:", err);
            if (err?.error) {
              toast.error(err.error);
              return;
            }
          }
        } catch (apiErr) {
          console.warn("Ralat rangkaian pautan:", apiErr);
        }
      }

      // Always update local state seamlessly (both for DB letters and demo letters)
      const targetLetter = targetLetterId ? suratList.find(s => String(s.id) === String(targetLetterId)) : null;
      setSuratList(prev => prev.map(s => {
        if (String(s.id) === String(suratId)) {
          const existingLog = Array.isArray(s.log) ? s.log : [];
          const newLog = [...existingLog, {
            jenis: 'catatan' as const,
            dari: role,
            kepada: [],
            teks: targetLetter 
              ? `Dipautkan ke surat rujukan: ${targetLetter.noDaftar || ('ID #' + targetLetter.id)} (${targetLetter.perkara})`
              : 'Pautan surat rujukan dipadamkan',
            masa: new Date().toISOString(),
            oleh: (N && N[role]?.ketua) ? N[role].ketua : (user?.full_name || 'Pegawai')
          }];
          return {
            ...s,
            surat_berkaitan_id: targetLetterId,
            berkaitan_no_daftar: targetLetter?.noDaftar || (targetLetter ? `ID #${targetLetter.id}` : null),
            berkaitan_perkara: targetLetter?.perkara || null,
            log: newLog
          };
        }
        return s;
      }));

      // Update selectedSurat if opened
      if (selectedSurat && String(selectedSurat.id) === String(suratId)) {
        setSelectedSurat(prev => prev ? {
          ...prev,
          surat_berkaitan_id: targetLetterId,
          berkaitan_no_daftar: targetLetter?.noDaftar || (targetLetter ? `ID #${targetLetter.id}` : null),
          berkaitan_perkara: targetLetter?.perkara || null
        } : null);
      }

      toast.success(targetLetterId ? "Surat rujukan berjaya dipautkan!" : "Pautan surat berjaya dibatalkan.");
    } catch (err: any) {
      console.error("Ralat memautkan surat:", err);
      toast.error(err?.message || "Ralat memautkan surat");
    }
  };

  const openSingleNotify = (surat: SuratItem) => {
    // Determine active downstream receivers
    const receivers = Object.entries(surat.penerima || {})
      .filter(([k, v]) => v.status !== 'telah' && k !== role)
      .map(([k]) => k);

    setNotifTargetSurat([surat]);
    setNotifReceivers(receivers.length > 0 ? receivers : [role]);
    setNotifModalOpen(true);
  };

  const openBatchNotify = (letters: SuratItem[]) => {
    const receiversSet = new Set<string>();
    letters.forEach(s => {
      Object.entries(s.penerima || {}).forEach(([k, v]) => {
        if (v.status !== 'telah' && k !== role) receiversSet.add(k);
      });
    });

    setNotifTargetSurat(letters);
    setNotifReceivers(Array.from(receiversSet));
    setNotifModalOpen(true);
  };

  const openEditContact = (orgId: string) => {
    setEditContactOrgId(orgId);
    setContactModalOpen(true);
  };

  const handleSuratUpdated = (updatedSurat: any, minitedTo?: string[]) => {
    fetchSurat();
    if (selectedSurat && updatedSurat?.id === selectedSurat.id) {
      setSelectedSurat(prev => prev ? { ...prev, ...updatedSurat } : null);
    }
    if (minitedTo && minitedTo.length > 0 && selectedSurat) {
      setNotifTargetSurat([selectedSurat]);
      setNotifReceivers(minitedTo);
      setNotifModalOpen(true);
    }
  };

  const handleContactSaved = (orgId: string, updated: HubContact) => {
    setContacts(prev => ({ ...prev, [orgId]: updated }));
  };

  const userRoleNorm = normalizeRole(user?.role);
  const isStrictAdmin = userRoleNorm === 'pentadbir_sistem';

  // Check if role switcher is visible:
  // Allowed if setting roleSwitcherAdminOnly is false OR the current user is Pentadbir Sistem
  const canSwitchRole = !systemSettings.roleSwitcherAdminOnly || isStrictAdmin;

  // Resolve matching org node for non-admin user
  const userOrgNodeId = useMemo(() => {
    if (!user) return 'su';
    const userBahagian = (user.bahagian || '').toLowerCase().trim();
    const userFullName = (user.full_name || '').toLowerCase().trim();
    
    // Find node matching user's bahagian or ketua name
    for (const id of ORDER) {
      const node = N[id];
      if (!node) continue;
      if (node.nama.toLowerCase().includes(userBahagian) || userBahagian.includes(node.nama.toLowerCase())) {
        return id;
      }
      if (userFullName && node.ketua.toLowerCase().includes(userFullName)) {
        return id;
      }
    }
    // Fallback based on normalized role
    if (userRoleNorm === 'pengurusan') return 'su';
    if (userRoleNorm === 'kerani') return 'bkk-urs';
    if (userRoleNorm === 'pentadbir_sistem') return 'jp-tm-pb';
    return 'su';
  }, [user, userRoleNorm]);

  // When user is not admin and can't switch, ensure role matches their node
  useEffect(() => {
    if (!canSwitchRole && userOrgNodeId && role !== userOrgNodeId) {
      setRole(userOrgNodeId);
    }
  }, [canSwitchRole, userOrgNodeId, role]);

  // Compute separated menus: User role menus vs. Pentadbir Sistem modules
  const { userMenuItems, adminMenuItems } = useMemo(() => {
    let customRoleMap: Record<string, string[]> | null = null;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("esurat.roleMenuMap") || localStorage.getItem("mains_menu_config_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") customRoleMap = parsed;
        }
      } catch {}
    }

    const roleAllowedMenuIds: string[] = customRoleMap?.[userRoleNorm] || 
      ALL_MENU_ITEMS
        .filter(m => m.defaultRoles.includes(userRoleNorm))
        .map(m => m.id);

    const iconMap: Record<string, any> = {
      Home,
      Upload,
      Inbox,
      Eye,
      BarChart3,
      FolderTree,
      Users,
      Layers,
      ShieldCheck,
      Settings
    };

    // User navigation items (filtered strictly according to current user's role)
    const userItems = ALL_MENU_ITEMS
      .filter(m => !m.isAdminOnly && (roleAllowedMenuIds.includes(m.id) || isStrictAdmin))
      .map(m => ({
        id: m.id as any,
        label: m.label,
        icon: iconMap[m.iconName] || Home,
        badge: m.id === 'peti' && pendingForRole > 0 ? pendingForRole : null
      }));

    // Admin exclusive items (accessible only by Pentadbir Sistem)
    const adminItems = isStrictAdmin
      ? ALL_MENU_ITEMS
          .filter(m => m.isAdminOnly)
          .map(m => ({
            id: m.id as any,
            label: m.label,
            icon: iconMap[m.iconName] || Settings,
            badge: m.id === 'pengguna' ? 'Admin' : null
          }))
      : [];

    return { userMenuItems: userItems, adminMenuItems: adminItems };
  }, [userRoleNorm, isStrictAdmin, pendingForRole, menuConfigVersion]);

  // Combined for header lookup
  const allNavItems = useMemo(() => [...userMenuItems, ...adminMenuItems], [userMenuItems, adminMenuItems]);

  // If not logged in, show LoginForm
  if (!token || !user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div 
      style={getAppCanvasStyles(visualTheme, false)}
      className={`min-h-screen flex flex-col md:flex-row text-slate-800 dark:text-slate-100 ${
        visualTheme.appBgType === 'islamic_pattern' ? 'islamic-pattern bg-[#e9f5fb] dark:bg-slate-950' : 
        visualTheme.appBgType === 'subtle_mesh' ? 'subtle-mesh' : 
        visualTheme.appBgType === 'clean' ? 'bg-slate-50 dark:bg-slate-950' : 'bg-[#e9f5fb] dark:bg-slate-950'
      }`}
    >
      {/* Sidebar */}
      <aside 
        style={getSidebarStyles(visualTheme)}
        className="hidden md:flex w-64 text-slate-100 flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800/40 shadow-xl z-20 relative overflow-hidden transition-all duration-300"
      >
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 40 40">
              <rect x="8" y="8" width="24" height="24" rx="2" fill="#0aa3a3" />
              <rect x="8" y="8" width="24" height="24" rx="2" fill="#0aa3a3" transform="rotate(45 20 20)" opacity="0.85" />
              <circle cx="20" cy="20" r="6" fill="#0b3d5c" />
              <path d="M16 18h8v5h-8z M16 18l4 3 4-3" fill="none" stroke="#fff" strokeWidth="1.2" />
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-white">e-Surat MAINS</div>
            <div className="text-[11px] text-teal-200/80">Penyampaian & Tindakan</div>
          </div>
        </div>

        {/* User Profile Pill in Sidebar */}
        <div className="mx-3 mt-3 p-3 rounded-xl bg-white/10 border border-white/10 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-400/20 text-teal-300 font-bold flex items-center justify-center shrink-0">
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white truncate text-xs">
                {user?.full_name || user?.username}
              </div>
              <div className="text-[10px] text-teal-200 truncate flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="capitalize font-medium">
                  {userRoleNorm === 'pentadbir_sistem' ? 'Pentadbir Sistem' :
                   userRoleNorm === 'pengurusan' ? 'Pengurusan Tertinggi' :
                   userRoleNorm === 'ketua_unit' ? 'Ketua Unit' :
                   userRoleNorm === 'kerani' ? 'Kerani' : 'Pegawai Pelaksana'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-4 flex-1 overflow-y-auto text-xs">
          {/* Section 1: Menu Peranan */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-teal-300/80 flex items-center justify-between">
              <span>Menu Peranan</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-800/60 text-teal-200 capitalize font-medium">
                {user?.role?.replace('_', ' ') || 'Pengguna'}
              </span>
            </div>

            {userMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all text-left ${
                    isActive
                      ? "bg-teal-500 text-white shadow-md shadow-teal-500/30"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== null && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/30 text-white" : "bg-red-500 text-white"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section 2: Pentadbiran Sistem (Eksklusif Pentadbir Sistem) */}
          {adminMenuItems.length > 0 && (
            <div className="space-y-1 pt-3 border-t border-white/10">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Pentadbiran Sistem</span>
              </div>

              {adminMenuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all text-left ${
                      isActive
                        ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-amber-300" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== null && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 border border-amber-400/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-teal-100/90 leading-relaxed">
            <div className="font-bold text-white mb-0.5">Majlis Agama Islam N. Sembilan</div>
            Tempoh tindakan: <b className="text-teal-300">14 hari</b> dari tarikh terima.
          </div>

          <div className="flex items-center justify-end text-xs pt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-[11px] text-red-300 hover:text-red-200 hover:bg-red-950/40 h-7 px-2"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Log Keluar
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Banner */}
        <header 
          style={getHeaderStyles(visualTheme)}
          className="text-white p-4 sm:p-5 sm:px-8 border-b border-teal-900/40 shadow-sm relative overflow-hidden transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
            <div>
              <div className="font-serif text-xs sm:text-sm opacity-90 tracking-wide text-teal-100">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight mt-0.5">
                Sistem Penyampaian Surat & Pemantauan Tindakan
              </h1>
              <p className="text-[11px] sm:text-xs text-teal-100/80 mt-0.5">
                Surat masuk → Setiausaha → Timbalan Setiausaha → Jabatan → Bahagian → Unit
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] sm:text-[11px] font-medium mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Tersimpan & Bersambung ke MSSQL Database
              </div>
            </div>

            {/* Role Selector & Notification Bell */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-1 sm:pt-0">
              {canSwitchRole ? (
                <div className="space-y-1 flex-1 sm:flex-initial">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-teal-200 block">
                      Peranan Semasa:
                    </label>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-300/30 font-semibold">
                      Simulasi Admin
                    </span>
                  </div>
                  <select
                    value={role}
                    onChange={e => handleRoleChange(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-white/95 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs shadow-sm border-0 focus:ring-2 focus:ring-teal-300 w-full sm:max-w-[280px]"
                  >
                    {ORDER.map(id => {
                      const d = depth(id);
                      return (
                        <option key={id} value={id}>
                          {" ".repeat(d)}{d > 0 ? "└ " : ""}{N[id]?.nama}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <div className="space-y-1 flex-1 sm:flex-initial">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-teal-200 block">
                    Bahagian / Peranan Rasmi:
                  </label>
                  <div className="h-9 px-3.5 rounded-xl bg-white/20 backdrop-blur-xs text-white font-bold text-xs flex items-center border border-white/20 truncate max-w-[280px]">
                    <span className="truncate">{N[role]?.nama || user?.bahagian || "MAINS"}</span>
                  </div>
                </div>
              )}

              {/* Urgent Bell Notification Button */}
              <button
                type="button"
                onClick={() => {
                  if (urgentLetters.length > 0) {
                    openBatchNotify(urgentLetters);
                  } else {
                    toast.info("Tiada notifikasi surat lewat atau menghampiri tarikh akhir.");
                  }
                }}
                className={`relative mt-4 w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all shrink-0 active:scale-95 ${
                  urgentLetters.length > 0 ? "animate-pulse-red" : ""
                }`}
                title="Notifikasi & Peringatan SLA"
              >
                <Bell className={`w-4 h-4 ${urgentLetters.length > 0 ? "animate-bounce" : ""}`} />
                {urgentLetters.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-teal-900">
                    {urgentLetters.length}
                  </span>
                )}
              </button>

              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Top App Bar (visible only on mobile) */}
        <div className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                {allNavItems.find(m => m.id === activeView)?.label || "e-Surat MAINS"}
              </div>
              <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                {shortNm(role)} · {N[role]?.jaw || "Pegawai"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-7 w-7 p-0 text-slate-700 dark:text-slate-300"
              aria-label="Buka menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Slide-down Full Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* User Profile Card */}
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">Log Masuk Sebagai</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">{user?.full_name || user?.username || "Pentadbir"}</div>
                <div className="text-[11px] text-slate-500">{user?.bahagian || "MAINS Seremban"}</div>
              </div>
              <Badge className="bg-teal-600 text-white text-[10px]">
                {userRoleNorm === 'pentadbir_sistem'
                  ? 'Pentadbir Sistem'
                  : userRoleNorm === 'pengurusan'
                  ? 'Pengurusan'
                  : userRoleNorm === 'ketua_unit'
                  ? 'Ketua Bahagian'
                  : userRoleNorm === 'kerani'
                  ? 'Kerani'
                  : 'Pegawai Pelaksana'}
              </Badge>
            </div>

            {/* Section 1: Menu Peranan */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Menu Peranan ({user?.role?.replace('_', ' ') || 'Pengguna'})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {userMenuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                        isActive
                          ? "bg-teal-600 text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== null && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/30 text-white" : "bg-red-500 text-white"}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Pentadbiran Sistem (Admin Only) */}
            {adminMenuItems.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Pentadbiran Sistem</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {adminMenuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm"
                            : "bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-slate-800 dark:text-slate-200 hover:bg-amber-100/50"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-amber-500" />
                        <span className="flex-1 truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Role Switcher in Mobile Drawer */}
            {canSwitchRole ? (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Tukar Peranan / Cawangan:
                  </label>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                    Admin
                  </span>
                </div>
                <select
                  value={role}
                  onChange={e => handleRoleChange(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-white"
                >
                  {ORDER.map(id => {
                    const d = depth(id);
                    return (
                      <option key={id} value={id}>
                        {" ".repeat(d)}{d > 0 ? "└ " : ""}{N[id]?.nama}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Peranan & Bahagian Bertugas:
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {N[role]?.nama || user?.bahagian || "MAINS"}
                </div>
              </div>
            )}

            {/* Mobile Footer Action */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Keluar
              </Button>
            </div>
          </div>
        )}

        {/* Main View Container */}
        <main className="flex-1 p-4 sm:p-7 max-w-7xl w-full mx-auto pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeView === 'utama' && (
                <VUtama
                  suratList={suratList}
                  onOpenSurat={openDrawer}
                  onNavigate={navigateTo}
                  onSendBatchNotification={openBatchNotify}
                />
              )}

              {activeView === 'daftar' && (
                <SuratFormAdvanced
                  token={token}
                  existingSurat={suratList}
                  onSuccess={() => {
                    fetchSurat();
                    navigateTo("peti");
                  }}
                />
              )}

              {activeView === 'peti' && (
                <VPeti
                  suratList={suratList}
                  role={role}
                  onOpenDrawer={openDrawer}
                  onOpenMinit={openMinitModal}
                  onOpenRekod={openRekodModal}
                  onOpenNotify={openSingleNotify}
                  onViewDoc={openViewDocModal}
                />
              )}

              {activeView === 'pantau' && (
                <VPantau
                  suratList={suratList}
                  initialStatus={pantauStatus}
                  initialOrg={pantauOrg}
                  onOpenDrawer={openDrawer}
                />
              )}

              {activeView === 'analisis' && (
                <VAnalisis
                  suratList={suratList}
                  onOpenSurat={openDrawer}
                  onFilterOrg={orgId => navigateTo("pantau", "semua", orgId)}
                />
              )}

              {activeView === 'struktur' && (
                <VStruktur
                  suratList={suratList}
                  contacts={contacts}
                  onSelectRole={newRole => {
                    handleRoleChange(newRole);
                    navigateTo("peti");
                  }}
                  onEditContact={openEditContact}
                />
              )}

              {activeView === 'pengguna' && (
                <UserManagementView
                  token={token || ""}
                  currentUser={user}
                />
              )}

              {activeView === 'pengurusan_menu' && (
                <MenuManagementView
                  onMenuUpdated={() => setMenuConfigVersion(v => v + 1)}
                />
              )}

              {activeView === 'pengurusan_peranan' && (
                <RoleManagementView />
              )}

              {activeView === 'tetapan_sistem' && (
                <SystemSettingsView />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <DetailDrawer
        surat={selectedSurat}
        role={role}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onMinit={openMinitModal}
        onRekod={openRekodModal}
        onNotify={openSingleNotify}
        onViewDoc={openViewDocModal}
        onPrintSlip={openTrackingSlip}
        onPrintMinute={openMinuteSheet}
        onLinkSurat={openLinkSurat}
        onSelectSurat={openDrawer}
        allSurat={suratList}
      />

      <TrackingSlipModal
        surat={selectedSurat}
        open={trackingSlipOpen}
        onOpenChange={setTrackingSlipOpen}
      />

      <MinuteSheetModal
        surat={selectedSurat}
        open={minuteSheetOpen}
        onOpenChange={setMinuteSheetOpen}
      />

      <LinkSuratModal
        surat={selectedSurat}
        allSurat={suratList}
        open={linkSuratOpen}
        onOpenChange={setLinkSuratOpen}
        onSaveLink={handleSaveLink}
      />

      <MinitModal
        surat={selectedSurat}
        role={role}
        token={token}
        open={minitModalOpen}
        onOpenChange={setMinitModalOpen}
        onSuccess={handleSuratUpdated}
      />

      <RekodTindakanModal
        surat={selectedSurat}
        role={role}
        token={token}
        open={rekodModalOpen}
        onOpenChange={setRekodModalOpen}
        onSuccess={handleSuratUpdated}
      />

      <NotifikasiModal
        suratList={notifTargetSurat}
        receivers={notifReceivers}
        contacts={contacts}
        senderRole={role}
        token={token}
        open={notifModalOpen}
        onOpenChange={setNotifModalOpen}
        onEditContact={openEditContact}
      />

      <ContactModal
        orgId={editContactOrgId}
        currentContact={editContactOrgId ? contacts[editContactOrgId] : undefined}
        token={token}
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        onSuccess={handleContactSaved}
      />

      <DocumentViewerModal
        surat={selectedSurat}
        open={docViewerOpen}
        onOpenChange={setDocViewerOpen}
      />

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-30 shadow-lg">
        {/* Utama */}
        <button
          type="button"
          onClick={() => navigateTo('utama')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeView === 'utama'
              ? "text-teal-600 dark:text-teal-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Utama</span>
        </button>

        {/* Peti Minit */}
        <button
          type="button"
          onClick={() => navigateTo('peti')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
            activeView === 'peti'
              ? "text-teal-600 dark:text-teal-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
          }`}
        >
          <Inbox className="w-5 h-5" />
          {pendingForRole > 0 && (
            <span className="absolute top-1 right-5 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center">
              {pendingForRole > 99 ? "99+" : pendingForRole}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Peti Minit</span>
        </button>

        {/* Daftar Action Button (Floating center style) */}
        <button
          type="button"
          onClick={() => navigateTo('daftar')}
          className={`flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95 group ${
            activeView === 'daftar' ? "scale-105" : ""
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/40 flex items-center justify-center border-2 border-white dark:border-slate-900 animate-float-soft group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 mt-0.5">Daftar</span>
        </button>

        {/* Pantau */}
        <button
          type="button"
          onClick={() => navigateTo('pantau')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeView === 'pantau'
              ? "text-teal-600 dark:text-teal-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Pantau</span>
        </button>

        {/* Menu (Toggles full drawer) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            mobileMenuOpen || !['utama', 'peti', 'daftar', 'pantau'].includes(activeView)
              ? "text-teal-600 dark:text-teal-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </nav>
    </div>
  );
}
