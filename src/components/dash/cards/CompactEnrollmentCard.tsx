import { useEffect, useState } from 'react';

interface ClassItem {
  code: string;
  courseCode?: string;
  courseName?: string;
  day: string;
  time: string;
  room?: string;
}

interface CompactClassCardProps {
  classItem: ClassItem;
  index?: number;
  onClick?: () => void;
}

export default function CompactClassCard({ classItem, index = 0, onClick }: CompactClassCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div 
      onClick={onClick}
      className={`p-4 border border-gray-200 rounded-md bg-white flex flex-col shadow-sm hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col items-start pr-2">
          <h3 className="text-sm font-bold text-gray-900 m-0 leading-tight mb-1">
            {classItem.courseName || 'Unknown Course'}
          </h3>
          {classItem.courseCode && (
            <span className="text-[11px] font-mono font-bold text-gray-500">
              {classItem.courseCode}
            </span>
          )}
        </div>
        {(() => {
          const prefix = classItem.code[0]?.toUpperCase();
          let colorClass = 'text-gray-700 bg-gray-100';
          if (prefix === 'K') colorClass = 'text-blue-700 bg-blue-100';
          else if (prefix === 'P') colorClass = 'text-yellow-700 bg-yellow-100';
          else if (prefix === 'R') colorClass = 'text-red-700 bg-red-100';
          return (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 ${colorClass}`}>
              {classItem.code}
            </span>
          );
        })()}
      </div>
      <div className="text-xs text-gray-500 mt-auto flex flex-col gap-0.5">
        <span>{classItem.day}, {classItem.time}</span>
        {classItem.room && <span>{classItem.room}</span>}
      </div>
    </div>
  );
}
