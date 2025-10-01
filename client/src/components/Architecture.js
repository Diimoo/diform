import React from 'react';
import { FiShield, FiZap, FiCpu, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Architecture.css';

function Architecture() {
  const steps = [
    {
      number: 1,
      title: 'Understand',
      description: 'DIForM comprehends your request in full context'
    },
    {
      number: 2,
      title: 'Plan',
      description: 'Creates an execution plan with multiple steps'
    },
    {
      number: 3,
      title: 'Execute',
      description: 'Proactively performs the required actions'
    },
    {
      number: 4,
      title: 'Verify',
      description: 'Ensures accuracy and provides audit trail'
    }
  ];

  const components = [
    { name: 'Microsoft Graph', icon: <FiShield />, color: '#3B82F6' },
    { name: 'Action Connectors', icon: <FiZap />, color: '#F59E0B' },
    { name: 'Reasoning Cache', icon: <FiCpu />, color: '#8B5CF6' },
    { name: 'Guardrails', icon: <FiLock />, color: '#EF4444' }
  ];

  return (
    <section id="architecture" className="architecture-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Enterprise-Grade Architecture</h2>
          <p className="section-subtitle">
            Built with security, compliance, and scalability at its core
          </p>
        </motion.div>

        <div className="architecture-content">
          <motion.div 
            className="arch-steps"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="arch-subtitle">How DIForM Works</h3>
            <div className="steps-list">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="step-item"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="step-number">{step.number}</div>
                  <div className="step-content">
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-description">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="arch-components"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="components-container">
              {components.map((component, index) => (
                <motion.div
                  key={index}
                  className="component-item"
                  style={{ 
                    background: `${component.color}15`,
                    borderLeft: `4px solid ${component.color}`
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <span className="component-name">{component.name}</span>
                  <div 
                    className="component-icon"
                    style={{ color: component.color }}
                  >
                    {component.icon}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Architecture;
