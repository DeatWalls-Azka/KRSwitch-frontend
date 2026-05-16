import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';

const StatRow = ({ label, value, isEmerald }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{label}</span>
    <span className={`text-[12px] font-mono font-bold ${isEmerald ? 'text-emerald-600' : 'text-foreground'}`}>{value}</span>
  </div>
);

export default function SystemStatsCard({ stats }) {
  return (
    <Card className="h-full border-border/50 shadow-sm rounded-md bg-background flex flex-col">
      <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/5 space-y-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col justify-center">
        <StatRow 
          label="Total Students" 
          value={(stats?.totalStudents || 0).toLocaleString()} 
        />
        <StatRow 
          label="Active Classes" 
          value={(stats?.totalClasses || 0).toLocaleString()} 
        />
        <StatRow 
          label="KRS Enrollments" 
          value={(stats?.totalEnrollments || 0).toLocaleString()} 
          isEmerald={true}
        />
        <StatRow 
          label="Active Barters" 
          value={stats?.activeOffers || 0}
        />
        <StatRow 
          label="Successful Swaps" 
          value={stats?.successfulTrades || 0}
          isEmerald={true}
        />
      </CardContent>
    </Card>
  );
}