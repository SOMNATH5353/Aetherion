import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  // Core APOD state
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // New effect states
  const [titleVisible, setTitleVisible] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Welcome text animation
  const welcomeWords = ['Welcome', 'to', 'the', 'infinite'];
  const brandText = 'AETHERION';

  // Enhanced text cleaning function
  const cleanDescription = useCallback((text) => {
    if (!text) return '';
    
    let cleanedText = text
      // Remove "APOD Turns XX!" patterns
      .replace(/APOD\s+Turns?\s+\d+!?[:\s]*/gi, '')
      // Remove lecture announcements
      .replace(/Free\s+Public\s+Lecture.*?(?:\d{1,2}\s*(?:am|pm)|\d{4})/gi, '')
      // Remove event announcements with dates
      .replace(/(?:on\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
      // Remove standalone dates
      .replace(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
      // Remove city names in event contexts
      .replace(/\bin\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+on\s+/gi, '')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/^[:\s,.-]+|[:\s,.-]+$/g, '')
      .trim();

    // If cleaned text is too short, return original
    if (cleanedText.length < 50 && text.length > 100) {
      return text;
    }

    return cleanedText;
  }, []);

  // Mouse tracking for particle effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced typing animation
  useEffect(() => {
    const startAnimation = () => {
      setTimeout(() => setTitleVisible(true), 500);
      setTimeout(() => setIsTyping(true), 800);
    };

    startAnimation();

    // Typing animation for welcome words
    if (isTyping && currentWordIndex < welcomeWords.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isTyping, currentWordIndex, welcomeWords.length]);

  // Fallback data for offline mode
  const fallbackData = useMemo(() => ({
    title: "Explore the Infinite Cosmos",
    explanation: "Experience the beauty of space while we connect to NASA's servers. The universe awaits your discovery through stunning astronomical imagery and cosmic wonders that span across galaxies, nebulae, and celestial phenomena beyond imagination.",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cdefs%3E%3ClinearGradient id='space' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%230B1426'/%3E%3Cstop offset='25%25' style='stop-color:%231A2747'/%3E%3Cstop offset='50%25' style='stop-color:%232D4A70'/%3E%3Cstop offset='75%25' style='stop-color:%233B82F6'/%3E%3Cstop offset='100%25' style='stop-color:%232563EB'/%3E%3C/linearGradient%3E%3CradialGradient id='glow' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23ffffff' stop-opacity='0.1'/%3E%3Cstop offset='100%25' style='stop-color:%23ffffff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='800' height='400' fill='url(%23space)'/%3E%3Ccircle cx='200' cy='100' r='2' fill='%23ffffff' opacity='0.8'%3E%3Canimate attributeName='opacity' values='0.3;1;0.3' dur='3s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='600' cy='150' r='1.5' fill='%23ffffff' opacity='0.6'%3E%3Canimate attributeName='opacity' values='0.2;0.9;0.2' dur='4s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='400' cy='250' r='1' fill='%23ffffff' opacity='0.7'%3E%3Canimate attributeName='opacity' values='0.4;1;0.4' dur='2.5s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='150' cy='300' r='1.2' fill='%234A90E2' opacity='0.8'%3E%3Canimate attributeName='opacity' values='0.3;0.8;0.3' dur='3.5s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='650' cy='300' r='1.8' fill='%236366F1' opacity='0.6'%3E%3Canimate attributeName='opacity' values='0.2;0.7;0.2' dur='4.2s' repeatCount='indefinite'/%3E%3C/circle%3E%3Cellipse cx='400' cy='200' rx='200' ry='50' fill='url(%23glow)'/%3E%3Ctext x='400' y='210' text-anchor='middle' fill='%23ffffff' font-family='Arial, sans-serif' font-size='28' font-weight='bold' opacity='0.95'%3E%3Ctspan%3E🌌 %3C/tspan%3E%3Ctspan fill='%234A90E2'%3EAETHERION%3C/tspan%3E%3Ctspan%3E 🌌%3C/tspan%3E%3C/text%3E%3C/svg%3E",
    date: new Date().toISOString().split('T')[0],
    media_type: "image",
    copyright: null,
    isFallback: true
  }), []);

  // Generate stars for background animation
  const generateStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 250; i++) {
      stars.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 4 + 0.5,
        animationDelay: Math.random() * 8,
        animationDuration: Math.random() * 4 + 2,
        opacity: Math.random() * 0.9 + 0.1,
        color: ['#ffffff', '#e0e7ff', '#c7d2fe', '#a5b4fc'][Math.floor(Math.random() * 4)]
      });
    }
    return stars;
  }, []);

  // Generate floating particles
  const generateParticles = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 8 + 2,
        animationDelay: Math.random() * 10,
        animationDuration: Math.random() * 20 + 15,
        symbol: ['✦', '✧', '⭐', '✨', '🌟', '💫', '☄️', '🌠'][Math.floor(Math.random() * 8)]
      });
    }
    return particles;
  }, []);

  // APOD fetching
  const fetchAPOD = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Fetching APOD data...');
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      
      const response = await fetch('http://localhost:5000/apod', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch APOD`);
      }
      
      const data = await response.json();
      const loadTime = Date.now() - startTime;
      console.log(`✅ APOD data loaded in ${loadTime}ms:`, data);
      
      if (!data.title || !data.url) {
        throw new Error('Invalid APOD data received');
      }
      
      // Clean the description
      if (data.explanation) {
        const originalExplanation = data.explanation;
        const cleanedExplanation = cleanDescription(data.explanation);
        
        console.log('📝 Description cleaned:', {
          original: originalExplanation.substring(0, 100) + '...',
          cleaned: cleanedExplanation.substring(0, 100) + '...',
          originalLength: originalExplanation.length,
          cleanedLength: cleanedExplanation.length
        });
        
        data.explanation = cleanedExplanation;
      }
      
      setApod(data);
      setError(null);
      setRetryCount(0);
      
    } catch (err) {
      const loadTime = Date.now() - startTime;
      console.error(`❌ Error after ${loadTime}ms:`, err);
      
      let errorMessage = 'Failed to load astronomy picture';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. Using offline mode.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Server offline. Using cached content.';
      } else {
        errorMessage = err.message || 'Connection issue detected.';
      }
      
      setError(errorMessage);
      setApod(fallbackData);
      
    } finally {
      setLoading(false);
    }
  }, [fallbackData, cleanDescription]);

  // Initial load with retry logic
  useEffect(() => {
    const loadAPOD = async () => {
      // Check cache first
      const cached = localStorage.getItem('apod_cache');
      const cacheTime = localStorage.getItem('apod_cache_time');
      const now = Date.now();
      
      if (cached && cacheTime && (now - parseInt(cacheTime)) < 3600000) {
        try {
          const cachedData = JSON.parse(cached);
          console.log('📦 Using cached APOD data');
          
          if (cachedData.explanation) {
            cachedData.explanation = cleanDescription(cachedData.explanation);
          }
          
          setApod(cachedData);
          setLoading(false);
          setImageLoaded(true);
          
          return;
        } catch (e) {
          console.log('❌ Cache corrupted, fetching fresh data');
        }
      }
      
      await fetchAPOD();
    }
    
    loadAPOD();
  }, [fetchAPOD, cleanDescription]);

  // Cache successful APOD data
  useEffect(() => {
    if (apod && !apod.isFallback) {
      localStorage.setItem('apod_cache', JSON.stringify(apod));
      localStorage.setItem('apod_cache_time', Date.now().toString());
    }
  }, [apod]);

  // Image loading handlers
  const handleImageLoad = useCallback(() => {
    console.log('🖼️ Image loaded successfully');
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    console.error('❌ Failed to load APOD image');
    setImageLoaded(true);
  }, []);

  // Enhanced navigation helper
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  // Retry handler
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setImageLoaded(false);
    fetchAPOD();
  }, [fetchAPOD]);

  // Share handler
  const handleShare = useCallback(() => {
    if (navigator.share && apod) {
      navigator.share({
        title: apod.title,
        text: apod.explanation?.substring(0, 100) + '...',
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        alert('🔗 Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('🔗 Link copied to clipboard!');
    }
  }, [apod]);

  // Optimized image preloading
  useEffect(() => {
    if (apod && apod.url && !apod.isFallback) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
      img.src = apod.hdurl || apod.url;
    }
  }, [apod]);

  return (
    <section id="home" className="hero">
      {/* Enhanced Animated Starfield Background */}
      <div className="starfield">
        <div className="stars-layer stars-small">
          {generateStars.slice(0, 120).map((star) => (
            <div
              key={`small-${star.id}`}
              className="star star-small"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`,
                backgroundColor: star.color,
                boxShadow: `0 0 ${star.size * 2}px ${star.color}`
              }}
            />
          ))}
        </div>
        
        <div className="stars-layer stars-medium">
          {generateStars.slice(120, 180).map((star) => (
            <div
              key={`medium-${star.id}`}
              className="star star-medium"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size + 1}px`,
                height: `${star.size + 1}px`,
                opacity: star.opacity * 0.8,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration + 1}s`,
                backgroundColor: star.color,
                boxShadow: `0 0 ${star.size * 3}px ${star.color}`
              }}
            />
          ))}
        </div>
        
        <div className="stars-layer stars-large">
          {generateStars.slice(180, 250).map((star) => (
            <div
              key={`large-${star.id}`}
              className="star star-large"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size + 2}px`,
                height: `${star.size + 2}px`,
                opacity: star.opacity * 0.6,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration + 2}s`,
                backgroundColor: star.color,
                boxShadow: `0 0 ${star.size * 4}px ${star.color}`
              }}
            />
          ))}
        </div>

        {/* Enhanced Shooting Stars */}
        <div className="shooting-stars">
          <div className="shooting-star" style={{ animationDelay: '2s' }}></div>
          <div className="shooting-star" style={{ animationDelay: '7s' }}></div>
          <div className="shooting-star" style={{ animationDelay: '12s' }}></div>
          <div className="shooting-star" style={{ animationDelay: '18s' }}></div>
          <div className="shooting-star" style={{ animationDelay: '25s' }}></div>
        </div>

        {/* Floating Particles */}
        <div className="floating-particles">
          {generateParticles.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              className="floating-particle"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                fontSize: `${particle.size}px`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`
              }}
            >
              {particle.symbol}
            </div>
          ))}
        </div>

        {/* Mouse Trail Effect */}
        <div 
          className="mouse-trail"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`
          }}
        ></div>
      </div>

      <div className="hero-container">
        {/* Enhanced Hero Text Section */}
        <div className="hero-text-section">
          <div className="hero-text">
            <div className={`hero-title-container ${titleVisible ? 'visible' : ''}`}>
              <h1 className="hero-title">
                <div className="welcome-animation">
                  {welcomeWords.map((word, index) => (
                    <span 
                      key={index} 
                      className={`welcome-word ${index < currentWordIndex ? 'visible' : ''}`}
                      style={{ animationDelay: `${index * 0.6}s` }}
                    >
                      {word}
                    </span>
                  ))}
                  <span className="to-text">to</span>
                </div>
                <div className="brand-container">
                  <span className="hero-brand">
                    <span className="brand-glow"></span>
                    AETHERION
                    <span className="brand-particles">
                      <span className="particle">✦</span>
                      <span className="particle">✧</span>
                      <span className="particle">⭐</span>
                    </span>
                  </span>
                </div>
              </h1>
            </div>
            
            <p className="hero-subtitle animate-fade-up">
              <span className="subtitle-highlight">Explore the universe</span>, one spectacular image at a time
            </p>
            
            <p className="hero-description animate-fade-up-delay">
              Discover the cosmos through NASA's daily astronomy pictures, 
              stunning space imagery, and immersive experiences that bring the universe to life.
              <span className="description-accent"> Journey through galaxies, nebulae, and cosmic phenomena.</span>
            </p>
            
            <div className="hero-buttons animate-slide-up">
              <button 
                className="btn-primary"
                onClick={() => scrollToSection('apod-section')}
              >
                <span className="btn-content">
                  <span className="btn-icon">🚀</span>
                  <span className="btn-text">Explore Universe</span>
                </span>
              </button>
              
              <button 
                className="btn-secondary"
                onClick={() => scrollToSection('about')}
              >
                <span className="btn-content">
                  <span className="btn-icon">📖</span>
                  <span className="btn-text">Learn More</span>
                </span>
              </button>
            </div>
            
            {/* Enhanced Connection Status */}
            <div className="connection-status">
              {loading && (
                <div className="status-indicator loading">
                  <span className="status-dot loading-dot"></span>
                  <span className="status-text">
                    {retryCount > 0 ? (
                      <>
                        <span className="retry-icon">🔄</span>
                        Retrying... ({retryCount})
                      </>
                    ) : (
                      <>
                        <span className="loading-icon">🛰️</span>
                        Connecting to NASA...
                      </>
                    )}
                  </span>
                  <div className="loading-wave"></div>
                </div>
              )}
              
              {!loading && !error && apod && !apod.isFallback && (
                <div className="status-indicator connected">
                  <span className="status-dot connected-dot"></span>
                  <span className="status-text">
                    <span className="success-icon">✅</span>
                    Connected to NASA APOD
                  </span>
                </div>
              )}
              
              {!loading && apod && apod.isFallback && (
                <div className="status-indicator offline">
                  <span className="status-dot offline-dot"></span>
                  <span className="status-text">
                    <span className="offline-icon">📱</span>
                    Offline Mode - Cached Content
                  </span>
                </div>
              )}
              
              {error && !apod && (
                <div className="status-indicator error">
                  <span className="status-dot error-dot"></span>
                  <span className="status-text">
                    <span className="error-icon">⚠️</span>
                    Connection Issue
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* APOD Visual Section */}
        <div className="hero-visual-section" id="apod-section">
          <div className="apod-header">
            <h2 className="apod-section-title">
              {loading ? (
                <>
                  <span className="loading-icon-title">🌌</span>
                  Loading Cosmic Wonder...
                </>
              ) : apod?.isFallback ? (
                <>
                  <span className="preview-icon">🎭</span>
                  Cosmic Preview
                </>
              ) : (
                <>
                  <span className="wonder-icon">✨</span>
                  Today's Cosmic Wonder
                </>
              )}
            </h2>
            <div className="title-underline">
              <div className="underline-glow"></div>
            </div>
            {apod && !loading && (
              <p className="apod-date-header">
                {apod.isFallback ? (
                  <>
                    <span className="date-icon">🔄</span>
                    Preview Mode
                  </>
                ) : (
                  <>
                    <span className="date-icon">📅</span>
                    {new Date(apod.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </>
                )}
              </p>
            )}
          </div>

          <div className="hero-visual">
            {loading && !apod && (
              <div className="loading-container">
                <div className="loading-spinner">
                  <div className="spinner orbital"></div>
                  <div className="spinner-center">🌟</div>
                  <div className="orbit-particles">
                    <div className="orbit-particle">✦</div>
                    <div className="orbit-particle">✧</div>
                    <div className="orbit-particle">⭐</div>
                  </div>
                </div>
                <p className="loading-text">
                  <span className="loading-text-main">Fetching cosmic wonder from NASA...</span>
                  <span className="loading-text-sub">Preparing your journey through space</span>
                </p>
                <div className="loading-progress">
                  <div className="progress-bar">
                    <div className="progress-wave"></div>
                  </div>
                </div>
              </div>
            )}

            {error && !apod && (
              <div className="error-container">
                <div className="error-icon">🌌</div>
                <h3 className="error-title">Connection Issue</h3>
                <p className="error-text">{error}</p>
                <div className="error-actions">
                  <button 
                    className="retry-btn"
                    onClick={handleRetry}
                    disabled={loading}
                  >
                    <span className="retry-icon">🔄</span>
                    <span className="retry-text">
                      {loading ? 'Retrying...' : 'Try Again'}
                    </span>
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => scrollToSection('gallery')}
                  >
                    <span>🖼️</span>
                    Browse Gallery Instead
                  </button>
                </div>
              </div>
            )}

            {apod && (
              <div className={`apod-container ${imageLoaded ? 'loaded' : 'loading'} ${apod.isFallback ? 'fallback' : ''}`}>
                <div className="apod-image-wrapper">
                  {apod.media_type === 'image' ? (
                    <>
                      {!imageLoaded && !apod.isFallback && (
                        <div className="image-loading-overlay">
                          <div className="loading-spinner">
                            <div className="spinner small"></div>
                          </div>
                          <p>Loading cosmic image...</p>
                        </div>
                      )}
                      <img 
                        src={apod.hdurl || apod.url} 
                        alt={apod.title} 
                        className="apod-image"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        loading="eager"
                        style={{ 
                          display: (!imageLoaded && !apod.isFallback) ? 'none' : 'block'
                        }}
                      />
                    </>
                  ) : apod.media_type === 'video' ? (
                    <div className="apod-video-container">
                      <iframe 
                        src={apod.url}
                        title={apod.title}
                        className="apod-video"
                        frameBorder="0"
                        allowFullScreen
                        onLoad={handleImageLoad}
                        loading="eager"
                      />
                      <div className="video-overlay">
                        <span className="video-icon">▶️</span>
                        <p>Video Content</p>
                      </div>
                    </div>
                  ) : (
                    <div className="unsupported-media">
                      <span className="media-icon">📄</span>
                      <p>Unsupported media type</p>
                    </div>
                  )}
                  
                  {apod.isFallback && (
                    <div className="fallback-overlay">
                      <div className="fallback-badge">
                        <span>🔄</span>
                        <span>Preview Mode</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="apod-info">
                  <div className="apod-title-section">
                    <h3 className="apod-title">{apod.title}</h3>
                    {apod.copyright && (
                      <p className="apod-copyright">
                        📸 © {apod.copyright}
                      </p>
                    )}
                  </div>
                  
                  {apod.explanation && (
                    <div className="apod-description-container">
                      <p className="apod-description">
                        {apod.explanation}
                      </p>
                    </div>
                  )}
                  
                  <div className="apod-actions">
                    {apod.hdurl && apod.hdurl !== apod.url && !apod.isFallback && (
                      <a 
                        href={apod.hdurl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hd-link"
                      >
                        <span>🔍</span>
                        <span>View HD Version</span>
                      </a>
                    )}
                    
                    <button 
                      className="share-btn"
                      onClick={handleShare}
                    >
                      <span>🔗</span>
                      <span>Share</span>
                    </button>
                    
                    <button 
                      className="refresh-btn"
                      onClick={handleRetry}
                      title="Refresh APOD"
                      disabled={loading}
                    >
                      <span className={loading ? 'spinning' : ''}>🔄</span>
                      <span>{loading ? 'Loading...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Floating Elements */}
        <div className="floating-elements">
          <div className="float-element e1">✦</div>
          <div className="float-element e2">★</div>
          <div className="float-element e3">✧</div>
          <div className="float-element e4">⭐</div>
          <div className="float-element e5">✨</div>
          <div className="float-element e6">🌟</div>
          <div className="float-element e7">🌙</div>
          <div className="float-element e8">🪐</div>
          <div className="float-element e9">☄️</div>
          <div className="float-element e10">🌠</div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-container">
            <div className="scroll-arrow"></div>
            <div className="scroll-pulse"></div>
          </div>
          <span className="scroll-text">
            <span className="scroll-icon">👇</span>
            Scroll to explore more wonders
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;