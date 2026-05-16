import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { Trash2, Check, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const KrsTab = ({ student, onRefresh }) => {
  const [modifiedClasses, setModifiedClasses] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [siblingClasses, setSiblingClasses] = useState({});

  useEffect(() => {
    if (!student.courses || student.courses.length === 0) return;

    const uniqueCourseCodes = [...new Set(
      student.courses.map(c => c.parallelClass?.courseCode).filter(Boolean)
    )];

    const fetchSiblings = async () => {
      try {
        const res = await api.get('/api/classes');
        const allClasses = res.data;
        const map = {};
        uniqueCourseCodes.forEach(code => {
          map[code] = allClasses.filter(cls => cls.courseCode === code);
        });
        setSiblingClasses(map);
      } catch (err) {
        console.error('Gagal mengambil daftar kelas:', err);
      }
    };

    fetchSiblings();
  }, [student.courses]);

  const handleClassChange = (enrollmentId, newParallelClassId) => {
    setModifiedClasses(prev => ({
      ...prev,
      [enrollmentId]: Number(newParallelClassId),
    }));
  };

  const handleDropCourse = async (enrollmentId, courseName) => {
    const confirmDrop = window.confirm(
      `Peringatan: Yakin ingin menghapus mata kuliah ${courseName} dari KRS mahasiswa ini?`
    );

    if (confirmDrop) {
      setIsProcessing(true);
      try {
        await api.delete(`/api/admin/enrollments/${enrollmentId}`);
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Gagal drop matkul:', error);
        alert(error.response?.data?.error || 'Terjadi kesalahan saat menghapus mata kuliah.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveChanges = async () => {
    const updates = Object.keys(modifiedClasses);
    if (updates.length === 0) return;

    setIsProcessing(true);
    try {
      await Promise.all(
        updates.map(enrollmentId =>
          api.put(`/api/admin/enrollments/${enrollmentId}`, {
            newParallelClassId: modifiedClasses[enrollmentId],
          })
        )
      );
      setModifiedClasses({});
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Gagal menyimpan perubahan KRS:', error);
      alert(error.response?.data?.error || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-muted-foreground" />
          <h4 className="text-sm font-black uppercase tracking-tight">Kartu Rencana Studi</h4>
        </div>
        <span className="text-[10px] font-black bg-muted px-2 py-1 rounded border border-border uppercase tracking-widest text-muted-foreground">
          {student.courses?.length || 0} Terdaftar
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {student.courses && student.courses.length > 0 ? (
          student.courses.map(course => {
            const enrollmentId = course.id;
            const courseCode = course.parallelClass?.courseCode;
            const courseName = course.parallelClass?.courseName;
            const classCode = course.parallelClass?.classCode;
            const currentClassId = course.parallelClassId;
            
            const currentType = (classCode || '').charAt(0).toUpperCase();
            const allSiblings = siblingClasses[courseCode] || [];
            const options = allSiblings.filter(cls => (cls.classCode || '').charAt(0).toUpperCase() === currentType);
            
            const isChanged = modifiedClasses[enrollmentId] !== undefined && modifiedClasses[enrollmentId] !== currentClassId;

            return (
              <div key={enrollmentId} className={`group relative p-4 rounded-xl border transition-all duration-200 ${isChanged ? 'bg-primary/[0.03] border-primary/20 shadow-sm' : 'bg-background border-border hover:border-muted-foreground/20 shadow-sm'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-mono">{courseCode}</span>
                      {isChanged && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary text-white text-[8px] font-black rounded uppercase tracking-tighter shadow-sm animate-in zoom-in-95">
                          <AlertCircle size={8} /> Modified
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-black text-foreground leading-tight line-clamp-1">{courseName || 'Mata Kuliah'}</h5>
                  </div>
                  <button
                    onClick={() => handleDropCourse(enrollmentId, courseCode)}
                    disabled={isProcessing}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Hapus Mata Kuliah"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
                
                <div className="mt-2 space-y-2">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Pilih Kelas</span>
                    <Select 
                      value={(modifiedClasses[enrollmentId] ?? currentClassId).toString()} 
                      onValueChange={(val) => handleClassChange(enrollmentId, val)}
                      disabled={isProcessing || options.length === 0}
                    >
                      <SelectTrigger className="w-full h-9 bg-background border-input text-xs font-bold">
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {options.length > 0 ? (
                            options.map(cls => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.classCode} — {cls.day}, {cls.timeStart}-{cls.timeEnd}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value={currentClassId.toString()}>{classCode} (Single Class)</SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border-2 border-dashed border-border">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-muted-foreground/30 border border-border">
              <BookOpen size={24} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">KRS Belum Terisi</p>
          </div>
        )}
      </div>

      {Object.keys(modifiedClasses).length > 0 && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-md pt-6 pb-2 mt-8 border-t border-border animate-in slide-in-from-bottom-4">
          <Button
            onClick={handleSaveChanges}
            disabled={isProcessing}
            variant="admin"
            className="w-full h-12 shadow-xl"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Check size={18} strokeWidth={3} />
            )}
            SIMPAN {Object.keys(modifiedClasses).length} PERUBAHAN KRS
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-3 font-bold uppercase tracking-tight opacity-50 italic">
            Perubahan ini akan langsung diperbarui di database mahasiswa.
          </p>
        </div>
      )}
    </div>
  );
};

export default KrsTab;
