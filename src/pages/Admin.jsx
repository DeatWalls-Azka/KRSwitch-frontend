import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

import UploadScheduleCard from "../components/admin/UploadScheduleCard";
import SystemStatsCard from "../components/admin/SystemStatsCard";
import DangerZoneCard from "../components/admin/DangerZoneCard";
import AdminLogTable from '../components/admin/AdminLogTable';

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClasses: 0, activeOffers: 0, successfulTrades: 0, totalStudents: 0
  });

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-mono text-slate-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Manajemen Jadwal & Sistem KRSwitch</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-2.5 border-2 border-emerald-600 text-emerald-600 bg-white text-xs font-black rounded-lg hover:bg-emerald-50 transition-all uppercase tracking-widest shadow-sm"
          >
            BERANDA
          </button>
          <button 
            onClick={() => navigate('/admin/students')} 
            className="px-6 py-2.5 border-2 border-emerald-600 text-emerald-600 bg-white text-xs font-black rounded-lg hover:bg-emerald-50 transition-all uppercase tracking-widest shadow-sm flex items-center gap-2"
          >
            MANAGE MAHASISWA ➔
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="h-full">
            <SystemStatsCard stats={stats} />
          </div>
          <div className="h-full">
            <UploadScheduleCard onSuccess={fetchStats} />
          </div>
          <div className="h-full">
            <DangerZoneCard onSuccess={fetchStats} />
          </div>
        </div>
        <div className="w-full">
          <AdminLogTable />
        </div>
      </div>
    </div>
  );
}