import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { ShieldCheck, ArrowRightLeft, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const OverrideTab = ({ student }) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [targetStudentNim, setTargetStudentNim] = useState('');
  
  const [siblingClasses, setSiblingClasses] = useState([]);
  const [targetClassStudents, setTargetClassStudents] = useState([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // When a course is selected, find all other parallel classes for that course
  useEffect(() => {
    if (!selectedCourseCode) {
      setSiblingClasses([]);
      setTargetClassId('');
      return;
    }

    const fetchSiblings = async () => {
      try {
        const res = await api.get('/api/classes');
        const currentEnrollment = student.courses.find(c => (c.parallelClass?.courseCode || c.name) === selectedCourseCode);
        const currentClassId = currentEnrollment?.parallelClassId;
        const currentClassCode = currentEnrollment?.parallelClass?.classCode || '';
        const currentClassType = currentClassCode.charAt(0).toUpperCase();
        
        const siblings = res.data.filter(cls => {
          const type = (cls.classCode || '').charAt(0).toUpperCase();
          return cls.courseCode === selectedCourseCode && 
                 cls.id !== currentClassId && 
                 type === currentClassType;
        });
        setSiblingClasses(siblings);
      } catch (err) {
        console.error('Gagal mengambil daftar kelas:', err);
      }
    };

    fetchSiblings();
  }, [selectedCourseCode, student.courses]);

  // When a target class is selected, fetch students in that class
  useEffect(() => {
    if (!targetClassId) {
      setTargetClassStudents([]);
      setTargetStudentNim('');
      return;
    }

    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const res = await api.get(`/api/admin/classes/${targetClassId}/students`);
        setTargetClassStudents(res.data);
      } catch (err) {
        console.error('Gagal mengambil daftar mahasiswa di kelas:', err);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [targetClassId]);

  const handleOverride = async () => {
    if (!targetStudentNim || !selectedCourseCode) {
      alert('Harap lengkapi semua pilihan!');
      return;
    }
    
    const targetStudent = targetClassStudents.find(s => s.nim === targetStudentNim);
    
    const confirmOverride = window.confirm(
      `Sistem Override\n\n` +
      `Anda akan menukar jadwal ${selectedCourseCode} secara paksa antara:\n` +
      `1. ${student.name} (${student.nim})\n` +
      `2. ${targetStudent?.name || 'Mahasiswa Target'} (${targetStudentNim})\n\n` +
      `Lanjutkan?`
    );
    
    if (confirmOverride) {
      setIsProcessing(true);
      try {
        await api.post('/api/admin/override-swap', {
          nim1: student.nim,
          nim2: targetStudentNim,
          courseCode: selectedCourseCode
        });
        alert('Override berhasil!');
        window.location.reload();
      } catch (error) {
        console.error("Gagal eksekusi override:", error);
        alert(error.response?.data?.error || "Gagal mengeksekusi Override.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const currentStep = !selectedCourseCode ? 1 : !targetClassId ? 2 : 3;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/5 rounded text-primary border border-primary/10">
            <ShieldCheck size={14} strokeWidth={3} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight">Admin Override</h4>
            <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-widest opacity-60 italic">Hanya swap kelas sejenis (K/P/R)</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${currentStep >= s ? 'bg-primary shadow-sm' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Step 1: Course Selection */}
        <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${currentStep === 1 ? 'border-primary bg-background shadow-md' : 'border-border bg-muted/20 opacity-50'}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</span>
            <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Pilih Mata Kuliah Asal</label>
          </div>
          
          <Select 
            value={selectedCourseCode} 
            onValueChange={(val) => {
              setSelectedCourseCode(val);
              setTargetClassId('');
              setTargetStudentNim('');
            }}
          >
            <SelectTrigger className="w-full h-12 bg-background border-input font-bold">
              <SelectValue placeholder="Pilih Mata Kuliah" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Daftar Mata Kuliah</SelectLabel>
                {student?.courses?.map(course => {
                  const courseCode = course.parallelClass?.courseCode || course.name;
                  const classCode = course.parallelClass?.classCode || course.currentClass;
                  return (
                    <SelectItem key={course.id} value={courseCode}>
                      {courseCode} (Kelas: {classCode})
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: Class Selection */}
        <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${currentStep === 2 ? 'border-primary bg-background shadow-md' : 'border-border bg-muted/20 opacity-50'} ${!selectedCourseCode && 'pointer-events-none'}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</span>
            <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Pilih Kelas Tujuan</label>
          </div>
          
          <Select 
            value={targetClassId} 
            onValueChange={(val) => {
              setTargetClassId(val);
              setTargetStudentNim('');
            }}
            disabled={isProcessing || !selectedCourseCode}
          >
            <SelectTrigger className="w-full h-12 bg-background border-input font-bold">
              <SelectValue placeholder="Pilih Kelas Paralel" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Kelas Tersedia</SelectLabel>
                {siblingClasses.map(cls => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    Kelas {cls.classCode} ({cls.day}, {cls.timeStart}-{cls.timeEnd})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {selectedCourseCode && siblingClasses.length === 0 && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-destructive/5 text-destructive rounded border border-destructive/10 animate-in fade-in zoom-in-95">
              <Info size={12} strokeWidth={3} />
              <p className="text-[9px] font-black uppercase tracking-tight">Tidak ada kelas paralel sejenis tersedia.</p>
            </div>
          )}
        </div>

        {/* Step 3: Student Selection */}
        <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${currentStep === 3 ? 'border-primary bg-background shadow-md' : 'border-border bg-muted/20 opacity-50'} ${!targetClassId && 'pointer-events-none'}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${currentStep === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</span>
            <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Pilih Mahasiswa Target</label>
          </div>
          
          <div className="relative">
            <Select 
              value={targetStudentNim} 
              onValueChange={setTargetStudentNim}
              disabled={isProcessing || !targetClassId || isLoadingStudents}
            >
              <SelectTrigger className="w-full h-12 bg-background border-input font-bold">
                <SelectValue placeholder="Pilih Mahasiswa" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Mahasiswa di Kelas Ini</SelectLabel>
                  {targetClassStudents.map(s => (
                    <SelectItem key={s.nim} value={s.nim}>
                      {s.nim} - {s.name.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {isLoadingStudents && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-border mt-8">
        <Button 
          variant="admin"
          onClick={handleOverride}
          disabled={isProcessing || !targetStudentNim}
          className="w-full h-14 shadow-xl uppercase tracking-widest text-[10px] font-black"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <ArrowRightLeft size={18} strokeWidth={3} className="mr-2" />
          )}
          {isProcessing ? 'MEMPROSES PERMINTAAN...' : 'EKSEKUSI TUKAR PAKSA'}
        </Button>
        <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
          <CheckCircle2 size={12} className="text-muted-foreground" />
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Override bypass seluruh aturan sistem.</p>
        </div>
      </div>
    </div>
  );
};

export default OverrideTab;