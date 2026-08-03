import { useState, useMemo, useRef, useEffect } from 'react';
import { enrichOffer, hasScheduleConflict } from '../utils/offerUtils';
import type { User, ParallelClass, Offer, Enrollment, Notification, EnrichedOffer } from '../types';

export interface Course {
  code: string;
  name: string;
  type: number;
}

interface UseTradingStateProps {
  users: User[];
  parallelClasses: ParallelClass[];
  enrollments: Enrollment[];
  currentUser: User | null;
  apiOffers: Offer[];
  notifications: Notification[];
}

export function useTradingState({
  users,
  parallelClasses,
  enrollments,
  currentUser,
  apiOffers,
  notifications
}: UseTradingStateProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState('kuliah');
  const [filterByCourse, setFilterByCourse] = useState(false);
  const [filterForYou, setFilterForYou] = useState(false);
  const [filterByYou, setFilterByYou] = useState(false);

  const lastRealCourseTypeRef = useRef<number>(0);

  const courses = useMemo<Course[]>(() => {
    const defaultCourses = [...new Set(parallelClasses.map(pc => pc.courseCode))].map(code => {
      const group = parallelClasses.filter(pc => pc.courseCode === code);
      const type = group.some(c => c.classCode.startsWith('P')) ? 1
        : group.some(c => c.classCode.startsWith('R')) ? 2 : 0;
      return { code, name: group[0].courseName, type };
    });
    return [{ code: 'Kelas Saya', name: 'Jadwal Saya', type: -1 }, ...defaultCourses];
  }, [parallelClasses]);

  const enrichedOffers = useMemo(() => {
    return apiOffers
      .map(offer => enrichOffer(offer, users, parallelClasses))
      .filter((o): o is EnrichedOffer => o !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [apiOffers, users, parallelClasses]);

  const myEnrollmentMap = useMemo<Record<string, string>>(() => {
    if (!currentUser) return {};
    const map: Record<string, string> = {};
    enrollments
      .filter(e => e.nim === currentUser.nim)
      .forEach(e => {
        const pc = parallelClasses.find(c => c.id == e.parallelClassId);
        if (pc) {
          const type = pc.classCode[0];
          const key = `${pc.courseCode}-${type}`;
          map[key] = pc.classCode;
        }
      });
    return map;
  }, [currentUser, enrollments, parallelClasses]);

  const shouldBeVisibleIds = useMemo(() => {
    return new Set(enrichedOffers.filter(offer => {
      if (filterByCourse) {
        if (selectedCourse?.type === -1) {
          const isEnrolledInCourse = Object.keys(myEnrollmentMap).some(key => key.startsWith(`${offer.seekingCourse}-`));
          if (!isEnrolledInCourse) return false;
        } else {
          if (offer.seekingCourse !== selectedCourse?.code) return false;
        }
      }

      if (filterByYou && offer.nim !== currentUser?.nim) return false;

      if (filterForYou) {
        if (offer.nim === currentUser?.nim) return false;

        const type = offer.seekingClass[0];
        const key = `${offer.seekingCourse}-${type}`;
        if (myEnrollmentMap[key] !== offer.seekingClass) return false;

        const incomingClass = parallelClasses.find(
          pc => pc.courseCode === offer.seekingCourse && pc.classCode === offer.offeringClass
        );
        if (incomingClass) {
          const hasConflict = hasScheduleConflict(incomingClass.id, currentUser?.nim || '', enrollments, parallelClasses);
          if (hasConflict) return false;
        }
      }

      return true;
    }).map(o => o.id));
  }, [enrichedOffers, filterByCourse, filterForYou, filterByYou, selectedCourse?.code, selectedCourse?.type, myEnrollmentMap, currentUser?.nim, enrollments, parallelClasses]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const emptyStateText = useMemo(() => {
    const isKelasSaya = selectedCourse?.type === -1;
    const courseText = isKelasSaya ? 'kelasmu' : `matkul ${selectedCourse?.code || 'ini'}`;

    if (filterByYou) {
      if (filterByCourse) {
        return `Kamu belum membuat penawaran barter untuk ${courseText}`;
      }
      return "Kamu belum membuat penawaran barter satupun";
    }
    if (filterForYou) {
      if (filterByCourse) {
        return `Belum ada penawaran aktif untuk ${courseText} yang cocok dengan jadwalmu`;
      }
      return "Belum ada penawaran barter aktif yang cocok dengan jadwalmu";
    }
    if (filterByCourse) {
      return `Belum ada penawaran barter aktif untuk ${courseText}`;
    }
    return "Belum ada penawaran barter di bursa";
  }, [filterByCourse, filterForYou, filterByYou, selectedCourse?.code, selectedCourse?.type]);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) setSelectedCourse(courses[0]);
  }, [courses, selectedCourse]);

  useEffect(() => {
    if (selectedCourse?.type === -1) {
      setFilterByCourse(false);
    } else {
      if (selectedCourse?.type !== undefined) {
        lastRealCourseTypeRef.current = selectedCourse.type;
      }
      setSelectedSessionType('kuliah');
    }
  }, [selectedCourse?.code, selectedCourse?.type]);

  return {
    courses,
    selectedCourse,
    setSelectedCourse,
    selectedSessionType,
    setSelectedSessionType,
    filterByCourse,
    setFilterByCourse,
    filterForYou,
    setFilterForYou,
    filterByYou,
    setFilterByYou,
    enrichedOffers,
    myEnrollmentMap,
    shouldBeVisibleIds,
    emptyStateText,
    unreadCount,
    lastRealCourseTypeRef,
  };
}
