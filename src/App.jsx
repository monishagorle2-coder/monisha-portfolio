import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CinematicIntro } from './components/CinematicIntro';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Education } from './components/Education';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ChapterProgress } from './components/ChapterProgress';
import { CustomCursor } from './components/CustomCursor';

const SECTIONS = ['hero', 'about', 'skills', 'projects', 'education', 'contact'];

export const App = () => {
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [introFinished, setIntroFinished] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasViewed = sessionStorage.getItem('monisha_intro_viewed');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return !!(hasViewed || prefersReduced);
    }
    return false;
  });

  const [replayKey, setReplayKey] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Theme state initialized from DOM / localStorage
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio-theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Sync theme attribute on documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen to OS prefers-color-scheme if no manual preference is saved
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const saved = localStorage.getItem('portfolio-theme');
      if (!saved) {
        const next = e.matches ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('portfolio-theme', next);
      } catch (err) {
        console.warn('Unable to persist theme to localStorage', err);
      }
      return next;
    });
  };

  useEffect(() => {
    // Detect OS reduced motion setting
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle URL hash on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (SECTIONS.includes(hash)) {
        setActiveSection(hash);
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    }
  }, []);

  // Robust document-relative scroll tracking (fixes transformed offsetParent bug)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const totalScroll = docHeight - winHeight;

      if (totalScroll > 0) {
        const currentProgress = (scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // 1. If at top of page, hero is always active
      if (scrollY < 120) {
        setActiveSection('hero');
        return;
      }

      // 2. If at bottom of page, contact is active
      if (winHeight + scrollY >= docHeight - 60) {
        setActiveSection('contact');
        return;
      }

      // 3. Document-relative position calculation using getBoundingClientRect
      const targetY = scrollY + Math.min(320, winHeight * 0.38);
      let matchedSection = 'hero';

      for (let i = 0; i < SECTIONS.length; i++) {
        const el = document.getElementById(SECTIONS[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          const docTop = rect.top + scrollY;
          if (targetY >= docTop) {
            matchedSection = SECTIONS[i];
          }
        }
      }

      setActiveSection(matchedSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for restrained scroll-triggered section reveals
  useEffect(() => {
    if (isReducedMotion) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [isReducedMotion, introFinished]);

  const handleToggleMotion = () => {
    setIsReducedMotion(prev => {
      const next = !prev;
      document.body.classList.toggle('reduced-motion', next);
      return next;
    });
  };

  const handleReplayIntro = () => {
    if (!isReducedMotion) {
      setIntroFinished(false);
      setReplayKey(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`portfolio-app-root ${isReducedMotion ? 'reduced-motion' : ''}`}>
      {/* Custom Circular Cursor (Fine pointer desktop only) */}
      <CustomCursor isReducedMotion={isReducedMotion} />

      {/* 1. Cinematic Intro with Skip Option and Session Memory */}
      {!introFinished && (
        <CinematicIntro 
          key={replayKey}
          forceShow={replayKey > 0}
          isReducedMotion={isReducedMotion}
          onComplete={() => setIntroFinished(true)} 
        />
      )}

      {/* Chapter Progress & Scroll Indicator */}
      <ChapterProgress 
        activeSection={activeSection}
        scrollProgress={scrollProgress}
      />

      {/* Navigation Header */}
      <Navbar 
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isReducedMotion={isReducedMotion} 
        onToggleMotion={handleToggleMotion} 
        activeSection={activeSection}
      />

      {/* Main Sections Content */}
      <main id="main-content" role="main">
        {/* 2. Interactive Anime Hero with Automatic Name Typing */}
        <Hero 
          isReducedMotion={isReducedMotion} 
          onReplayIntro={handleReplayIntro}
          startTyping={introFinished}
          replayKey={replayKey}
        />

        {/* 3. About Me */}
        <div className="reveal-on-scroll">
          <About />
        </div>

        {/* 4. Skills */}
        <div className="reveal-on-scroll">
          <Skills />
        </div>

        {/* 5. Featured Projects */}
        <div className="reveal-on-scroll">
          <Projects />
        </div>

        {/* 6. Education and Certifications */}
        <div className="reveal-on-scroll">
          <Education />
        </div>

        {/* 7. Contact and Social Links */}
        <div className="reveal-on-scroll">
          <Contact />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
