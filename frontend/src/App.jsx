import React from 'react';
import Navbar from './components/Navbar';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Navbar />
      
      {/* Simple content to demonstrate navbar functionality */}
      <main className="main-content">
        <section className="content-section">
          <div className="container">
            <h1>Welcome to Aetherion</h1>
            <p>Explore the infinite possibilities of space technology</p>
          </div>
        </section>
        
        <section className="content-section">
          <div className="container">
            <h2>Our Mission</h2>
            <p>Pushing the boundaries of space exploration and innovation</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;