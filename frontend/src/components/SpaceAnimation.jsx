import React, { useEffect, useState } from 'react';
import './SpaceAnimation.css';

const SpaceAnimation = () => {
  const [stars, setStars] = useState([]);
  const [royalStars, setRoyalStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    // Generate regular stars
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 150; i++) {
        newStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 3 + 1,
          animationDelay: Math.random() * 3,
          animationDuration: Math.random() * 2 + 2
        });
      }
      setStars(newStars);
    };

    // Generate royal stars (special bright stars)
    const generateRoyalStars = () => {
      const newRoyalStars = [];
      for (let i = 0; i < 12; i++) {
        newRoyalStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          animationDelay: Math.random() * 5
        });
      }
      setRoyalStars(newRoyalStars);
    };

    // Generate shooting stars
    const generateShootingStars = () => {
      const newShootingStars = [];
      for (let i = 0; i < 3; i++) {
        newShootingStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 50,
          animationDelay: Math.random() * 8 + 2,
          animationDuration: Math.random() * 3 + 2
        });
      }
      setShootingStars(newShootingStars);
    };

    generateStars();
    generateRoyalStars();
    generateShootingStars();

    // Regenerate shooting stars periodically
    const shootingStarInterval = setInterval(() => {
      generateShootingStars();
    }, 10000);

    return () => clearInterval(shootingStarInterval);
  }, []);

  return (
    <div className="space-container">
      {/* Stars Layer */}
      <div className="stars-layer">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`
            }}
          />
        ))}
      </div>

      {/* Royal Stars Layer */}
      <div className="royal-stars-layer">
        {royalStars.map(star => (
          <div
            key={star.id}
            className="royal-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.animationDelay}s`
            }}
          />
        ))}
      </div>

      {/* Shooting Stars Layer */}
      <div className="shooting-stars-layer">
        {shootingStars.map(star => (
          <div
            key={star.id}
            className="shooting-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
              animation: `shootingStar ${star.animationDuration}s linear infinite`
            }}
          />
        ))}
      </div>

      {/* Royal Overlay Effects */}
      <div className="royal-overlay">
        <div className="luxury-shimmer shimmer-1"></div>
        <div className="luxury-shimmer shimmer-2"></div>
        
        <div className="corner-sparkle top-left"></div>
        <div className="corner-sparkle top-right"></div>
        <div className="corner-sparkle bottom-left"></div>
        <div className="corner-sparkle bottom-right"></div>
        
        <div className="royal-vignette"></div>
      </div>
    </div>
  );
};

export default SpaceAnimation;