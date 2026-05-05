
import React from 'react';

const AddCourseModal = ({ isOpen, onClose, studentName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header Modal - Warna Hijau/Emerald */}
        <div className="bg-emerald-500 p-4">
          <h3 className="text-white font-bold">Tambah Mata Kuliah</h3>
          <p className="text-emerald-100 text-xs mt-1">
            Tambahkan enrollment kelas baru untuk {studentName || 'mahasiswa'}.
          </p>
        </div>
        
        {/* Body / Form */}
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Pilih Mata Kuliah</label>
            <select className="w-full p-2 border border-gray-200 rounded outline-none focus:border-emerald-500 text-sm bg-white">
              <option value="">-- Pilih Matkul --</option>
              <option value="KOM201">Arsitektur Komputer (KOM201)</option>
              <option value="KOM204">Metode Numerik (KOM204)</option>
              <option value="KOM208">Rekayasa Perangkat Lunak (KOM208)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Pilih Kelas</label>
            <select className="w-full p-2 border border-gray-200 rounded outline-none focus:border-emerald-500 text-sm bg-white">
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
            </select>
          </div>
        </div>
        
        {/* Footer / Buttons */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            BATAL
          </button>
          <button 
            onClick={() => { alert('Matkul ditambahkan!'); onClose(); }} 
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded shadow-sm hover:bg-emerald-700 transition-colors"
          >
            TAMBAHKAN MATKUL
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddCourseModal;