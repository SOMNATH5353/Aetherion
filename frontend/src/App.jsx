import React from 'react';
import Navbar from './components/Navbar';
import Galaxy from './components/Galaxy';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Galaxy />
      <Navbar />
    </div>
  );
};

export default App;