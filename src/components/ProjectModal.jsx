import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, CheckCircle2, ShieldAlert, Cpu, Server, Database, Layers, ArrowRight, Package, Clock } from 'lucide-react';
import { GithubIcon } from './Icons';

export const ProjectModal = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!project) return null;

  return createPortal(
    <div className="modal-backdrop active" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-case-study-title">
      <div className="modal-panel project-modal-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span className="font-mono text-xs category-tag-accent">{project.category}</span>
            <h2 id="modal-case-study-title" className="modal-title project-modal-title">
              {project.title}
            </h2>
            <p className="project-modal-sub">{project.subtitle}</p>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close Project Case Study Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Case Study Content */}
        <div className="modal-body case-study-body">
          
          {/* Tech Stack Chips */}
          <div className="case-study-tech-group">
            <span className="font-mono text-xs" style={{ color: 'var(--color-cream)', marginRight: 'var(--space-1)' }}>
              TECHNOLOGIES:
            </span>
            {project.techStack.map((tech, idx) => (
              <span key={idx} className="tech-chip">{tech}</span>
            ))}
          </div>

          {/* Links & Repository Status */}
          <div className="case-study-links-bar">
            <a 
              href={project.links.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <GithubIcon size={14} />
              <span>GitHub Profile</span>
            </a>
            <span className="status-note-pill">
              📁 {project.links.repoStatus}
            </span>
            <span className="status-note-pill">
              🚀 {project.links.demoStatus}
            </span>
          </div>

          {/* Problem & Solution Grid */}
          <div className="case-study-grid">
            <div className="case-study-card problem-card">
              <h3 className="case-study-heading">
                <span className="heading-icon">⚠️</span>
                <span>The Problem</span>
              </h3>
              <p>{project.caseStudy.problem}</p>
            </div>

            <div className="case-study-card solution-card">
              <h3 className="case-study-heading">
                <span className="heading-icon">💡</span>
                <span>The Engineering Solution</span>
              </h3>
              <p>{project.caseStudy.solution}</p>
            </div>
          </div>

          {/* Architecture Section */}
          <div className="case-study-section">
            <h3 className="case-study-heading">
              <Server size={18} className="heading-icon" />
              <span>System Architecture & Technical Design</span>
            </h3>
            <p className="architecture-text">{project.caseStudy.architecture}</p>

            {/* Architecture Diagram Image if available */}
            {project.architectureImage && (
              <div className="architecture-diagram-wrapper">
                <div className="diagram-frame">
                  <img 
                    src={project.architectureImage} 
                    alt={`Architecture and flow diagram for ${project.title}`}
                    className="architecture-img"
                    loading="lazy"
                  />
                </div>
                {project.architectureImageCaption && (
                  <div className="diagram-caption">
                    <span className="caption-tag">ARCHITECTURE DIAGRAM:</span>
                    <span>{project.architectureImageCaption}</span>
                  </div>
                )}
              </div>
            )}

            {/* Technical Flow Steps if available */}
            {project.caseStudy.technicalFlow && (
              <div className="technical-flow-wrap">
                <div className="flow-title">Transactional Workflow Pipeline:</div>
                <div className="flow-steps-grid">
                  {project.caseStudy.technicalFlow.map((step, idx) => (
                    <div key={idx} className="flow-step-card">
                      <div className="flow-step-num">{step.step}</div>
                      <div className="flow-step-name">{step.name}</div>
                      <div className="flow-step-desc">{step.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Inventory Items if available */}
            {project.sampleItems && (
              <div className="sample-items-wrap">
                <div className="flow-title">Sample Batch & Stock Tracking Inventory:</div>
                <div className="sample-items-grid">
                  {project.sampleItems.map((item, idx) => (
                    <div key={idx} className="sample-item-card">
                      <img src={item.img} alt={item.name} className="sample-item-thumb" />
                      <div className="sample-item-info">
                        <div className="sample-item-name">{item.name}</div>
                        <div className="sample-item-batch">{item.batch}</div>
                        <div className="sample-item-status">{item.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Implementation Highlights */}
          <div className="case-study-section">
            <h3 className="case-study-heading">
              <Layers size={18} className="heading-icon" />
              <span>Key Implementation Details</span>
            </h3>
            <div className="implementation-cards-list">
              {project.caseStudy.keyImplementations.map((item, idx) => (
                <div key={idx} className="implementation-item">
                  <div className="implementation-title-row">
                    <CheckCircle2 size={16} className="item-icon" />
                    <h4 className="implementation-title">{item.title}</h4>
                  </div>
                  <p className="implementation-detail">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Implementation Audit Matrix if available */}
          {project.auditMatrix && (
            <div className="case-study-section audit-matrix-section">
              <h3 className="case-study-heading">
                <CheckCircle2 size={18} className="heading-icon" />
                <span>Feature Implementation Audit (Verified vs. Roadmap)</span>
              </h3>
              <p className="audit-section-intro">
                Rigorous code and schema audit distinguishing verified working features from planned architectural expansions:
              </p>
              <div className="audit-matrix-grid">
                
                {/* Verified Features Column */}
                <div className="audit-col verified-col">
                  <div className="audit-col-header">
                    <span className="badge-tag verified-badge">
                      <CheckCircle2 size={13} />
                      <span>VERIFIED IN CODEBASE</span>
                    </span>
                  </div>
                  <ul className="audit-items-list">
                    {project.auditMatrix.implemented.map((item, idx) => (
                      <li key={idx} className="audit-list-item verified">
                        <strong className="audit-item-title">{item.feature}</strong>
                        <span className="audit-item-desc">{item.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Planned Roadmap Column */}
                <div className="audit-col planned-col">
                  <div className="audit-col-header">
                    <span className="badge-tag planned-badge">
                      <Clock size={13} />
                      <span>PLANNED ROADMAP</span>
                    </span>
                  </div>
                  <ul className="audit-items-list">
                    {project.auditMatrix.planned.map((item, idx) => (
                      <li key={idx} className="audit-list-item planned">
                        <strong className="audit-item-title">{item.feature}</strong>
                        <span className="audit-item-desc">{item.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* Specific Safety / Domain Safeguard Banner */}
          {project.id === 'mediassist-v2' && (
            <div className="safeguard-banner">
              <ShieldAlert size={20} className="safeguard-icon" />
              <div>
                <strong>Clinical Safety Protocol:</strong> MediAssist V2 enforces a strict human-in-the-loop requirement. The OCR and AI microservices serve solely for structured data parsing and operational assistance. All diagnostic evaluations, prescriptions, and patient decisions require review and authorization by licensed human doctors. The system never provides autonomous diagnoses.
              </div>
            </div>
          )}

          {project.id === 'inventory-wholesale' && (
            <div className="safeguard-banner info-banner">
              <CheckCircle2 size={20} className="safeguard-icon" />
              <div>
                <strong>Active Development:</strong> Represented accurately as an evolving software project built for dry-fruits and pickles wholesale operations, showcasing relational schema design and automated stock alert mechanisms.
              </div>
            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
};
