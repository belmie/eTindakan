"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { N, KIDS, depth, ORDER, JENIS_LBL, HubContact } from "@/lib/org-data";
import { SuratItem, active, lewat } from "@/lib/sla-utils";
import {
  ChevronRight,
  ChevronDown,
  Phone,
  Inbox,
  FolderTree,
  Building2,
  Users
} from "lucide-react";

interface VStrukturProps {
  suratList: SuratItem[];
  contacts: Record<string, HubContact>;
  onSelectRole: (role: string) => void;
  onEditContact: (orgId: string) => void;
}

export function VStruktur({
  suratList,
  contacts,
  onSelectRole,
  onEditContact
}: VStrukturProps) {
  // Track open/collapsed state of tree nodes
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ORDER.forEach(id => {
      // Expand top levels by default
      if (depth(id) <= 1) init[id] = true;
    });
    return init;
  });

  // Calculate pending and overdue counts per node
  const { actCounts, lateCounts } = useMemo(() => {
    const act: Record<string, number> = {};
    const lwt: Record<string, number> = {};

    suratList.forEach(s => {
      active(s).forEach(([orgId, entry]) => {
        if (entry.status === 'telah') return;
        act[orgId] = (act[orgId] || 0) + 1;
        if (lewat(s)) {
          lwt[orgId] = (lwt[orgId] || 0) + 1;
        }
      });
    });

    return { actCounts: act, lateCounts: lwt };
  }, [suratList]);

  const toggleNode = (id: string) => {
    setOpenNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    ORDER.forEach(id => { all[id] = true; });
    setOpenNodes(all);
  };

  const collapseAll = () => {
    const rootOnly: Record<string, boolean> = { su: true };
    setOpenNodes(rootOnly);
  };

  const renderNode = (id: string) => {
    const node = N[id];
    if (!node) return null;

    const children = KIDS[id] || [];
    const hasChildren = children.length > 0;
    const isOpen = openNodes[id];
    const d = depth(id);

    const pending = actCounts[id] || 0;
    const isLate = lateCounts[id] || 0;
    const hasContact = contacts[id]?.tel || contacts[id]?.emel;

    return (
      <div key={id} className="space-y-1">
        <div
          className={`flex items-center justify-between gap-2 p-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
            node.jenis === 'pejabat' || node.jenis === 'ts'
              ? "bg-slate-50/50 dark:bg-slate-900/40 font-bold"
              : ""
          }`}
          style={{ paddingLeft: `max(6px, 6px + ${d} * 12px)` }}
        >
          {/* Toggle icon & Name */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNode(id)}
                className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
              >
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-5 shrink-0" />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {node.nama}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  {JENIS_LBL[node.jenis]}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {node.jaw}: <span className="font-medium text-slate-600 dark:text-slate-300">{node.ketua}</span>
              </div>
            </div>
          </div>

          {/* Badges & Actions */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap justify-end">
            {pending > 0 && (
              <span className="text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 whitespace-nowrap">
                {pending} <span className="hidden sm:inline">belum selesai</span>
              </span>
            )}
            {isLate > 0 && (
              <span className="text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 whitespace-nowrap">
                {isLate} lewat
              </span>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditContact(id)}
              className="h-7 text-xs px-2 gap-1 text-slate-600 hover:text-teal-600"
              title="Kemaskini WhatsApp & Emel"
            >
              <Phone className="w-3 h-3 text-teal-600" />
              {hasContact ? "✓" : "+"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelectRole(id)}
              className="h-7 text-xs px-2 sm:px-2.5 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40"
            >
              Peti Minit
            </Button>
          </div>
        </div>

        {/* Children Recursion */}
        {hasChildren && isOpen && (
          <div className="space-y-1">
            {children.map(childId => renderNode(childId))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Struktur Organisasi MAINS
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hierarki rasmi agihan minit surat dan direktori perhubungan pegawai (WhatsApp & Emel).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={expandAll}
            className="text-xs h-8 active:scale-95 transition-all"
          >
            Kembangkan Semua
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={collapseAll}
            className="text-xs h-8 active:scale-95 transition-all"
          >
            Kuncupkan Semua
          </Button>
        </div>
      </div>

      {/* Tree Card */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm space-y-1">
        {renderNode("su")}
      </div>
    </motion.div>
  );
}
