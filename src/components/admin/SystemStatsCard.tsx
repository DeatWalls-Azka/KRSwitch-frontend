import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';

// --- Types ----------------------------------------------------

interface SystemStats {
  totalStudents?: number;
  totalClasses?: number;
  totalEnrollments?: number;
  activeOffers?: number;
  successfulTrades?: number;
}

interface SystemStatsCardProps {
  stats: SystemStats | null;
  isBarterEnabled?: boolean;
  onToggleBarter?: (enabled: boolean) => Promise<void>;
}

interface StatRowProps {
  label: string;
  value: string | number;
  isEmerald?: boolean;
}

// --- Helpers --------------------------------------------------

const StatRow = ({ label, value, isEmerald }: StatRowProps) => (
  <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{label}</span>
    <span className={`text-[12px] font-mono font-bold ${isEmerald ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>{value}</span>
  </div>
);

// --- Komponen Utama -------------------------------------------

export default function SystemStatsCard({ stats, isBarterEnabled = true, onToggleBarter }: SystemStatsCardProps) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    if (!onToggleBarter || toggling) return;
    const targetState = !isBarterEnabled;
    const confirmMsg = targetState
      ? 'Buka kembali sistem barter? Mahasiswa akan dapat membuat dan mengklaim penawaran barter lagi.'
      : 'TUTUP / JEDA sistem barter? Mahasiswa tidak akan dapat membuat atau mengklaim penawaran baru.';
    
    if (window.confirm(confirmMsg)) {
      setToggling(true);
      try {
        await onToggleBarter(targetState);
      } catch (err: any) {
        alert(err.response?.data?.error || 'Gagal mengubah status barter');
      } finally {
        setToggling(false);
      }
    }
  };

  return (
    <Card className="h-full border-border/50 shadow-sm rounded-md bg-background flex flex-col">
      <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/5 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          System Overview
        </CardTitle>

        {/* Start/Stop Badge Indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${isBarterEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${isBarterEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {isBarterEnabled ? 'Barter Active' : 'Barter Paused'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Toggle Control Card */}
        <div className={`p-3 rounded-md border transition-all ${isBarterEnabled ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold text-foreground">Status Sistem Barter</p>
              <p className="text-[9.5px] text-muted-foreground">
                {isBarterEnabled ? 'Sistem aktif & menerima penawaran' : 'Sistem dijeda oleh admin'}
              </p>
            </div>

            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm border ${
                isBarterEnabled
                  ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white border-amber-600'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-emerald-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {toggling ? 'Memproses...' : isBarterEnabled ? 'Hentikan Barter' : 'Buka Barter'}
            </button>
          </div>
        </div>

        {/* Stats List */}
        <div className="space-y-0.5">
          <StatRow 
            label="Total Students" 
            value={(stats?.totalStudents || 0).toLocaleString()} 
          />
          <StatRow 
            label="Active Classes" 
            value={(stats?.totalClasses || 0).toLocaleString()} 
          />
          <StatRow 
            label="KRS Enrollments" 
            value={(stats?.totalEnrollments || 0).toLocaleString()} 
            isEmerald={true}
          />
          <StatRow 
            label="Active Barters" 
            value={stats?.activeOffers || 0}
          />
          <StatRow 
            label="Successful Swaps" 
            value={stats?.successfulTrades || 0}
            isEmerald={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
