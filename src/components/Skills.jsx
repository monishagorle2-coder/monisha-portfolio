import React, { useState } from 'react';
import { skillsCategories } from '../data/skillsData';
import { Terminal, Layout, Database, ShieldCheck, Wrench, Layers } from 'lucide-react';

export const Skills = () => {
  const [activeTab, setActiveTab] = useState('all');

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'cs-fundamentals':
        return <Terminal size={18} />;
      case 'frontend':
        return <Layout size={18} />;
      case 'backend':
        return <Database size={18} />;
      case 'security-ai':
        return <ShieldCheck size={18} />;
      case 'tools':
        return <Wrench size={18} />;
      default:
        return <Layers size={18} />;
    }
  };

  const filteredCategories = activeTab === 'all' 
    ? skillsCategories 
    : skillsCategories.filter(cat => cat.id === activeTab);

  return (
    <section id="skills" className="section-padding skills-section" aria-label="Technical Skills Inventory">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <span className="eyebrow">VERIFIED TECHNICAL ARSENAL</span>
          <h2 className="section-title">Technical Skills</h2>
          <p className="section-subtitle">
            Organized across core CS fundamentals, modern web architectures, database persistence, and security awareness.
          </p>
        </div>

        {/* Interactive Category Selector Tabs */}
        <div className="skills-tabs-wrap" role="tablist" aria-label="Skill Categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`skills-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Layers size={16} aria-hidden="true" />
            <span>All Categories ({skillsCategories.reduce((acc, c) => acc + c.skills.length, 0)})</span>
          </button>

          {skillsCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeTab === cat.id}
              className={`skills-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="skills-categories-grid">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="skill-category-card">
              <div className="category-header">
                <div className="category-icon-box">
                  {getCategoryIcon(cat.id)}
                </div>
                <div>
                  <h3 className="category-title">{cat.name}</h3>
                  <p className="category-desc">{cat.description}</p>
                </div>
              </div>

              {/* Skills Chips */}
              <div className="skills-chips-list">
                {cat.skills.map((skill, idx) => (
                  <div key={idx} className="skill-badge-item">
                    <span className="skill-badge-name">{skill.name}</span>
                    <span className="skill-badge-type">{skill.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
