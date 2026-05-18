import React, { useState, useEffect, useMemo, useRef } from 'react';
import api, { getSocketToken } from '../api';
import { io } from 'socket.io-client';

// IMPORT TAB
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
  GraduationCap
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

// --- Konstanta ------------------------------------------------

const DETAIL_TABS = ['KRS', 'Barter', 'Override', 'Akun'];

// --- Types ----------------------------------------------------

interface StudentSummary {
  nim: string;
  name: string;
  email: string;
  activeBarterCount: number;
}

interface StudentDetail extends StudentSummary {
  enrollments: any[];
  offeredBarters: any[];
}

// --- Komponen Utama -------------------------------------------

export default function StudentManagementPage() {
  const [pageSize, setPageSize] = useState(15);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
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

  const refreshSelectedStudent = async () => {
    if (!selectedStudent) return;
    try {
      const res = await api.get(`/api/admin/users/${selectedStudent.nim}`);
      setSelectedStudent(res.data);
    } catch (err) {
      console.error('Gagal refresh detail mahasiswa:', err);
    }
  };

  useEffect(() => {
    fetchStudents();

    const socket = io((import.meta as any).env.VITE_API_URL || 'http://localhost:5000');
    getSocketToken().then(res => socket.emit('authenticate', res.data.token)).catch(console.error);

    socket.on('admin-user-created', fetchStudents);
    socket.on('admin-user-updated', fetchStudents);
    socket.on('admin-user-deleted', (payload: { nim: string }) => {
      fetchStudents();
      if (selectedStudent?.nim === payload.nim) {
        setIsDrawerOpen(false);
        setSelectedStudent(null);
      }
    });

    socket.on('admin-enrollment-updated', (updated: { nim: string }) => {
      if (selectedStudent?.nim === updated.nim) refreshSelectedStudent();
    });

    socket.on('admin-enrollment-deleted', (payload: { nim: string }) => {
      if (selectedStudent?.nim === payload.nim) refreshSelectedStudent();
    });

    socket.on('admin-enrollment-created', (payload: { nim: string }) => {
      if (selectedStudent?.nim === payload.nim) refreshSelectedStudent();
    });

    socket.on('enrollments-swapped', (payload: { swaps: Array<{ nim: string }> }) => {
      const isTarget = payload.swaps.some(s => s.nim === selectedStudent?.nim);
      if (isTarget) refreshSelectedStudent();
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedStudent?.nim]);

  useEffect(() => {
    const updatePageSize = () => {
      if (!tableContainerRef.current) return;
      const rect = tableContainerRef.current.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top - 120;
      const calculatedRows = Math.floor(availableHeight / 43);
      setPageSize(Math.max(5, calculatedRows));
    };

    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    return () => window.removeEventListener('resize', updatePageSize);
  }, []);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectStudent = async (student: StudentSummary) => {
    setIsDrawerOpen(true);
    setIsDetailLoading(true);
    setActiveTab('KRS');
    try {
      const res = await api.get(`/api/admin/users/${student.nim}`);
      setSelectedStudent(res.data);
    } catch (err) {
      console.error('Gagal mengambil detail mahasiswa:', err);
      // Fallback
      setSelectedStudent({
        ...student,
        enrollments: [],
        offeredBarters: []
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const goToPage = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  return (
    <div className="space-y-6 pb-8">
      {/* Bagian Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-6 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Database Mahasiswa</h1>
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold rounded-sm border border-emerald-500/20 uppercase tracking-tight">Master Directory</span>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Management of profiles, KRS enrollments, and barter history</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="admin"
            size="sm"
            className="h-9 px-4 text-[11px] font-bold"
          >
            <UserPlus size={14} className="mr-0" />
            ADD MAHASISWA
          </Button>
          <ExportRecapCard />
        </div>
      </div>

      {/* Toolbar: Pencarian + Statistik Terintegrasi */}
      <Card className="border-border/50 shadow-sm rounded-md overflow-hidden flex flex-col bg-background">
        <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/5 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
            <GraduationCap size={14} />
            Student Management / Master Directory
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              {filteredStudents.length} Students Detected
            </span>
          </div>
        </CardHeader>

        {/* Toolbar: Pencarian - Mirroring Tabel Audit */}
        <div className="p-3 border-b border-border/40 bg-background">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <input
              type="text"
              placeholder="SEARCH BY NIM OR NAME..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 h-8 bg-muted/20 border border-border/50 rounded-md outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-[10px] font-bold tracking-tight"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto" ref={tableContainerRef}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/5 border-b">
                <th className="w-12 py-2 text-center text-[10px] font-bold uppercase text-muted-foreground">#</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Student Identity</th>
                <th className="hidden md:table-cell px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Student ID (NIM)</th>
                <th className="hidden lg:table-cell px-4 py-2 text-center text-[10px] font-bold uppercase text-muted-foreground">Barter Status</th>
                <th className="px-4 py-2 text-right text-[10px] font-bold uppercase text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin h-5 w-5 text-primary/50" />
                      <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Syncing records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, index) => (
                  <tr
                    key={student.nim}
                    className={`group cursor-pointer transition-colors hover:bg-muted/5 ${selectedStudent?.nim === student.nim ? 'bg-primary/5' : ''}`}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <td className="py-2 text-center">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/60">
                        {(currentPage - 1) * pageSize + index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-muted/30 flex items-center justify-center text-[8px] font-bold text-muted-foreground border border-border/60">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`text-[11px] font-bold tracking-tight transition-colors ${selectedStudent?.nim === student.nim ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-2">
                      <span className="text-[11px] font-mono font-bold text-muted-foreground">{student.nim}</span>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-2 text-center">
                      {student.activeBarterCount > 0 ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-emerald-500/5 text-emerald-600 border border-emerald-500/20 uppercase tracking-tighter">
                          {student.activeBarterCount} Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-muted/30 text-muted-foreground/60 border border-border/50 uppercase tracking-tighter">
                          Idle
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 hover:text-primary transition-all">
                        <ChevronRight size={12} className="text-muted-foreground group-hover:text-primary" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={24} strokeWidth={1} className="opacity-20 text-primary" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No matching records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Halaman (Pagination) - Mirroring Tabel Audit */}
        {!isLoading && totalPages > 1 && (
          <div className="px-4 py-2 border-t bg-muted/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Page {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => { e.stopPropagation(); goToPage(currentPage - 1); }}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={10} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => { e.stopPropagation(); goToPage(currentPage + 1); }}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={10} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Detail Mahasiswa */}
      <AdminModal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedStudent?.name || 'Detail Mahasiswa'}
        subtitle={selectedStudent?.nim || '-'}
      >
        <div className="flex flex-col relative h-full">
          {/* Tab Bergaya Shadcn */}
          <div className="sticky top-[-1.5rem] z-20 bg-background/80 backdrop-blur-md -mx-6 -mt-6 px-6 pt-6 pb-4 border-b border-border mb-6">
            <div className="admin-tabs-list w-full">
              {DETAIL_TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  data-state={activeTab === t ? 'active' : 'inactive'}
                  className="admin-tabs-trigger flex-1 uppercase tracking-widest text-xs font-black bg-transparent border-0 cursor-pointer text-muted-foreground"
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
            ) : selectedStudent ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'KRS' && (
                  <KrsTab
                    student={{ ...selectedStudent, courses: selectedStudent.enrollments || [] }}
                    onRefresh={refreshSelectedStudent}
                  />
                )}
                {activeTab === 'Barter' && (
                  <BarterTab
                    student={{ ...selectedStudent, activeOffers: selectedStudent.offeredBarters || [] }}
                    onRefresh={refreshSelectedStudent}
                  />
                )}
                {activeTab === 'Override' && (
                  <OverrideTab
                    student={{ ...selectedStudent, courses: selectedStudent.enrollments || [] }}
                  />
                )}
                {activeTab === 'Akun' && (
                  <AkunTab
                    student={selectedStudent}
                    onRefresh={refreshSelectedStudent}
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </AdminModal>

      {/* Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); fetchStudents(); }}
      />
    </div>
  );
}
