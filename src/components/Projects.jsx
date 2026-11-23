import React, { useState, useEffect, useCallback } from 'react';
import { projectsData as fallbackProjects } from '../data/projectsData';
import { ProjectModal } from './ProjectModal';
import { ArrowUpRight, FolderGit2, AlertCircle, Layers, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`);
      
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const json = await response.json();

      if (json.status === 'success' && Array.isArray(json.data)) {
        setProjects(json.data);
      } else {
        throw new Error(json.message || 'Unexpected response format from projects API');
      }
    } catch (err) {
      console.warn('Projects API request failed:', err.message);
      setError(err.message || 'Unable to connect to the projects service');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <section id="projects" className="section-padding projects-section" aria-label="Featured Software Projects">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <span className="eyebrow">VERIFIED ENGINEERING SHOWCASE</span>
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            Authentic full-stack systems engineered with relational data modeling, access control, and assistive integrations.
          </p>
        </div>

        {/* Error State Banner with Retry Option */}
        {error && (
          <div className="projects-error-banner" role="alert">
            <div className="projects-error-main">
              <div className="projects-error-icon">
                <AlertCircle size={22} aria-hidden="true" />
              </div>
              <div>
                <h3 className="projects-error-title">Unable to Load Projects from Database</h3>
                <p className="projects-error-text">
                  {error}. Please check your connection or retry fetching from the server.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm projects-retry-btn"
              onClick={fetchProjects}
              aria-label="Retry loading projects"
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton State */}
        {isLoading && (
          <div className="projects-grid" aria-label="Loading projects" aria-busy="true">
            {[1, 2].map((idx) => (
              <article key={idx} className="project-card project-card-skeleton">
                <div className="project-card-top">
                  <div className="skeleton-shimmer skeleton-badge" />
                  <div className="skeleton-shimmer skeleton-title" />
                  <div className="skeleton-shimmer skeleton-sub" />
                </div>
                <div className="skeleton-shimmer skeleton-preview" />
                <div className="project-card-body">
                  <div className="skeleton-shimmer skeleton-desc" />
                  <div className="skeleton-shimmer skeleton-chips" />
                </div>
                <div className="project-card-footer">
                  <div className="skeleton-shimmer skeleton-btn" />
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State Banner */}
        {!isLoading && !error && projects.length === 0 && (
          <div className="projects-empty-banner">
            <FolderGit2 size={36} aria-hidden="true" />
            <h3 className="projects-error-title">No Projects Found</h3>
            <p className="projects-empty-text">No active project records were found in the database repository.</p>
          </div>
        )}

        {/* Project Cards Grid (Populated from API) */}
        {!isLoading && projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((project, index) => (
              <article key={project.id} className="project-card">
                
                {/* Card Header */}
                <div className="project-card-top">
                  <div className="project-index-badge">
                    <span>PROJECT 0{index + 1}</span>
                    <span className="dot-separator">·</span>
                    <span className="project-category-label">{project.category}</span>
                  </div>
                  
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-sub">{project.subtitle}</p>
                </div>

                {/* Visual Preview Banner if available */}
                {(project.architectureImage || project.image) && (
                  <div 
                    className="project-card-media-preview" 
                    onClick={() => setSelectedProject(project)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(project)}
                    aria-label={`Open case study for ${project.title}`}
                  >
                    <img 
                      src={project.architectureImage || project.image} 
                      alt={`${project.title} Architecture Preview`} 
                      className="project-preview-thumb" 
                      loading="lazy" 
                    />
                    <div className="project-media-badge">
                      <Layers size={12} aria-hidden="true" />
                      <span>Multi-Portal Architecture</span>
                    </div>
                  </div>
                )}

                {/* Sample Items Preview if available */}
                {project.sampleItems && Array.isArray(project.sampleItems) && (
                  <div 
                    className="project-card-sample-preview" 
                    onClick={() => setSelectedProject(project)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(project)}
                    aria-label={`Open case study for ${project.title}`}
                  >
                    {project.sampleItems.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="project-sample-chip">
                        <img src={item.img} alt={item.name} className="sample-mini-thumb" />
                        <div className="sample-mini-details">
                          <span className="sample-mini-name">{item.name}</span>
                          <span className="sample-mini-batch">{item.batch}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Body */}
                <div className="project-card-body">
                  <p className="project-summary">{project.shortDescription}</p>

                  {/* Badges */}
                  {project.badges && Array.isArray(project.badges) && (
                    <div className="project-badges-row">
                      {project.badges.map((b, i) => (
                        <span key={i} className="project-badge-pill">{b}</span>
                      ))}
                    </div>
                  )}

                  {/* Tech Stack List */}
                  {project.techStack && Array.isArray(project.techStack) && (
                    <div className="project-tech-strip">
                      {project.techStack.slice(0, 6).map((tech, i) => (
                        <span key={i} className="tech-chip">{tech}</span>
                      ))}
                      {project.techStack.length > 6 && (
                        <span className="tech-chip more-chip">+{project.techStack.length - 6} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer / Action */}
                <div className="project-card-footer">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm btn-case-study"
                    onClick={() => setSelectedProject(project)}
                    aria-haspopup="dialog"
                  >
                    <span>Explore Case Study</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </button>

                  <span className="project-repo-indicator">
                    <FolderGit2 size={13} aria-hidden="true" />
                    <span>Verified Profile</span>
                  </span>
                </div>

              </article>
            ))}
          </div>
        )}

        {/* Note on Genuine Projects */}
        <div className="projects-disclaimer-box">
          <AlertCircle size={16} className="disclaimer-icon" aria-hidden="true" />
          <span>
            Projects are represented accurately as actively evolving software applications built with modern engineering workflows.
          </span>
        </div>

      </div>

      {/* Case Study Modal */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </section>
  );
};
