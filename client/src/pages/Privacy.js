import React from 'react';
import { useTranslation } from 'react-i18next';
import './PageStyles.css';

function Privacy() {
  const { t, i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  return (
    <div className="page">
      <div className="page-container">
        <h1>{isGerman ? 'Datenschutzerklärung' : 'Privacy Policy'}</h1>
        
        <p className="last-updated">{isGerman ? 'Zuletzt aktualisiert' : 'Last updated'}: 16. Oktober 2024</p>

        <section className="page-section">
          <h2>{isGerman ? 'Überblick' : '1. Overview'}</h2>
          <p>
            {isGerman 
              ? 'DIForM ("wir", "uns", "unser") respektiert Ihre Privatsphäre und ist verpflichtet, Ihre persönlichen Daten zu schützen. Diese Datenschutzerklärung informiert Sie darüber, wie wir Ihre persönlichen Daten verarbeiten und welche Rechte Sie gemäß der Datenschutz-Grundverordnung (DSGVO) und anderen geltenden Datenschutzgesetzen haben.'
              : 'DIForM ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This privacy policy informs you how we process your personal data and what rights you have under the General Data Protection Regulation (GDPR) and other applicable data protection laws.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Datenverantwortlicher' : '2. Data Controller'}</h2>
          <p>
            <strong>DIForM</strong><br/>
            {isGerman ? 'E-Mail' : 'Email'}: privacy@diform.example.com<br/>
            {isGerman ? 'Datenschutzbeauftragter' : 'Data Protection Officer'}: dpo@diform.example.com
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Welche Daten sammeln wir?' : '3. Data We Collect'}</h2>
          <h3>{isGerman ? 'Daten, die Sie uns geben' : 'Data You Provide'}</h3>
          <ul>
            <li><strong>{isGerman ? 'Registrierungsdaten' : 'Registration Data'}:</strong> {isGerman ? 'Name, E-Mail-Adresse, Passwort' : 'Name, email address, password'}</li>
            <li><strong>{isGerman ? 'Profilinformationen' : 'Profile Information'}:</strong> {isGerman ? 'Firmenname, Position, Profilbild' : 'Company name, job title, profile picture'}</li>
            <li><strong>{isGerman ? 'Inhaltsdaten' : 'Content Data'}:</strong> {isGerman ? 'Aufgaben, Befehle, hochgeladene Dateien' : 'Tasks, commands, uploaded files'}</li>
            <li><strong>{isGerman ? 'Kommunikation' : 'Communications'}:</strong> {isGerman ? 'Support-Anfragen, Feedback' : 'Support requests, feedback'}</li>
          </ul>

          <h3>{isGerman ? 'Automatisch gesammelte Daten' : 'Automatically Collected Data'}</h3>
          <ul>
            <li><strong>{isGerman ? 'Nutzungsdaten' : 'Usage Data'}:</strong> {isGerman ? 'Wie Sie unsere Dienste nutzen' : 'How you use our services'}</li>
            <li><strong>{isGerman ? 'Technische Daten' : 'Technical Data'}:</strong> IP-Adresse, Browser, {isGerman ? 'Geräteinformationen' : 'device information'}</li>
            <li><strong>Cookies:</strong> {isGerman ? 'Siehe Abschnitt Cookie-Richtlinie' : 'See Cookie Policy section'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Wie verwenden wir Ihre Daten?' : '4. How We Use Your Data'}</h2>
          <ul>
            <li>{isGerman ? '🎯 Bereitstellung unserer Dienste' : '🎯 Provide our services'}</li>
            <li>{isGerman ? '🔐 Authentifizierung und Sicherheit' : '🔐 Authentication and security'}</li>
            <li>{isGerman ? '📊 Verbesserung unserer Produkte' : '📊 Improve our products'}</li>
            <li>{isGerman ? '📧 Kommunikation mit Ihnen' : '📧 Communicate with you'}</li>
            <li>{isGerman ? '⚖️ Erfüllung rechtlicher Pflichten' : '⚖️ Comply with legal obligations'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Rechtsgrundlagen' : '5. Legal Basis (GDPR)'}</h2>
          <ul>
            <li><strong>{isGerman ? 'Vertragserfüllung' : 'Contract Performance'}:</strong> {isGerman ? 'Bereitstellung unserer Dienste' : 'Providing our services'}</li>
            <li><strong>{isGerman ? 'Berechtigtes Interesse' : 'Legitimate Interest'}:</strong> {isGerman ? 'Verbesserung, Sicherheit, Betrugsbekämpfung' : 'Improvement, security, fraud prevention'}</li>
            <li><strong>{isGerman ? 'Einwilligung' : 'Consent'}:</strong> {isGerman ? 'Marketing, Cookies (falls angefragt)' : 'Marketing, cookies (where requested)'}</li>
            <li><strong>{isGerman ? 'Rechtliche Verpflichtung' : 'Legal Obligation'}:</strong> {isGerman ? 'Einhaltung gesetzlicher Anforderungen' : 'Compliance with law'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Datenweitergabe' : '6. Data Sharing'}</h2>
          <p>{isGerman ? 'Wir geben Ihre Daten nur weiter an:' : 'We only share your data with:'}</p>
          <ul>
            <li><strong>{isGerman ? 'Dienstleister' : 'Service Providers'}:</strong> {isGerman ? 'Hosting, Analyse, E-Mail-Dienste' : 'Hosting, analytics, email services'}</li>
            <li><strong>{isGerman ? 'Rechtliche Anforderungen' : 'Legal Requirements'}:</strong> {isGerman ? 'Wenn gesetzlich vorgeschrieben' : 'When required by law'}</li>
            <li><strong>{isGerman ? 'Mit Ihrer Zustimmung' : 'With Your Consent'}:</strong> {isGerman ? 'Wenn Sie explizit zustimmen' : 'When you explicitly agree'}</li>
          </ul>
          <p><strong>{isGerman ? 'Wir verkaufen Ihre Daten NIEMALS an Dritte!' : 'We NEVER sell your data to third parties!'}</strong></p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Datenspeicherung' : '7. Data Retention'}</h2>
          <ul>
            <li><strong>{isGerman ? 'Aktive Konten' : 'Active Accounts'}:</strong> {isGerman ? 'Solange Ihr Konto aktiv ist' : 'As long as your account is active'}</li>
            <li><strong>{isGerman ? 'Gelöschte Konten' : 'Deleted Accounts'}:</strong> {isGerman ? '30 Tage Aufbewahrungsfrist, dann Löschung' : '30-day retention, then deletion'}</li>
            <li><strong>{isGerman ? 'Rechtliche Anforderungen' : 'Legal Requirements'}:</strong> {isGerman ? 'Länger, wenn gesetzlich erforderlich' : 'Longer if legally required'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Ihre Rechte' : '8. Your Rights'}</h2>
          <p>{isGerman ? 'Sie haben das Recht auf:' : 'You have the right to:'}</p>
          <ul>
            <li><strong>{isGerman ? 'Zugang' : 'Access'}:</strong> {isGerman ? 'Zugriff auf Ihre Daten' : 'Access your data'}</li>
            <li><strong>{isGerman ? 'Berichtigung' : 'Rectification'}:</strong> {isGerman ? 'Korrektur falscher Daten' : 'Correct inaccurate data'}</li>
            <li><strong>{isGerman ? 'Löschung' : 'Erasure'}:</strong> {isGerman ? 'Löschung Ihrer Daten' : 'Delete your data'}</li>
            <li><strong>{isGerman ? 'Einschränkung' : 'Restriction'}:</strong> {isGerman ? 'Einschränkung der Verarbeitung' : 'Restrict processing'}</li>
            <li><strong>{isGerman ? 'Datenübertragbarkeit' : 'Portability'}:</strong> {isGerman ? 'Export Ihrer Daten' : 'Export your data'}</li>
            <li><strong>{isGerman ? 'Widerspruch' : 'Object'}:</strong> {isGerman ? 'Widerspruch gegen Verarbeitung' : 'Object to processing'}</li>
            <li><strong>{isGerman ? 'Beschwerde' : 'Complain'}:</strong> {isGerman ? 'Beschwerde bei Aufsichtsbehörde' : 'Lodge complaint with supervisory authority'}</li>
          </ul>
          <p>{isGerman ? 'Um Ihre Rechte auszuüben, kontaktieren Sie:' : 'To exercise your rights, contact:'} privacy@diform.example.com</p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Sicherheit' : '9. Security'}</h2>
          <ul>
            <li>🔐 {isGerman ? 'Ende-zu-Ende-Verschlüsselung' : 'End-to-end encryption'}</li>
            <li>🔑 {isGerman ? 'Sichere Passwort-Hashing (bcrypt)' : 'Secure password hashing (bcrypt)'}</li>
            <li>🛡️ {isGerman ? 'JWT-Authentifizierung' : 'JWT authentication'}</li>
            <li>📝 {isGerman ? 'Umfassende Audit-Logs' : 'Comprehensive audit logs'}</li>
            <li>🔒 HTTPS {isGerman ? 'erzwungen' : 'enforced'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Cookies' : '10. Cookies'}</h2>
          <p>
            {isGerman
              ? 'Wir verwenden Cookies für: Authentifizierung, Sprachpräferenzen, Sicherheit. Sie können Cookies in Ihren Browser-Einstellungen deaktivieren.'
              : 'We use cookies for: Authentication, language preferences, security. You can disable cookies in your browser settings.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Internationale Datentransfers' : '11. International Data Transfers'}</h2>
          <p>
            {isGerman
              ? 'Ihre Daten können außerhalb der EU verarbeitet werden. Wir verwenden Standard-Vertragsklauseln (SCCs) und andere geeignete Schutzmaßnahmen gemäß DSGVO.'
              : 'Your data may be processed outside the EU. We use Standard Contractual Clauses (SCCs) and other appropriate safeguards as required by GDPR.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Änderungen' : '12. Changes'}</h2>
          <p>
            {isGerman
              ? 'Wir können diese Richtlinie aktualisieren. Wesentliche Änderungen werden per E-Mail mitgeteilt.'
              : 'We may update this policy. Material changes will be notified by email.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? 'Kontakt' : '13. Contact'}</h2>
          <p>
            📧 {isGerman ? 'Datenschutz' : 'Privacy'}: <a href="mailto:privacy@diform.example.com">privacy@diform.example.com</a><br/>
            📧 DPO: <a href="mailto:dpo@diform.example.com">dpo@diform.example.com</a><br/>
            📧 {isGerman ? 'Allgemein' : 'General'}: <a href="mailto:contact@diform.example.com">contact@diform.example.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Privacy;
