import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-text">
            AETHERION
            <div className="logo-effects">
              <div className="logo-particles">
                <span className="particle p1">✦</span>
                <span className="particle p2">★</span>
                <span className="particle p3">✧</span>
                <span className="particle p4">⭐</span>
              </div>
              <div className="logo-energy-field"></div>
            </div>
          </span>
          <div className="logo-icon">🚀</div>
        </div>
        
        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <a href="#home" className="nav-link" onClick={closeMenu}>
            <span className="link-text">Home</span>
            <div className="spacecraft-trail">
              <span className="spacecraft">🛸</span>
            </div>
          </a>
          <a href="#gallery" className="nav-link" onClick={closeMenu}>
            <span className="link-text">Gallery</span>
            <div className="spacecraft-trail">
              <span className="spacecraft">🚀</span>
            </div>
          </a>
          <a href="#about" className="nav-link" onClick={closeMenu}>
            <span className="link-text">About</span>
            <div className="spacecraft-trail">
              <span className="spacecraft">🛰️</span>
            </div>
          </a>
          <a href="#contact" className="nav-link" onClick={closeMenu}>
            <span className="link-text">Contact</span>
            <div className="spacecraft-trail">
              <span className="spacecraft">🌌</span>
            </div>
          </a>
        </div>

        <div className={`nav-toggle ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;