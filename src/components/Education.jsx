import React from 'react';
import { educationData } from '../data/educationData';
import { GraduationCap, Award, Calendar, MapPin } from 'lucide-react';

export const Education = () => {
  return (
    <section id="education" className="section-padding education-section" aria-label="Education and Certifications">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <span className="eyebrow">ACADEMIC STANDING & CREDENTIALS</span>
          <h2 className="section-title">Education & Certifications</h2>
          <p className="section-subtitle">
            Formal undergraduate computer science training and recognized industry certifications.
          </p>
        </div>

        <div className="education-grid">
          
          {/* Education Column: B.Tech Degree */}
          <div className="edu-col">
            <h3 className="sub-column-title">
              <GraduationCap size={20} className="title-icon" aria-hidden="true" />
              <span>Formal Education</span>
            </h3>

            {educationData.degrees.map((edu, idx) => (
              <div 
                key={idx} 
                className="edu-card interactive" 
                tabIndex={0}
                role="article"
                aria-label={`Formal Education: ${edu.degree} at ${edu.institution}`}
              >
                <div className="edu-card-top">
                  <div>
                    <span className="edu-status-pill">{edu.status}</span>
                    <h4 className="edu-degree-title">{edu.degree}</h4>
                    <div className="edu-institution-row">
                      <MapPin size={14} className="row-icon" aria-hidden="true" />
                      <span>{edu.institution}</span>
                    </div>
                  </div>
                  <div className="edu-cgpa-box">
                    <div className="cgpa-number">{edu.cgpa}</div>
                    <div className="cgpa-label">CGPA</div>
                  </div>
                </div>

                <div className="edu-period-row">
                  <Calendar size={14} className="row-icon" aria-hidden="true" />
                  <span>Academic Period: {edu.period}</span>
                </div>

                <p className="edu-desc">{edu.description || edu.desc}</p>

                <div className="edu-subjects-wrap">
                  <div className="subjects-heading">Core Coursework:</div>
                  <div className="subjects-list">
                    {edu.coreSubjects.map((sub, sIdx) => (
                      <span key={sIdx} className="tech-chip">{sub}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications Column */}
          <div className="cert-col">
            <h3 className="sub-column-title">
              <Award size={20} className="title-icon" aria-hidden="true" />
              <span>Industry Certifications</span>
            </h3>

            <div className="certs-list">
              {educationData.certifications.map((cert, idx) => (
                <div 
                  key={idx} 
                  className="cert-card interactive" 
                  tabIndex={0}
                  role="article"
                  aria-label={`Certification: ${cert.title} issued by ${cert.issuer}`}
                >
                  <div className="cert-header">
                    <span className="cert-badge">{cert.badgeText}</span>
                    <h4 className="cert-title">{cert.title}</h4>
                    <div className="cert-issuer">
                      <span>Issued by <strong>{cert.issuer}</strong></span>
                    </div>
                  </div>

                  <p className="cert-description">{cert.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
