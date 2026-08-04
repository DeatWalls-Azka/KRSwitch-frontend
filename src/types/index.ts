// --- Core Entities --------------------------------------------

export interface User {
  id: number;
  nim: string;
  name: string;
  role: 'student' | 'admin' | 'operator' | 'super_admin';
  email?: string;
  picture?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParallelClass {
  id: number;
  courseCode: string;
  courseName: string;
  classCode: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string;
  capacity?: number;
}

export interface Enrollment {
  id: number;
  nim: string;
  parallelClassId: number;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
  parallelClass?: ParallelClass;
}

export interface Offer {
  id: number;
  offererNim: string;
  myClassId: number;
  wantedClassId: number | null;
  type: 'swap' | 'pick_drop';
  batchGroupId?: string | null;
  reservedForNim?: string | null;
  reservedFor?: { nim: string; name: string } | null;
  isAutoMatched: boolean;
  isOverride: boolean;
  status: 'pending' | 'taken' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  myClass?: ParallelClass;
  wantedClass?: ParallelClass;
  offerer?: User;
}

export interface EnrichedOffer extends Offer {
  myClass: ParallelClass;
  wantedClass?: ParallelClass;
  offerer: User;
  seekingCourse: string;
  seekingCourseName: string;
  offeringClass: string;
  seekingClass: string;
  studentName: string;
  nim: string;
  timestamp: string;
  packageOffers?: EnrichedOffer[];
}

export interface Notification {
  id: number;
  nim: string;
  type: string;
  message: string;
  read: boolean;
  data: any;
  createdAt: string;
}

// --- WebSocket Event Types ------------------------------------

export interface EnrollmentsSwappedPayload {
  swaps: {
    nim: string;
    oldClassId: number;
    newClassId: number;
  }[];
}

export interface OfferAutoCancelledPayload {
  offerId: number;
  reason: 'no_longer_enrolled' | 'schedule_override' | 'admin_cancelled' | 'schedule_conflict';
  conflictingClass?: string;
}
