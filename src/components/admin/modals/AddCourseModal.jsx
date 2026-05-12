import React, { useState, useEffect } from 'react';
import api from '../../../api';

const AddCourseModal = ({ isOpen, onClose, studentName, studentNim }) => {
  const [allClasses, setAllClasses] = useState([]); // Daftar semua kelas dari DB
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Tarik daftar mata kuliah & kelas yang tersedia saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const fetchClasses = async () => {
        setIsLoading(true);
        try {
          const response = await api.get('/api/classes');
          setAllClasses(response.data);
        } catch (error) {
          console.error("Gagal mengambil daftar kelas:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchClasses();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddCourse = async () => {
    if (!selectedClassId) return alert('Silakan pilih kelas terlebih dahulu!');

    setIsProcessing(true);
    try {
      // Kirim perintah tambah enrollment ke backend
      await api.post('/api/admin/enrollments', {
        nim: studentNim,
        parallelClassId: parseInt(selectedClassId)
      });

      alert(`Berhasil menambahkan mata kuliah untuk ${studentName}!`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Gagal menambah matkul:", error);
      alert(error.response?.data?.error || "Gagal menambahkan mata kuliah. Mungkin mahasiswa sudah mengambil matkul ini?");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="bg-emerald-500 p-4">
          <h3 className="text-white font-bold">Tambah Mata Kuliah</h3>
          <p className="text-emerald-100 text-xs mt-1">
            Tambahkan enrollment kelas baru untuk {studentName || 'mahasiswa'}.
          </p>
        </div>
        
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Pilih Mata Kuliah & Kelas</label>
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={isLoading || isProcessing}
              className="w-full p-2 border border-gray-200 rounded outline-none focus:border-emerald-500 text-sm bg-white disabled:bg-slate-50"
            >
              <option value="">-- {isLoading ? 'Memuat...' : 'Pilih Matkul & Kelas'} --</option>
              {allClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.courseCode} - Kelas {cls.classCode}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              *Hanya menampilkan kelas yang terdaftar di database master.
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            BATAL
          </button>
          <button 
            onClick={handleAddCourse} 
            disabled={isProcessing || !selectedClassId}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded shadow-sm hover:bg-emerald-700 transition-colors disabled:bg-emerald-400"
          >
            {isProcessing ? 'MEMPROSES...' : 'TAMBAHKAN MATKUL'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddCourseModal;