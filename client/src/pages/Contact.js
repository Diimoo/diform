import React, { useState } from 'react';
import './PageStyles.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to your API
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="page">
      <div className="page-container">
        <h1>Kontakt</h1>
        
        <section className="page-section">
          <h2>Nehmen Sie Kontakt auf</h2>
          <p>
            Haben Sie Fragen, Feedback oder möchten Sie mit uns zusammenarbeiten? 
            Wir freuen uns auf Ihre Nachricht!
          </p>
        </section>

        <section className="page-section">
          <h2>Kontaktformular</h2>
          {submitted && (
            <div style={{
              background: '#D1FAE5',
              color: '#065F46',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              ✓ Vielen Dank! Ihre Nachricht wurde gesendet.
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                E-Mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Betreff
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Nachricht
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <button type="submit" className="btn-primary">
              Nachricht senden
            </button>
          </form>
        </section>

        <section className="page-section">
          <h2>Weitere Kontaktmöglichkeiten</h2>
          <div className="contact-info">
            <p><strong>📧 E-Mail:</strong> <a href="mailto:contact@diform.example.com">contact@diform.example.com</a></p>
            <p><strong>🆘 Support:</strong> <a href="mailto:support@diform.example.com">support@diform.example.com</a></p>
            <p><strong>💼 Business:</strong> <a href="mailto:business@diform.example.com">business@diform.example.com</a></p>
            <p><strong>🐛 Bug Reports:</strong> <a href="https://github.com/yourusername/diform/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a></p>
          </div>
        </section>

        <section className="page-section">
          <h2>Social Media</h2>
          <p>Folgen Sie uns für Updates und Neuigkeiten:</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="https://twitter.com/diform" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Twitter
            </a>
            <a href="https://linkedin.com/company/diform" target="_blank" rel="noopener noreferrer" className="btn-primary">
              LinkedIn
            </a>
            <a href="https://github.com/yourusername/diform" target="_blank" rel="noopener noreferrer" className="btn-primary">
              GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Contact;
