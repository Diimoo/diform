import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import './App.css';

// Code splitting: Lazy load heavy components
const Features = lazy(() => import('./components/Features'));
const Architecture = lazy(() => import('./components/Architecture'));
const Security = lazy(() => import('./components/Security'));
const Demo = lazy(() => import('./components/Demo'));
const Footer = lazy(() => import('./components/Footer'));

// Lazy load pages
const Documentation = lazy(() => import('./pages/Documentation'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const SecurityPolicy = lazy(() => import('./pages/SecurityPolicy'));
const Compliance = lazy(() => import('./pages/Compliance'));
const Blog = lazy(() => import('./pages/Blog'));
const Careers = lazy(() => import('./pages/Careers'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '200px',
    fontSize: '18px',
    color: '#666'
  }}>
    <div>Loading...</div>
  </div>
);

// Home page component
const HomePage = ({ onDemoClick }) => (
  <>
    <Hero onTryDemo={onDemoClick} />
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary>
        <Features />
      </ErrorBoundary>
    </Suspense>
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary>
        <Architecture />
      </ErrorBoundary>
    </Suspense>
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary>
        <Security />
      </ErrorBoundary>
    </Suspense>
  </>
);

function App() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <Router>
          <div className="App">
          <Navigation onDemoClick={() => setShowDemo(true)} />
          
          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <Demo isOpen={showDemo} onClose={() => setShowDemo(false)} />
            </ErrorBoundary>
          </Suspense>

          <Routes>
            <Route path="/" element={<HomePage onDemoClick={() => setShowDemo(true)} />} />
            <Route path="/documentation" element={
              <Suspense fallback={<LoadingFallback />}>
                <Documentation />
              </Suspense>
            } />
            <Route path="/about" element={
              <Suspense fallback={<LoadingFallback />}>
                <About />
              </Suspense>
            } />
            <Route path="/contact" element={
              <Suspense fallback={<LoadingFallback />}>
                <Contact />
              </Suspense>
            } />
            <Route path="/blog" element={
              <Suspense fallback={<LoadingFallback />}>
                <Blog />
              </Suspense>
            } />
            <Route path="/careers" element={
              <Suspense fallback={<LoadingFallback />}>
                <Careers />
              </Suspense>
            } />
            <Route path="/privacy" element={
              <Suspense fallback={<LoadingFallback />}>
                <Privacy />
              </Suspense>
            } />
            <Route path="/terms" element={
              <Suspense fallback={<LoadingFallback />}>
                <Terms />
              </Suspense>
            } />
            <Route path="/security" element={
              <Suspense fallback={<LoadingFallback />}>
                <SecurityPolicy />
              </Suspense>
            } />
            <Route path="/compliance" element={
              <Suspense fallback={<LoadingFallback />}>
                <Compliance />
              </Suspense>
            } />
          </Routes>

          <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary>
              <Footer />
            </ErrorBoundary>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
    </I18nextProvider>
  );
}

export default App;
