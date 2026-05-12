import React, { useState } from 'react';
import api from '../../../api'; // Pastikan path-nya benar

const KrsTab = ({ student, onOpenAddCourse }) => {
  // State untuk menampung perubahan kelas sementara sebelum disimpan
  const [modifiedClasses, setModifiedClasses] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Menangani saat Admin mengganti pilihan di dropdown
  const handleClassChange = (enrollmentId, newClass) => {
    setModifiedClasses(prev => ({
      ...prev,
      [enrollmentId]: newClass
    }));
  };

  // Fungsi untuk paksa Drop Matkul
  const handleDropCourse = async (enrollmentId, courseName) => {
    const confirmDrop = window.confirm(`BAHAYA: Yakin ingin me-nge-DROP matkul ${courseName} secara paksa dari KRS ${student.nama}?`);
    
    if (confirmDrop) {
      setIsProcessing(true);
      try {
        await api.delete(`/api/admin/enrollments/${enrollmentId}`);
        alert(`Matkul ${courseName} berhasil di-drop!`);
        window.location.reload(); // Refresh data untuk melihat hasil
      } catch (error) {
        console.error("Gagal drop matkul:", error);
        alert(error.response?.data?.error || "Terjadi kesalahan saat menghapus mata kuliah.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Fungsi untuk menyimpan perubahan pindah kelas
  const handleSaveChanges = async () => {
    // Cek apakah ada kelas yang diubah
    const updates = Object.keys(modifiedClasses);
    if (updates.length === 0) {
      return alert("Tidak ada perubahan kelas yang perlu disimpan.");
    }

    setIsProcessing(true);
    try {
      // Kita gunakan Promise.all agar bisa menyimpan beberapa perubahan kelas sekaligus
      await Promise.all(
        updates.map(enrollmentId => 
          api.put(`/api/admin/enrollments/${enrollmentId}`, { 
            newClassCode: modifiedClasses[enrollmentId] 
          })
        )
      );
      
      alert('Perubahan KRS berhasil disimpan ke database!');
      window.location.reload();
    } catch (error) {
      console.error("Gagal menyimpan perubahan KRS:", error);
      alert("Terjadi kesalahan saat menyimpan. Pastikan kelas tujuan tersedia.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Daftar Mata Kuliah</label>
        <button 
          onClick={onOpenAddCourse} 
          disabled={isProcessing}
          className="text-[10px] font-bold text-emerald-600 hover:underline disabled:opacity-50"
        >
          + Tambah Matkul
        </button>
      </div>

      {student.courses && student.courses.length > 0 ? (
        student.courses.map(course => {
          // Penyesuaian variabel untuk menangkap format data dari backend (Prisma) atau dummy
          const enrollmentId = course.id;
          const courseName = course.parallelClass?.courseCode || course.name;
          const currentClass = course.parallelClass?.classCode || course.currentClass;
          
          return (
            <div key={enrollmentId} className="flex items-center gap-3 p-3 bg-emerald-50 border border-gray-100 rounded">
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-900">{courseName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-emerald-900">Kelas:</span>
                  <select 
                    // Tampilkan value dari state jika ada perubahan, kalau tidak gunakan currentClass asli
                    value={modifiedClasses[enrollmentId] || currentClass}
                    onChange={(e) => handleClassChange(enrollmentId, e.target.value)}
                    disabled={isProcessing}
                    className="p-1 text-xs border border-gray-300 rounded outline-none font-bold text-emerald-700 bg-white"
                  >
                    {/* Daftar Opsi Kelas (Bisa disesuaikan nanti jika ditarik dari database) */}
                    <option value={currentClass}>{currentClass}</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => handleDropCourse(enrollmentId, courseName)} 
                disabled={isProcessing}
                className="px-2 py-1 bg-white border border-rose-200 text-rose-500 text-[10px] font-bold rounded hover:bg-rose-50 disabled:opacity-50"
              >
                DROP
              </button>
            </div>
          );
        })
      ) : (
        <p className="text-xs text-slate-500 text-center py-4">Mahasiswa ini belum mengambil mata kuliah (KRS Kosong).</p>
      )}

      <button 
        onClick={handleSaveChanges}
        disabled={isProcessing || Object.keys(modifiedClasses).length === 0}
        className="w-full mt-2 py-2 bg-emerald-500 text-white text-xs font-black rounded hover:bg-emerald-600 transition-all shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN KRS'}
      </button>
    </div>
  );
};

export default KrsTab;