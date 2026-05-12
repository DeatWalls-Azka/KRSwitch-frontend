import React, { useState } from 'react';
import api from '../../../api'; // Pastikan path import benar

const OverrideTab = ({ student }) => {
  const [targetNim, setTargetNim] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOverride = async () => {
    if (!targetNim || !selectedCourse) {
      alert('Harap isi NIM target dan pilih mata kuliah!');
      return;
    }
    
    // Peringatan konfirmasi ke Admin
    const confirmOverride = window.confirm(`⚡ PERINGATAN SISTEM ⚡\nAnda akan menukar PAKSA jadwal matkul ${selectedCourse} antara ${student.nim} dan ${targetNim}.\n\nLanjutkan eksekusi?`);
    
    if (confirmOverride) {
      setIsProcessing(true);
      try {
        // Menembak API backend khusus untuk Override Swap
        await api.post('/api/admin/override-swap', {
          nim1: student.nim,
          nim2: targetNim,
          courseCode: selectedCourse
        });
        
        alert(`Sukses! Jadwal ${student.nim} dan ${targetNim} berhasil ditukar paksa.`);
        setTargetNim('');
        setSelectedCourse('');
        window.location.reload(); // Refresh untuk melihat hasil
      } catch (error) {
        console.error("Gagal eksekusi override:", error);
        alert(error.response?.data?.error || "Gagal mengeksekusi Override. Pastikan NIM Target valid dan mengambil mata kuliah yang sama.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="p-2 animate-in fade-in duration-500">
      {/* Container utama */}
      <div className="p-6 bg-emerald-50 border border-slate-200 rounded-xl">
        
        {/* Header dengan aksen Emerald */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">
            Manual Override 
          </h4>
        </div>
        
        <div className="space-y-5">
          {/* Input NIM Target */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">NIM Lawan Tukar</label>
            <input 
              type="text" 
              value={targetNim}
              onChange={(e) => setTargetNim(e.target.value.toUpperCase())}
              disabled={isProcessing}
              placeholder="Contoh: M0403241001" 
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono bg-white transition-all shadow-sm disabled:opacity-50" 
            />
          </div>

          {/* Dropdown Matkul */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Mata Kuliah Yang Dipindahkan</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={isProcessing}
              className="w-full p-2.5 text-sm border text-slate-600 border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {student?.courses?.map(course => {
                // Adaptasi nama variabel dari backend Gilang
                const courseCode = course.parallelClass?.courseCode || course.name;
                const classCode = course.parallelClass?.classCode || course.currentClass;
                
                return (
                  <option key={course.id} value={courseCode}>
                    {courseCode} (Kelas {classCode})
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Tombol Eksekusi */}
          <button 
            onClick={handleOverride}
            disabled={isProcessing || !targetNim || !selectedCourse}
            className="w-full py-3 bg-emerald-500 text-white text-[10px] font-black rounded-lg hover:bg-emerald-600 transition-all shadow-md active:scale-[0.98] tracking-widest disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'MENGEKSEKUSI...' : 'EKSEKUSI PAKSA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverrideTab;