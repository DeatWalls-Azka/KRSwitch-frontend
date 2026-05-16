import React, { useState, useRef } from 'react';
import api from '../../api';
import { 
  UploadCloud, 
  FileText, 
  CloudUpload, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Download,
  Users,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export default function ImportDataCard({ onSuccess }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('classes'); // 'students' or 'classes'
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setUploadStatus('idle');
      setErrorMessage('');
    } else {
      setFile(null);
      setErrorMessage('Format file tidak valid. Harap unggah file .csv');
      setUploadStatus('error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadStatus('loading');
    
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = importType === 'students' ? '/api/admin/import-students' : '/api/admin/import-classes';

    try {
      await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus('success');
      setFile(null);
      if (onSuccess) onSuccess(); 
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage(err.response?.data?.error || 'Gagal mengunggah data.');
    }
  };

  const downloadTemplate = (type) => {
    window.open(`${api.defaults.baseURL}/api/admin/template/${type}`, '_blank');
  };

  return (
    <Card className="h-full flex flex-col border-border shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-6 border-b border-border/50 bg-muted/10">
        <div className="p-2 bg-primary/5 rounded-lg text-primary shrink-0">
          <UploadCloud size={18} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <CardTitle className="text-sm font-black uppercase tracking-tight">Import Data Master</CardTitle>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Update Mahasiswa & Jadwal</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-6">
        {/* Toggle Type */}
        <div className="flex bg-muted p-1 rounded-lg mb-6">
          <button 
            onClick={() => { setImportType('students'); setFile(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-black uppercase transition-all ${importType === 'students' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Users size={14} />
            Mahasiswa
          </button>
          <button 
            onClick={() => { setImportType('classes'); setFile(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-black uppercase transition-all ${importType === 'classes' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Calendar size={14} />
            Jadwal
          </button>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group ${
            isDragging ? 'border-primary bg-primary/5' : 
            file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-muted/50'
          }`}
        >
          <input type="file" ref={fileInputRef} onChange={(e) => validateAndSetFile(e.target.files[0])} accept=".csv" className="hidden" />
          
          <div className="flex flex-col items-center justify-center gap-3">
            {file ? (
              <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-2 shadow-sm">
                  <FileText size={18} strokeWidth={3} />
                </div>
                <p className="text-xs font-black text-foreground truncate max-w-[150px]">{file.name}</p>
                <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  <CloudUpload size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Upload CSV {importType === 'students' ? 'Mahasiswa' : 'Jadwal'}</p>
                  <p className="text-[9px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">Drag & drop di sini</p>
                </div>
              </>
            )}
          </div>
        </div>

        {importType === 'classes' ? (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertCircle size={12} />
              Quick Cheatsheet: Day Mapping
            </p>
            <div className="grid grid-cols-4 gap-y-2 gap-x-1">
              {[
                ['1', 'Senin'], ['2', 'Selasa'], ['3', 'Rabu'], ['4', 'Kamis'],
                ['5', 'Jumat'], ['6', 'Sabtu'], ['7', 'Minggu']
              ].map(([num, day]) => (
                <div key={num} className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center">{num}</span>
                  <span className="text-[9px] font-bold text-foreground/70 uppercase">{day}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-2">
              <AlertCircle size={12} />
              Penting: Format Template
            </p>
            <p className="text-[9px] font-bold text-amber-600/70 uppercase leading-relaxed">
              Pastikan Anda menggunakan template resmi di bawah agar sistem dapat mengenali NIM, Nama, dan Email secara akurat.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 text-[10px] h-9 font-black uppercase tracking-tight gap-2"
              onClick={() => downloadTemplate(importType)}
            >
              <Download size={14} />
              Template
            </Button>
            <Button 
              variant="admin"
              onClick={handleUpload}
              disabled={!file || uploadStatus === 'loading'}
              className="flex-[2] h-9 text-[10px] font-black uppercase"
            >
              {uploadStatus === 'loading' ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-3 w-3" />
                  Processing...
                </div>
              ) : 'PROSES DATA'}
            </Button>
          </div>

          {(uploadStatus === 'error' || uploadStatus === 'success') && (
            <div className={`p-3 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 border ${
              uploadStatus === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            }`}>
              <div className="shrink-0">
                {uploadStatus === 'error' ? (
                  <AlertCircle size={14} strokeWidth={3} />
                ) : (
                  <CheckCircle2 size={14} strokeWidth={3} />
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-tight">{errorMessage || (uploadStatus === 'success' && 'Data master berhasil diperbarui')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
