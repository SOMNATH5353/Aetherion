import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo" onClick={() => scrollToSection('home')}>
          <div className="logo-effects">
            <div className="logo-energy-field"></div>
            <div className="logo-particles">
              <span className="particle p1">✦</span>
              <span className="particle p2">★</span>
              <span className="particle p3">✧</span>
              <span className="particle p4">✨</span>
            </div>
          </div>
          <span className="logo-icon">🚀</span>
          <span className="logo-text">AETHERION</span>
        </div>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li>
            <a href="#home" className="nav-link" onClick={() => scrollToSection('home')}>
              <span className="link-text">Home</span>
              <div className="spacecraft-trail">
                <span className="spacecraft">🛸</span>
              </div>
            </a>
          </li>
          <li>
            <a href="#gallery" className="nav-link" onClick={() => scrollToSection('gallery')}>
              <span className="link-text">Gallery</span>
              <div className="spacecraft-trail">
                <span className="spacecraft">🛸</span>
              </div>
            </a>
          </li>
          <li>
            <a href="#about" className="nav-link" onClick={() => scrollToSection('about')}>
              <span className="link-text">About</span>
              <div className="spacecraft-trail">
                <span className="spacecraft">🛸</span>
              </div>
            </a>
          </li>
          <li>
            <a href="#contact" className="nav-link" onClick={() => scrollToSection('contact')}>
              <span className="link-text">Contact</span>
              <div className="spacecraft-trail">
                <span className="spacecraft">🛸</span>
              </div>
            </a>
          </li>
        </ul>

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