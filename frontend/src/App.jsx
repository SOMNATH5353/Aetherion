import React from 'react';
import Navbar from './components/Navbar';
import SpaceAnimation from './components/SpaceAnimation';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <SpaceAnimation />
      <Navbar />
    </div>
  );
};

export default App;