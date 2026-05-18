import type { User, ParallelClass, Enrollment, Offer, EnrichedOffer } from '../types';

// --- Helpers --------------------------------------------------

const TIMESTAMP_FORMAT: Intl.DateTimeFormatOptions = { day: '2-digit', hour: '2-digit', minute: '2-digit' };

export function enrichOffer(
  offer: Offer,
  users: User[],
  parallelClasses: ParallelClass[]
): EnrichedOffer | null {
  const myClass = offer.myClass || parallelClasses.find(pc => pc.id === offer.myClassId);
  const wantedClass = offer.wantedClass || parallelClasses.find(pc => pc.id === offer.wantedClassId);
  const offerer = offer.offerer || users.find(u => u.nim === offer.offererNim);

  if (!myClass || !wantedClass || !offerer) return null;

  return {
    ...offer,
    myClass,
    wantedClass,
    offerer,
    seekingCourse: wantedClass.courseCode,
    seekingCourseName: wantedClass.courseName,
    offeringClass: myClass.classCode,
    seekingClass: wantedClass.classCode,
    studentName: offerer.name,
    nim: offerer.nim,
    timestamp: new Date(offer.createdAt)
      .toLocaleString('id-ID', TIMESTAMP_FORMAT)
      .replace(',', ' -'),
  };
}

export function getStudentsInClass(
  parallelClassId: number,
  enrollments: Enrollment[],
  users: User[]
): User[] {
  return enrollments
    .filter(e => e.parallelClassId === parallelClassId)
    .map(e => users.find(u => u.nim === e.nim))
    .filter((u): u is User => !!u);
}

// Cek apakah dua rentang waktu di hari yang sama bentrok
function timesOverlap(
  day1: string,
  start1: string,
  end1: string,
  day2: string,
  start2: string,
  end2: string
): boolean {
  if (day1 !== day2) return false;
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return toMin(start1) < toMin(end2) && toMin(end1) > toMin(start2);
}

// Cek apakah kelas yang bakal diterima bentrok sama jadwal yang sudah ada
export function hasScheduleConflict(
  incomingClassId: number,
  currentUserNim: string,
  enrollments: Enrollment[],
  parallelClasses: ParallelClass[]
): boolean {
  const incoming = parallelClasses.find(pc => pc.id === incomingClassId);
  if (!incoming) return false;

  const userEnrolledIds = enrollments
    .filter(e => e.nim === currentUserNim)
    .map(e => e.parallelClassId);

  return userEnrolledIds.some(id => {
    if (id === incomingClassId) return false; // kelas yang sama yang mau dibarter, abaikan

    const enrolled = parallelClasses.find(pc => pc.id === id);
    if (!enrolled) return false;

    // Kalo kelas yang terdaftar punya matkul dan jenis kelas (K/P/R) yang sama,
    // berarti ini bagian yang mau diganti, jadinya gak bakal bikin bentrok
    if (enrolled.courseCode === incoming.courseCode && enrolled.classCode[0] === incoming.classCode[0]) {
      return false;
    }

    return timesOverlap(
      incoming.day, incoming.timeStart, incoming.timeEnd,
      enrolled.day, enrolled.timeStart, enrolled.timeEnd,
    );
  });
}
