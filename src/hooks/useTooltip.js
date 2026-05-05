import { useState, useRef, useCallback, useEffect } from 'react';

// 0.2 = sweet spot antara smooth dan responsif
const LERP_FACTOR = 0.2;

function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

export function useTooltip() {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const mousePos = useRef({ x: 0, y: 0 });
  const tooltipPos = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);
  const initialized = useRef(false);

  const handleMouseMove = useCallback((e) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const animate = () => {
      if (!initialized.current) {
        // Frame pertama snap langsung biar nggak jarring muncul dari pojok
        tooltipPos.current.x = mousePos.current.x;
        tooltipPos.current.y = mousePos.current.y;
        initialized.current = true;
      } else {
        tooltipPos.current.x = lerp(tooltipPos.current.x, mousePos.current.x, LERP_FACTOR);
        tooltipPos.current.y = lerp(tooltipPos.current.y, mousePos.current.y, LERP_FACTOR);
      }

      const el = document.getElementById('custom-tooltip');
      if (el) {
        el.style.transform = `translate(${tooltipPos.current.x + 15}px, ${tooltipPos.current.y + 15}px)`;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    if (tooltipContent) {
      requestAnimationFrame(() => setTooltipVisible(true));
      animRef.current = requestAnimationFrame(animate);
    } else {
      setTooltipVisible(false);
      initialized.current = false;
    }

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [tooltipContent]);

  return { tooltipContent, setTooltipContent, tooltipVisible, tooltipPos, handleMouseMove };
}