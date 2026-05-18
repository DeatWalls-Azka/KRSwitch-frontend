import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// --- Types ----------------------------------------------------

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

// --- Komponen Utama -------------------------------------------

export default function AdminModal({ isOpen, onClose, title, subtitle, children }: AdminModalProps) {
  // Cegah scroll pada body pas modal lagi kebuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Latar belakang gelap */}
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel modal */}
      <div 
        className="relative w-full max-w-4xl h-[80vh] bg-background rounded-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-border/50"
      >
        {/* Bagian atas / Header */}
        <div className="p-4 px-6 border-b border-border/50 flex items-center justify-between shrink-0 bg-muted/5">
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight leading-none uppercase">{title}</h2>
            {subtitle && <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-1.5">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-background border border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5 transition-all active:scale-95"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Bagian isi / Konten */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
