"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { SuratForm } from "@/components/forms/surat-form";
import { SuratList } from "@/components/dashboard/surat-list";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const unreadCount = data.filter((n: any) => !n.is_read).length;
        setNotifications(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogin = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setActiveView("dashboard");
  };

  const renderContent = () => {
    if (!token || !user) return null;

    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Selamat datang, {user.full_name}</p>
            </div>
            <DashboardStats token={token} />
          </div>
        );
      
      case "surat-masuk":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Surat Masuk</h1>
              <p className="text-gray-600">Senarai semua surat masuk</p>
            </div>
            <SuratList token={token} user={user} />
          </div>
        );
      
      case "daftar-surat":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Daftar Surat Baru</h1>
              <p className="text-gray-600">Daftarkan surat masuk baru</p>
            </div>
            <SuratForm 
              token={token} 
              onSuccess={() => {
                setActiveView("surat-masuk");
                fetchNotifications();
              }} 
            />
          </div>
        );
      
      case "pengguna":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Pengurusan Pengguna</h1>
              <p className="text-gray-600">Urus pengguna sistem</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600">Modul pengurusan pengguna akan dilaksanakan dalam fasa seterusnya.</p>
            </div>
          </div>
        );
      
      case "laporan":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Laporan</h1>
              <p className="text-gray-600">Jana laporan sistem</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600">Modul laporan akan dilaksanakan dalam fasa seterusnya.</p>
            </div>
          </div>
        );
      
      case "notifikasi":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Notifikasi</h1>
              <p className="text-gray-600">Notifikasi sistem</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600">Modul notifikasi akan dilaksanakan dalam fasa seterusnya.</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <DashboardStats token={token} />
          </div>
        );
    }
  };

  if (!token || !user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
        notifications={notifications}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 md:ml-0 ml-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
