import React, { useState } from 'react';
import { profileData } from '../data/profileData';
import { Mail, Globe, Send, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { API_BASE_URL } from '../config/api';

export const Contact = () => {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState('');

  const handleCopyEmail = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(profileData.links.email)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(() => {
          try {
            const textArea = document.createElement('textarea');
            textArea.value = profileData.links.email;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch (err) {
            console.warn('Clipboard fallback failed', err);
          }
        });
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = profileData.links.email;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.warn('Clipboard fallback failed', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus(null);
    setStatusMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setSubmitStatus('success');
        setStatusMessage(data.message || 'Thank you! Your message has been received and saved.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          setSubmitStatus(null);
          setStatusMessage('');
        }, 7000);
      } else if (res.status === 429) {
        setSubmitStatus('error');
        setStatusMessage(data.message || 'Too many submissions from your connection. Please wait 15 minutes before submitting again.');
      } else {
        setSubmitStatus('error');
        if (data.errors && data.errors.length > 0) {
          setStatusMessage(data.errors.map(err => err.message).join(' · '));
        } else {
          setStatusMessage(data.message || 'Unable to submit your message. Please check the fields and try again.');
        }
      }
    } catch (err) {
      setSubmitStatus('error');
      setStatusMessage('Unable to reach the server. Please verify your connection or try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding contact-section" aria-label="Contact and Social Links">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <span className="eyebrow">COMMUNICATION & CHANNELS</span>
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-subtitle">
            Open for undergraduate engineering internships, collaborative development, and technical inquiries.
          </p>
        </div>

        <div className="contact-grid">
          
          {/* Direct Channels Column */}
          <div className="contact-channels-col">
            <h3 className="contact-col-title">Direct Communication</h3>
            <p className="contact-intro">
              Feel free to reach out directly via email or connect through my verified developer channels.
            </p>

            {/* Email Card with Copy button */}
            <div className="contact-card email-card">
              <div className="contact-card-icon">
                <Mail size={22} />
              </div>
              <div className="contact-card-info">
                <div className="channel-label">Email Address</div>
                <div className="channel-value">{profileData.links.email}</div>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm copy-btn"
                onClick={handleCopyEmail}
                title="Copy email address to clipboard"
              >
                {copied ? <CheckCircle2 size={14} color="#4ade80" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Verified Links Grid */}
            <div className="channels-list">
              
              {/* Portfolio Link */}
              <a 
                href={profileData.links.portfolio} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="channel-link-card"
              >
                <div className="channel-link-icon">
                  <Globe size={20} />
                </div>
                <div className="channel-link-text">
                  <div className="link-platform">Portfolio (Lovable App)</div>
                  <div className="link-handle">{profileData.links.portfolio}</div>
                </div>
                <span className="link-arrow">↗</span>
              </a>

              {/* GitHub Link */}
              <a 
                href={profileData.links.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="channel-link-card"
              >
                <div className="channel-link-icon">
                  <GithubIcon size={20} />
                </div>
                <div className="channel-link-text">
                  <div className="link-platform">GitHub</div>
                  <div className="link-handle">@{profileData.links.githubUsername}</div>
                </div>
                <span className="link-arrow">↗</span>
              </a>

              {/* LinkedIn Link */}
              <a 
                href={profileData.links.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="channel-link-card"
                aria-label="Connect with Gorle Monisha on LinkedIn"
              >
                <div className="channel-link-icon">
                  <LinkedinIcon size={20} />
                </div>
                <div className="channel-link-text">
                  <div className="link-platform">LinkedIn</div>
                  <div className="link-handle">in/monisha-g-672613315</div>
                </div>
                <span className="link-arrow">↗</span>
              </a>

            </div>
          </div>

          {/* Quick Message Form */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <h3 className="contact-col-title">Send a Quick Message</h3>
              
              {submitStatus === 'success' && (
                <div className="form-success-banner" role="status">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="form-error-banner" role="alert">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Your Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      required 
                      disabled={isSubmitting}
                      className="form-input" 
                      placeholder="e.g. Alex Chen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Your Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      required 
                      disabled={isSubmitting}
                      className="form-input" 
                      placeholder="e.g. alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    required 
                    disabled={isSubmitting}
                    className="form-input" 
                    placeholder="e.g. Internship Inquiry / Project Collaboration"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    required 
                    disabled={isSubmitting}
                    className="form-textarea" 
                    placeholder="Write your note or collaboration proposal..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="btn-spinner" aria-hidden="true">⏳</span>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={16} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
