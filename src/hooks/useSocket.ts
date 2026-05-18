import { useRef, useEffect, useState } from 'react';
import io, { type Socket } from 'socket.io-client';
import { getSocketToken } from '../api';
import { enrichOffer } from '../utils/offerUtils';
import type { User, ParallelClass, Enrollment, Offer, Notification, EnrichedOffer, EnrollmentsSwappedPayload, OfferAutoCancelledPayload } from '../types';

// --- Konstanta ------------------------------------------------

const TOAST_TTL_MS = 5000;

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
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Token dikirim terpisah karena currentUser diload async setelah socket connect
  useEffect(() => {
    if (currentUser && socketRef.current) {
      getSocketToken()
        .then(res => socketRef.current?.emit('authenticate', res.data.token))
        .catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));
    socket.on('online-count', (count: number) => setOnlineCount(count));

    socket.on('new-offer', (offer: Offer) => {
      setApiOffers(prev => [offer, ...prev]);
    });

    socket.on('offer-taken', ({ offerId }: { offerId: number }) => {
      setApiOffers(prev => {
        const offer = prev.find(o => o.id === offerId);
        if (offer) {
          // Pakai refs biar dapet data terkini tanpa recreate socket listener
          const enriched = enrichOffer(offer, usersRef.current, parallelClassesRef.current);
          if (enriched) exitingOffersCache.current.set(offerId, enriched);
        }
        return prev.filter(o => o.id !== offerId);
      });
    });

    socket.on('enrollments-swapped', ({ swaps }: EnrollmentsSwappedPayload) => {
      setEnrollments(prev => prev.map(enrollment => {
        const swap = swaps.find(
          s => s.nim === enrollment.nim && s.oldClassId === enrollment.parallelClassId
        );
        return swap ? { ...enrollment, parallelClassId: swap.newClassId } : enrollment;
      }));
    });

    socket.on('enrollment-updated', (updated: Enrollment) => {
      setEnrollments(prev => prev.map(e => e.id === updated.id ? updated : e));
    });

    socket.on('enrollment-deleted', ({ id }: { id: number }) => {
      setEnrollments(prev => prev.filter(e => e.id !== id));
    });

    socket.on('offer-auto-cancelled', ({ offerId, reason, conflictingClass }: OfferAutoCancelledPayload) => {
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
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), TOAST_TTL_MS);
    });

    socket.on('new-notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [exitingOffersCache, parallelClassesRef, setApiOffers, setEnrollments, setNotifications, usersRef]);

  return { socketRef, isConnected, onlineCount, toasts, setToasts };
}
