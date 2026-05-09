import React from 'react';

const BarterTab = ({ student }) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Penawaran Aktif</label>
      </div>

      {student.activeOffers.length > 0 ? (
        student.activeOffers.map(offer => (
          <div key={offer.id} className="p-3 bg-emerald-50 border border-emerald-100 rounded flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-emerald-900">{offer.course}</p>
              <p className="text-[10px] font-bold text-emerald-900">Tukar: {offer.from} ➔ {offer.target}</p>
            </div>
            <button onClick={() => alert(`Paksa hapus tawaran barter ID: ${offer.id}`)} className="px-2 py-1 bg-white border border-rose-200 text-rose-500 text-[10px] font-bold rounded hover:bg-rose-50">
              HAPUS
            </button>
          </div>
        ))
      ) : (
        <p className="text-xs text-slate-500 text-center py-4">Tidak ada penawaran aktif.</p>
      )}

      <button onClick={() => alert(`Posting tawaran barter baru atas nama ${student.nama}`)} className="w-full mt-2 py-2 bg-white border-2 border-dashed border-emerald-400 text-emerald-600 text-xs font-black rounded hover:bg-emerald-50 transition-all">
        + PAKSA BUAT TAWARAN BARTER
      </button>
    </div>
  );
};

export default BarterTab;