"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface DashboardStatsProps {
  token: string;
}

export function DashboardStats({ token }: DashboardStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Jumlah Surat",
      value: stats?.total || 0,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Bulan Ini",
      value: stats?.thisMonth || 0,
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Selesai",
      value: stats?.byStatus?.selesai || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Lewat Tempoh",
      value: stats?.overdue || 0,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.byStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Status Surat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                Belum Mula: {stats.byStatus.belum_mula || 0}
              </Badge>
              <Badge variant="default">
                Dalam Proses: {stats.byStatus.dalam_proses || 0}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Selesai: {stats.byStatus.selesai || 0}
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Maklum Balas Dihantar: {stats.byStatus.maklum_balas_dihantar || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
