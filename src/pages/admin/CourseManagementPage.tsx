import React, { useState, useEffect, useMemo, useRef } from 'react';
import api, { getSocketToken } from '../../api';
import { io } from 'socket.io-client';
import { useTableKeyboardPagination } from '../../hooks/useTableKeyboardPagination';

import AddCourseModal from '../../components/admin/modals/AddCourseModal';
import ExportRecapCard from '../../components/admin/ExportRecapCard';

import {
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  BookOpenText,
  Save,
  Trash2,
  Edit2
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// --- Konstanta ------------------------------------------------

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

// --- Types ----------------------------------------------------

interface ParallelClassWithEnrollment {
  id: number;
  courseCode: string;
  courseName: string;
  classCode: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string;
  enrollmentCount: number;
}

interface EditClassFormData {
  courseCode: string;
  courseName: string;
  classCode: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string;
}

// --- Komponen Utama -------------------------------------------

export default function CourseManagementPage() {
  useEffect(() => {
    document.title = 'KRSwitch | Course Management';
  }, []);
  const [pageSize, setPageSize] = useState(15);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const [classes, setClasses] = useState<ParallelClassWithEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State inline editing
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EditClassFormData>({
    courseCode: '',
    courseName: '',
    classCode: '',
    day: '',
    timeStart: '',
    timeEnd: '',
    room: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/classes');
      setClasses(res.data);
    } catch (err) {
      console.error('Gagal mengambil data kelas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();

    const socket = io((import.meta as any).env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket']
    });
    
    socket.on('connect', () => {
      getSocketToken().then(res => socket.emit('authenticate', res.data.token)).catch(console.error);
    });

    socket.on('admin-schedule-updated', fetchClasses);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const updatePageSize = () => {
      if (!tableContainerRef.current) return;
      const rect = tableContainerRef.current.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top - 120;
      const calculatedRows = Math.floor(availableHeight / 48);
      setPageSize(Math.max(5, calculatedRows));
    };

    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    return () => window.removeEventListener('resize', updatePageSize);
  }, []);

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(c =>
      c.courseName.toLowerCase().includes(q) ||
      c.courseCode.toLowerCase().includes(q) ||
      c.classCode.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / pageSize));
  const paginatedClasses = filteredClasses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  useTableKeyboardPagination(currentPage, totalPages, goToPage);

  // -- Inline Edit Handlers --
  const handleEditClick = (cls: ParallelClassWithEnrollment) => {
    setEditingClassId(cls.id);
    setEditFormData({
      courseCode: cls.courseCode,
      courseName: cls.courseName,
      classCode: cls.classCode,
      day: cls.day,
      timeStart: cls.timeStart,
      timeEnd: cls.timeEnd,
      room: cls.room
    });
  };

  const handleCancelEdit = () => {
    setEditingClassId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id: number) => {
    setIsSaving(true);
    try {
      await api.put(`/api/admin/classes/${id}`, editFormData);
      setEditingClassId(null);
      fetchClasses();
    } catch (err: any) {
      console.error('Gagal menyimpan perubahan:', err);
      alert(err.response?.data?.error || 'Gagal menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, code: string, clsCode: string) => {
    if (!window.confirm(`Yakin ingin menghapus kelas ${code} - ${clsCode}? Data KRS mahasiswa terkait akan hilang.`)) return;

    setIsDeleting(id);
    try {
      await api.delete(`/api/admin/classes/${id}`);
      fetchClasses();
    } catch (err: any) {
      console.error('Gagal menghapus kelas:', err);
      alert(err.response?.data?.error || 'Gagal menghapus kelas.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Bagian Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-6 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Database Mata Kuliah</h1>
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold rounded-sm border border-emerald-500/20 uppercase tracking-tight">Master Directory</span>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Management of courses, schedules, and rooms</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="admin"
            size="sm"
            className="h-9 px-4 text-[11px] font-bold"
          >
            <Plus size={14} className="-mr-1" />
            ADD KELAS
          </Button>
          <ExportRecapCard />
        </div>
      </div>

      {/* Toolbar: Pencarian + Statistik Terintegrasi */}
      <Card className="border-border/50 shadow-sm rounded-md overflow-hidden flex flex-col bg-background">
        <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/5 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
            <BookOpenText size={14} />
            Course Management / Master Directory
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              {filteredClasses.length} Classes Detected
            </span>
          </div>
        </CardHeader>

        {/* Toolbar: Pencarian */}
        <div className="p-3 border-b border-border/40 bg-background">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <input
              type="text"
              placeholder="SEARCH BY COURSE CODE OR NAME..."
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
                <th className="w-[4%] py-2 text-center text-[10px] font-bold uppercase text-muted-foreground">#</th>
                <th className="w-[31%] px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Course Identity</th>
                <th className="w-[10%] px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Class</th>
                <th className="w-[20%] px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Schedule</th>
                <th className="w-[15%] px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Room</th>
                <th className="w-[10%] px-4 py-2 text-center text-[10px] font-bold uppercase text-muted-foreground">Enrolled</th>
                <th className="w-[10%] px-4 py-2 text-right text-[10px] font-bold uppercase text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin h-5 w-5 text-primary/50" />
                      <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Syncing records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedClasses.length > 0 ? (
                paginatedClasses.map((cls, index) => {
                  const isEditing = editingClassId === cls.id;

                  return (
                    <tr
                      key={cls.id}
                      className={`group transition-colors ${isEditing ? 'bg-primary/5' : 'hover:bg-muted/5'}`}
                    >
                      <td className="w-[4%] py-2 text-center align-middle">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground/60">
                          {(currentPage - 1) * pageSize + index + 1}
                        </span>
                      </td>

                      {isEditing ? (
                        <>
                          <td className="px-4 py-2 align-middle">
                            <div className="flex items-center gap-1">
                              <input
                                name="courseCode"
                                value={editFormData.courseCode}
                                onChange={handleFormChange}
                                className="w-16 h-6 px-1 text-[11px] font-mono font-bold border border-input rounded outline-none focus:border-primary uppercase"
                                placeholder="Code"
                              />
                              <input
                                name="courseName"
                                value={editFormData.courseName}
                                onChange={handleFormChange}
                                className="w-full h-6 px-1 text-[11px] font-bold border border-input rounded outline-none focus:border-primary"
                                placeholder="Name"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <input
                              name="classCode"
                              value={editFormData.classCode}
                              onChange={handleFormChange}
                              className="w-16 h-6 px-2 text-[11px] font-mono font-bold border border-input rounded outline-none focus:border-primary uppercase"
                              placeholder="K1"
                            />
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <div className="flex items-center gap-1">
                              <Select
                                value={editFormData.day}
                                onValueChange={(val) => handleSelectChange('day', val)}
                              >
                                <SelectTrigger className="w-16 h-6 px-1 text-[10px] font-bold border border-input rounded outline-none focus:ring-1 focus:ring-primary capitalize bg-background shadow-none [&>span]:truncate [&>svg]:hidden">
                                  <SelectValue placeholder="Hari" />
                                </SelectTrigger>
                                <SelectContent className="z-[100]">
                                  {DAYS_OF_WEEK.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex items-center gap-0.5">
                                <input
                                  name="timeStart"
                                  value={editFormData.timeStart}
                                  onChange={handleFormChange}
                                  className="w-10 h-6 px-1 text-center text-[10px] font-mono border border-input rounded outline-none focus:border-primary"
                                  placeholder="08:00"
                                />
                                <span className="text-[10px] text-muted-foreground">-</span>
                                <input
                                  name="timeEnd"
                                  value={editFormData.timeEnd}
                                  onChange={handleFormChange}
                                  className="w-10 h-6 px-1 text-center text-[10px] font-mono border border-input rounded outline-none focus:border-primary"
                                  placeholder="10:00"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <input
                              name="room"
                              value={editFormData.room}
                              onChange={handleFormChange}
                              className="w-24 h-6 px-2 text-[11px] font-bold border border-input rounded outline-none focus:border-primary"
                              placeholder="Room"
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                  {cls.courseName}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">{cls.courseCode}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <span className="text-[11px] font-mono font-bold text-muted-foreground">{cls.classCode}</span>
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-muted-foreground capitalize">{cls.day}</span>
                              <span className="text-[10px] font-mono text-muted-foreground/60">{cls.timeStart} - {cls.timeEnd}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <span className="text-[11px] font-bold text-muted-foreground">{cls.room}</span>
                          </td>
                        </>
                      )}

                      <td className="px-4 py-2 text-center align-middle">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-muted/30 text-muted-foreground/60 border border-border/50 uppercase tracking-tighter">
                          {cls.enrollmentCount}
                        </span>
                      </td>

                      <td className="px-4 py-2 text-right align-middle whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Batal"
                            >
                              <X size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSaveEdit(cls.id)}
                              disabled={isSaving}
                              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              title="Simpan"
                            >
                              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={12} />}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(cls)}
                              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              title="Edit Kelas"
                            >
                              <Edit2 size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(cls.id, cls.courseCode, cls.classCode)}
                              disabled={isDeleting === cls.id}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Hapus Kelas"
                            >
                              {isDeleting === cls.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 size={12} />}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-muted-foreground">
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

        {/* Halaman (Pagination) */}
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

      {/* Modal */}
      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); fetchClasses(); }}
      />
    </div>
  );
}
