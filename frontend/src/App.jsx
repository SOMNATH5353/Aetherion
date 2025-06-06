import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SpaceAnimation from './components/SpaceAnimation';
import './App.css';

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
        
        {/* Other sections */}
        <section id="gallery" className="section">
          <div className="section-content">
            <h2>Gallery</h2>
            <p>Explore stunning space imagery and astronomical phenomena.</p>
          </div>
        </section>
        
        <section id="about" className="section">
          <div className="section-content">
            <h2>About</h2>
            <p>Learn about our mission to bring the wonders of space to everyone.</p>
          </div>
        </section>
        
        <section id="contact" className="section">
          <div className="section-content">
            <h2>Contact</h2>
            <p>Get in touch with our team of space enthusiasts.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;