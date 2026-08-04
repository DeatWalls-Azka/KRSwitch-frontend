import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getEnrollments, getClasses, createOffer, createBatchOffers, createPickDropOffer, getUsers, getOffers } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import type { ParallelClass, User } from '../../../types';
import { PACKAGE_PRESETS } from '../../../utils/presets';
import { OfferModalHeader } from './offerModal/OfferModalHeader';
import { SingleSwapSection } from './offerModal/SingleSwapSection';
import { BatchSwapSection } from './offerModal/BatchSwapSection';
import { DropSeatSection } from './offerModal/DropSeatSection';
import { OfferModalFooter } from './offerModal/OfferModalFooter';

// --- Types ----------------------------------------------------

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

interface CreateOfferFormProps {
  onSuccess?: () => void;
  onClose: () => void;
  enrollments?: import('../../../types').Enrollment[];
  parallelClasses?: import('../../../types').ParallelClass[];
}

interface ScheduleItem {
  day: string;
  timeStart: string;
  timeEnd: string;
}

interface BatchRow {
  myClassId: string;
  targetClassId: string;
}

// --- Helper Functions -----------------------------------------

function hasScheduleConflict(classA: ScheduleItem, classB: ScheduleItem): boolean {
  if (classA.day !== classB.day) return false;
  return classA.timeStart < classB.timeEnd && classB.timeStart < classA.timeEnd;
}

export function generatePresetRows(
  presetId: string,
  myClasses: EnrichedClass[],
  allClasses: ParallelClass[]
): BatchRow[] {
  const preset = PACKAGE_PRESETS.find((p) => p.id === presetId);
  if (!preset) return [];

  const rows: BatchRow[] = [];

  for (const spec of preset.courses) {
    for (const targetCode of spec.classCodes) {
      const studentClass = myClasses.find(
        (mc) => mc.courseCode === spec.courseCode && mc.classCode[0] === targetCode[0]
      );
      if (studentClass && studentClass.classCode !== targetCode) {
        const targetClass = allClasses.find(
          (ac) => ac.courseCode === spec.courseCode && ac.classCode === targetCode
        );
        if (targetClass) {
          rows.push({
            myClassId: studentClass.id.toString(),
            targetClassId: targetClass.id.toString(),
          });
        }
      }
    }
  }
  return rows;
}

function matchCurrentListToPreset(
  batchRows: BatchRow[],
  myClasses: EnrichedClass[],
  allClasses: ParallelClass[]
): string {
  if (batchRows.length === 0) return 'custom';

  const currentTargets: { [courseCode: string]: string } = {};
  for (const row of batchRows) {
    if (!row.myClassId || !row.targetClassId) return 'custom';
    const myC = myClasses.find((m) => m.id === parseInt(row.myClassId));
    const targetC = allClasses.find((a) => a.id === parseInt(row.targetClassId));
    if (!myC || !targetC) return 'custom';
    currentTargets[myC.courseCode] = targetC.classCode;
  }

  for (const preset of PACKAGE_PRESETS) {
    let match = true;
    let requiredSwapsCount = 0;

    for (const spec of preset.courses) {
      for (const targetCode of spec.classCodes) {
        const studentClass = myClasses.find(
          (mc) => mc.courseCode === spec.courseCode && mc.classCode[0] === targetCode[0]
        );
        if (studentClass && studentClass.classCode !== targetCode) {
          requiredSwapsCount++;
          if (currentTargets[spec.courseCode] !== targetCode) {
            match = false;
            break;
          }
        }
      }
      if (!match) break;
    }

    if (match && requiredSwapsCount > 0 && requiredSwapsCount === batchRows.length) {
      return preset.id;
    }
  }

  return 'custom';
}

const getClassCodeColor = (_code: string) => {
  return 'text-gray-800 dark:text-gray-200 font-bold';
};

// --- Main Orchestrator Component -----------------------------

export default function CreateOfferForm({
  onSuccess,
  onClose,
  enrollments: initialEnrollments,
  parallelClasses: initialClasses,
}: CreateOfferFormProps) {
  const [myClasses, setMyClasses] = useState<EnrichedClass[]>([]);
  const [allClasses, setAllClasses] = useState<ParallelClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();

  // Mode Selection: 'swap' | 'pick_drop'
  const [offerMode, setOfferMode] = useState<'swap' | 'pick_drop'>('swap');

  // Under 'swap' mode: 'single' | 'batch'
  const [swapType, setSwapType] = useState<'single' | 'batch'>('batch');

  // Under 'batch' mode: preset selection ('custom' | 'paket-1' | 'paket-2' | ...)
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');

  // Batch rows state
  const [batchRows, setBatchRows] = useState<BatchRow[]>([{ myClassId: '', targetClassId: '' }]);

  // Single swap state
  const [selectedMyClass, setSelectedMyClass] = useState('');
  const [selectedTargetClass, setSelectedTargetClass] = useState('');

  // Drop seat state
  const [dropType, setDropType] = useState<'open' | 'targeted'>('open');
  const [targetNim, setTargetNim] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [, setSkippedItems] = useState<{ myClassId: number; wantedClassId: number; reason: string }[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [activeOfferClassIds, setActiveOfferClassIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (error || successMessage) setShowMessage(true);
  }, [error, successMessage]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) {
        throw new Error('Pengguna tidak terautentikasi.');
      }

      let enrollments = initialEnrollments;
      let classes = initialClasses;

      const [enrollmentsRes, classesRes, usersRes, offersRes] = await Promise.all([
        enrollments ? Promise.resolve({ data: enrollments }) : getEnrollments(),
        classes ? Promise.resolve({ data: classes }) : getClasses(),
        getUsers(),
        getOffers(),
      ]);

      const fetchedEnrollments = enrollmentsRes.data;
      const fetchedClasses = classesRes.data;
      setUsers(usersRes.data);

      const activeIds = new Set<number>(
        offersRes.data
          .filter((o: any) => o.offererNim === user.nim && o.status === 'open')
          .map((o: any) => Number(o.myClassId))
      );
      setActiveOfferClassIds(activeIds);

      setAllClasses(fetchedClasses);

      const userEnrollments = fetchedEnrollments.filter((e) => e.nim === user.nim);
      const enrichedClasses = userEnrollments.map((enrollment) => {
        const classDetails = fetchedClasses.find((c) => c.id == enrollment.parallelClassId);
        if (!classDetails) {
          throw new Error(`Detail kelas untuk ID ${enrollment.parallelClassId} tidak ditemukan.`);
        }
        return {
          id: classDetails.id,
          courseCode: classDetails.courseCode,
          courseName: classDetails.courseName || classDetails.courseCode,
          classCode: classDetails.classCode,
          day: classDetails.day,
          timeStart: classDetails.timeStart,
          timeEnd: classDetails.timeEnd,
          room: classDetails.room,
        };
      });
      setMyClasses(enrichedClasses);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Single Swap Options ---
  const currentClass = myClasses.find((m) => m.id === parseInt(selectedMyClass));
  const otherOwnClasses = currentClass ? myClasses.filter((m) => m.id !== currentClass.id) : [];

  const displayedMyClasses = useMemo(() => {
    if (offerMode === 'swap') {
      return myClasses;
    }
    const groups: { [key: string]: EnrichedClass[] } = {};
    for (const c of myClasses) {
      if (!groups[c.courseCode]) groups[c.courseCode] = [];
      groups[c.courseCode].push(c);
    }
    return Object.values(groups).map((group) => {
      const first = group[0];
      const classCodes = group.map((c) => c.classCode).join(' & ');
      return {
        ...first,
        displayLabel: `${first.courseName} (Paket: ${classCodes})`,
      };
    });
  }, [myClasses, offerMode]);

  const availableTargets = allClasses
    .filter((c) => {
      if (!currentClass) return false;
      return (
        c.courseCode === currentClass.courseCode &&
        c.classCode[0] === currentClass.classCode[0] &&
        c.id !== currentClass.id
      );
    })
    .map((c) => ({
      ...c,
      conflictWith: otherOwnClasses.find((own) => hasScheduleConflict(own, c)) || null,
    }));

  const selectedTarget = availableTargets.find((c) => c.id === parseInt(selectedTargetClass));
  const selectedTargetHasConflict = selectedTarget?.conflictWith;

  // --- Preset Selection Handler ---
  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    setError('');
    if (presetId === 'custom') {
      if (batchRows.length === 0) {
        setBatchRows([{ myClassId: '', targetClassId: '' }]);
      }
    } else {
      const rows = generatePresetRows(presetId, myClasses, allClasses);
      setBatchRows(rows.length > 0 ? rows : [{ myClassId: '', targetClassId: '' }]);
    }
  };

  // --- Batch Row Modification Handler with Auto-Detect ---
  const handleBatchRowChange = (index: number, field: 'myClassId' | 'targetClassId', val: string) => {
    setBatchRows((prev) => {
      const copy = [...prev];
      if (field === 'myClassId') {
        copy[index] = { myClassId: val, targetClassId: '' };
      } else {
        copy[index] = { ...copy[index], targetClassId: val };
      }

      const matchedPreset = matchCurrentListToPreset(copy, myClasses, allClasses);
      setSelectedPreset(matchedPreset);
      return copy;
    });
  };

  const handleAddBatchRow = () => {
    if (batchRows.length >= 10) return;
    const updated = [...batchRows, { myClassId: '', targetClassId: '' }];
    setBatchRows(updated);
    const matched = matchCurrentListToPreset(updated, myClasses, allClasses);
    setSelectedPreset(matched);
  };

  const handleRemoveBatchRow = (index: number) => {
    const updated = batchRows.filter((_, i) => i !== index);
    setBatchRows(updated);
    const matched = matchCurrentListToPreset(updated, myClasses, allClasses);
    setSelectedPreset(matched);
  };

  // --- Calculate Row Conflicts & Breakdown ---
  const rowConflictDetails = useMemo(() => {
    const batchReplacedMyClassIds = batchRows.map((r) => parseInt(r.myClassId)).filter(Boolean);

    const sourceCounts: Record<string, number> = {};
    const targetCounts: Record<string, number> = {};
    for (const r of batchRows) {
      if (r.myClassId) sourceCounts[r.myClassId] = (sourceCounts[r.myClassId] || 0) + 1;
      if (r.targetClassId) targetCounts[r.targetClassId] = (targetCounts[r.targetClassId] || 0) + 1;
    }

    const rowTargets = batchRows.map((r) =>
      r.targetClassId ? allClasses.find((a) => a.id === parseInt(r.targetClassId)) || null : null
    );

    return batchRows.map((r, idx) => {
      if (!r.myClassId || !r.targetClassId) {
        return { rowIdx: idx, conflictMessage: null };
      }

      const myId = parseInt(r.myClassId);
      const targetId = parseInt(r.targetClassId);

      if (myId === targetId) {
        return { rowIdx: idx, conflictMessage: 'kelas yang sama (tidak ada perubahan)' };
      }

      if (activeOfferClassIds.has(myId)) {
        return { rowIdx: idx, conflictMessage: 'sudah ada penawaran aktif' };
      }

      if (sourceCounts[r.myClassId] > 1) {
        return { rowIdx: idx, conflictMessage: 'kelas sumber dipilih lebih dari sekali' };
      }

      if (targetCounts[r.targetClassId] > 1) {
        return { rowIdx: idx, conflictMessage: 'kelas target dipilih lebih dari sekali' };
      }

      const targetC = rowTargets[idx];
      if (!targetC) return { rowIdx: idx, conflictMessage: null };

      const conflicts: string[] = [];

      const remainingEnrolledClasses = myClasses.filter((mc) => !batchReplacedMyClassIds.includes(mc.id));
      for (const oc of remainingEnrolledClasses) {
        if (hasScheduleConflict(oc, targetC)) {
          conflicts.push(`bentrok dengan ${oc.courseCode}`);
        }
      }

      for (let otherIdx = 0; otherIdx < batchRows.length; otherIdx++) {
        if (otherIdx === idx) continue;
        const otherTargetC = rowTargets[otherIdx];
        if (otherTargetC && hasScheduleConflict(targetC, otherTargetC)) {
          conflicts.push(`bentrok dengan ${otherTargetC.courseCode}`);
        }
      }

      if (conflicts.length > 0) {
        const uniqueConflicts = Array.from(new Set(conflicts));
        return { rowIdx: idx, conflictMessage: uniqueConflicts.join(', ') };
      }

      return { rowIdx: idx, conflictMessage: null };
    });
  }, [batchRows, myClasses, allClasses, activeOfferClassIds]);

  const bentrokCount = useMemo(() => {
    return rowConflictDetails.filter((d) => d.conflictMessage !== null).length;
  }, [rowConflictDetails]);

  // Submit Disabled Reason
  const submitDisabledReason = useMemo(() => {
    if (loading) return 'Sedang memproses penawaran...';
    if (successMessage) return '';

    if (offerMode === 'swap') {
      if (swapType === 'single') {
        if (!selectedMyClass) return '';
        if (activeOfferClassIds.has(parseInt(selectedMyClass)))
          return 'Kelas ini sudah memiliki penawaran aktif yang sedang berjalan.';
        if (!selectedTargetClass) return '';
        if (selectedTargetHasConflict)
          return `Jadwal target bentrok dengan kelas ${selectedTargetHasConflict.courseCode}-${selectedTargetHasConflict.classCode} (${selectedTargetHasConflict.day} ${selectedTargetHasConflict.timeStart}-${selectedTargetHasConflict.timeEnd}).`;
      } else {
        if (batchRows.length === 0) return '';

        const myClassIds = batchRows.map((r) => r.myClassId);
        if (new Set(myClassIds).size !== myClassIds.length)
          return 'Terdapat kelas sumber yang sama dipilih lebih dari sekali.';

        for (let idx = 0; idx < batchRows.length; idx++) {
          const r = batchRows[idx];
          if (!r.myClassId || !r.targetClassId) return '';
        }

        // Bentrok warnings are displayed per row in the batch table directly
      }
    } else {
      if (!selectedMyClass) return '';
      if (activeOfferClassIds.has(parseInt(selectedMyClass))) return 'Kelas ini sudah memiliki penawaran aktif.';
      if (dropType === 'targeted' && !users.some((u) => u.role === 'student' && u.nim === targetNim.trim())) {
        return '';
      }
    }

    return '';
  }, [
    loading,
    successMessage,
    offerMode,
    swapType,
    selectedMyClass,
    selectedTargetClass,
    selectedTargetHasConflict,
    batchRows,
    activeOfferClassIds,
    dropType,
    targetNim,
    users,
  ]);

  const isSubmitDisabled =
    !!submitDisabledReason ||
    !!successMessage ||
    loading ||
    (offerMode === 'swap' &&
      (swapType === 'single'
        ? !selectedMyClass || !selectedTargetClass
        : batchRows.length === 0 || bentrokCount > 0 || batchRows.some((r) => !r.myClassId || !r.targetClassId))) ||
    (offerMode === 'pick_drop' &&
      (!selectedMyClass || (dropType === 'targeted' && !users.some((u) => u.role === 'student' && u.nim === targetNim.trim()))));

  // --- Submit Handler ---
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setSkippedItems([]);
    setShowMessage(false);

    try {
      if (offerMode === 'swap') {
        if (swapType === 'single') {
          const res = await createOffer({
            myClassId: parseInt(selectedMyClass),
            wantedClassId: parseInt(selectedTargetClass),
          });
          if (onSuccess) onSuccess();
          setSuccessMessage(
            res.data.isAutoMatched
              ? 'Auto-match! Pertukaran otomatis oleh sistem.'
              : 'Penawaran berhasil dibuat!'
          );
        } else {
          const offersPayload = batchRows.map((r) => ({
            myClassId: parseInt(r.myClassId),
            wantedClassId: parseInt(r.targetClassId),
          }));

          const res = await createBatchOffers({ offers: offersPayload });
          if (onSuccess) onSuccess();

          setSkippedItems(res.data.skipped);
          setSuccessMessage(`Berhasil membuat ${res.data.created.length} penawaran batch!`);
        }
      } else {
        const res = await createPickDropOffer({
          myClassId: parseInt(selectedMyClass),
          reservedForNim: dropType === 'targeted' ? targetNim.trim() : undefined,
        });
        if (onSuccess) onSuccess();
        setSuccessMessage(
          dropType === 'targeted'
            ? `Seat berhasil dilepas khusus untuk NIM ${targetNim}!`
            : 'Seat berhasil dilepas ke publik (Free-for-all)!'
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      if (err.response?.data?.skipped) {
        setSkippedItems(err.response.data.skipped);
      }
    } finally {
      setLoading(false);
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBodyHeight(entry.contentRect.height);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 150);
  };

  const handleBackdropClick = () => {
    if (!loading) handleClose();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) handleClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-900/60 dark:bg-black/80 z-50 p-3 sm:p-4 flex items-center justify-center ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg my-auto relative max-h-[90vh] flex flex-col">
        <div
          className={`bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 ease-out ${
            isClosing ? 'animate-popDown' : 'animate-popUp'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <OfferModalHeader
            offerMode={offerMode}
            setOfferMode={setOfferMode}
            onClose={handleClose}
            loading={loading}
            clearError={() => setError('')}
          />

          {/* Animated Body Content Container */}
          <div
            className="flex-1 min-h-0 overflow-y-auto transition-[height] duration-300 ease-out"
            style={{ height: bodyHeight !== undefined ? `${bodyHeight}px` : 'auto' }}
          >
            <div ref={contentRef}>
              <div key={offerMode} className="px-4 md:px-8 pt-3.5 pb-2 space-y-3">
                {offerMode === 'swap' ? (
                  <>
                    {swapType === 'single' ? (
                      <SingleSwapSection
                        swapType={swapType}
                        setSwapType={setSwapType}
                        selectedMyClass={selectedMyClass}
                        setSelectedMyClass={setSelectedMyClass}
                        selectedTargetClass={selectedTargetClass}
                        setSelectedTargetClass={setSelectedTargetClass}
                        myClasses={myClasses}
                        displayedMyClasses={displayedMyClasses}
                        availableTargets={availableTargets}
                        activeOfferClassIds={activeOfferClassIds}
                        loading={loading}
                        clearError={() => setError('')}
                        getClassCodeColor={getClassCodeColor}
                      />
                    ) : (
                      <BatchSwapSection
                        swapType={swapType}
                        setSwapType={setSwapType}
                        selectedPreset={selectedPreset}
                        handleSelectPreset={handleSelectPreset}
                        batchRows={batchRows}
                        handleBatchRowChange={handleBatchRowChange}
                        handleAddBatchRow={handleAddBatchRow}
                        handleRemoveBatchRow={handleRemoveBatchRow}
                        rowConflictDetails={rowConflictDetails}
                        bentrokCount={bentrokCount}
                        myClasses={myClasses}
                        allClasses={allClasses}
                        activeOfferClassIds={activeOfferClassIds}
                        clearError={() => setError('')}
                        getClassCodeColor={getClassCodeColor}
                      />
                    )}
                  </>
                ) : (
                  <DropSeatSection
                    selectedMyClass={selectedMyClass}
                    setSelectedMyClass={setSelectedMyClass}
                    myClasses={myClasses}
                    displayedMyClasses={displayedMyClasses}
                    dropType={dropType}
                    setDropType={setDropType}
                    targetNim={targetNim}
                    setTargetNim={setTargetNim}
                    isDropdownOpen={isDropdownOpen}
                    setIsDropdownOpen={setIsDropdownOpen}
                    users={users}
                    currentUserNim={user?.nim}
                    activeOfferClassIds={activeOfferClassIds}
                    loading={loading}
                    clearError={() => setError('')}
                  />
                )}
              </div>
            </div>
          </div>

          <OfferModalFooter
            submitDisabledReason={submitDisabledReason}
            isSubmitDisabled={isSubmitDisabled}
            error={error}
            successMessage={successMessage}
            showMessage={showMessage}
            loading={loading}
            offerMode={offerMode}
            swapType={swapType}
            batchRowCount={batchRows.length}
            handleClose={handleClose}
            handleSubmit={handleSubmit}
          />
        </div>

        {/* Floating Feedback Banner Below Modal Card */}
        <div className="h-12 flex items-start justify-center pt-3" onClick={(e) => e.stopPropagation()}>
          {error && (
            <div className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg animate-shake">
              {error}
            </div>
          )}
          {successMessage && (
            <div
              className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg"
              style={showMessage ? { animation: 'shake 0.25s ease-in-out' } : {}}
            >
              {successMessage}
            </div>
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes popUp { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes popDown { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0; } }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        .animate-popUp { animation: popUp 0.15s ease-out; }
        .animate-popDown { animation: popDown 0.15s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
        .animate-fadeOut { animation: fadeOut 0.15s ease-out; }
        .animate-shake { animation: shake 0.25s ease-in-out; }
      `,
        }}
      />
    </div>
  );
}
