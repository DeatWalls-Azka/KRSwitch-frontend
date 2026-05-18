import React, { useState, useEffect } from 'react';
import api from '../api';
import AdminWizardCard from "../components/admin/AdminWizardCard";
import SystemStatsCard from "../components/admin/SystemStatsCard";
import AdminLogTable from '../components/admin/AdminLogTable';
import { io } from 'socket.io-client';
import { getSocketToken } from '../api';

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

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket']
    });
    getSocketToken().then(res => socket.emit('authenticate', res.data.token)).catch(console.error);
    
    socket.on('online-count', (count: number) => {
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

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-4 pb-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold rounded-sm border border-emerald-500/20 uppercase tracking-tight">System Operational</span>
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
          <SystemStatsCard stats={stats} />
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
