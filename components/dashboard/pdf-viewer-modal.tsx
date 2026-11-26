"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  Maximize2
} from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: any;
}

export function PdfViewerModal({ isOpen, onClose, letter }: PdfViewerModalProps) {
  const [zoom, setZoom] = useState(100);

  if (!letter) return null;

  const fileUrl = letter.lampiran_url || letter.url_fail;
  const isImage = fileUrl && (
    fileUrl.toLowerCase().includes('.jpg') || 
    fileUrl.toLowerCase().includes('.jpeg') || 
    fileUrl.toLowerCase().includes('.png') ||
    fileUrl.toLowerCase().includes('.webp')
  );
  const isPdf = fileUrl && fileUrl.toLowerCase().includes('.pdf');

  // Format date display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr.split("T")[0] : d.toLocaleDateString("ms-MY", { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr.split("T")[0];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        showCloseButton={true}
        className="max-w-5xl w-[95vw] h-[92vh] flex flex-col p-0 gap-0 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-700/80 text-white shadow-2xl overflow-hidden"
      >
        
        {/* Top Header & Integrated Toolbar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-4 shrink-0 pr-12">
          
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-md">
                {letter.no_rujukan}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {letter.kategori || "Surat Rasmi"}
              </span>
              <span className="text-xs text-slate-300 truncate font-medium">
                • {letter.subjek}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Pratonton Lampiran Imbasan Surat Rasmi (MAINS)
            </h3>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                onClick={() => setZoom(prev => Math.max(60, prev - 15))}
                title="Kecilkan Saiz"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs font-mono text-slate-300 w-12 text-center select-none font-semibold">
                {zoom}%
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                onClick={() => setZoom(prev => Math.min(180, prev + 15))}
                title="Besarkan Saiz"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>

            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka Fail Penuh
              </a>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3.5 rounded-xl bg-slate-800 border-slate-700 text-xs text-white hover:bg-slate-700 gap-1.5"
                onClick={() => window.print()}
              >
                <Download className="w-3.5 h-3.5" />
                Cetak Dokumen
              </Button>
            )}
          </div>

        </div>

        {/* Scrollable Viewer Canvas Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center bg-slate-950/80">
          
          {/* CASE 1: PDF Viewer */}
          {isPdf ? (
            <div 
              className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden transition-transform duration-150 border border-slate-800 shadow-2xl bg-white"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <iframe
                src={`${fileUrl}#toolbar=0`}
                className="w-full h-full min-h-[700px] border-none"
                title="Pratonton Dokumen PDF"
              />
            </div>
          ) : isImage ? (
            /* CASE 2: Image Scan (Resolves high-resolution picture uploaded to OBS) */
            <div 
              className="transition-transform duration-150 flex items-center justify-center p-2"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <img 
                src={fileUrl} 
                alt="Imbasan Surat" 
                className="rounded-2xl shadow-2xl max-w-full max-h-[78vh] object-contain border border-slate-700 bg-white" 
              />
            </div>
          ) : (
            /* CASE 3: High-Fidelity Official Document Template */
            <div 
              className="w-full max-w-3xl bg-white text-slate-900 shadow-2xl p-8 sm:p-14 rounded-2xl transition-transform duration-150 border border-slate-200"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              
              {/* Official Letterhead */}
              <div className="border-b-2 border-slate-900 pb-5 mb-8 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white font-extrabold flex items-center justify-center text-sm shadow-md ring-2 ring-slate-200">
                    MAINS
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base uppercase tracking-tight text-slate-950 leading-tight">
                      {letter.pengirim}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {letter.alamat_pengirim || "Pusat Pentadbiran Kerajaan Negeri Sembilan"}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-600 font-mono space-y-1">
                  <div><strong>Tarikh:</strong> {formatDate(letter.tarikh_surat)}</div>
                  <div><strong>Ruj:</strong> {letter.no_rujukan}</div>
                </div>
              </div>

              {/* Recipient */}
              <div className="text-xs sm:text-sm mb-6 space-y-1 text-slate-800">
                <p className="font-bold">Setiausaha,</p>
                <p>Majlis Agama Islam Negeri Sembilan (MAINS),</p>
                <p>Tingkat 1, Menara MAINS, Jalan Seremban,</p>
                <p>70100 Seremban, Negeri Sembilan Darul Khusus.</p>
                <p className="pt-3 font-semibold">Tuan / Puan,</p>
              </div>

              {/* Subject */}
              <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide text-slate-950">
                  {letter.subjek}
                </h4>
              </div>

              {/* Body */}
              <div className="text-xs sm:text-sm leading-relaxed space-y-4 text-justify text-slate-700">
                <p>
                  Dengan segala hormatnya perkara di atas adalah dirujuk.
                </p>
                <p>
                  {letter.ringkasan || "Pihak kami dengan ini mengemukakan dokumen rasmi dan memohon pertimbangan sewajarnya daripada pihak Majlis Agama Islam Negeri Sembilan bagi urusan pentadbiran dan pelaksanaan tindakan selanjutnya mengikut tatacara pentadbiran sedia ada."}
                </p>
                <p>
                  2. Sehubungan dengan itu, kerjasama dan pertimbangan pihak tuan berhubung perkara ini amat dihargai dan didahului dengan ucapan setinggi-tinggi terima kasih.
                </p>
                <p className="pt-4 font-semibold text-slate-950">
                  Sekian, terima kasih.
                </p>
              </div>

              {/* Signature Block */}
              <div className="mt-14 pt-4 text-xs sm:text-sm text-slate-800">
                <p className="font-bold tracking-wider">&ldquo;BERKHIDMAT UNTUK NEGARA&rdquo;</p>
                <p className="text-xs text-slate-500 italic mt-0.5">Saya yang menjalankan amanah,</p>
                <div className="h-14"></div>
                <p className="font-extrabold uppercase text-slate-950">({letter.pengirim})</p>
                <p className="text-[11px] text-slate-500 font-medium">Majlis Agama Islam Negeri Sembilan</p>
              </div>

            </div>
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
}
