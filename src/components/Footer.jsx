import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-content">
        <div className="footer-meta">
          <div className="footer-brand">GORLE MONISHA</div>
          <div className="footer-sub">
            Computer Science Undergraduate · Sai Ganapathi Engineering College, Visakhapatnam (2023–2027)
          </div>
        </div>

        <div className="footer-links-wrap">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm back-to-top-btn" 
            onClick={scrollToTop}
            aria-label="Back to top of page"
          >
            <span>Back to Top</span>
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};
