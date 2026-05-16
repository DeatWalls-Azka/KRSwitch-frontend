import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import { User, Mail, Hash, Save, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '../../ui/button';

const AkunTab = ({ student, onRefresh }) => {
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (student) {
      setNim(student.nim || '');
      setName(student.name || '');
      setEmail(student.email || '');
    }
  }, [student]);

  const handleUpdateProfile = async () => {
    if (!nim || !name) {
      return alert('NIM dan Nama tidak boleh kosong!');
    }

    setIsSaving(true);
    try {
      await api.put(`/api/admin/users/${student.nim}`, {
        newNim: nim.toUpperCase(),
        newName: name,
        newEmail: email
      });
      alert('Profil mahasiswa berhasil diperbarui!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Gagal update profil:", error);
      alert(error.response?.data?.error || "Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `PERINGATAN: Anda akan menghapus total mahasiswa ${student.name} (${student.nim}).\n\nSeluruh data KRS dan tawaran barter yang bersangkutan akan hilang selamanya.\n\nLanjutkan?`
    );

    if (confirmDelete) {
      setIsDeleting(true);
      try {
        await api.delete(`/api/admin/users/${student.nim}`);
        alert('Mahasiswa berhasil dihapus dari sistem.');
        window.location.reload();
      } catch (error) {
        console.error('Gagal menghapus mahasiswa:', error);
        alert(error.response?.data?.error || 'Terjadi kesalahan saat menghapus mahasiswa.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const hasChanges = nim !== student.nim || name !== student.name || email !== (student.email || '');

  return (
    <div className="space-y-8">
      {/* Profile Info Header */}
      <div className="flex items-center gap-6 p-6 bg-muted/20 border border-border rounded-xl shadow-sm">
        <div className="w-16 h-16 rounded-xl bg-background shadow-sm flex items-center justify-center text-2xl font-black text-foreground border border-border shrink-0">
          {student.name?.substring(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-black text-foreground tracking-tight truncate">{student.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-mono bg-muted px-1.5 py-0.5 rounded">{student.nim}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{student.email || 'Email belum diatur'}</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <User size={16} className="text-muted-foreground" />
          <h4 className="text-sm font-black uppercase tracking-tight">Manajemen Identitas</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Hash size={10} /> Nomor Induk Mahasiswa (NIM)
            </label>
            <input 
              type="text" 
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold tracking-tight"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Mail size={10} /> Alamat Email Institusi
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSaving}
              placeholder="example@student.itb.ac.id"
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold tracking-tight"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <User size={10} /> Nama Lengkap Sesuai SIAK
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm font-bold tracking-tight"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleUpdateProfile}
            disabled={isSaving || !hasChanges}
            className="w-full h-12 shadow-md uppercase tracking-widest text-[10px] font-black"
          >
            {isSaving ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Save size={16} strokeWidth={3} className="mr-2" />
            )}
            SIMPAN PERUBAHAN PROFIL
          </Button>
        </div>
      </div>

      {/* Delete Section */}
      <div className="pt-10 mt-10 border-t border-border bg-destructive/[0.02] -mx-8 px-8 pb-8">
        <div className="flex items-center gap-2 mb-4 text-destructive">
          <ShieldAlert size={16} />
          <h4 className="text-sm font-black uppercase tracking-tight">Opsi Destruktif</h4>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 opacity-60 leading-relaxed">
          Menghapus mahasiswa akan membersihkan seluruh data terkait termasuk antrean barter dan riwayat aktivitas secara permanen.
        </p>
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={isDeleting || isSaving}
          className="w-full border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all h-12 group"
        >
          {isDeleting ? <Loader2 className="animate-spin h-5 w-5" /> : <Trash2 size={16} strokeWidth={3} className="mr-2 group-hover:scale-110 transition-transform" />}
          HAPUS MAHASISWA DARI DATABASE
        </Button>
      </div>
    </div>
  );
};

export default AkunTab;