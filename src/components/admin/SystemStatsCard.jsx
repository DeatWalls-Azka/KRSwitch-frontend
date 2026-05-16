import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';

const StatRow = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-muted/20 transition-all duration-200 hover:bg-muted/40">
    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
    <span className="text-sm font-black tracking-tight text-foreground">{value}</span>
  </div>
);

export default function SystemStatsCard({ stats }) {
  return (
    <Card className="h-full border-border shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-6 border-b border-border/50 bg-muted/10">
        <div className="p-2 bg-primary/5 rounded-lg text-primary shrink-0">
          <BarChart3 size={18} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <CardTitle className="text-sm font-black uppercase tracking-tight">Statistik Global</CardTitle>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Data Real-time</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-6">
        <StatRow 
          label="Mahasiswa Terdaftar" 
          value={(stats?.totalStudents || 0).toLocaleString()} 
        />
        <StatRow 
          label="Total Kelas Aktif" 
          value={(stats?.totalClasses || 0).toLocaleString()} 
        />
        <StatRow 
          label="Penawaran Antre" 
          value={stats?.activeOffers || 0}
        />
        <StatRow 
          label="Berhasil Ditukar" 
          value={stats?.successfulTrades || 0}
        />

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between opacity-60">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Update Terakhir</span>
          <span className="text-[10px] font-black text-foreground tracking-tight uppercase">Sekarang</span>
        </div>
      </CardContent>
    </Card>
  );
}