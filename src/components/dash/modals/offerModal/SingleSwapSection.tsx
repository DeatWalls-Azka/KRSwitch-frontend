import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { cn } from '../../../../utils/styleUtils';

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

interface TargetClassWithConflict {
  id: number;
  courseCode: string;
  courseName?: string;
  classCode: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  conflictWith: EnrichedClass | null;
}

interface SingleSwapSectionProps {
  swapType: 'single' | 'batch';
  setSwapType: (type: 'single' | 'batch') => void;
  selectedMyClass: string;
  setSelectedMyClass: (val: string) => void;
  selectedTargetClass: string;
  setSelectedTargetClass: (val: string) => void;
  myClasses: EnrichedClass[];
  displayedMyClasses: EnrichedClass[];
  availableTargets: TargetClassWithConflict[];
  activeOfferClassIds: Set<number>;
  loading: boolean;
  clearError: () => void;
  getClassCodeColor: (code: string) => string;
}

export const SingleSwapSection: React.FC<SingleSwapSectionProps> = ({
  swapType,
  setSwapType,
  selectedMyClass,
  setSelectedMyClass,
  selectedTargetClass,
  setSelectedTargetClass,
  myClasses,
  displayedMyClasses,
  availableTargets,
  activeOfferClassIds,
  loading,
  clearError,
  getClassCodeColor,
}) => {
  return (
    <div key={swapType} className="space-y-3">
      {/* Inline Selector Row 1: Tipe Selector */}
      <div className="flex items-center gap-2 text-[11px] sm:text-xs animate-tab-content opacity-0 stagger-1">
        <span className="text-gray-500 dark:text-gray-400 font-bold">Tipe:</span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setSwapType('single');
              clearError();
            }}
            className={`transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${swapType === 'single'
                ? 'font-bold text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            Tukar Sekelas
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setSwapType('batch');
              clearError();
            }}
            className={`transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${swapType === 'batch'
                ? 'font-bold text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            Tukar Banyak (Batch)
          </button>
        </div>
      </div>

      <div className="animate-tab-content opacity-0 stagger-2">
        <label className="block text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
          Kelas Saya
        </label>
        <Select
          value={selectedMyClass}
          onValueChange={(val) => {
            setSelectedMyClass(val);
            setSelectedTargetClass('');
            clearError();
          }}
          disabled={loading || myClasses.length === 0}
        >
          <SelectTrigger className="w-full bg-gray-50/50 dark:bg-gray-950/30 border dark:border-gray-800 dark:text-gray-200">
            <SelectValue placeholder={myClasses.length === 0 ? '-- Memuat...' : '-- Pilih Kelas --'} />
          </SelectTrigger>
          <SelectContent>
            {displayedMyClasses.map((c) => {
              const hasActiveOffer = activeOfferClassIds.has(c.id);
              return (
                <SelectItem key={c.id} value={c.id.toString()} disabled={hasActiveOffer}>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{(c as any).displayLabel || `${c.courseName} (${c.classCode}) - ${c.day}`}</span>
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

      <div className="animate-tab-content opacity-0 stagger-3">
        <label className="block text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
          Tukar Ke
        </label>
        <Select
          value={selectedTargetClass}
          onValueChange={(val) => {
            setSelectedTargetClass(val);
            clearError();
          }}
          disabled={!selectedMyClass || loading}
        >
          <SelectTrigger className="w-full bg-gray-50/50 dark:bg-gray-950/30 border dark:border-gray-800 dark:text-gray-200">
            <SelectValue
              placeholder={
                !selectedMyClass
                  ? '-- Pilih kelas sumber dulu --'
                  : availableTargets.length === 0
                    ? '-- Tidak ada kelas lain --'
                    : '-- Pilih Target --'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableTargets.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()} disabled={!!c.conflictWith}>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className={cn('font-bold shrink-0', getClassCodeColor(c.classCode))}>
                    [{c.classCode}]
                  </span>
                  <span className="text-[11px] text-gray-500 shrink-0">
                    - {c.day}, {c.timeStart}
                  </span>
                  {c.conflictWith && (
                    <span className="text-[10px] text-red-500 font-bold shrink-0">[bentrok]</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
