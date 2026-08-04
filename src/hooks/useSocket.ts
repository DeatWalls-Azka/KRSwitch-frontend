import { useRef, useEffect, useState } from 'react';
import { type Socket } from 'socket.io-client';
import { useSocketContext } from '../context/SocketContext';
import { enrichOffer } from '../utils/offerUtils';
import type { User, ParallelClass, Enrollment, Offer, Notification, EnrichedOffer, EnrollmentsSwappedPayload, OfferAutoCancelledPayload } from '../types';

// --- Konstanta ------------------------------------------------

const TOAST_TTL_MS = 4000;

// --- Types ----------------------------------------------------

interface UseSocketProps {
  currentUser: User | null;
  usersRef: React.MutableRefObject<User[]>;
  parallelClassesRef: React.MutableRefObject<ParallelClass[]>;
  setApiOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  exitingOffersCache: React.MutableRefObject<Map<number, EnrichedOffer>>;
}

interface Toast {
  id: number;
  message: string;
  isExiting?: boolean;
}

// --- Komponen Utama -------------------------------------------

export function useSocket({
  currentUser,
  usersRef,
  parallelClassesRef,
  setApiOffers,
  setEnrollments,
  setNotifications,
  exitingOffersCache,
}: UseSocketProps) {
  const { socket, isConnected, onlineCount } = useSocketContext();
  const socketRef = useRef<Socket | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOffer = (offer: Offer) => {
      setApiOffers(prev => [offer, ...prev]);
    };

    const handleNewBatchOffer = (offers: Offer[]) => {
      setApiOffers(prev => [...offers, ...prev]);
    };

    const handleOfferTaken = ({ offerId }: { offerId: number }) => {
      setApiOffers(prev => {
        const targetOffer = prev.find(o => o.id === offerId);
        if (targetOffer) {
          const enriched = enrichOffer(targetOffer, usersRef.current, parallelClassesRef.current);
          if (enriched) exitingOffersCache.current.set(offerId, enriched);
          if (targetOffer.batchGroupId) {
            return prev.filter(o => o.batchGroupId !== targetOffer.batchGroupId);
          }
        }
        return prev.filter(o => o.id !== offerId);
      });
    };

    const handleEnrollmentsSwapped = ({ swaps }: EnrollmentsSwappedPayload) => {
      setEnrollments(prev => {
        let updated = [...prev];
        for (const swap of swaps) {
          if (swap.newClassId === 0) {
            // Drop class: remove enrollment
            updated = updated.filter(e => !(e.nim === swap.nim && e.parallelClassId == swap.oldClassId));
          } else if (swap.oldClassId === 0) {
            // Pick class: add new enrollment
            updated.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              nim: swap.nim,
              parallelClassId: Number(swap.newClassId)
            });
          } else {
            // Standard swap: update class id
            updated = updated.map(e => 
              (e.nim === swap.nim && e.parallelClassId == swap.oldClassId)
                ? { ...e, parallelClassId: Number(swap.newClassId) }
                : e
            );
          }
        }
        return updated;
      });
    };

    const handleEnrollmentUpdated = (updated: Enrollment) => {
      setEnrollments(prev => prev.map(e => e.id === updated.id ? updated : e));
    };

    const handleEnrollmentDeleted = ({ id }: { id: number }) => {
      setEnrollments(prev => prev.filter(e => e.id !== id));
    };

    const handleOfferAutoCancelled = ({ offerId, reason, conflictingClass }: OfferAutoCancelledPayload) => {
      let message = '';
      if (reason === 'no_longer_enrolled') {
        message = `Penawaran #${offerId} dibatalkan otomatis, kelas yang ditawarkan sudah tidak kamu miliki.`;
      } else if (reason === 'schedule_override') {
        message = `Penawaran #${offerId} dibatalkan otomatis karena jadwal di-override oleh Admin.`;
      } else if (reason === 'admin_cancelled') {
        message = `Penawaran #${offerId} dibatalkan secara paksa oleh Admin.`;
      } else {
        message = `Penawaran #${offerId} dibatalkan otomatis, bentrok jadwal dengan ${conflictingClass}.`;
      }

      const toastId = Date.now();
      setToasts(prev => [...prev, { id: toastId, message }]);
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === toastId ? { ...t, isExiting: true } : t));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 250);
      }, TOAST_TTL_MS);
    };

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    socket.on('new-offer', handleNewOffer);
    socket.on('new-batch-offer', handleNewBatchOffer);
    socket.on('offer-taken', handleOfferTaken);
    socket.on('enrollments-swapped', handleEnrollmentsSwapped);
    socket.on('enrollment-updated', handleEnrollmentUpdated);
    socket.on('enrollment-deleted', handleEnrollmentDeleted);
    socket.on('offer-auto-cancelled', handleOfferAutoCancelled);
    socket.on('new-notification', handleNewNotification);

    return () => {
      socket.off('new-offer', handleNewOffer);
      socket.off('new-batch-offer', handleNewBatchOffer);
      socket.off('offer-taken', handleOfferTaken);
      socket.off('enrollments-swapped', handleEnrollmentsSwapped);
      socket.off('enrollment-updated', handleEnrollmentUpdated);
      socket.off('enrollment-deleted', handleEnrollmentDeleted);
      socket.off('offer-auto-cancelled', handleOfferAutoCancelled);
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket, exitingOffersCache, parallelClassesRef, setApiOffers, setEnrollments, setNotifications, usersRef]);

  return { socketRef, isConnected, onlineCount, toasts, setToasts };
}
