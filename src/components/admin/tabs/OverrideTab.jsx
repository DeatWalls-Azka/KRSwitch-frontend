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
        const [courseCode, classCode] = selectedCourseCode.split(':');
        const currentEnrollment = student.courses.find(c => 
          (c.parallelClass?.courseCode || c.name) === courseCode &&
          (c.parallelClass?.classCode || c.currentClass) === classCode
        );
        const currentClassId = currentEnrollment?.parallelClassId;
        const currentClassType = classCode.charAt(0).toUpperCase();
        
        const siblings = res.data.filter(cls => {
          const type = (cls.classCode || '').charAt(0).toUpperCase();
          return cls.courseCode === courseCode && 
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
    
    // Extract real courseCode from our unique value "CODE:CLASS"
    const [realCourseCode] = selectedCourseCode.split(':');
    const targetStudent = targetClassStudents.find(s => s.nim === targetStudentNim);
    
    const confirmOverride = window.confirm(
      `Sistem Override\n\n` +
      `Anda akan menukar jadwal ${realCourseCode} secara paksa antara:\n` +
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
          courseCode: realCourseCode
        });
        alert('Override berhasil!');
        // Reset steps for next action instead of closing
        setSelectedCourseCode('');
        setTargetClassId('');
        setTargetStudentNim('');
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
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/5 rounded text-emerald-700 border border-emerald-500/20">
            <ShieldCheck size={14} strokeWidth={3} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-1">Admin Override</h4>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Direct schedule manipulation (K/P/R only)</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-6 h-1 rounded-full transition-all duration-500 ${currentStep >= s ? 'bg-primary shadow-sm' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {/* Step 1: Course Selection */}
        <div className={`p-3 rounded-md border transition-all duration-300 ${selectedCourseCode ? 'border-primary/40 bg-primary/[0.03]' : currentStep === 1 ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/5 opacity-50'}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${selectedCourseCode || currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {selectedCourseCode ? '✓' : '1'}
            </span>
            <label className={`text-[10px] font-bold uppercase tracking-widest ${selectedCourseCode ? 'text-primary' : 'text-foreground'}`}>Target Course Enrollment</label>
          </div>
          
          <Select 
            value={selectedCourseCode} 
            onValueChange={(val) => {
              setSelectedCourseCode(val);
              setTargetClassId('');
              setTargetStudentNim('');
            }}
          >
            <SelectTrigger className={`w-full h-9 bg-background text-[11px] font-bold transition-all ${selectedCourseCode ? 'border-primary/50 text-primary ring-primary/10' : 'border-border focus:ring-foreground/20 focus:border-foreground'}`}>
              <SelectValue placeholder="Select course to override" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Enrolled Courses</SelectLabel>
                {student?.courses?.map(course => {
                  const courseCode = course.parallelClass?.courseCode || course.name;
                  const classCode = course.parallelClass?.classCode || course.currentClass;
                  // Use unique value to prevent duplicate selection issues (especially for K/P components)
                  const uniqueVal = `${courseCode}:${classCode}`;
                  return (
                    <SelectItem key={course.id} value={uniqueVal}>
                      <span className="text-[10px] font-bold uppercase tracking-tight">{courseCode} — CLASS {classCode}</span>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: Class Selection */}
        <div className={`p-3 rounded-md border transition-all duration-300 ${targetClassId ? 'border-primary/40 bg-primary/[0.03]' : currentStep === 2 ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/5 opacity-50'} ${!selectedCourseCode && 'pointer-events-none'}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${targetClassId || currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {targetClassId ? '✓' : '2'}
            </span>
            <label className={`text-[10px] font-bold uppercase tracking-widest ${targetClassId ? 'text-primary' : 'text-foreground'}`}>Destination Class</label>
          </div>
          
          <Select 
            value={targetClassId} 
            onValueChange={(val) => {
              setTargetClassId(val);
              setTargetStudentNim('');
            }}
            disabled={isProcessing || !selectedCourseCode}
          >
            <SelectTrigger className={`w-full h-9 bg-background text-[11px] font-bold transition-all ${targetClassId ? 'border-primary/50 text-primary ring-primary/10' : 'border-border focus:ring-foreground/20 focus:border-foreground'}`}>
              <SelectValue placeholder="Select target parallel class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Available Classes</SelectLabel>
                {siblingClasses.map(cls => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    <span className="text-[10px] font-bold uppercase tracking-tight">{cls.classCode} ({cls.day}, {cls.timeStart}-{cls.timeEnd})</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {selectedCourseCode && siblingClasses.length === 0 && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 text-destructive rounded-sm border border-destructive/20 animate-in fade-in zoom-in-95">
              <Info size={12} />
              <p className="text-[9px] font-bold uppercase tracking-tight">No alternative parallel classes available.</p>
            </div>
          )}
        </div>

        {/* Step 3: Student Selection */}
        <div className={`p-3 rounded-md border transition-all duration-300 ${targetStudentNim ? 'border-primary/40 bg-primary/[0.03]' : currentStep === 3 ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/5 opacity-50'} ${!targetClassId && 'pointer-events-none'}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${targetStudentNim || currentStep === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {targetStudentNim ? '✓' : '3'}
            </span>
            <label className={`text-[10px] font-bold uppercase tracking-widest ${targetStudentNim ? 'text-primary' : 'text-foreground'}`}>Target Student to Swap</label>
          </div>
          
          <div className="relative">
            <Select 
              value={targetStudentNim} 
              onValueChange={setTargetStudentNim}
              disabled={isProcessing || !targetClassId || isLoadingStudents}
            >
              <SelectTrigger className={`w-full h-9 bg-background text-[11px] font-bold transition-all ${targetStudentNim ? 'border-primary/50 text-primary ring-primary/10' : 'border-border focus:ring-foreground/20 focus:border-foreground'}`}>
                <SelectValue placeholder="Select student for manual swap" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Students in Target Class</SelectLabel>
                  {targetClassStudents.map(s => (
                    <SelectItem key={s.nim} value={s.nim}>
                      <span className="text-[10px] font-bold uppercase tracking-tight">{s.nim} — {s.name}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {isLoadingStudents && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin h-3 w-3 text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-4 mt-4 border-t border-border/40">
        <Button 
          variant="admin"
          onClick={handleOverride}
          disabled={isProcessing || !targetStudentNim}
          className="w-full h-10 shadow-lg uppercase tracking-widest text-[10px] font-bold"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <ArrowRightLeft size={14} className="mr-2" strokeWidth={2.5} />
          )}
          {isProcessing ? 'PROCESSING OVERRIDE...' : 'EXECUTE FORCED SWAP'}
        </Button>
        <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
          <CheckCircle2 size={10} className="text-muted-foreground" />
          <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest text-center">Override will bypass all system validation rules and logic.</p>
        </div>
      </div>
    </div>
  );
};

export default OverrideTab;