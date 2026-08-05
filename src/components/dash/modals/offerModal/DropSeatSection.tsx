import React, { useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { Info } from 'lucide-react';
import type { User } from '../../../../types';

interface EnrichedClass {
  id: number;
  courseCode: string;
  courseName: string;
  classCode: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string;
}

interface DropSeatSectionProps {
  selectedMyClass: string;
  setSelectedMyClass: (val: string) => void;
  myClasses: EnrichedClass[];
  displayedMyClasses: EnrichedClass[];
  dropType: 'open' | 'targeted';
  setDropType: (val: 'open' | 'targeted') => void;
  targetNim: string;
  setTargetNim: (val: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (val: boolean) => void;
  users: User[];
  currentUserNim?: string;
  activeOfferClassIds: Set<number>;
  loading: boolean;
  clearError: () => void;
}

export const DropSeatSection: React.FC<DropSeatSectionProps> = ({
  selectedMyClass,
  setSelectedMyClass,
  myClasses,
  displayedMyClasses,
  dropType,
  setDropType,
  targetNim,
  setTargetNim,
  isDropdownOpen,
  setIsDropdownOpen,
  users,
  currentUserNim,
  activeOfferClassIds,
  loading,
  clearError,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsDropdownOpen]);

  const filteredUsers = users.filter(
    (u) =>
      u.role === 'student' &&
      (!currentUserNim || u.nim.toUpperCase() !== currentUserNim.toUpperCase()) &&
      (!targetNim ||
        u.nim.toLowerCase().includes(targetNim.toLowerCase()) ||
        u.name.toLowerCase().includes(targetNim.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <div className="animate-tab-content opacity-0 stagger-1">
        <label className="block text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
          Kelas yang Ingin Dilepas (Drop)
        </label>
        <Select
          value={selectedMyClass}
          onValueChange={(val) => {
            setSelectedMyClass(val);
            clearError();
          }}
          disabled={loading || myClasses.length === 0}
        >
          <SelectTrigger className="w-full bg-gray-50/50 dark:bg-gray-950/30 border dark:border-gray-800 dark:text-gray-200">
            <SelectValue placeholder={myClasses.length === 0 ? '-- Memuat...' : '-- Pilih Kelas --'} />
          </SelectTrigger>
          <SelectContent>
            {displayedMyClasses.map((c) => {
              const hasActiveOffer = myClasses
                .filter((m) => m.courseCode === c.courseCode)
                .some((m) => activeOfferClassIds.has(m.id));
              return (
                <SelectItem key={c.id} value={c.id.toString()} disabled={hasActiveOffer}>
                  <div className="flex items-center justify-between w-full">
                    <span>{(c as any).displayLabel || `${c.courseName} (${c.classCode}) - ${c.day}`}</span>
                    {hasActiveOffer && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold ml-2 shrink-0">
                        (Sudah ada penawaran)
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-lg animate-tab-content opacity-0 stagger-2">
        <div className="text-[10px] sm:text-xs text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/50 p-2 rounded border border-red-200 dark:border-red-800 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Melepas kelas ini akan secara otomatis melepas <strong>seluruh kelas</strong> untuk mata kuliah ini (Kuliah & Praktikum).
          </span>
        </div>
        <label className="block text-xs text-red-900 dark:text-red-200 font-bold mt-2">
          Tipe Drop Seat
        </label>
        <div className="flex gap-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <label className={`flex items-center gap-1.5 ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
              type="radio"
              name="dropType"
              disabled={loading}
              checked={dropType === 'open'}
              onChange={() => setDropType('open')}
              className="text-red-600 focus:ring-red-500"
            />
            <span>Bebas (Siapa Saja)</span>
          </label>
          <label className={`flex items-center gap-1.5 ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
              type="radio"
              name="dropType"
              disabled={loading}
              checked={dropType === 'targeted'}
              onChange={() => setDropType('targeted')}
              className="text-red-600 focus:ring-red-500"
            />
            <span>Khusus Orang</span>
          </label>
        </div>

        {dropType === 'targeted' && (
          <div key="targeted-input" className="mt-2 relative animate-tab-content opacity-0 stagger-1" ref={dropdownRef}>
            <label className="block text-[11px] text-gray-600 dark:text-gray-400 font-semibold mb-1">
              NIM Penerima Khusus
            </label>
            <input
              type="text"
              placeholder="Contoh: M0403241075 atau Nama"
              value={targetNim}
              disabled={loading}
              onChange={(e) => {
                setTargetNim(e.target.value.toUpperCase());
                setIsDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                }
              }}
              onFocus={() => !loading && setIsDropdownOpen(true)}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {isDropdownOpen && (
              <div className="absolute top-full mt-1 z-50 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl max-h-40 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.slice(0, 10).map((u) => (
                    <button
                      key={u.nim}
                      type="button"
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-hidden flex items-center justify-between"
                      onClick={() => {
                        setTargetNim(u.nim);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="font-mono font-bold text-gray-900 dark:text-gray-100">{u.nim}</span>
                      <span className="text-[10px] text-gray-500 truncate ml-2 text-right">{u.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500 text-center">NIM/Nama tidak ditemukan</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
