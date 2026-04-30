import React, { useState } from 'react';

const StudentManagementCard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Data dummy list mata kuliah
  const dummyResult = { 
    nim: 'M0403241029', 
    nama: 'Azka Julian', 
    courses: [
      { id: 1, name: 'Struktur Data (KOM211)', currentClass: 'P1' },
      { id: 2, name: 'Basis Data (KOM202)', currentClass: 'P3' },
      { id: 3, name: 'Arsitektur Komputer (KOM201)', currentClass: 'P2' }
    ]
  };

  const handleSearch = () => {
    if (searchTerm === 'M0403241029') {
      setEditingStudent(dummyResult);
      setSelectedCourse(dummyResult.courses[0]);
    } else {
      alert("Mahasiswa tidak ditemukan (Coba ketik NIM Azka)");
      setEditingStudent(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Manajemen Data Mahasiswa</h3>
      
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Cari NIM Mahasiswa..." 
          className="flex-1 p-2 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-green-500 font-mono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          onClick={handleSearch}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-700 transition-colors"
        >
          CARI
        </button>
      </div>

      {editingStudent && selectedCourse && (
        // Latar belakang sekarang putih dengan border hijau
        <div className="p-4 bg-white rounded-lg border-2 border-emerald-200 shadow-sm animate-in fade-in duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">NIM</label>
              <p className="font-mono font-bold text-slate-700">{editingStudent.nim}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Mahasiswa</label>
              <p className="text-sm font-bold text-slate-700">{editingStudent.nama}</p>
            </div>

            <div className="col-span-2 border-t border-gray-100 pt-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Mata Kuliah</label>
              <select 
                className="w-full mt-1 p-2 text-sm border border-gray-200 rounded outline-none focus:border-emerald-500 bg-gray-50 cursor-pointer"
                value={selectedCourse.id}
                onChange={(e) => {
                  const course = editingStudent.courses.find(c => c.id === parseInt(e.target.value));
                  setSelectedCourse(course);
                }}
              >
                {editingStudent.courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold text-emerald-600 uppercase">
                Update Kelas Baru (Saat ini: {selectedCourse.currentClass})
              </label>
              <select 
                className="w-full mt-1 p-2 text-sm border border-gray-200 rounded outline-none focus:border-emerald-500 bg-gray-50 cursor-pointer "
                value={selectedCourse.currentClass}
                onChange={(e) => setSelectedCourse({...selectedCourse, currentClass: e.target.value})}
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
            </div>
          </div>
          
          {/* Tombol Simpan sekarang berwarna hijau */}
          <button 
            className="w-full mt-6 py-2.5 bg-emerald-400 text-white text-xs font-black rounded-md hover:bg-emerald-600 transition-all shadow-md active:scale-[0.98]"
            onClick={() => alert(`BERHASIL: Data ${editingStudent.nama} telah diperbarui.`)}
          >
            SIMPAN PERUBAHAN
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentManagementCard;