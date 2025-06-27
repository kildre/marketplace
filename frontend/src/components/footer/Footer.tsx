import React from "react";
import { Link } from "react-router-dom";

const Footer = (): React.ReactElement => {
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
            Visit https://www.ai.mil/
            <span className="footer-external__external-icon"></span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
