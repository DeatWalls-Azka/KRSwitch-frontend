import React, { useState, useEffect } from 'react';
import { takeOffer, deleteOffer } from '../../api';

// --- Types ----------------------------------------------------

interface EnrichedOffer {
  id: number;
  nim: string;
  studentName: string;
  seekingCourse: string;
  seekingCourseName: string;
  offeringClass: string;
  seekingClass: string;
}

interface User {
  id: number;
  nim: string;
  name: string;
  role: 'student' | 'admin' | 'operator' | 'super_admin';
}

interface TradeConfirmationModalProps {
  offer: EnrichedOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (id: number) => void;
  onCancel?: (id: number) => void;
  currentUser: User | null;
  mode?: 'accept' | 'cancel';
  socketRef?: React.MutableRefObject<any>;
}

// --- Komponen Utama -------------------------------------------

export default function TradeConfirmationModal({
  offer,
  isOpen,
  onClose,
  onAccept,
  onCancel,
  currentUser,
  mode = 'accept',
  socketRef,
}: TradeConfirmationModalProps) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const isCancel = mode === 'cancel';

  useEffect(() => {
    if (!isOpen || !offer?.id) return;

    const socket = socketRef?.current;
    if (!socket) return;

    const handleOfferTaken = ({ offerId }: { offerId: number }) => {
      if (offerId === offer.id && !isProcessing && !successMessage) {
        setIsAvailable(false);
        setErrorMessage('Penawaran sudah diambil orang lain');
        setIsProcessing(false);
      }
    };

    socket.on('offer-taken', handleOfferTaken);

    // Hanya matikan pendengar, jangan lepaskan koneksi soket bersama
    return () => socket.off('offer-taken', handleOfferTaken);
  }, [isOpen, offer?.id, isProcessing, successMessage, socketRef]);

  useEffect(() => {
    if (!isOpen) {
      setIsAvailable(true);
      setIsProcessing(false);
      setErrorMessage('');
      setSuccessMessage('');
      setIsClosing(false);
      setShowMessage(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (errorMessage || successMessage) setShowMessage(true);
  }, [errorMessage, successMessage]);

  const handleAccept = async () => {
    if (!isAvailable || isProcessing || !offer?.id || !currentUser) return;

    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');
    setShowMessage(false);

    try {
      await takeOffer(offer.id, currentUser.nim);
      onAccept(offer.id);
      setIsAvailable(false);
      setSuccessMessage('Pertukaran berhasil diselesaikan!');
    } catch (err: any) {
      setIsAvailable(false);
      setErrorMessage(err.response?.data?.error || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOffer = async () => {
    if (!isAvailable || isProcessing || !offer?.id) return;

    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');
    setShowMessage(false);

    try {
      await deleteOffer(offer.id);
      if (onCancel) onCancel(offer.id);
      setIsAvailable(false);
      setSuccessMessage('Penawaran berhasil dibatalkan!');

      // Tutup otomatis setelah 1 detik jika berhasil
      setTimeout(() => handleClose(), 1000);
    } catch (err: any) {
      setIsAvailable(false);
      setErrorMessage(err.response?.data?.error || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrimaryAction = () => {
    if (isCancel) {
      handleCancelOffer();
    } else {
      handleAccept();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 150);
  };

  const handleBackdropClick = () => { if (!isProcessing) handleClose(); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isProcessing) handleClose();
    if (e.key === 'Enter' && isAvailable && !isProcessing) handlePrimaryAction();
  };

  if (!isOpen) return null;

  const primaryButtonColor = isCancel
    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
    : 'bg-green-600 hover:bg-green-700 active:bg-green-800';

  const primaryButtonText = isCancel
    ? (isProcessing ? 'MEMBATALKAN...' : successMessage ? 'DIBATALKAN' : 'BATALKAN')
    : (isProcessing ? 'MENERIMA...' : successMessage ? 'SELESAI' : 'TERIMA PERTUKARAN');

  return (
    <div
      className={`fixed inset-0 bg-gray-900/60 z-50 p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 md:px-0">
        <div
          className={`bg-white rounded-lg shadow-2xl relative ${isClosing ? 'animate-popDown' : 'animate-popUp'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isProcessing}
            aria-label="Tutup modal"
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="space-y-4 mx-4 md:mx-8 pt-5">
            <div className="text-center pb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {isCancel ? 'Batalkan' : 'Konfirmasi Pertukaran'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isCancel
                  ? 'Apakah Anda yakin ingin membatalkan penawaran ini?'
                  : 'Apakah Anda yakin ingin menerima pertukaran ini?'}
              </p>
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <div className="text-left min-w-0 flex-1">
                <div className="text-base md:text-lg font-bold text-gray-900 truncate">{offer?.seekingCourse || ''}</div>
                <div className="text-[11px] md:text-xs text-gray-500 truncate" title={offer?.seekingCourseName}>{offer?.seekingCourseName || ''}</div>
              </div>

              <div className="text-right min-w-0 flex-1">
                <div className="font-bold text-sm md:text-base text-gray-900 truncate" title={offer?.studentName}>{offer?.studentName || ''}</div>
                <div className="text-[11px] md:text-xs text-gray-500 truncate">{offer?.nim || ''}</div>
              </div>
            </div>

            <div className="py-2 border-y border-gray-100">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex-1 text-center">
                  <div className="text-[10px] md:text-xs text-gray-500">{isCancel ? 'Menawarkan' : 'Melepas'}</div>
                  <div className="text-red-600 font-bold text-base md:text-lg">{isCancel ? offer?.offeringClass : offer?.seekingClass || ''}</div>
                </div>

                <div className="text-gray-400 text-xl md:text-2xl font-bold select-none">⇌</div>

                <div className="flex-1 text-center">
                  <div className="text-[10px] md:text-xs text-gray-500">{isCancel ? 'Mencari' : 'Mendapat'}</div>
                  <div className="text-green-600 font-bold text-base md:text-lg">{isCancel ? offer?.seekingClass : offer?.offeringClass || ''}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-8 py-4 md:py-5 rounded-b-lg flex gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 text-sm font-black py-2.5 md:py-3 px-4 border border-gray-300 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {successMessage ? 'TUTUP' : 'KEMBALI'}
            </button>
            <button
              onClick={handlePrimaryAction}
              disabled={!isAvailable || isProcessing || !offer?.id}
              className={`flex-1 text-white text-sm font-black py-2.5 md:py-3 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${primaryButtonColor}`}
            >
              {primaryButtonText}
            </button>
          </div>
        </div>

        <div className="h-12 flex items-start justify-center pt-3">
          {errorMessage && (
            <div
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg animate-shake"
            >
              &lt;!&gt; {errorMessage} &lt;!&gt;
            </div>
          )}
          {successMessage && (
            <div
              className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg animate-shake"
              style={showMessage ? { animation: 'shake 0.25s ease-in-out' } : {}}
            >
              &lt;✔&gt; {successMessage} &lt;✔&gt;
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes popUp { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes popDown { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0; } }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        .animate-popUp { animation: popUp 0.15s ease-out; }
        .animate-popDown { animation: popDown 0.15s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
        .animate-fadeOut { animation: fadeOut 0.15s ease-out; }
        .animate-shake { animation: shake 0.25s ease-in-out; }
      ` }} />
    </div>
  );
}
