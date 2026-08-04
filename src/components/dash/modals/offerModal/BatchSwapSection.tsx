import React from 'react';
import { PACKAGE_PRESETS } from '../../../../utils/presets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { cn } from '../../../../utils/styleUtils';
import { Plus, ArrowRight, Trash2 } from 'lucide-react';
import type { ParallelClass } from '../../../../types';
import { generatePresetRows } from '../CreateOfferModal';

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

interface BatchRow {
  myClassId: string;
  targetClassId: string;
}

interface BatchSwapSectionProps {
  swapType: 'single' | 'batch';
  setSwapType: (type: 'single' | 'batch') => void;
  selectedPreset: string;
  handleSelectPreset: (presetId: string) => void;
  batchRows: BatchRow[];
  handleBatchRowChange: (index: number, field: 'myClassId' | 'targetClassId', val: string) => void;
  handleAddBatchRow: () => void;
  handleRemoveBatchRow: (index: number) => void;
  rowConflictDetails: { rowIdx: number; conflictMessage: string | null }[];
  bentrokCount: number;
  myClasses: EnrichedClass[];
  allClasses: ParallelClass[];
  activeOfferClassIds: Set<number>;
  clearError: () => void;
  getClassCodeColor: (code: string) => string;
}

export const BatchSwapSection: React.FC<BatchSwapSectionProps> = ({
  swapType,
  setSwapType,
  selectedPreset,
  handleSelectPreset,
  batchRows,
  handleBatchRowChange,
  handleAddBatchRow,
  handleRemoveBatchRow,
  rowConflictDetails,
  bentrokCount,
  myClasses,
  allClasses,
  activeOfferClassIds,
  clearError,
  getClassCodeColor,
}) => {
  return (
    <div key={swapType} className="space-y-2">
      {/* Inline Selector Row 1: Tipe Selector */}
      <div className="flex items-center gap-2 text-[11px] sm:text-xs animate-tab-content opacity-0 stagger-1">
        <span className="text-gray-500 dark:text-gray-400 font-bold">Tipe:</span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSwapType('single');
              clearError();
            }}
            className={`transition-colors cursor-pointer ${
              swapType === 'single'
                ? 'font-bold text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Tukar 1 Kelas
          </button>
          <button
            type="button"
            onClick={() => {
              setSwapType('batch');
              clearError();
            }}
            className={`transition-colors cursor-pointer ${
              swapType === 'batch'
                ? 'font-bold text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Tukar Banyak (Batch)
          </button>
        </div>
      </div>

      {/* Inline Selector Row 2: Preset Selector (When batch is active) */}
      {swapType === 'batch' && (
        <div className="flex items-center gap-2 text-[11px] sm:text-xs overflow-x-auto pb-0.5 animate-tab-content opacity-0 stagger-2">
          <span className="text-gray-500 dark:text-gray-400 font-bold shrink-0">Preset:</span>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectPreset('custom')}
              className={`transition-colors cursor-pointer ${
                selectedPreset === 'custom'
                  ? 'font-bold text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Custom
            </button>
            {PACKAGE_PRESETS.map((preset) => {
              const isZeroOffer =
                myClasses.length > 0 &&
                generatePresetRows(preset.id, myClasses, allClasses).length === 0;

              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isZeroOffer}
                  title={isZeroOffer ? 'Anda sudah berada di paket ini' : undefined}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    selectedPreset === preset.id
                      ? 'font-bold text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-500 font-semibold hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BATCH ROWS TABLE */}
      {swapType === 'batch' && (
        <div className="space-y-0.5 pt-0.5 animate-tab-content opacity-0 stagger-3">
          {/* Header Row: count · conflicts + Tambah kelas button */}
          <div className="flex items-center justify-between pb-0.5">
            <div className="text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400">
              <span>{batchRows.length} penawaran</span>
              {bentrokCount > 0 ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500 mx-1">·</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">{bentrokCount} bentrok</span>
                </>
              ) : batchRows.length > 0 && batchRows.every((r) => r.myClassId && r.targetClassId) ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500 mx-1">·</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">siap dikirim</span>
                </>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleAddBatchRow}
              disabled={batchRows.length >= 10}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[11px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-0.5 cursor-pointer"
            >
              <span>+ Tambah Kelas</span>
            </button>
          </div>

          {/* Batch Items List */}
          <div className="divide-y divide-gray-200/60 dark:divide-gray-800/60 border-t border-b border-gray-200 dark:border-gray-800 max-h-[260px] sm:max-h-[300px] overflow-y-auto pr-1">
            {batchRows.map((row, idx) => {
              const currentMyClass = myClasses.find((m) => m.id === parseInt(row.myClassId));
              const availableRowTargets = currentMyClass
                ? allClasses.filter(
                  (c) =>
                    c.courseCode === currentMyClass.courseCode &&
                    c.classCode[0] === currentMyClass.classCode[0] &&
                    c.id !== currentMyClass.id
                )
                : [];

              const targetClassObj = availableRowTargets.find((c) => c.id === parseInt(row.targetClassId));
              const conflictMsg = rowConflictDetails[idx]?.conflictMessage;

              return (
                <div
                  key={idx}
                  className="group py-0.5 px-1.5 -mx-1.5 rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800/40 flex items-center justify-between gap-1.5 text-xs transition-all"
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {/* Source Class Select */}
                    <div className="w-28 sm:w-36 shrink-0">
                      <Select
                        value={row.myClassId}
                        onValueChange={(val) => handleBatchRowChange(idx, 'myClassId', val)}
                      >
                        <SelectTrigger
                          chevronClassName="opacity-0 group-hover:opacity-40 transition-opacity"
                          className="w-full h-6.5 text-[11px] bg-transparent border border-transparent shadow-none hover:bg-white dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xs focus:bg-white dark:focus:bg-gray-900 focus:border-gray-400 dark:focus:border-gray-600 px-1.5 transition-all group-hover:border-gray-200 dark:group-hover:border-gray-800"
                        >
                          <SelectValue placeholder="Pilih Kelas" />
                        </SelectTrigger>
                        <SelectContent className="!w-[340px] max-w-[90vw]">
                          {myClasses.map((c) => {
                            const isAlreadyOffered = activeOfferClassIds.has(c.id);
                            return (
                              <SelectItem key={c.id} value={c.id.toString()} disabled={isAlreadyOffered}>
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={cn('font-bold shrink-0', getClassCodeColor(c.classCode))}>
                                    [{c.classCode}]
                                  </span>
                                  <span className="font-medium text-xs text-gray-800 dark:text-gray-200 truncate">
                                    {c.courseName}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />

                    {/* Target Class Select */}
                    <div className="shrink-0">
                      <Select
                        value={row.targetClassId}
                        onValueChange={(val) => handleBatchRowChange(idx, 'targetClassId', val)}
                        disabled={!row.myClassId}
                      >
                        <SelectTrigger
                          chevronClassName="opacity-0 group-hover:opacity-40 transition-opacity ml-0.5"
                          className="h-6.5 text-[11px] bg-transparent border border-transparent shadow-none hover:bg-white dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xs focus:bg-white dark:focus:bg-gray-900 focus:border-gray-400 dark:focus:border-gray-600 px-1 transition-all group-hover:border-gray-200 dark:group-hover:border-gray-800"
                        >
                          <SelectValue placeholder="Target" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[120px]">
                          {availableRowTargets.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              <span className={cn('font-bold shrink-0', getClassCodeColor(c.classCode))}>
                                {c.classCode}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Schedule & Conflict Text */}
                    <div className="flex-1 min-w-0 pl-0 truncate">
                      {conflictMsg ? (
                        <span
                          className="text-red-600 dark:text-red-400 font-bold text-[11px] sm:text-xs truncate block"
                          title={conflictMsg}
                        >
                          {targetClassObj ? `${targetClassObj.day}: ` : ''}
                          {conflictMsg}
                        </span>
                      ) : targetClassObj ? (
                        <span className="text-gray-700 dark:text-gray-300 font-semibold text-[11px] sm:text-xs truncate block">
                          {targetClassObj.day}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-[11px] italic block">pilih target</span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveBatchRow(idx)}
                    className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-all"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
