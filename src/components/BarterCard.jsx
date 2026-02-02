import { useEffect, useState } from 'react';

export default function BarterCard({ offer, index = 0 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div 
      className={`border border-gray-200 bg-white p-2 mb-2 flex items-center gap-2 sm:gap-3 rounded-md shadow-xs transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {/* 1. Left Column: Student Info 
          Added shrink-0 so it never gets crushed.
          Fixed 'flex-dir col' to 'flex flex-col'. */}
      <div className="flex flex-col shrink-0 w-[90px]">
        <div className="text-gray-900 truncate font-bold text-xs" title={offer.studentName}>
            {offer.studentName}
        </div>
        <div className="font-mono text-gray-500 text-xs truncate">
            {offer.nim}
        </div>
      </div>

      {/* 2. Middle Column: Stats
          Added 'flex-wrap' so items flow if zoomed in.
          Fixed 'dir row' to 'flex-row'. 
          Added 'min-w-0' to allow truncation to work properly inside flex. */}
      <div className="flex-1 flex flex-row flex-wrap justify-center items-center gap-x-3 gap-y-1 text-center min-w-0">
        
        {/* Course Name: distinct width or full width on wrap */}
        <div className="text-gray-400 text-[10px] whitespace-nowrap">
            {offer.seekingCourse}
        </div>
        
        {/* Trade Logic Group: Kept together */}
        <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold text-sm whitespace-nowrap">
                {offer.offeringClass}
            </span>

            <div className="text-gray-400 text-sm">⇌</div>

            <span className="text-green-600 font-bold text-sm whitespace-nowrap">
                {offer.seekingClass}
            </span>
        </div>

        <div className="text-gray-400 text-[10px] whitespace-nowrap">
            {offer.timestamp}
        </div>
      </div>

      {/* 3. Right Column: Action
          Added shrink-0 so the button stays fully visible. */}
      <div className="ml-auto flex shrink-0 gap-1.5">
        <button className="bg-green-600 text-white text-[11px] min-w-[90px] font-bold py-1 px-2.5 border-0 cursor-pointer hover:bg-green-700 transition-colors rounded-sm whitespace-nowrap">
          OPEN TRADE
        </button>
      </div>
    </div>
  );
}