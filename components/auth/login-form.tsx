"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Loader2, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  Clock,
  QrCode,
  FileText,
  FolderTree,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2
} from "lucide-react";

interface LoginFormProps {
  onLogin: (token: string, user: any) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    const targetUser = customUser !== undefined ? customUser : username;
    const targetPass = customPass !== undefined ? customPass : password;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: targetUser, password: targetPass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ralat log masuk. Sila semak kredensial.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (err: any) {
      // Graceful fallback for preview / offline demo
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        const mockUser = {
          id: targetUser === "admin" ? 1 : targetUser === "pentadbir" ? 5 : targetUser === "ketua" ? 2 : targetUser === "pegawai" ? 4 : 3,
          username: targetUser,
          full_name: targetUser === "admin"
            ? "Pentadbir Sistem IT MAINS"
            : targetUser === "pentadbir" 
            ? "Zainal bin Said (Setiausaha MAINS)" 
            : targetUser === "ketua" 
            ? "Ustaz Ahmad Farhan (Ketua Bahagian Zakat)" 
            : targetUser === "pegawai"
            ? "Encik Khairul Azman (Pegawai Tindakan)"
            : "Puan Siti Aminah (Kerani Pendaftaran)",
          role: targetUser === "admin"
            ? "pentadbir_sistem"
            : targetUser === "pentadbir"
            ? "pengurusan"
            : targetUser === "ketua"
            ? "ketua_unit"
            : targetUser === "pegawai"
            ? "pegawai_pelaksana"
            : "kerani",
          bahagian: targetUser === "admin"
            ? "Unit Teknologi Maklumat & Digital"
            : targetUser === "ketua"
            ? "Bahagian Agihan Zakat"
            : "Pejabat Setiausaha MAINS",
          email: `${targetUser}@mains.gov.my`
        };
        const mockToken = "mock-jwt-token-demo";
        localStorage.setItem("token", mockToken);
        localStorage.setItem("user", JSON.stringify(mockUser));
        onLogin(mockToken, mockUser);
        return;
      }
      setError(err.message || "Nama pengguna atau kata laluan tidak sah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden bg-[#e9f5fb] dark:bg-slate-950 islamic-pattern">
      {/* Ambient background glow accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-[#0aa3a3]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#0b3d5c]/20 blur-3xl pointer-events-none" />

      {/* Top Bar Floating Controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl grid lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-white/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl relative z-10"
      >
        
        {/* Left Side: Brand Identity & Highlights (e-Surat MAINS Theme) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0b3d5c] via-[#0f4f74] to-[#072436] p-7 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Islamic Motif Overlay */}
          <div className="absolute inset-0 islamic-pattern opacity-15 pointer-events-none" />

          {/* Glowing orb accent inside hero */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Basmalah */}
            <div className="text-center sm:text-left">
              <span className="font-serif text-amber-300 text-sm tracking-wide opacity-95">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </span>
            </div>

            {/* Emblem & Title */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-white/10 shrink-0">
                <svg className="w-8 h-8 text-[#0b3d5c]" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <rect x="22" y="22" width="36" height="36" />
                  <rect x="22" y="22" width="36" height="36" transform="rotate(45 40 40)" />
                  <circle cx="40" cy="40" r="7" fill="currentColor" fillOpacity="0.25" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    e-Surat
                  </h1>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-amber-400/25 text-amber-300 border border-amber-400/30">
                    MAINS
                  </span>
                </div>
                <p className="text-xs text-teal-200 font-medium tracking-wide">
                  Majlis Agama Islam Negeri Sembilan
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed border-l-2 border-teal-400 pl-3">
              Penyampaian Surat & Pemantauan Tindakan Rasmi — memperkukuh integriti penyampaian perkhidmatan pentadbiran Islam berteraskan pematuhan SLA 14 hari.
            </p>

            {/* Feature Highlights Grid - hidden on mobile portrait so login form is immediately visible */}
            <div className="hidden sm:block space-y-3 pt-2">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">SLA Tindakan 14 Hari</span>
                  <span className="text-slate-300 text-[11px]">Pemantauan automatik tempoh tindakan dengan amaran kelewatan cawangan.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Minit Hierarki 60+ Cawangan</span>
                  <span className="text-slate-300 text-[11px]">Agihan minit bertingkat dari Setiausaha MAINS hingga ke peringkat unit.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 shrink-0 mt-0.5">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Slip Fizikal Ber-QR & Lembaran Minit</span>
                  <span className="text-slate-300 text-[11px]">Penjanaan slip edaran kaunter dan eksport PDF format rasmi kerajaan.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <span>© {new Date().getFullYear()} MAINS</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Pangkalan Data Aktif
            </span>
          </div>
        </div>

        {/* Right Side: Modern Login Form */}
        <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Greeting Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-300 text-[11px] font-semibold mb-3">
                <Building2 className="w-3 h-3 text-teal-600" />
                <span>Portal Rasmi Pengurusan Surat</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Log Masuk Pengguna
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sila masukkan ID Pengguna dan kata laluan untuk mengakses Peti Minit dan tugasan anda.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-xl border-red-500/30 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 py-3">
                <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Pengguna / ID Kakitangan
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Contoh: pentadbir, ketua, pegawai"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-10 bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-teal-600 focus-visible:border-teal-600 text-xs sm:text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kata Laluan
                  </Label>
                  <button
                    type="button"
                    onClick={() => alert("Sila hubungi Pentadbir ICT MAINS di sambungan 06-765 1402 untuk penetapan semula kata laluan.")}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-semibold"
                  >
                    Lupa kata laluan?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 pr-10 h-10 bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-teal-600 focus-visible:border-teal-600 text-xs sm:text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Ingat sesi log masuk ini</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-10 sm:h-11 bg-gradient-to-r from-teal-600 via-teal-700 to-[#0b3d5c] hover:from-teal-700 hover:to-[#082a40] text-white font-bold rounded-xl shadow-lg shadow-teal-700/20 transition-all duration-200 mt-2 text-xs sm:text-sm gap-2" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mengesahkan Maklumat...</span>
                  </>
                ) : (
                  <>
                    <span>Log Masuk ke e-Surat MAINS</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

          </div>
        </div>

      </motion.div>
    </div>
  );
}
