import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Audio narration states
  const [isNarrating, setIsNarrating] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [narrationProgress, setNarrationProgress] = useState(0);
  const audioRef = useRef(null);

  // Function to clean APOD description text
  const cleanDescription = useCallback((text) => {
    if (!text) return '';
    
    // Remove common unwanted patterns
    let cleanedText = text
      // Remove "APOD Turns XX!" patterns
      .replace(/APOD\s+Turns?\s+\d+!?[:\s]*/gi, '')
      // Remove lecture announcements
      .replace(/Free\s+Public\s+Lecture.*?(?:\d{1,2}\s*(?:am|pm)|\d{4})/gi, '')
      // Remove event announcements with dates
      .replace(/(?:on\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
      // Remove standalone dates like "June 11 at 7 pm"
      .replace(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
      // Remove "Anchorage" or other city names in event contexts
      .replace(/\bin\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+on\s+/gi, '')
      // Remove extra whitespace and clean up
      .replace(/\s+/g, ' ')
      .replace(/^[:\s,.-]+|[:\s,.-]+$/g, '')
      .trim();

    // If the text becomes too short or empty after cleaning, return original
    if (cleanedText.length < 50 && text.length > 100) {
      return text;
    }

    return cleanedText;
  }, []);

  // Memoized fallback data to prevent recreation
  const fallbackData = useMemo(() => ({
    title: "Explore the Infinite Cosmos",
    explanation: "Experience the beauty of space while we connect to NASA's servers. The universe awaits your discovery through stunning astronomical imagery and cosmic wonders.",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cdefs%3E%3ClinearGradient id='space' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%230B1426'/%3E%3Cstop offset='50%25' style='stop-color:%231A2747'/%3E%3Cstop offset='100%25' style='stop-color:%232D4A70'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='400' fill='url(%23space)'/%3E%3Ccircle cx='200' cy='100' r='2' fill='%23ffffff' opacity='0.8'/%3E%3Ccircle cx='600' cy='80' r='1.5' fill='%23ffffff' opacity='0.6'/%3E%3Ccircle cx='150' cy='200' r='1' fill='%23ffffff' opacity='0.7'/%3E%3Ccircle cx='700' cy='180' r='2.5' fill='%23ffffff' opacity='0.9'/%3E%3Ccircle cx='300' cy='300' r='1.8' fill='%23ffffff' opacity='0.5'/%3E%3Ccircle cx='500' cy='250' r='1.2' fill='%23ffffff' opacity='0.8'/%3E%3Ctext x='400' y='200' text-anchor='middle' fill='%234A90E2' font-family='Arial' font-size='24' font-weight='bold'%3E🌌 AETHERION 🌌%3C/text%3E%3C/svg%3E",
    date: new Date().toISOString().split('T')[0],
    media_type: "image",
    copyright: null,
    isFallback: true
  }), []);

  // Generate stars for background animation
  const generateStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1,
        animationDelay: Math.random() * 5,
        animationDuration: Math.random() * 3 + 2,
        opacity: Math.random() * 0.8 + 0.2
      });
    }
    return stars;
  }, []);

  const fetchAPOD = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Fetching APOD data...');
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
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
      
      // Clean the description before setting the data
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

  // Enhanced voice narration functionality with proper stop control
  const handleNarration = useCallback(async (speed = 'normal', lang = 'en') => {
    if (!apod || !apod.explanation) {
      setAudioError('No content available for narration');
      return;
    }

    // Stop current narration if playing
    if (isNarrating && audioRef.current) {
      console.log('🛑 Stopping current narration...');
      
      // Properly stop and cleanup audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Revoke the blob URL to free memory
      if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      // Reset states
      setIsNarrating(false);
      setNarrationProgress(0);
      setAudioError(null);
      
      // Clear the audio reference
      audioRef.current = null;
      
      console.log('✅ Narration stopped successfully');
      return;
    }

    try {
      setAudioLoading(true);
      setAudioError(null);
      setNarrationProgress(0);
      
      console.log('🎙️ Generating enhanced voice narration...');
      
      // Create narration URL with parameters
      const narrationUrl = new URL('http://localhost:5000/narrate');
      narrationUrl.searchParams.append('speed', speed);
      narrationUrl.searchParams.append('lang', lang);
      if (apod.date && !apod.isFallback) {
        narrationUrl.searchParams.append('date', apod.date);
      }

      const response = await fetch(narrationUrl, {
        method: 'GET',
        headers: {
          'Accept': 'audio/mpeg'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate narration');
      }

      // Create blob URL for audio
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Clean up previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }

      // Create and configure new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up comprehensive audio event listeners
      audio.addEventListener('loadstart', () => {
        console.log('🎵 Audio loading started');
      });

      audio.addEventListener('canplay', () => {
        console.log('🎵 Audio ready to play');
        setAudioLoading(false);
      });

      audio.addEventListener('loadeddata', () => {
        console.log('🎵 Audio data loaded');
      });

      audio.addEventListener('play', () => {
        setIsNarrating(true);
        setAudioError(null);
        console.log('🎵 Audio playback started');
      });

      audio.addEventListener('pause', () => {
        console.log('🎵 Audio playback paused');
        // Only stop if it's actually ended
        if (audio.currentTime === audio.duration || audio.ended) {
          setIsNarrating(false);
          setNarrationProgress(0);
        }
      });

      audio.addEventListener('ended', () => {
        console.log('🎵 Audio playback ended');
        setIsNarrating(false);
        setNarrationProgress(100);
        
        // Clean up after playback
        setTimeout(() => {
          if (audioRef.current && audioRef.current.src.startsWith('blob:')) {
            URL.revokeObjectURL(audioRef.current.src);
          }
          audioRef.current = null;
          setNarrationProgress(0);
        }, 1000);
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.duration > 0) {
          const progress = (audio.currentTime / audio.duration) * 100;
          setNarrationProgress(progress);
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('🎵 Audio error:', e);
        setAudioError('Playback failed');
        setIsNarrating(false);
        setAudioLoading(false);
        setNarrationProgress(0);
        
        // Clean up on error
        if (audioRef.current && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      });

      // Start playback
      audio.play().catch(error => {
        console.error('🎵 Failed to start playback:', error);
        setAudioError('Failed to start playback');
        setIsNarrating(false);
        setAudioLoading(false);
      });

    } catch (error) {
      console.error('🎵 Narration error:', error);
      setAudioError(error.message || 'Failed to generate narration');
      setIsNarrating(false);
      setAudioLoading(false);
      setNarrationProgress(0);
    }
  }, [apod]);

  // Initial load with retry logic
  useEffect(() => {
    const loadAPOD = async () => {
      const cached = localStorage.getItem('apod_cache');
      const cacheTime = localStorage.getItem('apod_cache_time');
      const now = Date.now();
      
      if (cached && cacheTime && (now - parseInt(cacheTime)) < 3600000) {
        try {
          const cachedData = JSON.parse(cached);
          console.log('📦 Using cached APOD data');
          
          // Clean cached description too
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

  const handleImageLoad = useCallback(() => {
    console.log('🖼️ Image loaded successfully');
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    console.error('❌ Failed to load APOD image');
    setImageLoaded(true);
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setImageLoaded(false);
    fetchAPOD();
  }, [fetchAPOD]);

  const handleShare = useCallback(() => {
    if (navigator.share && apod) {
      navigator.share({
        title: apod.title,
        text: apod.explanation?.substring(0, 100) + '...',
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }
    };
  }, []);

  return (
    <section id="home" className="hero">
      {/* Animated Starfield Background */}
      <div className="starfield">
        <div className="stars-layer stars-small">
          {generateStars.slice(0, 100).map((star) => (
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
                animationDuration: `${star.animationDuration}s`
              }}
            />
          ))}
        </div>
        
        <div className="stars-layer stars-medium">
          {generateStars.slice(100, 150).map((star) => (
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
                animationDuration: `${star.animationDuration + 1}s`
              }}
            />
          ))}
        </div>
        
        <div className="stars-layer stars-large">
          {generateStars.slice(150, 200).map((star) => (
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
                animationDuration: `${star.animationDuration + 2}s`
              }}
            />
          ))}
        </div>

        {/* Shooting Stars */}
        <div className="shooting-stars">
          <div className="shooting-star" style={{ animationDelay: '2s' }}></div>
          <div className="shooting-star" style={{ animationDelay: '7s' }}></div>
          <div className="shooting-star" style={{ animationDelay: '12s' }}></div>
          <div className="shooting-star" style={{ animationDelay: '18s' }}></div>
        </div>
      </div>

      <div className="hero-container">
        {/* Hero Text Section */}
        <div className="hero-text-section">
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
              <button 
                className="btn-primary"
                onClick={() => scrollToSection('apod-section')}
              >
                <span>Explore Universe</span>
                <div className="btn-glow"></div>
              </button>
              <button 
                className="btn-secondary"
                onClick={() => scrollToSection('about')}
              >
                <span>Learn More</span>
              </button>
            </div>
            
            {/* Enhanced Connection Status */}
            <div className="connection-status">
              {loading && (
                <div className="status-indicator loading">
                  <span className="status-dot"></span>
                  <span className="status-text">
                    {retryCount > 0 ? `Retrying... (${retryCount})` : 'Connecting to NASA...'}
                  </span>
                </div>
              )}
              {!loading && !error && apod && !apod.isFallback && (
                <div className="status-indicator connected">
                  <span className="status-dot"></span>
                  <span className="status-text">Connected to NASA APOD</span>
                </div>
              )}
              {!loading && apod && apod.isFallback && (
                <div className="status-indicator offline">
                  <span className="status-dot"></span>
                  <span className="status-text">Offline Mode - Cached Content</span>
                </div>
              )}
              {error && !apod && (
                <div className="status-indicator error">
                  <span className="status-dot"></span>
                  <span className="status-text">Connection Issue</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* APOD Visual Section */}
        <div className="hero-visual-section" id="apod-section">
          <div className="apod-header">
            <h2 className="apod-section-title">
              {loading ? "Loading Cosmic Wonder..." : 
               apod?.isFallback ? "Cosmic Preview" : "Today's Cosmic Wonder"}
            </h2>
            <div className="title-underline"></div>
            {apod && !loading && (
              <p className="apod-date-header">
                {apod.isFallback ? "Preview Mode" : 
                 new Date(apod.date).toLocaleDateString('en-US', {
                   weekday: 'long',
                   year: 'numeric',
                   month: 'long',
                   day: 'numeric'
                 })}
              </p>
            )}
          </div>

          <div className="hero-visual">
            {loading && !apod && (
              <div className="loading-container">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
                <p className="loading-text">Fetching cosmic wonder from NASA...</p>
                <div className="loading-progress">
                  <div className="progress-bar"></div>
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
                    <span>🔄</span>
                    {loading ? 'Retrying...' : 'Try Again'}
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => scrollToSection('gallery')}
                  >
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
                          <p>Loading image...</p>
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
                  <div className="image-overlay"></div>
                  
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
                      
                      {/* Voice Narration Controls */}
                      {!apod.isFallback && (
                        <div className="narration-controls">
                          <button 
                            className={`narration-btn ${isNarrating ? 'playing' : ''}`}
                            onClick={() => handleNarration('normal', 'en')}
                            disabled={audioLoading}
                            title={isNarrating ? 'Stop narration' : 'Listen to narration'}
                          >
                            {audioLoading ? (
                              <>
                                <span className="spinner small"></span>
                                <span>Loading...</span>
                              </>
                            ) : isNarrating ? (
                              <>
                                <span>🔊</span>
                                <span>Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <span>🎧</span>
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                          
                          {(isNarrating || narrationProgress > 0) && (
                            <div className="narration-progress">
                              <div 
                                className="progress-fill"
                                style={{ width: `${narrationProgress}%` }}
                              ></div>
                            </div>
                          )}
                          
                          {audioError && (
                            <div className="audio-error">
                              <span>⚠️</span>
                              <span>{audioError}</span>
                            </div>
                          )}
                        </div>
                      )}
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
                        View HD Version
                      </a>
                    )}
                    <button 
                      className="share-btn"
                      onClick={handleShare}
                    >
                      <span>🔗</span>
                      Share
                    </button>
                    <button 
                      className="refresh-btn"
                      onClick={handleRetry}
                      title="Refresh APOD"
                      disabled={loading}
                    >
                      <span className={loading ? 'spinning' : ''}>🔄</span>
                      {loading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Optimized Floating Elements */}
        <div className="floating-elements">
          <div className="float-element e1">✦</div>
          <div className="float-element e2">★</div>
          <div className="float-element e3">✧</div>
          <div className="float-element e4">⭐</div>
          <div className="float-element e5">✨</div>
          <div className="float-element e6">🌟</div>
          <div className="float-element e7">🌙</div>
          <div className="float-element e8">🪐</div>
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