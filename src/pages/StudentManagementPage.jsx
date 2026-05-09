import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// IMPORT TABS
import KrsTab from '../components/admin/tabs/KrsTab';
import BarterTab from '../components/admin/tabs/BarterTab';
import AkunTab from '../components/admin/tabs/AkunTab';
import OverrideTab from '../components/admin/tabs/OverrideTab';

// IMPORT MODALS
import AddStudentModal from '../components/admin/modals/AddStudentModal';
import AddCourseModal from '../components/admin/modals/AddCourseModal';
import EditProfileModal from '../components/admin/modals/EditProfileModal';

// IMPORT KOMPONEN EXPORT ASLI
import ExportRecapCard from '../components/admin/ExportRecapCard';

export default function StudentManagementPage() {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('krs');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false); 
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false); 

  // Dummy Data
  const dummyStudents = [
    { nim: 'M0403241029', nama: 'Azka Julian', courses: [{ id: 1, name: 'Struktur Data (KOM211)', currentClass: 'P1' }], activeOffers: [{ id: 101, course: 'Struktur Data', from: 'P1', target: 'P2' }] },
    { nim: 'M0002222222', nama: 'Gilang Muhamad', courses: [], activeOffers: [] },
    { nim: 'M6401211001', nama: 'Ahmad Fauzi', courses: [], activeOffers: [] },
    { nim: 'M6401211002', nama: 'Budi Santoso', courses: [], activeOffers: [] },
    { nim: 'M6401211003', nama: 'Citra Dewi', courses: [], activeOffers: [] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-mono text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div>
             <button  onClick={() => navigate('/admin')} className="text-[10px] font-black text-emerald-600 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg mb-2 flex items-center gap-1 transition-all" >
            ← KEMBALI KE ADMIN PANEL
          </button>
          <h1 className="text-3xl font-black tracking-tight uppercase">Database Mahasiswa</h1>
        </div>

        {/* TOOLBAR ATAS */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-500 gap-4">
          
          {/* SEARCH BAR  */}
          <div className="w-full md:w-1/2">
            <input 
              type="text" 
              placeholder="Cari NIM atau Nama Mahasiswa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
            />
          </div>

          {/* AREA TOMBOL  */}
          <div className="w-full md:w-1/2 flex flex-col md:flex-row justify-end gap-3">
            <button 
              onClick={() => setIsAddModalOpen(true)} 
              className="px-6 py-2.5 border-2 border-emerald-600 text-emerald-600 bg-white text-xs font-black rounded-lg hover:bg-emerald-50 transition-colors w-full md:w-auto"
            >
              + TAMBAH MAHASISWA BARU
            </button>

            {/* KOMPONEN EXPORT  */}
            <ExportRecapCard />
          </div>
        </div>

        {/* TABEL MAHASISWA  */}
    <div className="bg-white rounded-xl shadow-sm border border-emerald-500 overflow-hidden">
  <    table className="w-full text-left table-fixed">
         <thead className="bg-emerald-50 border-b border-emerald-200 text-xs font-black text-emerald-700 uppercase tracking-widest">
            <tr>
              {/* Nama Lengkap sekarang di kiri */}
             <th className="p-4 w-1/2 border-r border-emerald-200">Nama Lengkap</th>
              {/* NIM sekarang di kanan */}
              <th className="p-4 w-1/2">NIM</th>
           </tr>
        </thead>
        <tbody className="text-sm">
          {dummyStudents.map(mhs => (
         <tr 
          key={mhs.nim} 
          onClick={() => setSelectedStudent(mhs)}
          className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedStudent?.nim === mhs.nim ? 'bg-emerald-100/50' : 'hover:bg-slate-50'}`}
        >
          {/* Data Nama Lengkap */}
          <td className="p-4 text-slate-600 font-medium border-r border-emerald-100">
            {mhs.nama}
          </td>
            {/* Data NIM */}
          <td className="p-4 text-slate-600 font-medium border-r border-emerald-100">
            {mhs.nim}
                 </td>
             </tr>
             ))}
          </tbody>
        </table>
      </div>

        {/* PANEL MANAGE DATA  */}
        {selectedStudent && (
          <div className="bg-white rounded-xl shadow-xl border-2 border-emerald-500 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 bg-emerald-50 border-b border-emerald-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-emerald-900 uppercase tracking-tight">{selectedStudent.nama}</h2>
                <p className="font-mono text-sm font-bold text-emerald-900 mt-1">{selectedStudent.nim}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="px-6 py-2.5 border-2 border-emerald-600 text-emerald-600 bg-white text-lg font-black rounded-lg hover:bg-emerald-50 transition-colors w-full md:w-auto"> X</button>
            </div>
            
            <div className="flex border-b border-gray-100 bg-white text-xs font-black uppercase tracking-widest">
              {['KRS', 'Barter', 'Override', 'Akun'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setActiveTab(t)} 
                  className={`flex-1 py-4 transition-colors ${activeTab === t ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {t === 'override' ? 'OVERRIDE PAKSA' : t}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'KRS' && <KrsTab student={selectedStudent} onOpenAddCourse={() => setIsAddCourseModalOpen(true)} />}
              {activeTab === 'Barter' && <BarterTab student={selectedStudent} />}
              {activeTab === 'Override' && <OverrideTab student={selectedStudent} />}
              {activeTab === 'Akun' && <AkunTab student={selectedStudent} onOpenEditProfile={() => setIsEditProfileModalOpen(true)} />}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <AddCourseModal isOpen={isAddCourseModalOpen} onClose={() => setIsAddCourseModalOpen(false)} studentName={selectedStudent?.nama} />
      <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} studentData={selectedStudent} />
    </div>
  );
}