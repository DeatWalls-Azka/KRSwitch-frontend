import React, { useState } from 'react';

const OverrideTab = ({ student }) => {
  // State untuk nyimpen inputan form
  const [targetNim, setTargetNim] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleOverride = () => {
    // Validasi kecil biar Admin nggak asal klik
    if (!targetNim || !selectedCourse) {
      alert('Harap isi NIM target dan pilih mata kuliah!');
      return;
    }
    
    // Nanti di sini tinggal ganti pakai fungsi API.post() dari Gilang
    alert(`⚡ ADMIN OVERRIDE:\nMenukar paksa jadwal ${student.nim} dengan ${targetNim}\nMatkul: ${selectedCourse}`);
    
    // Reset form setelah sukses
    setTargetNim('');
    setSelectedCourse('');
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="p-5 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="text-sm font-black text-orange-700 mb-2">MANUAL OVERRIDE (JALUR CEPAT)</h4>
        <p className="text-xs text-orange-600 mb-4 leading-relaxed">
          Tukar paksa jadwal <strong>{student.nama} ({student.nim})</strong> dengan mahasiswa lain tanpa persetujuan barter.
        </p>
        
        <div className="space-y-4">
          {/* Input NIM Lawan */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">NIM Target (Lawan Tukar)</label>
            <input 
              type="text" 
              value={targetNim}
              onChange={(e) => setTargetNim(e.target.value.toUpperCase())}
              placeholder="Masukkan NIM Mahasiswa ke-2..." 
              className="w-full p-2 text-sm border border-orange-300 rounded outline-none focus:border-orange-500 font-mono" 
            />
          </div>

          {/* Dropdown Matkul  */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Mata Kuliah yang Ditukar</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 text-sm border border-orange-300 rounded outline-none focus:border-orange-500 bg-white"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {student?.courses?.map(course => (
                <option key={course.id} value={course.name}>
                  {course.name} - Kelas Saat Ini: {course.currentClass}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleOverride}
            className="w-full py-3 bg-orange-600 text-white text-xs font-black rounded hover:bg-orange-700 shadow-sm transition-all"
          >
            ⚡ EKSEKUSI PERTUKARAN PAKSA
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverrideTab;