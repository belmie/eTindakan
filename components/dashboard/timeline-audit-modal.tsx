"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  History, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  MessageSquare, 
  FileCheck2, 
  PlusCircle, 
  SendHorizontal,
  FileSignature
} from "lucide-react";
import { toast } from "sonner";

interface TimelineAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: any;
  user: any;
}

export function TimelineAuditModal({ isOpen, onClose, letter, user }: TimelineAuditModalProps) {
  const [minitText, setMinitText] = useState("");
  const [timelineItems, setTimelineItems] = useState<any[]>([
    {
      id: 1,
      type: "register",
      title: "Pendaftaran Surat Masuk",
      actor: letter?.created_by_name || "Puan Siti Aminah (Kerani)",
      timestamp: `${letter?.tarikh_terima || '2024-10-14'} • 08:45 AM`,
      desc: "Surat fizikal diterima di kaunter dan direkodkan dengan lampiran digital rasmi.",
      icon: FileCheck2,
      color: "bg-blue-600 text-white"
    },
    {
      id: 2,
      type: "assign",
      title: "Pengagihan Tugas & SLA",
      actor: "Ustaz Ahmad Farhan (Ketua Bahagian)",
      timestamp: `${letter?.tarikh_terima || '2024-10-14'} • 11:30 AM`,
      desc: `Surat diagihkan kepada ${letter?.assigned_to_name || 'Pegawai Tindakan'} dengan tempoh akhir tindakan (SLA: ${letter?.tarikh_akhir_tindakan || '7 Hari'}).`,
      icon: UserPlus,
      color: "bg-indigo-600 text-white"
    },
    {
      id: 3,
      type: "minit",
      title: "Arahan Minit Tindakan",
      actor: "Zainal bin Said (Pengurusan)",
      timestamp: "Semalam • 02:15 PM",
      desc: "Sila buat semakan silang dengan fail peruntukan tahunan sebelum menyediakan maklum balas.",
      icon: FileSignature,
      color: "bg-amber-600 text-white"
    }
  ]);

  const handleAddMinit = () => {
    if (!minitText.trim()) return;

    const newMinit = {
      id: Date.now(),
      type: "minit",
      title: "Catatan Minit Dalaman",
      actor: `${user?.full_name || 'Pegawai'} (${user?.role?.replace('_', ' ') || 'Pengurusan'})`,
      timestamp: "Baru sahaja",
      desc: minitText,
      icon: FileSignature,
      color: "bg-emerald-600 text-white"
    };

    setTimelineItems(prev => [newMinit, ...prev]);
    setMinitText("");
    toast.success("Minit arahan berjaya ditambahkan ke dalam log audit");
  };

  if (!letter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-lg">
              {letter.no_rujukan}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <History className="w-5 h-5 text-indigo-600" />
            Jejak Kronologi & Minit Tindakan Surat
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Audit trail pergerakan dokumen dan minit arahan pegawai dari tarikh terima sehingga selesai.
          </DialogDescription>
        </DialogHeader>

        {/* Minit Creation Input */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 my-2 space-y-2 shrink-0">
          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <FileSignature className="w-3.5 h-3.5 text-blue-600" />
            Tambah Minit / Arahan Pegawai:
          </Label>
          <div className="flex gap-2">
            <Textarea
              rows={2}
              placeholder="Tulis ulasan, arahan susulan atau minit tindakan untuk surat ini..."
              value={minitText}
              onChange={(e) => setMinitText(e.target.value)}
              className="text-xs rounded-xl bg-white dark:bg-slate-800 resize-none"
            />
            <Button
              onClick={handleAddMinit}
              size="sm"
              className="h-auto px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0 flex flex-col items-center justify-center gap-1 shadow-sm"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Simpan Minit</span>
            </Button>
          </div>
        </div>

        {/* Interactive Scrollable Timeline */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {timelineItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative flex gap-4">
                
                {/* Connecting Line */}
                {idx < timelineItems.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-slate-200 dark:bg-slate-800" />
                )}

                {/* Node Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Event Card */}
                <div className="flex-1 p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block">
                    Oleh: {item.actor}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </DialogContent>
    </Dialog>
  );
}
