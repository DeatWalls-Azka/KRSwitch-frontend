import React from 'react';

const AkunTab = ({ student, onOpenEditProfile }) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
        <h4 className="text-xs font-black text-rose-700 mb-2">DANGER ZONE MAHASISWA</h4>
        <p className="text-[10px] text-rose-600 mb-4 leading-relaxed">
          Aksi di bawah ini akan mengubah data inti mahasiswa. Hati-hati dalam melakukan perubahan.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onOpenEditProfile} className="w-full py-2 bg-white border border-rose-300 text-rose-600 text-xs font-bold rounded hover:bg-rose-100">
            EDIT PROFIL (NIM/NAMA)
          </button>
          <button onClick={() => alert(`PERINGATAN: Hapus total data ${student.nama} dari sistem?`)} className="w-full py-2 bg-rose-600 text-white text-xs font-black rounded hover:bg-rose-700 shadow-sm">
            HAPUS MAHASISWA DARI SISTEM
          </button>
        </div>
      </div>
    </div>
  );
};

export default AkunTab;