import React, { useState } from 'react';
import { Menu, X, Activity, Mail, Sun, Moon } from 'lucide-react';

export const Navbar = ({ 
  theme = 'dark', 
  onToggleTheme, 
  isReducedMotion, 
  onToggleMotion, 
  activeSection = 'hero' 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#hero', id: 'hero' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Skills', href: '#skills', id: 'skills' },
    { label: 'Projects', href: '#projects', id: 'projects' },
    { label: 'Education', href: '#education', id: 'education' },
    { label: 'Contact', href: '#contact', id: 'contact' }
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header" role="banner">
      <div className="container nav-container">
        
        {/* Brand Badge */}
        <a href="#hero" className="brand-badge" aria-label="Gorle Monisha - Home">
          <span className="brand-symbol" aria-hidden="true">M</span>
          <span className="brand-text">GORLE MONISHA</span>
        </a>

        {/* Academic / Role Badge */}
        <div className="student-status-badge" title="Undergraduate Status">
          <span className="status-dot" aria-hidden="true"></span>
          <span>B.Tech CSE (2023–2027)</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-links" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a 
                key={link.href} 
                href={link.href} 
                className={`nav-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={handleLinkClick}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Actions: Theme Toggle + Motion Toggle + Contact */}
        <div className="nav-actions">
          {/* Accessible Theme Toggle Button */}
          <button
            type="button"
            className="btn btn-sm btn-icon nav-theme-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={15} aria-hidden="true" />
            ) : (
              <Moon size={15} aria-hidden="true" />
            )}
          </button>

          {/* Reduced Motion Toggle Button */}
          <button 
            type="button" 
            className={`btn btn-sm nav-motion-btn ${isReducedMotion ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={onToggleMotion}
            title={`Motion preference: ${isReducedMotion ? 'Reduced' : 'Normal'}`}
            aria-label={`Motion preference: ${isReducedMotion ? 'Reduced' : 'Normal'}`}
          >
            <Activity size={14} aria-hidden="true" />
            <span className="nav-motion-text">{isReducedMotion ? 'Motion: Off' : 'Motion'}</span>
          </button>
          
          <a href="#contact" className="btn btn-primary btn-sm desktop-only-btn">
            <Mail size={14} aria-hidden="true" />
            <span>Contact</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button 
            type="button" 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-label="Mobile Navigation">
          <nav className="mobile-nav-links">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a 
                  key={link.href} 
                  href={link.href} 
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </a>
              );
            })}

            {/* Mobile Controls Row */}
            <div className="mobile-controls-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm mobile-control-btn"
                onClick={onToggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>

              <button 
                type="button" 
                className={`btn btn-sm mobile-control-btn ${isReducedMotion ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={onToggleMotion}
                aria-label={`Motion preference: ${isReducedMotion ? 'Reduced' : 'Normal'}`}
              >
                <Activity size={14} />
                <span>Motion: {isReducedMotion ? 'Off' : 'On'}</span>
              </button>
            </div>

            <a 
              href="#contact" 
              className="btn btn-primary btn-sm mobile-contact-cta" 
              onClick={handleLinkClick}
            >
              <Mail size={14} aria-hidden="true" />
              <span>Contact Gorle Monisha</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
