import React, { useState, useEffect } from 'react';
import './About.css';

const About = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({
    imagesCurated: 1,
    totalVisitors: 0,
    galaxiesExplored: 50,
    lightYearsCovered: 1000000
  });
  const [apodData, setApodData] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [visitorStats, setVisitorStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    isNewVisitor: false
  });

  // Skills data
  const skills = [
    { name: 'React.js', level: 95, icon: '⚛️' },
    { name: 'JavaScript/ES6+', level: 92, icon: '🚀' },
    { name: 'CSS3 & Animation', level: 90, icon: '🎨' },
    { name: 'NASA APIs', level: 88, icon: '🛰️' },
    { name: 'Python/Flask', level: 85, icon: '🐍' },
    { name: 'UI/UX Design', level: 83, icon: '💫' },
    { name: 'Space Science', level: 80, icon: '🌌' },
    { name: 'Data Visualization', level: 75, icon: '📊' }
  ];

  // Timeline/missions data
  const missions = [
    {
      year: '2025',
      title: 'AETHERION Launch',
      description: 'Official launch of AETHERION with daily APOD features, voice narration, and immersive space exploration.',
      status: 'Active'
    },
    {
      year: '2025',
      title: 'Enhanced Analytics',
      description: 'Implementation of real-time visitor tracking, comprehensive analytics dashboard, and engagement metrics.',
      status: 'Active'
    },
    {
      year: '2025',
      title: 'Community Features',
      description: 'Adding user favorites, sharing capabilities, and community-driven content exploration.',
      status: 'Ongoing'
    },
    {
      year: '2025',
      title: 'AI Integration',
      description: 'Advanced AI-powered content recommendations and intelligent space fact generation.',
      status: 'Coming Soon'
    },
    {
      year: '2026',
      title: 'Mobile App',
      description: 'Native mobile applications for iOS and Android with offline APOD viewing and AR features.',
      status: 'Coming Soon'
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
    initializeVisitorTracking();
    calculateRealTimeStats();
    fetchLatestAPOD();
  }, []);

  // Initialize visitor tracking
  const initializeVisitorTracking = async () => {
    try {
      const visitorId = getOrCreateVisitorId();
      const sessionId = generateSessionId();
      
      // Enhanced visitor data collection
      const visitorData = {
        visitor_id: visitorId,
        session_id: sessionId,
        page_path: '/about',
        referrer: document.referrer,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        color_depth: screen.colorDepth,
        device_memory: navigator.deviceMemory || 'unknown',
        connection_type: getConnectionType(),
        user_agent: navigator.userAgent
      };

      // Track the visit
      const response = await fetch('http://localhost:5000/analytics/track/enhanced-page-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Visitor-ID': visitorId,
          'X-Session-ID': sessionId
        },
        body: JSON.stringify(visitorData)
      });

      if (response.ok) {
        const trackingResult = await response.json();
        console.log('✅ Visitor tracking initialized:', trackingResult);
        
        // Update visitor stats from response
        setVisitorStats(prev => ({
          ...prev,
          total: trackingResult.totalVisitors || 0,
          isNewVisitor: trackingResult.isNewVisitor || false
        }));
      }
    } catch (error) {
      console.error('❌ Error initializing visitor tracking:', error);
    }
  };

  const getOrCreateVisitorId = () => {
    let visitorId = localStorage.getItem('aetherion_visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('aetherion_visitor_id', visitorId);
    }
    return visitorId;
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getConnectionType = () => {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  };

  // Fetch real-time cumulative statistics
  const calculateRealTimeStats = async () => {
    try {
      // Get cumulative stats from backend
      const response = await fetch('http://localhost:5000/analytics/cumulative-stats');
      if (response.ok) {
        const cumulativeData = await response.json();
        
        console.log('📊 Fetched cumulative stats:', cumulativeData);
        
        // Use real cumulative data
        setStats({
          imagesCurated: cumulativeData.cumulative.daysSinceLaunch || 1,
          totalVisitors: cumulativeData.cumulative.totalUniqueVisitors || 0,
          galaxiesExplored: Math.min(50 + Math.floor((cumulativeData.cumulative.totalUniqueVisitors || 0) / 20), 200),
          lightYearsCovered: Math.min(1000000 + ((cumulativeData.cumulative.totalPageViews || 0) * 1000), 50000000)
        });

        // Update visitor stats
        setVisitorStats(prev => ({
          ...prev,
          total: cumulativeData.cumulative.totalUniqueVisitors || 0,
          today: cumulativeData.recent24h.visitors || 0,
          thisWeek: Math.round((cumulativeData.averages.visitorsPerDay || 0) * 7)
        }));

        // Store in localStorage for offline use
        localStorage.setItem('aetherionRealStats', JSON.stringify({
          ...cumulativeData,
          lastUpdated: new Date().toISOString()
        }));
      } else {
        throw new Error('Failed to fetch real stats');
      }
    } catch (error) {
      console.error('❌ Error fetching real stats, using fallback:', error);
      
      // Fallback to stored data or calculated stats
      const storedStats = localStorage.getItem('aetherionRealStats');
      if (storedStats) {
        try {
          const parsed = JSON.parse(storedStats);
          setStats({
            imagesCurated: parsed.cumulative?.daysSinceLaunch || 1,
            totalVisitors: parsed.cumulative?.totalUniqueVisitors || 0,
            galaxiesExplored: 50 + Math.floor((parsed.cumulative?.totalUniqueVisitors || 0) / 20),
            lightYearsCovered: 1000000 + ((parsed.cumulative?.totalPageViews || 0) * 1000)
          });
        } catch (parseError) {
          console.error('Error parsing stored stats:', parseError);
          useFallbackStats();
        }
      } else {
        useFallbackStats();
      }
    }
  };

  const useFallbackStats = () => {
    // Fallback to calculated stats based on project timeline
    const projectStartDate = new Date('2025-06-08');
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - projectStartDate) / (1000 * 60 * 60 * 24)) + 1;
    
    setStats({
      imagesCurated: Math.max(daysDifference, 1),
      totalVisitors: Math.max(Math.floor(daysDifference * 15.7), 1), // Estimated growth
      galaxiesExplored: 50,
      lightYearsCovered: 1000000
    });
  };

  // Fetch latest APOD data for preview
  const fetchLatestAPOD = async () => {
    try {
      setImageLoading(true);
      const response = await fetch('http://localhost:5000/apod');
      if (response.ok) {
        const data = await response.json();
        setApodData(data);
        setImageError(false);
      } else {
        throw new Error('Failed to fetch APOD');
      }
    } catch (error) {
      console.error('Error fetching APOD:', error);
      setImageError(true);
      // Fallback APOD data
      setApodData({
        title: "Cosmic Discovery Awaits",
        date: new Date().toISOString().split('T')[0],
        explanation: "Experience the latest astronomical discoveries through NASA's daily featured content. Each day brings new wonders from across the universe.",
        url: null,
        media_type: 'image'
      });
    } finally {
      setImageLoading(false);
    }
  };

  // Track APOD interaction
  const trackAPODInteraction = async (action) => {
    try {
      const visitorId = localStorage.getItem('aetherion_visitor_id');
      const sessionId = generateSessionId();
      
      await fetch('http://localhost:5000/analytics/track/apod-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Visitor-ID': visitorId,
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          session_id: sessionId,
          action: action,
          apod_date: apodData?.date || new Date().toISOString().split('T')[0],
          additional_data: {
            title: apodData?.title,
            page: 'about',
            timestamp: Date.now()
          }
        })
      });
    } catch (error) {
      console.error('Error tracking APOD interaction:', error);
    }
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <main className={`about-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">
              Meet the Developer Behind <span className="brand-highlight">AETHERION</span>
            </h1>
            <p className="about-hero-subtitle">
              A passionate space enthusiast and developer bringing the cosmos closer to you
            </p>
            <div className="hero-decorative-line"></div>
          </div>
          
          <div className="floating-elements">
            <div className="float-element e1">🌟</div>
            <div className="float-element e2">🚀</div>
            <div className="float-element e3">🛸</div>
            <div className="float-element e4">⭐</div>
            <div className="float-element e5">🌙</div>
            <div className="float-element e6">☄️</div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="developer-section">
        <div className="container">
          <div className="developer-content">
            <div className="developer-image">
              <div className="avatar-container">
                <div className="avatar">👨‍💻</div>
                <div className="avatar-glow"></div>
                <div className="orbit-ring ring-1"></div>
                <div className="orbit-ring ring-2"></div>
                <div className="orbit-ring ring-3"></div>
              </div>
            </div>
            
            <div className="developer-info">
              <h2 className="section-title">Solo Mission</h2>
              <p className="developer-intro">
                Hi! I'm the sole developer behind AETHERION, combining my passion for space exploration 
                with modern web development to create an immersive cosmic experience.
              </p>
              
              <div className="mission-statement">
                <h3>My Mission</h3>
                <p>
                  To make the wonders of space accessible to everyone through beautiful, 
                  interactive web experiences powered by real NASA data. Every line of code 
                  is crafted with care to inspire curiosity about our universe.
                </p>
              </div>

              <div className="developer-stats">
                <div className="dev-stat">
                  <span className="stat-icon">⏰</span>
                  <span className="stat-value">24/7</span>
                  <span className="stat-label">Dedicated Development</span>
                </div>
                <div className="dev-stat">
                  <span className="stat-icon">🎯</span>
                  <span className="stat-value">100%</span>
                  <span className="stat-label">Passion Driven</span>
                </div>
                <div className="dev-stat">
                  <span className="stat-icon">🚀</span>
                  <span className="stat-value">∞</span>
                  <span className="stat-label">Space Enthusiasm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Statistics Section */}
      <section className="realtime-stats-section">
        <div className="container">
          <h2 className="section-title">Real-time Impact</h2>
          <p className="section-subtitle">
            Live statistics showing AETHERION's reach across the cosmos
          </p>
          
          <div className="stats-grid">
            <div className="stat-card realtime" data-aos="fade-up" data-aos-delay="0">
              <div className="stat-icon">🖼️</div>
              <div className="stat-number" data-target={stats.imagesCurated}>
                {stats.imagesCurated}
              </div>
              <div className="stat-label">Images Curated</div>
              <div className="stat-description">Daily APOD updates since launch</div>
              <div className="realtime-indicator">
                <span className="pulse-dot"></span>
                LIVE
              </div>
            </div>

            <div className="stat-card realtime" data-aos="fade-up" data-aos-delay="100">
              <div className="stat-icon">👥</div>
              <div className="stat-number" data-target={stats.totalVisitors}>
                {formatNumber(stats.totalVisitors)}
              </div>
              <div className="stat-label">Total Cosmic Explorers</div>
              <div className="stat-description">Unique visitors who've explored AETHERION</div>
              <div className="realtime-indicator">
                <span className="pulse-dot"></span>
                LIVE
              </div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
              <div className="stat-icon">🌌</div>
              <div className="stat-number">{stats.galaxiesExplored}+</div>
              <div className="stat-label">Galaxies Explored</div>
              <div className="stat-description">Through NASA's cosmic imagery</div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
              <div className="stat-icon">✨</div>
              <div className="stat-number">{formatNumber(stats.lightYearsCovered)}</div>
              <div className="stat-label">Light Years Covered</div>
              <div className="stat-description">In astronomical discoveries</div>
            </div>
          </div>

          {/* Visitor Insights */}
          <div className="visitor-insights">
            <h3>👥 Visitor Insights</h3>
            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-value">{formatNumber(visitorStats.total)}</span>
                <span className="insight-label">Total Visitors</span>
                <span className="insight-desc">All-time unique explorers</span>
              </div>
              <div className="insight-item">
                <span className="insight-value">{formatNumber(visitorStats.today)}</span>
                <span className="insight-label">Today's Visitors</span>
                <span className="insight-desc">New cosmic journeys started</span>
              </div>
              <div className="insight-item">
                <span className="insight-value">{formatNumber(visitorStats.thisWeek)}</span>
                <span className="insight-label">This Week</span>
                <span className="insight-desc">Weekly space explorers</span>
              </div>
              <div className="insight-item">
                <span className="insight-value">{visitorStats.isNewVisitor ? 'Welcome!' : 'Welcome Back!'}</span>
                <span className="insight-label">Your Status</span>
                <span className="insight-desc">
                  {visitorStats.isNewVisitor ? 'First time explorer' : 'Returning astronaut'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Data Demo */}
          <div className="live-data-demo">
            <h3>Latest NASA Data</h3>
            {imageLoading ? (
              <div className="apod-loading">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading cosmic discovery...</p>
                </div>
              </div>
            ) : (
              <div className="apod-preview">
                <div className="apod-info">
                  <h4>{apodData?.title || "Loading..."}</h4>
                  <p className="apod-date">{apodData?.date || "Date loading..."}</p>
                  <p className="apod-desc">
                    {apodData?.explanation?.substring(0, 150) || "Description loading..."}...
                  </p>
                  <button 
                    className="apod-preview-btn"
                    onClick={() => {
                      trackAPODInteraction('preview_viewed');
                      window.location.href = '/';
                    }}
                  >
                    Explore Today's Discovery →
                  </button>
                </div>
                
                <div className="apod-thumb">
                  {apodData && !apodData.imageError && apodData.url && apodData.media_type === 'image' ? (
                    <img 
                      src={apodData.url} 
                      alt={apodData.title}
                      loading="lazy"
                      onError={() => setImageError(true)}
                      onClick={() => trackAPODInteraction('thumbnail_clicked')}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <div className="placeholder-content">
                        <span className="placeholder-icon">🌌</span>
                        <span className="placeholder-text">
                          {imageError ? "Image unavailable" : "Loading..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="skills-section">
        <div className="container">
          <h2 className="section-title">Technical Arsenal</h2>
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div key={index} className="skill-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="skill-header">
                  <span className="skill-icon">{skill.icon}</span>
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-percentage">{skill.level}%</span>
                </div>
                <div className="skill-bar">
                  <div 
                    className="skill-progress" 
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="container">
          <h2 className="section-title">Development Timeline</h2>
          <div className="timeline">
            {missions.map((mission, index) => (
              <div key={index} className="timeline-item" data-aos="fade-left" data-aos-delay={index * 200}>
                <div className="timeline-marker">
                  <div className="timeline-year">{mission.year}</div>
                </div>
                <div className="timeline-content">
                  <h3 className="timeline-title">{mission.title}</h3>
                  <p className="timeline-description">{mission.description}</p>
                  <span className={`timeline-status ${mission.status.toLowerCase().replace(' ', '-')}`}>
                    {mission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="container">
          <div className="technology-content">
            <div className="tech-text">
              <h2 className="section-title">Built with Modern Tech</h2>
              <p>
                AETHERION is crafted using cutting-edge web technologies and NASA's open APIs 
                to deliver real-time cosmic content. The entire application is built from scratch 
                with performance and user experience as top priorities.
              </p>
              <ul className="tech-features">
                <li>
                  <span className="feature-icon">⚛️</span>
                  React.js with Hooks for dynamic UI
                </li>
                <li>
                  <span className="feature-icon">🛰️</span>
                  Real-time NASA API integration
                </li>
                <li>
                  <span className="feature-icon">📱</span>
                  Responsive design for all devices
                </li>
                <li>
                  <span className="feature-icon">⚡</span>
                  Optimized performance and loading
                </li>
                <li>
                  <span className="feature-icon">🎨</span>
                  Custom CSS animations and effects
                </li>
                <li>
                  <span className="feature-icon">📊</span>
                  Live visitor tracking and analytics
                </li>
              </ul>
            </div>
            
            <div className="tech-visual">
              <div className="tech-orbit">
                <div className="tech-planet">🌍</div>
                <div className="tech-satellite sat-1">🛰️</div>
                <div className="tech-satellite sat-2">🛰️</div>
                <div className="tech-satellite sat-3">🛰️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Explore the Universe?</h2>
            <p className="cta-description">
              Join {formatNumber(stats.totalVisitors)} cosmic explorers and discover something new about space every day
            </p>
            <div className="cta-buttons">
              <a href="/" className="cta-button primary">
                <span>Start Exploring</span>
                <span className="button-glow"></span>
              </a>
              <a href="mailto:contact@aetherion.space" className="cta-button secondary">
                <span>Get in Touch</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;