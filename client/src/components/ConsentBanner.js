import React, { useState, useEffect } from 'react';
import './ConsentBanner.css'; // Assuming you'll create this CSS file

const CONSENT_LOCAL_STORAGE_KEY = 'diform_consent_preferences';
const CURRENT_CONSENT_VERSION = '1.0.0'; // Must match server-side version

const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    analytics: false,
    marketing: false,
    profiling: false,
  });

  // Check consent status on component mount
  useEffect(() => {
    const storedConsent = JSON.parse(localStorage.getItem(CONSENT_LOCAL_STORAGE_KEY));

    if (storedConsent && storedConsent.version === CURRENT_CONSENT_VERSION && storedConsent.status === 'active') {
      // Consent previously given and is for the current version
      setPreferences(storedConsent.categories);
      setShowBanner(false);
    } else {
      // No consent, outdated consent, or withdrawn consent - show banner
      setShowBanner(true);
      if (storedConsent && storedConsent.categories) {
        setPreferences(storedConsent.categories); // Load previous preferences if available
      }
    }
  }, []);

  const handleCheckboxChange = (category) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleAcceptAll = async () => {
    const allTrue = {
      necessary: true,
      analytics: true,
      marketing: true,
      profiling: true,
    };
    await saveConsent(allTrue);
  };

  const handleRejectAll = async () => {
    const allFalse = {
      necessary: true, // Necessary must remain true
      analytics: false,
      marketing: false,
      profiling: false,
    };
    await saveConsent(allFalse);
  };

  const handleSavePreferences = async () => {
    await saveConsent(preferences);
  };

  const saveConsent = async (currentPreferences) => {
    try {
      const token = localStorage.getItem('token'); // Assuming JWT token is stored here
      const response = await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '', // Include token if available
          'X-CSRF-Token': getCsrfToken(), // Assuming a function to get CSRF token
        },
        body: JSON.stringify({ categories: currentPreferences }),
      });

      if (!response.ok) {
        throw new Error(`Error saving consent: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Consent saved successfully:', data);

      const consentToStore = {
        version: CURRENT_CONSENT_VERSION,
        status: 'active',
        categories: currentPreferences,
      };
      localStorage.setItem(CONSENT_LOCAL_STORAGE_KEY, JSON.stringify(consentToStore));
      setShowBanner(false); // Hide banner after saving
    } catch (error) {
      console.error('Failed to save consent preferences:', error);
      // Optionally, show an error message to the user
    }
  };

  // Dummy function to get CSRF token - implement as per your client-side CSRF handling
  // This could read from a meta tag, a global JS variable, or a cookie if double-submit is used
  const getCsrfToken = () => {
    // Example: reading from a meta tag or specific cookie
    const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfTokenMeta) return csrfTokenMeta.content;
    
    // Example: reading from an X-CSRF-Token cookie
    const name = "X-CSRF-Token=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
  };


  if (!showBanner) {
    return null;
  }

  return (
    <div className="consent-banner">
      <div className="consent-content">
        <h2>Your Privacy Matters</h2>
        <p>
          We use cookies and process personal data to provide you with a better experience.
          Please choose your preferences below.
        </p>
        <div className="consent-options">
          <label>
            <input type="checkbox" checked={true} disabled /> Necessary (always active)
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={() => handleCheckboxChange('analytics')}
            />{' '}
            Analytics (understand how you use our site)
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={() => handleCheckboxChange('marketing')}
            />{' '}
            Marketing (personalized offers and ads)
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.profiling}
              onChange={() => handleCheckboxChange('profiling')}
            />{' '}
            Profiling (for highly personalized content)
          </label>
        </div>
        <div className="consent-actions">
          <button onClick={handleAcceptAll}>Accept All</button>
          <button onClick={handleRejectAll}>Reject All</button>
          <button onClick={handleSavePreferences}>Save Preferences</button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
