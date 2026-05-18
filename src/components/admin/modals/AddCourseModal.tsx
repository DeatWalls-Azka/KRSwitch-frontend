import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../api';
import { BookOpenText, X, Loader2, Save } from 'lucide-react';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

// --- Types ----------------------------------------------------

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Komponen Utama -------------------------------------------

const AddCourseModal = ({ isOpen, onClose }: AddCourseModalProps) => {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [day, setDay] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [room, setRoom] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!courseCode || !courseName || !classCode) {
      return alert('Harap isi Kode Matkul, Nama Matkul, dan Kelas!');
    }

    setIsProcessing(true);
    try {
      await api.post('/api/admin/classes', {
        courseCode: courseCode.trim().toUpperCase(),
        courseName: courseName.trim(),
        classCode: classCode.trim().toUpperCase(),
        day: day.trim(),
        timeStart: timeStart.trim(),
        timeEnd: timeEnd.trim(),
        room: room.trim()
      });

      alert(`Kelas ${courseCode} - ${classCode} berhasil ditambahkan!`);
      setCourseCode('');
      setCourseName('');
      setClassCode('');
      setDay('');
      setTimeStart('');
      setTimeEnd('');
      setRoom('');
      onClose();
    } catch (error: any) {
      console.error("Gagal menambah kelas:", error);
      alert(error.response?.data?.error || "Gagal menyimpan data kelas.");
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative bg-background rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-border animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-muted/10 p-6 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/5 rounded-lg text-primary">
              <BookOpenText size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight">Registrasi Kelas</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Input Data Mata Kuliah</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Kode Mata Kuliah</label>
            <input 
              type="text" 
              placeholder="KOM123" 
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary font-mono text-sm font-bold text-foreground transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Nama Mata Kuliah</label>
            <input 
              type="text" 
              placeholder="Masukkan nama mata kuliah..." 
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold text-foreground transition-all" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Kelas (Paralel)</label>
              <input 
                type="text" 
                placeholder="K1" 
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold text-foreground transition-all uppercase" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Hari</label>
              <Select value={day} onValueChange={setDay} disabled={isProcessing}>
                <SelectTrigger className="w-full h-10 px-4 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold transition-all">
                  <SelectValue placeholder="Pilih Hari" />
                </SelectTrigger>
                <SelectContent className="z-[150]">
                  <SelectItem value="Senin">Senin</SelectItem>
                  <SelectItem value="Selasa">Selasa</SelectItem>
                  <SelectItem value="Rabu">Rabu</SelectItem>
                  <SelectItem value="Kamis">Kamis</SelectItem>
                  <SelectItem value="Jumat">Jumat</SelectItem>
                  <SelectItem value="Sabtu">Sabtu</SelectItem>
                  <SelectItem value="Minggu">Minggu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Jam Mulai</label>
              <input 
                type="text" 
                placeholder="08:00" 
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold font-mono text-foreground transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Jam Selesai</label>
              <input 
                type="text" 
                placeholder="09:40" 
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold font-mono text-foreground transition-all" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Ruangan</label>
            <input 
              type="text" 
              placeholder="RK CCR 1.01" 
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold text-foreground transition-all" 
            />
          </div>
        </div>

        <div className="p-6 bg-muted/20 border-t border-border flex items-center justify-end gap-4 shrink-0">
          <Button 
            variant="ghost"
            onClick={onClose} 
            disabled={isProcessing}
            className="text-[10px] font-black uppercase tracking-widest"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isProcessing}
            className="px-8 h-11 uppercase tracking-widest text-[10px] font-black"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Save size={14} strokeWidth={3} className="mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Simpan Kelas'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddCourseModal;
