import { useRef, useEffect, useState } from 'react';

export default function SessionTypeTabs({ courseType, selectedSessionType, onSessionTypeSelect }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isReady, setIsReady] = useState(false);
  const tabsRef = useRef([]);

  const tabs = [
    { id: 'kuliah', label: 'KULIAH (K)' },
    ...(courseType === 1 ? [{ id: 'praktikum', label: 'PRAKTIKUM (P)' }] : []),
    ...(courseType === 2 ? [{ id: 'responsi', label: 'RESPONSI (R)' }] : []),
  ];

  useEffect(() => {
    const selectedIndex = tabs.findIndex(t => t.id === selectedSessionType);
    const selectedTab = tabsRef.current[selectedIndex];
    
    if (selectedTab) {
      setIndicatorStyle({
        left: selectedTab.offsetLeft,
        width: selectedTab.offsetWidth,
      });
      
      // Enable transition after first render
      if (!isReady) {
        setTimeout(() => setIsReady(true), 50);
      }
    }
  }, [selectedSessionType, tabs, isReady]);

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
      
      {/* Sliding indicator line */}
      <div 
        className={`absolute bottom-0 h-0.5 bg-green-600 ${isReady ? 'transition-all duration-300 ease-out' : ''}`}
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />
    </div>
  );
}