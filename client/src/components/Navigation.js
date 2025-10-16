import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import './Navigation.css';

function Navigation({ onDemoClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

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
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>{t('nav.features')}</a>
          <a href="#architecture" onClick={() => setMobileMenuOpen(false)}>{t('nav.architecture')}</a>
          <a href="#security" onClick={() => setMobileMenuOpen(false)}>{t('nav.security')}</a>
          
          <div className="language-switcher">
            <button 
              className={`lang-btn ${i18n.language === 'de' ? 'active' : ''}`}
              onClick={() => changeLanguage('de')}
              title="Deutsch"
            >
              🇩🇪
            </button>
            <button 
              className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
              title="English"
            >
              🇬🇧
            </button>
          </div>
          
          <button 
            className="btn-demo" 
            onClick={() => {
              onDemoClick();
              setMobileMenuOpen(false);
            }}
          >
            {t('nav.tryDemo')}
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
