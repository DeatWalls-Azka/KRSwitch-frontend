import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

const STAGGER_DELAY = 30;
const ANIMATION_DURATION = 100;

export function useOfferAnimations({ shouldBeVisibleIds, enrichedOffers }) {
  const [visibleOfferIds, setVisibleOfferIds] = useState(new Set());
  const [exitingOfferIds, setExitingOfferIds] = useState(new Map());
  const [enteringOfferIds, setEnteringOfferIds] = useState(new Set());
  const [animationVersion, setAnimationVersion] = useState(0);

  const exitingOffersCache = useRef(new Map());
  const animationLockRef = useRef(false);
  const pendingChangesRef = useRef(null);
  const previousOfferIdsRef = useRef(new Set());

  const startEnterAnimation = useCallback((idsToAdd, isWebSocketAddition) => {
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

  const startExitAnimation = useCallback((idsToRemove) => {
    const visibleArray = Array.from(visibleOfferIds);
    const exitMap = new Map();

    idsToRemove.forEach(id => {
      const idx = visibleArray.indexOf(id);
      if (idx >= 0) exitMap.set(id, visibleArray.length - 1 - idx);
    });

    setExitingOfferIds(exitMap);
    animationLockRef.current = true;

    const maxExitIndex = Math.max(...Array.from(exitMap.values()));
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
        display.push(exitingOffersCache.current.get(id));
      }
    });

    return display.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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