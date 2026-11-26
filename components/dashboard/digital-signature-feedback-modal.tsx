"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, PenTool, RotateCcw, Check, ShieldCheck, Stamp } from "lucide-react";
import { toast } from "sonner";

interface DigitalSignatureFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: any;
  onSubmit: (feedbackData: any) => void;
}

export function DigitalSignatureFeedbackModal({
  isOpen,
  onClose,
  letter,
  onSubmit
}: DigitalSignatureFeedbackModalProps) {
  const sigPad = useRef<any>(null);
  const [includeOfficialStamp, setIncludeOfficialStamp] = useState(true);
  
  const [feedbackData, setFeedbackData] = useState({
    kepada: letter?.pengirim || "",
    subjek: letter ? `Maklum Balas Rasmi: ${letter.subjek}` : "",
    kandungan: "",
    cara_hantar: "emel",
    tarikh_hantar: new Date().toISOString().split('T')[0],
    pegawai_nama: "Zainal bin Said",
    pegawai_jawatan: "Setiausaha / Pegawai Pengurusan MAINS",
    signatureUrl: ""
  });

  const clearSignature = () => {
    sigPad.current?.clear();
  };

  const handleSend = () => {
    let sigUrl = "";
    if (sigPad.current && !sigPad.current.isEmpty()) {
      sigUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    }

    const payload = {
      ...feedbackData,
      kepada: feedbackData.kepada || letter?.pengirim,
      subjek: feedbackData.subjek || `Maklum Balas: ${letter?.subjek}`,
      signatureUrl: sigUrl,
      includeStamp: includeOfficialStamp
    };

    onSubmit(payload);
    toast.success("Maklum balas beserta tandatangan & cop rasmi telah disahkan!");
    onClose();
  };

  if (!letter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-600" />
            Maklum Balas Rasmi & Pengesahan Tandatangan Digital
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Sediakan draf jawapan rasmi MAINS lengkap dengan cop jabatan dan tandatangan digital eksekutif.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-semibold text-xs">Penerima Maklum Balas *</Label>
              <Input
                value={feedbackData.kepada || letter.pengirim}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, kepada: e.target.value }))}
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Kaedah Penghantaran *</Label>
              <Select
                value={feedbackData.cara_hantar}
                onValueChange={(val) => setFeedbackData(prev => ({ ...prev, cara_hantar: val }))}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emel">📧 Emel Rasmi MAINS</SelectItem>
                  <SelectItem value="surat_pos">📮 Surat Pos Berdaftar</SelectItem>
                  <SelectItem value="serahan_tangan">🤝 Serahan Tangan / Kurier</SelectItem>
                  <SelectItem value="panggilan">📞 Panggilan Rasmi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="font-semibold text-xs">Subjek Maklum Balas *</Label>
            <Input
              value={feedbackData.subjek}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, subjek: e.target.value }))}
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="font-semibold text-xs">Kandungan Keputusan / Maklum Balas *</Label>
            <Textarea
              rows={4}
              placeholder="Tulis ringkasan keputusan rasmi atau makluman tindakan yang telah diambil oleh pihak MAINS..."
              value={feedbackData.kandungan}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, kandungan: e.target.value }))}
              className="rounded-xl bg-slate-50 dark:bg-slate-800 text-xs resize-none"
            />
          </div>

          {/* SIGNATURE & STAMP BOX */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-blue-600" />
                Tandatangan Digital Pegawai (e-Signature):
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                className="h-7 text-[11px] gap-1 text-slate-500 hover:text-red-600 rounded-lg"
              >
                <RotateCcw className="w-3 h-3" />
                Kosongkan
              </Button>
            </div>

            {/* Signature Drawing Canvas */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white overflow-hidden shadow-inner">
              <SignatureCanvas
                ref={sigPad}
                penColor="#0f172a"
                canvasProps={{
                  className: "w-full h-32 cursor-crosshair"
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Tandatangan di dalam kotak di atas menggunakan tetikus atau skrin sentuh anda.
            </p>

            {/* Official Stamp Option */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Sertakan Cop Rasmi Kelulusan Digital MAINS
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeOfficialStamp}
                onChange={(e) => setIncludeOfficialStamp(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

        </div>

        <DialogFooter className="mt-2 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs" onClick={onClose}>
            Batal
          </Button>
          <Button size="sm" className="rounded-xl h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm" onClick={handleSend}>
            <Send className="w-3.5 h-3.5" />
            Hantar & Tandatangan Maklum Balas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
