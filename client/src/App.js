import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import Architecture from './components/Architecture';
import Security from './components/Security';
import Demo from './components/Demo';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="App">
      <Navigation onDemoClick={() => setShowDemo(true)} />
      <Hero onTryDemo={() => setShowDemo(true)} />
      <Features />
      <Architecture />
      <Demo isOpen={showDemo} onClose={() => setShowDemo(false)} />
      <Security />
      <Footer />
    </div>
  );
}

export default App;
