import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">DIForM</span>
            <p className="footer-description">
              Work done, not just assisted. Transforming enterprise productivity through intelligent automation.
            </p>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#architecture">Architecture</a></li>
              <li><a href="#security">Security</a></li>
              <li><a href="#">Documentation</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Legal</h4>
            <ul>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Security</a></li>
              <li><a href="#">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 DIForM. All rights reserved. Work gets done.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
