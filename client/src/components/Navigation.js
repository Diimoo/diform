import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import './Navigation.css';

function Navigation({ onDemoClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navigation ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <div className="nav-brand">
          <span className="brand-name">DIForM</span>
          <span className="brand-tagline">Work Done, Not Just Assisted</span>
        </div>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#architecture" onClick={() => setMobileMenuOpen(false)}>Architecture</a>
          <a href="#security" onClick={() => setMobileMenuOpen(false)}>Security</a>
          <button 
            className="btn-demo" 
            onClick={() => {
              onDemoClick();
              setMobileMenuOpen(false);
            }}
          >
            Try Demo
          </button>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
