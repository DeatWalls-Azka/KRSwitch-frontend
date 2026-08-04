import React, { useState, useEffect, useRef } from 'react';
import { getEnrollments, getClasses, createOffer, createPickDropOffer, getUsers } from '../../../api';
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
  enrollments?: import('../../../types').Enrollment[];
  parallelClasses?: import('../../../types').ParallelClass[];
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

export default function CreateOfferForm({ onSuccess, onClose, enrollments: initialEnrollments, parallelClasses: initialClasses }: CreateOfferFormProps) {
  const [myClasses, setMyClasses] = useState<EnrichedClass[]>([]);
  const [allClasses, setAllClasses] = useState<ParallelClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();

  const [offerMode, setOfferMode] = useState<'swap' | 'pick_drop'>('swap');
  const [dropType, setDropType] = useState<'open' | 'targeted'>('open');
  const [targetNim, setTargetNim] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedMyClass, setSelectedMyClass] = useState('');
  const [selectedTargetClass, setSelectedTargetClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      if (!enrollments || !classes) {
        const [enrollmentsRes, classesRes, usersRes] = await Promise.all([
          getEnrollments(),
          getClasses(),
          getUsers()
        ]);
        enrollments = enrollmentsRes.data;
        classes = classesRes.data;
        setUsers(usersRes.data);
      } else {
        const usersRes = await getUsers();
        setUsers(usersRes.data);
      }

      setAllClasses(classes);

      const userEnrollments = enrollments.filter(e => e.nim === user.nim);
      const enrichedClasses = userEnrollments.map(enrollment => {
        const classDetails = classes.find(c => c.id == enrollment.parallelClassId);
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

  const displayedMyClasses = React.useMemo(() => {
    if (offerMode === 'swap') {
      return myClasses;
    }
    const groups: { [key: string]: EnrichedClass[] } = {};
    for (const c of myClasses) {
      if (!groups[c.courseCode]) groups[c.courseCode] = [];
      groups[c.courseCode].push(c);
    }
    return Object.values(groups).map(group => {
      const first = group[0];
      const classCodes = group.map(c => c.classCode).join(' & ');
      return {
        ...first,
        displayLabel: `${first.courseName} (Paket: ${classCodes})`
      };
    });
  }, [myClasses, offerMode]);

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
      if (offerMode === 'swap') {
        const res = await createOffer({
          myClassId: parseInt(selectedMyClass),
          wantedClassId: parseInt(selectedTargetClass),
        });
        if (onSuccess) onSuccess();
        setSuccessMessage(res.data.isAutoMatched
          ? 'Auto-match! Pertukaran otomatis oleh sistem.'
          : 'Penawaran berhasil dibuat!'
        );
      } else {
        const res = await createPickDropOffer({
          myClassId: parseInt(selectedMyClass),
          reservedForNim: dropType === 'targeted' ? targetNim.trim() : undefined,
        });
        if (onSuccess) onSuccess();
        setSuccessMessage(dropType === 'targeted'
          ? `Seat berhasil dilepas khusus untuk NIM ${targetNim}!`
          : 'Seat berhasil dilepas ke publik (Free-for-all)!'
        );
      }
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-3">Buat Penawaran Baru</h3>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setOfferMode('swap'); setError(''); }}
                  className={`py-1.5 rounded transition-all flex items-center justify-center gap-1.5 ${offerMode === 'swap'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  Tukar Kelas
                </button>
                <button
                  type="button"
                  onClick={() => { setOfferMode('pick_drop'); setError(''); }}
                  className={`py-1.5 rounded transition-all flex items-center justify-center gap-1.5 ${offerMode === 'pick_drop'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  Drop Kelas
                </button>
              </div>
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
                    <SelectValue placeholder={myClasses.length === 0 ? '-- Memuat...' : '-- Pilih Kelas --'} />
                  </SelectTrigger>
                  <SelectContent>
                    {displayedMyClasses.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {(c as any).displayLabel || `${c.courseName} (${c.classCode}) - ${c.day}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {offerMode === 'swap' ? (
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
                        <SelectItem key={c.id} value={c.id.toString()} disabled={!!c.conflictWith}>
                          {c.conflictWith
                            ? `${c.classCode} - ${c.day}, ${c.timeStart} [bentrok]`
                            : `${c.classCode} - ${c.day}, ${c.timeStart} (${c.room})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-lg">
                  <div className="text-[10px] sm:text-xs text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/50 p-2 rounded border border-red-200 dark:border-red-800 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <strong>Catatan:</strong> Melepas kelas ini akan secara otomatis melepas <strong>seluruh kelas</strong> untuk mata kuliah ini (contoh: Kuliah & Praktikum).
                    </span>
                  </div>
                  <label className="block text-xs text-red-900 dark:text-red-200 font-bold mt-2">
                    Tipe Drop Seat
                  </label>
                  <div className="flex gap-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dropType"
                        checked={dropType === 'open'}
                        onChange={() => setDropType('open')}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>Bebas (Siapa Saja)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dropType"
                        checked={dropType === 'targeted'}
                        onChange={() => setDropType('targeted')}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>Khusus Orang</span>
                    </label>
                  </div>

                  {dropType === 'targeted' && (
                    <div className="mt-2 relative" ref={dropdownRef}>
                      <label className="block text-[11px] text-gray-600 dark:text-gray-400 font-semibold mb-1">
                        NIM Penerima Khusus
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: M0403241075 atau Nama"
                        value={targetNim}
                        onChange={(e) => {
                          setTargetNim(e.target.value.toUpperCase());
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                      />

                      {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {users.filter(u => u.role === 'student' && u.nim !== user?.nim && (!targetNim || u.nim.toLowerCase().includes(targetNim.toLowerCase()) || u.name.toLowerCase().includes(targetNim.toLowerCase()))).length > 0 ? (
                            users
                              .filter(u => u.role === 'student' && u.nim !== user?.nim && (!targetNim || u.nim.toLowerCase().includes(targetNim.toLowerCase()) || u.name.toLowerCase().includes(targetNim.toLowerCase())))
                              .slice(0, 10)
                              .map(u => (
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
                      <p className="text-[10px] text-gray-400 mt-1">Pilih dari dropdown agar tidak salah input.</p>
                    </div>
                  )}
                </div>
              )}

              {offerMode === 'swap' && selectedTargetHasConflict && (
                <p className="mt-1.5 text-xs text-red-600 font-bold">
                  Kelas ini bentrok dengan {selectedTargetHasConflict.courseCode}-{selectedTargetHasConflict.classCode} ({selectedTargetHasConflict.day} {selectedTargetHasConflict.timeStart} - {selectedTargetHasConflict.timeEnd}). Penawaran akan ditolak server.
                </p>
              )}

              {offerMode === 'swap' && selectedMyClass && availableTargets.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Tidak ada kelas paralel lain untuk mata kuliah ini
                </p>
              )}
            </div>
          </div>

          <div className="px-8 py-5 rounded-b-lg flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 text-sm font-bold py-3 px-4 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
            >
              {successMessage ? 'TUTUP' : 'BATAL'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading ||
                !!successMessage ||
                !selectedMyClass ||
                (offerMode === 'swap'
                  ? !selectedTargetClass
                  : (dropType === 'targeted' && !users.some(u => u.role === 'student' && u.nim === targetNim)))
              }
              className={`flex-1 text-white text-sm font-bold py-3 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${offerMode === 'pick_drop'
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                }`}
            >
              {loading ? 'MENGIRIM...' : successMessage ? 'SELESAI' : 'KIRIM'}
            </button>
          </div>
        </div>

        <div className="h-12 flex items-start justify-center pt-3">
          {error && (
            <div
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded shadow-lg animate-shake"
            >
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
      <style dangerouslySetInnerHTML={{
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
      ` }} />
    </div>
  );
}
