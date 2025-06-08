import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Enhanced AETHERION Logo */}
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <div className="logo-effects">
            <div className="logo-energy-field"></div>
            <div className="logo-particles">
              <span className="particle p1">✦</span>
              <span className="particle p2">✧</span>
              <span className="particle p3">✦</span>
              <span className="particle p4">✧</span>
            </div>
          </div>
          <span className="logo-icon">🚀</span>
          <span className="logo-text">AETHERION</span>
        </Link>

        {/* Navigation Menu */}
        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>
              <span className="link-text">Home</span>
              <div className="spacecraft-trail">
                <span className="spacecraft">🛸</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/about" className="nav-link" onClick={closeMobileMenu}>
              <span className="link-text">About</span>
              <div className="spacecraft-trail">
                <span className="spacecraft">🛸</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/gallery" className="nav-link" onClick={closeMobileMenu}>
              <span className="link-text">Gallery</span>
              <div className="spacecraft-trail">
                <span className="spacecraft">🛸</span>
              </div>
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Toggle */}
        <div 
          className={`nav-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;