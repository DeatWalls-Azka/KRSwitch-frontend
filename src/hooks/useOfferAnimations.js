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

    // Helper to dynamically check if an offer card is visible in the viewport
    const isOfferVisibleInViewport = (offerId) => {
      if (typeof window === 'undefined') return false;
      const elements = document.querySelectorAll(`[data-offer-id="${offerId}"]`);
      if (elements.length === 0) return false;
      
      // Since the feed is rendered twice (once for desktop sidebar, once for mobile drawer),
      // we locate the instance that is active/visible (width/height > 0) in the viewport.
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.height > 0 && rect.width > 0 && rect.top < viewportHeight && rect.bottom > 0) {
          return true;
        }
      }
      return false;
    };

    // Filter to get only the elements that are actually visible on screen right now
    const visibleInDOM = visibleArray.filter(id => isOfferVisibleInViewport(id));

    idsToRemove.forEach(id => {
      const idx = visibleArray.indexOf(id);
      if (idx >= 0) {
        const domIdx = visibleInDOM.indexOf(id);
        if (domIdx >= 0) {
          // Dynamic Stagger: Only stagger cards that are actually visible on the screen.
          // We preserve the bottom-up exit cascade wave but restrict it strictly to viewport visible items.
          const exitIndex = visibleInDOM.length - 1 - domIdx;
          exitMap.set(id, exitIndex);
        } else {
          // Off-screen / scrolled-out elements exit immediately with 0 delay
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