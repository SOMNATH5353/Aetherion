import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Gallery.css';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [filterAnimation, setFilterAnimation] = useState(false);

  // Gallery data with 6 images per category
  const galleryData = useMemo(() => ({
    space: [
      {
        id: 'space-001',
        src: '/images/gallery/space/space-001.jpg',
        title: 'Deep Space Nebula',
        description: 'A breathtaking view of cosmic gas and dust formations in deep space',
        category: 'space'
      },
      {
        id: 'space-002',
        src: '/images/gallery/space/space-002.jpg',
        title: 'Stellar Formation',
        description: 'Young stars being born in a stellar nursery',
        category: 'space'
      },
      {
        id: 'space-003',
        src: '/images/gallery/space/space-003.jpg',
        title: 'Cosmic Explosion',
        description: 'Supernova remnants scattered across space',
        category: 'space'
      },
      {
        id: 'space-004',
        src: '/images/gallery/space/space-004.jpg',
        title: 'Binary Star System',
        description: 'Two stars orbiting each other in perfect harmony',
        category: 'space'
      },
      {
        id: 'space-005',
        src: '/images/gallery/space/space-005.jpg',
        title: 'Interstellar Medium',
        description: 'The matter that exists in the space between star systems',
        category: 'space'
      },
      {
        id: 'space-006',
        src: '/images/gallery/space/space-006.jpg',
        title: 'Cosmic Web',
        description: 'The large-scale structure of the universe',
        category: 'space'
      }
    ],
    nebula: [
      {
        id: 'nebula-001',
        src: './public/gallery/nebula/eagle.jpg',
        title: 'Eagle Nebula',
        description: 'The famous Pillars of Creation in the Eagle Nebula',
        category: 'nebula'
      },
      {
        id: 'nebula-002',
        src: './public/gallery/nebula/orion.jpg',
        title: 'Orion Nebula',
        description: 'One of the brightest nebulae visible to the naked eye',
        category: 'nebula'
      },
      {
        id: 'nebula-003',
        src: '/public/gallery/nebula/horsehead.jpg',
        title: 'Horsehead Nebula',
        description: 'A dark nebula silhouetted against bright emission',
        category: 'nebula'
      },
      {
        id: 'nebula-004',
        src: '/public/gallery/nebula/crab.jpg',
        title: 'Crab Nebula',
        description: 'A supernova remnant and pulsar wind nebula',
        category: 'nebula'
      },
      {
        id: 'nebula-005',
        src: '/public/gallery/nebula/ring.jpg',
        title: 'Ring Nebula',
        description: 'A planetary nebula formed by an expanding shell of gas',
        category: 'nebula'
      },
      {
        id: 'nebula-006',
        src: '/public/gallery/nebula/cat.jpg',
        title: 'Cat\'s Eye Nebula',
        description: 'A complex planetary nebula with intricate structures',
        category: 'nebula'
      }
    ],
    planets: [
      {
        id: 'planet-001',
        src: '/public/gallery/planets/jupiter.jpg',
        title: 'Jupiter\'s Great Red Spot',
        description: 'The massive storm that has raged on Jupiter for centuries',
        category: 'planets'
      },
      {
        id: 'planet-002',
        src: '/public/gallery/planets/saturn.jpg',
        title: 'Saturn\'s Rings',
        description: 'The magnificent ring system of Saturn in detail',
        category: 'planets'
      },
      {
        id: 'planet-003',
        src: '/public/gallery/planets/mars.jpg',
        title: 'Mars Surface',
        description: 'The red planet\'s landscape captured by rovers',
        category: 'planets'
      },
      {
        id: 'planet-004',
        src: '/public/gallery/planets/earth.jpg',
        title: 'Earth from Space',
        description: 'Our blue marble as seen from the International Space Station',
        category: 'planets'
      },
      {
        id: 'planet-005',
        src: '/public/gallery/planets/venus.jpg',
        title: 'Venus Atmosphere',
        description: 'The thick, toxic atmosphere of our neighboring planet',
        category: 'planets'
      },
      {
        id: 'planet-006',
        src: '/public/gallery/planets/neptune.jpg',
        title: 'Neptune\'s Storms',
        description: 'Dynamic weather patterns on the ice giant Neptune',
        category: 'planets'
      }
    ],
    galaxies: [
      {
        id: 'galaxy-001',
        src: '/images/gallery/galaxies/galaxy-001.jpg',
        title: 'Andromeda Galaxy',
        description: 'Our nearest major galactic neighbor',
        category: 'galaxies'
      },
      {
        id: 'galaxy-002',
        src: '/images/gallery/galaxies/galaxy-002.jpg',
        title: 'Whirlpool Galaxy',
        description: 'A classic spiral galaxy with well-defined arms',
        category: 'galaxies'
      },
      {
        id: 'galaxy-003',
        src: '/images/gallery/galaxies/galaxy-003.jpg',
        title: 'Milky Way Center',
        description: 'The central bulge of our own galaxy',
        category: 'galaxies'
      },
      {
        id: 'galaxy-004',
        src: '/images/gallery/galaxies/galaxy-004.jpg',
        title: 'Sombrero Galaxy',
        description: 'A galaxy that resembles a Mexican hat',
        category: 'galaxies'
      },
      {
        id: 'galaxy-005',
        src: '/images/gallery/galaxies/galaxy-005.jpg',
        title: 'Triangulum Galaxy',
        description: 'The third-largest galaxy in our Local Group',
        category: 'galaxies'
      },
      {
        id: 'galaxy-006',
        src: '/images/gallery/galaxies/galaxy-006.jpg',
        title: 'Pinwheel Galaxy',
        description: 'A face-on spiral galaxy with prominent spiral arms',
        category: 'galaxies'
      }
    ],
    astronomy: [
      {
        id: 'astro-001',
        src: '/images/gallery/astronomy/astro-001.jpg',
        title: 'Hubble Deep Field',
        description: 'A deep look into the universe showing thousands of galaxies',
        category: 'astronomy'
      },
      {
        id: 'astro-002',
        src: '/images/gallery/astronomy/astro-002.jpg',
        title: 'Solar Eclipse',
        description: 'The moon perfectly blocking the sun\'s light',
        category: 'astronomy'
      },
      {
        id: 'astro-003',
        src: '/images/gallery/astronomy/astro-003.jpg',
        title: 'International Space Station',
        description: 'Humanity\'s outpost in low Earth orbit',
        category: 'astronomy'
      },
      {
        id: 'astro-004',
        src: '/images/gallery/astronomy/astro-004.jpg',
        title: 'Aurora Borealis',
        description: 'The Northern Lights dancing in Earth\'s atmosphere',
        category: 'astronomy'
      },
      {
        id: 'astro-005',
        src: '/images/gallery/astronomy/astro-005.jpg',
        title: 'Comet Approach',
        description: 'A comet with its brilliant tail approaching the sun',
        category: 'astronomy'
      },
      {
        id: 'astro-006',
        src: '/images/gallery/astronomy/astro-006.jpg',
        title: 'Star Cluster',
        description: 'A dense collection of ancient stars',
        category: 'astronomy'
      }
    ]
  }), []);

  // Get all images or filtered by category
  const filteredImages = useMemo(() => {
    if (selectedCategory === 'all') {
      return Object.values(galleryData).flat();
    }
    return galleryData[selectedCategory] || [];
  }, [selectedCategory, galleryData]);

  // Category filter handler
  const handleCategoryChange = useCallback((category) => {
    setFilterAnimation(true);
    setTimeout(() => {
      setSelectedCategory(category);
      setFilterAnimation(false);
    }, 150);
  }, []);

  // Image loading handler
  const handleImageLoad = useCallback((imageId) => {
    setImagesLoaded(prev => ({
      ...prev,
      [imageId]: true
    }));
  }, []);

  // Lightbox handlers
  const openLightbox = useCallback((image) => {
    setSelectedImage(image);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  }, []);

  // Navigation in lightbox
  const navigateImage = useCallback((direction) => {
    if (!selectedImage) return;
    
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    } else {
      newIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(filteredImages[newIndex]);
  }, [selectedImage, filteredImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, closeLightbox, navigateImage]);

  return (
    <section id="gallery" className="gallery">
      <div className="gallery-container">
        {/* Header */}
        <div className="gallery-header">
          <h2 className="gallery-title">
            <span className="title-icon">🌌</span>
            Cosmic Gallery
          </h2>
          <p className="gallery-subtitle">
            Explore stunning astronomical imagery from across the universe
          </p>
        </div>

        {/* Category Filters */}
        <div className="gallery-filters">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            <span className="filter-icon">🌟</span>
            All ({Object.values(galleryData).flat().length})
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'space' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('space')}
          >
            <span className="filter-icon">🚀</span>
            Space ({galleryData.space.length})
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'nebula' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('nebula')}
          >
            <span className="filter-icon">☁️</span>
            Nebulae ({galleryData.nebula.length})
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'planets' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('planets')}
          >
            <span className="filter-icon">🪐</span>
            Planets ({galleryData.planets.length})
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'galaxies' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('galaxies')}
          >
            <span className="filter-icon">🌀</span>
            Galaxies ({galleryData.galaxies.length})
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'astronomy' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('astronomy')}
          >
            <span className="filter-icon">🔭</span>
            Astronomy ({galleryData.astronomy.length})
          </button>
        </div>

        {/* Gallery Grid */}
        <div className={`gallery-grid ${filterAnimation ? 'filtering' : ''}`}>
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="gallery-item"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => openLightbox(image)}
            >
              <div className="image-container">
                {!imagesLoaded[image.id] && (
                  <div className="image-placeholder">
                    <div className="placeholder-spinner">
                      <span className="spinner-icon">🌟</span>
                    </div>
                    <p className="placeholder-text">Loading...</p>
                  </div>
                )}
                <img
                  src={image.src}
                  alt={image.title}
                  className={`gallery-image ${imagesLoaded[image.id] ? 'loaded' : ''}`}
                  onLoad={() => handleImageLoad(image.id)}
                  loading="lazy"
                />
                <div className="image-overlay">
                  <div className="overlay-content">
                    <h3 className="image-title">{image.title}</h3>
                    <p className="image-description">{image.description}</p>
                    <div className="view-button">
                      <span className="view-icon">🔍</span>
                      <span>View Full Size</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="empty-gallery">
            <span className="empty-icon">🌌</span>
            <h3>No images found</h3>
            <p>Try selecting a different category or check back later for new cosmic wonders!</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <span>✕</span>
            </button>
            
            <button 
              className="lightbox-nav lightbox-prev" 
              onClick={() => navigateImage('prev')}
            >
              <span>‹</span>
            </button>
            
            <button 
              className="lightbox-nav lightbox-next" 
              onClick={() => navigateImage('next')}
            >
              <span>›</span>
            </button>
            
            <div className="lightbox-content">
              <div className="lightbox-image-container">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="lightbox-image"
                  loading="eager"
                />
              </div>
              
              <div className="lightbox-info">
                <h3 className="lightbox-title">{selectedImage.title}</h3>
                <p className="lightbox-description">{selectedImage.description}</p>
                <div className="lightbox-meta">
                  <span className="meta-category">
                    <span className="meta-icon">📂</span>
                    {selectedImage.category.charAt(0).toUpperCase() + selectedImage.category.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;