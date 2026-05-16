import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { BookPlus, X, Loader2, Save } from 'lucide-react';
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

const AddCourseModal = ({ isOpen, onClose, studentName, studentNim }) => {
  const [allClasses, setAllClasses] = useState([]); 
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchClasses = async () => {
        setIsLoading(true);
        try {
          const response = await api.get('/api/classes');
          setAllClasses(response.data);
        } catch (error) {
          console.error("Gagal mengambil daftar kelas:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchClasses();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddCourse = async () => {
    if (!selectedClassId) return alert('Silakan pilih kelas terlebih dahulu!');

    setIsProcessing(true);
    try {
      await api.post('/api/admin/enrollments', {
        nim: studentNim,
        parallelClassId: parseInt(selectedClassId)
      });

      alert(`Berhasil menambahkan mata kuliah untuk ${studentName}!`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Gagal menambah matkul:", error);
      alert(error.response?.data?.error || "Gagal menambahkan mata kuliah.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-border animate-in zoom-in-95 duration-300">
        
        <div className="bg-muted/10 p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/5 rounded-lg text-primary">
              <BookPlus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight">Tambah Mata Kuliah</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                Pendaftaran untuk {studentName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Pilih Mata Kuliah & Kelas Paralel</label>
            
            <Select 
              value={selectedClassId} 
              onValueChange={setSelectedClassId}
              disabled={isLoading || isProcessing}
            >
              <SelectTrigger className="w-full h-12 bg-background border-input font-bold">
                <SelectValue placeholder={isLoading ? "Memuat data..." : "Pilih Matkul & Kelas"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Master Data Kelas</SelectLabel>
                  {allClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.courseCode} — {cls.courseName} (Kelas {cls.classCode})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <p className="text-[9px] text-muted-foreground mt-2 italic font-medium uppercase tracking-tight opacity-60">
              *Hanya menampilkan kelas yang terdaftar di database master IPB.
            </p>
          </div>
        </div>
        
        <div className="p-6 bg-muted/20 border-t border-border flex items-center justify-end gap-4">
          <Button 
            variant="ghost"
            onClick={onClose} 
            disabled={isProcessing}
            className="text-[10px] font-black uppercase tracking-widest"
          >
            Batal
          </Button>
          <Button 
            onClick={handleAddCourse} 
            disabled={isProcessing || !selectedClassId}
            className="px-8 h-11 uppercase tracking-widest text-[10px] font-black"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Save size={14} strokeWidth={3} className="mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Simpan Enrollment'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AddCourseModal;