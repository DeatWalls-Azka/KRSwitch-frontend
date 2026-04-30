import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// 1. Pastikan Path Import BENAR sesuai struktur folder kamu
import UploadScheduleCard from "../components/dash/admin/UploadScheduleCard";
import SystemStatsCard from "../components/dash/admin/SystemStatsCard";
import ExportRecapCard from "../components/dash/admin/ExportRecapCard";
import DangerZoneCard from "../components/dash/admin/DangerZoneCard";
import AdminLogTable from '../components/dash/admin/AdminLogTable';

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClasses: 0, 
    activeOffers: 0, 
    successfulTrades: 0, 
    totalStudents: 0
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-mono">
      {/* Header Admin */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Manajemen Jadwal & Sistem KRSwitch</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-xs font-bold px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          KEMBALI KE DASHBOARD
        </button>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Row 1: Controls & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Kolom Kiri: Upload & Buttons */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <UploadScheduleCard onSuccess={fetchStats} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ExportRecapCard />
              <DangerZoneCard onSuccess={fetchStats} />
            </div>
          </div>

          {/* Kolom Kanan: Info Statis */}
          <div className="flex flex-col gap-6">
            <SystemStatsCard stats={stats} />
          </div>
        </div>

        {/* Row 2: Logging (Full Width di bawah) */}
        <div className="w-full mt-4">
          <AdminLogTable />
        </div>
      </div>
    </div>
  );
}