import { useEffect, useState, useRef } from 'react';

export default function BarterCard({ 
  offer, 
  index = 0, 
  exitIndex = 0, 
  shouldExit = false,
  shouldEnter = false,
  canAccept = true,
  conflictsWithSchedule = false,
  isOwnOffer = false,
  onAnimationComplete, 
  onExitClick,
  onOpenModal
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [height, setHeight] = useState('auto');
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

  const handleButtonClick = () => {
    if (isOwnOffer) {
      if (onOpenModal) onOpenModal(offer, 'cancel');
    } else {
      if (canAccept && !conflictsWithSchedule && onOpenModal) onOpenModal(offer, 'accept');
    }
  };

  const animationClasses = (isVisible && !isExiting)
    ? 'opacity-100 translate-x-0 scale-100'
    : 'opacity-0 translate-x-8 scale-y-0';

  const buttonDisabled = shouldExit || (!isOwnOffer && (!canAccept || conflictsWithSchedule));
  const buttonText = isOwnOffer
    ? 'CANCEL TRD'
    : conflictsWithSchedule
      ? 'BENTROK'
      : 'OPEN TRADE';
  const buttonColor = isOwnOffer 
    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
    : conflictsWithSchedule
      ? 'bg-yellow-500'
      : 'bg-green-600 hover:bg-green-700 active:bg-green-800';

  return (
    <div 
      style={{ 
        height: isExiting ? `${height}px` : 'auto'
      }}
      className="transition-all duration-100 ease-out overflow-hidden"
    >
      <div ref={wrapperRef} className="mb-1">
        <div className={`border border-gray-200 bg-white p-2 flex items-center rounded-md shadow-xs transition-all duration-100 ease-out ${animationClasses}`}>
          {/* 3-col grid: fixed left | flex-1 center | fixed right — guarantees middle is always centered */}
          <div className="grid w-full items-center" style={{ gridTemplateColumns: '90px 1fr 80px' }}>

            {/* Left Course Name*/}
            <div className="min-w-0">
              <div className="text-gray-900 truncate font-bold text-[12px] md:hidden mb-[-3px]" title={offer.seekingCourseName}>
                {offer.seekingCourseName}
              </div>
              <div className="font-medium font-mono text-gray-400 text-[10px] truncate md:hidden">{offer.studentName}</div>

              <div className="hidden md:block mb-[-3px] text-gray-900 truncate font-bold text-[12px]" title={offer.seekingCourseName}>
                {offer.seekingCourseName}
              </div>
              <div className="hidden md:block font-medium font-sans text-gray-400 text-[10px] truncate">{offer.studentName}</div>
            </div>

            {/* Middle codes */}
            <div className="flex items-center justify-center gap-2">
              <span className="hidden md:inline text-gray-400 text-[10px] whitespace-nowrap">{offer.seekingCourse}</span>
              <span className="text-red-600 font-bold text-sm">{offer.offeringClass}</span>
              <span className="text-gray-400 text-sm">⇌</span>
              <span className="text-green-600 font-bold text-sm">{offer.seekingClass}</span>
              <span className="hidden md:inline text-gray-400 text-[10px] whitespace-nowrap">{offer.timestamp}</span>
            </div>

            {/* Right button*/}
            <div className="flex justify-end">
              <button
                onClick={handleButtonClick}
                disabled={buttonDisabled}
                title={conflictsWithSchedule ? 'Jadwal bertabrakan dengan kelas lain' : ''}
                className={`${buttonColor} text-white text-[11px] font-bold pb-1 pt-2 my-1 border-0 cursor-pointer transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 w-[90px]`}
              >
                {buttonText}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}