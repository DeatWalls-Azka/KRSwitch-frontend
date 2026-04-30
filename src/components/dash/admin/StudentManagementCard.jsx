import React, { useState } from 'react';

const StudentManagementCard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);

  // Data dummy untuk simulasi hasil pencarian
  const dummyResult = { nim: 'M0403241029', nama: 'Azka Julian', kelas: 'P1' };

  const handleSearch = () => {
    // Simulasi: kalau ngetik NIM Azka, muncul datanya
    if (searchTerm === 'M0403241029') {
      setEditingStudent(dummyResult);
    } else {
      alert("Mahasiswa tidak ditemukan (Coba ketik NIM Azka)");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Manajemen Data Mahasiswa</h3>
      
      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Cari NIM Mahasiswa..." 
          className="flex-1 p-2 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          onClick={handleSearch}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-700"
        >
          CARI
        </button>
      </div>

      {/* Form Edit (Hanya muncul kalau data ketemu) */}
      {editingStudent && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">NIM</label>
              <p className="font-mono font-bold text-slate-700">{editingStudent.nim}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Nama</label>
              <p className="text-sm text-slate-700">{editingStudent.nama}</p>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Kelas Saat Ini</label>
              <select 
                className="w-full mt-1 p-2 text-sm border border-gray-200 rounded outline-none"
                value={editingStudent.kelas}
                onChange={(e) => setEditingStudent({...editingStudent, kelas: e.target.value})}
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
            </div>
          </div>
          <button 
            className="w-full mt-4 py-2 bg-blue-600 text-white text-xs font-black rounded hover:bg-blue-700 transition-all"
            onClick={() => alert(`Data ${editingStudent.nim} berhasil diupdate ke kelas ${editingStudent.kelas}`)}
          >
            SIMPAN PERUBAHAN
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentManagementCard;
