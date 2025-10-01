import React from 'react';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Hero.css';

function Hero({ onTryDemo }) {
  return (
    <section className="hero gradient-bg hero-pattern">
      <div className="container">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            Work Gets <span className="highlight">Done</span>
          </h1>
          <p className="hero-subtitle">
            DIForM understands context, decides the next logical step, and proactively executes it – 
            securely, traceably, auditably.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onTryDemo}>
              Try Interactive Demo
              <FiArrowRight className="btn-icon" />
            </button>
            <a href="#features" className="btn-secondary-hero">
              See How It Works
            </a>
          </div>
        </motion.div>

        <motion.div 
          className="hero-mockup"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="mockup-container">
            <div className="mockup-inner">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="mockup-prompt">
                  "Summarize the last 48h customer emails for Project X, draft responses, 
                  schedule 2 meetings next week, and update the steering deck."
                </div>
              </div>
              <div className="mockup-body">
                <div className="processing-indicator">
                  <div className="status-icon">
                    <FiCheck />
                  </div>
                  <div className="status-content">
                    <p className="status-text">DIForM is analyzing your request...</p>
                    <div className="pulse-dots">
                      <span className="pulse-dot"></span>
                      <span className="pulse-dot"></span>
                      <span className="pulse-dot"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
