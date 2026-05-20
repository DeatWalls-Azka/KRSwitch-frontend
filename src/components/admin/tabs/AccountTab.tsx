import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { User, Mail, Hash, Save, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';

interface Student {
  nim: string;
  name: string;
  email: string | null;
}

interface AccountTabProps {
  student: Student;
  onRefresh?: (updatedNim?: string) => void;
}

export default function AccountTab({ student, onRefresh }: AccountTabProps) {
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (student) {
      setNim(student.nim || '');
      setName(student.name || '');
      setEmail(student.email || '');
    }
  }, [student]);

  const handleUpdateProfile = async () => {
    if (!nim || !name) {
      return alert('Student ID (NIM) and Name cannot be empty!');
    }

    setIsSaving(true);
    try {
      await api.put(`/api/admin/users/${student.nim}`, {
        newNim: nim.toUpperCase(),
        newName: name,
        newEmail: email
      });
      alert('Student profile successfully updated!');
      if (onRefresh) onRefresh(nim.toUpperCase());
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      alert(error.response?.data?.error || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `WARNING: You are about to completely delete student ${student.name} (${student.nim}).\n\nAll associated enrollment records and active barter offers will be permanently purged.\n\nDo you want to continue?`
    );

    if (confirmDelete) {
      setIsDeleting(true);
      try {
        await api.delete(`/api/admin/users/${student.nim}`);
        alert('Student successfully purged from system.');
        window.location.reload();
      } catch (error: any) {
        console.error('Failed to purge student:', error);
        alert(error.response?.data?.error || 'An error occurred while deleting the student.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const hasChanges = nim !== student.nim || name !== student.name || email !== (student.email || '');

  return (
    <div className="space-y-6">
      {/* Student Profile Info */}
      <div className="flex items-center gap-5 p-5 bg-muted/5 border border-border/50 rounded-md shadow-sm">
        <div className="w-12 h-12 rounded bg-background shadow-sm flex items-center justify-center text-xl font-bold text-emerald-600 border border-border/50 shrink-0">
          {student.name?.substring(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-1.5">
            <h4 className="text-sm font-bold text-foreground tracking-tight truncate uppercase leading-none">{student.name}</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
              title="Purge Student"
            >
              {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 size={14} />}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono bg-muted/20 px-1.5 py-0.5 rounded-sm border border-border/50">{student.nim}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{student.email || 'NO EMAIL SET'}</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <User size={14} className="text-emerald-700" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identity Management</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <Hash size={10} /> Student ID (NIM)
            </label>
            <input 
              type="text" 
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground text-[11px] font-bold tracking-tight transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <Mail size={10} /> Institutional Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSaving}
              placeholder="example@student.itb.ac.id"
              className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground text-[11px] font-bold tracking-tight transition-all"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <User size={10} /> Full Name (per SIAK)
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground text-[11px] font-bold tracking-tight transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button 
            onClick={handleUpdateProfile}
            disabled={isSaving || !hasChanges}
            variant="admin"
            className="w-full h-10 shadow-sm uppercase tracking-widest text-[10px] font-bold"
          >
            {isSaving ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Save size={14} strokeWidth={2.5} className="mr-2" />
            )}
            COMMIT PROFILE CHANGES
          </Button>
        </div>
      </div>
    </div>
  );
}
