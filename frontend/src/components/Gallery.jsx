import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Gallery.css';

const Gallery = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('daily');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailyImages, setDailyImages] = useState([]);
  const [lastFetch, setLastFetch] = useState(null);

  // Add ref for scrolling to gallery
  const galleryRef = useRef(null);

  // Enhanced categories with daily featured category
  const categories = [
    { id: 'daily', name: 'Daily Featured', icon: '🌟', description: 'Curated daily selection of stunning space photography' },
    { id: 'stars', name: 'Stars', icon: '⭐', description: 'Brilliant stellar formations across the cosmos' },
    { id: 'blackholes', name: 'Black Holes', icon: '🕳️', description: 'Mysterious cosmic phenomena that bend spacetime' },
    { id: 'planets', name: 'Planets', icon: '🪐', description: 'Worlds within our solar system and beyond' },
    { id: 'nebulae', name: 'Nebulae', icon: '☁️', description: 'Stellar nurseries and cosmic clouds' },
    { id: 'galaxies', name: 'Galaxies', icon: '🌀', description: 'Massive collections of stars and cosmic matter' },
    { id: 'supernovas', name: 'Supernovas', icon: '💥', description: 'Explosive deaths of massive stars' }
  ];

  // Local image collections organized by category
  const allImages = {
    stars: [
      {
        id: 'star1',
        title: "Betelgeuse Supergiant",
        description: "One of the largest known stars, a red supergiant in Orion that could explode as a supernova at any time, potentially visible during the day.",
        url: "/images/stars/betelgeuse.jpg",
        thumbnail: "/images/stars/thumbs/betelgeuse-thumb.jpg",
        date: "2024-06-01",
        location: "Orion Constellation",
        distance: "650 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'star2',
        title: "Rigel Blue Supergiant",
        description: "A blazing blue supergiant star, one of the most luminous stars visible to the naked eye, outshining our Sun by 120,000 times.",
        url: "/images/stars/rigel.jpg",
        thumbnail: "/images/stars/thumbs/rigel-thumb.jpg",
        date: "2024-06-02",
        location: "Orion Constellation",
        distance: "860 light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'star3',
        title: "Wolf-Rayet Star",
        description: "An extremely hot and massive star shedding its outer layers at tremendous rates, creating spectacular nebulae around it.",
        url: "/images/stars/wolf-rayet.jpg",
        thumbnail: "/images/stars/thumbs/wolf-rayet-thumb.jpg",
        date: "2024-06-03",
        location: "Cygnus Constellation",
        distance: "5,000 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'star4',
        title: "Binary Star System",
        description: "Two stars locked in a cosmic dance, orbiting each other and exchanging material in a spectacular stellar performance.",
        url: "/images/stars/binary-system.jpg",
        thumbnail: "/images/stars/thumbs/binary-system-thumb.jpg",
        date: "2024-06-04",
        location: "Centaurus Constellation",
        distance: "8,000 light-years",
        source: "Chandra X-ray Observatory",
        telescope: "Chandra"
      },
      {
        id: 'star5',
        title: "Neutron Star Pulsar",
        description: "The ultra-dense remnant of a massive star, spinning hundreds of times per second and generating powerful magnetic fields.",
        url: "/images/stars/neutron-star.jpg",
        thumbnail: "/images/stars/thumbs/neutron-star-thumb.jpg",
        date: "2024-06-05",
        location: "Vela Constellation",
        distance: "1,000 light-years",
        source: "Chandra X-ray Observatory",
        telescope: "Chandra"
      },
      {
        id: 'star6',
        title: "Red Giant Star",
        description: "An aging star that has expanded to enormous size, beginning its final transformation in the stellar lifecycle.",
        url: "/images/stars/red-giant.jpg",
        thumbnail: "/images/stars/thumbs/red-giant-thumb.jpg",
        date: "2024-06-06",
        location: "Various Constellations",
        distance: "2,000 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'star7',
        title: "Star Formation Region",
        description: "A stellar nursery where gravity collapses gas and dust to birth new stars, illuminating the surrounding cosmic clouds.",
        url: "/images/stars/star-formation.jpg",
        thumbnail: "/images/stars/thumbs/star-formation-thumb.jpg",
        date: "2024-06-07",
        location: "Carina Constellation",
        distance: "7,500 light-years",
        source: "James Webb Space Telescope",
        telescope: "JWST"
      },
      {
        id: 'star8',
        title: "Massive Star Cluster",
        description: "Thousands of young, hot stars born from the same cosmic cloud, creating a brilliant jewel box in space.",
        url: "/images/stars/star-cluster.jpg",
        thumbnail: "/images/stars/thumbs/star-cluster-thumb.jpg",
        date: "2024-06-08",
        location: "Dorado Constellation",
        distance: "170,000 light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'star9',
        title: "Variable Star Pulsation",
        description: "A star that changes its brightness over time, pulsating like a cosmic heartbeat and helping astronomers measure distances.",
        url: "/images/stars/variable-star.jpg",
        thumbnail: "/images/stars/thumbs/variable-star-thumb.jpg",
        date: "2024-06-09",
        location: "Cepheus Constellation",
        distance: "2,500 light-years",
        source: "Kepler Space Telescope",
        telescope: "Kepler"
      }
    ],
    blackholes: [
      {
        id: 'bh1',
        title: "Sagittarius A* Black Hole",
        description: "The supermassive black hole at the center of our galaxy, with a mass 4 million times our Sun, recently imaged for the first time.",
        url: "/images/blackholes/sagittarius-a.jpg",
        thumbnail: "/images/blackholes/thumbs/sagittarius-a-thumb.jpg",
        date: "2024-06-01",
        location: "Galactic Center",
        distance: "26,000 light-years",
        source: "Event Horizon Telescope",
        telescope: "EHT"
      },
      {
        id: 'bh2',
        title: "M87* Black Hole",
        description: "The first black hole ever directly imaged, a supermassive giant in the galaxy M87 with jets extending thousands of light-years.",
        url: "/images/blackholes/m87-black-hole.jpg",
        thumbnail: "/images/blackholes/thumbs/m87-black-hole-thumb.jpg",
        date: "2024-06-02",
        location: "Virgo Constellation",
        distance: "53 million light-years",
        source: "Event Horizon Telescope",
        telescope: "EHT"
      },
      {
        id: 'bh3',
        title: "Black Hole Accretion Disk",
        description: "Matter spiraling into a black hole, heated to millions of degrees and glowing brilliantly before crossing the event horizon.",
        url: "/images/blackholes/accretion-disk.jpg",
        thumbnail: "/images/blackholes/thumbs/accretion-disk-thumb.jpg",
        date: "2024-06-03",
        location: "Various Galaxies",
        distance: "100 million light-years",
        source: "Chandra X-ray Observatory",
        telescope: "Chandra"
      },
      {
        id: 'bh4',
        title: "Stellar Mass Black Hole",
        description: "The remnant of a massive star that collapsed under its own gravity, warping spacetime around it in Einstein's predicted way.",
        url: "/images/blackholes/stellar-black-hole.jpg",
        thumbnail: "/images/blackholes/thumbs/stellar-black-hole-thumb.jpg",
        date: "2024-06-04",
        location: "Cygnus Constellation",
        distance: "6,000 light-years",
        source: "Chandra X-ray Observatory",
        telescope: "Chandra"
      },
      {
        id: 'bh5',
        title: "Gravitational Lensing",
        description: "A black hole's immense gravity bending light from background galaxies, creating multiple distorted images like a cosmic magnifying glass.",
        url: "/images/blackholes/gravitational-lensing.jpg",
        thumbnail: "/images/blackholes/thumbs/gravitational-lensing-thumb.jpg",
        date: "2024-06-05",
        location: "Deep Space",
        distance: "5 billion light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'bh6',
        title: "Quasar Powered by Black Hole",
        description: "An extremely luminous active galactic nucleus powered by a supermassive black hole consuming matter at prodigious rates.",
        url: "/images/blackholes/quasar.jpg",
        thumbnail: "/images/blackholes/thumbs/quasar-thumb.jpg",
        date: "2024-06-06",
        location: "Distant Universe",
        distance: "12 billion light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'bh7',
        title: "Black Hole Jets",
        description: "Powerful jets of particles accelerated to near light speed by a supermassive black hole's magnetic field, extending across vast distances.",
        url: "/images/blackholes/black-hole-jets.jpg",
        thumbnail: "/images/blackholes/thumbs/black-hole-jets-thumb.jpg",
        date: "2024-06-07",
        location: "Centaurus A Galaxy",
        distance: "13 million light-years",
        source: "Chandra X-ray Observatory",
        telescope: "Chandra"
      },
      {
        id: 'bh8',
        title: "Binary Black Hole System",
        description: "Two black holes orbiting each other, generating gravitational waves that ripple through spacetime itself.",
        url: "/images/blackholes/binary-black-holes.jpg",
        thumbnail: "/images/blackholes/thumbs/binary-black-holes-thumb.jpg",
        date: "2024-06-08",
        location: "Distant Galaxy",
        distance: "1.3 billion light-years",
        source: "LIGO Observatory",
        telescope: "LIGO"
      },
      {
        id: 'bh9',
        title: "Intermediate Black Hole",
        description: "A rare intermediate-mass black hole, filling the gap between stellar-mass and supermassive black holes in our understanding.",
        url: "/images/blackholes/intermediate-bh.jpg",
        thumbnail: "/images/blackholes/thumbs/intermediate-bh-thumb.jpg",
        date: "2024-06-09",
        location: "Globular Cluster",
        distance: "25,000 light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      }
    ],
    planets: [
      {
        id: 'planet1',
        title: "Mars - The Red Planet",
        description: "A world of ancient riverbeds and towering volcanoes, Mars holds secrets of past water flows and potential signs of life.",
        url: "/images/planets/mars.jpg",
        thumbnail: "/images/planets/thumbs/mars-thumb.jpg",
        date: "2024-06-01",
        location: "Mars",
        distance: "225 million km",
        source: "NASA JPL",
        telescope: "Mars Reconnaissance Orbiter"
      },
      {
        id: 'planet2',
        title: "Jupiter's Great Red Spot",
        description: "A storm larger than Earth that has been raging for centuries, showcasing the dynamic atmospheric power of the gas giant.",
        url: "/images/planets/jupiter-red-spot.jpg",
        thumbnail: "/images/planets/thumbs/jupiter-red-spot-thumb.jpg",
        date: "2024-06-02",
        location: "Jupiter",
        distance: "628 million km",
        source: "NASA JPL",
        telescope: "Juno Spacecraft"
      },
      {
        id: 'planet3',
        title: "Saturn's Hexagonal Storm",
        description: "A mysterious six-sided storm at Saturn's north pole, a unique geometric pattern unprecedented in our solar system.",
        url: "/images/planets/saturn-hexagon.jpg",
        thumbnail: "/images/planets/thumbs/saturn-hexagon-thumb.jpg",
        date: "2024-06-03",
        location: "Saturn",
        distance: "1.35 billion km",
        source: "NASA JPL",
        telescope: "Cassini Spacecraft"
      },
      {
        id: 'planet4',
        title: "Venus Surface Radar",
        description: "Piercing through Venus's thick atmosphere to reveal a hellish world of volcanoes and impact craters beneath the clouds.",
        url: "/images/planets/venus-surface.jpg",
        thumbnail: "/images/planets/thumbs/venus-surface-thumb.jpg",
        date: "2024-06-04",
        location: "Venus",
        distance: "108 million km",
        source: "NASA JPL",
        telescope: "Magellan Spacecraft"
      },
      {
        id: 'planet5',
        title: "Europa's Icy Surface",
        description: "Jupiter's moon Europa with its cracked ice shell hiding a subsurface ocean that may harbor life in the darkness below.",
        url: "/images/planets/europa.jpg",
        thumbnail: "/images/planets/thumbs/europa-thumb.jpg",
        date: "2024-06-05",
        location: "Europa (Jupiter's Moon)",
        distance: "628 million km",
        source: "NASA JPL",
        telescope: "Galileo Spacecraft"
      },
      {
        id: 'planet6',
        title: "Titan's Methane Lakes",
        description: "Saturn's largest moon featuring lakes and rivers of liquid methane, the only other world with stable surface liquids.",
        url: "/images/planets/titan-lakes.jpg",
        thumbnail: "/images/planets/thumbs/titan-lakes-thumb.jpg",
        date: "2024-06-06",
        location: "Titan (Saturn's Moon)",
        distance: "1.35 billion km",
        source: "NASA JPL",
        telescope: "Cassini Spacecraft"
      },
      {
        id: 'planet7',
        title: "Enceladus Water Geysers",
        description: "Ice geysers erupting from the south pole of Saturn's moon Enceladus, evidence of a warm subsurface ocean.",
        url: "/images/planets/enceladus.jpg",
        thumbnail: "/images/planets/thumbs/enceladus-thumb.jpg",
        date: "2024-06-07",
        location: "Enceladus (Saturn's Moon)",
        distance: "1.35 billion km",
        source: "NASA JPL",
        telescope: "Cassini Spacecraft"
      },
      {
        id: 'planet8',
        title: "Pluto's Heart",
        description: "The heart-shaped nitrogen plain on Pluto's surface, revealed in stunning detail by humanity's first close-up visit to the dwarf planet.",
        url: "/images/planets/pluto.jpg",
        thumbnail: "/images/planets/thumbs/pluto-thumb.jpg",
        date: "2024-06-08",
        location: "Pluto",
        distance: "5.9 billion km",
        source: "NASA JPL",
        telescope: "New Horizons Spacecraft"
      },
      {
        id: 'planet9',
        title: "Exoplanet Transit",
        description: "An artist's concept of an exoplanet passing in front of its star, the method by which we discover new worlds beyond our solar system.",
        url: "/images/planets/exoplanet.jpg",
        thumbnail: "/images/planets/thumbs/exoplanet-thumb.jpg",
        date: "2024-06-09",
        location: "Distant Star System",
        distance: "100+ light-years",
        source: "Kepler Space Telescope",
        telescope: "Kepler"
      }
    ],
    nebulae: [
      {
        id: 'nebula1',
        title: "Eagle Nebula Pillars",
        description: "The iconic Pillars of Creation, towering columns of gas and dust where new stars are sculpted by stellar winds.",
        url: "/images/nebulae/eagle-nebula.jpg",
        thumbnail: "/images/nebulae/thumbs/eagle-nebula-thumb.jpg",
        date: "2024-06-01",
        location: "Serpens Constellation",
        distance: "7,000 light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'nebula2',
        title: "Rosette Nebula",
        description: "A stellar nursery resembling a cosmic rose, with hot young stars carving out a cavity in the surrounding gas clouds.",
        url: "/images/nebulae/rosette-nebula.jpg",
        thumbnail: "/images/nebulae/thumbs/rosette-nebula-thumb.jpg",
        date: "2024-06-02",
        location: "Monoceros Constellation",
        distance: "5,200 light-years",
        source: "Spitzer Space Telescope",
        telescope: "Spitzer"
      },
      {
        id: 'nebula3',
        title: "Cat's Eye Nebula",
        description: "A complex planetary nebula with intricate knots and jets created by a dying star's final gasps.",
        url: "/images/nebulae/cats-eye.jpg",
        thumbnail: "/images/nebulae/thumbs/cats-eye-thumb.jpg",
        date: "2024-06-03",
        location: "Draco Constellation",
        distance: "3,300 light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'nebula4',
        title: "Helix Nebula",
        description: "The Eye of God, a planetary nebula created by a dying star expelling its outer layers in brilliant colors.",
        url: "/images/nebulae/helix-nebula.jpg",
        thumbnail: "/images/nebulae/thumbs/helix-nebula-thumb.jpg",
        date: "2024-06-04",
        location: "Aquarius Constellation",
        distance: "650 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'nebula5',
        title: "Veil Nebula",
        description: "The wispy remnants of a massive star that exploded as a supernova 8,000 years ago, creating delicate filamentary structures.",
        url: "/images/nebulae/veil-nebula.jpg",
        thumbnail: "/images/nebulae/thumbs/veil-nebula-thumb.jpg",
        date: "2024-06-05",
        location: "Cygnus Constellation",
        distance: "2,100 light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'nebula6',
        title: "Ring Nebula",
        description: "A perfect cosmic ring formed by a dying star shedding its outer atmosphere in symmetrical shells of glowing gas.",
        url: "/images/nebulae/ring-nebula.jpg",
        thumbnail: "/images/nebulae/thumbs/ring-nebula-thumb.jpg",
        date: "2024-06-06",
        location: "Lyra Constellation",
        distance: "2,300 light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'nebula7',
        title: "Lagoon Nebula",
        description: "A bright emission nebula visible to the naked eye, showcasing active star formation in pink and blue hydrogen clouds.",
        url: "/images/nebulae/lagoon-nebula.jpg",
        thumbnail: "/images/nebulae/thumbs/lagoon-nebula-thumb.jpg",
        date: "2024-06-07",
        location: "Sagittarius Constellation",
        distance: "4,100 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'nebula8',
        title: "Cone Nebula",
        description: "A dark cone-shaped pillar of gas and dust silhouetted against bright background emission, sculpted by stellar winds.",
        url: "/images/nebulae/cone-nebula.jpg",
        thumbnail: "/images/nebulae/thumbs/cone-nebula-thumb.jpg",
        date: "2024-06-08",
        location: "Monoceros Constellation",
        distance: "2,700 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'nebula9',
        title: "Horsehead Nebula",
        description: "The most famous dark nebula, a silhouette of cosmic dust against the bright emission nebula behind it.",
        url: "/images/nebulae/horsehead-nebula.jpg",
        thumbnail: "/images/nebulae/thumbs/horsehead-nebula-thumb.jpg",
        date: "2024-06-09",
        location: "Orion Constellation",
        distance: "1,500 light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      }
    ],
    galaxies: [
      {
        id: 'galaxy1',
        title: "Whirlpool Galaxy",
        description: "A grand design spiral galaxy with perfect spiral arms, interacting with a smaller companion galaxy in a cosmic dance.",
        url: "/images/galaxies/whirlpool.jpg",
        thumbnail: "/images/galaxies/thumbs/whirlpool-thumb.jpg",
        date: "2024-06-01",
        location: "Canes Venatici",
        distance: "23 million light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'galaxy2',
        title: "Sombrero Galaxy",
        description: "A lenticular galaxy with a prominent dust lane resembling a Mexican hat, showcasing billions of ancient stars.",
        url: "/images/galaxies/sombrero.jpg",
        thumbnail: "/images/galaxies/thumbs/sombrero-thumb.jpg",
        date: "2024-06-02",
        location: "Virgo Constellation",
        distance: "28 million light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'galaxy3',
        title: "Centaurus A",
        description: "A peculiar galaxy with a dramatic dust lane, the result of a cosmic collision between two galaxies millions of years ago.",
        url: "/images/galaxies/centaurus-a.jpg",
        thumbnail: "/images/galaxies/thumbs/centaurus-a-thumb.jpg",
        date: "2024-06-03",
        location: "Centaurus Constellation",
        distance: "13 million light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'galaxy4',
        title: "Pinwheel Galaxy",
        description: "A face-on spiral galaxy with well-defined spiral arms, one of the largest and brightest galaxies in our cosmic neighborhood.",
        url: "/images/galaxies/pinwheel.jpg",
        thumbnail: "/images/galaxies/thumbs/pinwheel-thumb.jpg",
        date: "2024-06-04",
        location: "Ursa Major",
        distance: "21 million light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'galaxy5',
        title: "Tadpole Galaxy",
        description: "A disrupted barred spiral galaxy with a long tail of stars, stretched by gravitational interaction with a smaller galaxy.",
        url: "/images/galaxies/tadpole.jpg",
        thumbnail: "/images/galaxies/thumbs/tadpole-thumb.jpg",
        date: "2024-06-05",
        location: "Draco Constellation",
        distance: "420 million light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'galaxy6',
        title: "Antennae Galaxies",
        description: "Two colliding galaxies creating a spectacular cosmic crash that triggers intense star formation in their tidal tails.",
        url: "/images/galaxies/antennae.jpg",
        thumbnail: "/images/galaxies/thumbs/antennae-thumb.jpg",
        date: "2024-06-06",
        location: "Corvus Constellation",
        distance: "45 million light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'galaxy7',
        title: "Large Magellanic Cloud",
        description: "A satellite galaxy of the Milky Way, containing the brightest star-forming region known - the Tarantula Nebula.",
        url: "/images/galaxies/lmc.jpg",
        thumbnail: "/images/galaxies/thumbs/lmc-thumb.jpg",
        date: "2024-06-07",
        location: "Southern Sky",
        distance: "160,000 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'galaxy8',
        title: "Sculptor Galaxy",
        description: "A bright spiral galaxy, the brightest member of the Sculptor Group, showcasing beautiful spiral arm structure.",
        url: "/images/galaxies/sculptor.jpg",
        thumbnail: "/images/galaxies/thumbs/sculptor-thumb.jpg",
        date: "2024-06-08",
        location: "Sculptor Constellation",
        distance: "11.4 million light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'galaxy9',
        title: "Andromeda Galaxy",
        description: "Our nearest galactic neighbor, approaching the Milky Way for a cosmic collision in 4.5 billion years.",
        url: "/images/galaxies/andromeda.jpg",
        thumbnail: "/images/galaxies/thumbs/andromeda-thumb.jpg",
        date: "2024-06-09",
        location: "Andromeda Constellation",
        distance: "2.5 million light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      }
    ],
    supernovas: [
      {
        id: 'sn1',
        title: "Supernova Remnant Cassiopeia A",
        description: "The expanding shockwave from a star that exploded 350 years ago, now creating a beautiful bubble of hot gas and heavy elements.",
        url: "/images/supernovas/cassiopeia-a.jpg",
        thumbnail: "/images/supernovas/thumbs/cassiopeia-a-thumb.jpg",
        date: "2024-06-01",
        location: "Cassiopeia Constellation",
        distance: "11,000 light-years",
        source: "Chandra X-ray Observatory",
        telescope: "Chandra"
      },
      {
        id: 'sn2',
        title: "Vela Supernova Remnant",
        description: "An ancient supernova remnant that occurred about 11,000 years ago, leaving behind intricate filamentary structures.",
        url: "/images/supernovas/vela-remnant.jpg",
        thumbnail: "/images/supernovas/thumbs/vela-remnant-thumb.jpg",
        date: "2024-06-02",
        location: "Vela Constellation",
        distance: "800 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'sn3',
        title: "Kepler's Supernova",
        description: "The remnant of the last supernova seen in our galaxy, observed by Johannes Kepler in 1604 and still expanding today.",
        url: "/images/supernovas/kepler-supernova.jpg",
        thumbnail: "/images/supernovas/thumbs/kepler-supernova-thumb.jpg",
        date: "2024-06-03",
        location: "Ophiuchus Constellation",
        distance: "20,000 light-years",
        source: "Spitzer Space Telescope",
        telescope: "Spitzer"
      },
      {
        id: 'sn4',
        title: "Tycho's Supernova",
        description: "A Type Ia supernova remnant from 1572, helping astronomers understand how white dwarf stars can explode.",
        url: "/images/supernovas/tycho-supernova.jpg",
        thumbnail: "/images/supernovas/thumbs/tycho-supernova-thumb.jpg",
        date: "2024-06-04",
        location: "Cassiopeia Constellation",
        distance: "8,000 light-years",
        source: "Chandra X-ray Observatory",
        telescope: "Chandra"
      },
      {
        id: 'sn5',
        title: "Supernova 1987A",
        description: "The closest supernova in modern times, providing unprecedented detail about how massive stars die and create heavy elements.",
        url: "/images/supernovas/sn1987a.jpg",
        thumbnail: "/images/supernovas/thumbs/sn1987a-thumb.jpg",
        date: "2024-06-05",
        location: "Large Magellanic Cloud",
        distance: "160,000 light-years",
        source: "Hubble Space Telescope",
        telescope: "Hubble HST"
      },
      {
        id: 'sn6',
        title: "Puppis A Supernova",
        description: "A supernova remnant approximately 3,700 years old, showing the complex interaction between the explosion and surrounding gas.",
        url: "/images/supernovas/puppis-a.jpg",
        thumbnail: "/images/supernovas/thumbs/puppis-a-thumb.jpg",
        date: "2024-06-06",
        location: "Puppis Constellation",
        distance: "7,000 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'sn7',
        title: "G292.0+1.8 Remnant",
        description: "A young supernova remnant containing a pulsar, showing how neutron stars are born from stellar explosions.",
        url: "/images/supernovas/g292-remnant.jpg",
        thumbnail: "/images/supernovas/thumbs/g292-remnant-thumb.jpg",
        date: "2024-06-07",
        location: "Centaurus Constellation",
        distance: "20,000 light-years",
        source: "Chandra X-ray Observatory",
        telescope: "Chandra"
      },
      {
        id: 'sn8',
        title: "RCW 86 Supernova",
        description: "Possibly the remnant of a supernova recorded by Chinese astronomers in 185 AD, one of the oldest recorded stellar explosions.",
        url: "/images/supernovas/rcw86.jpg",
        thumbnail: "/images/supernovas/thumbs/rcw86-thumb.jpg",
        date: "2024-06-08",
        location: "Circinus Constellation",
        distance: "8,200 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      },
      {
        id: 'sn9',
        title: "IC 443 Jellyfish Nebula",
        description: "A supernova remnant that resembles a jellyfish, showing how stellar explosions enrich space with heavy elements.",
        url: "/images/supernovas/ic443.jpg",
        thumbnail: "/images/supernovas/thumbs/ic443-thumb.jpg",
        date: "2024-06-09",
        location: "Gemini Constellation",
        distance: "5,000 light-years",
        source: "ESO Observatory",
        telescope: "Very Large Telescope"
      }
    ]
  };

  // Daily rotation logic
  const getDailyFeatured = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    
    // Rotate through all category images and select 9
    const allCategoryImages = Object.values(allImages).flat();
    const startIndex = (dayOfYear * 9) % allCategoryImages.length;
    
    const selectedImages = [];
    for (let i = 0; i < 9; i++) {
      const index = (startIndex + i) % allCategoryImages.length;
      const image = { ...allCategoryImages[index] };
      image.id = `daily-${i + 1}`;
      image.date = today.toISOString().split('T')[0];
      image.type = 'featured';
      selectedImages.push(image);
    }
    
    return selectedImages;
  };

  // Update daily images every 24 hours
  useEffect(() => {
    const updateDailyImages = () => {
      const cachedDate = localStorage.getItem('dailyImagesDate');
      const today = new Date().toDateString();
      
      if (cachedDate !== today) {
        const newDailyImages = getDailyFeatured();
        setDailyImages(newDailyImages);
        setLastFetch(new Date().toISOString());
        
        localStorage.setItem('dailyImages', JSON.stringify(newDailyImages));
        localStorage.setItem('dailyImagesDate', today);
        localStorage.setItem('lastFetch', new Date().toISOString());
      } else {
        // Load from cache
        const cached = localStorage.getItem('dailyImages');
        if (cached) {
          setDailyImages(JSON.parse(cached));
          setLastFetch(localStorage.getItem('lastFetch'));
        }
      }
    };

    updateDailyImages();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fixed currentImages calculation with better debugging
  const currentImages = useMemo(() => {
    console.log('=== CURRENT IMAGES CALCULATION ===');
    console.log('Active Category:', activeCategory);
    console.log('All Images Keys:', Object.keys(allImages));
    console.log('Daily Images Length:', dailyImages.length);
    
    if (activeCategory === 'daily') {
      const result = dailyImages.length > 0 ? dailyImages : getDailyFeatured();
      console.log('Returning Daily Images:', result.length);
      return result;
    }
    
    const result = allImages[activeCategory] || [];
    console.log(`Images for ${activeCategory}:`, result.length);
    console.log('First image:', result[0]);
    return result;
  }, [activeCategory, dailyImages]);

  // Enhanced handleCategoryChange function with scrolling
  const handleCategoryChange = (categoryId) => {
    console.log('=== CATEGORY CHANGE ===');
    console.log('Requested Category:', categoryId);
    console.log('Current Category:', activeCategory);
    
    // Don't do anything if same category
    if (categoryId === activeCategory) {
      console.log('Same category, scrolling to gallery');
      // Just scroll to gallery if same category
      if (galleryRef.current) {
        galleryRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
      return;
    }
    
    setLoading(true);
    
    // Immediately update the active category
    setActiveCategory(categoryId);
    console.log('Category updated to:', categoryId);
    
    // Short delay for loading effect, then scroll
    setTimeout(() => {
      setLoading(false);
      
      // Scroll to gallery section
      if (galleryRef.current) {
        galleryRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 500);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  const handleRefreshDaily = () => {
    const newDailyImages = getDailyFeatured();
    setDailyImages(newDailyImages);
    setLastFetch(new Date().toISOString());
    
    localStorage.setItem('dailyImages', JSON.stringify(newDailyImages));
    localStorage.setItem('dailyImagesDate', new Date().toDateString());
    localStorage.setItem('lastFetch', new Date().toISOString());
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
        className={`image-card ${isLoaded ? 'loaded' : ''} ${image.type === 'featured' ? 'featured-card' : ''}`}
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
              src={image.thumbnail || image.url} 
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
                {image.type === 'featured' && (
                  <div className="featured-badge">
                    <span className="badge-icon">⭐</span>
                    <span className="badge-text">Featured</span>
                  </div>
                )}
                <div className="telescope-badge">
                  <span className="telescope-icon">📡</span>
                  <span className="telescope-text">{image.telescope}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-content">
            <div className="card-header">
              <h3 className="card-title">{image.title}</h3>
              <span className="card-date">{image.date}</span>
            </div>
            
            <p className="card-description">
              {image.description.length > 150 
                ? `${image.description.substring(0, 150)}...` 
                : image.description
              }
            </p>
            
            <div className="card-meta">
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span className="meta-text">{image.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📏</span>
                <span className="meta-text">{image.distance}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🔭</span>
                <span className="meta-text">{image.telescope}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📸</span>
                <span className="meta-text">{image.source}</span>
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
              {selectedImage.type === 'featured' && (
                <div className="modal-featured-badge">
                  <span className="badge-icon">⭐</span>
                  <span className="badge-text">Featured Today</span>
                </div>
              )}
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
              <div className="detail-item">
                <span className="detail-label">Telescope:</span>
                <span className="detail-value">{selectedImage.telescope}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Source:</span>
                <span className="detail-value">{selectedImage.source}</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <a 
                href={selectedImage.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hd-link"
              >
                <span className="hd-icon">🔍</span>
                View Full Resolution
              </a>
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
            
            {activeCategory === 'daily' && lastFetch && (
              <div className="last-update">
                <span className="update-icon">🔄</span>
                <span className="update-text">
                  Daily featured updated: {new Date(lastFetch).toLocaleDateString()}
                </span>
                <button className="refresh-btn" onClick={handleRefreshDaily}>
                  <span className="refresh-icon">🔄</span>
                  Refresh
                </button>
              </div>
            )}
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
            Discover the universe through different astronomical phenomena and celestial objects
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
              <span className="stat-number">{categories.length - 1}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{(categories.length - 1) * 9}</span>
              <span className="stat-label">Total Images</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">HD</span>
              <span className="stat-label">Quality</span>
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

      {/* Main Gallery Section with Ref for Scrolling */}
      <section className="main-gallery" ref={galleryRef}>
        <div className="container">
          {/* Enhanced Debug info */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            color: 'white'
          }}>
            <h4>🔍 Debug Information:</h4>
            <p><strong>Active Category:</strong> {activeCategory}</p>
            <p><strong>Available Categories:</strong> {Object.keys(allImages).join(', ')}</p>
            <p><strong>Current Images Count:</strong> {currentImages.length}</p>
            <p><strong>Loading State:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>First Image Title:</strong> {currentImages[0]?.title || 'None'}</p>
            <button 
              onClick={() => console.log('Current Images:', currentImages)}
              style={{
                padding: '5px 10px',
                marginTop: '10px',
                background: '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Log Images to Console
            </button>
          </div>
          
          <div className="gallery-grid">
            {loading ? (
              <div className="gallery-loading">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading cosmic wonders...</p>
                </div>
              </div>
            ) : currentImages.length > 0 ? (
              currentImages.map((image, index) => (
                <ImageCard
                  key={`${activeCategory}-${image.id}`}
                  image={image}
                  index={index}
                />
              ))
            ) : (
              <div className="no-images" style={{
                textAlign: 'center',
                padding: '50px',
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px'
              }}>
                <h3>🌌 No images available</h3>
                <p>Category: {activeCategory}</p>
                <p>Available categories: {Object.keys(allImages).join(', ')}</p>
              </div>
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