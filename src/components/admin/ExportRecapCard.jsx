import { useState } from 'react';
import api from '../../api';

export default function ExportRecapCard() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportRecap = async () => {
    setIsExporting(true);
    try {
      const res = await api.get('/api/admin/export-recap', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rekap_Jadwal_KRSwitch_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); 
    } catch (err) {
      alert('Gagal mendownload rekap jadwal. Pastikan server merespons dengan format yang benar.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <h2 className="text-sm font-bold mb-2 text-slate-800 uppercase tracking-wide">Export Rekap Akhir</h2>
      <p className="text-[10px] text-gray-500 mb-4 leading-relaxed flex-1">
        Unduh data final jadwal seluruh mahasiswa setelah proses barter selesai untuk disinkronisasi.
      </p>
      <button 
        onClick={handleExportRecap}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-2.5 rounded-md text-xs font-bold hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed mt-auto"
      >
        {isExporting ? 'MENGUNDUH...' : 'DOWNLOAD REKAP'}
      </button>
    </div>
  );
}