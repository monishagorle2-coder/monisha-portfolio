import React, { useState, useRef, useEffect } from 'react';
import { profileData } from '../data/profileData';
import { skillsCategories } from '../data/skillsData';
import { projectsData } from '../data/projectsData';
import { educationData } from '../data/educationData';
import { Terminal as TerminalIcon, CornerDownLeft, Sparkles, XCircle } from 'lucide-react';

export const DeveloperTerminal = () => {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState([]);
  const [outputLogs, setOutputLogs] = useState([
    {
      id: 'init-1',
      type: 'system',
      content: '⚡ Monisha DevOS CLI [Version 2.4.0 — Linux x86_64]'
    },
    {
      id: 'init-2',
      type: 'system',
      content: 'Type "help" or click one of the quick command chips below.'
    }
  ]);

  const outputEndRef = useRef(null);
  const inputRef = useRef(null);
  const terminalBodyRef = useRef(null);
  const isFirstRender = useRef(true);

  // Auto-scroll inside terminal container only on new commands (never scrolls window)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [outputLogs]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const executeCommand = (rawCommand) => {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const newEntry = {
      id: `cmd-${Date.now()}`,
      command: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update command history
    setCommandHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);

    if (lower === 'clear') {
      setOutputLogs([]);
      setInputVal('');
      return;
    }

    let responseContent;

    switch (lower) {
      case 'help':
        responseContent = (
          <div className="term-response term-help">
            <div className="term-line-title">Available Commands:</div>
            <div className="term-help-grid">
              <div><span className="term-cmd">whoami</span> - Developer introduction & background</div>
              <div><span className="term-cmd">skills</span> - Technical competencies and stack</div>
              <div><span className="term-cmd">projects</span> - Genuine verified engineering projects</div>
              <div><span className="term-cmd">education</span> - Academic credentials and certifications</div>
              <div><span className="term-cmd">clear</span> - Clear the terminal output</div>
              <div><span className="term-cmd">help</span> - Display this reference manual</div>
            </div>
          </div>
        );
        break;

      case 'whoami':
        responseContent = (
          <div className="term-response term-whoami">
            <div className="term-line-title">{profileData.name}</div>
            <div className="term-line-sub">{profileData.title}</div>
            <div className="term-text">
              🏛️ <strong>Institution:</strong> {profileData.institution} ({profileData.period})
            </div>
            <div className="term-text">
              📍 <strong>Location:</strong> {profileData.location}
            </div>
            <div className="term-text">
              🎯 <strong>Focus:</strong> Full-Stack Web Architecture, Algorithmic Problem Solving & Applied AI
            </div>
            <div className="term-quote">
              “{profileData.tagline}”
            </div>
          </div>
        );
        break;

      case 'skills':
        responseContent = (
          <div className="term-response term-skills">
            <div className="term-line-title">Technical Skill Inventory:</div>
            {skillsCategories.map(cat => (
              <div key={cat.id} className="term-skill-cat">
                <span className="term-cat-name">{cat.name}:</span>
                <span className="term-cat-items">
                  {cat.skills.map(s => s.name).join(', ')}
                </span>
              </div>
            ))}
          </div>
        );
        break;

      case 'projects':
        responseContent = (
          <div className="term-response term-projects">
            <div className="term-line-title">Featured Projects ({projectsData.length}):</div>
            {projectsData.map((proj, idx) => (
              <div key={proj.id} className="term-project-item">
                <div className="term-proj-header">
                  <span className="term-proj-num">0{idx + 1}.</span>
                  <strong>{proj.title}</strong>
                  <span className="term-proj-cat">({proj.category})</span>
                </div>
                <div className="term-proj-desc">{proj.shortDescription}</div>
                <div className="term-proj-tech">
                  <strong>Stack:</strong> {proj.techStack.slice(0, 6).join(' · ')}
                </div>
                {proj.links?.github && (
                  <div className="term-proj-link">
                    🔗 <a href={proj.links.github} target="_blank" rel="noopener noreferrer">{proj.links.github}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
        break;

      case 'education':
        responseContent = (
          <div className="term-response term-education">
            <div className="term-line-title">Academic Qualifications & Credentials:</div>
            {educationData.degrees.map((deg, idx) => (
              <div key={idx} className="term-edu-item">
                <div className="term-edu-degree">{deg.degree}</div>
                <div className="term-edu-inst">{deg.institution} · {deg.period}</div>
                <div className="term-edu-score">Current CGPA: <strong>{profileData.cgpa || deg.cgpa}</strong></div>
              </div>
            ))}
            {educationData.certifications && (
              <div className="term-cert-section">
                <div className="term-cert-title">Certifications:</div>
                {educationData.certifications.map((cert, cIdx) => (
                  <div key={cIdx} className="term-cert-item">
                    • <strong>{cert.title}</strong> ({cert.issuer}) — {cert.badgeText}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        break;

      default:
        responseContent = (
          <div className="term-response term-error">
            <span>zsh: command not found: <code>{trimmed}</code>. Type <button type="button" className="term-inline-btn" onClick={() => executeCommand('help')}>help</button> for available commands.</span>
          </div>
        );
        break;
    }

    setOutputLogs(prev => [
      ...prev,
      {
        ...newEntry,
        response: responseContent
      }
    ]);

    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(nextIdx);
      setInputVal(commandHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const quickCommands = ['whoami', 'skills', 'projects', 'education', 'help', 'clear'];

  return (
    <div 
      className="dev-terminal-card" 
      onClick={focusInput}
      role="region" 
      aria-label="Interactive Developer Terminal"
    >
      {/* Terminal Title Bar */}
      <div className="dev-terminal-header">
        <div className="term-window-dots" aria-hidden="true">
          <span className="dot dot-crimson"></span>
          <span className="dot dot-amber"></span>
          <span className="dot dot-green"></span>
        </div>
        <div className="term-title">
          <TerminalIcon size={13} className="term-header-icon" aria-hidden="true" />
          <span>monisha@portfolio:~ [bash]</span>
        </div>
        <div className="term-status-pill">
          <span className="term-status-dot" aria-hidden="true"></span>
          <span>ONLINE</span>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="dev-terminal-body" ref={terminalBodyRef} tabIndex={0}>
        {outputLogs.map((item) => (
          <div key={item.id} className="term-log-entry">
            {item.type === 'system' ? (
              <div className="term-system-line">{item.content}</div>
            ) : (
              <>
                <div className="term-prompt-line">
                  <span className="term-prompt-user">monisha@portfolio</span>
                  <span className="term-prompt-sep">:</span>
                  <span className="term-prompt-dir">~</span>
                  <span className="term-prompt-symbol">$</span>
                  <span className="term-executed-cmd">{item.command}</span>
                </div>
                <div className="term-response-wrap">
                  {item.response}
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={outputEndRef} />
      </div>

      {/* Interactive Quick Command Chips */}
      <div className="dev-terminal-chips" aria-label="Quick terminal commands">
        <span className="chips-label">Run:</span>
        {quickCommands.map(cmd => (
          <button
            key={cmd}
            type="button"
            className="term-chip-btn"
            onClick={(e) => {
              e.stopPropagation();
              executeCommand(cmd);
            }}
            title={`Execute ${cmd}`}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Command Input Area */}
      <form 
        className="dev-terminal-input-bar" 
        onSubmit={(e) => {
          e.preventDefault();
          executeCommand(inputVal);
        }}
      >
        <div className="term-prompt-input-prefix">
          <span className="term-prompt-user">monisha@portfolio</span>
          <span className="term-prompt-sep">:</span>
          <span className="term-prompt-dir">~</span>
          <span className="term-prompt-symbol">$</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="term-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type 'help'..."
          aria-label="Terminal command input"
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button 
          type="submit" 
          className="term-submit-btn" 
          aria-label="Execute command"
          title="Run command (Enter)"
        >
          <CornerDownLeft size={13} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};
