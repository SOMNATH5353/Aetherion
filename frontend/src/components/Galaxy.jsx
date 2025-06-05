import React from 'react';
import './Galaxy.css';

const Galaxy = () => {
  // Generate random background stars
  const backgroundStars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 4
  }));

  return (
    <div className="galaxy-container">
      {/* Background Stars */}
      <div className="background-stars">
        {backgroundStars.map(star => (
          <div
            key={star.id}
            className="bg-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      <div className="galaxy-spiral">
        {/* Central Core */}
        <div className="galaxy-core"></div>
        
        {/* Spiral Arms with Fixed Stars */}
        <div className="spiral-arm arm-1">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="star"></div>
          ))}
        </div>
        
        <div className="spiral-arm arm-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="star"></div>
          ))}
        </div>
        
        <div className="spiral-arm arm-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="star"></div>
          ))}
        </div>
        
        <div className="spiral-arm arm-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="star"></div>
          ))}
        </div>
        
        {/* Nebula Clouds */}
        <div className="nebula nebula-1"></div>
        <div className="nebula nebula-2"></div>
        <div className="nebula nebula-3"></div>
      </div>
    </div>
  );
};

export default Galaxy;