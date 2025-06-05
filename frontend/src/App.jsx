import React from 'react';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', padding: '20px' }}>
        <h2>Welcome to Aetherion</h2>
        <p>Explore the cosmos with our AI-powered astronomy image analyzer.</p>
      </div>
    </>
  );
};

export default App;
