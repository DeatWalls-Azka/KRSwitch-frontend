export default function SystemStatsCard({ stats }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
      <h2 className="text-sm font-bold mb-4 text-slate-800 uppercase tracking-wide border-b border-gray-100 pb-2">
        Status Sistem
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded border border-gray-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Mahasiswa</span>
          <span className="font-mono text-sm font-bold text-slate-900">{stats.totalStudents || 0}</span>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded border border-gray-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Kelas</span>
          <span className="font-mono text-sm font-bold text-slate-900">{stats.totalClasses || 0}</span>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded border border-blue-100">
          <span className="text-[11px] font-bold text-blue-600 uppercase">Barter Aktif</span>
          <span className="font-mono text-sm font-bold text-blue-700">{stats.activeOffers || 0}</span>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-green-50 rounded border border-green-100">
          <span className="text-[11px] font-bold text-green-600 uppercase">Tukar Berhasil</span>
          <span className="font-mono text-sm font-bold text-green-700">{stats.successfulTrades || 0}</span>
        </div>
      </div>
    </div>
  );
}