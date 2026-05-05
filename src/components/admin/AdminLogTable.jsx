import React from 'react';

// Data dummy agar tidak crash saat backend belum siap
const dummyLogs = [
    { id: 1, timestamp: new Date().toISOString(), action_type: "LOGIN", user_nim: "M0403241029", details: "Azka login ke sistem" },
    { id: 2, timestamp: new Date().toISOString(), action_type: "SYSTEM", user_nim: "ADMIN", details: "Database telah di-reset" }
];

const AdminLogTable = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Log Aktivitas Sistem</h3>
            <div className="overflow-x-auto">
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
                        {dummyLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-slate-500 font-mono">
                                    {new Date(log.timestamp).toLocaleTimeString()}
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
            </div>
        </div>
    );
};

export default AdminLogTable; // Pastikan ada baris export ini!