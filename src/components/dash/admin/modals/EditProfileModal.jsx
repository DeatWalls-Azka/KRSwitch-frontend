// src/components/dash/admin/modals/EditProfileModal.jsx
import React from 'react';

const EditProfileModal = ({ isOpen, onClose, studentData }) => {
  if (!isOpen) return null;

  return (
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
              defaultValue={studentData?.nim} 
              className="w-full p-2 border border-gray-200 rounded outline-none focus:border-rose-500 font-mono text-sm uppercase" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Lengkap</label>
            <input 
              type="text" 
              defaultValue={studentData?.nama} 
              className="w-full p-2 border border-gray-200 rounded outline-none focus:border-rose-500 text-sm" 
            />
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
            onClick={() => { alert('Profil diperbarui!'); onClose(); }} 
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded shadow-sm hover:bg-rose-700 transition-colors"
          >
            UPDATE PROFIL
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;