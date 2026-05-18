import { useState } from 'react';
import { exportRecapSchedules } from '../../api';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

export default function ExportRecapCard() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportRecap = async () => {
    setIsExporting(true);
    try {
      const res = await exportRecapSchedules();
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
      size="icon"
      onClick={handleExportRecap}
      disabled={isExporting}
      className="h-9 w-9"
    >
      {isExporting ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <Download size={15} strokeWidth={2.5} />
      )}
    </Button>
  );
}
