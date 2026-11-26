"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SuratItem, due, fmtD } from "@/lib/sla-utils";
import { Printer, QrCode, Building, CheckSquare, Calendar, UserCheck } from "lucide-react";

interface TrackingSlipModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  surat?: SuratItem | null;
  letter?: any;
}

export function TrackingSlipModal({
  isOpen,
  open,
  onClose,
  onOpenChange,
  surat: propSurat,
  letter
}: TrackingSlipModalProps) {
  const visible = open !== undefined ? open : !!isOpen;
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const surat: SuratItem | null = propSurat || letter || null;
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const slipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (surat && visible) {
      // Build deep link URL or tracking code
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const payload = `${baseUrl}/?suratId=${surat.id}&noDaftar=${encodeURIComponent(surat.noDaftar)}`;

      QRCode.toDataURL(payload, {
        width: 150,
        margin: 1,
        color: {
          dark: '#0b3d5c',
          light: '#ffffff'
        }
      }, (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      });
    }
  }, [surat, visible]);

  const handlePrint = () => {
    const printContent = slipRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open('', '_blank', 'width=850,height=950');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="ms">
        <head>
          <meta charset="utf-8">
          <title>Slip Edaran Tindakan Surat - ${surat?.noDaftar || ''}</title>
          <style>
            @page {
              size: A5 portrait;
              margin: 10mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              color: #0b3d5c;
              margin: 0;
              padding: 12px;
              font-size: 11px;
              line-height: 1.4;
            }
            .slip-box {
              border: 2px solid #0b3d5c;
              border-radius: 8px;
              padding: 16px;
            }
            .text-center { text-align: center; }
            .header {
              border-bottom: 2px solid #0b3d5c;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .header h2 {
              margin: 2px 0;
              font-size: 14px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .bism {
              font-family: serif;
              font-size: 14px;
              margin-bottom: 4px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 2.2fr 1fr;
              gap: 12px;
              margin-bottom: 12px;
            }
            .meta-item {
              margin-bottom: 6px;
            }
            .meta-label {
              font-size: 9px;
              text-transform: uppercase;
              color: #4a6274;
              font-weight: 700;
              display: block;
            }
            .meta-val {
              font-weight: 700;
              font-size: 11.5px;
            }
            .qr-box {
              text-align: center;
              border: 1px solid #d6e8f1;
              padding: 6px;
              border-radius: 6px;
              background: #f8fafc;
            }
            .qr-box img {
              width: 100px;
              height: 100px;
              display: block;
              margin: 0 auto;
            }
            .sla-box {
              background: #eef7fa;
              border: 1px solid #b9dbe8;
              border-radius: 6px;
              padding: 8px 10px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
            }
            .routing-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            .routing-table th, .routing-table td {
              border: 1px solid #cbd5e1;
              padding: 5px 8px;
              font-size: 10px;
            }
            .routing-table th {
              background: #f1f5f9;
              text-align: left;
            }
            .minit-space {
              border: 1px dashed #94a3b8;
              border-radius: 6px;
              padding: 8px;
              min-height: 80px;
              margin-bottom: 12px;
              font-size: 10.5px;
              color: #64748b;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px dashed #cbd5e1;
              padding-top: 10px;
              font-size: 9.5px;
              color: #64748b;
            }
            .sign-line {
              width: 140px;
              border-top: 1px solid #0b3d5c;
              text-align: center;
              padding-top: 4px;
              font-weight: 700;
              color: #0b3d5c;
            }
            @media print {
              body { padding: 0; }
              .slip-box { border: 1.5px solid #000; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  if (!surat) return null;

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-600" />
              Slip Edaran Surat & Kod QR (A5 Fizikal)
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Lampirkan slip ini pada fail fizikal surat untuk imbasan status & minit tindakan pantas.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3 gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Slip
          </Button>
        </DialogHeader>

        {/* Printable Slip Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950">
          <div ref={slipRef} className="slip-box bg-white text-slate-800 p-5 rounded-xl border-2 border-slate-800 shadow-sm space-y-3.5">
            {/* Header */}
            <div className="header text-center border-b-2 border-slate-800 pb-2.5">
              <div className="bism font-serif text-sm">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                Majlis Agama Islam Negeri Sembilan
              </h2>
              <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                SLIP EDARAN SURAT MASUK & KAWALAN TINDAKAN (SLA 14 HARI)
              </div>
            </div>

            {/* Info Grid + QR */}
            <div className="meta-grid grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">No. Pendaftaran Rasmi:</span>
                  <span className="font-mono font-extrabold text-sm text-teal-800">{surat.noDaftar}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">No. Rujukan Pengirim:</span>
                  <span className="font-mono font-semibold text-slate-700">{surat.noRujukan || "—"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Pengirim:</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">{surat.pengirim}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Perkara / Tajuk:</span>
                  <span className="font-bold text-slate-900 line-clamp-2 leading-snug">{surat.perkara}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="qr-box text-center p-2 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Kod Surat" className="w-24 h-24 object-contain" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-[10px] text-slate-400">
                    Menjana QR...
                  </div>
                )}
                <span className="text-[8.5px] font-mono text-slate-500 font-semibold mt-1">Imbas Untuk Minit</span>
              </div>
            </div>

            {/* SLA Reminder Banner */}
            <div className="sla-box flex items-center justify-between p-2 rounded-lg bg-teal-50 border border-teal-200 text-xs">
              <div>
                <span className="text-[10px] text-teal-800 block">Tarikh Diterima:</span>
                <span className="font-bold text-teal-900">{fmtD(surat.tarikhTerima)}</span>
              </div>
              <div className="text-center font-bold text-teal-900 text-xs">
                TEMPOH SLA: 14 HARI
              </div>
              <div className="text-right">
                <span className="text-[10px] text-teal-800 block">Tarikh Akhir Tindakan:</span>
                <span className="font-bold text-red-600">{fmtD(due(surat))}</span>
              </div>
            </div>

            {/* Checkbox Agihan Cawangan */}
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-700 mb-1">
                Senarai Agihan Salinan / Tindakan Cawangan:
              </div>
              <table className="routing-table w-full text-[10px] border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-1 border border-slate-300">Peringkat / Jabatan</th>
                    <th className="p-1 border border-slate-300 text-center w-16">Tindakan</th>
                    <th className="p-1 border border-slate-300 text-center w-16">Salinan</th>
                    <th className="p-1 border border-slate-300">Tarikh & Paraf</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "Pejabat Setiausaha (SU)",
                    "Pejabat Timbalan Setiausaha (Operasi)",
                    "Pejabat Timbalan Setiausaha (Pengurusan)",
                    "Jabatan Zakat / Agihan / Kutipan",
                    "Jabatan Wakaf & Mal",
                    "Jabatan Pentadbiran / Sumber Manusia / ICT",
                    "Jabatan Perbendaharaan / Kewangan",
                    "Pejabat MAINS Daerah & Cawangan",
                  ].map((dept, i) => (
                    <tr key={i}>
                      <td className="p-1 border border-slate-300 font-medium">{dept}</td>
                      <td className="p-1 border border-slate-300 text-center">[  ]</td>
                      <td className="p-1 border border-slate-300 text-center">[  ]</td>
                      <td className="p-1 border border-slate-300"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ruang Minit Manual Fizikal */}
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-700 mb-1">
                Catatan / Minit Arahan Ringkas Setiausaha:
              </div>
              <div className="minit-space border border-dashed border-slate-400 rounded p-2 text-[10px] text-slate-400 h-16">
                (Ruang paraf & catatan arahan manual jika perlu sebelum imbasan digital)
              </div>
            </div>

            {/* Footer */}
            <div className="footer flex justify-between items-end pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-500">
              <div>
                <div>Dicetak pada: {new Date().toLocaleDateString('ms-MY')} {new Date().toLocaleTimeString('ms-MY')}</div>
                <div>Sistem e-Surat MAINS • Dokumen Kawalan Dalaman</div>
              </div>
              <div className="sign-line text-center w-36 border-t border-slate-800 pt-1 font-bold text-slate-800">
                Pengesahan Kerani / Penerima
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
