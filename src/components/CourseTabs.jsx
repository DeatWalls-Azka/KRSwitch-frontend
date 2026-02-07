import { useRef, useLayoutEffect, useState, useEffect, useMemo } from 'react';

export default function CourseTabs({ courses, selectedCourse, onCourseSelect }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isReady, setIsReady] = useState(false);
  const tabsRef = useRef([]);

  // Enable transition after initial render
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Update indicator position when selection or courses change
  useLayoutEffect(() => {
    const selectedIndex = courses.findIndex(c => c.code === selectedCourse?.code);
    const selectedTab = tabsRef.current[selectedIndex];
    
    if (selectedTab) {
      setIndicatorStyle({
        left: selectedTab.offsetLeft,
        width: selectedTab.offsetWidth,
      });
    }
  }, [selectedCourse, courses]);

  return (
    <div className="border-b border-gray-200 flex flex-row bg-white flex-shrink-0 px-4 relative">
      {courses.map((course, index) => (
        <button 
          key={course.code}
          ref={el => tabsRef.current[index] = el}
          className={`min-w-[120px] bg-transparent border-0 cursor-pointer px-4 py-2.5 transition-colors duration-150 ${
            selectedCourse?.code === course.code 
              ? 'bg-green-50' 
              : 'hover:bg-gray-100'
          }`}
          onClick={() => onCourseSelect(course)}
        >
          <div className="text-xs font-bold text-gray-900">{course.code}</div>
          <div className="text-[10px] font-normal text-gray-500 mt-0.5">{course.name}</div>
        </button>
      ))}
      
      {/* Sliding indicator line */}
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