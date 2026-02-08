import { useEffect, useState, useRef } from 'react';
import TradeConfirmationModal from './TradeConfirmationModal';

export default function BarterCard({ 
  offer, 
  index = 0, 
  exitIndex = 0, 
  shouldExit = false,
  shouldEnter = false,
  canAccept = true,
  onAnimationComplete, 
  onExitClick 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [height, setHeight] = useState('auto');
  const [showModal, setShowModal] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (shouldEnter) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsVisible(true), index * 30);
      return () => clearTimeout(timer);
    }
  }, [index, shouldEnter]);

  useEffect(() => {
    if (shouldExit && isVisible && !isExiting) {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setHeight(rect.height);
      }
      
      const timer = setTimeout(() => {
        setIsExiting(true);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }, exitIndex * 30);
      
      return () => clearTimeout(timer);
    }
  }, [shouldExit, isVisible, exitIndex, isExiting]);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete(offer.id);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isExiting, offer.id, onAnimationComplete]);

  const handleOpenTrade = () => {
    if (!canAccept) return;
    setShowModal(true);
  };

  const handleAcceptTrade = (offerId) => {
    if (onExitClick) {
      onExitClick(offerId);
    }
  };

  const animationClasses = (isVisible && !isExiting)
    ? 'opacity-100 translate-x-0 scale-100'
    : 'opacity-0 translate-x-8 scale-y-0';

  return (
    <>
      <div 
        style={{ 
          height: isExiting ? `${height}px` : 'auto'
        }}
        className="transition-all duration-100 ease-out overflow-hidden"
      >
        <div ref={wrapperRef} className="mb-1">
          <div 
            className={`border border-gray-200 bg-white p-2 flex items-center gap-3 rounded-md shadow-xs transition-all duration-100 ease-out ${animationClasses}`}
          >
            <div className="flex flex-col shrink-0 w-[90px]">
              <div className="text-gray-900 truncate font-bold text-xs" title={offer.studentName}>
                {offer.studentName}
              </div>
              <div className="font-mono text-gray-500 text-xs truncate">{offer.nim}</div>
            </div>

            <div className="flex-1 flex flex-row flex-wrap justify-center items-center gap-x-3 gap-y-1 text-center min-w-0">
              <div className="text-gray-400 text-[10px] whitespace-nowrap">{offer.seekingCourse}</div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold text-sm">{offer.offeringClass}</span>
                <div className="text-gray-400 text-sm">⇌</div>
                <span className="text-green-600 font-bold text-sm">{offer.seekingClass}</span>
              </div>
              <div className="text-gray-400 text-[10px] whitespace-nowrap">{offer.timestamp}</div>
            </div>

            <div className="ml-auto shrink-0">
              <button 
                onClick={handleOpenTrade}
                disabled={shouldExit || !canAccept}
                className="bg-green-600 text-white text-[11px] min-w-[90px] font-bold py-1 px-2.5 border-0 cursor-pointer hover:bg-green-700 active:bg-green-800 transition-colors rounded-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                OPEN TRADE
              </button>
            </div>
          </div>
        </div>
      </div>

      <TradeConfirmationModal
        offer={offer}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAccept={handleAcceptTrade}
      />
    </>
  );
}