import React from 'react';
import { FiMail, FiFileText, FiBarChart2, FiMessageCircle, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Features.css';

function Features() {
  const features = [
    {
      icon: <FiMail />,
      title: 'Outlook Integration',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      items: [
        'Summarize email threads',
        'Draft responses with tone adjustment',
        'Auto-follow ups & scheduling'
      ]
    },
    {
      icon: <FiFileText />,
      title: 'Document Creation',
      color: '#10B981',
      bgColor: '#D1FAE5',
      items: [
        'Briefing to first draft with sources',
        'Rewrite, shorten/lengthen content',
        'Deck generation with corporate design'
      ]
    },
    {
      icon: <FiBarChart2 />,
      title: 'Data Analysis',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
      items: [
        'Natural language data queries',
        'Automatic analysis & visualization',
        'What-if scenarios & formula suggestions'
      ]
    },
    {
      icon: <FiMessageCircle />,
      title: 'Meeting Intelligence',
      color: '#6366F1',
      bgColor: '#E0E7FF',
      items: [
        'Live meeting summaries',
        'Decision & action item tracking',
        'Context-aware file & calendar integration'
      ]
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Core Experiences</h2>
          <p className="section-subtitle">
            DIForM integrates seamlessly with your everyday tools to get work done proactively
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card card-hover"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div 
                className="feature-icon"
                style={{ backgroundColor: feature.bgColor, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <ul className="feature-list">
                {feature.items.map((item, i) => (
                  <li key={i}>
                    <FiCheck className="check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
