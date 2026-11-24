/**
 * Character Eye Gaze & Natural Blinking Controller (Refined Phase 2)
 * 
 * Implements natural, synchronized conjugate cursor-following anime eyes
 * and organic eyelid blinking while keeping the character head, body,
 * and overall portrait plate 100% stationary.
 * 
 * Key Principles:
 * 1. Synchronized Conjugate Gaze: Both pupils share the exact same directional
 *    angle vector, eliminating any cross-eyed divergence.
 * 2. Scroll-Aware Stability: Actively monitors scroll and resize. When hero is in view,
 *    eyes smoothly track relative to scroll position. When hero scrolls out of view,
 *    pupils smoothly return to neutral center (0, 0) without sudden jumps or drift.
 * 3. Natural Organic Blinking: Random anime-style eyelid blink cycles (every 3.5s–5.5s)
 *    scaling the eyeball under the upper eyelid with a rapid 180ms closure.
 * 4. Strict Accessibility: Completely disabled under prefers-reduced-motion and
 *    on touch/coarse pointers.
 */

export class CharacterParallaxController {
  constructor(container) {
    this.container = container; // .anime-canvas
    this.heroSection = null;
    this.rightPupil = null;
    this.leftPupil = null;
    this.rightEyeBlink = null;
    this.leftEyeBlink = null;

    this.isReducedMotion = false;
    this.isCoarsePointer = false;
    this.rafId = null;
    this.blinkTimeout = null;

    // Track last known pointer coordinates for scroll recalculation
    this.lastPointerX = null;
    this.lastPointerY = null;
    this.isPointerActive = false;

    // Target pupil offsets (SVG coordinates)
    this.targetRightX = 0;
    this.targetRightY = 0;
    this.targetLeftX = 0;
    this.targetLeftY = 0;

    // Current interpolated offsets (smoothed with lerp)
    this.currentRightX = 0;
    this.currentRightY = 0;
    this.currentLeftX = 0;
    this.currentLeftY = 0;

    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseLeave = this.handleMouseLeave.bind(this);
    this.onScroll = this.handleScroll.bind(this);
    this.onResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);

    this.init();
  }

  init() {
    if (!this.container) return;

    // Lock container to stationary (no whole-image tilt or parallax)
    this.container.style.transform = 'none';

    // Locate the movable pupil elements and blink groups inside SVG overlay
    this.rightPupil = this.container.querySelector('#rightPupilGroup');
    this.leftPupil = this.container.querySelector('#leftPupilGroup');
    this.rightEyeBlink = this.container.querySelector('#rightEyeBlinkGroup');
    this.leftEyeBlink = this.container.querySelector('#leftEyeBlinkGroup');

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
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('mouseleave', this.onMouseLeave, { passive: true });

    this.rafId = requestAnimationFrame(this.animate);
    this.scheduleBlink();
  }

  setReducedMotion(enabled) {
    this.isReducedMotion = enabled;
    if (enabled) {
      this.resetTransforms();
      if (this.blinkTimeout) {
        clearTimeout(this.blinkTimeout);
        this.blinkTimeout = null;
      }
      this.removeBlinkClasses();
    } else {
      this.scheduleBlink();
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
    this.lastPointerX = null;
    this.lastPointerY = null;

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

    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    this.updateGaze(e.clientX, e.clientY);
  }

  handleScroll() {
    if (this.isReducedMotion || this.isCoarsePointer || !this.container) return;

    if (!this.heroSection) {
      this.heroSection = document.getElementById('hero') || this.container.closest('.hero-section');
    }

    const heroRect = this.heroSection ? this.heroSection.getBoundingClientRect() : null;

    // If hero section has scrolled out of view, smoothly ease pupils back to resting center
    if (!heroRect || heroRect.bottom < 60 || heroRect.top > window.innerHeight) {
      this.targetRightX = 0;
      this.targetRightY = 0;
      this.targetLeftX = 0;
      this.targetLeftY = 0;
      this.isPointerActive = false;
      return;
    }

    // If cursor is known and hero is in view, re-evaluate gaze angle relative to the new scroll position
    if (this.lastPointerX !== null && this.lastPointerY !== null) {
      this.updateGaze(this.lastPointerX, this.lastPointerY);
    }
  }

  handleResize() {
    if (this.lastPointerX !== null && this.lastPointerY !== null) {
      this.updateGaze(this.lastPointerX, this.lastPointerY);
    }
  }

  updateGaze(clientX, clientY) {
    if (this.isReducedMotion || this.isCoarsePointer || !this.container) return;

    if (!this.heroSection) {
      this.heroSection = document.getElementById('hero') || this.container.closest('.hero-section');
    }

    const heroRect = this.heroSection ? this.heroSection.getBoundingClientRect() : null;
    const rect = this.container.getBoundingClientRect();

    // If hero is out of bounds or container is completely off-screen, return to neutral
    if (!heroRect || heroRect.bottom < 60 || heroRect.top > window.innerHeight || rect.bottom < 0 || rect.top > window.innerHeight) {
      this.handleMouseLeave();
      return;
    }

    // If cursor moves beyond hero boundary, smoothly return eyes to resting
    if (clientY < heroRect.top - 80 || clientY > heroRect.bottom + 40) {
      this.handleMouseLeave();
      return;
    }

    // Midpoint between character's eyes in screen coordinates:
    // In the 896x1200 artwork, eye midpoint is at (~550px, ~430px) -> (~61.4% width, ~35.8% height)
    const midEyeX = rect.left + rect.width * 0.614;
    const midEyeY = rect.top + rect.height * 0.358;

    // Vector from eyes center to pointer
    const deltaX = clientX - midEyeX;
    const deltaY = clientY - midEyeY;

    // Viewport-calibrated reach radius:
    // Provides smooth, gradual gaze shifting across desktop without sudden saturation
    const reachX = Math.max(500, window.innerWidth * 0.45);
    const reachY = Math.max(350, window.innerHeight * 0.4);

    const normDist = Math.min(1.0, Math.hypot(deltaX / reachX, deltaY / reachY));
    const angle = Math.atan2(deltaY, deltaX);

    // Subtle non-linear easing for natural responsiveness
    const gazeStrength = Math.pow(normDist, 0.85);
    const dirX = Math.cos(angle) * gazeStrength;
    const dirY = Math.sin(angle) * gazeStrength;

    // Synchronized Conjugate Ocular Displacement:
    // Both pupils share the EXACT same directional angle and proportional displacement.
    // Right Eye (primary, closer in 3/4 perspective): max 3.8px horizontal, 2.0px vertical
    // Left Eye (foreshortened 3/4 perspective): max 3.2px horizontal, 1.7px vertical
    // This maintains visual convergence and eliminates divergent cross-eyed distortion!
    this.targetRightX = dirX * 3.8;
    this.targetRightY = dirY * 2.0;

    this.targetLeftX = dirX * 3.2;
    this.targetLeftY = dirY * 1.7;

    this.isPointerActive = true;
  }

  handleMouseLeave() {
    this.targetRightX = 0;
    this.targetRightY = 0;
    this.targetLeftX = 0;
    this.targetLeftY = 0;
    this.isPointerActive = false;
  }

  scheduleBlink() {
    if (this.isReducedMotion || this.isCoarsePointer) return;

    if (this.blinkTimeout) clearTimeout(this.blinkTimeout);

    // Random interval between 3200ms and 5600ms
    const interval = Math.random() * 2400 + 3200;
    this.blinkTimeout = setTimeout(() => {
      this.triggerBlink();
      this.scheduleBlink();
    }, interval);
  }

  triggerBlink() {
    if (this.isReducedMotion || this.isCoarsePointer) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    if (this.rightEyeBlink && this.leftEyeBlink) {
      this.rightEyeBlink.classList.add('eye-blink-active');
      this.leftEyeBlink.classList.add('eye-blink-active');

      setTimeout(() => {
        this.removeBlinkClasses();
      }, 180);
    }
  }

  removeBlinkClasses() {
    if (this.rightEyeBlink) {
      this.rightEyeBlink.classList.remove('eye-blink-active');
    }
    if (this.leftEyeBlink) {
      this.leftEyeBlink.classList.remove('eye-blink-active');
    }
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
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
    }
    this.removeBlinkClasses();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('mouseleave', this.onMouseLeave);
  }
}
