import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useSocketContext } from '../../context/SocketContext';
import {
  Check,
  AlertCircle,
  Upload,
  Loader2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface AdminWizardCardProps {
  stats: {
    totalStudents: number;
    totalClasses: number;
    totalEnrollments: number;
    totalOffers: number;
  } | null;
  onRefresh: () => void;
}

interface PendingFiles {
  classes: File | null;
  enrollments: File | null;
}

export default function AdminWizardCard({ stats, onRefresh }: AdminWizardCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<'classes' | 'enrollments' | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<PendingFiles>({ classes: null, enrollments: null });

  const { socket } = useSocketContext();
  const onRefreshRef = React.useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!socket) return;

    const handleSystemReset = () => {
      onRefreshRef.current();
      setActiveStep(0);
      setPendingFiles({ classes: null, enrollments: null });
    };

    const handleProcessStart = () => setIsProcessing(true);
    const handleProcessEnd = () => setIsProcessing(false);

    socket.on('admin-system-reset', handleSystemReset);
    socket.on('admin-process-start', handleProcessStart);
    socket.on('admin-process-end', handleProcessEnd);

    return () => {
      socket.off('admin-system-reset', handleSystemReset);
      socket.off('admin-process-start', handleProcessStart);
      socket.off('admin-process-end', handleProcessEnd);
    };
  }, [socket]);

  useEffect(() => {
    if (stats) {
      const hasEnrollments = (stats.totalEnrollments || 0) > 0;
      if (hasEnrollments) setActiveStep(1);
      else setActiveStep(0);
    }
  }, [stats?.totalEnrollments, stats?.totalStudents, stats?.totalClasses]);

  const handleFileSelect = (type: 'classes' | 'enrollments', file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Hanya file CSV yang diizinkan.');
      return;
    }
    setPendingFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleCommit = async () => {
    if (!pendingFiles.classes || !pendingFiles.enrollments) {
      setError('Harap masukkan kedua file CSV (Jadwal Kelas dan Data Phase 1) untuk diimpor.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Always import classes first so schedules are in place
      if (pendingFiles.classes) {
        const formData = new FormData();
        formData.append('file', pendingFiles.classes);
        await api.post('/api/admin/import-classes', formData);
      }

      // 2. Import Phase 2 Enrollments (will map to the classes just uploaded)
      if (pendingFiles.enrollments) {
        const formData = new FormData();
        formData.append('file', pendingFiles.enrollments);
        await api.post('/api/admin/import-phase2', formData);
      }

      onRefresh();
      setPendingFiles({ classes: null, enrollments: null });
      setActiveStep(1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengimpor data Phase 2.');
      onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'classes' | 'enrollments') => {
    e.preventDefault();
    setDraggingType(null);
    const file = e.dataTransfer.files[0];
    handleFileSelect(type, file);
  };

  return (
    <Card className="h-full border-border/50 shadow-sm rounded-md bg-background flex flex-col overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/5 space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            Setup Wizard: {activeStep === 0 ? 'Data Initialization' : 'System Operational'}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {[0, 1].map((step) => (
              <div key={step} className="flex items-center gap-1.5">
                <button
                  onClick={() => !isProcessing && setActiveStep(step)}
                  disabled={isProcessing}
                  className={`text-[9px] font-bold uppercase tracking-tight transition-all hover:opacity-80 ${activeStep === step ? 'text-emerald-600' : 'text-muted-foreground/50 hover:text-muted-foreground'
                    }`}
                >
                  Step {step + 1}
                </button>
                {step === 0 && <div className="h-px w-3 bg-border/50" />}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Error Message Area */}
        <div className="h-4 mb-2">
          {error && (
            <div className="p-1 bg-destructive/10 text-destructive text-[9px] flex items-center gap-2 rounded border border-destructive/20 animate-in fade-in">
              <AlertCircle size={10} /> {error}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-full max-w-2xl mx-auto h-[170px] overflow-hidden">
          {activeStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">

              {/* Dropzone 1: Classes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 uppercase text-[10px] font-bold text-muted-foreground">
                    <Calendar size={12} /> Course Schedules (CSV)
                  </div>
                  {pendingFiles.classes && (
                    <button
                      onClick={() => setPendingFiles(prev => ({ ...prev, classes: null }))}
                      className="text-destructive/50 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDraggingType('classes'); }}
                  onDragLeave={() => setDraggingType(null)}
                  onDrop={(e) => handleDrop(e, 'classes')}
                  className={`group relative py-7 border-2 rounded-md transition-all flex flex-col items-center justify-center space-y-1 ${draggingType === 'classes'
                      ? 'border-primary bg-primary/5'
                      : pendingFiles.classes
                        ? 'border-emerald-500/30 bg-emerald-500/5 border-solid'
                        : 'border-dashed border-border bg-muted/10 hover:bg-muted/20'
                    }`}
                >
                  {pendingFiles.classes ? (
                    <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <Check size={20} className="text-emerald-600 animate-in zoom-in" strokeWidth={3} />
                    </div>
                  ) : (
                    <Upload size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                  <p className={`text-[11px] font-bold ${pendingFiles.classes ? 'text-emerald-700' : 'text-foreground/70'}`}>
                    {pendingFiles.classes ? pendingFiles.classes.name : ((stats?.totalClasses || 0) > 0 ? 'Replace Schedule CSV' : 'Drop Schedule CSV')}
                  </p>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".csv"
                    onChange={(e) => handleFileSelect('classes', e.target.files?.[0])}
                    disabled={isProcessing}
                  />
                </div>
                <div className="text-[9px] text-muted-foreground text-center mt-1">
                  {(stats?.totalClasses || 0) > 0 ? 'Schedules currently loaded. Drop file to replace.' : 'Upload first to ensure proper Day/Time/Room data.'}
                </div>
              </div>

              {/* Dropzone 2: Enrollments */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 uppercase text-[10px] font-bold text-muted-foreground">
                    <Users size={12} /> Phase 1 Export (CSV)
                  </div>
                  {pendingFiles.enrollments && (
                    <button
                      onClick={() => setPendingFiles(prev => ({ ...prev, enrollments: null }))}
                      className="text-destructive/50 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDraggingType('enrollments'); }}
                  onDragLeave={() => setDraggingType(null)}
                  onDrop={(e) => handleDrop(e, 'enrollments')}
                  className={`group relative py-7 border-2 rounded-md transition-all flex flex-col items-center justify-center space-y-1 ${draggingType === 'enrollments'
                      ? 'border-primary bg-primary/5'
                      : pendingFiles.enrollments
                        ? 'border-emerald-500/30 bg-emerald-500/5 border-solid'
                        : 'border-dashed border-border bg-muted/10 hover:bg-muted/20'
                    }`}
                >
                  {pendingFiles.enrollments ? (
                    <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <Check size={20} className="text-emerald-600 animate-in zoom-in" strokeWidth={3} />
                    </div>
                  ) : (
                    <Upload size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                  <p className={`text-[11px] font-bold ${pendingFiles.enrollments ? 'text-emerald-700' : 'text-foreground/70'}`}>
                    {pendingFiles.enrollments ? pendingFiles.enrollments.name : ((stats?.totalEnrollments || 0) > 0 ? 'Replace Phase 1 CSV' : 'Drop Phase 1 CSV')}
                  </p>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".csv"
                    onChange={(e) => handleFileSelect('enrollments', e.target.files?.[0])}
                    disabled={isProcessing}
                  />
                </div>
                <div className="text-[9px] text-muted-foreground text-center mt-1 text-destructive/80 font-medium">
                  {(stats?.totalEnrollments || 0) > 0 ? 'System populated. Mengimpor ulang akan MENGHAPUS semua data!' : 'Mengimpor ini akan MENGHAPUS semua data enrollments/barter lama!'}
                </div>
              </div>

            </div>
          )}

          {activeStep === 1 && (
            <div className="py-2 space-y-4 animate-in fade-in duration-300 max-w-lg mx-auto h-full flex flex-col justify-center">
              <div className="flex items-center gap-4 p-4 border rounded-md bg-emerald-500/5 border-emerald-500/10">
                <div className="h-8 w-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/10">
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-emerald-700 uppercase tracking-tight">System Operational</h4>
                  <p className="text-[11px] text-emerald-600/70 mt-1 font-medium">{stats?.totalEnrollments} enrollments live.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={activeStep === 0 || isProcessing}
            onClick={() => setActiveStep(prev => prev - 1)}
            className="h-8 text-[11px] font-bold px-3"
          >
            <ChevronLeft size={14} className="mr-1" /> Back
          </Button>
          {activeStep === 0 && (
            <Button
              variant="admin"
              size="sm"
              disabled={(!pendingFiles.classes || !pendingFiles.enrollments) || isProcessing}
              onClick={handleCommit}
              className="h-8 text-[11px] font-bold px-6"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={14} /> : 'Commit'}
              <ChevronRight size={14} className="ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
