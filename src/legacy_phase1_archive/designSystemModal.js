/**
 * Design System Inspector Modal
 * Provides interactive token inspection, contrast verification, and artwork layer documentation.
 */

export class DesignSystemModal {
  constructor(characterController) {
    this.characterController = characterController;
    this.modalBackdrop = document.getElementById('design-system-modal');
    this.openBtn = document.getElementById('btn-open-design-system');
    this.closeBtn = document.getElementById('btn-close-design-system');
    this.toggleExplodeBtn = document.getElementById('btn-toggle-explode-view');

    this.init();
  }

  init() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) {
          this.close();
        }
      });
    }

    // Escape key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalBackdrop && this.modalBackdrop.classList.contains('active')) {
        this.close();
      }
    });

    if (this.toggleExplodeBtn && this.characterController) {
      this.toggleExplodeBtn.addEventListener('click', () => {
        const isExploded = this.characterController.toggleExplodedView();
        this.toggleExplodeBtn.textContent = isExploded ? 'Reset Normal Stage' : 'Inspect 3D Layer Stack';
        this.toggleExplodeBtn.classList.toggle('btn-primary', isExploded);
        this.toggleExplodeBtn.classList.toggle('btn-secondary', !isExploded);
      });
    }
  }

  open() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}
