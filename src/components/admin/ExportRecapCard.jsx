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
      alert('Gagal mendownload rekap jadwal. Pastikan server backend sudah menyala.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExportRecap}
      disabled={isExporting}
      className="flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-50 rounded-lg text-xs font-black transition-all w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Ikon Download SVG */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      
      {isExporting ? 'MENGUNDUH...' : 'EXPORT'}
    </button>
  );
}