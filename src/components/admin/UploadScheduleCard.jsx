import React, { useState, useRef } from 'react';
import api from '../../api';
import { 
  UploadCloud, 
  FileText, 
  CloudUpload, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export default function UploadScheduleCard({ onSuccess }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
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

    try {
      await api.post('/api/admin/upload-schedule', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus('success');
      setFile(null);
      if (onSuccess) onSuccess(); 
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage(err.response?.data?.error || 'Gagal mengunggah jadwal.');
    }
  };

  return (
    <Card className="h-full flex flex-col border-border shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 pb-6 border-b border-border/50 bg-muted/10">
        <div className="p-2 bg-primary/5 rounded-lg text-primary shrink-0">
          <UploadCloud size={18} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <CardTitle className="text-sm font-black uppercase tracking-tight">Upload Jadwal</CardTitle>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Update Data Master</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-6">
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
                  <p className="text-xs font-bold text-foreground">Pilih file CSV</p>
                  <p className="text-[9px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">Drag & drop di sini</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
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

          <Button 
            variant="admin"
            size="admin"
            onClick={handleUpload}
            disabled={!file || uploadStatus === 'loading'}
            className="w-full h-11"
          >
            {uploadStatus === 'loading' ? (
              <div className="flex items-center justify-center gap-2 uppercase">
                <Loader2 className="animate-spin h-4 w-4" />
                Processing...
              </div>
            ) : 'PROSES DATA SEKARANG'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
