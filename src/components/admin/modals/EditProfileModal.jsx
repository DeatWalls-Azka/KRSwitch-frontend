import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../api';  // Pastikan path import api.js sudah benar

const EditProfileModal = ({ isOpen, onClose, studentData }) => {
  // State untuk menampung inputan form
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Update state form ketika modal dibuka / menerima data studentData baru
  useEffect(() => {
    if (studentData) {
      setNim(studentData.nim || '');
      setNama(studentData.nama || '');
    }
  }, [studentData]);

  if (!isOpen) return null;

  const handleUpdateProfile = async () => {
    if (!nim || !nama) {
      return alert('NIM dan Nama tidak boleh kosong!');
    }

    setIsProcessing(true);
    try {
      // Tembak API PUT untuk update data user berdasarkan NIM lamanya
      await api.put(`/api/admin/users/${studentData.nim}`, {
        newNim: nim.toUpperCase(), // Pastikan NIM selalu kapital
        newName: nama
      });

      alert('Profil mahasiswa berhasil diperbarui!');
      onClose();
      window.location.reload(); // Refresh halaman agar tabel dan UI ikut ter-update
    } catch (error) {
      console.error("Gagal update profil:", error);
      alert(error.response?.data?.error || "Gagal memperbarui profil. Pastikan NIM baru belum dipakai mahasiswa lain.");
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-rose-500">
        
        {/* Header Modal - Warna Merah/Rose (Danger Zone) */}
        <div className="bg-rose-600 p-4">
          <h3 className="text-white font-bold">Edit Profil Mahasiswa</h3>
          <p className="text-rose-100 text-xs mt-1">
            Hati-hati! Mengubah NIM/Nama akan berdampak pada riwayat barter.
          </p>
        </div>
        
        {/* Body / Form */}
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">NIM Mahasiswa</label>
            <input 
              type="text" 
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              disabled={isProcessing}
              className="w-full p-2 border border-gray-200 rounded outline-none focus:border-rose-500 font-mono text-sm uppercase disabled:opacity-50 disabled:bg-gray-50" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Lengkap</label>
            <input 
              type="text" 
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              disabled={isProcessing}
              className="w-full p-2 border border-gray-200 rounded outline-none focus:border-rose-500 text-sm disabled:opacity-50 disabled:bg-gray-50" 
            />
          </div>
        </div>
        
        {/* Footer / Buttons */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            BATAL
          </button>
          <button 
            onClick={handleUpdateProfile} 
            disabled={isProcessing || (nim === studentData.nim && nama === studentData.nama)}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded shadow-sm hover:bg-rose-700 transition-colors disabled:bg-rose-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'MENYIMPAN...' : 'UPDATE PROFIL'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default EditProfileModal;