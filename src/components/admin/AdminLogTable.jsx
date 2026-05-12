import React, { useState, useEffect } from 'react';
import api from '../../api'; // Pastikan path-nya benar

const AdminLogTable = () => {
    // 1. Siapkan state untuk menampung data log
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Tarik data dari backend saat komponen dimuat
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Asumsi: Gilang membuat endpoint GET /api/admin/logs
                const response = await api.get('/api/admin/logs');
                setLogs(response.data);
            } catch (error) {
                console.error("Gagal mengambil log aktivitas:", error);
                // Kalau API belum ada, fallback ke array kosong biar nggak crash
                setLogs([]); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Log Aktivitas Sistem</h3>
            <div className="overflow-x-auto">
                {/* 3. Tampilkan pesan loading kalau data belum datang */}
                {isLoading ? (
                    <div className="text-center py-8 text-slate-500 font-medium">Memuat data log...</div>
                ) : logs.length === 0 ? (
                    // Tampilkan pesan kosong kalau tidak ada log
                    <div className="text-center py-8 text-slate-500 font-medium italic">Belum ada aktivitas sistem yang tercatat.</div>
                ) : (
                    // Render tabel asli jika data sudah ada
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Waktu</th>
                                <th className="px-4 py-3">Aksi</th>
                                <th className="px-4 py-3">Pelaku</th>
                                <th className="px-4 py-3">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-slate-500 font-mono">
                                        {/* Format waktu agar lebih rapi */}
                                        {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-black tracking-widest">
                                            {log.action_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-700">{log.user_nim}</td>
                                    <td className="px-4 py-3 text-slate-600">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminLogTable;