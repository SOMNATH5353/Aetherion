import React, { useState, useEffect, useMemo } from 'react';
import './Gallery.css';

const Gallery = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('stars');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Enhanced categories with more cosmic objects
  const categories = [
    { id: 'stars', name: 'Stars', icon: '⭐', description: 'Brilliant stellar formations across the cosmos' },
    { id: 'blackholes', name: 'Black Holes', icon: '🕳️', description: 'Mysterious cosmic phenomena that bend spacetime' },
    { id: 'planets', name: 'Planets', icon: '🪐', description: 'Worlds within our solar system and beyond' },
    { id: 'nebulae', name: 'Nebulae', icon: '☁️', description: 'Stellar nurseries and cosmic clouds' },
    { id: 'galaxies', name: 'Galaxies', icon: '🌀', description: 'Massive collections of stars and cosmic matter' },
    { id: 'supernovas', name: 'Supernovas', icon: '💥', description: 'Explosive deaths of massive stars' }
  ];

  // Enhanced image data with 9 images per category
  const allImages = {
    stars: [
      {
        id: 'star1',
        title: "Betelgeuse Supergiant",
        description: "One of the largest known stars, a red supergiant in the constellation Orion that could explode as a supernova.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-01",
        location: "Orion constellation",
        distance: "650 light-years"
      },
      {
        id: 'star2',
        title: "Sirius Binary System",
        description: "The brightest star in our night sky, actually a binary star system with a white dwarf companion.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-02",
        location: "Canis Major",
        distance: "8.6 light-years"
      },
      {
        id: 'star3',
        title: "Vega Star",
        description: "A bright star that was the northern pole star around 12,000 BCE and will be again around 13,727 CE.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-03",
        location: "Lyra constellation",
        distance: "25 light-years"
      },
      {
        id: 'star4',
        title: "Proxima Centauri",
        description: "The closest star to our solar system, a red dwarf star with potentially habitable exoplanets.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-04",
        location: "Centaurus constellation",
        distance: "4.24 light-years"
      },
      {
        id: 'star5',
        title: "Rigel Blue Giant",
        description: "A blue supergiant star, one of the most luminous stars known in the Milky Way galaxy.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-05",
        location: "Orion constellation",
        distance: "860 light-years"
      },
      {
        id: 'star6',
        title: "Alpha Centauri",
        description: "The closest star system to Earth, consisting of three stars including Proxima Centauri.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-06",
        location: "Centaurus constellation",
        distance: "4.37 light-years"
      },
      {
        id: 'star7',
        title: "Polaris North Star",
        description: "The current pole star of Earth, a yellow supergiant that has guided navigation for centuries.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-07",
        location: "Ursa Minor",
        distance: "433 light-years"
      },
      {
        id: 'star8',
        title: "Aldebaran Red Giant",
        description: "A red giant star and the brightest star in the constellation Taurus, following the Pleiades cluster.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-08",
        location: "Taurus constellation",
        distance: "65 light-years"
      },
      {
        id: 'star9',
        title: "Antares Red Supergiant",
        description: "A red supergiant star, one of the largest and most luminous observable stars in the Milky Way.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-09",
        location: "Scorpius constellation",
        distance: "600 light-years"
      }
    ],
    blackholes: [
      {
        id: 'bh1',
        title: "Sagittarius A*",
        description: "The supermassive black hole at the center of our Milky Way galaxy, with a mass 4 million times our Sun.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-01",
        location: "Galactic Center",
        distance: "26,000 light-years"
      },
      {
        id: 'bh2',
        title: "M87* Black Hole",
        description: "The first black hole ever directly imaged, located in the center of the giant elliptical galaxy M87.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-02",
        location: "Virgo constellation",
        distance: "53 million light-years"
      },
      {
        id: 'bh3',
        title: "Cygnus X-1",
        description: "One of the first black holes discovered, a stellar-mass black hole in a binary system.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-03",
        location: "Cygnus constellation",
        distance: "6,070 light-years"
      },
      {
        id: 'bh4',
        title: "TON 618",
        description: "One of the most massive black holes known, with a mass 66 billion times that of our Sun.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-04",
        location: "Canes Venatici",
        distance: "10.4 billion light-years"
      },
      {
        id: 'bh5',
        title: "GW150914 Merger",
        description: "The first gravitational wave detection from two merging black holes, opening new astronomy.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-05",
        location: "Unknown region",
        distance: "1.3 billion light-years"
      },
      {
        id: 'bh6',
        title: "V404 Cygni",
        description: "A black hole known for its dramatic outbursts and jets of material extending into space.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-06",
        location: "Cygnus constellation",
        distance: "7,800 light-years"
      },
      {
        id: 'bh7',
        title: "A0620-00",
        description: "The closest known black hole to Earth, in a binary system with a K-type main sequence star.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-07",
        location: "Monoceros constellation",
        distance: "3,000 light-years"
      },
      {
        id: 'bh8',
        title: "J0313-1806",
        description: "The most distant and ancient black hole detected, formed when the universe was very young.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-08",
        location: "Early Universe",
        distance: "13.03 billion light-years"
      },
      {
        id: 'bh9',
        title: "GRS 1915+105",
        description: "A microquasar with relativistic jets, one of the most luminous objects in our galaxy.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-09",
        location: "Aquila constellation",
        distance: "36,000 light-years"
      }
    ],
    planets: [
      {
        id: 'planet1',
        title: "Mars - The Red Planet",
        description: "The fourth planet from the Sun, known for its rusty red appearance and potential for past life.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        date: "2024-06-01",
        location: "Solar System",
        distance: "225 million km"
      },
      {
        id: 'planet2',
        title: "Jupiter - Gas Giant",
        description: "The largest planet in our solar system, with its iconic Great Red Spot storm.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        date: "2024-06-02",
        location: "Solar System",
        distance: "628 million km"
      },
      {
        id: 'planet3',
        title: "Saturn's Rings",
        description: "The magnificent ring system of Saturn, composed of countless ice and rock particles.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        date: "2024-06-03",
        location: "Solar System",
        distance: "1.35 billion km"
      },
      {
        id: 'planet4',
        title: "Venus - Morning Star",
        description: "The hottest planet in our solar system, shrouded in thick clouds of sulfuric acid.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        date: "2024-06-04",
        location: "Solar System",
        distance: "108 million km"
      },
      {
        id: 'planet5',
        title: "Neptune - Ice Giant",
        description: "The windiest planet in our solar system, with supersonic winds reaching 2,100 km/h.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        date: "2024-06-05",
        location: "Solar System",
        distance: "4.5 billion km"
      },
      {
        id: 'planet6',
        title: "Kepler-452b",
        description: "An exoplanet in the habitable zone, often called Earth's cousin for its similar characteristics.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        date: "2024-06-06",
        location: "Cygnus constellation",
        distance: "1,400 light-years"
      },
      {
        id: 'planet7',
        title: "HD 209458 b",
        description: "The first exoplanet discovered transiting its star, revolutionizing exoplanet detection methods.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        date: "2024-06-07",
        location: "Pegasus constellation",
        distance: "159 light-years"
      },
      {
        id: 'planet8',
        title: "TRAPPIST-1 System",
        description: "A system of seven Earth-sized planets, three of which are in the habitable zone.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        date: "2024-06-08",
        location: "Aquarius constellation",
        distance: "40 light-years"
      },
      {
        id: 'planet9',
        title: "Proxima Centauri b",
        description: "The closest known exoplanet to Earth, located in the habitable zone of its red dwarf star.",
        url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop",
        date: "2024-06-09",
        location: "Centaurus constellation",
        distance: "4.24 light-years"
      }
    ],
    nebulae: [
      {
        id: 'nebula1',
        title: "Eagle Nebula",
        description: "Famous for the 'Pillars of Creation', stellar nurseries where new stars are born from cosmic dust.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-01",
        location: "Serpens constellation",
        distance: "7,000 light-years"
      },
      {
        id: 'nebula2',
        title: "Horsehead Nebula",
        description: "One of the most recognizable dark nebulae, silhouetted against bright background gas.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-02",
        location: "Orion constellation",
        distance: "1,500 light-years"
      },
      {
        id: 'nebula3',
        title: "Crab Nebula",
        description: "A supernova remnant containing a pulsar, the remains of a star that exploded in 1054 AD.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-03",
        location: "Taurus constellation",
        distance: "6,500 light-years"
      },
      {
        id: 'nebula4',
        title: "Ring Nebula",
        description: "A planetary nebula formed by a dying star shedding its outer layers into space.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-04",
        location: "Lyra constellation",
        distance: "2,300 light-years"
      },
      {
        id: 'nebula5',
        title: "Cat's Eye Nebula",
        description: "A complex planetary nebula with intricate knots, jets, and shock-induced features.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-05",
        location: "Draco constellation",
        distance: "3,300 light-years"
      },
      {
        id: 'nebula6',
        title: "Rosette Nebula",
        description: "A large circular HII region resembling a rose, with a cavity created by stellar winds.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-06",
        location: "Monoceros constellation",
        distance: "5,200 light-years"
      },
      {
        id: 'nebula7',
        title: "Veil Nebula",
        description: "A large supernova remnant, the wispy remains of a massive star that exploded 8,000 years ago.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-07",
        location: "Cygnus constellation",
        distance: "2,100 light-years"
      },
      {
        id: 'nebula8',
        title: "Helix Nebula",
        description: "Known as the 'Eye of God', the nearest and largest planetary nebula to Earth.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-08",
        location: "Aquarius constellation",
        distance: "650 light-years"
      },
      {
        id: 'nebula9',
        title: "Orion Nebula",
        description: "One of the brightest nebulae visible to the naked eye, a stellar nursery in our cosmic neighborhood.",
        url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=600&fit=crop",
        date: "2024-06-09",
        location: "Orion constellation",
        distance: "1,344 light-years"
      }
    ],
    galaxies: [
      {
        id: 'galaxy1',
        title: "Andromeda Galaxy",
        description: "The nearest major galaxy to the Milky Way, containing approximately one trillion stars.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-01",
        location: "Andromeda constellation",
        distance: "2.537 million light-years"
      },
      {
        id: 'galaxy2',
        title: "Whirlpool Galaxy",
        description: "A grand design spiral galaxy famous for its prominent spiral structure and companion galaxy.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-02",
        location: "Canes Venatici",
        distance: "23 million light-years"
      },
      {
        id: 'galaxy3',
        title: "Sombrero Galaxy",
        description: "A spiral galaxy with a prominent dust lane and bright central bulge resembling a sombrero hat.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-03",
        location: "Virgo constellation",
        distance: "29 million light-years"
      },
      {
        id: 'galaxy4',
        title: "Pinwheel Galaxy",
        description: "A face-on spiral galaxy with well-defined spiral arms and active star formation regions.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-04",
        location: "Ursa Major",
        distance: "21 million light-years"
      },
      {
        id: 'galaxy5',
        title: "Centaurus A",
        description: "A peculiar galaxy with a prominent dust lane, likely the result of a galactic collision.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-05",
        location: "Centaurus constellation",
        distance: "13.7 million light-years"
      },
      {
        id: 'galaxy6',
        title: "Large Magellanic Cloud",
        description: "A satellite galaxy of the Milky Way, containing the Tarantula Nebula star-forming region.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-06",
        location: "Southern Sky",
        distance: "160,000 light-years"
      },
      {
        id: 'galaxy7',
        title: "Triangulum Galaxy",
        description: "The third-largest galaxy in our Local Group, with prominent H II star-forming regions.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-07",
        location: "Triangulum constellation",
        distance: "3 million light-years"
      },
      {
        id: 'galaxy8',
        title: "Sculptor Galaxy",
        description: "A bright spiral galaxy and the brightest member of the Sculptor Group of galaxies.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-08",
        location: "Sculptor constellation",
        distance: "11.4 million light-years"
      },
      {
        id: 'galaxy9',
        title: "Messier 104",
        description: "A lenticular galaxy in Virgo, known for its bright nucleus and prominent dust lane.",
        url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
        date: "2024-06-09",
        location: "Virgo constellation",
        distance: "28 million light-years"
      }
    ],
    supernovas: [
      {
        id: 'sn1',
        title: "Supernova 1987A",
        description: "The closest supernova observed in modern times, providing unprecedented insight into stellar death.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-01",
        location: "Large Magellanic Cloud",
        distance: "160,000 light-years"
      },
      {
        id: 'sn2',
        title: "Kepler's Supernova",
        description: "A Type Ia supernova observed in 1604, the most recent supernova seen in the Milky Way.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-02",
        location: "Ophiuchus constellation",
        distance: "20,000 light-years"
      },
      {
        id: 'sn3',
        title: "Tycho's Supernova",
        description: "A supernova observed in 1572 that helped change our understanding of the heavens.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-03",
        location: "Cassiopeia constellation",
        distance: "8,000-9,800 light-years"
      },
      {
        id: 'sn4',
        title: "Cassiopeia A",
        description: "The remnant of a massive star that exploded about 300 years ago, now a strong radio source.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-04",
        location: "Cassiopeia constellation",
        distance: "11,000 light-years"
      },
      {
        id: 'sn5',
        title: "SN 2014J",
        description: "A Type Ia supernova in the nearby Cigar Galaxy, one of the closest supernovae in recent decades.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-05",
        location: "Ursa Major",
        distance: "11.5 million light-years"
      },
      {
        id: 'sn6',
        title: "Vela Supernova",
        description: "An ancient supernova remnant that occurred about 11,000-12,300 years ago.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-06",
        location: "Vela constellation",
        distance: "800 light-years"
      },
      {
        id: 'sn7',
        title: "Puppis A",
        description: "A supernova remnant approximately 3,700 years old, showing complex shock wave structures.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-07",
        location: "Puppis constellation",
        distance: "7,000 light-years"
      },
      {
        id: 'sn8',
        title: "G1.9+0.3",
        description: "The youngest known supernova remnant in our galaxy, only about 100 years old.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-08",
        location: "Sagittarius constellation",
        distance: "25,000 light-years"
      },
      {
        id: 'sn9',
        title: "SN 2011fe",
        description: "A nearby Type Ia supernova that was well-studied and helped refine our understanding of these cosmic explosions.",
        url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
        date: "2024-06-09",
        location: "Ursa Major",
        distance: "21 million light-years"
      }
    ]
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const currentImages = useMemo(() => {
    return allImages[activeCategory] || [];
  }, [activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setLoading(true);
    setTimeout(() => {
      setActiveCategory(categoryId);
      setLoading(false);
    }, 300);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  const ImageCard = ({ image, index }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = () => {
      setImageLoading(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
    };

    return (
      <div 
        className={`image-card ${isLoaded ? 'loaded' : ''}`}
        onClick={() => handleImageClick(image)}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="card-inner">
          <div className="image-container">
            {imageLoading && (
              <div className="image-loading">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              </div>
            )}
            
            {imageError && (
              <div className="image-error">
                <span className="error-icon">🌌</span>
                <span className="error-text">Image unavailable</span>
              </div>
            )}
            
            <img 
              src={image.url} 
              alt={image.title}
              className="card-image"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoading || imageError ? 'none' : 'block' }}
            />
            
            <div className="image-overlay">
              <div className="overlay-content">
                <h3 className="image-title">{image.title}</h3>
                <p className="image-location">{image.location}</p>
              </div>
            </div>
          </div>
          
          <div className="card-content">
            <div className="card-header">
              <h3 className="card-title">{image.title}</h3>
              <span className="card-date">{image.date}</span>
            </div>
            
            <p className="card-description">{image.description}</p>
            
            <div className="card-meta">
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span className="meta-text">{image.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📏</span>
                <span className="meta-text">{image.distance}</span>
              </div>
            </div>
          </div>
          
          <div className="card-glow"></div>
        </div>
      </div>
    );
  };

  const ImageModal = () => {
    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleCloseModal();
        }
      };

      if (isModalOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isModalOpen]);

    if (!isModalOpen || !selectedImage) return null;

    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={handleCloseModal}>
            <span>✕</span>
          </button>
          
          <div className="modal-image-container">
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title}
              className="modal-image"
            />
            <div className="modal-image-glow"></div>
          </div>
          
          <div className="modal-info">
            <div className="modal-header">
              <h2 className="modal-title">{selectedImage.title}</h2>
              <span className="modal-date">{selectedImage.date}</span>
            </div>
            
            <p className="modal-description">{selectedImage.description}</p>
            
            <div className="modal-details">
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{selectedImage.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Distance:</span>
                <span className="detail-value">{selectedImage.distance}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{activeCategory}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className={`gallery-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Gallery Hero Section */}
      <section className="gallery-hero">
        <div className="gallery-hero-container">
          <div className="gallery-hero-content">
            <h1 className="gallery-hero-title">
              Cosmic <span className="brand-highlight">Gallery</span>
            </h1>
            <p className="gallery-hero-subtitle">
              Explore the breathtaking wonders of our universe through stunning imagery
            </p>
            <div className="hero-decorative-line"></div>
          </div>
          
          {/* Enhanced 3D Floating Elements */}
          <div className="floating-elements">
            <div className="float-element e1">🌟</div>
            <div className="float-element e2">🚀</div>
            <div className="float-element e3">🛸</div>
            <div className="float-element e4">⭐</div>
            <div className="float-element e5">🌙</div>
            <div className="float-element e6">☄️</div>
            <div className="float-element e7">🌌</div>
            <div className="float-element e8">💫</div>
          </div>
          
          {/* 3D Orbit Animation */}
          <div className="cosmic-orbit">
            <div className="orbit-ring ring-1">
              <div className="orbit-object obj-1">🪐</div>
            </div>
            <div className="orbit-ring ring-2">
              <div className="orbit-object obj-2">🌍</div>
            </div>
            <div className="orbit-ring ring-3">
              <div className="orbit-object obj-3">🌙</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Selection Section */}
      <section className="category-section">
        <div className="container">
          <h2 className="section-title">Choose Your Cosmic Journey</h2>
          <p className="section-subtitle">
            Select a category to explore 9 stunning images of cosmic phenomena
          </p>
          
          <div className="category-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <div className="category-inner">
                  <div className="category-icon">{category.icon}</div>
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <div className="category-glow"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Stats */}
      <section className="gallery-stats">
        <div className="container">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-number">9</span>
              <span className="stat-label">Images per Category</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{categories.length}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Object.keys(allImages).length * 9}</span>
              <span className="stat-label">Total Images</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">∞</span>
              <span className="stat-label">Wonder</span>
            </div>
          </div>
        </div>
      </section>

      {/* Current Category Display */}
      <section className="current-category">
        <div className="container">
          <div className="category-header">
            <div className="category-info">
              <span className="current-icon">{categories.find(cat => cat.id === activeCategory)?.icon}</span>
              <div className="category-text">
                <h2 className="current-title">{categories.find(cat => cat.id === activeCategory)?.name}</h2>
                <p className="current-description">{categories.find(cat => cat.id === activeCategory)?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Gallery Section */}
      <section className="main-gallery">
        <div className="container">
          <div className="gallery-grid">
            {loading ? (
              <div className="gallery-loading">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading cosmic wonders...</p>
                </div>
              </div>
            ) : (
              currentImages.map((image, index) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  index={index}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal />
    </main>
  );
};

export default Gallery;