import { useState, useEffect } from 'react';

export default function TradeConfirmationModal({ offer, isOpen, onClose, onAccept }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsAvailable(true);
      setIsProcessing(false);
      return;
    }

    const checkAvailability = async () => {
      try {
        const response = await fetch(`/api/trades/${offer.id}/status`);
        
        // Check if response is OK and JSON
        if (!response.ok) {
          console.warn(`Availability check returned ${response.status}`);
          return; // Keep current availability state
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('Availability check returned non-JSON response');
          return; // Keep current availability state
        }

        const data = await response.json();
        setIsAvailable(data.available);
      } catch (error) {
        console.error('Availability check failed:', error);
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 1000);

    return () => clearInterval(interval);
  }, [isOpen, offer.id]);

  const handleAccept = async () => {
    if (!isAvailable || isProcessing) return;

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/trades/${offer.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          if (error.code === 'TRADE_NOT_AVAILABLE') {
            setIsAvailable(false);
            return;
          }
          throw new Error(error.message);
        } else {
          throw new Error(`Server returned ${response.status}`);
        }
      }

      onAccept(offer.id);
      onClose();
    } catch (error) {
      console.error('Trade acceptance failed:', error);
      setIsAvailable(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && isAvailable && !isProcessing) handleAccept();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900/60 z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>

            <div className="space-y-4 mx-8 pt-4">
              <div className="flex items-baseline justify-between">
                
                {/* Mata Kuliah */}
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900">{offer.seekingCourse}</div>
                  <div className="text-xs text-gray-500">{offer.seekingCourseName}</div>
                </div>
                
                {/* Mahasiswa */}
                <div className="text-right">
                  <div className="font-bold text-gray-900">{offer.studentName}</div>
                  <div className="text-xs text-gray-500">{offer.nim}</div>
                </div>
              </div>

              {/* Trade Details */}
              <div className="py-2 border-y border-gray-200">
                <div className="flex items-center gap-4">
                  
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500">Melepas</div>
                    <div className="text-red-600 font-bold text-lg">{offer.seekingClass}</div>
                  </div>

                    <div className="text-gray-400 text-2xl font-bold">⇌</div>
                  
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500">Mendapat</div>
                    <div className="text-green-600 font-bold text-lg">{offer.offeringClass}</div>
                  </div>
                  
                </div>
              </div>
              
            </div>
            

          <div className="px-8 py-5 rounded-b-lg flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 text-sm font-bold py-3 px-4 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleAccept}
              disabled={!isAvailable || isProcessing}
              className="flex-1 bg-green-600 text-white text-sm font-bold py-3 px-4 rounded hover:bg-green-700 active:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'ACCEPTING...' : 'ACCEPT TRADE'}
            </button>
          </div>
        </div>

        <div className="h-12 flex items-start justify-center pt-3">
          {!isAvailable && (
            <div className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg">
              &lt;!&gt; Trade no longer available &lt;!&gt;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}