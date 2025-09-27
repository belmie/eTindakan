"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, UserPlus, MessageSquare, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SuratListProps {
  token: string;
  user: any;
}

export function SuratList({ token, user }: SuratListProps) {
  const [letters, setLetters] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [assignDialog, setAssignDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [assignData, setAssignData] = useState({ assigned_to: "", tarikh_akhir_tindakan: "" });
  const [feedbackData, setFeedbackData] = useState({
    kepada: "",
    subjek: "",
    kandungan: "",
    cara_hantar: "emel",
    tarikh_hantar: ""
  });

  useEffect(() => {
    fetchLetters();
    fetchUsers();
  }, []);

  const fetchLetters = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/surat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLetters(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching letters:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAssign = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/surat/${selectedLetter.id}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignData),
      });

      if (response.ok) {
        toast.success("Surat berjaya diagihkan!");
        setAssignDialog(false);
        fetchLetters();
      } else {
        const data = await response.json();
        toast.error(data.error || "Ralat mengagihkan surat");
      }
    } catch (error) {
      toast.error("Ralat sistem");
    }
  };

  const handleStatusUpdate = async (letterId: number, status: string, catatan?: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/surat/${letterId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, catatan }),
      });

      if (response.ok) {
        toast.success("Status berjaya dikemaskini!");
        fetchLetters();
      } else {
        const data = await response.json();
        toast.error(data.error || "Ralat mengemaskini status");
      }
    } catch (error) {
      toast.error("Ralat sistem");
    }
  };

  const handleFeedback = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/surat/${selectedLetter.id}/maklum-balas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        toast.success("Maklum balas berjaya dihantar!");
        setFeedbackDialog(false);
        fetchLetters();
      } else {
        const data = await response.json();
        toast.error(data.error || "Ralat menghantar maklum balas");
      }
    } catch (error) {
      toast.error("Ralat sistem");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      belum_mula: { label: "Belum Mula", variant: "secondary" as const },
      dalam_proses: { label: "Dalam Proses", variant: "default" as const },
      selesai: { label: "Selesai", variant: "outline" as const },
      maklum_balas_dihantar: { label: "Maklum Balas Dihantar", variant: "outline" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.belum_mula;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      rendah: { label: "Rendah", className: "bg-gray-100 text-gray-800" },
      biasa: { label: "Biasa", className: "bg-blue-100 text-blue-800" },
      tinggi: { label: "Tinggi", className: "bg-orange-100 text-orange-800" },
      kritikal: { label: "Kritikal", className: "bg-red-100 text-red-800" },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.biasa;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Memuat surat...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Senarai Surat Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Rujukan</TableHead>
                  <TableHead>Tarikh Terima</TableHead>
                  <TableHead>Pengirim</TableHead>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Keutamaan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Diagihkan Kepada</TableHead>
                  <TableHead>Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {letters.map((letter) => (
                  <TableRow key={letter.id}>
                    <TableCell className="font-medium">{letter.no_rujukan}</TableCell>
                    <TableCell>{new Date(letter.tarikh_terima).toLocaleDateString('ms-MY')}</TableCell>
                    <TableCell>{letter.pengirim}</TableCell>
                    <TableCell className="max-w-xs truncate">{letter.subjek}</TableCell>
                    <TableCell>{getPriorityBadge(letter.keutamaan)}</TableCell>
                    <TableCell>{getStatusBadge(letter.status)}</TableCell>
                    <TableCell>{letter.assigned_to_name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Butiran Surat</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>No. Rujukan</Label>
                                  <p className="font-medium">{letter.no_rujukan}</p>
                                </div>
                                <div>
                                  <Label>Tarikh Terima</Label>
                                  <p>{new Date(letter.tarikh_terima).toLocaleDateString('ms-MY')}</p>
                                </div>
                                <div>
                                  <Label>Pengirim</Label>
                                  <p>{letter.pengirim}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div>{getStatusBadge(letter.status)}</div>
                                </div>
                              </div>
                              <div>
                                <Label>Subjek</Label>
                                <p>{letter.subjek}</p>
                              </div>
                              {letter.ringkasan && (
                                <div>
                                  <Label>Ringkasan</Label>
                                  <p>{letter.ringkasan}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {(user.role === 'ketua_unit' || user.role === 'pengurusan') && letter.status === 'belum_mula' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLetter(letter);
                              setAssignDialog(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}

                        {user.role === 'pegawai_pelaksana' && letter.assigned_to === user.id && (
                          <>
                            {letter.status === 'dalam_proses' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(letter.id, 'selesai', 'Tindakan selesai')}
                              >
                                Selesai
                              </Button>
                            )}
                            
                            {letter.status === 'selesai' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedLetter(letter);
                                  setFeedbackData({
                                    kepada: letter.pengirim,
                                    subjek: `Re: ${letter.subjek}`,
                                    kandungan: "",
                                    cara_hantar: "emel",
                                    tarikh_hantar: new Date().toISOString().split('T')[0]
                                  });
                                  setFeedbackDialog(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agihkan Surat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Agihkan Kepada</Label>
              <Select
                value={assignData.assigned_to}
                onValueChange={(value) => setAssignData(prev => ({ ...prev, assigned_to: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pegawai" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.full_name} ({user.role.replace('_', ' ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Tarikh Akhir Tindakan</Label>
              <Input
                type="date"
                value={assignData.tarikh_akhir_tindakan}
                onChange={(e) => setAssignData(prev => ({ ...prev, tarikh_akhir_tindakan: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAssignDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleAssign}>
                Agihkan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hantar Maklum Balas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kepada</Label>
              <Input
                value={feedbackData.kepada}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, kepada: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Subjek</Label>
              <Input
                value={feedbackData.subjek}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, subjek: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Kandungan</Label>
              <Textarea
                rows={6}
                value={feedbackData.kandungan}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, kandungan: e.target.value }))}
                placeholder="Tulis maklum balas di sini..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cara Hantar</Label>
                <Select
                  value={feedbackData.cara_hantar}
                  onValueChange={(value) => setFeedbackData(prev => ({ ...prev, cara_hantar: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emel">E-mel</SelectItem>
                    <SelectItem value="pos">Pos</SelectItem>
                    <SelectItem value="faks">Faks</SelectItem>
                    <SelectItem value="tangan">Tangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Tarikh Hantar</Label>
                <Input
                  type="date"
                  value={feedbackData.tarikh_hantar}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, tarikh_hantar: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setFeedbackDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleFeedback}>
                Hantar Maklum Balas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
