import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function TradeConfirmationModal({ 
  offer, 
  isOpen, 
  onClose, 
  onAccept, 
  onCancel,
  currentUser,
  mode = 'accept' // 'accept' or 'cancel'
}) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const isCancel = mode === 'cancel';

  useEffect(() => {
    if (!isOpen || !offer?.id) {
      return;
    }

    const socket = io('http://localhost:5000');
    
    socket.on('offer-taken', ({ offerId }) => {
      if (offer?.id && offerId === offer.id && !isProcessing && !successMessage) {
        setIsAvailable(false);
        setErrorMessage(isCancel ? 'Penawaran sudah diambil orang lain' : 'Penawaran sudah diambil orang lain');
        setIsProcessing(false);
      }
    });

    return () => socket.disconnect();
  }, [isOpen, offer?.id, isProcessing, successMessage, isCancel]);

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
    if (errorMessage || successMessage) {
      setShowMessage(true);
    }
  }, [errorMessage, successMessage]);

  const handleAccept = async () => {
    if (!isAvailable || isProcessing || !offer?.id || !currentUser) return;

    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');
    setShowMessage(false);

    try {
      const response = await fetch(`http://localhost:5000/api/offers/${offer.id}/take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ takerNim: currentUser.nim })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.error);
        } else {
          throw new Error(`Server returned ${response.status}`);
        }
      }

      onAccept(offer.id);
      setIsAvailable(false);
      setSuccessMessage('Pertukaran berhasil diselesaikan!');
    } catch (error) {
      console.error('Penerimaan pertukaran gagal:', error);
      setIsAvailable(false);
      setErrorMessage(error.message);
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
      const response = await fetch(`http://localhost:5000/api/offers/${offer.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.error);
        } else {
          throw new Error(`Server returned ${response.status}`);
        }
      }

      if (onCancel) {
        onCancel(offer.id);
      }
      setIsAvailable(false);
      setSuccessMessage('Penawaran berhasil dibatalkan!');
      
      // Tutup otomatis setelah 1 detik jika berhasil
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Pembatalan penawaran gagal:', error);
      setIsAvailable(false);
      setErrorMessage(error.message);
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
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleBackdropClick = () => {
    if (!isProcessing) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isProcessing) {
      handleClose();
    }
    if (e.key === 'Enter' && isAvailable && !isProcessing) {
      handlePrimaryAction();
    }
  };

  if (!isOpen) return null;

  const primaryButtonColor = isCancel 
    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
    : 'bg-green-600 hover:bg-green-700 active:bg-green-800';
  
  const primaryButtonText = isCancel
    ? (isProcessing ? 'MEMBATALKAN...' : successMessage ? 'DIBATALKAN' : 'BATALKAN PENAWARAN')
    : (isProcessing ? 'MENERIMA...' : successMessage ? 'SELESAI' : 'TERIMA PERTUKARAN');

  return (
    <div 
      className={`fixed inset-0 bg-gray-900/60 z-50 p-4 ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div 
          className={`bg-white rounded-lg shadow-2xl relative ${
            isClosing ? 'animate-popDown' : 'animate-popUp'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating Close Button */}
          <button 
            onClick={handleClose}
            disabled={isProcessing}
            aria-label="Tutup modal"
            style={{ fontFamily: '"JetBrains Mono", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            className="absolute -top-6.5 -right-6 z-10 w-8 h-8 flex items-center justify-center text-white active:scale-50 hover:scale-120 transition-transform duration-60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl leading-none font-light">✕</span>
          </button>

          <div className="space-y-4 mx-8 pt-4">
            <div className="text-center pb-2">
              <h3 className="text-lg font-bold text-gray-900">
                {isCancel ? 'Batalkan Penawaran' : 'Konfirmasi Pertukaran'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isCancel 
                  ? 'Apakah Anda yakin ingin membatalkan penawaran ini?' 
                  : 'Apakah Anda yakin ingin menerima pertukaran ini?'}
              </p>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-left">
                <div className="text-lg font-bold text-gray-900">{offer?.seekingCourse || ''}</div>
                <div className="text-xs text-gray-500">{offer?.seekingCourseName || ''}</div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">{offer?.studentName || ''}</div>
                <div className="text-xs text-gray-500">{offer?.nim || ''}</div>
              </div>
            </div>

            <div className="py-2 border-y border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex-1 text-center">
                  <div className="text-xs text-gray-500">{isCancel ? 'Menawarkan' : 'Melepas'}</div>
                  <div className="text-red-600 font-bold text-lg">{isCancel ? offer?.offeringClass : offer?.seekingClass || ''}</div>
                </div>

                <div className="text-gray-400 text-2xl font-bold">⇌</div>
                
                <div className="flex-1 text-center">
                  <div className="text-xs text-gray-500">{isCancel ? 'Mencari' : 'Mendapat'}</div>
                  <div className="text-green-600 font-bold text-lg">{isCancel ? offer?.seekingClass : offer?.offeringClass || ''}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 rounded-b-lg flex gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 text-sm font-bold py-3 px-4 border border-gray-300 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {successMessage ? 'TUTUP' : 'KEMBALI'}
            </button>
            <button
              onClick={handlePrimaryAction}
              disabled={!isAvailable || isProcessing || !offer?.id}
              className={`flex-1 text-white text-sm font-bold py-3 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${primaryButtonColor}`}
            >
              {primaryButtonText}
            </button>
          </div>
        </div>

        <div className="h-12 flex items-start justify-center pt-3">
          {errorMessage && (
            <div 
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg"
              style={showMessage ? { animation: 'shake 0.25s ease-in-out' } : {}}
            >
              &lt;!&gt; {errorMessage} &lt;!&gt;
            </div>
          )}
          {successMessage && (
            <div 
              className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg"
              style={showMessage ? { animation: 'shake 0.25s ease-in-out' } : {}}
            >
              &lt;✔&gt; {successMessage} &lt;✔&gt;
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes popUp {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes popDown {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.95);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-3px);
          }
          75% {
            transform: translateX(3px);
          }
        }

        .animate-popUp {
          animation: popUp 0.15s ease-out;
        }

        .animate-popDown {
          animation: popDown 0.15s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }

        .animate-fadeOut {
          animation: fadeOut 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}