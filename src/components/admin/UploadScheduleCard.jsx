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
    formData.append('scheduleFile', file);

    try {
      await api.post('/api/admin/upload-schedule', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus('success');
      setFile(null);
      if (onSuccess) onSuccess(); // Panggil fungsi refresh di parent
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage(err.response?.data?.error || 'Gagal mengunggah jadwal.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-sm font-bold mb-4 text-slate-800 uppercase tracking-wide border-b border-gray-100 pb-2">Upload Jadwal Baru (CSV)</h2>
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 
          file ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input type="file" ref={fileInputRef} onChange={(e) => validateAndSetFile(e.target.files[0])} accept=".csv" className="hidden" />
        <div className="flex flex-col items-center justify-center gap-2">
          {file ? (
            <div>
              <p className="text-sm font-bold text-green-700">{file.name}</p>
              <p className="text-xs text-green-600 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 font-semibold mt-2">Klik atau seret file CSV jadwal ke sini</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between min-h-[40px]">
        <div className="flex-1">
          {uploadStatus === 'error' && <p className="text-xs font-bold text-red-600">⚠ {errorMessage}</p>}
          {uploadStatus === 'success' && <p className="text-xs font-bold text-green-600">✔ Jadwal berhasil diperbarui!</p>}
        </div>
        <button 
          onClick={handleUpload}
          disabled={!file || uploadStatus === 'loading'}
          className="ml-4 bg-slate-400 text-white px-6 py-2.5 rounded-md text-xs font-bold hover:bg-slate-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {uploadStatus === 'loading' ? 'MEMPROSES...' : 'PROSES JADWAL'}
        </button>
      </div>
    </div>
  );
}