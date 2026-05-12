import React, { useState } from 'react';
import api from '../../../api'; // Path-nya mundur 3 kali karena ada di dalam folder tabs/

const AkunTab = ({ student, onOpenEditProfile }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Beri peringatan super tegas ke Admin
    const confirmDelete = window.confirm(`BAHAYA: Apakah Anda yakin ingin MENGHAPUS TOTAL mahasiswa ${student.nama} (${student.nim}) beserta seluruh data jadwal dan barternya dari sistem? Tindakan ini permanen.`);
    
    if (confirmDelete) {
      setIsDeleting(true);
      try {
        // Menembak endpoint delete di backend
        await api.delete(`/api/admin/users/${student.nim}`);
        alert(`Data mahasiswa ${student.nama} berhasil dihapus permanen!`);
        window.location.reload(); // Refresh halaman agar data kembali bersih
      } catch (error) {
        console.error("Gagal menghapus mahasiswa:", error);
        alert(error.response?.data?.error || "Terjadi kesalahan saat menghapus mahasiswa.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
        <h4 className="text-xs font-black text-rose-700 mb-2">DANGER ZONE MAHASISWA</h4>
        <p className="text-[10px] text-rose-600 mb-4 leading-relaxed">
          Aksi di bawah ini akan mengubah data inti mahasiswa. Hati-hati dalam melakukan perubahan.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onOpenEditProfile} 
            disabled={isDeleting}
            className="w-full py-2 bg-white border border-rose-300 text-rose-600 text-xs font-bold rounded hover:bg-rose-100 disabled:opacity-50"
          >
            EDIT PROFIL (NIM/NAMA)
          </button>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="w-full py-2 bg-rose-600 text-white text-xs font-black rounded hover:bg-rose-700 shadow-sm disabled:bg-rose-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'MENGHAPUS DATA...' : 'HAPUS MAHASISWA DARI SISTEM'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AkunTab;