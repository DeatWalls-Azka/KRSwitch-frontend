import { useRef, useLayoutEffect, useState, useEffect } from 'react';

// --- Types ----------------------------------------------------

interface Course {
  code: string;
  name: string;
}

interface CourseTabsProps {
  courses: Course[];
  selectedCourse: Course | null;
  onCourseSelect: (course: Course) => void;
}

// --- Komponen Utama -------------------------------------------

export default function CourseTabs({ courses, selectedCourse, onCourseSelect }: CourseTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isReady, setIsReady] = useState(false);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Nyalain transisi abis render pertama
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Update indikator + auto scroll ke tab terpilih
  useLayoutEffect(() => {
    const selectedIndex = courses.findIndex(c => c.code === selectedCourse?.code);
    const selectedTab = tabsRef.current[selectedIndex];

    if (selectedTab) {
      setIndicatorStyle({
        left: selectedTab.offsetLeft,
        width: selectedTab.offsetWidth,
      });

      // Tengahkan tab terpilih di container scroll kalo memungkinkan
      if (containerRef.current) {
        const targetScroll = selectedTab.offsetLeft - (containerRef.current.clientWidth / 2) + (selectedTab.offsetWidth / 2);
        containerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  }, [selectedCourse, courses]);

  return (
    <div
      ref={containerRef}
      className="border-b border-gray-200 flex flex-row bg-white flex-shrink-0 px-2 md:px-4 relative overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {courses.map((course, index) => (
        <button
          key={course.code}
          ref={el => { tabsRef.current[index] = el; }}
          className={`min-w-[120px] bg-transparent border-0 cursor-pointer px-3 py-2.5 md:px-4 md:py-2.5 transition-colors duration-150 flex-shrink-0 ${
            selectedCourse?.code === course.code
              ? 'bg-green-50'
              : 'hover:bg-gray-100 active:bg-gray-100'
          }`}
          onClick={() => onCourseSelect(course)}
        >
          <div className="text-xs font-bold text-gray-900">{course.code}</div>
          <div className="text-[10px] font-semibold text-gray-500 mt-0.5 whitespace-nowrap">{course.name}</div>
        </button>
      ))}

      {/* Garis indikator geser */}
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
