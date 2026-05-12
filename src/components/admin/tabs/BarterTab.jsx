import React, { useState } from 'react';
import api from '../../../api'; // Pastikan path-nya mundur 3 kali

const BarterTab = ({ student }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Fungsi untuk paksa hapus barter dari sisi Admin
  const handleDeleteOffer = async (offerId) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin membatalkan/menghapus tawaran barter (ID: ${offerId}) milik ${student.nama}?`);
    
    if (confirmDelete) {
      setIsProcessing(true);
      try {
        // Menembak endpoint delete spesifik untuk offer
        await api.delete(`/api/admin/offers/${offerId}`);
        alert('Tawaran barter berhasil dibatalkan secara paksa!');
        window.location.reload(); // Refresh data mahasiswa
      } catch (error) {
        console.error("Gagal menghapus tawaran:", error);
        alert(error.response?.data?.error || "Gagal menghapus tawaran barter.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Penawaran Aktif</label>
      </div>

      {student.activeOffers && student.activeOffers.length > 0 ? (
        student.activeOffers.map(offer => (
          <div key={offer.id} className="p-3 bg-emerald-50 border border-emerald-100 rounded flex justify-between items-center">
            <div>
              {/* Penyesuaian variabel agar aman jika format dari backend berbeda */}
              <p className="text-xs font-bold text-emerald-900">{offer.course || offer.myClass?.courseCode || 'Mata Kuliah'}</p>
              <p className="text-[10px] font-bold text-emerald-900">
                Tukar: {offer.from || offer.myClass?.classCode} ➔ {offer.target || offer.wantedClass?.classCode}
              </p>
            </div>
            <button 
              onClick={() => handleDeleteOffer(offer.id)} 
              disabled={isProcessing}
              className="px-2 py-1 bg-white border border-rose-200 text-rose-500 text-[10px] font-bold rounded hover:bg-rose-50 disabled:opacity-50"
            >
              HAPUS
            </button>
          </div>
        ))
      ) : (
        <p className="text-xs text-slate-500 text-center py-4">Tidak ada penawaran aktif.</p>
      )}

      <button 
        onClick={() => alert(`Fitur posting tawaran barter baru atas nama ${student.nama} membutuhkan pembuatan Modal Form tersendiri (Dalam Pengembangan).`)} 
        className="w-full mt-2 py-2 bg-white border-2 border-dashed border-emerald-400 text-emerald-600 text-xs font-black rounded hover:bg-emerald-50 transition-all"
      >
        + PAKSA BUAT TAWARAN BARTER
      </button>
    </div>
  );
};

export default BarterTab;