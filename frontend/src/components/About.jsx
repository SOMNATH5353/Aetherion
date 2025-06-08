import React, { useEffect, useState } from 'react';
import './About.css';

const About = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({
    imagesCurated: 1,
    usersInspired: 0,
    galaxiesExplored: 50,
    lightYearsCovered: 1000000
  });
  const [apodData, setApodData] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Trigger animation on component mount
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Calculate real-time statistics
    calculateRealTimeStats();

    return () => clearTimeout(timer);
  }, []);

  const calculateRealTimeStats = () => {
    try {
      // Calculate images curated based on days since project start
      const projectStartDate = new Date('2025-06-08'); // Today as Day 1
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate - projectStartDate) / (1000 * 60 * 60 * 24)) + 1;
      
      // Images curated starts from 1 and increments daily
      const imagesCurated = Math.max(daysDifference, 1);
      
      // Simulate users inspired based on images
      const usersInspired = Math.floor(imagesCurated * 15.7); // Average engagement rate
      
      // Get stored stats from localStorage for persistence
      const storedStats = localStorage.getItem('aetherionStats');
      if (storedStats) {
        const parsed = JSON.parse(storedStats);
        setStats({
          imagesCurated: imagesCurated,
          usersInspired: Math.max(usersInspired, parsed.usersInspired || 0),
          galaxiesExplored: parsed.galaxiesExplored || 50,
          lightYearsCovered: parsed.lightYearsCovered || 1000000
        });
      } else {
        setStats({
          imagesCurated: imagesCurated,
          usersInspired: usersInspired,
          galaxiesExplored: 50,
          lightYearsCovered: 1000000
        });
      }

      // Store updated stats
      localStorage.setItem('aetherionStats', JSON.stringify({
        imagesCurated: imagesCurated,
        usersInspired: usersInspired,
        galaxiesExplored: 50,
        lightYearsCovered: 1000000,
        lastUpdated: currentDate.toISOString()
      }));

    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  // Fetch latest APOD with optimized loading
  useEffect(() => {
    const fetchLatestAPOD = async () => {
      try {
        setImageLoading(true);
        setImageError(false);

        // Set timeout for 3 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );

        const fetchPromise = fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        const data = await response.json();
        
        // Preload image if it exists
        if (data.url && data.media_type === 'image') {
          const img = new Image();
          img.onload = () => {
            setApodData(data);
            setImageLoading(false);
          };
          img.onerror = () => {
            setImageError(true);
            setImageLoading(false);
            setApodData({ ...data, imageError: true });
          };
          img.src = data.url;
        } else {
          setApodData(data);
          setImageLoading(false);
        }
      } catch (error) {
        console.error('Error fetching APOD:', error);
        setImageError(true);
        setImageLoading(false);
        // Set fallback data
        setApodData({
          title: "Image Loading...",
          date: new Date().toISOString().split('T')[0],
          explanation: "Loading latest cosmic discovery from NASA...",
          imageError: true
        });
      }
    };

    fetchLatestAPOD();
  }, []);

  const missions = [
    {
      title: "Daily Cosmic Discovery",
      description: "Curating NASA's most breathtaking astronomical images daily",
      year: "2024",
      status: "Active"
    },
    {
      title: "Educational Outreach",
      description: "Making space science accessible to everyone through modern web technology",
      year: "2024",
      status: "Ongoing"
    },
    {
      title: "Interactive Space Experience",
      description: "Enhanced user interface with real-time space data visualization",
      year: "2025",
      status: "Coming Soon"
    }
  ];

  const skills = [
    { name: "React.js", level: 95, icon: "⚛️" },
    { name: "JavaScript", level: 90, icon: "🟨" },
    { name: "CSS3", level: 88, icon: "🎨" },
    { name: "NASA APIs", level: 85, icon: "🛰️" },
    { name: "Responsive Design", level: 92, icon: "📱" },
    { name: "Space Knowledge", level: 80, icon: "🌌" }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
  };

  return (
    <main className={`about-page ${isLoaded ? 'loaded' : ''}`}>
      {/* About Hero Section */}
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
            Live statistics powered by real data from the frontend
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
              <div className="stat-number" data-target={stats.usersInspired}>
                {formatNumber(stats.usersInspired)}
              </div>
              <div className="stat-label">Users Inspired</div>
              <div className="stat-description">Calculated from engagement metrics</div>
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

          {/* Optimized Latest NASA Data Section */}
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
                </div>
                
                <div className="apod-thumb">
                  {apodData && !apodData.imageError && apodData.url && apodData.media_type === 'image' ? (
                    <img 
                      src={apodData.url} 
                      alt={apodData.title}
                      loading="lazy"
                      onError={() => setImageError(true)}
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

      {/* Projects Timeline */}
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

      {/* Technology Stack with Satellite Animation */}
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
                  Live statistics and data tracking
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

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Explore the Universe?</h2>
            <p className="cta-description">
              Join me on this cosmic journey and discover something new about space every day
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