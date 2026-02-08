import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function TradeConfirmationModal({ offer, isOpen, onClose, onAccept }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Only set up socket if modal is open AND we have a valid offer
    if (!isOpen || !offer?.id) {
      return;
    }

    const socket = io('http://localhost:5000');
    
    socket.on('offer-taken', ({ offerId }) => {
      // Show error kalo:
      // 1. It's our offer
      // 2. We're not currently processing (we handle our own result)
      // 3. We don't already have a success message (we took it ourselves)
      if (offer?.id && offerId === offer.id && !isProcessing && !successMessage) {
        setIsAvailable(false);
        setErrorMessage('Offer already taken by someone else');
        setIsProcessing(false);
      }
    });

    return () => socket.disconnect();
  }, [isOpen, offer?.id, isProcessing, successMessage]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsAvailable(true);
      setIsProcessing(false);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleAccept = async () => {
    if (!isAvailable || isProcessing || !offer?.id) return;

    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/offers/${offer.id}/take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ takerNim: 'M6401211002' })
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

      // Trigger exit animation but keep modal open
      onAccept(offer.id);
      setIsAvailable(false);
      setSuccessMessage('Trade completed successfully!');
    } catch (error) {
      console.error('Trade acceptance failed:', error);
      setIsAvailable(false);
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackdropClick = () => {
    // Only prevent closing while actively processing
    if (!isProcessing) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    // Only prevent Escape while actively processing
    if (e.key === 'Escape' && !isProcessing) {
      onClose();
    }
    if (e.key === 'Enter' && isAvailable && !isProcessing) handleAccept();
  };

  // Render modal in DOM but hide when not open  
  return (
    <div 
      className={`fixed inset-0 bg-gray-900/60 z-50 p-4 ${!isOpen ? 'hidden' : ''}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>

            <div className="space-y-4 mx-8 pt-4">
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
                    <div className="text-xs text-gray-500">Melepas</div>
                    <div className="text-red-600 font-bold text-lg">{offer?.seekingClass || ''}</div>
                  </div>

                    <div className="text-gray-400 text-2xl font-bold">⇌</div>
                  
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500">Mendapat</div>
                    <div className="text-green-600 font-bold text-lg">{offer?.offeringClass || ''}</div>
                  </div>
                  
                </div>
              </div>
              
            </div>
            

          <div className="px-8 py-5 rounded-b-lg flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 text-sm font-bold py-3 px-4 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            >
              {successMessage ? 'CLOSE' : 'CANCEL'}
            </button>
            <button
              onClick={handleAccept}
              disabled={!isAvailable || isProcessing || !offer?.id}
              className="flex-1 bg-green-600 text-white text-sm font-bold py-3 px-4 rounded hover:bg-green-700 active:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'ACCEPTING...' : successMessage ? 'COMPLETED' : 'ACCEPT TRADE'}
            </button>
          </div>
        </div>

        <div className="h-12 flex items-start justify-center pt-3">
          {errorMessage && (
            <div className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg">
              &lt;!&gt; {errorMessage} &lt;!&gt;
            </div>
          )}
          {successMessage && (
            <div className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg">
              &lt;✓&gt; {successMessage} &lt;✓&gt;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}