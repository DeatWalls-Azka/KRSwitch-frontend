// src/components/dash/admin/modals/AddStudentModal.jsx
import React from 'react';

const AddStudentModal = ({ isOpen, onClose }) => {
  // Kalau state isOpen false, jangan render apa-apa
  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-emerald-500 p-4">
          <h3 className="text-white font-bold">Tambah Mahasiswa Baru</h3>
          <p className="text-emerald-100 text-xs mt-1">Masukkan data mahasiswa ke dalam sistem KRSwitch.</p>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">NIM Mahasiswa</label>
            <input type="text" placeholder="Contoh: G6401231001" className="w-full p-2 border border-gray-200 rounded outline-none focus:border-emerald-500 font-mono text-sm uppercase" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Lengkap</label>
            <input type="text" placeholder="Masukkan nama lengkap..." className="w-full p-2 border border-gray-200 rounded outline-none focus:border-emerald-500 text-sm" />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          {/* Tombol batal memanggil fungsi onClose yang dilempar dari induk */}
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">BATAL</button>
          <button onClick={() => { alert('Disimpan!'); onClose(); }} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded shadow-sm hover:bg-emerald-700 transition-colors">SIMPAN DATA</button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;