import React from 'react';

const CHAPTERS = [
  { id: 'hero', num: '01', label: 'Hero' },
  { id: 'about', num: '02', label: 'About' },
  { id: 'skills', num: '03', label: 'Skills' },
  { id: 'projects', num: '04', label: 'Projects' },
  { id: 'education', num: '05', label: 'Education' },
  { id: 'contact', num: '06', label: 'Contact' }
];

export const ChapterProgress = ({ activeSection = 'hero', scrollProgress = 0 }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div 
        className="top-scroll-progress-bar" 
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
        aria-hidden="true"
      />

      {/* Floating Vertical Chapter Indicator */}
      <nav className="chapter-nav-tracker" aria-label="Section chapter navigation">
        <div className="chapter-track-line" aria-hidden="true">
          <div 
            className="chapter-track-fill" 
            style={{ height: `${scrollProgress}%` }}
          />
        </div>

        <ul className="chapter-dots-list">
          {CHAPTERS.map((ch) => {
            const isActive = activeSection === ch.id;
            return (
              <li key={ch.id} className="chapter-item">
                <button
                  type="button"
                  className={`chapter-btn ${isActive ? 'active' : ''}`}
                  onClick={() => scrollTo(ch.id)}
                  aria-label={`Jump to chapter ${ch.num}: ${ch.label}`}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span className="chapter-dot" aria-hidden="true"></span>
                  <span className="chapter-badge">
                    <span className="chapter-num">{ch.num}</span>
                    <span className="chapter-name">{ch.label}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
