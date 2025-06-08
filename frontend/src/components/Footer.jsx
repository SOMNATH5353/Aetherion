import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      name: 'GitHub', 
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ), 
      url: 'https://github.com/somnath1611', 
      color: '#333' 
    },
    { 
      name: 'Instagram', 
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ), 
      url: 'https://instagram.com/somnath1611', 
      color: '#E4405F' 
    },
    { 
      name: 'LinkedIn', 
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ), 
      url: 'https://www.linkedin.com/in/somnath1611', 
      color: '#0077B5' 
    }
  ];

  const handleSocialClick = (e, url) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // If we're not on home page, navigate to home first then scroll
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  return (
    <footer className="footer">
      {/* Cosmic Background Effects */}
      <div className="footer-stars">
        <div className="star star-1">✦</div>
        <div className="star star-2">✧</div>
        <div className="star star-3">⋆</div>
        <div className="star star-4">✦</div>
      </div>

      {/* Footer Content */}
      <div className="footer-content">
        <div className="container">
          
          {/* Main Section */}
          <div className="footer-main">
            
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="brand-container">
                <h3 className="brand-name">
                  AETHERION <span className="brand-symbol">🌌</span>
                </h3>
                <p className="brand-tagline">
                  Exploring the infinite cosmos
                </p>
              </div>
              <p className="brand-description">
                Discover breathtaking astronomical wonders from NASA's collection. 
                Inspiring cosmic curiosity for space enthusiasts worldwide.
              </p>
            </div>

            {/* Home Button */}
            <div className="footer-home">
              <button 
                onClick={handleHomeClick} 
                className="home-button"
                aria-label="Go to top of home page"
              >
                <span className="home-icon">🏠</span>
                <span className="home-text">Home</span>
                <div className="home-glow"></div>
              </button>
            </div>

            {/* Connect Section */}
            <div className="footer-connect">
              <h4 className="footer-section-title">
                <span className="title-icon">🌐</span>
                Connect
              </h4>
              <div className="social-links">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className="social-link"
                    onClick={(e) => handleSocialClick(e, social.url)}
                    style={{ 
                      animationDelay: `${index * 0.15}s`,
                      '--social-color': social.color 
                    }}
                    aria-label={`Visit ${social.name} profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="social-icon">{social.icon}</span>
                    <div className="social-glow"></div>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="footer-bottom">
            <div className="footer-divider">
              <div className="divider-line"></div>
              <div className="divider-stars">
                <span>✦</span>
                <span>✧</span>
                <span>⋆</span>
              </div>
              <div className="divider-line"></div>
            </div>
            
            <div className="footer-bottom-content">
              <div className="copyright">
                <p className="copyright-text">
                  © {currentYear} <span className="brand-highlight">AETHERION</span>. 
                  All rights reserved.
                </p>
                <p className="copyright-subtext">
                  Created by <span className="creator-name">Somnath R</span> with <span className="heart">💙</span> for space enthusiasts
                </p>
              </div>
              
              <div className="footer-extras">
                <div className="nasa-attribution">
                  <span className="attribution-icon">🛰️</span>
                  <span className="attribution-text">
                    Powered by NASA
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Cosmic Elements */}
      <div className="cosmic-elements">
        <div className="cosmic-element element-1">🪐</div>
        <div className="cosmic-element element-2">🌙</div>
        <div className="cosmic-element element-3">⭐</div>
      </div>
    </footer>
  );
};

export default Footer;