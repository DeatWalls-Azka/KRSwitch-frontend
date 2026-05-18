import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { EnrichedOffer } from '../types';

// --- Konstanta ------------------------------------------------

const STAGGER_DELAY = 30;
const ANIMATION_DURATION = 100;

// --- Types ----------------------------------------------------

interface UseOfferAnimationsProps {
  shouldBeVisibleIds: Set<number>;
  enrichedOffers: EnrichedOffer[];
}

interface PendingChanges {
  toAdd: number[];
  isWebSocket: boolean;
}

// --- Komponen Utama -------------------------------------------

export function useOfferAnimations({ shouldBeVisibleIds, enrichedOffers }: UseOfferAnimationsProps) {
  const [visibleOfferIds, setVisibleOfferIds] = useState<Set<number>>(new Set());
  const [exitingOfferIds, setExitingOfferIds] = useState<Map<number, number>>(new Map());
  const [enteringOfferIds, setEnteringOfferIds] = useState<Set<number>>(new Set());
  const [animationVersion, setAnimationVersion] = useState(0);

  const exitingOffersCache = useRef<Map<number, EnrichedOffer>>(new Map());
  const animationLockRef = useRef(false);
  const pendingChangesRef = useRef<PendingChanges | null>(null);
  const previousOfferIdsRef = useRef<Set<number>>(new Set());

  const startEnterAnimation = useCallback((idsToAdd: number[], isWebSocketAddition: boolean) => {
    setVisibleOfferIds(prev => {
      const next = new Set(prev);
      idsToAdd.forEach(id => next.add(id));
      return next;
    });

    if (isWebSocketAddition && idsToAdd.length > 0) {
      setEnteringOfferIds(new Set(idsToAdd));
      setTimeout(() => setEnteringOfferIds(new Set()), 200);
    }

    animationLockRef.current = false;
    setAnimationVersion(v => v + 1);
  }, []);

  const startExitAnimation = useCallback((idsToRemove: number[]) => {
    const visibleArray = Array.from(visibleOfferIds);
    const exitMap = new Map<number, number>();

    // Helper buat ngecek apakah kartu tawaran kelihatan di layar
    const isOfferVisibleInViewport = (offerId: number) => {
      if (typeof window === 'undefined') return false;
      const elements = document.querySelectorAll(`[data-offer-id="${offerId}"]`);
      if (elements.length === 0) return false;
      
      // Karena feed di-render dua kali (sidebar desktop & laci mobile),
      // cari element yang aktif dan kelihatan di layar (lebar & tinggi > 0)
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.height > 0 && rect.width > 0 && rect.top < viewportHeight && rect.bottom > 0) {
          return true;
        }
      }
      return false;
    };

    // Saring buat dapet element yang beneran kelihatan di layar sekarang
    const visibleInDOM = visibleArray.filter(id => isOfferVisibleInViewport(id));

    idsToRemove.forEach(id => {
      const idx = visibleArray.indexOf(id);
      if (idx >= 0) {
        const domIdx = visibleInDOM.indexOf(id);
        if (domIdx >= 0) {
          // Stagger Dinamis: Cuma stagger kartu yang beneran kelihatan di layar.
          // Pertahanin efek exit wave dari bawah ke atas tapi khusus buat yang beneran kelihatan.
          const exitIndex = visibleInDOM.length - 1 - domIdx;
          exitMap.set(id, exitIndex);
        } else {
          // Elemen di luar layar exit langsung tanpa delay
          exitMap.set(id, 0);
        }
      }
    });

    setExitingOfferIds(exitMap);
    animationLockRef.current = true;

    const maxExitIndex = exitMap.size > 0 ? Math.max(...Array.from(exitMap.values())) : 0;
    const totalTime = (maxExitIndex * STAGGER_DELAY) + ANIMATION_DURATION + 50;

    setTimeout(() => {
      setVisibleOfferIds(prev => {
        const next = new Set(prev);
        idsToRemove.forEach(id => {
          next.delete(id);
          exitingOffersCache.current.delete(id);
        });
        return next;
      });
      setExitingOfferIds(new Map());
      animationLockRef.current = false;
      setAnimationVersion(v => v + 1);

      // Jalanin pending add kalau ada yang nunggu di antrian
      if (pendingChangesRef.current) {
        const pending = pendingChangesRef.current;
        pendingChangesRef.current = null;
        if (pending.toAdd.length > 0) startEnterAnimation(pending.toAdd, pending.isWebSocket);
      }
    }, totalTime);
  }, [visibleOfferIds, startEnterAnimation]);

  useEffect(() => {
    if (animationLockRef.current) return;

    const idsToRemove = Array.from(visibleOfferIds).filter(id => !shouldBeVisibleIds.has(id));
    const idsToAdd = Array.from(shouldBeVisibleIds).filter(id => !visibleOfferIds.has(id));

    const currentOfferIds = new Set(enrichedOffers.map(o => o.id));
    const isWebSocket = idsToAdd.some(id => !previousOfferIdsRef.current.has(id));
    previousOfferIdsRef.current = currentOfferIds;

    if (idsToRemove.length > 0) {
      if (idsToAdd.length > 0) pendingChangesRef.current = { toAdd: idsToAdd, isWebSocket };
      startExitAnimation(idsToRemove);
    } else if (idsToAdd.length > 0) {
      startEnterAnimation(idsToAdd, isWebSocket);
    }
  }, [shouldBeVisibleIds, visibleOfferIds, enrichedOffers, startExitAnimation, startEnterAnimation, animationVersion]);

  const offersToDisplay = useMemo(() => {
    const display = enrichedOffers.filter(offer => visibleOfferIds.has(offer.id));

    // Tambahin offer dari cache yang lagi dalam proses exit animation
    visibleOfferIds.forEach(id => {
      if (!enrichedOffers.find(o => o.id === id) && exitingOffersCache.current.has(id)) {
        const cached = exitingOffersCache.current.get(id);
        if (cached) display.push(cached);
      }
    });

    return display.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [enrichedOffers, visibleOfferIds]);

  return {
    exitingOfferIds,
    enteringOfferIds,
    offersToDisplay,
    exitingOffersCache,
    startExitAnimation,
    animationLockRef,
  };
}
