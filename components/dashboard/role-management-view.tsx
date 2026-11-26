"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  PERMISSION_LIST, 
  DEFAULT_ROLE_PERMISSIONS, 
  RolePermissionDetail 
} from "@/lib/menu-config";
import { ROLE_CONFIG, normalizeRole } from "@/components/dashboard/user-management-view";
import { 
  ShieldCheck, 
  Shield, 
  CheckCircle2, 
  RotateCcw, 
  Lock, 
  Users, 
  Building, 
  Layers, 
  FileText, 
  Sliders, 
  Info,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";

export function RoleManagementView() {
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("esurat.rolePermissions");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  const [activeFilterCategory, setActiveFilterCategory] = useState<string>("semua");

  const togglePermission = (role: string, permId: string) => {
    // Pentadbir Sistem always keeps system admin perms
    if (role === "pentadbir_sistem" && ["urus_pengguna", "urus_menu", "urus_peranan", "tetapan_sistem"].includes(permId)) {
      toast.info("Hak akses pentadbiran wajib dikekalkan untuk Pentadbir Sistem.");
      return;
    }

    setRolePermissions(prev => {
      const current = prev[role] || [];
      const hasPerm = current.includes(permId);
      const updated = hasPerm
        ? current.filter(p => p !== permId)
        : [...current, permId];

      return {
        ...prev,
        [role]: updated
      };
    });
  };

  const handleSave = () => {
    localStorage.setItem("esurat.rolePermissions", JSON.stringify(rolePermissions));
    toast.success("Matriks peranan dan hak akses kakitangan berjaya disimpan!");
  };

  const handleReset = () => {
    if (!confirm("Kembalikan matriks peranan kepada tetapan asal piawai MAINS?")) return;
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    localStorage.removeItem("esurat.rolePermissions");
    toast.success("Matriks peranan dikembalikan kepada tetapan asal.");
  };

  const categories = [
    { id: "semua", label: "Semua Kategori" },
    { id: "surat", label: "Pendaftaran & Rujukan" },
    { id: "minit", label: "Minit & Tindakan" },
    { id: "cetakan", label: "Cetakan & Slip" },
    { id: "analisis", label: "Laporan & SLA" },
    { id: "pentadbiran", label: "Pentadbiran Sistem" },
  ];

  const filteredPermissions = PERMISSION_LIST.filter(p => {
    if (activeFilterCategory === "semua") return true;
    return p.category === activeFilterCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pengurusan Peranan & Kebenaran (RBAC)
            </h1>
            <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 text-[10px] font-bold">
              Eksklusif Pentadbir
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kawal selia matriks hak kuasa (*Role-Based Access Control*), had kebenaran minit, pendaftaran, dan cetakan rasmi kakitangan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="rounded-xl h-9 text-xs gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Set Semula
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            className="rounded-xl h-9 px-4 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan Matriks Peranan
          </Button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(ROLE_CONFIG).map(([roleKey, cfg]) => {
          const Icon = cfg.icon;
          const permCount = (rolePermissions[roleKey] || []).length;

          return (
            <div
              key={roleKey}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 card-hover-lift"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cfg.color} text-white flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}>
                  {permCount} Hak Kuasa
                </span>
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                  {cfg.shortLabel}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                  {cfg.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permission Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilterCategory === cat.id
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 min-w-[240px]">Fungsi & Hak Kuasa Tindakan</th>
                <th className="p-3.5 text-center min-w-[120px] text-rose-700 dark:text-rose-400">🛡️ Pentadbir</th>
                <th className="p-3.5 text-center min-w-[120px] text-amber-700 dark:text-amber-400">🏛️ Pengurusan</th>
                <th className="p-3.5 text-center min-w-[120px] text-emerald-700 dark:text-emerald-400">🏢 Ketua Bahagian</th>
                <th className="p-3.5 text-center min-w-[120px] text-purple-700 dark:text-purple-400">⚡ Pegawai</th>
                <th className="p-3.5 text-center min-w-[120px] text-sky-700 dark:text-sky-400">📝 Kerani</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPermissions.map(perm => {
                return (
                  <tr key={perm.id} className="hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {perm.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {perm.desc}
                      </div>
                    </td>

                    {/* Checkbox per role */}
                    {Object.keys(ROLE_CONFIG).map(roleKey => {
                      const hasAccess = (rolePermissions[roleKey] || []).includes(perm.id);
                      const isLocked = roleKey === "pentadbir_sistem" && ["urus_pengguna", "urus_menu", "urus_peranan", "tetapan_sistem"].includes(perm.id);

                      return (
                        <td key={roleKey} className="p-3.5 text-center">
                          <div className="flex items-center justify-center">
                            {isLocked ? (
                              <span className="p-1 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-600" title="Hak akses asas kekal aktif">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={hasAccess}
                                onChange={() => togglePermission(roleKey, perm.id)}
                                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700 cursor-pointer accent-teal-600"
                              />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Policy Notice */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 dark:text-white">Dasar Keselamatan Peranan Sistem e-Surat MAINS</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Perubahan hak kuasa peranan ini akan berkuat kuasa secara langsung untuk semua kakitangan yang memegang peranan berkenaan sebaik sahaja disimpan. Pentadbir Sistem sentiasa mengekalkan kebenaran pentadbiran demi mengelakkan penguncian akaun sistem (*lockout*).
          </p>
        </div>
      </div>
    </motion.div>
  );
}
