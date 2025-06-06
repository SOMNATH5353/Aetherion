import React, { useEffect, useState } from 'react';
import './Hero.css';

const Hero = () => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/apod');
        if (!response.ok) {
          throw new Error('Failed to fetch APOD');
        }
        const data = await response.json();
        setApod(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching APOD:', err);
        setError('Failed to load astronomy picture');
      } finally {
        setLoading(false);
      }
    };

    fetchAPOD();
  }, []);

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to 
              <span className="hero-brand"> AETHERION</span>
            </h1>
            <p className="hero-subtitle">
              Explore the universe, one spectacular image at a time
            </p>
            <p className="hero-description">
              Discover the cosmos through NASA's daily astronomy pictures, 
              stunning space imagery, and the infinite wonders that await beyond our world.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">
                <span>Explore Universe</span>
                <div className="btn-glow"></div>
              </button>
              <button className="btn-secondary">
                <span>Learn More</span>
              </button>
            </div>
          </div>

          <div className="hero-visual">
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading cosmic wonder...</p>
              </div>
            )}

            {error && (
              <div className="error-container">
                <div className="error-icon">🌌</div>
                <p className="error-text">{error}</p>
                <button 
                  className="retry-btn"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            )}

            {apod && !loading && !error && (
              <div className="apod-container">
                <div className="apod-image-wrapper">
                  <img 
                    src={apod.url} 
                    alt={apod.title} 
                    className="apod-image"
                    loading="lazy"
                  />
                  <div className="image-overlay"></div>
                </div>
                <div className="apod-info">
                  <h3 className="apod-title">{apod.title}</h3>
                  <p className="apod-date">
                    {new Date(apod.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {apod.explanation && (
                    <p className="apod-description">
                      {apod.explanation.substring(0, 150)}...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="float-element e1">✦</div>
          <div className="float-element e2">★</div>
          <div className="float-element e3">✧</div>
          <div className="float-element e4">⭐</div>
          <div className="float-element e5">✨</div>
          <div className="float-element e6">🌟</div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
          <span className="scroll-text">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;