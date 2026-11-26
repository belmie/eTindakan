"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  PlusCircle, 
  Users, 
  BarChart3, 
  Bell, 
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  Building,
  MailCheck,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  user: any;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  notifications: number;
}

export function Sidebar({ user, activeView, onViewChange, onLogout, notifications }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard Eksekutif', 
      icon: LayoutDashboard, 
      roles: ['all'],
      description: 'Ringkasan & statistik utama' 
    },
    { 
      id: 'surat-masuk', 
      label: 'Pengurusan Surat', 
      icon: FileText, 
      roles: ['all'],
      description: 'Senarai & tindakan surat' 
    },
    { 
      id: 'daftar-surat', 
      label: 'Daftar Surat Baru', 
      icon: PlusCircle, 
      roles: ['kerani', 'ketua_unit', 'pengurusan'],
      description: 'Daftar rekod & lampiran' 
    },
    { 
      id: 'pengguna', 
      label: 'Direktori Kakitangan', 
      icon: Users, 
      roles: ['pengurusan'],
      description: 'Akses & peranan pegawai' 
    },
    { 
      id: 'laporan', 
      label: 'Laporan & Audit', 
      icon: BarChart3, 
      roles: ['ketua_unit', 'pengurusan'],
      description: 'Statistik & analisis tempoh' 
    },
    { 
      id: 'notifikasi', 
      label: 'Notifikasi Tindakan', 
      icon: Bell, 
      roles: ['all'], 
      badge: notifications,
      description: 'Pemberitahuan terkini'
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(user?.role || 'pengurusan')
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pengurusan':
        return { label: 'Pengurusan Tertinggi', bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'ketua_unit':
        return { label: 'Ketua Unit', bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'pegawai_pelaksana':
        return { label: 'Pegawai Tindakan', bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      default:
        return { label: 'Kerani Pejabat', bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    }
  };

  const roleInfo = getRoleBadge(user?.role || 'pengurusan');

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-white/10 shrink-0">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">STSM</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                MAINS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate tracking-wide">
              Majlis Agama Islam N. Sembilan
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-2">
        <Separator className="bg-slate-800" />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu Utama
        </div>

        {filteredMenuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group relative ${
                isActive 
                  ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-600/25" 
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-700/60"
              }`}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-sm truncate block leading-tight">
                  {item.label}
                </span>
                <span className={`text-[10px] truncate block ${
                  isActive ? "text-blue-100/80" : "text-slate-400"
                }`}>
                  {item.description}
                </span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white shrink-0 animate-pulse">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-4 h-4 text-white/70 ml-auto shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Card */}
      <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 m-3 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-inner shrink-0">
            {user?.full_name ? user.full_name.charAt(0) : "U"}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-bold text-white truncate leading-snug">
              {user?.full_name || "Kakitangan MAINS"}
            </p>
            <div className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 truncate ${roleInfo.bg}`}>
              {roleInfo.label}
            </div>
          </div>
        </div>

        {user?.bahagian && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mb-3 px-1">
            <Building className="w-3 h-3 shrink-0 text-slate-500" />
            <span className="truncate">{user.bahagian}</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl h-8 px-2.5 transition-colors"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Log Keluar
        </Button>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-3 left-3 z-50 bg-slate-900 text-white hover:bg-slate-800 shadow-md rounded-xl"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Buka Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <SidebarContent />
      </aside>
    </>
  );
}
