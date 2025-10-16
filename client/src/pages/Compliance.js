import React from 'react';
import { useTranslation } from 'react-i18next';
import './PageStyles.css';

function Compliance() {
  const { t, i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  return (
    <div className="page">
      <div className="page-container">
        <h1>Compliance</h1>
        
        <p className="last-updated">{isGerman ? 'Zuletzt aktualisiert' : 'Last updated'}: 16. Oktober 2024</p>

        <section className="page-section">
          <h2>{isGerman ? 'Unser Compliance-Engagement' : 'Our Compliance Commitment'}</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.8' }}>
            {isGerman
              ? 'DIForM verpflichtet sich zur Einhaltung aller geltenden Gesetze, Vorschriften und branchenspezifischen Standards. Wir implementieren robuste Compliance-Maßnahmen, um Vertrauen und Transparenz zu gewährleisten.'
              : 'DIForM is committed to complying with all applicable laws, regulations, and industry standards. We implement robust compliance measures to ensure trust and transparency.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>🇪🇺 DSGVO / GDPR</h2>
          <p>
            <strong>{isGerman ? 'Status:' : 'Status:'}</strong> <span style={{color: '#10B981', fontWeight: 600}}>✓ {isGerman ? 'Konform' : 'Compliant'}</span>
          </p>
          
          <h3>{isGerman ? 'Schlüsselmaßnahmen' : 'Key Measures'}</h3>
          <ul>
            <li><strong>{isGerman ? 'Datenschutzbeauftragter' : 'Data Protection Officer'}:</strong> {isGerman ? 'Ernannt und erreichbar' : 'Appointed and accessible'}</li>
            <li><strong>{isGerman ? 'Rechtsgrundlagen' : 'Legal Bases'}:</strong> {isGerman ? 'Klar dokumentiert für alle Verarbeitungen' : 'Clearly documented for all processing'}</li>
            <li><strong>{isGerman ? 'Betroffenenrechte' : 'Data Subject Rights'}:</strong> {isGerman ? 'Vollständig implementiert (Zugang, Löschung, Portabilität, etc.)' : 'Fully implemented (access, erasure, portability, etc.)'}</li>
            <li><strong>{isGerman ? 'Datenschutz-Folgenabschätzung' : 'Data Protection Impact Assessment'}:</strong> {isGerman ? 'Durchgeführt für Hochrisiko-Verarbeitungen' : 'Conducted for high-risk processing'}</li>
            <li><strong>{isGerman ? 'Breach Notification' : 'Breach Notification'}:</strong> {isGerman ? '72-Stunden-Meldeprozess etabliert' : '72-hour notification process established'}</li>
            <li><strong>{isGerman ? 'Datenübertragungen' : 'Data Transfers'}:</strong> {isGerman ? 'Standard-Vertragsklauseln (SCCs) für internationale Transfers' : 'Standard Contractual Clauses (SCCs) for international transfers'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>🇺🇸 CCPA - California Consumer Privacy Act</h2>
          <p>
            <strong>{isGerman ? 'Status:' : 'Status:'}</strong> <span style={{color: '#10B981', fontWeight: 600}}>✓ {isGerman ? 'Konform' : 'Compliant'}</span>
          </p>
          
          <h3>{isGerman ? 'Verbraucherrechte' : 'Consumer Rights'}</h3>
          <ul>
            <li>✅ {isGerman ? 'Recht auf Kenntnis (welche Daten gesammelt werden)' : 'Right to know (what data is collected)'}</li>
            <li>✅ {isGerman ? 'Recht auf Löschung' : 'Right to delete'}</li>
            <li>✅ {isGerman ? 'Recht auf Opt-out (Datenverkauf)' : 'Right to opt-out (data sale)'}</li>
            <li>✅ {isGerman ? 'Recht auf Nicht-Diskriminierung' : 'Right to non-discrimination'}</li>
          </ul>
          <p><strong>{isGerman ? 'Hinweis:' : 'Note:'}</strong> {isGerman ? 'Wir verkaufen Ihre Daten NICHT.' : 'We do NOT sell your data.'}</p>
        </section>

        <section className="page-section">
          <h2>🏥 HIPAA - Health Insurance Portability (Geplant)</h2>
          <p>
            <strong>{isGerman ? 'Status:' : 'Status:'}</strong> <span style={{color: '#FCD34D', fontWeight: 600}}>{isGerman ? 'In Planung für 2025' : 'Planned for 2025'}</span>
          </p>
          <p>
            {isGerman
              ? 'Für Healthcare-Kunden planen wir HIPAA-Compliance, einschließlich Business Associate Agreements (BAAs).'
              : 'For healthcare customers, we are planning HIPAA compliance, including Business Associate Agreements (BAAs).'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>🔐 SOC 2 Type II</h2>
          <p>
            <strong>{isGerman ? 'Status:' : 'Status:'}</strong> <span style={{color: '#3B82F6', fontWeight: 600}}>{isGerman ? 'Audit in Vorbereitung' : 'Audit in Progress'}</span>
          </p>
          
          <h3>{isGerman ? 'Trust Service Principles' : 'Trust Service Principles'}</h3>
          <ul>
            <li><strong>{isGerman ? 'Sicherheit' : 'Security'}:</strong> {isGerman ? 'Schutz vor unbefugtem Zugriff' : 'Protection against unauthorized access'}</li>
            <li><strong>{isGerman ? 'Verfügbarkeit' : 'Availability'}:</strong> {isGerman ? 'System ist verfügbar für Betrieb und Nutzung' : 'System is available for operation and use'}</li>
            <li><strong>{isGerman ? 'Verarbeitungsintegrität' : 'Processing Integrity'}:</strong> {isGerman ? 'Systemverarbeitung ist vollständig, gültig, genau' : 'System processing is complete, valid, accurate'}</li>
            <li><strong>{isGerman ? 'Vertraulichkeit' : 'Confidentiality'}:</strong> {isGerman ? 'Vertrauliche Informationen sind geschützt' : 'Confidential information is protected'}</li>
            <li><strong>{isGerman ? 'Datenschutz' : 'Privacy'}:</strong> {isGerman ? 'Persönliche Daten werden gemäß Richtlinien behandelt' : 'Personal info handled per policy'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>🌍 ISO/IEC 27001</h2>
          <p>
            <strong>{isGerman ? 'Status:' : 'Status:'}</strong> <span style={{color: '#3B82F6', fontWeight: 600}}>{isGerman ? 'Zertifizierung in Vorbereitung' : 'Certification in Progress'}</span>
          </p>
          <p>
            {isGerman
              ? 'Wir implementieren ein Information Security Management System (ISMS) nach ISO 27001 Standard.'
              : 'We are implementing an Information Security Management System (ISMS) per ISO 27001 standard.'
            }
          </p>
          
          <h3>{isGerman ? 'Implementierte Kontrollen' : 'Implemented Controls'}</h3>
          <ul>
            <li>{isGerman ? 'Risikoassessment und -management' : 'Risk assessment and management'}</li>
            <li>{isGerman ? 'Zugriffskontrollrichtlinien' : 'Access control policies'}</li>
            <li>{isGerman ? 'Kryptographie-Kontrollen' : 'Cryptography controls'}</li>
            <li>{isGerman ? 'Physische und Umgebungssicherheit' : 'Physical and environmental security'}</li>
            <li>{isGerman ? 'Betriebssicherheit' : 'Operations security'}</li>
            <li>{isGerman ? 'Kommunikationssicherheit' : 'Communications security'}</li>
            <li>{isGerman ? 'Incident Management' : 'Incident management'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>💼 PCI DSS (Bei Bedarf)</h2>
          <p>
            <strong>{isGerman ? 'Status:' : 'Status:'}</strong> <span style={{color: '#6B7280', fontWeight: 600}}>{isGerman ? 'Nicht anwendbar (keine Kartenverarbeitung)' : 'Not Applicable (no card processing)'}</span>
          </p>
          <p>
            {isGerman
              ? 'Wir verarbeiten Zahlungskartendaten nicht direkt. Alle Zahlungen werden über PCI-DSS-konforme Drittanbieter (z.B. Stripe) abgewickelt.'
              : 'We do not process payment card data directly. All payments are handled through PCI-DSS compliant third parties (e.g., Stripe).'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>📋 {isGerman ? 'Branchenspezifische Compliance' : 'Industry-Specific Compliance'}</h2>
          
          <h3>🏦 {isGerman ? 'Finanzsektor' : 'Financial Sector'}</h3>
          <ul>
            <li><strong>MiFID II:</strong> {isGerman ? 'Auf Anfrage verfügbar' : 'Available upon request'}</li>
            <li><strong>PSD2:</strong> {isGerman ? 'Sichere Authentifizierung' : 'Secure authentication'}</li>
          </ul>

          <h3>🏭 {isGerman ? 'Fertigung' : 'Manufacturing'}</h3>
          <ul>
            <li><strong>TISAX:</strong> {isGerman ? 'Automotive-Sicherheit (geplant)' : 'Automotive security (planned)'}</li>
          </ul>

          <h3>🏢 {isGerman ? 'Öffentlicher Sektor' : 'Public Sector'}</h3>
          <ul>
            <li><strong>BSI IT-Grundschutz:</strong> {isGerman ? 'Deutsche Bundesstandards' : 'German federal standards'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>📊 {isGerman ? 'Compliance-Management' : 'Compliance Management'}</h2>
          
          <h3>{isGerman ? 'Governance' : 'Governance'}</h3>
          <ul>
            <li><strong>{isGerman ? 'Compliance-Officer' : 'Compliance Officer'}:</strong> {isGerman ? 'Ernannt und verantwortlich' : 'Appointed and accountable'}</li>
            <li><strong>{isGerman ? 'Regelmäßige Reviews' : 'Regular Reviews'}:</strong> {isGerman ? 'Vierteljährliche Compliance-Audits' : 'Quarterly compliance audits'}</li>
            <li><strong>{isGerman ? 'Richtlinien' : 'Policies'}:</strong> {isGerman ? 'Dokumentiert und zugänglich' : 'Documented and accessible'}</li>
            <li><strong>{isGerman ? 'Mitarbeiterschulungen' : 'Employee Training'}:</strong> {isGerman ? 'Jährliche Compliance-Schulungen' : 'Annual compliance training'}</li>
          </ul>

          <h3>{isGerman ? 'Kontinuierliche Verbesserung' : 'Continuous Improvement'}</h3>
          <ul>
            <li>{isGerman ? 'Regelmäßige Risikoassessments' : 'Regular risk assessments'}</li>
            <li>{isGerman ? 'Externe Audits' : 'External audits'}</li>
            <li>{isGerman ? 'Compliance-Metriken und -Berichte' : 'Compliance metrics and reporting'}</li>
            <li>{isGerman ? 'Feedback-Mechanismen' : 'Feedback mechanisms'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>📅 {isGerman ? 'Compliance-Roadmap' : 'Compliance Roadmap'}</h2>
          
          <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '12px' }}>
            <h3 style={{ marginTop: 0 }}>2024</h3>
            <ul>
              <li>✅ DSGVO/GDPR {isGerman ? 'vollständig implementiert' : 'fully implemented'}</li>
              <li>✅ CCPA {isGerman ? 'Compliance erreicht' : 'compliance achieved'}</li>
              <li>🔄 SOC 2 Type II Audit {isGerman ? 'läuft' : 'in progress'}</li>
              <li>🔄 ISO 27001 {isGerman ? 'Vorbereitung' : 'preparation'}</li>
            </ul>

            <h3>2025 Q1-Q2</h3>
            <ul>
              <li>🎯 SOC 2 Type II {isGerman ? 'Zertifizierung' : 'certification'}</li>
              <li>🎯 ISO 27001 {isGerman ? 'Zertifizierung' : 'certification'}</li>
              <li>🎯 HIPAA {isGerman ? 'Readiness' : 'readiness'}</li>
            </ul>

            <h3>2025 Q3-Q4</h3>
            <ul>
              <li>🎯 {isGerman ? 'Branchenspezifische Zertifizierungen' : 'Industry-specific certifications'}</li>
              <li>🎯 {isGerman ? 'Regionale Compliance-Erweiterungen' : 'Regional compliance expansions'}</li>
            </ul>
          </div>
        </section>

        <section className="page-section">
          <h2>📄 {isGerman ? 'Compliance-Dokumentation' : 'Compliance Documentation'}</h2>
          <p>{isGerman ? 'Verfügbare Dokumente für Kunden:' : 'Available documents for customers:'}</p>
          <ul>
            <li>📋 {isGerman ? 'Datenschutzerklärung' : 'Privacy Policy'} (<a href="/privacy">{isGerman ? 'Anzeigen' : 'View'}</a>)</li>
            <li>📋 {isGerman ? 'Nutzungsbedingungen' : 'Terms of Service'} (<a href="/terms">{isGerman ? 'Anzeigen' : 'View'}</a>)</li>
            <li>📋 {isGerman ? 'Sicherheitsrichtlinie' : 'Security Policy'} (<a href="/security">{isGerman ? 'Anzeigen' : 'View'}</a>)</li>
            <li>📋 DPA (Data Processing Agreement) - {isGerman ? 'Auf Anfrage' : 'Upon request'}</li>
            <li>📋 SCC (Standard Contractual Clauses) - {isGerman ? 'Auf Anfrage' : 'Upon request'}</li>
            <li>📋 SOC 2 Report - {isGerman ? 'Nach Fertigstellung verfügbar' : 'Available upon completion'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>🔔 {isGerman ? 'Compliance-Updates' : 'Compliance Updates'}</h2>
          <p>
            {isGerman
              ? 'Wir benachrichtigen Kunden über wesentliche Änderungen an unseren Compliance-Maßnahmen. Abonnieren Sie unsere Updates:'
              : 'We notify customers of material changes to our compliance measures. Subscribe for updates:'
            }
          </p>
          <a href="mailto:compliance@diform.example.com" className="btn-primary">
            {isGerman ? 'Compliance-Updates abonnieren' : 'Subscribe to Compliance Updates'}
          </a>
        </section>

        <section className="page-section">
          <h2>📞 {isGerman ? 'Compliance-Kontakt' : 'Compliance Contact'}</h2>
          <p>
            {isGerman ? 'Fragen zu Compliance?' : 'Compliance questions?'}<br/>
            📧 compliance@diform.example.com<br/>
            📧 privacy@diform.example.com<br/>
            📧 dpo@diform.example.com ({isGerman ? 'Datenschutzbeauftragter' : 'Data Protection Officer'})
          </p>
        </section>
      </div>
    </div>
  );
}

export default Compliance;
