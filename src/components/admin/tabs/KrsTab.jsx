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
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-emerald-600" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Student Course Card (KRS)</h4>
        </div>
        <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-sm border border-emerald-500/20 uppercase tracking-tighter">
          {student.courses?.length || 0} Subjects Registered
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div key={enrollmentId} className={`relative p-3.5 rounded-md border transition-all duration-200 ${isChanged ? 'bg-emerald-500/5 border-emerald-500/30 shadow-sm' : 'bg-background border-border/50 hover:border-border shadow-sm'}`}>
                <div className="flex items-start justify-between mb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest font-mono">{courseCode}</span>
                      {isChanged && (
                        <span className="flex items-center gap-1 px-1 py-0.5 bg-emerald-500 text-white text-[7px] font-bold rounded-sm uppercase tracking-tighter shadow-sm animate-in zoom-in-95">
                          MODIFIED
                        </span>
                      )}
                    </div>
                    <h5 className="text-[11px] font-bold text-foreground leading-tight line-clamp-1 uppercase tracking-tight">{courseName || 'Mata Kuliah'}</h5>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1.5">
                  <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] block">Assign Class</span>
                  <Select 
                    value={(modifiedClasses[enrollmentId] ?? currentClassId).toString()} 
                    onValueChange={(val) => handleClassChange(enrollmentId, val)}
                    disabled={isProcessing || options.length === 0}
                  >
                    <SelectTrigger className="w-full h-8 bg-background border-border text-[10px] font-bold focus:ring-slate-950/20 focus:border-slate-950">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {options.length > 0 ? (
                          options.map(cls => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              <span className="text-[10px] font-bold uppercase tracking-tight">{cls.classCode} — {cls.day}, {cls.timeStart}-{cls.timeEnd}</span>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={currentClassId.toString()}>
                            <span className="text-[10px] font-bold uppercase tracking-tight">{classCode} (Single Class)</span>
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-muted/5 rounded-md border border-dashed border-border/50">
            <BookOpen size={20} className="mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Empty Course Enrollment</p>
          </div>
        )}
      </div>

      {Object.keys(modifiedClasses).length > 0 && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-md pt-4 pb-2 mt-6 border-t border-border/50 animate-in slide-in-from-bottom-2">
          <Button
            onClick={handleSaveChanges}
            disabled={isProcessing}
            variant="admin"
            className="w-full h-10 shadow-lg text-[10px] font-bold tracking-widest"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                <Check size={14} className="mr-2" strokeWidth={3} />
                COMMIT {Object.keys(modifiedClasses).length} CHANGES
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default KrsTab;
