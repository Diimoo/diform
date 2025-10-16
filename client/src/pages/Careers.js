import React from 'react';
import { useTranslation } from 'react-i18next';
import './PageStyles.css';

function Careers() {
  const { t, i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  const jobs = [
    {
      id: 1,
      title: isGerman ? 'Senior Full-Stack Entwickler' : 'Senior Full-Stack Developer',
      department: isGerman ? 'Engineering' : 'Engineering',
      location: isGerman ? 'Berlin / Remote' : 'Berlin / Remote',
      type: isGerman ? 'Vollzeit' : 'Full-time',
      description: isGerman
        ? 'Entwickle innovative Features für unsere autonome KI-Plattform. Node.js, React, MongoDB.'
        : 'Build innovative features for our autonomous AI platform. Node.js, React, MongoDB.'
    },
    {
      id: 2,
      title: isGerman ? 'KI/ML Engineer' : 'AI/ML Engineer',
      department: isGerman ? 'KI-Forschung' : 'AI Research',
      location: isGerman ? 'München / Remote' : 'Munich / Remote',
      type: isGerman ? 'Vollzeit' : 'Full-time',
      description: isGerman
        ? 'Arbeite an fortschrittlichen ML-Modellen für autonome Workflow-Ausführung. Python, PyTorch, LLMs.'
        : 'Work on advanced ML models for autonomous workflow execution. Python, PyTorch, LLMs.'
    },
    {
      id: 3,
      title: isGerman ? 'Product Designer' : 'Product Designer',
      department: isGerman ? 'Design' : 'Design',
      location: isGerman ? 'Remote' : 'Remote',
      type: isGerman ? 'Vollzeit' : 'Full-time',
      description: isGerman
        ? 'Gestalte intuitive Benutzererlebnisse für komplexe KI-Workflows. Figma, User Research.'
        : 'Design intuitive user experiences for complex AI workflows. Figma, User Research.'
    },
    {
      id: 4,
      title: isGerman ? 'DevOps Engineer' : 'DevOps Engineer',
      department: isGerman ? 'Infrastructure' : 'Infrastructure',
      location: isGerman ? 'Frankfurt / Remote' : 'Frankfurt / Remote',
      type: isGerman ? 'Vollzeit' : 'Full-time',
      description: isGerman
        ? 'Baue und skaliere unsere Cloud-Infrastruktur. Docker, Kubernetes, AWS/Azure.'
        : 'Build and scale our cloud infrastructure. Docker, Kubernetes, AWS/Azure.'
    }
  ];

  const benefits = [
    {
      icon: '💰',
      title: isGerman ? 'Wettbewerbsfähiges Gehalt' : 'Competitive Salary',
      description: isGerman ? 'Top-Marktgehälter + Equity' : 'Top market salaries + equity'
    },
    {
      icon: '🏠',
      title: isGerman ? 'Remote-First' : 'Remote-First',
      description: isGerman ? 'Arbeite von überall' : 'Work from anywhere'
    },
    {
      icon: '🌴',
      title: isGerman ? 'Flexibler Urlaub' : 'Flexible Time Off',
      description: isGerman ? '30 Tage + Feiertage' : '30 days + holidays'
    },
    {
      icon: '📚',
      title: isGerman ? 'Weiterbildung' : 'Learning Budget',
      description: isGerman ? '2.000€/Jahr Budget' : '€2,000/year budget'
    },
    {
      icon: '💻',
      title: isGerman ? 'Top-Ausstattung' : 'Top Equipment',
      description: isGerman ? 'MacBook Pro + Setup' : 'MacBook Pro + setup'
    },
    {
      icon: '🏥',
      title: isGerman ? 'Krankenversicherung' : 'Health Insurance',
      description: isGerman ? 'Premium-Absicherung' : 'Premium coverage'
    }
  ];

  return (
    <div className="page">
      <div className="page-container">
        <h1>{isGerman ? 'Karriere bei DIForM' : 'Careers at DIForM'}</h1>
        
        <section className="page-section">
          <h2>{isGerman ? 'Gestalte die Zukunft der Arbeit mit' : 'Shape the Future of Work'}</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8' }}>
            {isGerman
              ? 'Bei DIForM bauen wir die nächste Generation von KI-Tools, die nicht nur assistieren, sondern tatsächlich Arbeit erledigen. Wir suchen talentierte und leidenschaftliche Menschen, die mit uns diese Vision verwirklichen wollen.'
              : 'At DIForM, we\'re building the next generation of AI tools that don\'t just assist but actually get work done. We\'re looking for talented and passionate people to help us realize this vision.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Unsere Werte' : 'Our Values'}</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🚀 {isGerman ? 'Innovation' : 'Innovation'}</h3>
              <p>{isGerman ? 'Wir denken groß und experimentieren mutig' : 'We think big and experiment boldly'}</p>
            </div>
            <div className="feature-card">
              <h3>🤝 {isGerman ? 'Zusammenarbeit' : 'Collaboration'}</h3>
              <p>{isGerman ? 'Gemeinsam erreichen wir mehr' : 'Together we achieve more'}</p>
            </div>
            <div className="feature-card">
              <h3>🎯 {isGerman ? 'Exzellenz' : 'Excellence'}</h3>
              <p>{isGerman ? 'Wir streben nach höchster Qualität' : 'We strive for the highest quality'}</p>
            </div>
            <div className="feature-card">
              <h3>🌍 {isGerman ? 'Wirkung' : 'Impact'}</h3>
              <p>{isGerman ? 'Wir wollen echten Mehrwert schaffen' : 'We want to create real value'}</p>
            </div>
          </div>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '💼 Offene Stellen' : '💼 Open Positions'}</h2>
          {jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div>
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-meta">
                    <span className="job-department">{job.department}</span>
                    <span className="job-divider">•</span>
                    <span className="job-location">📍 {job.location}</span>
                    <span className="job-divider">•</span>
                    <span className="job-type">⏰ {job.type}</span>
                  </div>
                </div>
                <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  {isGerman ? 'Bewerben' : 'Apply Now'}
                </button>
              </div>
              <p className="job-description">{job.description}</p>
            </div>
          ))}
        </section>

        <section className="page-section">
          <h2>{isGerman ? '✨ Benefits' : '✨ Benefits'}</h2>
          <div className="feature-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="feature-card">
                <h3>{benefit.icon} {benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="page-section">
          <div style={{ 
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            color: 'white',
            padding: '48px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>
              {isGerman ? 'Keine passende Stelle gefunden?' : 'Don\'t see the right role?'}
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.95 }}>
              {isGerman
                ? 'Wir sind immer auf der Suche nach talentierten Menschen. Sende uns eine Initiativbewerbung!'
                : 'We\'re always looking for talented people. Send us your application!'
              }
            </p>
            <a 
              href="mailto:careers@diform.example.com" 
              style={{
                display: 'inline-block',
                background: 'white',
                color: '#3B82F6',
                padding: '12px 32px',
                borderRadius: '9999px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {isGerman ? 'Kontakt aufnehmen' : 'Get in Touch'}
            </a>
          </div>
        </section>

        <style>{`
          .job-card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            transition: all 0.3s ease;
          }
          
          .job-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .job-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
            gap: 20px;
          }
          
          .job-title {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
          }
          
          .job-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #6B7280;
          }
          
          .job-divider {
            color: #D1D5DB;
          }
          
          .job-department {
            background: #DBEAFE;
            color: #1E40AF;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;
          }
          
          .job-description {
            color: #4B5563;
            line-height: 1.6;
            margin: 0;
          }
          
          @media (max-width: 768px) {
            .job-header {
              flex-direction: column;
            }
            
            .job-header button {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Careers;
