"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { N, shortNm, HubContact } from "@/lib/org-data";
import { SuratItem, due, baki, statusOf, fmtD } from "@/lib/sla-utils";
import { Bell, Copy, ExternalLink, Mail, MessageSquare, PhoneCall } from "lucide-react";
import { toast } from "sonner";

interface NotifikasiModalProps {
  suratList: SuratItem[];
  receivers: string[]; // Org IDs
  contacts: Record<string, HubContact>;
  senderRole: string;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditContact: (orgId: string) => void;
}

export function NotifikasiModal({
  suratList,
  receivers,
  contacts,
  senderRole,
  token,
  open,
  onOpenChange,
  onEditContact
}: NotifikasiModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (suratList.length === 0 || receivers.length === 0) return null;

  const cleanPhone = (tel?: string) => {
    let d = String(tel || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.startsWith("0")) d = "6" + d;
    else if (!d.startsWith("6")) d = "60" + d;
    return d;
  };

  const generateMessage = (orgId: string) => {
    const node = N[orgId];
    const contact = contacts[orgId] || {};
    const recipientName = contact.nama || (/Kosong/.test(node?.ketua || "") ? "" : node?.ketua) || "Tuan/Puan";

    const lettersText = suratList.map((s, i) => {
      const entry = (s.penerima || {})[orgId] || {};
      const rem = baki(s);
      const st = statusOf(s) === 'telah' ? 'Selesai' : rem < 0 ? `LEWAT ${-rem} hari` : `Baki ${rem} hari`;
      return `${suratList.length > 1 ? `${i + 1}. ` : ""}No. Daftar: ${s.noDaftar}\nPerkara: ${s.perkara}\nDaripada: ${s.pengirim}${entry.arahan ? `\nArahan minit: “${entry.arahan}”` : ""}\nTarikh akhir tindakan: ${fmtD(due(s))} (${st})`;
    }).join("\n\n");

    const senderName = N[senderRole]?.nama || "Pejabat MAINS";

    const body = `Assalamualaikum ${recipientName},\n\nPeringatan / Makluman tindakan surat rasmi MAINS:\n\n${lettersText}\n\nTempoh tindakan ialah 14 hari dari tarikh surat diterima. Sila semak dan kemas kini status tindakan di Sistem e-Surat MAINS.\n\nSekian, terima kasih.\n${senderName}`;
    const subject = `[e-Surat MAINS] Peringatan Tindakan Surat: ${suratList.length === 1 ? suratList[0].perkara : `${suratList.length} surat`}`;

    return { subject, body };
  };

  const handleLogNotification = async (orgId: string, channel: string, text: string) => {
    try {
      for (const s of suratList) {
        const isRealDb = typeof s.id === 'number' || (!String(s.id).startsWith('demo') && !isNaN(Number(s.id)));
        if (!isRealDb) continue;
        await fetch(`/api/surat/${s.id}/notifikasi-log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            dari: senderRole,
            kepadaId: orgId,
            saluran: channel,
            teks: text.slice(0, 150)
          })
        });
      }
    } catch (e) {
      console.warn("Failed to log notification:", e);
    }
  };

  const handleCopy = async (orgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(orgId);
      toast.success("Mesej notifikasi telah disalin.");
      setTimeout(() => setCopiedId(null), 2500);
      handleLogNotification(orgId, "Salin Mesej", text);
    } catch {
      toast.error("Gagal menyalin teks.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Bell className="w-5 h-5 text-teal-600" />
            Hantar Notifikasi Peringatan & Minit
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <p className="text-slate-500">
            Mesej telah dijana secara automatik dengan butiran lengkap surat dan baki hari SLA. Klik pautan untuk membuka WhatsApp atau Emel pegawai:
          </p>

          <div className="space-y-4">
            {receivers.map(orgId => {
              const node = N[orgId];
              const contact = contacts[orgId] || {};
              const phone = cleanPhone(contact.tel);
              const email = contact.emel || "";
              const { subject, body } = generateMessage(orgId);

              const waUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(body)}` : null;
              const gmailUrl = email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : null;
              const mailtoUrl = email ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : null;

              return (
                <div
                  key={orgId}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {node?.nama || orgId}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {contact.nama || node?.ketua} {contact.tel ? `· ${contact.tel}` : ""} {contact.emel ? `· ${contact.emel}` : ""}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditContact(orgId)}
                      className="text-xs text-teal-600 hover:text-teal-700 h-7 px-2"
                    >
                      Kemaskini No/Emel
                    </Button>
                  </div>

                  {!phone && !email ? (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-between">
                      <span>Tiada no. telefon atau emel berdaftar untuk cawangan ini.</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditContact(orgId)}
                        className="text-xs h-7 bg-white dark:bg-slate-900 border-amber-300"
                      >
                        + Tambah Maklumat
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-mono text-[11px] whitespace-pre-wrap max-h-32 overflow-y-auto text-slate-600 dark:text-slate-300">
                        {body}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLogNotification(orgId, "WhatsApp", body)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        )}

                        {gmailUrl && (
                          <a
                            href={gmailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLogNotification(orgId, "Gmail", body)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Gmail
                          </a>
                        )}

                        {mailtoUrl && (
                          <a
                            href={mailtoUrl}
                            onClick={() => handleLogNotification(orgId, "Emel", body)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-slate-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Outlook / Aplikasi Emel
                          </a>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(orgId, body)}
                          className="text-xs h-8 gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedId === orgId ? "Disalin!" : "Salin Mesej"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
