"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { N, HubContact } from "@/lib/org-data";
import { Phone, Mail, User, PhoneCall } from "lucide-react";
import { toast } from "sonner";

interface ContactModalProps {
  orgId: string | null;
  currentContact?: HubContact;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (orgId: string, updatedContact: HubContact) => void;
}

export function ContactModal({
  orgId,
  currentContact,
  token,
  open,
  onOpenChange,
  onSuccess
}: ContactModalProps) {
  const [nama, setNama] = useState("");
  const [tel, setTel] = useState("");
  const [emel, setEmel] = useState("");
  const [cc, setCc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orgId && open) {
      const node = N[orgId];
      setNama(currentContact?.nama || (/Kosong/.test(node?.ketua || "") ? "" : node?.ketua || ""));
      setTel(currentContact?.tel || "");
      setEmel(currentContact?.emel || "");
      setCc(currentContact?.cc || "");
    }
  }, [orgId, currentContact, open]);

  if (!orgId) return null;
  const node = N[orgId];

  const handleSave = async () => {
    if (emel && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emel)) {
      toast.error("Format emel tidak sah.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/organisasi/hubungan/${orgId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nama, tel, emel, cc })
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan maklumat perhubungan");
      }

      const updated = { nama, tel, emel, cc };
      toast.success("Maklumat perhubungan disimpan.");
      onSuccess(orgId, updated);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Ralat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <PhoneCall className="w-5 h-5 text-teal-600" />
            Maklumat Notifikasi & Perhubungan
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40">
            <div className="font-bold text-slate-900 dark:text-white text-sm">{node?.nama}</div>
            <div className="text-slate-500 text-[11px] mt-0.5">{node?.jaw}: {node?.ketua}</div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nama Penerima Notifikasi
            </label>
            <Input
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="cth. En. Mohd Zaid"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              No. Telefon (WhatsApp)
            </label>
            <Input
              value={tel}
              onChange={e => setTel(e.target.value)}
              placeholder="cth. 019-234 5678"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Alamat Emel Rasmi
            </label>
            <Input
              type="email"
              value={emel}
              onChange={e => setEmel(e.target.value)}
              placeholder="cth. pegawai@mains.gov.my"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Emel Salinan (s.k.) <span className="font-normal text-slate-400">(Pilihan, cth. setiausaha)</span>
            </label>
            <Input
              type="email"
              value={cc}
              onChange={e => setCc(e.target.value)}
              placeholder="cth. supejabat@mains.gov.my"
              className="text-xs h-9"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading} className="text-xs">
            Batal
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
            {loading ? "Menyimpan..." : "Simpan Hubungan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
