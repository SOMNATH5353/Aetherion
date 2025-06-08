import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import SpaceAnimation from './components/SpaceAnimation';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Space Animation Background - Always Present */}
        <SpaceAnimation />
        
        {/* Navigation - Always Present */}
        <Navbar />
        
        {/* Route Content */}
        <Routes>
          {/* Home Page */}
          <Route path="/" element={
            <main className="main-content">
              {/* Hero Section */}
              <Hero />
              
              {/* About Section */}
              <section id="about" className="section">
                <div className="section-content">
                  <h2>About AETHERION</h2>
                  <p>
                    AETHERION brings you daily astronomical wonders from NASA's collection. 
                    Explore breathtaking images of galaxies, nebulae, and cosmic phenomena.
                  </p>
                  <br />
                  <p>
                    Our mission is to inspire curiosity about space by making cosmic 
                    discoveries accessible to everyone, from stargazers to astronomers.
                  </p>
                </div>
              </section>
              
              {/* Contact Section */}
              <section id="contact" className="section">
                <div className="section-content">
                  <h2>Contact Us</h2>
                  <p>
                    Questions about the cosmos? We'd love to hear from you! 
                    Reach out to our team of space enthusiasts.
                  </p>
                  <br />
                  <p>
                    <strong>Email:</strong> contact@aetherion.space<br />
                    <strong>Follow us</strong> for daily space updates and discoveries.
                  </p>
                </div>
              </section>
            </main>
          } />
          
          {/* About Page */}
          <Route path="/about" element={<About />} />
          
          {/* Gallery Page */}
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
        
        {/* Footer - Always Present */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;