import React, { useState } from 'react';

// IMPORT MODALS
import AddStudentModal from './modals/AddStudentModal';
import AddCourseModal from './modals/AddCourseModal';
import EditProfileModal from './modals/EditProfileModal';

// IMPORT TABS
import KrsTab from './tabs/KrsTab';
import BarterTab from './tabs/BarterTab';
import AkunTab from './tabs/AkunTab';

const StudentManagementCard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('krs'); 
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false); 
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false); 

  const dummyResult = { 
    nim: 'M0403241029', 
    nama: 'Azka Julian', 
    courses: [
      { id: 1, name: 'Struktur Data (KOM211)', currentClass: 'P1' },
      { id: 2, name: 'Basis Data (KOM202)', currentClass: 'P3' },
    ],
    activeOffers: [
      { id: 101, course: 'Struktur Data (KOM211)', from: 'P1', target: 'P2' }
    ]
  };

  const handleSearch = () => {
    if (searchTerm === 'M0403241029') {
      setEditingStudent(dummyResult);
      setActiveTab('krs'); 
    } else {
      alert("Mahasiswa tidak ditemukan (Coba ketik NIM Azka)");
      setEditingStudent(null);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Manajemen Data Mahasiswa</h3>
          <button onClick={() => setIsAddModalOpen(true)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded border border-emerald-200 hover:bg-emerald-100 transition-colors">
            + TAMBAH MHS
          </button>
        </div>
        
        <div className="flex gap-2 mb-6">
          <input type="text" placeholder="Cari NIM Mahasiswa..." className="flex-1 p-2 text-sm border border-gray-200 rounded outline-none focus:ring-1 focus:ring-emerald-400 font-mono" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={handleSearch} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-700 transition-all">CARI</button>
        </div>

        {editingStudent && (
          <div className="bg-white rounded-lg border-2 border-emerald-400 shadow-sm animate-in fade-in duration-300 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-mono font-bold text-slate-700 text-sm">{editingStudent.nim}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">{editingStudent.nama}</p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">TERVERIFIKASI</span>
            </div>

            <div className="flex border-b border-gray-100 bg-white">
              <button className={`flex-1 py-2 text-xs font-bold transition-colors ${activeTab === 'krs' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`} onClick={() => setActiveTab('krs')}>KRS & KELAS</button>
              <button className={`flex-1 py-2 text-xs font-bold transition-colors ${activeTab === 'barter' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`} onClick={() => setActiveTab('barter')}>BARTER ({editingStudent.activeOffers.length})</button>
              <button className={`flex-1 py-2 text-xs font-bold transition-colors ${activeTab === 'akun' ? 'border-b-2 border-rose-500 text-rose-600' : 'text-slate-400 hover:bg-slate-50'}`} onClick={() => setActiveTab('akun')}>AKUN</button>
            </div>

            {/* RENDER KONTEN TAB YANG SUDAH DIPISAH */}
            {activeTab === 'krs' && <KrsTab student={editingStudent} onOpenAddCourse={() => setIsAddCourseModalOpen(true)} />}
            {activeTab === 'barter' && <BarterTab student={editingStudent} />}
            {activeTab === 'akun' && <AkunTab student={editingStudent} onOpenEditProfile={() => setIsEditProfileModalOpen(true)} />}
          </div>
        )}
      </div>

      <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <AddCourseModal isOpen={isAddCourseModalOpen} onClose={() => setIsAddCourseModalOpen(false)} studentName={editingStudent?.nama} />
      <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} studentData={editingStudent} />
    </>
  );
};

export default StudentManagementCard;