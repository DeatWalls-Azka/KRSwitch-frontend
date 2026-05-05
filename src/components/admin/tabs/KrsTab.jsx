import React from 'react';

const KrsTab = ({ student, onOpenAddCourse }) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Daftar Mata Kuliah</label>
        <button onClick={onOpenAddCourse} className="text-[10px] font-bold text-emerald-600 hover:underline">
          + Tambah Matkul
        </button>
      </div>

      {student.courses.map(course => (
        <div key={course.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded">
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-700">{course.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-500">Kelas:</span>
              <select className="p-1 text-xs border border-gray-300 rounded outline-none font-bold text-emerald-700 bg-white">
                <option value={course.currentClass}>{course.currentClass}</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
            </div>
          </div>
          <button onClick={() => alert(`Yakin DROP matkul ${course.name}?`)} className="px-2 py-1 bg-white border border-rose-200 text-rose-500 text-[10px] font-bold rounded hover:bg-rose-50">
            DROP
          </button>
        </div>
      ))}
      <button className="w-full mt-2 py-2 bg-emerald-500 text-white text-xs font-black rounded hover:bg-emerald-600 transition-all shadow-sm">
        SIMPAN PERUBAHAN KRS
      </button>
    </div>
  );
};

export default KrsTab;