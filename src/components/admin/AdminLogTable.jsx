import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import { 
    ClipboardList, 
    Inbox, 
    Loader2, 
    Search, 
    X, 
    ChevronLeft, 
    ChevronRight 
} from 'lucide-react';
import io from 'socket.io-client';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const PAGE_SIZE = 10;

const AdminLogTable = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/api/admin/logs');
            setLogs(response.data);
        } catch (error) {
            console.error("Gagal mengambil log aktivitas:", error);
            setLogs([]); 
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        const socket = io('http://localhost:5000');
        
        socket.on('offer-taken', fetchLogs);
        socket.on('enrollments-swapped', fetchLogs);

        return () => socket.disconnect();
    }, []);

    // Search Filtering
    const filteredLogs = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return logs;
        return logs.filter(log => 
            (log.action_type || '').toLowerCase().includes(q) ||
            (log.user_nim || '').toLowerCase().includes(q) ||
            (log.details || '').toLowerCase().includes(q)
        );
    }, [logs, searchQuery]);

    // Reset page when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const getActionColor = (action) => {
        const a = action.toLowerCase();
        if (a.includes('delete') || a.includes('purge') || a.includes('remove')) return 'bg-destructive/10 text-destructive border-destructive/20';
        if (a.includes('create') || a.includes('add') || a.includes('upload')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        if (a.includes('update') || a.includes('edit')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        return 'bg-primary/10 text-primary border-primary/20';
    };

    return (
        <Card className="border-border shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/10 p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary shrink-0">
                        <ClipboardList size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <CardTitle className="text-sm font-black uppercase tracking-tight">Log Aktivitas Sistem</CardTitle>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Audit Trail Real-time</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-md">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dataset</span>
                        <span className="text-[10px] font-black text-foreground">{filteredLogs.length} Entri</span>
                    </div>
                </div>
            </CardHeader>

            {/* Toolbar: Search */}
            <div className="p-4 border-b border-border bg-background flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari aktivitas, NIM, atau detail..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all text-xs font-medium"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={14} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                {isLoading ? (
                    <div className="text-center py-20">
                        <Loader2 className="inline-block animate-spin h-6 w-6 text-primary mb-3" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sinkronisasi Audit Trail...</p>
                    </div>
                ) : paginatedLogs.length === 0 ? (
                    <div className="text-center py-20 px-6">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                            <Inbox size={24} strokeWidth={1.5} />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground">
                            {searchQuery ? 'Hasil pencarian tidak ditemukan.' : 'Belum ada aktivitas yang tercatat dalam sistem.'}
                        </p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="w-24">Waktu</th>
                                <th className="w-32">Tipe Aksi</th>
                                <th className="w-40">User</th>
                                <th>Deskripsi Aktivitas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-foreground">
                                                {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                                {new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-tight ${getActionColor(log.action_type)}`}>
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[9px] font-black text-muted-foreground border border-border">
                                                {log.user_nim?.substring(0, 1) || 'A'}
                                            </div>
                                            <span className="text-xs font-bold font-mono text-foreground tracking-tight">{log.user_nim}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                            {log.details}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Footer */}
            {!isLoading && totalPages > 1 && (
                <div className="px-6 py-3 bg-muted/10 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Hal {currentPage} / {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={14} strokeWidth={3} />
                        </Button>
                        <div className="text-xs font-black w-8 text-center">{currentPage}</div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={14} strokeWidth={3} />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default AdminLogTable;
