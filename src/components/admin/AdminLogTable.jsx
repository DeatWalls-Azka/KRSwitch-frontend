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
        
        // Listen to all events that should refresh the log table
        socket.on('admin-log-created', (newLog) => {
            setLogs(prev => [newLog, ...prev]);
        });

        socket.on('admin-system-reset', () => {
            fetchLogs();
            setCurrentPage(1);
        });

        return () => socket.disconnect();
    }, []);

    const filteredLogs = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        const safeLogs = Array.isArray(logs) ? logs : [];
        if (!q) return safeLogs;
        return safeLogs.filter(log => 
            (log.action_type || '').toLowerCase().includes(q) ||
            (log.user_nim || '').toLowerCase().includes(q) ||
            (log.details || '').toLowerCase().includes(q)
        );
    }, [logs, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const getActionColor = (action) => {
        const a = action.toLowerCase();
        if (a.includes('delete') || a.includes('reset') || a.includes('cancel')) return 'bg-destructive/5 text-destructive border-destructive/20';
        if (a.includes('import') || a.includes('create') || a.includes('random')) return 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20';
        if (a.includes('update') || a.includes('edit')) return 'bg-amber-500/5 text-amber-600 border-amber-500/20';
        if (a.includes('barter')) return 'bg-primary/5 text-primary border-primary/20';
        return 'bg-muted text-muted-foreground border-border';
    };

    return (
        <Card className="border-border/50 shadow-sm rounded-md overflow-hidden flex flex-col bg-background">
            <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/5 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    Activity Log / Audit Trail
                </CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        {filteredLogs.length} Records Detected
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
                        placeholder="SEARCH AUDIT TRAIL..."
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
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader2 className="inline-block animate-spin h-5 w-5 text-primary/50 mb-2" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Syncing Audit Trail...</p>
                    </div>
                ) : paginatedLogs.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <p className="text-[11px] font-bold text-muted-foreground">
                            {searchQuery ? 'No results found.' : 'No activity logged yet.'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/5 border-b">
                                <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground w-20">Time</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground w-28">Action</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground w-32">User</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase text-muted-foreground">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {paginatedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-muted/5 transition-colors">
                                    <td className="px-4 py-2">
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-[11px] font-bold">{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase">{new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border uppercase tracking-tight ${getActionColor(log.action_type)}`}>
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="text-[11px] font-mono font-bold text-muted-foreground">{log.user_nim}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <p className="text-[11px] text-foreground/80 leading-relaxed max-w-md truncate">
                                            {log.details}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={10} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={10} />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default AdminLogTable;
