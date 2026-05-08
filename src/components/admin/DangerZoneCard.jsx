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
    // Tambahkan flex flex-col dan h-full agar sejajar dengan kartu lain
    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 flex flex-col h-full">
      <h2 className="text-sm font-bold mb-4 text-red-600 uppercase tracking-wide border-b border-red-50 pb-2">
        Danger Zone
      </h2>
      
      <p className="text-sm text-slate-600 font-medium leading-relaxed flex-1">
        Gunakan fungsi ini hanya saat masa modifikasi KRS resmi ditutup oleh kampus. Fitur ini akan menghapus seluruh antrean barter yang ada di sistem.
      </p>
      <button 
        onClick={handlePurgeOffers}
        className="w-full bg-white border-2 border-red-200 text-red-600 py-2.5 rounded-lg text-xs font-black hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-all mt-auto shadow-sm"
      >
        RESET SEMUA BARTER
      </button>
    </div>
  );
}