import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">DIForM</span>
            <p className="footer-description">
              {t('footer.description')}
            </p>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">{t('footer.product')}</h4>
            <ul>
              <li><a href="#features">{t('footer.features')}</a></li>
              <li><a href="#architecture">{t('footer.architecture')}</a></li>
              <li><a href="#security">{t('footer.security')}</a></li>
              <li><Link to="/documentation">{t('footer.documentation')}</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">{t('footer.company')}</h4>
            <ul>
              <li><Link to="/about">{t('footer.about')}</Link></li>
              <li><Link to="/blog">{t('footer.blog')}</Link></li>
              <li><Link to="/careers">{t('footer.careers')}</Link></li>
              <li><Link to="/contact">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">{t('footer.legal')}</h4>
            <ul>
              <li><Link to="/privacy">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms">{t('footer.terms')}</Link></li>
              <li><Link to="/security">{t('footer.securityPolicy')}</Link></li>
              <li><Link to="/compliance">{t('footer.compliance')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
