import React, { useState, useEffect } from 'react';
import api, { getAdminBarterStatus, toggleBarterStatus } from '../../api';
import AdminWizardCard from "../../components/admin/AdminWizardCard";
import SystemStatsCard from "../../components/admin/SystemStatsCard";
import AdminLogTable from '../../components/admin/AdminLogTable';
import { useSocketContext } from '../../context/SocketContext';

// --- Types ----------------------------------------------------

interface AdminStats {
  totalClasses: number;
  activeOffers: number;
  successfulTrades: number;
  totalStudents: number;
  onlineCount: number;
  totalEnrollments: number;
  totalOffers: number;
}

// --- Komponen Utama -------------------------------------------

export default function AdminPage() {
  useEffect(() => {
    document.title = 'KRSwitch | Admin Dashboard';
  }, []);

  const [stats, setStats] = useState<AdminStats>({
    totalClasses: 0, 
    activeOffers: 0, 
    successfulTrades: 0, 
    totalStudents: 0,
    onlineCount: 0,
    totalEnrollments: 0,
    totalOffers: 0
  });

  const [barterEnabled, setBarterEnabled] = useState<boolean>(true);

  const { socket } = useSocketContext();

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    }
  };

  const fetchBarterStatus = async () => {
    try {
      const res = await getAdminBarterStatus();
      setBarterEnabled(res.data.enabled);
    } catch (err) {
      console.error('Gagal mengambil status barter:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBarterStatus();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOnlineCount = (count: number) => {
      setStats(prev => ({ ...prev, onlineCount: count }));
    };

    const handleBarterStatusChanged = (data: { enabled: boolean }) => {
      setBarterEnabled(data.enabled);
    };

    socket.on('online-count', handleOnlineCount);
    socket.on('barter-status-changed', handleBarterStatusChanged);

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

    return () => {
      socket.off('online-count', handleOnlineCount);
      socket.off('barter-status-changed', handleBarterStatusChanged);
      refreshEvents.forEach(event => {
        socket.off(event, fetchStats);
      });
    };
  }, [socket]);

  const handleToggleBarter = async (enabled: boolean) => {
    const res = await toggleBarterStatus(enabled);
    setBarterEnabled(res.data.enabled);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm border uppercase tracking-tight ${
              barterEnabled 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse'
            }`}>
              {barterEnabled ? 'Barter Operational' : 'Barter Paused'}
            </span>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Manage master data, students, and class enrollments</p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/30 border border-border/50 rounded-md">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{stats?.onlineCount || 0} Online Users</span>
        </div>
      </div>

      {/* Wizard & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        <div className="lg:col-span-1">
          <SystemStatsCard 
            stats={stats} 
            isBarterEnabled={barterEnabled} 
            onToggleBarter={handleToggleBarter} 
          />
        </div>
        <div className="lg:col-span-3">
          <AdminWizardCard stats={stats} onRefresh={fetchStats} />
        </div>
      </div>

      {/* Log Table Section */}
      <div className="w-full">
        <AdminLogTable />
      </div>
    </div>
  );
}
