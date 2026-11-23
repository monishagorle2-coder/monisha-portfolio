import React, { useRef, useEffect, useState } from 'react';
import { profileData } from '../data/profileData';
import { EmberParticleSystem } from '../modules/particles';
import { CharacterParallaxController } from '../modules/characterLayers';
import { ArrowDown, RefreshCw, GraduationCap, Cpu, ExternalLink } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

export const Hero = ({ isReducedMotion, onReplayIntro, startTyping = true, replayKey = 0 }) => {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const controllerRef = useRef(null);
  const particleSystemRef = useRef(null);

  // Automatic Name Typing State (Phase 4)
  const targetName = "Gorle Monisha";
  const [typedName, setTypedName] = useState(() => isReducedMotion ? targetName : "");
  const [isTypingDone, setIsTypingDone] = useState(() => isReducedMotion);
  const hasTypedRef = useRef(false);

  useEffect(() => {
    // When cinematic intro is replayed, reset typing state
    if (replayKey > 0) {
      hasTypedRef.current = false;
      setTypedName("");
      setIsTypingDone(false);
    }
  }, [replayKey]);

  useEffect(() => {
    if (isReducedMotion) {
      setTypedName(targetName);
      setIsTypingDone(true);
      return;
    }

    if (!startTyping || hasTypedRef.current) return;
    hasTypedRef.current = true;

    let currentIndex = 0;
    setTypedName("");
    setIsTypingDone(false);

    // Subtle initial hold before typing begins
    const initialTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        currentIndex++;
        setTypedName(targetName.slice(0, currentIndex));
        if (currentIndex >= targetName.length) {
          clearInterval(interval);
          setTimeout(() => {
            setIsTypingDone(true);
          }, 350);
        }
      }, 70); // 70ms per character for an elegant, cinematic cadence

      return () => clearInterval(interval);
    }, 200);

    return () => clearTimeout(initialTimeout);
  }, [startTyping, isReducedMotion]);

  useEffect(() => {
    // Initialize coordinated pointer parallax controller for character eyes
    if (stageRef.current) {
      controllerRef.current = new CharacterParallaxController(stageRef.current);
      controllerRef.current.setReducedMotion(isReducedMotion);
    }

    // Initialize ambient ember particle system
    if (canvasRef.current && !isReducedMotion) {
      particleSystemRef.current = new EmberParticleSystem(canvasRef.current);
      particleSystemRef.current.start();
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.destroy();
      }
      if (particleSystemRef.current) {
        particleSystemRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setReducedMotion(isReducedMotion);
    }
    if (isReducedMotion && particleSystemRef.current) {
      particleSystemRef.current.stop();
    } else if (!isReducedMotion && particleSystemRef.current) {
      particleSystemRef.current.start();
    }
  }, [isReducedMotion]);

  return (
    <section id="hero" className="hero-section" aria-label="Hero Section">
      {/* Ambient Visual Atmosphere */}
      <div className="hero-ambient-glow" aria-hidden="true"></div>
      <div className="hero-grid-pattern" aria-hidden="true"></div>

      <div className="container">
        <div className="grid-12">
          
          {/* Column 1: Editorial Hero Identity & Real Profile */}
          <div className="hero-content-col">
            <div className="hero-eyebrow-wrap">
              <span className="eyebrow">
                <Cpu size={14} aria-hidden="true" />
                <span>STUDENT & DEVELOPING SOFTWARE ENGINEER</span>
              </span>
            </div>

            {/* Name: Animated Typing Anchor with Screen-Reader Accessibility */}
            <h1 className="hero-title" aria-label={targetName}>
              <span className="hero-title-text" id="hero-name-target">
                {typedName || (isReducedMotion ? targetName : "")}
              </span>
              {!isTypingDone && !isReducedMotion && (
                <span className="typing-cursor" aria-hidden="true">|</span>
              )}
            </h1>

            {/* Developer Title: Smoothly revealed after name typing */}
            <div className={`hero-role ${isTypingDone || isReducedMotion ? 'revealed' : 'pending'}`}>
              <span>{profileData.title}</span>
            </div>

            {/* Academic Credential Pill */}
            <div className="academic-quick-pill">
              <GraduationCap size={16} className="pill-icon" aria-hidden="true" />
              <span>{profileData.institution} · 2023–2027 · CGPA: {profileData.cgpa}</span>
            </div>

            {/* Introduction Tagline */}
            <p className="hero-bio lead">
              “{profileData.tagline}”
            </p>

            {/* Core Competency Badges (Genuine Student Highlights) */}
            <div className="hero-focus-cards">
              <div className="focus-mini-card">
                <span className="focus-mini-icon">📐</span>
                <div>
                  <div className="focus-mini-title">Algorithmic Foundations</div>
                  <div className="focus-mini-sub">DSA, OOP, DBMS & Networks</div>
                </div>
              </div>

              <div className="focus-mini-card">
                <span className="focus-mini-icon">⚡</span>
                <div>
                  <div className="focus-mini-title">Full-Stack Architecture</div>
                  <div className="focus-mini-sub">React, TypeScript, Express, PostgreSQL</div>
                </div>
              </div>

              <div className="focus-mini-card">
                <span className="focus-mini-icon">🛡️</span>
                <div>
                  <div className="focus-mini-title">Security & Applied AI</div>
                  <div className="focus-mini-sub">JWT, RBAC & FastAPI OCR Pipelines</div>
                </div>
              </div>
            </div>

            {/* Refined Action CTAs */}
            <div className="hero-ctas">
              <a href="#projects" className="btn btn-primary btn-lg">
                <span>View Projects</span>
                <ArrowDown size={15} aria-hidden="true" />
              </a>

              <a 
                href={profileData.links.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary btn-lg"
                aria-label="GitHub Profile (opens in new tab)"
              >
                <GithubIcon size={16} aria-hidden="true" />
                <span>GitHub</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>

              <a 
                href={profileData.links.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary btn-lg"
                aria-label="LinkedIn Profile (opens in new tab)"
              >
                <LinkedinIcon size={16} aria-hidden="true" />
                <span>LinkedIn</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>

              <a href="#contact" className="btn btn-ghost btn-lg">
                <span>Contact</span>
              </a>

              <button 
                type="button" 
                className="btn btn-ghost btn-sm hero-replay-btn" 
                onClick={onReplayIntro} 
                title="Replay cinematic GSAP intro sequence"
                aria-label="Replay cinematic introduction"
              >
                <RefreshCw size={13} aria-hidden="true" />
                <span>Replay Intro</span>
              </button>
            </div>
          </div>

          {/* Column 2: Naturally Integrated Anime Character Centerpiece */}
          <div className="hero-visual-col">
            <div className="anime-stage-wrapper">
              
              {/* Natural Ambient Radiance Backdrop */}
              <div className="anime-aura-radiance" aria-hidden="true"></div>

              {/* Seamless Character Stage (Subtle Pointer Parallax) */}
              <div 
                className="anime-canvas" 
                ref={stageRef} 
                id="character-stage"
                aria-label="Gorle Monisha - Anime Developer Character Portrait"
              >
                {/* Layer 0: Atmospheric Crimson Ambient Gradient */}
                <div className="anime-layer layer-0-backdrop" aria-hidden="true">
                  <svg className="astral-sigil" viewBox="0 0 200 200" fill="none" stroke="rgba(255, 67, 46, 0.22)" strokeWidth="1.2">
                    <circle cx="100" cy="100" r="90" strokeDasharray="4 6" />
                    <circle cx="100" cy="100" r="70" />
                    <polygon points="100,20 180,150 20,150" />
                    <polygon points="100,180 20,50 180,50" />
                    <circle cx="100" cy="100" r="28" fill="rgba(123, 16, 27, 0.2)" />
                  </svg>
                </div>

                {/* Layer 1: Ambient Floating Canvas Embers */}
                <canvas 
                  className="anime-layer layer-1-particles" 
                  ref={canvasRef} 
                  id="ember-canvas" 
                  aria-hidden="true"
                />

                {/* Layer 2: Clean Anime Character Portrait Plate */}
                <img 
                  src="./assets/images/monisha_character.jpg" 
                  alt="Gorle Monisha - Illustrated anime software engineer at workstation with laptop and ambient crimson atmosphere" 
                  className="anime-layer layer-2-portrait" 
                  loading="eager"
                  fetchPriority="high"
                />

                {/* Layer 2.5: Interactive Cursor-Following Eyes (Stationary Character) */}
                <svg 
                  className="anime-layer eye-overlay-svg" 
                  viewBox="0 0 896 1200" 
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <clipPath id="heroRightEyeClip">
                      <path d="M 466,417 C 480,410 505,406 536,414 C 541,416 545,419 542,422 C 536,436 518,444 494,440 C 480,436 470,425 466,417 Z" />
                    </clipPath>
                    <linearGradient id="heroScleraGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d1f1a" />
                      <stop offset="25%" stopColor="#7a463c" />
                      <stop offset="65%" stopColor="#c99185" />
                      <stop offset="100%" stopColor="#d49e92" />
                    </linearGradient>
                    <linearGradient id="heroIrisGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a0505" />
                      <stop offset="55%" stopColor="#1f0f0d" />
                      <stop offset="85%" stopColor="#4a1e18" />
                      <stop offset="100%" stopColor="#6e2d24" />
                    </linearGradient>
                    <clipPath id="heroLeftEyeClip">
                      <path d="M 572,429 C 576,424 584,421 594,425 C 596,428 594,433 590,436 C 583,438 576,435 572,429 Z" />
                    </clipPath>
                  </defs>

                  {/* RIGHT EYE (Viewer Left) */}
                  <path d="M 466,417 C 480,410 505,406 536,414 C 541,416 545,419 542,422 C 536,436 518,444 494,440 C 480,436 470,425 466,417 Z" fill="url(#heroScleraGrad)" />
                  <g clipPath="url(#heroRightEyeClip)">
                    <g id="rightPupilGroup" className="movable-pupil">
                      <ellipse cx="523.5" cy="431" rx="11.5" ry="14" fill="url(#heroIrisGrad)" />
                      <ellipse cx="524" cy="430.5" rx="6" ry="8" fill="#070303" />
                      <circle cx="519" cy="425.5" r="3" fill="#ffffff" />
                      <circle cx="528" cy="434" r="1.6" fill="rgba(255, 235, 220, 0.8)" />
                      <ellipse cx="523.5" cy="440" rx="7" ry="3.5" fill="rgba(255, 67, 46, 0.45)" />
                    </g>
                  </g>
                  <path d="M 462,419 C 476,410 505,404 538,413 C 543,415 547,418 544,421 C 538,418 505,407 472,416 Z" fill="#080303" />
                  <path d="M 486,410 L 483,404 L 489,409 Z M 510,405 L 512,399 L 515,406 Z M 532,411 L 538,406 L 535,413 Z" fill="#080303" />
                  <path d="M 470,421 C 488,435 514,441 540,424" fill="none" stroke="rgba(25, 12, 12, 0.8)" strokeWidth="1.4" />

                  {/* LEFT EYE (Viewer Right) */}
                  <path d="M 572,429 C 576,424 584,421 594,425 C 596,428 594,433 590,436 C 583,438 576,435 572,429 Z" fill="url(#heroScleraGrad)" />
                  <g clipPath="url(#heroLeftEyeClip)">
                    <g id="leftPupilGroup" className="movable-pupil">
                      <ellipse cx="583" cy="430" rx="6.5" ry="8" fill="url(#heroIrisGrad)" />
                      <ellipse cx="583" cy="430" rx="3.5" ry="4.5" fill="#070303" />
                      <circle cx="580.5" cy="427" r="1.8" fill="#ffffff" />
                    </g>
                  </g>
                  <path d="M 570,429 C 575,424 584,421 595,426 C 596,428 594,430 591,428 C 583,424 575,426 571,430 Z" fill="#080303" />
                </svg>

                {/* Layer 3: Soft Atmospheric Crimson Rim Lighting & Edge Vignette */}
                <div className="anime-layer layer-3-rimlight" aria-hidden="true"></div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
