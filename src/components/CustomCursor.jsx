import React, { useEffect, useState, useRef } from 'react';

/**
 * Custom Circular Cursor
 * Refined two-layer cursor for supported desktop devices.
 * Features:
 * - Small solid central dot
 * - Thin circular outer ring with smooth inertia
 * - Subtle expansion when hovering over interactive elements
 * - Completely disabled on touch devices and for prefers-reduced-motion
 * - Zero interference with clicks, text selection, or accessibility (pointer-events: none)
 */
export const CustomCursor = ({ isReducedMotion }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const targetPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef(null);

  useEffect(() => {
    // Only enable on desktop devices supporting fine pointer & hover, and when reduced motion is not requested
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const checkCapability = () => {
      setIsEnabled(mediaQuery.matches && !isReducedMotion);
    };

    checkCapability();
    mediaQuery.addEventListener('change', checkCapability);

    return () => {
      mediaQuery.removeEventListener('change', checkCapability);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isReducedMotion]);

  useEffect(() => {
    if (!isEnabled) {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      return;
    }

    const handlePointerMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Instant hardware-accelerated transform for inner dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handlePointerOver = (e) => {
      const target = e.target;
      if (
        target &&
        (target.closest('a') ||
          target.closest('button') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select') ||
          target.closest('[role="button"]') ||
          target.closest('[role="tab"]') ||
          target.closest('.btn') ||
          target.closest('.tech-chip') ||
          target.closest('.interactive') ||
          target.closest('.project-card') ||
          target.closest('.edu-card') ||
          target.closest('.cert-card') ||
          target.closest('.focus-mini-card'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handlePointerLeave = () => {
      setIsVisible(false);
    };

    // Smooth physics loop for outer ring (trailing interpolation)
    const animateRing = () => {
      const lerp = 0.18; // Restrained smooth lag
      ringPos.current.x += (targetPos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (targetPos.current.y - ringPos.current.y) * lerp;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(animateRing);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    animFrameId.current = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerover', handlePointerOver);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isEnabled, isVisible]);

  if (!isEnabled) return null;

  return (
    <div 
      className={`custom-cursor-container ${isVisible ? 'visible' : ''} ${isHovered ? 'hovered' : ''}`} 
      aria-hidden="true"
    >
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
};
