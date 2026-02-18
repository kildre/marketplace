import { Link } from "react-router-dom";
import { useState } from "react";
import { getApiUrl } from "../../utils/api-config";

export const Footer = (): React.ReactElement => {
  const [resetting, setResetting] = useState(false);
  const isDev = import.meta.env.DEV;

  const handleDemoReset = async () => {
    if (!confirm('⚠️ Reset Demo Data?\n\nThis will delete all requests, orders, cart items, and decisions.\n\nNotifications and products will be preserved.\n\nAre you sure?')) {
      return;
    }

    setResetting(true);
    try {
      // Get auth token from window.keycloak (set by MockKeycloakProvider in dev mode)
      // @ts-ignore
      const token = window.keycloak?.token || '';

      const response = await fetch(getApiUrl('/api/demo/reset'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Demo data reset successfully!');
        window.location.reload(); // Reload to clear any cached data
      } else {
        const error = await response.json();
        alert(`❌ Failed to reset: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error resetting demo data:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to reset'}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-logos">
          <img
            src="/assets/logos/footer-logo-placeholder.png"
            alt="Advana and CDAO Logos"
            className="footer-logo"
          />
        </div>
        <div className="footer-nav">
          <div className="footer-nav-column">
            <Link to="/" className="footer-link">
              Advana Home
            </Link>
            <Link to="/builder" className="footer-link">
              Builder Portal
            </Link>
            <Link to="/api" className="footer-link">
              API Portal
            </Link>
            <Link to="/learning" className="footer-link">
              Learning
            </Link>
          </div>
          <div className="footer-nav-column">
            <Link to="/news" className="footer-link">
              Advana News
            </Link>
            <Link to="/hours" className="footer-link">
              Office Hours
            </Link>
            <Link to="/contact" className="footer-link">
              Contact Us
            </Link>
            <Link to="/public" className="footer-link">
              Advana Public Site
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-gov-info">
          <div className="footer-gov-badge"></div>
          <div className="footer-gov-text">
            <p className="footer-gov-text__domain">domain.gov</p>
            <p>
              An official website of the Chief Digital and Artificial
              Intelligence Office
            </p>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-links-row">
            <Link to="/contact" className="footer-bottom-link">
              Contact Us
            </Link>
            <Link to="/foia" className="footer-bottom-link">
              FOIA requests
            </Link>
            <Link to="/inspector" className="footer-bottom-link">
              Office of the Inspector General
            </Link>
            <Link to="/privacy" className="footer-bottom-link">
              Privacy Policy
            </Link>
            <Link to="/accessibility" className="footer-bottom-link">
              Accessibility
            </Link>
          </div>
          <div className="footer-links-row">
            <Link to="/no-fear" className="footer-bottom-link">
              No FEAR Act data
            </Link>
            <Link to="/performance" className="footer-bottom-link">
              Performance reports
            </Link>
          </div>
        </div>

        <div className="footer-external">
          <span>Looking for U.S. government information and services? </span>
          <a
            href="https://www.ai.mil/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-external-link"
          >
            Visit https://www.ai.mil/{" "}
            <span className="footer-external__external-icon"></span>
          </a>
        </div>

        {/* Demo Reset Button - Only visible in development mode */}
        {isDev && (
          <div className="footer-demo-controls" style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center'
          }}>
            <button
              onClick={handleDemoReset}
              disabled={resetting}
              style={{
                background: resetting ? '#666' : '#dc2626',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: resetting ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => !resetting && (e.currentTarget.style.background = '#b91c1c')}
              onMouseOut={(e) => !resetting && (e.currentTarget.style.background = '#dc2626')}
            >
              {resetting ? '🔄 Resetting...' : '🗑️ Reset Demo Data'}
            </button>
            <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
              Development Mode Only - Clears requests & orders (preserves notifications & products)
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};
