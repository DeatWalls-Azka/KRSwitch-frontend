import type { User, ParallelClass, Enrollment, Offer, EnrichedOffer } from '../types';

// --- Helpers --------------------------------------------------

const TIMESTAMP_FORMAT: Intl.DateTimeFormatOptions = { day: '2-digit', hour: '2-digit', minute: '2-digit' };

export function enrichOffer(
  offer: Offer,
  users: User[],
  parallelClasses: ParallelClass[]
): EnrichedOffer | null {
  const myClass = offer.myClass || parallelClasses.find(pc => pc.id === offer.myClassId);
  const wantedClass = offer.wantedClass || (offer.wantedClassId ? parallelClasses.find(pc => pc.id === offer.wantedClassId) : undefined);
  const offerer = offer.offerer || users.find(u => u.nim === offer.offererNim);

  if (!myClass || !offerer) return null;

  const isPickDrop = offer.type === 'pick_drop';
  if (!isPickDrop && !wantedClass) return null;

  const reservedLabel = offer.reservedForNim ? `[Khusus: ${offer.reservedForNim}]` : 'DROP';

  return {
    ...offer,
    myClass,
    wantedClass,
    offerer,
    seekingCourse: isPickDrop ? myClass.courseCode : wantedClass!.courseCode,
    seekingCourseName: isPickDrop ? myClass.courseName : wantedClass!.courseName,
    offeringClass: myClass.classCode,
    seekingClass: isPickDrop ? reservedLabel : wantedClass!.classCode,
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
    .filter(e => e.parallelClassId == parallelClassId)
    .map(e => users.find(u => u.nim === e.nim))
    .filter((u): u is User => !!u);
}

// Cek apakah dua rentang waktu di hari yang sama bentrok
export function timesOverlap(
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
  const incoming = parallelClasses.find(pc => pc.id == incomingClassId);
  if (!incoming) return false;

  const userEnrolledIds = enrollments
    .filter(e => e.nim === currentUserNim)
    .map(e => e.parallelClassId);

  return userEnrolledIds.some(id => {
    if (id == incomingClassId) return false;

    const enrolled = parallelClasses.find(pc => pc.id == id);
    if (!enrolled) return false;

    if (enrolled.courseCode === incoming.courseCode && enrolled.classCode[0] === incoming.classCode[0]) {
      return false;
    }

    return timesOverlap(
      incoming.day, incoming.timeStart, incoming.timeEnd,
      enrolled.day, enrolled.timeStart, enrolled.timeEnd,
    );
  });
}

export function groupOffersByBatch(offers: EnrichedOffer[]): EnrichedOffer[] {
  const grouped: Record<string, EnrichedOffer[]> = {};
  const result: EnrichedOffer[] = [];

  for (const offer of offers) {
    if (offer.batchGroupId) {
      if (!grouped[offer.batchGroupId]) {
        grouped[offer.batchGroupId] = [];
      }
      grouped[offer.batchGroupId].push(offer);
    } else {
      result.push(offer);
    }
  }

  for (const batchId in grouped) {
    const batch = grouped[batchId];
    if (batch.length === 0) continue;
    if (batch.length === 1) {
      result.push(batch[0]);
    } else {
      const parentOffer = { ...batch[0], packageOffers: batch };
      // Override text fields for display
      parentOffer.seekingCourseName = 'Paket Pertukaran';
      parentOffer.seekingCourse = `Paket (${batch.length} Matkul)`;
      parentOffer.offeringClass = 'PAKET';
      parentOffer.seekingClass = 'PAKET';
      result.push(parentOffer);
    }
  }

  return result;
}
