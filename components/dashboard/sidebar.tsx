"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Plus, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home
} from "lucide-react";

interface SidebarProps {
  user: any;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  notifications: number;
}

export function Sidebar({ user, activeView, onViewChange, onLogout, notifications }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['all'] },
    { id: 'surat-masuk', label: 'Surat Masuk', icon: FileText, roles: ['all'] },
    { id: 'daftar-surat', label: 'Daftar Surat Baru', icon: Plus, roles: ['kerani', 'ketua_unit', 'pengurusan'] },
    { id: 'pengguna', label: 'Pengurusan Pengguna', icon: Users, roles: ['pengurusan'] },
    { id: 'laporan', label: 'Laporan', icon: BarChart3, roles: ['ketua_unit', 'pengurusan'] },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell, roles: ['all'], badge: notifications },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(user.role)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">STSM</h2>
            <p className="text-sm text-gray-600">MAINS</p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex-1 p-4">
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
          <p className="text-xs text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
          {user.bahagian && (
            <p className="text-xs text-gray-500">{user.bahagian}</p>
          )}
        </div>

        <nav className="space-y-2">
          {filteredMenuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onViewChange(item.id);
                setIsOpen(false);
              }}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
              {item.badge && item.badge > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Log Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <SidebarContent />
      </div>
    </>
  );
}
