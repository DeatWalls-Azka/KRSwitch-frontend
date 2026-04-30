import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

import UploadScheduleCard from "../components/dash/admin/UploadScheduleCard";
import SystemStatsCard from "../components/dash/admin/SystemStatsCard";
import ExportRecapCard from "../components/dash/admin/ExportRecapCard";
import DangerZoneCard from "../components/dash/admin/DangerZoneCard";
import AdminLogTable from '../components/dash/admin/AdminLogTable';
import ManualOverrideCard from "../components/dash/admin/ManualOverrideCard";
import StudentManagementCard from "../components/dash/admin/StudentManagementCard";

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

      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* BARIS ATAS: Menggunakan Grid 3 Kolom untuk Kontrol Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Kolom Kiri (2 Bagian): Kontrol & Edit */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <UploadScheduleCard onSuccess={fetchStats} />
            <StudentManagementCard />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ExportRecapCard />
              <DangerZoneCard onSuccess={fetchStats} />
            </div>
          </div>

          {/* Kolom Kanan (1 Bagian): Status & Manual Override (Static, Tidak Sticky) */}
          <div className="flex flex-col gap-6">
            <SystemStatsCard stats={stats} />
            <ManualOverrideCard /> 
          </div>
        </div>

        {/* BARIS BAWAH: Tabel Logging (Lebar Penuh/Full Width) */}
        <div className="w-full">
          <AdminLogTable />
        </div>

      </div>
    </div>
  );
}