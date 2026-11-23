/**
 * Character Eye Gaze Controller (Refined Phase 3)
 * 
 * Implements natural, coordinated cursor-following anime eyes while keeping
 * the character head, body, and overall portrait plate 100% stationary.
 * 
 * Key Principles:
 * 1. Only the pupils move (portrait plate stays completely stationary).
 * 2. Strict ocular boundaries: Horizontal & vertical limits calibrated to eye sockets.
 * 3. Coordinated binocular gaze: Both eyes track the exact same directional angle,
 *    preventing any unnatural cross-eyed or divergent movement.
 * 4. Wide viewport reach: Smooth, gradual gaze transition across desktop.
 * 5. Smooth damped easing: Pupils gracefully return to neutral resting (0, 0) when pointer leaves.
 * 6. Disabled on touch/mobile devices and strictly respects prefers-reduced-motion.
 */

export class CharacterParallaxController {
  constructor(container) {
    this.container = container; // .anime-canvas
    this.heroSection = null;
    this.rightPupil = null;
    this.leftPupil = null;

    this.isReducedMotion = false;
    this.isCoarsePointer = false;
    this.rafId = null;

    // Target pupil offsets (SVG coordinates)
    this.targetRightX = 0;
    this.targetRightY = 0;
    this.targetLeftX = 0;
    this.targetLeftY = 0;
    this.isPointerActive = false;

    // Current interpolated offsets (smoothed with lerp)
    this.currentRightX = 0;
    this.currentRightY = 0;
    this.currentLeftX = 0;
    this.currentLeftY = 0;

    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseLeave = this.handleMouseLeave.bind(this);
    this.animate = this.animate.bind(this);

    this.init();
  }

  init() {
    if (!this.container) return;

    // Lock container to stationary (no whole-image tilt or parallax)
    this.container.style.transform = 'none';

    // Locate the movable pupil elements inside SVG overlay
    this.rightPupil = this.container.querySelector('#rightPupilGroup');
    this.leftPupil = this.container.querySelector('#leftPupilGroup');

    // Detect touch / coarse pointers
    if (typeof window !== 'undefined' && window.matchMedia) {
      const coarseQuery = window.matchMedia('(pointer: coarse), (hover: none)');
      this.isCoarsePointer = coarseQuery.matches;
      try {
        coarseQuery.addEventListener('change', (e) => {
          this.isCoarsePointer = e.matches;
          if (this.isCoarsePointer) this.resetTransforms();
        });
      } catch (_) {
        if (coarseQuery.addListener) {
          coarseQuery.addListener((e) => {
            this.isCoarsePointer = e.matches;
            if (this.isCoarsePointer) this.resetTransforms();
          });
        }
      }
    }

    this.heroSection = this.container.closest('.hero-section') || document.getElementById('hero') || this.container;

    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    document.addEventListener('mouseleave', this.onMouseLeave, { passive: true });

    this.rafId = requestAnimationFrame(this.animate);
  }

  setReducedMotion(enabled) {
    this.isReducedMotion = enabled;
    if (enabled) {
      this.resetTransforms();
    }
  }

  resetTransforms() {
    this.targetRightX = 0;
    this.targetRightY = 0;
    this.targetLeftX = 0;
    this.targetLeftY = 0;
    this.currentRightX = 0;
    this.currentRightY = 0;
    this.currentLeftX = 0;
    this.currentLeftY = 0;
    this.isPointerActive = false;

    if (this.container) {
      this.container.style.transform = 'none';
    }
    if (this.rightPupil) {
      this.rightPupil.style.transform = 'translate(0px, 0px)';
    }
    if (this.leftPupil) {
      this.leftPupil.style.transform = 'translate(0px, 0px)';
    }
  }

  handleMouseMove(e) {
    if (this.isReducedMotion || this.isCoarsePointer || !this.container) return;

    if (!this.heroSection) {
      this.heroSection = document.getElementById('hero') || this.container.closest('.hero-section');
    }

    const heroRect = this.heroSection ? this.heroSection.getBoundingClientRect() : null;

    // If pointer moves below hero section or off-screen, smoothly ease back to neutral resting
    if (heroRect && (e.clientY < heroRect.top - 100 || e.clientY > heroRect.bottom || heroRect.bottom < 60)) {
      this.handleMouseLeave();
      return;
    }

    const rect = this.container.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      this.handleMouseLeave();
      return;
    }

    // Midpoint between character's eyes in screen coordinates:
    // In the 896x1200 artwork, eye midpoint is at (~550px, ~430px) -> (~61.4% width, ~35.8% height)
    const midEyeX = rect.left + rect.width * 0.614;
    const midEyeY = rect.top + rect.height * 0.358;

    // Vector from eyes center to pointer
    const deltaX = e.clientX - midEyeX;
    const deltaY = e.clientY - midEyeY;

    // Natural viewport-calibrated reach radius:
    // Allows gradual, subtle gaze shifting across entire desktop without hard saturation
    const reachX = Math.max(550, window.innerWidth * 0.5);
    const reachY = Math.max(380, window.innerHeight * 0.45);

    const normDist = Math.min(1.0, Math.hypot(deltaX / reachX, deltaY / reachY));
    const angle = Math.atan2(deltaY, deltaX);

    // Subtle non-linear easing for natural responsiveness
    const gazeStrength = Math.pow(normDist, 0.9);
    const dirX = Math.cos(angle) * gazeStrength;
    const dirY = Math.sin(angle) * gazeStrength;

    // Strictly coordinated ocular bounds:
    // Right eye (closer, primary): max ±4.2px horizontal, ±2.4px vertical
    // Left eye (3/4 angle, secondary): max ±3.6px horizontal, ±2.0px vertical
    // Both pupils share the exact same directional angle, guaranteeing zero cross-eyed distortion!
    this.targetRightX = dirX * 4.2;
    this.targetRightY = dirY * 2.4;

    this.targetLeftX = dirX * 3.6;
    this.targetLeftY = dirY * 2.0;

    this.isPointerActive = true;
  }

  handleMouseLeave() {
    // Smoothly ease eyes back to default resting gaze when pointer leaves
    this.targetRightX = 0;
    this.targetRightY = 0;
    this.targetLeftX = 0;
    this.targetLeftY = 0;
    this.isPointerActive = false;
  }

  animate() {
    if (!this.isReducedMotion && !this.isCoarsePointer) {
      const lerp = 0.09; // Silky smooth damping

      this.currentRightX += (this.targetRightX - this.currentRightX) * lerp;
      this.currentRightY += (this.targetRightY - this.currentRightY) * lerp;
      this.currentLeftX += (this.targetLeftX - this.currentLeftX) * lerp;
      this.currentLeftY += (this.targetLeftY - this.currentLeftY) * lerp;

      if (!this.isPointerActive && Math.abs(this.currentRightX) < 0.02 && Math.abs(this.currentRightY) < 0.02) {
        this.currentRightX = 0;
        this.currentRightY = 0;
        this.currentLeftX = 0;
        this.currentLeftY = 0;
      }

      // Ensure overall portrait container stays strictly stationary
      if (this.container && this.container.style.transform !== 'none') {
        this.container.style.transform = 'none';
      }

      const hasMovement =
        Math.abs(this.currentRightX) > 0.005 ||
        Math.abs(this.currentRightY) > 0.005 ||
        this.isPointerActive;

      if (hasMovement) {
        if (this.rightPupil) {
          this.rightPupil.style.transform = `translate(${this.currentRightX.toFixed(2)}px, ${this.currentRightY.toFixed(2)}px)`;
        }
        if (this.leftPupil) {
          this.leftPupil.style.transform = `translate(${this.currentLeftX.toFixed(2)}px, ${this.currentLeftY.toFixed(2)}px)`;
        }
      } else {
        if (this.rightPupil) {
          this.rightPupil.style.transform = 'translate(0px, 0px)';
        }
        if (this.leftPupil) {
          this.leftPupil.style.transform = 'translate(0px, 0px)';
        }
      }
    }

    this.rafId = requestAnimationFrame(this.animate);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    window.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseleave', this.onMouseLeave);
  }
}
