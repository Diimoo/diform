import React from 'react';
import './PageStyles.css';

function About() {
  return (
    <div className="page">
      <div className="page-container">
        <h1>Über DIForM</h1>
        
        <section className="page-section">
          <h2>Unsere Mission</h2>
          <p>
            DIForM steht für "Digital Initiative For Optimized Management" - eine Vision, 
            Unternehmensproduktivität durch intelligente Automatisierung zu transformieren.
          </p>
          <p>
            Wir glauben, dass KI nicht nur assistieren, sondern tatsächlich Arbeit erledigen sollte. 
            Keine endlosen Konversationen, kein ständiges Nachfragen - nur Ergebnisse.
          </p>
        </section>

        <section className="page-section">
          <h2>Was uns auszeichnet</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🎯 Autonome Ausführung</h3>
              <p>DIForM versteht Kontext, plant Schritte und führt sie aus - komplett autonom.</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Sicherheit zuerst</h3>
              <p>Enterprise-Grade Sicherheit mit Ende-zu-Ende-Verschlüsselung und umfassenden Audit-Logs.</p>
            </div>
            <div className="feature-card">
              <h3>💻 Multi-Plattform</h3>
              <p>Web, Desktop (Electron) und Mobile (React Native) - arbeiten Sie von überall.</p>
            </div>
            <div className="feature-card">
              <h3>🏠 Lokale KI</h3>
              <p>Ihre Daten bleiben auf Ihrer Infrastruktur mit Ollama-Integration.</p>
            </div>
          </div>
        </section>

        <section className="page-section">
          <h2>Unsere Werte</h2>
          <ul className="values-list">
            <li><strong>Transparenz:</strong> Vollständige Nachverfolgbarkeit jeder Aktion</li>
            <li><strong>Sicherheit:</strong> Kompromisslose Sicherheit für Unternehmensdaten</li>
            <li><strong>Innovation:</strong> Modernste KI-Technologie für reale Probleme</li>
            <li><strong>Zuverlässigkeit:</strong> Produktionsreife Lösungen, auf die Sie sich verlassen können</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Technologie</h2>
          <p>DIForM basiert auf modernsten Technologien:</p>
          <ul>
            <li><strong>Backend:</strong> Node.js, Express, MongoDB</li>
            <li><strong>Frontend:</strong> React 18, Framer Motion</li>
            <li><strong>Desktop:</strong> Electron mit Microsoft Graph Integration</li>
            <li><strong>Mobile:</strong> React Native</li>
            <li><strong>KI:</strong> Ollama (lokal), GPT-Kompatibilität</li>
            <li><strong>Infrastruktur:</strong> Docker, PM2, Redis, Prometheus</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Open Source</h2>
          <p>
            DIForM ist Open Source und wird aktiv weiterentwickelt. 
            Wir glauben an die Kraft der Community und freuen uns über Beiträge.
          </p>
          <a href="https://github.com/yourusername/diform" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Auf GitHub ansehen
          </a>
        </section>

        <section className="page-section">
          <h2>Kontakt</h2>
          <p>Haben Sie Fragen oder möchten Sie mit uns zusammenarbeiten?</p>
          <p>
            📧 E-Mail: <a href="mailto:contact@diform.example.com">contact@diform.example.com</a><br/>
            💼 LinkedIn: <a href="https://linkedin.com/company/diform" target="_blank" rel="noopener noreferrer">linkedin.com/company/diform</a><br/>
            🐦 Twitter: <a href="https://twitter.com/diform" target="_blank" rel="noopener noreferrer">@diform</a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
