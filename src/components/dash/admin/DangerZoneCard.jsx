import api from '../../../api';

export default function DangerZoneCard({ onSuccess }) {
  const handlePurgeOffers = async () => {
    const confirm = window.confirm('BAHAYA: Apakah Anda yakin ingin menghapus SEMUA penawaran barter aktif? Ini tidak dapat dibatalkan.');
    if (confirm) {
      try {
        await api.delete('/api/admin/purge-offers');
        alert('Semua penawaran barter berhasil direset.');
        if (onSuccess) onSuccess(); // Panggil fungsi refresh di parent
      } catch (err) {
        alert('Gagal mereset penawaran.');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 flex flex-col">
      <h2 className="text-sm font-bold mb-2 text-red-600 uppercase tracking-wide">Danger Zone</h2>
      <p className="text-[10px] text-gray-500 mb-4 leading-relaxed flex-1">
        Gunakan fungsi ini hanya saat masa modifikasi KRS resmi ditutup oleh kampus.
      </p>
      <button 
        onClick={handlePurgeOffers}
        className="w-full bg-white border border-red-300 text-red-600 py-2.5 rounded-md text-xs font-bold hover:bg-red-50 active:bg-red-100 transition-colors mt-auto"
      >
        RESET SEMUA BARTER
      </button>
    </div>
  );
}