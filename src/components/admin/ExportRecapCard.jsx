import { useState } from 'react';
import api from '../../api';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

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
    <Button 
      variant="adminOutline" 
      size="sm"
      onClick={handleExportRecap}
      disabled={isExporting}
      className="h-10 text-[10px] font-black uppercase tracking-tight"
    >
      {isExporting ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <Download size={16} strokeWidth={3} />
      )}
      
      {isExporting ? 'Exporting...' : 'Ekspor Rekap CSV'}
    </Button>
  );
}