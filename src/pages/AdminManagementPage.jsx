import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import io from 'socket.io-client';

import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const PAGE_SIZE = 15;

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => { 
    fetchAdmins(); 

    const socket = io('http://localhost:5000');
    // For now we use the same events or general refresh
    socket.on('admin-user-created', fetchAdmins);
    socket.on('admin-user-updated', fetchAdmins);
    socket.on('admin-user-deleted', fetchAdmins);

    return () => socket.disconnect();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(a =>
      a.name.toLowerCase().includes(q) || a.nim.toLowerCase().includes(q)
    );
  }, [admins, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  return (
    <div className="space-y-6 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-6 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Database Admin</h1>
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold rounded-sm border border-emerald-500/20 uppercase tracking-tight">Privileged Access</span>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Management of administrative accounts and system permissions</p>
        </div>
      </div>

      {/* Toolbar: Search + Stats Integrated into Card */}
      <Card className="border-border/50 shadow-sm rounded-md overflow-hidden flex flex-col bg-background">
        <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/5 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            Admin Management / Authority Directory
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              {filtered.length} Admins Detected
            </span>
          </div>
        </CardHeader>

        {/* Toolbar: Search */}
        <div className="p-3 border-b border-border/40 bg-background">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <input
              type="text"
              placeholder="SEARCH BY NIM OR NAME..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 h-8 bg-muted/20 border border-border/50 rounded-md outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-[10px] font-bold tracking-tight"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/5 border-b">
                <th className="w-12 py-2 text-center text-[10px] font-bold uppercase text-muted-foreground">#</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Admin Identity</th>
                <th className="hidden md:table-cell px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Admin ID (NIM)</th>
                <th className="hidden lg:table-cell px-4 py-2 text-center text-[10px] font-bold uppercase text-muted-foreground">Access Level</th>
                <th className="px-4 py-2 text-right text-[10px] font-bold uppercase text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin h-5 w-5 text-primary/50" />
                      <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Syncing authority records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((admin, index) => (
                  <tr 
                    key={admin.nim} 
                    className="group transition-colors hover:bg-muted/5"
                  >
                    <td className="py-2 text-center">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/60">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-[8px] font-bold text-emerald-600 border border-emerald-500/20">
                          {admin.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-bold tracking-tight text-foreground">
                          {admin.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-2">
                      <span className="text-[11px] font-mono font-bold text-muted-foreground">{admin.nim}</span>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-2 text-center">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-primary/5 text-primary border border-primary/20 uppercase tracking-tighter">
                        Full Administrator
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={24} strokeWidth={1} className="opacity-20 text-primary" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No matching admins found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={10} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={10} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
