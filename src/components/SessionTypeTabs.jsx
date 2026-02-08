import { useRef, useEffect, useState, useMemo } from 'react';

export default function SessionTypeTabs({ courseType, selectedSessionType, onSessionTypeSelect }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isReady, setIsReady] = useState(false);
  const tabsRef = useRef([]);

  const tabs = useMemo(() => [
    { id: 'kuliah', label: 'KULIAH (K)' },
    ...(courseType === 1 ? [{ id: 'praktikum', label: 'PRAKTIKUM (P)' }] : []),
    ...(courseType === 2 ? [{ id: 'responsi', label: 'RESPONSI (R)' }] : []),
  ], [courseType]);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const selectedIndex = tabs.findIndex(t => t.id === selectedSessionType);
    const selectedTab = tabsRef.current[selectedIndex];
    
    if (selectedTab) {
      setIndicatorStyle({
        left: selectedTab.offsetLeft,
        width: selectedTab.offsetWidth,
      });
    }
  }, [selectedSessionType, tabs]);

  return (
    <div className="flex bg-gray-50 px-4 border-b border-gray-200 flex-shrink-0 relative">
      {tabs.map((tab, index) => (
        <button 
          key={tab.id}
          ref={el => tabsRef.current[index] = el}
          className={`min-w-[120px] bg-transparent border-0 cursor-pointer px-4 py-1.5 text-xs font-bold transition-all duration-150 ${
            selectedSessionType === tab.id
              ? 'text-gray-900 bg-green-50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => onSessionTypeSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
      
      <div 
        className={`absolute bottom-0 left-0 h-0.5 bg-green-600 will-change-transform ${isReady ? 'transition-all duration-300 ease-out' : ''}`}
        style={{
          width: `${indicatorStyle.width}px`,
          transform: `translateX(${indicatorStyle.left}px)`, 
        }}
      />
    </div>
  );
}