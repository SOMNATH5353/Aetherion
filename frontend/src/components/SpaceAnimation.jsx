import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './SpaceAnimation.css';

const SpaceAnimation = () => {
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    // Generate background stars
    const generateStars = () => {
      const starArray = [];
      for (let i = 0; i < 1000; i++) {
        starArray.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          animationDelay: Math.random() * 5,
          animationDuration: Math.random() * 3 + 2,
        });
      }
      setStars(starArray);
    };

    // Generate shooting stars
    const generateShootingStars = () => {
      const shootingArray = [];
      for (let i = 0; i < 8; i++) {
        shootingArray.push({
          id: i,
          delay: i * 3 + Math.random() * 2,
          duration: Math.random() * 2 + 1,
          startY: Math.random() * 50 + 10,
        });
      }
      setShootingStars(shootingArray);
    };

    generateStars();
    generateShootingStars();
  }, []);

  return (
    <div className="space-container">
      {/* Background Stars */}
      <div className="stars-layer">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Featured Royal Stars */}
      <div className="royal-stars-layer">
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={i}
            className="royal-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Shooting Stars */}
      <div className="shooting-stars-layer">
        {shootingStars.map((shootingStar) => (
          <motion.div
            key={shootingStar.id}
            className="shooting-star"
            style={{
              top: `${shootingStar.startY}%`,
            }}
            initial={{ x: "-100px", opacity: 0 }}
            animate={{ x: "calc(100vw + 100px)", opacity: [0, 1, 0] }}
            transition={{
              duration: shootingStar.duration,
              repeat: Infinity,
              delay: shootingStar.delay,
              ease: "linear",
              repeatDelay: 5,
            }}
          />
        ))}
      </div>

      {/* Royal Overlay Effects */}
      <motion.div 
        className="royal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Luxury Shimmer Effects */}
        <motion.div 
          className="luxury-shimmer shimmer-1"
          animate={{ 
            x: ["-20px", "100px", "-20px"],
            opacity: [0, 0.8, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="luxury-shimmer shimmer-2"
          animate={{ 
            x: ["20px", "-100px", "20px"],
            opacity: [0, 0.6, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 3
          }}
        />
        
        {/* Royal Vignette */}
        <div className="royal-vignette" />
        
        {/* Corner Sparkles */}
        <motion.div 
          className="corner-sparkle top-left"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="corner-sparkle top-right"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <motion.div 
          className="corner-sparkle bottom-left"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.9, 0.2]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 4
          }}
        />
        
        <motion.div 
          className="corner-sparkle bottom-right"
          animate={{ 
            scale: [1, 1.6, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>
    </div>
  );
};

export default SpaceAnimation;