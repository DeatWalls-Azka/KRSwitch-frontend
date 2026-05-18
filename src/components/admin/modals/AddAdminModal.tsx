import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../api';
import { UserPlus, X, Loader2, Save } from 'lucide-react';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

// --- Types ----------------------------------------------------

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// --- Komponen Utama -------------------------------------------

const AddAdminModal = ({ isOpen, onClose, onSuccess }: AddAdminModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('operator');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name || !email || !role) {
      return alert('Harap isi Nama, Email, dan Akses Admin!');
    }

    setIsProcessing(true);
    try {
      await api.post('/api/admin/admins', {
        name,
        email,
        role
      });

      alert(`Admin ${name} berhasil ditambahkan!`);
      setName('');
      setEmail('');
      setRole('operator');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Gagal menambah admin:", error);
      alert(error.response?.data?.error || "Gagal menyimpan data admin.");
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
              <h3 className="text-sm font-black uppercase tracking-tight">Registrasi Admin</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Input Data Admin Baru</p>
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
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Nama Lengkap</label>
            <input 
              type="text" 
              placeholder="Masukkan nama lengkap..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold text-foreground transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Alamat Email (IPB / Google)</label>
            <input 
              type="email" 
              placeholder="contoh@apps.ipb.ac.id" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary font-mono text-sm font-bold text-foreground transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Akses Level</label>
            <Select value={role} onValueChange={setRole} disabled={isProcessing}>
              <SelectTrigger className="w-full h-11 bg-background border-input font-bold text-sm focus:ring-2 focus:ring-ring focus:border-primary">
                <SelectValue placeholder="Pilih Akses Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator" className="text-sm font-bold">Operator (Read/Manage Students)</SelectItem>
                <SelectItem value="super_admin" className="text-sm font-bold">Super Admin (Full Access)</SelectItem>
              </SelectContent>
            </Select>
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
            {isProcessing ? 'Processing...' : 'Daftarkan Admin'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddAdminModal;
