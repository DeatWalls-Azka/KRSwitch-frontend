import React, { useState, useEffect } from 'react';
import { getEnrollments, getClasses, createOffer } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import type { ParallelClass, User } from '../../../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { cn } from '../../../utils/styleUtils';

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
}

interface ScheduleItem {
  day: string;
  timeStart: string;
  timeEnd: string;
}

// --- Helper Functions -----------------------------------------

function hasScheduleConflict(classA: ScheduleItem, classB: ScheduleItem): boolean {
  if (classA.day !== classB.day) return false;
  return classA.timeStart < classB.timeEnd && classB.timeStart < classA.timeEnd;
}

// --- Komponen Utama -------------------------------------------

export default function CreateOfferForm({ onSuccess, onClose }: CreateOfferFormProps) {
  const [myClasses, setMyClasses] = useState<EnrichedClass[]>([]);
  const [allClasses, setAllClasses] = useState<ParallelClass[]>([]);
  const { user } = useAuth();

  const [selectedMyClass, setSelectedMyClass] = useState('');
  const [selectedTargetClass, setSelectedTargetClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

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

      const [enrollmentsRes, classesRes] = await Promise.all([
        getEnrollments(),
        getClasses()
      ]);

      const enrollments = enrollmentsRes.data;
      const classes = classesRes.data;

      setAllClasses(classes);

      const userEnrollments = enrollments.filter(e => e.nim === user.nim);
      const enrichedClasses = userEnrollments.map(enrollment => {
        const classDetails = classes.find(c => c.id === enrollment.parallelClassId);
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

  const currentClass = myClasses.find(m => m.id === parseInt(selectedMyClass));
  const otherOwnClasses = currentClass ? myClasses.filter(m => m.id !== currentClass.id) : [];

  const availableTargets = allClasses
    .filter(c => {
      if (!currentClass) return false;
      return (
        c.courseCode === currentClass.courseCode &&
        c.classCode[0] === currentClass.classCode[0] &&
        c.id !== currentClass.id
      );
    })
    .map(c => ({
      ...c,
      conflictWith: otherOwnClasses.find(own => hasScheduleConflict(own, c)) || null
    }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setShowMessage(false);

    try {
      const res = await createOffer({
        myClassId: parseInt(selectedMyClass),
        wantedClassId: parseInt(selectedTargetClass),
      });
      if (onSuccess) onSuccess();
      setSuccessMessage(res.data.isAutoMatched
        ? 'Auto-match! Pertukaran otomatis oleh sistem.'
        : 'Offer created successfully!'
      );
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 150);
  };

  const handleBackdropClick = () => { if (!loading) handleClose(); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Escape' && !loading) handleClose(); };

  const selectedTarget = availableTargets.find(c => c.id === parseInt(selectedTargetClass));
  const selectedTargetHasConflict = selectedTarget?.conflictWith;

  return (
    <div
      className={`fixed inset-0 bg-gray-900/60 dark:bg-black/80 z-50 p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 md:px-0">
        <div
          className={`bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-2xl relative ${isClosing ? 'animate-popDown' : 'animate-popUp'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-250 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="space-y-4 mx-8 pt-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center">Create New Offer</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
                  Kelas Saya
                </label>
                <Select
                  value={selectedMyClass}
                  onValueChange={(val) => {
                    setSelectedMyClass(val);
                    setSelectedTargetClass('');
                    setError('');
                  }}
                  disabled={loading || myClasses.length === 0}
                >
                  <SelectTrigger className="w-full bg-gray-50/50 dark:bg-gray-950/30 border dark:border-gray-800 dark:text-gray-200">
                    <SelectValue placeholder={myClasses.length === 0 ? '-- Loading...' : '-- Pilih Kelas --'} />
                  </SelectTrigger>
                  <SelectContent>
                    {myClasses.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.courseName} ({c.classCode}) - {c.day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
                  Tukar Ke
                </label>
                <Select
                  value={selectedTargetClass}
                  onValueChange={(val) => {
                    setSelectedTargetClass(val);
                    setError('');
                  }}
                  disabled={!selectedMyClass || loading}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full bg-gray-50/50 dark:bg-gray-950/30 border dark:border-gray-800 dark:text-gray-200",
                      selectedTargetHasConflict && "border-red-400 dark:border-red-500/50 bg-red-50/30 dark:bg-red-950/10 focus:ring-red-500 focus:border-red-500 text-red-900 dark:text-red-400"
                    )}
                  >
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
                    {availableTargets.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.conflictWith
                          ? `⚠️ ${c.classCode} - ${c.day}, ${c.timeStart} [bentrok]`
                          : `${c.classCode} - ${c.day}, ${c.timeStart} (${c.room})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTargetHasConflict && (
                  <p className="mt-1.5 text-xs text-red-600 font-bold">
                    &lt;!&gt; Kelas ini bentrok dengan {selectedTargetHasConflict.courseCode}-{selectedTargetHasConflict.classCode} ({selectedTargetHasConflict.day} {selectedTargetHasConflict.timeStart} - {selectedTargetHasConflict.timeEnd}). Penawaran akan ditolak server.
                  </p>
                )}

                {selectedMyClass && availableTargets.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Tidak ada kelas paralel lain untuk mata kuliah ini
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-5 rounded-b-lg flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 text-sm font-bold py-3 px-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
            >
              {successMessage ? 'CLOSE' : 'BATAL'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !selectedTargetClass || !!successMessage}
              className="flex-1 bg-green-600 text-white text-sm font-bold py-3 px-4 rounded hover:bg-green-700 active:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'MENGIRIM...' : successMessage ? 'COMPLETED' : 'POST'}
            </button>
          </div>
        </div>

        <div className="h-12 flex items-start justify-center pt-3">
          {error && (
            <div
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg animate-shake"
            >
              &lt;!&gt; {error} &lt;!&gt;
            </div>
          )}
          {successMessage && (
            <div
              className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg"
              style={showMessage ? { animation: 'shake 0.25s ease-in-out' } : {}}
            >
              &lt;✔&gt; {successMessage} &lt;✔&gt;
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
      ` }} />
    </div>
  );
}
