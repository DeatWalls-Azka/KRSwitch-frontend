import { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getSocketToken } from '../api';
import { enrichOffer } from '../utils/offerUtils';

const TOAST_TTL_MS = 5000;

export function useSocket({
  currentUser,
  usersRef,
  parallelClassesRef,
  setApiOffers,
  setEnrollments,
  setNotifications,
  exitingOffersCache,
}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Token dikirim terpisah karena currentUser diload async setelah socket connect
  useEffect(() => {
    if (currentUser && socketRef.current) {
      getSocketToken()
        .then(res => socketRef.current?.emit('authenticate', res.data.token))
        .catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));
    socket.on('online-count', setOnlineCount);

    socket.on('new-offer', (offer) => {
      setApiOffers(prev => [offer, ...prev]);
    });

    socket.on('offer-taken', ({ offerId }) => {
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

    socket.on('enrollments-swapped', ({ swaps }) => {
      setEnrollments(prev => prev.map(enrollment => {
        const swap = swaps.find(
          s => s.nim === enrollment.nim && s.oldClassId === enrollment.parallelClassId
        );
        return swap ? { ...enrollment, parallelClassId: swap.newClassId } : enrollment;
      }));
    });

    socket.on('offer-auto-cancelled', ({ offerId, reason, conflictingClass }) => {
      const message = reason === 'no_longer_enrolled'
        ? `Penawaran #${offerId} dibatalkan otomatis, kelas yang ditawarkan sudah tidak kamu miliki.`
        : `Penawaran #${offerId} dibatalkan otomatis, bentrok jadwal dengan ${conflictingClass}.`;

      const id = Date.now();
      setToasts(prev => [...prev, { id, message }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), TOAST_TTL_MS);
    });

    socket.on('new-notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  return { socketRef, isConnected, onlineCount, toasts, setToasts };
}