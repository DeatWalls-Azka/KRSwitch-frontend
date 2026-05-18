import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../api';
import { ShieldAlert, X, Loader2, Save } from 'lucide-react';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { User } from '../../../types';

// --- Types ----------------------------------------------------

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminData: User | null;
  onSuccess?: () => void;
}

// --- Komponen Utama -------------------------------------------

const EditAdminModal = ({ isOpen, onClose, adminData, onSuccess }: EditAdminModalProps) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('operator');
  const [isSelf, setIsSelf] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (adminData) {
      setName(adminData.name);
      setRole(adminData.role);
      
      // Cek apakah mengedit akun admin milik sendiri
      api.get<User>('/api/me')
        .then(res => {
          if (res.data?.nim === adminData.nim) {
            setIsSelf(true);
          }
        })
        .catch(console.error);
    }
  }, [adminData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name) {
      return alert('Harap isi Nama Lengkap!');
    }

    const payload: Partial<User> & { isActive?: boolean } = { name };
    if (!isSelf) {
      if (!role) return alert('Harap pilih Akses Admin!');
      payload.role = role as any;
      payload.isActive = true;
    }

    setIsProcessing(true);
    try {
      if (adminData) {
        await api.put(`/api/admin/admins/${adminData.nim}`, payload);
        alert(`Admin ${name} berhasil diupdate!`);
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Gagal mengupdate admin:", error);
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
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <ShieldAlert size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight">Edit Admin</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Ubah Data & Akses Level</p>
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
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Email Admin (Tidak dapat diubah)</label>
            <input 
              type="text" 
              value={adminData?.email || ''}
              disabled={true}
              className="w-full px-4 py-2.5 bg-muted/30 border border-border/50 rounded-md outline-none font-mono text-sm font-bold text-muted-foreground transition-all cursor-not-allowed" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Nama Lengkap</label>
            <input 
              type="text" 
              placeholder="Masukkan nama lengkap..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm font-bold text-foreground transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Akses Level</label>
            <Select value={role} onValueChange={setRole} disabled={isProcessing || isSelf}>
              <SelectTrigger className="w-full h-11 bg-background border-input font-bold text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500">
                <SelectValue placeholder="Pilih Akses Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator" className="text-sm font-bold">Operator (Read/Manage Students)</SelectItem>
                <SelectItem value="super_admin" className="text-sm font-bold">Super Admin (Full Access)</SelectItem>
              </SelectContent>
            </Select>
            {isSelf && (
              <p className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 uppercase tracking-wider mt-1">
                Anda tidak dapat mengubah level akses akun Anda sendiri untuk menghindari lockout.
              </p>
            )}
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
            disabled={isProcessing || (name === adminData?.name && (isSelf || role === adminData?.role))}
            className="px-8 h-11 bg-amber-500 hover:bg-amber-600 text-amber-950 uppercase tracking-widest text-[10px] font-black"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Save size={14} strokeWidth={3} className="mr-2" />
            )}
            {isProcessing ? 'Menyimpan...' : 'Update Admin'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditAdminModal;
