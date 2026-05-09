import React, { useState } from 'react';

const OverrideTab = ({ student }) => {
  const [targetNim, setTargetNim] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleOverride = () => {
    if (!targetNim || !selectedCourse) {
      alert('Harap isi NIM target dan pilih mata kuliah!');
      return;
    }
    
    alert(`⚡ EKSEKUSI SISTEM:\nMenukar paksa jadwal ${student.nim} dengan ${targetNim}\nMatkul: ${selectedCourse}`);
    
    setTargetNim('');
    setSelectedCourse('');
  };

  return (
    <div className="p-2 animate-in fade-in duration-500">
      {/* Container utama pake latar abu-abu sangat muda agar 'nyambung' dengan putih */}
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
              placeholder="Contoh: M0403241001" 
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono bg-white transition-all shadow-sm" 
            />
          </div>

          {/* Dropdown Matkul */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Mata Kuliah Yang Dipindahkan</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2.5 text-sm border text-slate-400 border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white transition-all shadow-sm cursor-pointer"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {student?.courses?.map(course => (
                <option key={course.id} value={course.name}>
                  {course.name} (Kelas {course.currentClass})
                </option>
              ))}
            </select>
          </div>
          
          {/* Tombol Eksekusi - Pake warna Slate/Hitam biar kontras tapi elegan */}
          <button 
            onClick={handleOverride}
            className="w-full py-3 bg-emerald-500 text-white text-[10px] font-black rounded-lg hover:bg-emerald-600 transition-all shadow-md active:scale-[0.98] tracking-widest"
          >
            EKSEKUSI PAKSA
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverrideTab;