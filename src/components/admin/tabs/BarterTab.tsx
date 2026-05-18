import React, { useState } from 'react';
import api from '../../../api';
import { Repeat, ArrowRight, X, Plus, Info } from 'lucide-react';
import { Button } from '../../ui/button';

// --- Types ----------------------------------------------------

interface ClassData {
  courseCode: string;
  classCode: string;
}

interface Offer {
  id: number;
  myClass: ClassData;
  wantedClass: ClassData;
}

interface Student {
  nim: string;
  name: string;
  activeOffers?: Offer[];
}

interface BarterTabProps {
  student: Student;
  onRefresh?: () => void;
}

// --- Komponen Utama -------------------------------------------

const BarterTab = ({ student, onRefresh }: BarterTabProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeleteOffer = async (offerId: number) => {
    const confirmDelete = window.confirm(
      `Peringatan: Yakin ingin menghapus penawaran barter milik ${student.name}?`
    );

    if (confirmDelete) {
      setIsProcessing(true);
      try {
        await api.delete(`/api/admin/offers/${offerId}`);
        if (onRefresh) onRefresh();
      } catch (error: any) {
        console.error('Gagal menghapus tawaran:', error);
        alert(error.response?.data?.error || 'Gagal menghapus penawaran barter.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Repeat size={14} className="text-emerald-700" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Barter Queue</h4>
        </div>
        <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-sm border border-emerald-500/30 uppercase tracking-tighter">
          {student.activeOffers?.length || 0} Open Offers
        </span>
      </div>

      <div className="space-y-2">
        {student.activeOffers && student.activeOffers.length > 0 ? (
          student.activeOffers.map(offer => (
            <div key={offer.id} className="p-3 bg-background border border-border/60 rounded-md shadow-sm flex justify-between items-center group transition-all duration-200 hover:border-emerald-500/40">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded bg-emerald-500/5 flex items-center justify-center text-emerald-700 border border-border/50 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Repeat size={14} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-foreground tracking-tight uppercase leading-none">{offer.myClass?.courseCode || 'Course ID'}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-muted/40 text-muted-foreground rounded-sm text-[8px] font-bold border border-border/60 uppercase tracking-widest">
                      {offer.myClass?.classCode}
                    </span>
                    <ArrowRight size={10} className="text-muted-foreground/50" />
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 rounded-sm text-[8px] font-bold border border-emerald-500/30 uppercase tracking-widest">
                      {offer.wantedClass?.classCode}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteOffer(offer.id)}
                disabled={isProcessing}
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Cancel Offer"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 text-center bg-muted/5 rounded-md border border-dashed border-border/40">
            <Repeat size={20} className="mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">No active barter offers</p>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button
          variant="outline"
          onClick={() => alert(`Force barter feature coming soon.`)}
          className="w-full h-10 border border-dashed border-border/50 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all group rounded-md"
        >
          <Plus size={14} className="text-muted-foreground group-hover:text-emerald-600 mr-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-emerald-600">INJECT MANUAL OFFER</span>
        </Button>
        <div className="mt-4 flex items-center gap-2 justify-center opacity-40">
          <Info size={10} className="text-muted-foreground" />
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Manual injections will trigger system-wide sync.</p>
        </div>
      </div>
    </div>
  );
};

export default BarterTab;
