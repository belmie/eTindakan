"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface SuratFormProps {
  token: string;
  onSuccess: () => void;
}

export function SuratForm({ token, onSuccess }: SuratFormProps) {
  const [formData, setFormData] = useState({
    no_rujukan: "",
    tarikh_terima: "",
    tarikh_surat: "",
    pengirim: "",
    alamat_pengirim: "",
    subjek: "",
    ringkasan: "",
    kategori: "",
    keutamaan: "biasa",
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      // Add files
      files.forEach(file => {
        submitData.append('lampiran', file);
      });

      const response = await fetch("http://localhost:3001/api/surat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ralat menyimpan surat");
      }

      toast.success("Surat berjaya didaftarkan!");
      
      // Reset form
      setFormData({
        no_rujukan: "",
        tarikh_terima: "",
        tarikh_surat: "",
        pengirim: "",
        alamat_pengirim: "",
        subjek: "",
        ringkasan: "",
        kategori: "",
        keutamaan: "biasa",
      });
      setFiles([]);
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Surat Masuk Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="no_rujukan">Nombor Rujukan *</Label>
              <Input
                id="no_rujukan"
                value={formData.no_rujukan}
                onChange={(e) => handleInputChange("no_rujukan", e.target.value)}
                placeholder="Contoh: MAINS/2024/001"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keutamaan">Keutamaan</Label>
              <Select
                value={formData.keutamaan}
                onValueChange={(value) => handleInputChange("keutamaan", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rendah">Rendah</SelectItem>
                  <SelectItem value="biasa">Biasa</SelectItem>
                  <SelectItem value="tinggi">Tinggi</SelectItem>
                  <SelectItem value="kritikal">Kritikal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarikh_terima">Tarikh Terima *</Label>
              <Input
                id="tarikh_terima"
                type="date"
                value={formData.tarikh_terima}
                onChange={(e) => handleInputChange("tarikh_terima", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarikh_surat">Tarikh Surat *</Label>
              <Input
                id="tarikh_surat"
                type="date"
                value={formData.tarikh_surat}
                onChange={(e) => handleInputChange("tarikh_surat", e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pengirim">Pengirim *</Label>
            <Input
              id="pengirim"
              value={formData.pengirim}
              onChange={(e) => handleInputChange("pengirim", e.target.value)}
              placeholder="Nama pengirim atau organisasi"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat_pengirim">Alamat Pengirim</Label>
            <Textarea
              id="alamat_pengirim"
              value={formData.alamat_pengirim}
              onChange={(e) => handleInputChange("alamat_pengirim", e.target.value)}
              placeholder="Alamat lengkap pengirim"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjek">Subjek *</Label>
            <Input
              id="subjek"
              value={formData.subjek}
              onChange={(e) => handleInputChange("subjek", e.target.value)}
              placeholder="Subjek atau tajuk surat"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Input
              id="kategori"
              value={formData.kategori}
              onChange={(e) => handleInputChange("kategori", e.target.value)}
              placeholder="Contoh: Permohonan, Aduan, Makluman"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ringkasan">Ringkasan</Label>
            <Textarea
              id="ringkasan"
              value={formData.ringkasan}
              onChange={(e) => handleInputChange("ringkasan", e.target.value)}
              placeholder="Ringkasan kandungan surat"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lampiran">Lampiran</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Klik untuk muat naik fail
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, DOC, DOCX, JPG, PNG, GIF, XLS, XLSX hingga 10MB
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label>Fail yang dipilih:</Label>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Daftar Surat"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
