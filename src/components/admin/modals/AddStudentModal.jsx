import React, { useState } from 'react';
import api from '../../../api';

const AddStudentModal = ({ isOpen, onClose }) => {
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!nim || !name) {
      return alert('Harap isi NIM dan Nama Mahasiswa!');
    }

    setIsProcessing(true);
    try {
      // Asumsi email otomatis di-generate atau ditangani backend
      await api.post('/api/admin/users', {
        nim: nim.toUpperCase(),
        name: name,
        email: `${nim.toLowerCase()}@apps.ipb.ac.id` // Standar email IPB
      });

      alert(`Mahasiswa ${name} berhasil ditambahkan!`);
      // Reset form
      setNim('');
      setName('');
      onClose();
      window.location.reload(); // Biar daftar mahasiswa/stats terupdate
    } catch (error) {
      console.error("Gagal menambah mahasiswa:", error);
      alert(error.response?.data?.error || "Gagal menyimpan data mahasiswa.");
    } finally {
      setIsProcessing(false);
    }
  };

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
            <input 
              type="text" 
              placeholder="Contoh: G6401231001" 
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              disabled={isProcessing}
              className="w-full p-2 border border-gray-200 rounded outline-none focus:border-emerald-500 font-mono text-sm uppercase disabled:bg-slate-50" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Lengkap</label>
            <input 
              type="text" 
              placeholder="Masukkan nama lengkap..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessing}
              className="w-full p-2 border border-gray-200 rounded outline-none focus:border-emerald-500 text-sm disabled:bg-slate-50" 
            />
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
            onClick={handleSave} 
            disabled={isProcessing}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded shadow-sm hover:bg-emerald-700 transition-colors disabled:bg-emerald-400"
          >
            {isProcessing ? 'MENYIMPAN...' : 'SIMPAN DATA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;