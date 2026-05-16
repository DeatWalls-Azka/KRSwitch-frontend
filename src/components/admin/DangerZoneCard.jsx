import { AlertTriangle, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import api from '../../api';

export default function DangerZoneCard({ onSuccess }) {
  const handlePurgeOffers = async () => {
    const confirm = window.confirm('BAHAYA: Apakah Anda yakin ingin menghapus SEMUA penawaran barter aktif? Ini tidak dapat dibatalkan.');
    if (confirm) {
      try {
        await api.delete('/api/admin/purge-offers');
        alert('Semua penawaran barter berhasil direset.');
        if (onSuccess) onSuccess(); 
      } catch (err) {
        alert('Gagal mereset penawaran.');
      }
    }
  };

  return (
    <Card className="flex flex-col h-full border-destructive/20 shadow-sm bg-destructive/[0.02]">
      <CardHeader className="flex flex-row items-center gap-3 pb-6 border-b border-destructive/10 bg-destructive/[0.03]">
        <div className="p-2 bg-destructive/10 rounded-lg text-destructive shrink-0">
          <AlertTriangle size={18} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <CardTitle className="text-sm font-black uppercase tracking-tight text-destructive">Danger Zone</CardTitle>
          <span className="text-[9px] font-bold text-destructive/60 uppercase tracking-widest">Restricted Access</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col pt-6">
        <div className="flex-1 space-y-4">
          <p className="text-xs text-foreground font-bold leading-relaxed">
            Tindakan destruktif yang secara permanen menghapus data transaksi dari sistem.
          </p>
          <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/10">
            <p className="text-[10px] text-destructive font-medium leading-relaxed italic opacity-80 border-l-2 border-destructive/30 pl-3">
              Gunakan fungsi ini hanya saat masa modifikasi KRS resmi ditutup. Fitur ini akan membersihkan seluruh antrean barter yang ada.
            </p>
          </div>
        </div>

        <Button 
          variant="danger"
          size="admin"
          onClick={handlePurgeOffers}
          className="mt-8 h-11"
        >
          <Trash2 size={16} strokeWidth={3} />
          PURGE SEMUA DATA BARTER
        </Button>
      </CardContent>
    </Card>
  );
}