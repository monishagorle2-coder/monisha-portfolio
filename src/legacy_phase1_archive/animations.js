/**
 * GSAP Motion Orchestrator
 * Cinematic timelines, restrained easing (power3.out), no excessive bounce.
 * Fully accessible with prefers-reduced-motion and skip capabilities.
 */

import { gsap } from 'gsap';

export class MotionOrchestrator {
  constructor(characterController) {
    this.characterController = characterController;
    this.masterTimeline = null;
    this.isReducedMotion = false;
  }

  init(isReduced = false) {
    this.isReducedMotion = isReduced;

    if (this.isReducedMotion) {
      this.applyImmediateLayout();
      return;
    }

    this.buildIntroTimeline();
  }

  buildIntroTimeline() {
    if (this.masterTimeline) {
      this.masterTimeline.kill();
    }

    this.masterTimeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
        duration: 0.7
      }
    });

    // Elements to animate
    const header = document.querySelector('.site-header');
    const characterStage = document.querySelector('.anime-stage-wrapper');
    const eyebrow = document.querySelector('.hero-eyebrow-wrap');
    const heroTitle = document.querySelector('.hero-title');
    const heroRole = document.querySelector('.hero-role');
    const heroBio = document.querySelector('.hero-bio');
    const heroCtas = document.querySelector('.hero-ctas');
    const heroStats = document.querySelectorAll('.stat-pill');
    const recruiterTray = document.querySelector('.recruiter-tray');
    const stageTools = document.querySelector('.stage-tools');

    // 1. Initial State setup (Transforms & Opacity ONLY)
    gsap.set([header, characterStage, eyebrow, heroTitle, heroRole, heroBio, heroCtas, recruiterTray, stageTools], {
      opacity: 0
    });
    gsap.set(header, { y: -20 });
    gsap.set(characterStage, { scale: 0.94, y: 15 });
    gsap.set([eyebrow, heroRole, heroBio, heroCtas, recruiterTray, stageTools], { y: 16 });
    gsap.set(heroTitle, { y: 20, letterSpacing: "0.28em" });
    gsap.set(heroStats, { opacity: 0, y: 12 });

    // 2. Timeline Sequences
    this.masterTimeline
      // Reveal site header cleanly
      .to(header, {
        opacity: 1,
        y: 0,
        duration: 0.5
      })
      // Reveal character stage with smooth cinematic scale
      .to(characterStage, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          if (this.characterController) {
            this.characterController.triggerGlitch();
          }
        }
      }, "-=0.3")
      // Reveal Developer Eyebrow
      .to(eyebrow, {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, "-=0.5")
      // Hero Title "MONISHA G" — The strongest typographic element
      .to(heroTitle, {
        opacity: 1,
        y: 0,
        letterSpacing: "0.12em",
        duration: 0.7,
        ease: "power3.out"
      }, "-=0.3")
      // Role & Elevator Bio
      .to([heroRole, heroBio], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1
      }, "-=0.4")
      // Stats Cards Stagger
      .to(heroStats, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.08
      }, "-=0.3")
      // Action CTAs & Stage Tools
      .to([heroCtas, stageTools], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1
      }, "-=0.2")
      // Recruiter Discovery Tray
      .to(recruiterTray, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, "-=0.3");
  }

  skipIntro() {
    if (this.masterTimeline) {
      this.masterTimeline.progress(1);
    } else {
      this.applyImmediateLayout();
    }
  }

  replayIntro() {
    if (this.isReducedMotion) return;
    this.buildIntroTimeline();
  }

  applyImmediateLayout() {
    const allAnimated = document.querySelectorAll(
      '.site-header, .anime-stage-wrapper, .hero-eyebrow-wrap, .hero-title, .hero-role, .hero-bio, .hero-ctas, .stat-pill, .recruiter-tray, .stage-tools'
    );
    gsap.set(allAnimated, {
      opacity: 1,
      y: 0,
      scale: 1,
      letterSpacing: "0.12em",
      clearProps: "all"
    });
  }
}
