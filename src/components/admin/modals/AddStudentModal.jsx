import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../api';
import { UserPlus, X, Loader2, Save } from 'lucide-react';
import { Button } from '../../ui/button';

const AddStudentModal = ({ isOpen, onClose }) => {
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!nim || !name) {
      return alert('Harap isi NIM dan Nama Mahasiswa!');
    }

    setIsProcessing(true);
    try {
      await api.post('/api/admin/users', {
        nim: nim.toUpperCase(),
        name: name,
        email: `${nim.toLowerCase()}@apps.ipb.ac.id` 
      });

      alert(`Mahasiswa ${name} berhasil ditambahkan!`);
      setNim('');
      setName('');
      onClose();
      window.location.reload(); 
    } catch (error) {
      console.error("Gagal menambah mahasiswa:", error);
      alert(error.response?.data?.error || "Gagal menyimpan data mahasiswa.");
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
      <div className="relative bg-background rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-border animate-in zoom-in-95 duration-300">
        <div className="bg-muted/10 p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/5 rounded-lg text-primary">
              <UserPlus size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight">Registrasi Mahasiswa</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Input Data Master</p>
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
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Nomor Induk Mahasiswa (NIM)</label>
            <input 
              type="text" 
              placeholder="G6401211XXX" 
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary font-mono text-sm font-bold text-foreground transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Nama Lengkap Sesuai SIAK</label>
            <input 
              type="text" 
              placeholder="Masukkan nama lengkap..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold text-foreground transition-all" 
            />
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
            onClick={handleSave} 
            disabled={isProcessing}
            className="px-8 h-11 uppercase tracking-widest text-[10px] font-black"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Save size={14} strokeWidth={3} className="mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Daftarkan Mahasiswa'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddStudentModal;