"use client";

import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SuratItem, due, fmtD, fmtDT, statusOf, ST_CONFIG } from "@/lib/sla-utils";
import { N, shortNm } from "@/lib/org-data";
import { FileText, Printer, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface MinuteSheetModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  surat?: SuratItem | null;
  letter?: any;
}

export function MinuteSheetModal({
  isOpen,
  open,
  onClose,
  onOpenChange,
  surat: propSurat,
  letter
}: MinuteSheetModalProps) {
  const visible = open !== undefined ? open : !!isOpen;
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const surat: SuratItem | null = propSurat || letter || null;
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!surat) return null;

  const sortedLogs = [...(surat.log || [])].sort((a, b) => a.masa.localeCompare(b.masa));

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="ms">
        <head>
          <meta charset="utf-8">
          <title>Lembaran Minit Tindakan - ${surat.noDaftar}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              color: #0b3d5c;
              margin: 0;
              padding: 16px;
              font-size: 11px;
              line-height: 1.5;
            }
            .sheet-container {
              border: 2px solid #0b3d5c;
              border-radius: 6px;
              padding: 20px;
            }
            .text-center { text-align: center; }
            .header {
              border-bottom: 2px solid #0b3d5c;
              padding-bottom: 12px;
              margin-bottom: 14px;
            }
            .bism {
              font-family: serif;
              font-size: 14px;
              margin-bottom: 4px;
            }
            .header h1 {
              font-size: 15px;
              font-weight: 800;
              text-transform: uppercase;
              margin: 2px 0;
            }
            .header p {
              font-size: 10.5px;
              font-weight: 700;
              color: #4a6274;
              margin: 0;
            }
            .meta-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
            }
            .meta-table th, .meta-table td {
              border: 1px solid #cbd5e1;
              padding: 6px 10px;
              font-size: 11px;
            }
            .meta-table th {
              background: #f1f5f9;
              text-align: left;
              width: 25%;
              color: #475569;
            }
            .minute-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 14px;
            }
            .minute-table th, .minute-table td {
              border: 1px solid #0b3d5c;
              padding: 8px 10px;
              font-size: 11px;
              vertical-align: top;
            }
            .minute-table th {
              background: #0b3d5c;
              color: #ffffff;
              text-align: left;
              font-size: 10.5px;
            }
            .footer {
              margin-top: 24px;
              border-top: 1px dashed #cbd5e1;
              padding-top: 10px;
              font-size: 10px;
              color: #64748b;
              display: flex;
              justify-content: space-between;
            }
            @media print {
              body { padding: 0; }
              .sheet-container { border: 1.5px solid #000; }
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

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Simple, clean vector PDF layout
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("MAJLIS AGAMA ISLAM NEGERI SEMBILAN", 105, 18, { align: "center" });

    doc.setFontSize(11);
    doc.text("LEMBARAN MINIT TINDAKAN SURAT RASMI (SLA 14 HARI)", 105, 25, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(15, 28, 195, 28);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    let y = 35;
    doc.text(`No. Pendaftaran: ${surat.noDaftar}`, 15, y);
    doc.text(`Tarikh Diterima: ${fmtD(surat.tarikhTerima)}`, 120, y);
    y += 6;
    doc.text(`No. Rujukan Pengirim: ${surat.noRujukan || "-"}`, 15, y);
    doc.text(`Tarikh Akhir (14H): ${fmtD(due(surat))}`, 120, y);
    y += 6;
    doc.text(`Pengirim: ${surat.pengirim}`, 15, y);
    doc.text(`Kategori / Keutamaan: ${surat.kategori} (${surat.keutamaan})`, 120, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Perkara / Subjek:", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const splitTitle = doc.splitTextToSize(surat.perkara, 180);
    doc.text(splitTitle, 15, y);
    y += splitTitle.length * 5 + 6;

    doc.setLineWidth(0.3);
    doc.line(15, y, 195, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("KRONOLOGI MINIT & TINDAKAN CAWANGAN", 15, y);
    y += 6;

    sortedLogs.forEach((l, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      const title = l.jenis === 'minit'
        ? `Minit: ${shortNm(l.dari || "")} -> ${l.kepada.map(shortNm).join(", ")}`
        : `Tindakan: ${l.jenis.toUpperCase()} (${shortNm(l.dari || "")})`;
      doc.text(`${idx + 1}. ${title} [${fmtDT(l.masa)}]`, 15, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      if (l.teks) {
        const splitText = doc.splitTextToSize(`"${l.teks}"`, 175);
        doc.text(splitText, 20, y);
        y += splitText.length * 4.5;
      }
      if (l.oleh) {
        doc.text(`Dicatat oleh: ${l.oleh}`, 20, y);
        y += 5;
      }
      y += 3;
    });

    doc.save(`Lembaran-Minit-${surat.noDaftar.replace(/\//g, '-')}.pdf`);
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Lembaran Minit Tindakan Rasmi (A4 Cetakan & Arkib)
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Format lembaran minit rasmi untuk cetakan dan simpanan fail fizikal pejabat MAINS.
            </p>
          </div>
          <div className="flex items-center gap-2 mr-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
              className="text-xs h-8 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Muat Turun PDF
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3 gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Minit
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Minute Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950 text-xs">
          <div ref={printAreaRef} className="sheet-container bg-white text-slate-800 p-6 rounded-xl border-2 border-slate-800 shadow-sm space-y-4">
            {/* Header */}
            <div className="header text-center border-b-2 border-slate-800 pb-3">
              <div className="bism font-serif text-sm">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
              <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                Majlis Agama Islam Negeri Sembilan
              </h1>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                LEMBARAN KAWALAN & MINIT TINDAKAN SURAT RASMI
              </p>
            </div>

            {/* Metadata Table */}
            <table className="meta-table w-full border border-slate-300 text-xs">
              <tbody>
                <tr>
                  <th className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300 w-1/4">
                    No. Pendaftaran Rasmi
                  </th>
                  <td className="p-2 font-mono font-bold text-teal-800 border border-slate-300">
                    {surat.noDaftar}
                  </td>
                  <th className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300 w-1/4">
                    Tarikh Terima
                  </th>
                  <td className="p-2 font-semibold border border-slate-300">
                    {fmtD(surat.tarikhTerima)}
                  </td>
                </tr>
                <tr>
                  <th className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                    No. Rujukan Pengirim
                  </th>
                  <td className="p-2 font-mono text-slate-700 border border-slate-300">
                    {surat.noRujukan || "—"}
                  </td>
                  <th className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                    Tarikh Akhir SLA (14 Hari)
                  </th>
                  <td className="p-2 font-bold text-red-600 border border-slate-300">
                    {fmtD(due(surat))}
                  </td>
                </tr>
                <tr>
                  <th className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                    Nama Pengirim
                  </th>
                  <td colSpan={3} className="p-2 font-semibold text-slate-800 border border-slate-300">
                    {surat.pengirim}
                  </td>
                </tr>
                <tr>
                  <th className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                    Perkara / Tajuk
                  </th>
                  <td colSpan={3} className="p-2 font-bold text-slate-900 border border-slate-300 leading-snug">
                    {surat.perkara}
                  </td>
                </tr>
                <tr>
                  <th className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                    Kategori & Keutamaan
                  </th>
                  <td colSpan={3} className="p-2 text-slate-700 border border-slate-300">
                    {surat.kategori} · <b>{surat.keutamaan}</b>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Minutes Table */}
            <div>
              <div className="font-extrabold uppercase text-xs text-slate-900 mb-2">
                Rantaian Minit & Catatan Tindakan Pegawai:
              </div>
              <table className="minute-table w-full border-2 border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-2 w-10 text-center border border-slate-800">Bil</th>
                    <th className="p-2 w-32 border border-slate-800">Tarikh & Masa</th>
                    <th className="p-2 w-44 border border-slate-800">Daripada & Jawatan</th>
                    <th className="p-2 w-44 border border-slate-800">Minit Kepada</th>
                    <th className="p-2 border border-slate-800">Arahan Minit / Catatan Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedLogs.map((l, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-center font-bold border border-slate-300">{idx + 1}</td>
                      <td className="p-2 font-mono text-[11px] border border-slate-300 whitespace-nowrap">
                        {fmtDT(l.masa)}
                      </td>
                      <td className="p-2 border border-slate-300">
                        <div className="font-bold text-slate-900">{shortNm(l.dari || "Pendaftar")}</div>
                        <div className="text-[10px] text-slate-500">{N[l.dari || ""]?.ketua || l.oleh || ""}</div>
                      </td>
                      <td className="p-2 border border-slate-300">
                        <div className="font-semibold text-slate-800">
                          {l.kepada && l.kepada.length > 0 ? l.kepada.map(shortNm).join(", ") : "—"}
                        </div>
                      </td>
                      <td className="p-2 border border-slate-300">
                        <div className="font-medium text-slate-800 leading-snug">
                          {l.teks ? `“${l.teks}”` : "—"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 capitalize font-semibold">
                          [Status: {l.jenis}]
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="footer flex justify-between items-center pt-4 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
              <div>
                Dokumen Arkib Rasmi Sistem e-Surat MAINS · Dijana pada: {new Date().toLocaleDateString('ms-MY')}
              </div>
              <div className="font-semibold text-slate-700">
                Pematuhan Piagam Pelanggan MAINS (SLA 14 Hari)
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
