import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import io from 'socket.io-client';

// IMPORT TABS
import KrsTab from '../components/admin/tabs/KrsTab';
import BarterTab from '../components/admin/tabs/BarterTab';
import AkunTab from '../components/admin/tabs/AkunTab';
import OverrideTab from '../components/admin/tabs/OverrideTab';

import AddStudentModal from '../components/admin/modals/AddStudentModal';
import ExportRecapCard from '../components/admin/ExportRecapCard';
import AdminModal from '../components/admin/AdminModal';

import { 
  UserPlus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Loader2,
  Users as UsersIcon,
  Database
} from 'lucide-react';
import { Button } from '../components/ui/button';

const PAGE_SIZE = 15;

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('KRS');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      setStudents(res.data);
    } catch (err) {
      console.error('Gagal mengambil data mahasiswa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchStudents(); 

    const socket = io('http://localhost:5000');

    socket.on('admin-user-created', fetchStudents);
    socket.on('admin-user-updated', fetchStudents);
    socket.on('admin-user-deleted', (payload) => {
      fetchStudents();
      if (selectedStudent?.nim === payload.nim) {
        setIsDrawerOpen(false);
        setSelectedStudent(null);
      }
    });

    socket.on('admin-enrollment-updated', (updated) => {
      if (selectedStudent?.nim === updated.nim) refreshSelectedStudent();
    });

    socket.on('admin-enrollment-deleted', (payload) => {
      if (selectedStudent?.nim === payload.nim) refreshSelectedStudent();
    });

    socket.on('admin-enrollment-created', (payload) => {
      if (selectedStudent?.nim === payload.nim) refreshSelectedStudent();
    });

    socket.on('enrollments-swapped', (payload) => {
      const isTarget = payload.swaps.some(s => s.nim === selectedStudent?.nim);
      if (isTarget) refreshSelectedStudent();
    });

    return () => socket.disconnect();
  }, [selectedStudent?.nim]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
    setIsDetailLoading(true);
    setActiveTab('KRS');
    try {
      const res = await api.get(`/api/admin/users/${student.nim}`);
      setSelectedStudent(res.data);
    } catch (err) {
      console.error('Gagal mengambil detail mahasiswa:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const refreshSelectedStudent = async () => {
    if (!selectedStudent) return;
    try {
      const res = await api.get(`/api/admin/users/${selectedStudent.nim}`);
      setSelectedStudent(res.data);
    } catch (err) {
      console.error('Gagal refresh detail mahasiswa:', err);
    }
  };

  const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  return (
    <div className="space-y-8 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Database size={20} strokeWidth={2.5} />
            <h1 className="text-2xl font-black tracking-tight">Database Mahasiswa</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Manajemen data profil, KRS, dan riwayat barter mahasiswa.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="admin"
            size="sm"
            className="h-10"
          >
            <UserPlus size={16} strokeWidth={3} />
            Tambah Mahasiswa
          </Button>
          <ExportRecapCard />
        </div>
      </div>

      {/* Toolbar: Search + Stats */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Cari NIM atau Nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all text-sm font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>
        <div className="bg-muted/50 border border-border rounded-md px-4 py-2 flex items-center gap-3">
          <span className="text-sm font-black text-foreground">{filtered.length} Mahasiswa</span>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Nama Mahasiswa</th>
              <th className="hidden md:table-cell">Nomor Induk (NIM)</th>
              <th className="hidden lg:table-cell text-center">Status KRS</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin h-6 w-6 text-primary" />
                    <p className="text-xs font-bold text-muted-foreground tracking-tight uppercase">Menghubungkan ke database...</p>
                  </div>
                </td>
              </tr>
            ) : paginated.length > 0 ? (
              paginated.map((student, index) => (
                <tr 
                  key={student.nim} 
                  className={`cursor-pointer transition-colors ${selectedStudent?.nim === student.nim ? 'bg-secondary/50' : ''}`}
                  onClick={() => handleSelectStudent(student)}
                >
                  <td className="text-center font-mono text-[10px] text-muted-foreground">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground border border-border/50">
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                    {student.nim}
                  </td>
                  <td className="hidden lg:table-cell text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-secondary text-secondary-foreground border border-border">
                      {student.enrollmentCount || 0} MK
                    </span>
                  </td>
                  <td className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                      <ChevronRight size={16} strokeWidth={3} className="text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-20 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={32} strokeWidth={1} className="opacity-20" />
                    <p className="text-sm font-medium">Data tidak ditemukan</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Hal {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); goToPage(currentPage - 1); }}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} strokeWidth={3} />
              </Button>
              <div className="text-xs font-black w-8 text-center">{currentPage}</div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); goToPage(currentPage + 1); }}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} strokeWidth={3} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <AdminModal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedStudent?.name || 'Detail Mahasiswa'}
        subtitle={selectedStudent?.nim || '—'}
      >
        <div className="flex flex-col relative min-h-[500px]">
          {/* Shadcn Style Tabs */}
          <div className="sticky top-[-2rem] z-20 bg-background/80 backdrop-blur-md -mx-8 -mt-8 px-8 pt-6 pb-4 border-b border-border mb-6">
            <div className="admin-tabs-list w-full">
              {['KRS', 'Barter', 'Override', 'Akun'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  data-state={activeTab === t ? 'active' : 'inactive'}
                  className="admin-tabs-trigger flex-1 uppercase tracking-widest text-xs font-black"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {isDetailLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sinkronisasi data...</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'KRS' && (
                  <KrsTab
                    student={{ ...selectedStudent, courses: selectedStudent?.enrollments || [] }}
                    onRefresh={refreshSelectedStudent}
                  />
                )}
                {activeTab === 'Barter' && (
                  <BarterTab
                    student={{ ...selectedStudent, activeOffers: selectedStudent?.offeredBarters || [] }}
                    onRefresh={refreshSelectedStudent}
                  />
                )}
                {activeTab === 'Override' && (
                  <OverrideTab
                    student={{ ...selectedStudent, courses: selectedStudent?.enrollments || [] }}
                  />
                )}
                {activeTab === 'Akun' && (
                  <AkunTab
                    student={selectedStudent}
                    onRefresh={refreshSelectedStudent}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </AdminModal>

      {/* MODALS */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); fetchStudents(); }}
      />
    </div>
  );
}