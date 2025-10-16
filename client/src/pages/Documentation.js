import React from 'react';
import './Documentation.css';

function Documentation() {
  return (
    <div className="doc-page">
      <div className="doc-container">
        <h1>DIForM Dokumentation</h1>
        
        <section className="doc-section">
          <h2>🚀 Schnellstart</h2>
          <p>Beginnen Sie in wenigen Minuten mit DIForM.</p>
          
          <h3>Installation</h3>
          <pre><code>{`npm install
npm run install-all`}</code></pre>
          
          <h3>Entwicklung</h3>
          <pre><code>{`npm run dev`}</code></pre>
          
          <p>Die Anwendung läuft auf:</p>
          <ul>
            <li>Web-Client: <code>http://localhost:3000</code></li>
            <li>Server API: <code>http://localhost:5000</code></li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>📚 API-Referenz</h2>
          
          <h3>Authentifizierung</h3>
          <div className="endpoint">
            <div className="endpoint-header">
              <span className="method post">POST</span>
              <span className="path">/api/auth/register</span>
            </div>
            <p>Registrieren Sie einen neuen Benutzer</p>
            <pre><code>{`{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Max Mustermann"
}`}</code></pre>
          </div>

          <div className="endpoint">
            <div className="endpoint-header">
              <span className="method post">POST</span>
              <span className="path">/api/auth/login</span>
            </div>
            <p>Anmelden und JWT-Token erhalten</p>
            <pre><code>{`{
  "email": "user@example.com",
  "password": "securePassword123"
}`}</code></pre>
          </div>

          <h3>Aufgabenverarbeitung</h3>
          <div className="endpoint">
            <div className="endpoint-header">
              <span className="method post">POST</span>
              <span className="path">/api/process</span>
            </div>
            <p>Verarbeiten Sie einen DIForM-Befehl</p>
            <pre><code>{`{
  "command": "E-Mails zusammenfassen und Meeting planen",
  "context": {
    "priority": "high"
  }
}`}</code></pre>
          </div>

          <div className="endpoint">
            <div className="endpoint-header">
              <span className="method get">GET</span>
              <span className="path">/api/tasks</span>
            </div>
            <p>Alle Aufgaben abrufen</p>
          </div>

          <div className="endpoint">
            <div className="endpoint-header">
              <span className="method get">GET</span>
              <span className="path">/api/tasks/:id</span>
            </div>
            <p>Einzelne Aufgabe nach ID abrufen</p>
          </div>
        </section>

        <section className="doc-section">
          <h2>⚙️ Konfiguration</h2>
          
          <h3>Umgebungsvariablen</h3>
          <p>Erstellen Sie eine <code>.env</code>-Datei im Stammverzeichnis:</p>
          <pre><code>{`# Server
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/diform
JWT_SECRET=ihr-geheimes-token
JWT_EXPIRY=7d

# Ollama KI
OLLAMA_MODEL=llama3.2
OLLAMA_HOST=http://localhost:11434
OLLAMA_TIMEOUT=30000

# Redis Cache (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# E-Mail-Benachrichtigungen
EMAIL_ENABLED=false
EMAIL_PROVIDER=console
EMAIL_FROM=noreply@diform.example.com`}</code></pre>
        </section>

        <section className="doc-section">
          <h2>🔐 Sicherheit</h2>
          
          <h3>JWT-Authentifizierung</h3>
          <p>Alle geschützten Endpunkte erfordern einen JWT-Token im Authorization-Header:</p>
          <pre><code>{`Authorization: Bearer <ihr-jwt-token>`}</code></pre>

          <h3>Rate-Limiting</h3>
          <p>API-Endpunkte sind rate-limited auf:</p>
          <ul>
            <li>100 Anfragen pro 15 Minuten pro IP</li>
            <li>Konfigurier bar über <code>RATE_LIMIT_MAX_REQUESTS</code></li>
          </ul>

          <h3>Datenverschlüsselung</h3>
          <p>Alle sensiblen Daten werden verschlüsselt:</p>
          <ul>
            <li>Passwörter mit bcrypt (10 rounds)</li>
            <li>HTTPS in Produktion erzwungen</li>
            <li>JWT-Tokens signiert und verifiziert</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>🎯 Best Practices</h2>
          
          <h3>Befehle formulieren</h3>
          <p>Für beste Ergebnisse:</p>
          <ul>
            <li>Seien Sie spezifisch und klar</li>
            <li>Geben Sie Kontext an (Zeitrahmen, Priorität, etc.)</li>
            <li>Nennen Sie gewünschte Ausgabeformate</li>
            <li>Spezifizieren Sie relevante Datenquellen</li>
          </ul>

          <h3>Fehlerbehandlung</h3>
          <p>Die API gibt strukturierte Fehler zurück:</p>
          <pre><code>{`{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}`}</code></pre>
        </section>

        <section className="doc-section">
          <h2>🔧 Fehlerbehebung</h2>
          
          <h3>Häufige Probleme</h3>
          
          <h4>MongoDB-Verbindungsfehler</h4>
          <p>Stellen Sie sicher, dass MongoDB läuft:</p>
          <pre><code>{`docker compose up mongodb -d`}</code></pre>

          <h4>Ollama nicht verfügbar</h4>
          <p>Installieren und starten Sie Ollama:</p>
          <pre><code>{`# Installation (siehe INSTALL_OLLAMA.sh)
./INSTALL_OLLAMA.sh

# Model herunterladen
ollama pull llama3.2`}</code></pre>

          <h4>Port bereits in Verwendung</h4>
          <p>Ändern Sie den Port in <code>.env</code>:</p>
          <pre><code>{`PORT=5001`}</code></pre>
        </section>

        <section className="doc-section">
          <h2>📞 Support</h2>
          <p>Benötigen Sie Hilfe?</p>
          <ul>
            <li>📧 E-Mail: <a href="mailto:support@diform.example.com">support@diform.example.com</a></li>
            <li>💬 GitHub Issues: <a href="https://github.com/yourusername/diform/issues" target="_blank" rel="noopener noreferrer">github.com/diform</a></li>
            <li>📚 Weitere Dokumentation: <a href="/docs">docs.diform.example.com</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Documentation;
