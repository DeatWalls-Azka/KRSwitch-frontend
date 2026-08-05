import React, { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { takeOffer, claimPickDropOffer, deleteOffer } from '../../../api';
import type { EnrichedOffer } from '../../../types';
import { detectPresetFromOffers } from '../../../utils/presets';
import { formatShortName } from '../../../utils/offerUtils';

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

  const offeringPreset = offer?.packageOffers ? detectPresetFromOffers(offer.packageOffers, 'offering') : null;
  const seekingPreset = offer?.packageOffers ? detectPresetFromOffers(offer.packageOffers, 'seeking') : null;
  const offeringNum = offeringPreset ? offeringPreset.replace(/paket\s*/i, '') : null;
  const seekingNum = seekingPreset ? seekingPreset.replace(/paket\s*/i, '') : null;

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
      if (offer.type === 'pick_drop') {
        await claimPickDropOffer(offer.id, currentUser.nim);
        onAccept(offer.id);
        setIsAvailable(false);
        setSuccessMessage('Seat berhasil diklaim!');
      } else {
        await takeOffer(offer.id, currentUser.nim);
        onAccept(offer.id);
        setIsAvailable(false);
        setSuccessMessage('Pertukaran berhasil diselesaikan!');
      }
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

  const isPickDrop = offer?.type === 'pick_drop';

  const primaryButtonColor = isCancel
    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
    : isPickDrop
      ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
      : 'bg-green-600 hover:bg-green-700 active:bg-green-800';

  const primaryButtonText = isCancel
    ? (isProcessing ? 'MEMBATALKAN...' : successMessage ? 'DIBATALKAN' : 'BATALKAN')
    : isPickDrop
      ? (isProcessing ? 'MENGKLAIM...' : successMessage ? 'SELESAI' : 'KLAIM SEAT')
      : (isProcessing ? 'MENERIMA...' : successMessage ? 'SELESAI' : 'TERIMA');

  return (
    <div
      className={`fixed inset-0 bg-gray-900/60 dark:bg-black/80 z-50 p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 md:px-0">
        <div
          className={`bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-2xl relative ${isClosing ? 'animate-popDown' : 'animate-popUp'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isProcessing}
            aria-label="Tutup modal"
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="space-y-4 mx-4 md:mx-6 pt-5">
            <div className="text-center pb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isCancel
                  ? (isPickDrop ? 'Batalkan Drop Seat' : 'Batalkan Penawaran')
                  : (isPickDrop ? 'Konfirmasi Klaim Seat' : 'Konfirmasi Pertukaran')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-wrap-balance" style={{ textWrap: 'balance' }}>
                {isCancel
                  ? 'Apakah Anda yakin ingin membatalkan penawaran ini?'
                  : isPickDrop
                    ? 'Apakah Anda yakin ingin mengklaim seat yang dilepas ini?'
                    : 'Apakah Anda yakin ingin menerima pertukaran ini?'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-left min-w-0 flex-1">
                <div className="text-base font-bold text-gray-900 dark:text-gray-100 truncate" title={offer?.seekingCourseName || ''}>
                  {offer?.packageOffers ? 'Paket Pertukaran' : (offer?.seekingCourseName || offer?.seekingCourse || '')}
                </div>
                <div className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 truncate uppercase">
                  {offer?.packageOffers ? offer.seekingCourse : (offer?.seekingCourseName ? offer.seekingCourse : '')}
                </div>
              </div>

              {/* Package Badge */}
              {offer?.packageOffers && offeringNum && seekingNum && (
                <div className="flex items-center justify-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
                  <span className="font-bold text-[11px] text-gray-700 dark:text-gray-300">Paket</span>
                  <span className="font-black text-[11px] text-red-600 dark:text-red-500">{offeringNum}</span>
                  <ArrowLeftRight className="w-[11px] h-[11px] text-gray-400 dark:text-gray-500 shrink-0 mx-0.5" />
                  <span className="font-black text-[11px] text-green-600 dark:text-green-500">{seekingNum}</span>
                </div>
              )}

              <div className="text-right min-w-0 flex-1">
                <div className="font-bold text-sm text-gray-900 dark:text-gray-100" title={offer?.studentName}>
                  {formatShortName(offer?.studentName)}
                </div>
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                  {offer?.nim || ''}
                </div>
              </div>
            </div>

            <div className="py-3 border-y border-gray-100 dark:border-gray-800">
              {offer?.packageOffers ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                    <span>Rincian Paket ({offer.packageOffers.length} Matkul)</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono flex items-center gap-1">
                      <span>{isCancel ? 'Menawarkan' : 'Melepas'}</span>
                      <ArrowLeftRight className="w-2.5 h-2.5" />
                      <span>{isCancel ? 'Mencari' : 'Mendapat'}</span>
                    </span>
                  </div>
                  <div className={`grid gap-1.5 ${
                    offer.packageOffers.length <= 1
                      ? 'grid-cols-1'
                      : offer.packageOffers.length % 3 === 0 || offer.packageOffers.length >= 5
                        ? 'grid-cols-2'
                        : 'grid-cols-2'
                  }`}>
                    {offer.packageOffers.map((child, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100/80 dark:border-gray-800/30 min-w-0">
                        <div className="truncate pr-1.5 font-medium text-gray-700 dark:text-gray-300 min-w-0" title={`${child.seekingCourse} - ${child.seekingCourseName}`}>
                          <span className="truncate">{child.seekingCourseName}</span>
                        </div>
                        <div className="font-mono font-bold text-[10px] shrink-0 flex items-center gap-1 ml-auto pl-1">
                          <span className="text-red-500 dark:text-red-400">
                            {isCancel ? child.offeringClass : child.seekingClass}
                          </span>
                          <ArrowLeftRight className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500 shrink-0" />
                          <span className="text-green-500 dark:text-green-400">
                            {isCancel ? child.seekingClass : child.offeringClass}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isPickDrop ? (
                <div className="flex items-center justify-between px-2">
                  <div className="flex-1 text-center">
                    <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {isCancel ? 'Kursi Dilepas' : 'Kursi Diambil'}
                    </div>
                    <div className="text-red-600 dark:text-red-400 font-black text-lg md:text-xl">
                      {offer?.seekingCourse}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[11px] font-extrabold text-red-700 dark:text-red-300 uppercase tracking-wider">
                    {offer?.reservedForNim ? `Target: ${offer.reservedForNim}` : 'Open Drop'}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex-1 text-center">
                    <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{isCancel ? 'Menawarkan' : 'Melepas'}</div>
                    <div className="text-red-600 dark:text-red-500 font-bold text-base md:text-lg">{isCancel ? offer?.offeringClass : offer?.seekingClass || ''}</div>
                  </div>

                  <ArrowLeftRight className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0" />

                  <div className="flex-1 text-center">
                    <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{isCancel ? 'Mencari' : 'Mendapat'}</div>
                    <div className="text-green-600 dark:text-green-500 font-bold text-base md:text-lg">{isCancel ? offer?.seekingClass : offer?.offeringClass || ''}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 md:px-8 py-4 md:py-5 rounded-b-lg flex gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 text-sm font-black py-2.5 md:py-3 px-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div
              className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg animate-shake"
              style={showMessage ? { animation: 'shake 0.25s ease-in-out' } : {}}
            >
              {successMessage}
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
