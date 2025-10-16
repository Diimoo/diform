import React from 'react';
import { useTranslation } from 'react-i18next';
import './PageStyles.css';

function Terms() {
  const { t, i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  return (
    <div className="page">
      <div className="page-container">
        <h1>{isGerman ? 'Allgemeine Geschäftsbedingungen' : 'Terms of Service'}</h1>
        
        <p className="last-updated">{isGerman ? 'Zuletzt aktualisiert' : 'Last updated'}: 16. Oktober 2024</p>

        <section className="page-section">
          <h2>{isGerman ? '1. Akzeptanz der Bedingungen' : '1. Acceptance of Terms'}</h2>
          <p>
            {isGerman
              ? 'Durch den Zugriff auf oder die Nutzung von DIForM ("Dienst") stimmen Sie zu, an diese Nutzungsbedingungen gebunden zu sein. Wenn Sie nicht einverstanden sind, nutzen Sie den Dienst nicht.'
              : 'By accessing or using DIForM ("Service"), you agree to be bound by these Terms of Service. If you disagree, do not use the Service.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '2. Beschreibung des Dienstes' : '2. Description of Service'}</h2>
          <p>
            {isGerman
              ? 'DIForM ist eine KI-gestützte Plattform für autonome Workflow-Ausführung. Der Dienst umfasst:'
              : 'DIForM is an AI-powered platform for autonomous workflow execution. The Service includes:'
            }
          </p>
          <ul>
            <li>{isGerman ? 'Aufgabenverarbeitung und -ausführung' : 'Task processing and execution'}</li>
            <li>{isGerman ? 'KI-gesteuerte Workflow-Automatisierung' : 'AI-driven workflow automation'}</li>
            <li>{isGerman ? 'Datenverarbeitung und -speicherung' : 'Data processing and storage'}</li>
            <li>{isGerman ? 'API-Zugang' : 'API access'}</li>
            <li>{isGerman ? 'Web-, Desktop- und Mobile-Anwendungen' : 'Web, desktop, and mobile applications'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '3. Nutzerkonto' : '3. User Account'}</h2>
          <h3>{isGerman ? 'Registrierung' : 'Registration'}</h3>
          <ul>
            <li>{isGerman ? 'Sie müssen sich registrieren, um den Dienst zu nutzen' : 'You must register to use the Service'}</li>
            <li>{isGerman ? 'Geben Sie genaue und aktuelle Informationen an' : 'Provide accurate and current information'}</li>
            <li>{isGerman ? 'Sie sind für die Sicherheit Ihres Kontos verantwortlich' : 'You are responsible for your account security'}</li>
            <li>{isGerman ? 'Sie müssen mindestens 18 Jahre alt sein' : 'You must be at least 18 years old'}</li>
          </ul>

          <h3>{isGerman ? 'Kontosicherheit' : 'Account Security'}</h3>
          <ul>
            <li>{isGerman ? 'Halten Sie Ihr Passwort vertraulich' : 'Keep your password confidential'}</li>
            <li>{isGerman ? 'Benachrichtigen Sie uns bei unbefugtem Zugriff' : 'Notify us of unauthorized access'}</li>
            <li>{isGerman ? 'Sie sind für alle Aktivitäten unter Ihrem Konto verantwortlich' : 'You are responsible for all activities under your account'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '4. Zulässige Nutzung' : '4. Acceptable Use'}</h2>
          <h3>{isGerman ? 'Sie DÜRFEN' : 'You MAY'}</h3>
          <ul>
            <li>✅ {isGerman ? 'Den Dienst für legitime Geschäftszwecke nutzen' : 'Use the Service for legitimate business purposes'}</li>
            <li>✅ {isGerman ? 'Aufgaben zur Automatisierung einreichen' : 'Submit tasks for automation'}</li>
            <li>✅ {isGerman ? 'Auf Ihre Daten zugreifen und sie exportieren' : 'Access and export your data'}</li>
            <li>✅ {isGerman ? 'Die API gemäß Dokumentation nutzen' : 'Use the API per documentation'}</li>
          </ul>

          <h3>{isGerman ? 'Sie DÜRFEN NICHT' : 'You MAY NOT'}</h3>
          <ul>
            <li>❌ {isGerman ? 'Illegale Aktivitäten durchführen' : 'Conduct illegal activities'}</li>
            <li>❌ {isGerman ? 'Schädliche Inhalte hochladen (Malware, Viren)' : 'Upload harmful content (malware, viruses)'}</li>
            <li>❌ {isGerman ? 'Den Dienst missbrauchen oder überlasten' : 'Abuse or overload the Service'}</li>
            <li>❌ {isGerman ? 'Sicherheitsmaßnahmen umgehen' : 'Circumvent security measures'}</li>
            <li>❌ {isGerman ? 'Reverse-Engineering betreiben' : 'Reverse engineer the Service'}</li>
            <li>❌ {isGerman ? 'Daten anderer Nutzer scrapers oder ernten' : 'Scrape or harvest other users\' data'}</li>
            <li>❌ {isGerman ? 'Rechte Dritter verletzen' : 'Violate third-party rights'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '5. Abonnement und Zahlung' : '5. Subscription and Payment'}</h2>
          <h3>{isGerman ? 'Preispläne' : 'Pricing Plans'}</h3>
          <ul>
            <li><strong>Free Tier:</strong> {isGerman ? 'Begrenzte Funktionen' : 'Limited features'}</li>
            <li><strong>Pro:</strong> {isGerman ? 'Erweiterte Funktionen' : 'Advanced features'}</li>
            <li><strong>Enterprise:</strong> {isGerman ? 'Dedizierte Unterstützung, Custom Deployment' : 'Dedicated support, custom deployment'}</li>
          </ul>

          <h3>{isGerman ? 'Zahlung' : 'Payment'}</h3>
          <ul>
            <li>{isGerman ? 'Zahlung per Kreditkarte oder Rechnung (Enterprise)' : 'Payment via credit card or invoice (Enterprise)'}</li>
            <li>{isGerman ? 'Monatliche oder jährliche Abrechnung' : 'Monthly or annual billing'}</li>
            <li>{isGerman ? 'Preise können sich ändern (mit 30-tägiger Vorankündigung)' : 'Prices may change (with 30-day notice)'}</li>
          </ul>

          <h3>{isGerman ? 'Rückerstattungen' : 'Refunds'}</h3>
          <ul>
            <li>{isGerman ? '14-tägige Geld-zurück-Garantie für neue Abonnements' : '14-day money-back guarantee for new subscriptions'}</li>
            <li>{isGerman ? 'Anteilige Rückerstattung bei Kündigung (nach Ermessen)' : 'Pro-rated refunds on cancellation (at discretion)'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '6. Geistiges Eigentum' : '6. Intellectual Property'}</h2>
          <h3>{isGerman ? 'Unser Eigentum' : 'Our Property'}</h3>
          <p>
            {isGerman
              ? 'DIForM und alle zugehörigen Inhalte sind Eigentum von DIForM oder unseren Lizenzgebern.'
              : 'DIForM and all related content is owned by DIForM or our licensors.'
            }
          </p>

          <h3>{isGerman ? 'Ihr Eigentum' : 'Your Property'}</h3>
          <p>
            {isGerman
              ? 'Sie behalten alle Rechte an Ihren Daten und Inhalten. Sie gewähren uns eine Lizenz zur Verarbeitung Ihrer Daten, um den Dienst bereitzustellen.'
              : 'You retain all rights to your data and content. You grant us a license to process your data to provide the Service.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '7. Datenschutz' : '7. Privacy'}</h2>
          <p>
            {isGerman
              ? 'Ihre Privatsphäre ist uns wichtig. Siehe unsere '
              : 'Your privacy matters to us. See our '
            }
            <a href="/privacy">{isGerman ? 'Datenschutzerklärung' : 'Privacy Policy'}</a> 
            {isGerman ? ' für Details.' : ' for details.'}
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '8. Haftungsausschluss' : '8. Disclaimers'}</h2>
          <ul>
            <li>{isGerman ? 'Dienst "WIE BESEHEN" und "WIE VERFÜGBAR"' : 'Service "AS IS" and "AS AVAILABLE"'}</li>
            <li>{isGerman ? 'Keine Garantie für ununterbrochenen Betrieb' : 'No guarantee of uninterrupted operation'}</li>
            <li>{isGerman ? 'KI-Ergebnisse können ungenau sein' : 'AI results may be inaccurate'}</li>
            <li>{isGerman ? 'Sie sind für die Überprüfung von Ergebnissen verantwortlich' : 'You are responsible for verifying results'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '9. Haftungsbeschränkung' : '9. Limitation of Liability'}</h2>
          <p>
            {isGerman
              ? 'Soweit gesetzlich zulässig, haftet DIForM nicht für indirekte, zufällige, besondere oder Folgeschäden.'
              : 'To the maximum extent permitted by law, DIForM is not liable for indirect, incidental, special, or consequential damages.'
            }
          </p>
          <p>
            {isGerman
              ? 'Gesamthaftung begrenzt auf die in den letzten 12 Monaten gezahlten Gebühren.'
              : 'Total liability limited to fees paid in the last 12 months.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '10. Kündigung' : '10. Termination'}</h2>
          <h3>{isGerman ? 'Durch Sie' : 'By You'}</h3>
          <ul>
            <li>{isGerman ? 'Jederzeit kündbar über Kontoeinstellungen' : 'Cancel anytime via account settings'}</li>
            <li>{isGerman ? 'Daten verfügbar für 30 Tage nach Kündigung' : 'Data available for 30 days after cancellation'}</li>
          </ul>

          <h3>{isGerman ? 'Durch uns' : 'By Us'}</h3>
          <ul>
            <li>{isGerman ? 'Bei Verstoß gegen diese Bedingungen' : 'For violation of these Terms'}</li>
            <li>{isGerman ? 'Bei nicht gezahlten Gebühren' : 'For unpaid fees'}</li>
            <li>{isGerman ? 'Bei längerer Inaktivität (mit Vorankündigung)' : 'For extended inactivity (with notice)'}</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '11. Änderungen' : '11. Changes'}</h2>
          <p>
            {isGerman
              ? 'Wir können diese Bedingungen jederzeit aktualisieren. Wesentliche Änderungen werden per E-Mail mitgeteilt. Fortgesetzte Nutzung bedeutet Akzeptanz.'
              : 'We may update these Terms at any time. Material changes will be notified by email. Continued use constitutes acceptance.'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '12. Anwendbares Recht' : '12. Governing Law'}</h2>
          <p>
            {isGerman
              ? 'Diese Bedingungen unterliegen dem Recht Deutschlands. Gerichtsstand ist [Ihr Standort].'
              : 'These Terms are governed by the laws of Germany. Jurisdiction is [Your Location].'
            }
          </p>
        </section>

        <section className="page-section">
          <h2>{isGerman ? '13. Kontakt' : '13. Contact'}</h2>
          <p>
            {isGerman ? 'Bei Fragen zu diesen Bedingungen:' : 'For questions about these Terms:'}<br/>
            📧 legal@diform.example.com<br/>
            📧 support@diform.example.com
          </p>
        </section>
      </div>
    </div>
  );
}

export default Terms;
