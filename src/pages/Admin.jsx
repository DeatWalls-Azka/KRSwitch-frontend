import { useState, useEffect } from 'react';
import api from '../api';
import { Users as UsersIcon, LayoutDashboard } from 'lucide-react';
import UploadScheduleCard from "../components/admin/UploadScheduleCard";
import SystemStatsCard from "../components/admin/SystemStatsCard";
import DangerZoneCard from "../components/admin/DangerZoneCard";
import AdminLogTable from '../components/admin/AdminLogTable';
import io from 'socket.io-client';

export default function Admin() {
  const [stats, setStats] = useState({
    totalClasses: 0, 
    activeOffers: 0, 
    successfulTrades: 0, 
    totalStudents: 0,
    onlineCount: 0
  });

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    }
  };

  useEffect(() => {
    fetchStats();

    const socket = io('http://localhost:5000');
    
    socket.on('online-count', (count) => {
      setStats(prev => ({ ...prev, onlineCount: count }));
    });

    const refreshEvents = [
      'admin-schedule-updated',
      'admin-offers-purged',
      'admin-user-created',
      'admin-user-updated',
      'admin-user-deleted',
      'admin-enrollment-created',
      'admin-enrollment-updated',
      'admin-enrollment-deleted',
      'enrollments-swapped',
      'offer-taken'
    ];

    refreshEvents.forEach(event => {
      socket.on(event, fetchStats);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <LayoutDashboard size={20} strokeWidth={2.5} />
            <h1 className="text-2xl font-black tracking-tight">Ringkasan Sistem</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Monitoring aktivitas real-time dan manajemen data master.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-background border border-border rounded-lg shadow-sm">
          <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black text-foreground tracking-tight">{stats.onlineCount || 0} Mahasiswa Aktif</span>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SystemStatsCard stats={stats} />
        <UploadScheduleCard onSuccess={fetchStats} />
        <DangerZoneCard onSuccess={fetchStats} />
      </div>

      {/* Log Table Section */}
      <div className="w-full">
        <AdminLogTable />
      </div>
    </div>
  );
}