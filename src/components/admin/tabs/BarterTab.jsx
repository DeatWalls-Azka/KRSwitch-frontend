import React, { useState } from 'react';
import api from '../../../api';
import { Repeat, ArrowRight, X, Plus, Info } from 'lucide-react';
import { Button } from '../../ui/button';

const BarterTab = ({ student, onRefresh }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeleteOffer = async (offerId) => {
    const confirmDelete = window.confirm(
      `Peringatan: Yakin ingin menghapus penawaran barter milik ${student.name}?`
    );

    if (confirmDelete) {
      setIsProcessing(true);
      try {
        await api.delete(`/api/admin/offers/${offerId}`);
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Gagal menghapus tawaran:', error);
        alert(error.response?.data?.error || 'Gagal menghapus penawaran barter.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Repeat size={16} className="text-muted-foreground" />
          <h4 className="text-sm font-black uppercase tracking-tight">Antrean Barter Aktif</h4>
        </div>
        <span className="text-[10px] font-black bg-muted px-2 py-1 rounded border border-border uppercase tracking-widest text-muted-foreground">
          {student.activeOffers?.length || 0} Antrean
        </span>
      </div>

      <div className="space-y-3">
        {student.activeOffers && student.activeOffers.length > 0 ? (
          student.activeOffers.map(offer => (
            <div key={offer.id} className="p-4 bg-background border border-border rounded-xl shadow-sm flex justify-between items-center group transition-all duration-200 hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Repeat size={18} strokeWidth={2.5} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-black text-foreground tracking-tight uppercase">{offer.myClass?.courseCode || 'Mata Kuliah'}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[9px] font-black border border-border uppercase tracking-widest">
                      {offer.myClass?.classCode}
                    </span>
                    <ArrowRight size={10} strokeWidth={3} className="text-muted-foreground/50" />
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-black border border-primary/20 uppercase tracking-widest">
                      {offer.wantedClass?.classCode}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteOffer(offer.id)}
                disabled={isProcessing}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Hapus Penawaran"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          ))
        ) : (
          <div className="py-16 text-center bg-muted/20 rounded-xl border-2 border-dashed border-border">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-muted-foreground/30 border border-border">
              <Repeat size={24} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Belum ada penawaran barter</p>
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button
          variant="outline"
          onClick={() => alert(`Fitur posting tawaran barter admin segera hadir.`)}
          className="w-full h-14 border-2 border-dashed border-border hover:bg-muted/50 hover:border-primary/20 transition-all group"
        >
          <Plus size={16} strokeWidth={3} className="text-muted-foreground group-hover:text-primary mr-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">BUAT PENAWARAN PAKSA</span>
        </Button>
        <div className="mt-4 flex items-center gap-2 justify-center opacity-50">
          <Info size={12} className="text-muted-foreground" />
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Postingan manual akan memicu notifikasi sistem.</p>
        </div>
      </div>
    </div>
  );
};

export default BarterTab;
