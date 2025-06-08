import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SpaceAnimation from './components/SpaceAnimation';

function App() {
  return (
    <div className="App">
      {/* Space Animation Background */}
      <SpaceAnimation />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <Hero />
        
        {/* About Section - Made More Compact */}
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
        
        {/* Contact Section - Made More Compact */}
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
    </div>
  );
}

export default App;