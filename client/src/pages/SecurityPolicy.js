import React from 'react';
import { useTranslation } from 'react-i18next';
import './PageStyles.css';

function SecurityPolicy() {
  const { t, i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  return (
    <div className="page">
      <div className="page-container">
        <h1>{isGerman ? 'Sicherheitsrichtlinie' : 'Security Policy'}</h1>
        
        <p className="last-updated">{isGerman ? 'Zuletzt aktualisiert' : 'Last updated'}: 16. Oktober 2024</p>

        <section className="page-section">
          <h2>{isGerman ? 'Unsere Sicherheitsverpflichtung' : 'Our Security Commitment'}</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8' }}>
            {isGerman
              ? 'Sicherheit ist das Fundament von DIForM. Wir implementieren branchenführende Sicherheitsmaßnahmen, um Ihre Daten zu schützen und Ihre Privatsphäre zu wahren.'
              : 'Security is the foundation of DIForM. We implement industry-leading security measures to protect your data and preserve your privacy.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '🔐 Datenverschlüsselung' : '🔐 Data Encryption'}</h2>
          
          <h3>{isGerman ? 'Übertragungsverschlüsselung' : 'Encryption in Transit'}</h3>
          <ul>
            <li><strong>TLS 1.3:</strong> {isGerman ? 'Alle Datenübertragungen sind mit TLS 1.3 verschlüsselt' : 'All data transmission is encrypted with TLS 1.3'}</li>
            <li><strong>HTTPS:</strong> {isGerman ? 'Erzwungen für alle Verbindungen' : 'Enforced for all connections'}</li>
            <li><strong>Certificate Pinning:</strong> {isGerman ? 'Schutz vor Man-in-the-Middle-Angriffen' : 'Protection against man-in-the-middle attacks'}</li>
          </ul>

          <h3>{isGerman ? 'Speicherverschlüsselung' : 'Encryption at Rest'}</h3>
          <ul>
            <li><strong>AES-256:</strong> {isGerman ? 'Alle gespeicherten Daten mit AES-256 verschlüsselt' : 'All stored data encrypted with AES-256'}</li>
            <li><strong>{isGerman ? 'Datenbankverschlüsselung' : 'Database Encryption'}:</strong> MongoDB {isGerman ? 'mit nativer Verschlüsselung' : 'with native encryption'}</li>
            <li><strong>{isGerman ? 'Backup-Verschlüsselung' : 'Backup Encryption'}:</strong> {isGerman ? 'Alle Backups sind verschlüsselt' : 'All backups are encrypted'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '🔑 Zugriffskontrolle' : '🔑 Access Control'}</h2>
          
          <h3>{isGerman ? 'Authentifizierung' : 'Authentication'}</h3>
          <ul>
            <li><strong>JWT Tokens:</strong> {isGerman ? 'Sichere token-basierte Authentifizierung' : 'Secure token-based authentication'}</li>
            <li><strong>{isGerman ? 'Passwort-Hashing' : 'Password Hashing'}:</strong> bcrypt {isGerman ? 'mit 10 Runden' : 'with 10 rounds'}</li>
            <li><strong>MFA:</strong> {isGerman ? 'Multi-Faktor-Authentifizierung verfügbar' : 'Multi-factor authentication available'}</li>
            <li><strong>Session Management:</strong> {isGerman ? 'Automatische Abmeldung nach Inaktivität' : 'Automatic logout after inactivity'}</li>
          </ul>

          <h3>{isGerman ? 'Autorisierung' : 'Authorization'}</h3>
          <ul>
            <li><strong>RBAC:</strong> {isGerman ? 'Rollenbasierte Zugriffskontrolle' : 'Role-based access control'}</li>
            <li><strong>{isGerman ? 'Granulare Berechtigungen' : 'Granular Permissions'}:</strong> {isGerman ? 'Feinkörnige Zugriffskontrolle' : 'Fine-grained access control'}</li>
            <li><strong>{isGerman ? 'Datenisolation' : 'Data Isolation'}:</strong> {isGerman ? 'Strenge Trennung zwischen Mandanten' : 'Strict tenant separation'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '📝 Audit & Protokollierung' : '📝 Audit & Logging'}</h2>
          <ul>
            <li><strong>{isGerman ? 'Umfassende Logs' : 'Comprehensive Logs'}:</strong> {isGerman ? 'Alle Aktionen werden protokolliert' : 'All actions are logged'}</li>
            <li><strong>{isGerman ? 'Unveränderliche Audit-Trails' : 'Immutable Audit Trails'}:</strong> {isGerman ? 'Logs können nicht geändert werden' : 'Logs cannot be modified'}</li>
            <li><strong>{isGerman ? 'Echtzeit-Überwachung' : 'Real-time Monitoring'}:</strong> {isGerman ? 'Anomalie-Erkennung' : 'Anomaly detection'}</li>
            <li><strong>{isGerman ? 'Aufbewahrung' : 'Retention'}:</strong> {isGerman ? 'Audit-Logs für 2 Jahre gespeichert' : 'Audit logs retained for 2 years'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '🛡️ Infrastruktursicherheit' : '🛡️ Infrastructure Security'}</h2>
          
          <h3>{isGerman ? 'Cloud-Sicherheit' : 'Cloud Security'}</h3>
          <ul>
            <li><strong>{isGerman ? 'Isolierte Umgebungen' : 'Isolated Environments'}:</strong> {isGerman ? 'Getrennte Prod/Dev/Test' : 'Separate prod/dev/test'}</li>
            <li><strong>VPC:</strong> {isGerman ? 'Virtual Private Cloud-Isolation' : 'Virtual Private Cloud isolation'}</li>
            <li><strong>Firewalls:</strong> {isGerman ? 'Web Application Firewall (WAF)' : 'Web Application Firewall (WAF)'}</li>
            <li><strong>DDoS {isGerman ? 'Schutz' : 'Protection'}:</strong> {isGerman ? 'Integriert' : 'Integrated'}</li>
          </ul>

          <h3>{isGerman ? 'Netzwerksicherheit' : 'Network Security'}</h3>
          <ul>
            <li><strong>{isGerman ? 'Segmentierung' : 'Segmentation'}:</strong> {isGerman ? 'Netzwerksegmentierung nach Funktion' : 'Network segmentation by function'}</li>
            <li><strong>{isGerman ? 'Einbruchserkennung' : 'Intrusion Detection'}:</strong> IDS/IPS {isGerman ? 'aktiv' : 'active'}</li>
            <li><strong>Rate Limiting:</strong> {isGerman ? 'API-Ratenbegrenzung' : 'API rate limiting'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '🔍 Sicherheitstests' : '🔍 Security Testing'}</h2>
          <ul>
            <li><strong>Penetration Tests:</strong> {isGerman ? 'Vierteljährlich durch Dritte' : 'Quarterly by third parties'}</li>
            <li><strong>Vulnerability Scanning:</strong> {isGerman ? 'Wöchentlich automatisiert' : 'Automated weekly'}</li>
            <li><strong>Code Reviews:</strong> {isGerman ? 'Sicherheitsüberprüfungen bei jedem Commit' : 'Security reviews on every commit'}</li>
            <li><strong>Dependency Scanning:</strong> {isGerman ? 'Automatische Überprüfung von Abhängigkeiten' : 'Automated dependency checks'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '🚨 Incident Response' : '🚨 Incident Response'}</h2>
          
          <h3>{isGerman ? 'Reaktionsplan' : 'Response Plan'}</h3>
          <ul>
            <li><strong>24/7 {isGerman ? 'Überwachung' : 'Monitoring'}:</strong> {isGerman ? 'Ständige Sicherheitsüberwachung' : 'Continuous security monitoring'}</li>
            <li><strong>{isGerman ? 'Schnelle Reaktion' : 'Rapid Response'}:</strong> {isGerman ? 'Engagiertes Sicherheitsteam' : 'Dedicated security team'}</li>
            <li><strong>{isGerman ? 'Benachrichtigung' : 'Notification'}:</strong> {isGerman ? 'Betroffene Nutzer werden innerhalb von 72h informiert' : 'Affected users notified within 72h'}</li>
            <li><strong>{isGerman ? 'Transparenz' : 'Transparency'}:</strong> {isGerman ? 'Öffentliche Security Advisories' : 'Public security advisories'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '🏢 Organisatorische Sicherheit' : '🏢 Organizational Security'}</h2>
          <ul>
            <li><strong>{isGerman ? 'Mitarbeiter-Screening' : 'Employee Screening'}:</strong> {isGerman ? 'Hintergrundprüfungen' : 'Background checks'}</li>
            <li><strong>{isGerman ? 'Sicherheitsschulungen' : 'Security Training'}:</strong> {isGerman ? 'Regelmäßige Schulungen für alle' : 'Regular training for all'}</li>
            <li><strong>NDAs:</strong> {isGerman ? 'Alle Mitarbeiter unter Verschwiegenheitspflicht' : 'All employees under confidentiality'}</li>
            <li><strong>{isGerman ? 'Zugriffsprinzip' : 'Least Privilege'}:</strong> {isGerman ? 'Minimale notwendige Berechtigungen' : 'Minimum necessary permissions'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '📋 Zertifizierungen & Standards' : '📋 Certifications & Standards'}</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔐 ISO 27001</h3>
              <p>{isGerman ? 'Informationssicherheits-Management' : 'Information Security Management'}</p>
              <span style={{color: '#10B981', fontWeight: 600}}>{isGerman ? '(In Vorbereitung)' : '(In Progress)'}</span>
            </div>
            <div className="feature-card">
              <h3>🇪🇺 DSGVO</h3>
              <p>{isGerman ? 'EU Datenschutz-Grundverordnung' : 'EU General Data Protection Regulation'}</p>
              <span style={{color: '#10B981', fontWeight: 600}}>✓ {isGerman ? 'Konform' : 'Compliant'}</span>
            </div>
            <div className="feature-card">
              <h3>🛡️ SOC 2</h3>
              <p>{isGerman ? 'Service Organization Control' : 'Service Organization Control'}</p>
              <span style={{color: '#10B981', fontWeight: 600}}>{isGerman ? '(In Vorbereitung)' : '(In Progress)'}</span>
            </div>
            <div className="feature-card">
              <h3>🏥 HIPAA</h3>
              <p>{isGerman ? 'Health Insurance Portability' : 'Health Insurance Portability'}</p>
              <span style={{color: '#FCD34D', fontWeight: 600}}>{isGerman ? '(Geplant)' : '(Planned)'}</span>
            </div>
          </div>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '⚠️ Sicherheitslücken melden' : '⚠️ Report Security Issues'}</h2>
          <p>
            {isGerman
              ? 'Wenn Sie ein Sicherheitsproblem entdecken, kontaktieren Sie uns bitte sofort:'
              : 'If you discover a security issue, please contact us immediately:'
            }
          </p>
          <div style={{ background: '#FEF3C7', padding: '24px', borderRadius: '8px', marginTop: '16px' }}>
            <p style={{ margin: 0 }}>
              <strong>📧 Security Team:</strong> <a href="mailto:security@diform.example.com">security@diform.example.com</a><br/>
              <strong>🔒 PGP Key:</strong> <a href="/pgp-key.txt" target="_blank">Download</a><br/>
              <strong>💰 Bug Bounty:</strong> {isGerman ? 'Verfügbar für ernsthafte Schwachstellen' : 'Available for critical vulnerabilities'}
            </p>
          </div>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '📞 Kontakt' : '📞 Contact'}</h2>
          <p>
            {isGerman ? 'Fragen zur Sicherheit?' : 'Security questions?'}<br/>
            📧 security@diform.example.com<br/>
            📧 privacy@diform.example.com
          </p>
        </section>
      </div>
    </div>
  );
}

export default SecurityPolicy;
