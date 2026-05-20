import { useEffect, useState } from 'react';
import StudentAvatar from '../../ui/StudentAvatar';
import { getUniqueAnimalAvatars } from '../../../utils/avatarUtils';

// --- Types ----------------------------------------------------

interface Student {
  nim: string;
  name: string;
  picture?: string;
}

interface ClassItem {
  code: string;
  courseCode?: string;
  courseName?: string;
  day: string;
  time: string;
  room?: string;
  students?: Student[];
}

interface CompactClassCardProps {
  classItem: ClassItem;
  index?: number;
  onClick?: () => void;
}

// --- Komponen Utama -------------------------------------------

export default function CompactClassCard({ classItem, index = 0, onClick }: CompactClassCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);

    return () => clearTimeout(timer);
  }, [index]);

  const renderAvatars = () => {
    const list = classItem.students || [];

    if (list.length === 0) return null;

    const maxVisible = 4;
    const visibleStudents = list.slice(0, maxVisible);
    const extraCount = list.length - maxVisible;

    // Get unique fallbacks to ensure no duplicate animal images in the card stack
    const uniqueAnimals = getUniqueAnimalAvatars(visibleStudents);

    return (
      <div className="flex items-center -space-x-1.5 flex-shrink-0 pb-0.5 isolate pointer-events-none">
        {visibleStudents.map((student, idx) => {
          const zIndex = idx + 1; // Rightmost stacks on top of Leftmost
          return (
            <StudentAvatar
              key={student.nim || idx}
              nim={student.nim}
              name={student.name}
              picture={student.picture}
              fallbackAnimal={uniqueAnimals[idx]}
              sizeClassName="w-5.5 h-5.5"
              borderClassName="border-2 border-white dark:border-gray-900 shadow-xs"
              style={{ zIndex }}
            />
          );
        })}
        {extraCount > 0 && (
          <div
            style={{ zIndex: visibleStudents.length + 1 }}
            className="relative w-5.5 h-5.5 rounded-full bg-blue-600 border-2 border-white dark:border-gray-900 text-white flex items-center justify-center text-[8px] font-extrabold tracking-tighter shadow-xs select-none leading-none"
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-900 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col items-start pr-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 m-0 leading-tight mb-1">
            {classItem.courseName || 'Unknown Course'}
          </h3>
          {classItem.courseCode && (
            <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400">
              {classItem.courseCode}
            </span>
          )}
        </div>
        {(() => {
          const prefix = classItem.code[0]?.toUpperCase();
          let colorClass = 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
          if (prefix === 'K') colorClass = 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
          else if (prefix === 'P') colorClass = 'text-yellow-700 bg-yellow-100 dark:text-yellow-450 dark:bg-yellow-900/30';
          else if (prefix === 'R') colorClass = 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
          return (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 ${colorClass}`}>
              {classItem.code}
            </span>
          );
        })()}
      </div>
      <div className="mt-auto flex justify-between items-end gap-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-0.5 min-w-0">
          <span className="truncate">{classItem.day}, {classItem.time}</span>
          {classItem.room && <span className="truncate">{classItem.room}</span>}
        </div>
        {renderAvatars()}
      </div>
    </div>
  );
}
