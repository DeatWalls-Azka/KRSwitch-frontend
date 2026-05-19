import { useEffect, useState, useRef } from 'react';
import type { EnrichedOffer } from '../../types';

// --- Types ----------------------------------------------------

interface BarterCardProps {
  offer: EnrichedOffer;
  index?: number;
  exitIndex?: number;
  shouldExit?: boolean;
  shouldEnter?: boolean;
  canAccept?: boolean;
  conflictsWithSchedule?: boolean;
  isOwnOffer?: boolean;
  onAnimationComplete?: (id: number) => void;
  onExitClick?: (id: number) => void;
  onOpenModal?: (offer: EnrichedOffer, mode: 'accept' | 'cancel') => void;
}

// --- Komponen Utama -------------------------------------------

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
  onOpenModal
}: BarterCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [height, setHeight] = useState<number | string>('auto');
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: any;
    if (shouldEnter) {
      setIsVisible(false);
      timer = setTimeout(() => setIsVisible(true), 50);
    } else {
      // Snappy Dynamic Stagger: Hitung berapa kartu yang muat di viewport untuk menstagger semua yang keliatan
      const visibleCount = typeof window !== 'undefined'
        ? Math.max(6, Math.ceil(window.innerHeight / 76))
        : 8;
      const delay = index < visibleCount ? index * 30 : visibleCount * 30;
      timer = setTimeout(() => setIsVisible(true), delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [index, shouldEnter]);

  useEffect(() => {
    let timer: any;
    if (shouldExit && isVisible && !isExiting) {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setHeight(rect.height);
      }

      timer = setTimeout(() => {
        setIsExiting(true);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }, exitIndex * 30);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [shouldExit, isVisible, exitIndex, isExiting]);

  useEffect(() => {
    let timer: any;
    if (isExiting) {
      timer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete(offer.id);
        }
      }, 100);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
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
      data-offer-id={offer.id}
      style={{
        height: isExiting ? `${height}px` : 'auto'
      }}
      className="transition-all duration-100 ease-out overflow-hidden"
    >
      <div ref={wrapperRef} className="mb-1">
        <div className={`border border-gray-200 bg-white p-2 flex items-center rounded-md shadow-xs transition-all duration-100 ease-out ${animationClasses}`}>
          {/* Grid 3 kolom: 1fr kiri, auto tengah, 1fr kanan, menjamin bagian tengah selalu simetris dengan jarak yang sama */}
          <div className="grid w-full items-center gap-2" style={{ gridTemplateColumns: '1fr auto 1fr' }}>

            {/* Left Course Name*/}
            <div className="min-w-0 pr-6">
              <div className="text-gray-900 truncate font-bold text-[12px] md:hidden" title={offer.seekingCourseName}>
                {offer.seekingCourseName}
              </div>
              <div className="font-semibold font-mono text-gray-400 text-[10px] truncate md:hidden ">{offer.studentName}</div>

              <div className="hidden md:block text-gray-900 truncate font-bold text-[12px]" title={offer.seekingCourseName}>
                {offer.seekingCourseName}
              </div>
              <div className="hidden md:block font-semibold font-sans text-gray-400 text-[10px] truncate">{offer.studentName}</div>
            </div>

            {/* Middle codes */}
            <div className="flex flex-col items-center justify-center leading-none mt-[-2px]">
              <div className="flex items-center justify-center gap-2">
                <span className="text-red-600 font-black text-sm">{offer.offeringClass}</span>
                <span className="text-gray-400 font-black text-sm">⇌</span>
                <span className="text-green-600 font-black text-sm">{offer.seekingClass}</span>
              </div>
              <span className="text-gray-400 font-black text-[10px] whitespace-nowrap mt-1">{offer.seekingCourse}</span>
            </div>

            {/* Right button*/}
            <div className="flex justify-end min-w-0">
              <button
                onClick={handleButtonClick}
                disabled={buttonDisabled}
                title={conflictsWithSchedule ? 'Jadwal bertabrakan dengan kelas lain' : ''}
                className={`${buttonColor} text-white text-[11px] font-black pb-1 pt-1.5 my-1 border-0 cursor-pointer transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 w-full max-w-[100px]`}
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
