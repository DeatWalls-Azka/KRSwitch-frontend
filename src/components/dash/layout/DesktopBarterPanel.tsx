import React from 'react';
import FilterButton from '../tabs/FilterButton';

interface DesktopBarterPanelProps {
  offersCount: number;
  selectedCourseCode?: string;
  isKelasSaya: boolean;
  filterByCourse: boolean;
  setFilterByCourse: (val: boolean) => void;
  filterForYou: boolean;
  setFilterForYou: (val: boolean) => void;
  filterByYou: boolean;
  setFilterByYou: (val: boolean) => void;
  onOpenCreateOffer: () => void;
  children: React.ReactNode;
}

export default function DesktopBarterPanel({
  offersCount,
  selectedCourseCode,
  isKelasSaya,
  filterByCourse,
  setFilterByCourse,
  filterForYou,
  setFilterForYou,
  filterByYou,
  setFilterByYou,
  onOpenCreateOffer,
  children
}: DesktopBarterPanelProps) {
  return (
    <div className="hidden md:flex w-[470px] shrink-0 bg-white flex-col overflow-hidden border-l border-gray-200">
      <div className="flex flex-col items-left px-4 py-3 bg-gray-50 shrink-0 border-b border-gray-200">
        <div className="flex flex-row gap-1 items-center">
          <div className="mr-auto flex flex-col items-left">
            <h2 className="text-xs font-bold text-gray-900">LIVE BARTER FEED PANEL</h2>
            <h1 className="text-[11px] font-medium text-gray-600">Real Time: {offersCount} Offers</h1>
          </div>
          <FilterButton
            label="ALL"
            isActive={!filterByCourse && !filterForYou && !filterByYou}
            onClick={() => {
              setFilterByCourse(false);
              setFilterForYou(false);
              setFilterByYou(false);
            }}
          />
          {!isKelasSaya && (
            <FilterButton
              label={selectedCourseCode || 'MATKUL'}
              isActive={filterByCourse}
              onClick={() => setFilterByCourse(!filterByCourse)}
            />
          )}
          <FilterButton
            label="BY YOU"
            isActive={filterByYou}
            onClick={() => {
              const newVal = !filterByYou;
              setFilterByYou(newVal);
              if (newVal) setFilterForYou(false);
            }}
          />
          <FilterButton
            label="FOR YOU"
            isActive={filterForYou}
            onClick={() => {
              const newVal = !filterForYou;
              setFilterForYou(newVal);
              if (newVal) setFilterByYou(false);
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {children}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={onOpenCreateOffer}
          className="w-full bg-green-600 text-white text-[11px] font-bold py-2 px-2.5 border-0 cursor-pointer hover:bg-green-700 active:bg-green-800 transition-colors rounded-sm"
        >
          CREATE BARTER OFFER
        </button>
      </div>
    </div>
  );
}
