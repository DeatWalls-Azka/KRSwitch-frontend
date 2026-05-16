import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';

const StatRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
    <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
    <span className="text-[12px] font-bold text-foreground">{value}</span>
  </div>
);

export default function SystemStatsCard({ stats }) {
  return (
    <Card className="h-full border-border shadow-sm rounded-md">
      <CardHeader className="py-3 px-4 border-b bg-muted/5">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          System Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-0">
        <StatRow 
          label="Total Students" 
          value={(stats?.totalStudents || 0).toLocaleString()} 
        />
        <StatRow 
          label="Active Classes" 
          value={(stats?.totalClasses || 0).toLocaleString()} 
        />
        <StatRow 
          label="Total Enrollments" 
          value={(stats?.totalEnrollments || 0).toLocaleString()} 
        />
        <StatRow 
          label="Open Offers" 
          value={stats?.activeOffers || 0}
        />
        <StatRow 
          label="Completed Trades" 
          value={stats?.successfulTrades || 0}
        />
      </CardContent>
    </Card>
  );
}