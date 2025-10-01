import React from 'react';
import { FiDatabase, FiClipboard, FiShield, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Security.css';

function Security() {
  const features = [
    {
      icon: <FiDatabase />,
      title: 'Tenant-Boundary Security',
      description: 'Your data stays within your Microsoft 365 tenant boundary with no external exposure',
      color: '#3B82F6'
    },
    {
      icon: <FiClipboard />,
      title: 'Complete Audit Trail',
      description: 'Every action is logged with full context - who did what, when, and why',
      color: '#10B981'
    },
    {
      icon: <FiShield />,
      title: 'Policy Enforcement',
      description: 'Built-in compliance with DLP, sensitivity labels, and E5 security features',
      color: '#8B5CF6'
    }
  ];

  return (
    <section id="security" className="security-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title-white">Security & Compliance by Design</h2>
          <p className="section-subtitle-white">
            Enterprise-grade security built into every layer of our architecture
          </p>
        </motion.div>

        <div className="security-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="security-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div 
                className="security-icon"
                style={{ 
                  background: `${feature.color}33`,
                  color: feature.color
                }}
              >
                {feature.icon}
              </div>
              <h3 className="security-title">{feature.title}</h3>
              <p className="security-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="security-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="#" className="security-link">
            Learn more about our security framework
            <FiArrowRight className="link-icon" />
          </a>
        </motion.div>

        <motion.div 
          className="cta-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="cta-title">Ready to Get Work Done?</h2>
          <p className="cta-subtitle">
            Join forward-thinking enterprises that are transforming productivity with DIForM
          </p>
          <div className="cta-buttons">
            <button className="btn-primary">Start Free Trial</button>
            <button className="btn-secondary-white">Schedule Demo</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Security;
