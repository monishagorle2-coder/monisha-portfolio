import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FastForward } from 'lucide-react';
import { profileData } from '../data/profileData';

const GLYPHS = ['0', '1', '§', 'Δ', 'Ω', 'X', '✦', '7', 'Z', 'M', 'λ', '/>', '{ }'];
const PORTFOLIO_LETTERS = ['P', 'O', 'R', 'T', 'F', 'O', 'L', 'I', 'O'];
const ORBIT_FRAGMENTS = [
  { symbol: '✦', angle: 0, dist: 160 },
  { symbol: '0', angle: 30, dist: 140 },
  { symbol: 'Ω', angle: 65, dist: 180 },
  { symbol: '1', angle: 100, dist: 150 },
  { symbol: 'Δ', angle: 135, dist: 170 },
  { symbol: '§', angle: 170, dist: 140 },
  { symbol: '/>', angle: 210, dist: 190 },
  { symbol: 'λ', angle: 250, dist: 160 },
  { symbol: '✦', angle: 290, dist: 150 },
  { symbol: '{ }', angle: 325, dist: 175 },
];

export const CinematicIntro = ({ onComplete, isReducedMotion, forceShow = false }) => {
  const [skipped, setSkipped] = useState(false);
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const letterRefs = useRef([]);
  const timersRef = useRef([]);

  const handleSkip = () => {
    timersRef.current.forEach(t => clearInterval(t));
    timersRef.current = [];
    setSkipped(true);
    sessionStorage.setItem('monisha_intro_viewed', 'true');
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    if (containerRef.current) {
      containerRef.current.style.opacity = '0';
      containerRef.current.style.pointerEvents = 'none';
    }
    onComplete();
  };

  useEffect(() => {
    // If user prefers reduced motion or returning visitor within this session
    const hasViewed = sessionStorage.getItem('monisha_intro_viewed');
    if (isReducedMotion || (hasViewed && !forceShow)) {
      onComplete();
      return;
    }

    // Safety fallback: guaranteed unmount after 5.5s so site can never be permanently blocked
    const fallbackTimer = setTimeout(() => {
      handleSkip();
    }, 5500);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(fallbackTimer);
          sessionStorage.setItem('monisha_intro_viewed', 'true');
          onComplete();
        }
      });
      timelineRef.current = tl;

      // -------------------------------------------------------------
      // SEQUENCE STEP 1: Dark canvas & central singularity spark
      // -------------------------------------------------------------
      tl.set('.intro-center-spark', { scale: 0, opacity: 0 })
        .set('.intro-orbit-fragment', { opacity: 0, scale: 0.5 })
        .set('.intro-portfolio-char', { opacity: 0, filter: 'blur(10px)', scale: 1.4 })
        .set('.intro-character-backdrop', { opacity: 0, scale: 0.92, filter: 'blur(12px)' })
        .set('.intro-light-beam', { opacity: 0, scaleY: 0 })
        .set('.intro-title', { opacity: 0, y: 15 })
        .set('.intro-subtitle', { opacity: 0, y: 10 })
        .set('.intro-shockwave', { scale: 0.2, opacity: 0 })
        
        .to('.intro-center-spark', {
          scale: 1.2,
          opacity: 1,
          duration: 0.45,
          ease: 'power2.out'
        })
        .to('.intro-center-spark', {
          scale: 1.0,
          boxShadow: '0 0 35px #FF432E, 0 0 70px rgba(123, 16, 27, 0.8)',
          duration: 0.25,
          ease: 'power1.inOut'
        });

      // -------------------------------------------------------------
      // SEQUENCE STEP 2: Rotating, drifting fragments gathering inward
      // -------------------------------------------------------------
      tl.to('.intro-orbit-fragment', {
        opacity: 0.85,
        duration: 0.35,
        stagger: 0.02,
        ease: 'power2.out'
      }, '-=0.2')
      .to('.intro-orbit-fragment', {
        x: 0,
        y: 0,
        scale: 0.2,
        opacity: 0,
        rotation: '+=120',
        duration: 0.65,
        stagger: {
          each: 0.02,
          from: 'random'
        },
        ease: 'power3.in'
      }, '-=0.1');

      // -------------------------------------------------------------
      // SEQUENCE STEP 3 & 4: Singularity collapse + Scrambled PORTFOLIO assembly
      // -------------------------------------------------------------
      tl.to('.intro-center-spark', {
        scale: 2.2,
        opacity: 1,
        duration: 0.15,
        ease: 'power4.in'
      }, '-=0.15')
      .to('.intro-shockwave', {
        scale: 3.5,
        opacity: 0.85,
        duration: 0.4,
        ease: 'power2.out'
      }, '-=0.05')
      .to('.intro-shockwave', {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in'
      }, '-=0.15')
      .to('.intro-center-spark', {
        scale: 0,
        opacity: 0,
        duration: 0.2
      }, '-=0.35');

      // Trigger high-speed scramble resolution for each letter of PORTFOLIO
      tl.call(() => {
        letterRefs.current.forEach((el, idx) => {
          if (!el) return;
          const targetChar = PORTFOLIO_LETTERS[idx];
          let ticks = 0;
          const maxTicks = 6 + idx;
          const intervalTime = 35;
          const timer = setInterval(() => {
            ticks++;
            if (ticks >= maxTicks) {
              el.textContent = targetChar;
              el.classList.add('assembled');
              clearInterval(timer);
            } else {
              el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
          }, intervalTime);
          timersRef.current.push(timer);
        });
      }, null, '-=0.15');

      tl.to('.intro-portfolio-char', {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        duration: 0.5,
        stagger: 0.04,
        ease: 'back.out(2.2)'
      }, '-=0.1');

      // -------------------------------------------------------------
      // SEQUENCE STEP 5: Reveal character artwork behind/through title with light beam
      // -------------------------------------------------------------
      tl.to('.intro-light-beam', {
        scaleY: 1,
        opacity: 0.75,
        duration: 0.65,
        ease: 'power2.out'
      }, '-=0.3')
      .to('.intro-character-backdrop', {
        opacity: 0.95,
        scale: 1.0,
        filter: 'blur(0px)',
        duration: 0.75,
        ease: 'power2.out'
      }, '-=0.55');

      // -------------------------------------------------------------
      // SEQUENCE STEP 6: Hold completed title, character, and credentials
      // -------------------------------------------------------------
      tl.to('.intro-title', {
        opacity: 1,
        y: 0,
        letterSpacing: '0.14em',
        duration: 0.45,
        ease: 'power3.out'
      }, '-=0.35')
      .to('.intro-subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'power2.out'
      }, '-=0.25');

      // Cinematic hold of the completed composition (1.0s)
      tl.to({}, { duration: 1.0 });

      // -------------------------------------------------------------
      // SEQUENCE STEP 7: Smooth cinematic dissolve into the portfolio hero
      // -------------------------------------------------------------
      tl.to(containerRef.current, {
        opacity: 0,
        scale: 1.04,
        pointerEvents: 'none',
        duration: 0.6,
        ease: 'power2.inOut'
      });

    }, containerRef);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(fallbackTimer);
      timersRef.current.forEach(t => clearInterval(t));
      window.removeEventListener('keydown', handleKeyDown);
      ctx.revert();
    };
  }, [isReducedMotion, onComplete, forceShow]);

  if (isReducedMotion || skipped) return null;

  return (
    <div 
      className="cinematic-intro-overlay" 
      ref={containerRef} 
      role="region" 
      aria-label="Cinematic Portfolio Introduction"
    >
      {/* Background Atmosphere */}
      <div className="intro-deep-backdrop" aria-hidden="true"></div>
      <div className="intro-ambient-glow" aria-hidden="true"></div>

      {/* Center Singularity Spark & Shockwave (Step 1 & 3) */}
      <div className="intro-center-spark" aria-hidden="true"></div>
      <div className="intro-shockwave" aria-hidden="true"></div>

      {/* Orbiting / Inward Drifting Fragments (Step 2) */}
      <div className="intro-fragments-field" aria-hidden="true">
        {ORBIT_FRAGMENTS.map((item, idx) => {
          const rad = (item.angle * Math.PI) / 180;
          const x = Math.round(Math.cos(rad) * item.dist);
          const y = Math.round(Math.sin(rad) * item.dist);
          return (
            <div
              key={idx}
              className="intro-orbit-fragment"
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
            >
              <span>{item.symbol}</span>
            </div>
          );
        })}
      </div>

      {/* Main Composition Stage */}
      <div className="intro-stage-container">

        {/* Character Artwork Reveal & Dramatic Upward Light Beam (Step 5) */}
        <div className="intro-character-backdrop" aria-hidden="true">
          <div className="intro-light-beam"></div>
          <div className="intro-character-disc">
            <img 
              src="./assets/images/monisha_character.jpg" 
              alt="" 
              className="intro-character-img"
            />
          </div>
          <div className="intro-character-aura"></div>
        </div>

        {/* Scrambled & Assembled Bold PORTFOLIO Title (Step 3 & 4) */}
        <div className="intro-portfolio-header" aria-label="PORTFOLIO">
          <div className="intro-portfolio-word">
            {PORTFOLIO_LETTERS.map((letter, idx) => (
              <span
                key={idx}
                ref={el => (letterRefs.current[idx] = el)}
                className="intro-portfolio-char"
                data-char={letter}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Identity & Subtitle Group (Step 6) */}
        <div className="intro-identity-group">
          <h2 className="intro-title" id="intro-name-banner">
            {profileData.name.toUpperCase()}
          </h2>
          <div className="intro-subtitle">
            COMPUTER SCIENCE UNDERGRADUATE · FULL-STACK DEVELOPER
          </div>
        </div>

        {/* Skip Intro Control Action */}
        <button 
          type="button" 
          className="btn btn-secondary btn-sm intro-skip-btn" 
          onClick={handleSkip}
          aria-label="Skip cinematic intro (or press Escape)"
        >
          <FastForward size={14} aria-hidden="true" />
          <span>Skip Intro</span>
          <span className="intro-kbd-hint">ESC</span>
        </button>

      </div>
    </div>
  );
};
