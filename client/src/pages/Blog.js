import React from 'react';
import { useTranslation } from 'react-i18next';
import './PageStyles.css';

function Blog() {
  const { t, i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  const blogPosts = [
    {
      id: 1,
      date: isGerman ? '16. Oktober 2024' : 'October 16, 2024',
      title: isGerman ? 'DIForM startet: Die Zukunft der Workflow-Automatisierung' : 'Introducing DIForM: The Future of Workflow Automation',
      excerpt: isGerman 
        ? 'Heute starten wir DIForM – eine KI-gestützte Plattform, die nicht nur assistiert, sondern tatsächlich Arbeit erledigt.'
        : 'Today we launch DIForM – an AI-powered platform that doesn\'t just assist, but actually gets work done.',
      category: isGerman ? 'Ankündigung' : 'Announcement',
      readTime: isGerman ? '5 Min. Lesezeit' : '5 min read'
    },
    {
      id: 2,
      date: isGerman ? '10. Oktober 2024' : 'October 10, 2024',
      title: isGerman ? 'Warum Lokale KI für Unternehmen wichtig ist' : 'Why Local AI Matters for Enterprises',
      excerpt: isGerman
        ? 'Datensicherheit und Datenschutz sind entscheidend. Erfahren Sie, warum DIForM auf Ollama setzt.'
        : 'Data security and privacy are crucial. Learn why DIForM uses Ollama for local AI processing.',
      category: isGerman ? 'Technologie' : 'Technology',
      readTime: isGerman ? '7 Min. Lesezeit' : '7 min read'
    },
    {
      id: 3,
      date: isGerman ? '5. Oktober 2024' : 'October 5, 2024',
      title: isGerman ? 'Von assistiert zu autonom: Die nächste Ära der KI' : 'From Assisted to Autonomous: The Next Era of AI',
      excerpt: isGerman
        ? 'Herkömmliche KI-Tools benötigen ständige Eingaben. DIForM geht weiter und führt komplette Workflows autonom aus.'
        : 'Traditional AI tools require constant input. DIForM goes further by executing complete workflows autonomously.',
      category: isGerman ? 'Vision' : 'Vision',
      readTime: isGerman ? '6 Min. Lesezeit' : '6 min read'
    }
  ];

  return (
    <div className="page">
      <div className="page-container">
        <h1>{isGerman ? 'DIForM Blog' : 'DIForM Blog'}</h1>
        <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '40px' }}>
          {isGerman 
            ? 'Neuigkeiten, Updates und Einblicke in die Welt der autonomen Workflow-Automatisierung'
            : 'News, updates, and insights into the world of autonomous workflow automation'
          }
        </p>

        {blogPosts.map(post => (
          <article key={post.id} className="blog-post-card">
            <div className="blog-post-header">
              <span className="blog-category">{post.category}</span>
              <span className="blog-date">{post.date}</span>
            </div>
            <h2 className="blog-post-title">{post.title}</h2>
            <p className="blog-post-excerpt">{post.excerpt}</p>
            <div className="blog-post-footer">
              <span className="blog-read-time">📖 {post.readTime}</span>
              <a href={`/blog/${post.id}`} className="blog-read-more">
                {isGerman ? 'Weiterlesen →' : 'Read more →'}
              </a>
            </div>
          </article>
        ))}

        <div style={{ 
          background: '#F9FAFB', 
          padding: '40px', 
          borderRadius: '12px',
          textAlign: 'center',
          marginTop: '60px'
        }}>
          <h3 style={{ marginBottom: '16px' }}>
            {isGerman ? '📬 Newsletter abonnieren' : '📬 Subscribe to our Newsletter'}
          </h3>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            {isGerman 
              ? 'Erhalten Sie die neuesten Updates und Einblicke direkt in Ihr Postfach'
              : 'Get the latest updates and insights delivered straight to your inbox'
            }
          </p>
          <form style={{ display: 'flex', gap: '12px', maxWidth: '500px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input 
              type="email" 
              placeholder={isGerman ? 'Ihre E-Mail-Adresse' : 'Your email address'}
              style={{
                flex: '1',
                minWidth: '250px',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <button 
              type="submit"
              className="btn-primary"
              style={{ minWidth: '120px' }}
            >
              {isGerman ? 'Abonnieren' : 'Subscribe'}
            </button>
          </form>
        </div>

        <style>{`
          .blog-post-card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 24px;
            transition: all 0.3s ease;
          }
          
          .blog-post-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }
          
          .blog-post-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          
          .blog-category {
            background: #DBEAFE;
            color: #1E40AF;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .blog-date {
            color: #9CA3AF;
            font-size: 14px;
          }
          
          .blog-post-title {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 12px;
          }
          
          .blog-post-excerpt {
            color: #6B7280;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          
          .blog-post-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .blog-read-time {
            color: #9CA3AF;
            font-size: 14px;
          }
          
          .blog-read-more {
            color: #3B82F6;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          
          .blog-read-more:hover {
            color: #2563EB;
          }
        `}</style>
      </div>
    </div>
  );
}

export default Blog;
