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
      className={`border border-gray-200 bg-white p-2 mb-2 flex items-center gap-3 text-[10px] border-radius-2 rounded-md shadow-xs transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="flex-dir col">
        <div className="text-gray-900 truncate w-[90px] font-bold text-xs">{offer.studentName}</div>
        <div className="font-mono text-gray-500 w-[90px] text-xs">{offer.nim}</div>
      </div>

      {/* Stats tengah */}
      <div className="flex-1 items-center dir row justify-center gap-3 flex text-center">
        <div className="text-gray-400 text-[10px]">{offer.seekingCourse}</div>
        
        <div className="flex items-center">
            <span className="text-red-600 font-bold text-sm">{offer.offeringClass}</span>
        </div>

        <div className="text-gray-400 text-sm">⇌</div>

        <div className="flex items-center">
            <span className="text-green-600 font-bold text-sm">{offer.seekingClass}</span>
        </div>

        <div className="text-gray-400 text-[10px]">{offer.timestamp}</div>
      </div>

      <div className="ml-auto flex gap-1.5">
        <button className="bg-green-600 text-white text-[11px] min-w-[90px] font-bold py-1 px-2.5 border-0 cursor-pointer hover:bg-green-700 transition-colors rounded-sm">
          OPEN TRADE
        </button>
      </div>
    </div>
  );
}