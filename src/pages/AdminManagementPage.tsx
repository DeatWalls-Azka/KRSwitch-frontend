import React, { useState, useEffect, useMemo, useRef } from 'react';
import api, { getSocketToken } from '../api';
import { io } from 'socket.io-client';
import { useTableKeyboardPagination } from '../hooks/useTableKeyboardPagination';
import AddAdminModal from '../components/admin/modals/AddAdminModal';
import EditAdminModal from '../components/admin/modals/EditAdminModal';
import {
  UserPlus,
  Search,
  X,
  Loader2,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import type { User } from '../types';

// --- Komponen Utama -------------------------------------------

export default function AdminManagementPage() {
  useEffect(() => {
    document.title = 'KRSwitch | Admin Management';
  }, []);
  const [admins, setAdmins] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<User | null>(null);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error('Gagal mengambil data admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/api/me');
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Gagal mengambil current user:', err);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchCurrentUser();

    const socket = io((import.meta as any).env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket']
    });
    getSocketToken().then(res => socket.emit('authenticate', res.data.token)).catch(console.error);

    socket.on('superadmin-user-created', fetchAdmins);
    socket.on('superadmin-user-updated', fetchAdmins);
    socket.on('superadmin-user-deleted', fetchAdmins);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const updatePageSize = () => {
      if (!tableContainerRef.current) return;
      const rect = tableContainerRef.current.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top - 120;
      const calculatedRows = Math.floor(availableHeight / 43);
      setPageSize(Math.max(5, calculatedRows));
    };

    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    return () => window.removeEventListener('resize', updatePageSize);
  }, []);

  const filteredAdmins = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(a =>
      a.name.toLowerCase().includes(q) || (a.email && a.email.toLowerCase().includes(q))
    );
  }, [admins, searchQuery]);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / pageSize));
  const paginatedAdmins = filteredAdmins.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleToggleStatus = async (admin: User) => {
    if (admin.nim === currentUser?.nim) {
      alert("Anda tidak dapat menonaktifkan akun Anda sendiri!");
      return;
    }
    try {
      await api.put(`/api/admin/admins/${admin.nim}`, {
        role: admin.role,
        isActive: !admin.isActive
      });
      fetchAdmins();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (admin: User) => {
    if (admin.nim === currentUser?.nim) return;
    if (!window.confirm(`Are you sure you want to delete ${admin.name}?`)) return;
    try {
      await api.delete(`/api/admin/admins/${admin.nim}`);
      fetchAdmins();
    } catch (err) {
      console.error('Failed to delete admin:', err);
    }
  };

  const goToPage = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  useTableKeyboardPagination(currentPage, totalPages, goToPage);

  return (
    <div className="space-y-6 pb-8">
      {/* Info Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-6 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Admin</h1>
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold rounded-sm border border-emerald-500/20 uppercase tracking-tight">Super Admin Restricted</span>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Manage system administrators and operators
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="admin"
            size="sm"
            className="h-9 px-4 text-[11px] font-bold shadow-sm uppercase tracking-widest"
          >
            <UserPlus size={14} className="mr-0" />
            Add Admin
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm rounded-md overflow-hidden flex flex-col bg-background">
        <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/5 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
            <Fingerprint size={14} />
            Admin Directory
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              {filteredAdmins.length} Admins Detected
            </span>
          </div>
        </CardHeader>

        {/* Toolbar: Pencarian */}
        <div className="p-3 border-b border-border/40 bg-background">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <input
              type="text"
              placeholder="SEARCH BY NAME OR EMAIL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 h-8 bg-muted/20 border border-border/50 rounded-md outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-[10px] font-bold tracking-tight"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto" ref={tableContainerRef}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/5 border-b">
                <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Name</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Email</th>
                <th className="px-4 py-2 text-center text-[10px] font-bold uppercase text-muted-foreground">Access Level</th>
                <th className="px-4 py-2 text-center text-[10px] font-bold uppercase text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-right text-[10px] font-bold uppercase text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin h-5 w-5 text-primary/50" />
                      <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Syncing records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedAdmins.length > 0 ? (
                paginatedAdmins.map((admin) => {
                  const isMe = admin.nim === currentUser?.nim;
                  return (
                    <tr key={admin.nim} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold tracking-tight text-foreground">
                          {admin.name} {isMe && <span className="ml-2 text-[9px] text-emerald-600 bg-emerald-500/10 px-1 py-0.5 rounded uppercase">[ Your account ]</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-mono text-muted-foreground/60">{admin.email}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {admin.role === 'super_admin' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-wide">
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 uppercase tracking-wide">
                            Operator
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center items-center">
                          <Switch
                            checked={admin.isActive}
                            disabled={isMe}
                            onCheckedChange={() => handleToggleStatus(admin)}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => setEditAdmin(admin)}
                          title="Edit Admin"
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={isMe}
                          onClick={() => handleDelete(admin)}
                          title="Delete Admin"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    No admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Halaman (Pagination) */}
        {!isLoading && totalPages > 1 && (
          <div className="px-4 py-2 border-t bg-muted/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Page {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => { e.stopPropagation(); goToPage(currentPage - 1); }}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={10} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => { e.stopPropagation(); goToPage(currentPage + 1); }}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={10} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      {isAddModalOpen && (
        <AddAdminModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => { setIsAddModalOpen(false); fetchAdmins(); }}
        />
      )}
      {editAdmin && (
        <EditAdminModal
          isOpen={true}
          onClose={() => setEditAdmin(null)}
          adminData={editAdmin}
          onSuccess={() => { setEditAdmin(null); fetchAdmins(); }}
        />
      )}
    </div>
  );
}
