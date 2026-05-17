import React, { useState, useEffect } from 'react';
import api, { getSocketToken } from '../../api';
import io from 'socket.io-client';
import {
  Check,
  Users,
  Calendar,
  AlertCircle,
  Upload,
  Loader2,
  Trash2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export default function AdminWizardCard({ stats, onRefresh }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [draggingType, setDraggingType] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const [pendingFiles, setPendingFiles] = useState({ students: null, classes: null });
  const [validatedCounts, setValidatedCounts] = useState({ students: 0, classes: 0 });
  const [masterFiles, setMasterFiles] = useState({ students: false, classes: false });

  const fetchMasterFiles = async () => {
    try {
      const res = await api.get('/api/admin/master-files');
      setMasterFiles(res.data);
    } catch (err) {
      console.error('Failed to fetch master files status');
    }
  };

  useEffect(() => {
    fetchMasterFiles();

    // SOCKET REAL-TIME SYNC
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    getSocketToken().then(res => socket.emit('authenticate', res.data.token)).catch(console.error);
    socket.on('admin-master-files-updated', (data) => {
      fetchMasterFiles();
      onRefresh(); // To update stats
    });
    socket.on('admin-system-reset', () => {
      fetchMasterFiles();
      onRefresh();
      setActiveStep(0);
    });
    socket.on('admin-process-start', () => setIsProcessing(true));
    socket.on('admin-process-end', () => setIsProcessing(false));

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (stats) {
      const hasEnrollments = (stats.totalEnrollments || 0) > 0;
      if (hasEnrollments) setActiveStep(1);
      else setActiveStep(0);
    }
  }, [stats?.totalStudents === 0 && stats?.totalClasses === 0]);

  const handleFileValidate = async (type, file) => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = type === 'students' ? '/api/admin/import-students?validate=true' : '/api/admin/import-classes?validate=true';

    try {
      const res = await api.post(endpoint, formData);
      setPendingFiles(prev => ({ ...prev, [type]: file }));
      setValidatedCounts(prev => ({ ...prev, [type]: res.data.count }));
    } catch (err) {
      setError(err.response?.data?.error || `Format file ${type} tidak valid.`);
      setPendingFiles(prev => ({ ...prev, [type]: null }));
      setValidatedCounts(prev => ({ ...prev, [type]: 0 }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrashMaster = async (type) => {
    if (pendingFiles[type]) {
      setPendingFiles(prev => ({ ...prev, [type]: null }));
      setValidatedCounts(prev => ({ ...prev, [type]: 0 }));
      return;
    }
    if (!window.confirm(`Hapus data ${type} permanen?`)) return;
    setIsProcessing(true);
    try {
      await api.delete(`/api/admin/master-files/${type}`);
      await fetchMasterFiles();
      onRefresh();
    } catch (err) {
      setError('Gagal menghapus file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitAndRandomize = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const hasNewFiles = pendingFiles.students || pendingFiles.classes;
      const hasEnrollments = (stats?.totalEnrollments || 0) > 0;

      // 1. Handle File Uploads if any
      if (pendingFiles.students) {
        const studentData = new FormData();
        studentData.append('file', pendingFiles.students);
        await api.post('/api/admin/import-students', studentData);
      }
      if (pendingFiles.classes) {
        const classData = new FormData();
        classData.append('file', pendingFiles.classes);
        await api.post('/api/admin/import-classes', classData);
      }

      // 2. Only Randomize if we have new files OR no existing enrollments
      // This prevents accidental re-randomization when clicking "System Ready" on existing data
      if (hasNewFiles || !hasEnrollments) {
        await api.post('/api/admin/seed-random');
      }
      
      onRefresh();
      await fetchMasterFiles();
      setPendingFiles({ students: null, classes: null });
      setValidatedCounts({ students: 0, classes: 0 });
      setActiveStep(1);
    } catch (err) {
      setError('Gagal menyimpan data.');
      onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDraggingType(null);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFileValidate(type, file);
  };

  const handleManualRandomize = async () => {
    setIsProcessing(true);
    try {
      await api.post('/api/admin/seed-random');
      onRefresh();
    } catch (err) {
      setError('Gagal randomisasi');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFullReset = async () => {
    if (!window.confirm('Reset sistem ke nol?')) return;
    setIsProcessing(true);
    try {
      await api.post('/api/admin/reset', { confirm: 'RESET_ALL_DATA' });
      onRefresh();
      await fetchMasterFiles();
      setActiveStep(0);
    } catch (err) {
      setError('Gagal reset');
    } finally {
      setIsProcessing(false);
    }
  };

  const isStep0Ready = () => (masterFiles.students || validatedCounts.students > 0) && (masterFiles.classes || validatedCounts.classes > 0);

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
                  className={`text-[9px] font-bold uppercase tracking-tight transition-all hover:opacity-80 ${
                    activeStep === step ? 'text-emerald-600' : 'text-muted-foreground/50 hover:text-muted-foreground'
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
        {/* Error fixed height area */}
        <div className="h-4 mb-2">
          {error && (
            <div className="p-1 bg-destructive/10 text-destructive text-[9px] flex items-center gap-2 rounded border border-destructive/20 animate-in fade-in">
              <AlertCircle size={10} /> {error}
            </div>
          )}
        </div>

        {/* Constant Content Area */}
        <div className="w-full max-w-2xl mx-auto h-[170px] overflow-hidden">
          {activeStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
              {['students', 'classes'].map((type) => (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 uppercase text-[10px] font-bold text-muted-foreground">
                      {type === 'students' ? <Users size={12} /> : <Calendar size={12} />}
                      {type}
                    </div>
                    {(masterFiles[type] || pendingFiles[type]) && (
                      <button onClick={() => handleTrashMaster(type)} className="text-destructive/50 hover:text-destructive transition-colors"><Trash2 size={12} /></button>
                    )}
                  </div>
                  <div onDragOver={(e) => { e.preventDefault(); setDraggingType(type); }} onDragLeave={() => setDraggingType(null)} onDrop={(e) => handleDrop(e, type)}
                    className={`group relative py-7 border-2 rounded-md transition-all flex flex-col items-center justify-center space-y-1 ${draggingType === type ? 'border-primary bg-primary/5' :
                      (masterFiles[type] || pendingFiles[type]) ? 'border-emerald-500/30 bg-emerald-500/5 border-solid' : 'border-dashed border-border bg-muted/10 hover:bg-muted/20'
                      }`}
                  >
                    {(masterFiles[type] || pendingFiles[type]) ? (
                      <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <Check size={20} className="text-emerald-600 animate-in zoom-in" strokeWidth={3} />
                      </div>
                    ) : (
                      <Upload size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                    <p className={`text-[11px] font-bold ${(masterFiles[type] || pendingFiles[type]) ? 'text-emerald-700' : 'text-foreground/70'}`}>
                      {pendingFiles[type] ? 'Ready to Commit' : masterFiles[type] ? 'Master Loaded' : 'Drop CSV'}
                    </p>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv" onChange={(e) => handleFileValidate(type, e.target.files[0])} disabled={isProcessing} />
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => window.open(`${api.defaults.baseURL}/api/admin/template/${type}`, '_blank')}
                      className="text-[9px] text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
                    >
                      Download Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeStep === 1 && (
            <div className="py-2 space-y-4 animate-in fade-in duration-300 max-w-lg mx-auto">
              <div className="flex items-center gap-4 p-4 border rounded-md bg-emerald-500/5 border-emerald-500/10">
                <div className="h-8 w-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/10">
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-emerald-700 uppercase tracking-tight">System Operational</h4>
                  <p className="text-[11px] text-emerald-600/70 mt-1 font-medium">{stats?.totalEnrollments} enrollments live.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-9 text-[10px] font-bold shadow-none" onClick={handleManualRandomize} disabled={isProcessing}>Re-randomize</Button>
                <Button variant="ghost" size="sm" className="flex-1 h-9 text-[10px] font-bold text-destructive/70 hover:text-destructive border border-destructive/10 bg-destructive/5" onClick={handleFullReset} disabled={isProcessing}>Reset All</Button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer (No Divider) */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <Button variant="ghost" size="sm" disabled={activeStep === 0 || isProcessing} onClick={() => setActiveStep(prev => prev - 1)} className="h-8 text-[11px] font-bold px-3">
            <ChevronLeft size={14} className="mr-1" /> Back
          </Button>
          {activeStep === 0 && (
            <Button variant="admin" size="sm" disabled={!isStep0Ready() || isProcessing} onClick={handleCommitAndRandomize} className="h-8 text-[11px] font-bold px-6">
              {isProcessing ? <Loader2 className="animate-spin" size={14} /> : (pendingFiles.students || pendingFiles.classes ? 'Commit' : 'System Ready')}
              <ChevronRight size={14} className="ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
