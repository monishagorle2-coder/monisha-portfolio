/**
 * Application Entry Point
 * Orchestrates motion timelines, particle systems, character layer controls, and recruiter UI.
 */

import { EmberParticleSystem } from './modules/particles.js';
import { CharacterLayerController } from './modules/characterLayers.js';
import { MotionOrchestrator } from './modules/animations.js';
import { DesignSystemModal } from './modules/designSystemModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Check user prefers-reduced-motion OS setting
  const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = prefersReducedMotionQuery.matches;

  // 2. Initialize Layered Character Stage Controller
  const characterStage = document.getElementById('character-stage');
  const characterController = new CharacterLayerController(characterStage);

  // 3. Initialize Particle System
  const emberCanvas = document.getElementById('ember-canvas');
  let particleSystem = null;
  if (emberCanvas && !isReducedMotion) {
    particleSystem = new EmberParticleSystem(emberCanvas);
    particleSystem.start();
  }

  // 4. Initialize GSAP Motion Orchestrator
  const motionOrchestrator = new MotionOrchestrator(characterController);
  motionOrchestrator.init(isReducedMotion);

  // 5. Initialize Design System Inspector Modal
  new DesignSystemModal(characterController);

  // 6. Connect Stage Tools Buttons
  const btnTriggerGlitch = document.getElementById('btn-trigger-portrait-glitch');
  if (btnTriggerGlitch) {
    btnTriggerGlitch.addEventListener('click', () => {
      characterController.triggerGlitch();
    });
  }

  const btnReplayIntro = document.getElementById('btn-replay-intro');
  if (btnReplayIntro) {
    btnReplayIntro.addEventListener('click', () => {
      motionOrchestrator.replayIntro();
    });
  }

  // 7. Motion Toggle Button (Allows overriding preference)
  const btnToggleMotion = document.getElementById('btn-toggle-motion');
  if (btnToggleMotion) {
    const updateMotionUI = () => {
      btnToggleMotion.textContent = isReducedMotion ? 'Motion: Reduced' : 'Motion: Normal';
      btnToggleMotion.classList.toggle('btn-primary', isReducedMotion);
      btnToggleMotion.classList.toggle('btn-secondary', !isReducedMotion);
      document.body.classList.toggle('reduced-motion', isReducedMotion);
      characterController.setReducedMotion(isReducedMotion);

      if (isReducedMotion) {
        if (particleSystem) particleSystem.stop();
        motionOrchestrator.skipIntro();
      } else {
        if (!particleSystem && emberCanvas) {
          particleSystem = new EmberParticleSystem(emberCanvas);
        }
        if (particleSystem) particleSystem.start();
      }
    };

    updateMotionUI();

    btnToggleMotion.addEventListener('click', () => {
      isReducedMotion = !isReducedMotion;
      updateMotionUI();
    });

    prefersReducedMotionQuery.addEventListener('change', (e) => {
      isReducedMotion = e.matches;
      updateMotionUI();
    });
  }

  console.log('Monisha G Portfolio — Design System Foundation Initialized');
});
