import { useState, useRef } from 'react';
import api from '../../api';

export default function UploadScheduleCard({ onSuccess }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
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
    // Tambahkan flex flex-col dan h-full di sini
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <h2 className="text-sm font-bold mb-4 text-slate-800 uppercase tracking-wide border-b border-gray-100 pb-2">
        Upload Jadwal Baru (CSV)
      </h2>
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex-1 border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 
          file ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input type="file" ref={fileInputRef} onChange={(e) => validateAndSetFile(e.target.files[0])} accept=".csv" className="hidden" />
        <div className="flex flex-col items-center justify-center gap-2">
          {file ? (
            <div className="animate-in fade-in zoom-in duration-300">
              <p className="text-sm font-bold text-green-700">{file.name}</p>
              <p className="text-xs text-green-600 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <>
              {/* Ikon tambahan untuk mempercantik area yang diperbesar */}
              <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-500 font-semibold">Klik atau seret file CSV jadwal ke sini</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between min-h-[40px]">
        <div className="flex-1">
          {uploadStatus === 'error' && <p className="text-xs font-bold text-red-600 italic">⚠ {errorMessage}</p>}
          {uploadStatus === 'success' && <p className="text-xs font-bold text-green-600">✔ Jadwal diperbarui!</p>}
        </div>
        <button 
          onClick={handleUpload}
          disabled={!file || uploadStatus === 'loading'}
          className="ml-4 bg-slate-800 text-white px-6 py-2.5 rounded-md text-xs font-bold hover:bg-slate-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
        >
          {uploadStatus === 'loading' ? 'MEMPROSES...' : 'PROSES JADWAL'}
        </button>
      </div>
    </div>
  );
}