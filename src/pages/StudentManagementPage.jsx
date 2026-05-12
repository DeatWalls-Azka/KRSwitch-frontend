import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
  const [students, setStudents] = useState([]); // Data asli dari DB
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('KRS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false); 
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false); 

  // 1. Fungsi Fetch Mahasiswa dari Backend
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Kita panggil API pencarian (jika searchQuery kosong, backend harusnya return semua)
      const res = await api.get(`/api/admin/users?search=${searchQuery}`);
      setStudents(res.data);
    } catch (err) {
      console.error('Gagal mengambil data mahasiswa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Trigger fetch saat halaman dibuka atau saat user mengetik di search bar
  useEffect(() => {
    // Pakai debounce sederhana biar nggak nembak API setiap huruf diketik
    const timeoutId = setTimeout(() => {
      fetchStudents();
    }, 500); 
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-mono text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div>
          <button onClick={() => navigate('/admin')} className="text-[10px] font-black text-emerald-600 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg mb-2 flex items-center gap-1 transition-all border border-emerald-100" >
            ← KEMBALI KE ADMIN PANEL
          </button>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">Database Mahasiswa</h1>
        </div>

        {/* TOOLBAR ATAS */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-500 gap-4">
          
          {/* SEARCH BAR */}
          <div className="w-full md:w-1/2">
            <input 
              type="text" 
              placeholder="Cari NIM atau Nama Mahasiswa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono" 
            />
          </div>

          {/* AREA TOMBOL */}
          <div className="w-full md:w-1/2 flex flex-col md:flex-row justify-end gap-3">
            <button 
              onClick={() => setIsAddModalOpen(true)} 
              className="px-6 py-2.5 border-2 border-emerald-600 text-emerald-600 bg-white text-xs font-black rounded-lg hover:bg-emerald-50 transition-colors w-full md:w-auto shadow-sm"
            >
              + TAMBAH MAHASISWA BARU
            </button>
            <ExportRecapCard />
          </div>
        </div>

        {/* TABEL MAHASISWA */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-500 overflow-hidden">
          <table className="w-full text-left table-fixed">
            <thead className="bg-emerald-50 border-b border-emerald-200 text-xs font-black text-emerald-700 uppercase tracking-widest">
              <tr>
                <th className="p-4 w-1/2 border-r border-emerald-200">Nama Lengkap</th>
                <th className="p-4 w-1/2">NIM</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr><td colSpan="2" className="p-10 text-center text-slate-400 animate-pulse font-bold">Sedang sinkronisasi data...</td></tr>
              ) : students.length > 0 ? (
                students.map(mhs => (
                  <tr 
                    key={mhs.nim} 
                    onClick={() => setSelectedStudent(mhs)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedStudent?.nim === mhs.nim ? 'bg-emerald-100/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-4 text-slate-600 font-medium border-r border-emerald-100 uppercase">{mhs.name || mhs.nama}</td>
                    <td className="p-4 text-slate-600 font-bold font-mono">{mhs.nim}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2" className="p-10 text-center text-slate-400 italic font-bold">Mahasiswa tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PANEL MANAGE DATA (Akan muncul jika ada mahasiswa yang diklik) */}
        {selectedStudent && (
          <div className="bg-white rounded-xl shadow-xl border-2 border-emerald-500 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 bg-emerald-50 border-b border-emerald-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-emerald-900 uppercase tracking-tight">{selectedStudent.name || selectedStudent.nama}</h2>
                <p className="font-mono text-sm font-bold text-emerald-900 mt-1">{selectedStudent.nim}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="w-10 h-10 flex items-center justify-center border-2 border-emerald-600 text-emerald-600 bg-white font-black rounded-full hover:bg-rose-50 hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="flex border-b border-gray-100 bg-white text-[10px] font-black uppercase tracking-widest overflow-x-auto">
              {['KRS', 'Barter', 'Override', 'Akun'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setActiveTab(t)} 
                  className={`flex-1 py-4 px-4 min-w-[100px] transition-colors ${activeTab === t ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {t === 'Override' ? '⚡ OVERRIDE PAKSA' : t}
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* Mapping props agar sesuai dengan data dari backend */}
              {activeTab === 'KRS' && <KrsTab student={{...selectedStudent, courses: selectedStudent.enrollments || []}} onOpenAddCourse={() => setIsAddCourseModalOpen(true)} />}
              {activeTab === 'Barter' && <BarterTab student={{...selectedStudent, activeOffers: selectedStudent.barterOffers || []}} />}
              {activeTab === 'Override' && <OverrideTab student={{...selectedStudent, courses: selectedStudent.enrollments || []}} />}
              {activeTab === 'Akun' && <AkunTab student={selectedStudent} onOpenEditProfile={() => setIsEditProfileModalOpen(true)} />}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddStudentModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); fetchStudents(); }} />
      <AddCourseModal isOpen={isAddCourseModalOpen} onClose={() => { setIsAddCourseModalOpen(false); fetchStudents(); }} studentName={selectedStudent?.name || selectedStudent?.nama} studentNim={selectedStudent?.nim} />
      <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => { setIsEditProfileModalOpen(false); setSelectedStudent(null); fetchStudents(); }} studentData={selectedStudent} />
    </div>
  );
}