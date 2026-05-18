import React, { useEffect } from 'react';
import AdminLogTable from '../components/admin/AdminLogTable';

export default function AuditLogPage() {
  useEffect(() => {
    document.title = 'KRSwitch | Audit Log';
  }, []);
  return (
    <div className="space-y-6 pb-8">
      {/* Bagian Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-6 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Log Aktivitas Admin</h1>
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold rounded-sm border border-emerald-500/20 uppercase tracking-tight">Audit Trail</span>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">System audit trail and administrative action logs</p>
        </div>
      </div>

      {/* Log Table Section */}
      <div className="w-full">
        <AdminLogTable />
      </div>
    </div>
  );
}
