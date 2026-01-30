import React from 'react';

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Admin */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin Panel</h1>
          <p className="text-slate-500">Khusus Komti - Manajemen Jadwal KRSwitch</p>
        </div>
        <a href="/" className="text-sm font-semibold text-blue-600 hover:underline">
          Kembali ke Dashboard
        </a>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Upload Data */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Upload Jadwal Baru</h2>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <p className="text-sm text-slate-500">Klik atau seret file CSV jadwal di sini</p>
          </div>
          <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            Proses Jadwal
          </button>
        </div>

        {/* Card 2: Statistik Ringkas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Status Sistem</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Total Jadwal</span>
              <span className="font-bold text-slate-900">124</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Permintaan Tukar</span>
              <span className="font-bold text-blue-600">12 Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}