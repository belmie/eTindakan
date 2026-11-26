"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ALL_MENU_ITEMS, 
  MenuItemConfig 
} from "@/lib/menu-config";
import { ROLE_CONFIG, normalizeRole } from "@/components/dashboard/user-management-view";
import { 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  ExternalLink, 
  Eye, 
  Lock, 
  Sparkles,
  Info,
  Home,
  Upload,
  Inbox,
  BarChart3,
  FolderTree,
  Users,
  Settings
} from "lucide-react";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
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

interface MenuManagementViewProps {
  onMenuUpdated?: () => void;
}

export function MenuManagementView({ onMenuUpdated }: MenuManagementViewProps) {
  const [activeRole, setActiveRole] = useState<string>("pengurusan");
  const [roleMenuMap, setRoleMenuMap] = useState<Record<string, string[]>>(() => {
    // Load from localStorage or defaults
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("esurat.roleMenuMap");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    // Default map
    const initial: Record<string, string[]> = {};
    Object.keys(ROLE_CONFIG).forEach(role => {
      initial[role] = ALL_MENU_ITEMS
        .filter(m => m.defaultRoles.includes(role))
        .map(m => m.id);
    });
    return initial;
  });

  const [customLinks, setCustomLinks] = useState<Array<{ id: string; label: string; url: string; roles: string[] }>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("esurat.customLinks");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      { id: "portal-mains", label: "Portal Rasmi MAINS", url: "https://www.mains.gov.my", roles: ["pentadbir_sistem", "pengurusan", "ketua_unit", "pegawai_pelaksana", "kerani"] },
      { id: "e-zakat", label: "Sistem e-Zakat MAINS", url: "https://zakat.mains.gov.my", roles: ["pentadbir_sistem", "pengurusan", "ketua_unit"] }
    ];
  });

  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [addLinkOpen, setAddLinkOpen] = useState(false);

  // Toggle a menu item for activeRole
  const toggleMenuItem = (menuId: string) => {
    if (activeRole === "pentadbir_sistem" && ["pengguna", "pengurusan_menu", "pengurusan_peranan", "tetapan_sistem"].includes(menuId)) {
      toast.info("Modul pentadbir sistem wajib kekal aktif untuk Pentadbir Sistem.");
      return;
    }

    setRoleMenuMap(prev => {
      const currentList = prev[activeRole] || [];
      const isCurrentlyActive = currentList.includes(menuId);
      const updatedList = isCurrentlyActive
        ? currentList.filter(id => id !== menuId)
        : [...currentList, menuId];

      return {
        ...prev,
        [activeRole]: updatedList
      };
    });
  };

  const saveSettings = () => {
    localStorage.setItem("esurat.roleMenuMap", JSON.stringify(roleMenuMap));
    localStorage.setItem("esurat.customLinks", JSON.stringify(customLinks));
    toast.success("Tetapan agihan menu berjaya disimpan dan disegerakkan!");
    if (onMenuUpdated) onMenuUpdated();
  };

  const resetToDefault = () => {
    if (!confirm("Adakah anda pasti ingin mengembalikan susunan menu kepada tetapan lalai sistem?")) return;
    const initial: Record<string, string[]> = {};
    Object.keys(ROLE_CONFIG).forEach(role => {
      initial[role] = ALL_MENU_ITEMS
        .filter(m => m.defaultRoles.includes(role))
        .map(m => m.id);
    });
    setRoleMenuMap(initial);
    localStorage.removeItem("esurat.roleMenuMap");
    toast.success("Konfigurasi menu dikembalikan kepada tetapan asal.");
    if (onMenuUpdated) onMenuUpdated();
  };

  const handleAddCustomLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;

    const newLink = {
      id: `link-${Date.now()}`,
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim().startsWith("http") ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
      roles: ["pentadbir_sistem", activeRole]
    };

    setCustomLinks(prev => [...prev, newLink]);
    setNewLinkLabel("");
    setNewLinkUrl("");
    setAddLinkOpen(false);
    toast.success(`Pautan pantas "${newLink.label}" berjaya ditambah!`);
  };

  const activeMenusForSelectedRole = roleMenuMap[activeRole] || [];

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
              Pengurusan Menu Sistem
            </h1>
            <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 text-[10px] font-bold">
              Eksklusif Pentadbir
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kawal selia capaian paparan menu navigasi sistem e-Surat mengikut peranan kakitangan MAINS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={resetToDefault}
            className="rounded-xl h-9 text-xs gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Set Semula
          </Button>

          <Button
            size="sm"
            onClick={saveSettings}
            className="rounded-xl h-9 px-4 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simpan Tetapan Menu
          </Button>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Pilih Peranan Kakitangan untuk Dikonfigurasi:
        </Label>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {Object.entries(ROLE_CONFIG).map(([roleKey, cfg]) => {
            const isSelected = activeRole === roleKey;
            const Icon = cfg.icon;
            const count = (roleMenuMap[roleKey] || []).length;

            return (
              <motion.button
                key={roleKey}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveRole(roleKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-2 ring-teal-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cfg.shortLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  {count} Menu
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Strip for Selected Role */}
      <Card className="rounded-2xl border border-teal-200/60 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              Pratonton Navigasi Semasa untuk: <span className="text-teal-700 dark:text-teal-300">{ROLE_CONFIG[activeRole]?.label}</span>
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            {activeMenusForSelectedRole.length} menu aktif dipaparkan di bar navigasi
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {activeMenusForSelectedRole.map(mId => {
            const item = ALL_MENU_ITEMS.find(m => m.id === mId);
            if (!item) return null;
            const Icon = ICON_MAP[item.iconName] || Layers;

            return (
              <span
                key={mId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-semibold shadow-xs"
              >
                <Icon className="w-3.5 h-3.5 text-teal-600" />
                {item.label}
              </span>
            );
          })}
        </div>
      </Card>

      {/* Menu Items Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Senarai Modul & Status Keterlihatan:
          </Label>
          <span className="text-[11px] text-slate-400">
            Klik suis untuk mengaktifkan atau menyembunyikan menu
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ALL_MENU_ITEMS.map((item) => {
            const isEnabled = activeMenusForSelectedRole.includes(item.id);
            const Icon = ICON_MAP[item.iconName] || Layers;
            const isLockedAdmin = activeRole === "pentadbir_sistem" && item.isAdminOnly;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isEnabled
                    ? "bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-900/60 shadow-xs"
                    : "bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isEnabled
                      ? "bg-teal-50 dark:bg-teal-950 text-teal-600"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      {item.isAdminOnly && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          Khusus Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  {isLockedAdmin ? (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold" title="Wajib kekal aktif untuk Pentadbir Sistem">
                      <Lock className="w-3.5 h-3.5 text-amber-500" /> Kunci
                    </span>
                  ) : (
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleMenuItem(item.id)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom External Quick Links */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-teal-600" />
              Pautan Pantas Agensi (Portal / Sistem Luaran)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pautan luar yang dipaparkan pada bar navigasi untuk kemudahan kakitangan.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddLinkOpen(!addLinkOpen)}
            className="rounded-xl h-8 text-xs gap-1 border-slate-200 text-teal-700 hover:bg-teal-50"
          >
            <Plus className="w-3.5 h-3.5" />
            + Tambah Pautan
          </Button>
        </div>

        {/* Add link form */}
        <AnimatePresence>
          {addLinkOpen && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddCustomLink}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Nama Pautan *</Label>
                  <Input
                    required
                    placeholder="cth. Portal e-Wakaf MAINS"
                    value={newLinkLabel}
                    onChange={e => setNewLinkLabel(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Alamat URL Web *</Label>
                  <Input
                    required
                    placeholder="https://wakaf.mains.gov.my"
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => setAddLinkOpen(false)} className="h-8 text-xs">
                  Batal
                </Button>
                <Button type="submit" size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  Simpan Pautan
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid gap-2 sm:grid-cols-2">
          {customLinks.map(link => (
            <div
              key={link.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{link.label}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{link.url}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors"
                  title="Buka Pautan"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setCustomLinks(prev => prev.filter(x => x.id !== link.id))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  title="Padam Pautan"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
