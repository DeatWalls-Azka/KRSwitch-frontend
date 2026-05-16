import { useState, useEffect } from 'react';
import api from '../api';
import AdminWizardCard from "../components/admin/AdminWizardCard";
import SystemStatsCard from "../components/admin/SystemStatsCard";
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
    <div className="space-y-4 pb-10">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage master data, students, and class enrollments.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 border rounded-full">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium">{stats?.onlineCount || 0} Online Users</span>
        </div>
      </div>

      {/* Wizard & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-1">
          <SystemStatsCard stats={stats} />
        </div>
        <div className="lg:col-span-2">
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