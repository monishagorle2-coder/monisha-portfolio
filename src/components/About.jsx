import React from 'react';
import { profileData } from '../data/profileData';
import { GraduationCap, Code2, ShieldAlert, BookOpen, CheckCircle2 } from 'lucide-react';

export const About = () => {
  return (
    <section id="about" className="section-padding about-section" aria-label="About Gorle Monisha">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <span className="eyebrow">ACADEMIC FOUNDATION & ENGINEERING FOCUS</span>
          <h2 className="section-title">About Me</h2>
          <p className="section-subtitle">
            An undergraduate software engineer blending algorithmic rigor with modern full-stack development.
          </p>
        </div>

        <div className="about-grid">
          
          {/* Main Narrative */}
          <div className="about-narrative-col">
            <p className="about-lead">
              {profileData.about.lead}
            </p>
            {profileData.about.paragraphs.map((p, idx) => (
              <p key={idx} className="about-text">
                {p}
              </p>
            ))}

            {/* Guiding Principles */}
            <div className="principles-list">
              <div className="principle-item">
                <CheckCircle2 size={18} className="principle-icon" />
                <div>
                  <strong>Algorithmic Integrity:</strong> Prioritizing time-complexity and space-efficiency in data structures before prematurely scaling architecture.
                </div>
              </div>
              <div className="principle-item">
                <CheckCircle2 size={18} className="principle-icon" />
                <div>
                  <strong>Security-First Access:</strong> Enforcing strict RBAC and JWT validation at API boundaries rather than treating authorization as an afterthought.
                </div>
              </div>
              <div className="principle-item">
                <CheckCircle2 size={18} className="principle-icon" />
                <div>
                  <strong>Responsible AI:</strong> Leveraging OCR and ML services as assistive pipelines with mandatory human doctor or administrator oversight.
                </div>
              </div>
            </div>
          </div>

          {/* Academic Snapshot Card */}
          <div className="about-card-col">
            <div className="academic-card">
              <div className="academic-card-header">
                <GraduationCap size={24} className="academic-icon" />
                <div>
                  <h3 className="academic-degree">B.Tech in CSE</h3>
                  <div className="academic-sub">Computer Science & Engineering</div>
                </div>
              </div>

              <div className="academic-details">
                <div className="detail-row">
                  <span className="detail-label">Institution</span>
                  <span className="detail-value">{profileData.institution}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Academic Duration</span>
                  <span className="detail-value">{profileData.period}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Current CGPA</span>
                  <span className="detail-value highlight-value">{profileData.cgpa}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Core Specialization</span>
                  <span className="detail-value">Full-Stack Web & Applied AI Systems</span>
                </div>
              </div>

              <div className="academic-card-footer">
                <span className="status-tag">Undergraduate (2023–2027)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
