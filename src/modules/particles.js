/**
 * Ambient Canvas Particle System (Subtle Crimson Embers)
 * Restrained count, zero CPU bloat, respects prefers-reduced-motion.
 */

export class EmberParticleSystem {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.particles = [];
    this.maxParticles = 28;
    this.animationId = null;
    this.isRunning = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Populate initial particle set
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }

    // Check visibility change to save CPU when tab is inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createParticle(randomY = false) {
    return {
      x: Math.random() * (this.width || 400),
      y: randomY ? Math.random() * (this.height || 500) : (this.height || 500) + 10,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 0.4 + 0.2,
      speedX: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.15,
      fadeSpeed: Math.random() * 0.003 + 0.002,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.4 ? 'rgba(255, 67, 46, ' : 'rgba(123, 16, 27, '
    };
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y -= p.speedY;
      p.wobble += p.wobbleSpeed;
      p.x += Math.sin(p.wobble) * 0.35 + p.speedX;
      p.alpha -= p.fadeSpeed;

      // Render glowing circular ember
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `${p.color}${Math.max(0, p.alpha)})`;
      this.ctx.shadowBlur = p.size * 3;
      this.ctx.shadowColor = 'rgba(255, 67, 46, 0.5)';
      this.ctx.fill();

      // Reset when faded or out of frame
      if (p.y < -10 || p.alpha <= 0) {
        this.particles[i] = this.createParticle(false);
      }
    }

    if (this.isRunning) {
      this.animationId = requestAnimationFrame(() => this.update());
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.update();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
