"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SuratItem } from "@/lib/sla-utils";
import { Eye, Download, FileText, ExternalLink } from "lucide-react";

interface DocumentViewerModalProps {
  surat: SuratItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentViewerModal({ surat, open, onOpenChange }: DocumentViewerModalProps) {
  if (!surat || !surat.lampiran) return null;

  const url = surat.lampiran.url || (surat as any).url_fail;
  const isPdf = surat.lampiran.nama?.toLowerCase().endsWith(".pdf") || surat.lampiran.jenis?.includes("pdf");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-row items-center justify-between">
          <div>
            <div className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
              {surat.noDaftar}
            </div>
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
              {surat.perkara}
            </DialogTitle>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download={surat.lampiran.nama}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-slate-700 transition-all mr-6"
            >
              <Download className="w-3.5 h-3.5" />
              Muat Turun
            </a>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-slate-100 dark:bg-slate-950 min-h-[450px]">
          {url ? (
            isPdf ? (
              <iframe
                src={`${url}#toolbar=0`}
                className="w-full h-[600px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white shadow-sm"
                title="Dokumen Surat PDF"
              />
            ) : (
              <img
                src={url}
                alt={surat.lampiran.nama || "Dokumen Surat"}
                className="max-h-[600px] max-w-full object-contain rounded-lg shadow-md bg-white"
              />
            )
          ) : (
            <div className="text-center text-slate-400 text-xs">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              Fail dokumen tidak dapat dicapai atau belum dimuat naik.
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            📎 {surat.lampiran.nama}
          </span>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
