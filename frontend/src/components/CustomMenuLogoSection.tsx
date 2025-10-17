import React from "react";

// Import images statically - these will work with Vite
import AdvanaDarkTheme from "../../public/assets/images/AdvanaDarkTheme.png";
import DODLogo from "../../public/assets/images/DOD_color.png";
import CDAOLogo from "../../public/assets/images/cdao_Logo.png";
import JupiterDONLogo from "../../public/assets/images/Jupiter_DON_logo.png";
import JupiterUSMCLogo from "../../public/assets/images/Jupiter_USMC_logo.png";
import JupiterUSNLogo from "../../public/assets/images/Jupiter_USN_logo.png";
import JupiterLogo from "../../public/assets/images/Jupiter_logo.png";

const styles = {
  logo: {
    width: "40px",
    height: "40px",
    position: "relative" as const,
    left: "1%",
    marginRight: "12px",
  },
  advanaLogo: {
    maxWidth: "180px",
    height: "42px",
    cursor: "pointer",
  },
  logoContainer: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column" as const,
    gap: "6px",
    flex: 1,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontWeight: 800,
    fontSize: "2.75rem", // 44px
    lineHeight: 1.1 as const,
    margin: 0,
  },
  mainContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    position: "relative" as const,
    height: "100%",
  },
  imageButton: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "inline-block",
  },
};

interface CustomMenuLogoSectionProps {
  enclave?: string;
  alternateLogo?: string;
  megaMenuBaseDomain?: string;
  isCRA?: boolean;
}

const CustomMenuLogoSection: React.FC<CustomMenuLogoSectionProps> = ({
  enclave = "advana",
  alternateLogo,
  megaMenuBaseDomain,
  isCRA = true,
}) => {
  // Function to handle page navigation in the same window
  const navigateToPage = (path: string, domain?: string, isCRAMode = true) => {
    if (isCRAMode) {
      window.location.hash = path;
      return;
    }
    window.location.href = `${domain}${path}`;
  };

  // Helper function for navigation (maintains backward compatibility)
  const handleNavigation = (path: string, domain?: string, isCRAMode = true) => {
    navigateToPage(path, domain, isCRAMode);
  };

  if (enclave === "jupiter") {
    return (
      <div style={styles.mainContainer}>
        <div style={styles.logoContainer}>
          <div style={styles.logoRow as React.CSSProperties}>
            <button
              type="button"
              onClick={() => handleNavigation("#/", megaMenuBaseDomain, isCRA)}
              style={styles.imageButton}
              aria-label="Navigate to Navy Department home"
            >
              <img
                alt="Navy Department logo"
                src={JupiterDONLogo}
                style={styles.logo}
              />
            </button>
            <button
              type="button"
              onClick={() => handleNavigation("#/", megaMenuBaseDomain, isCRA)}
              style={styles.imageButton}
              aria-label="Navigate to Marines home"
            >
              <img
                alt="Marines logo"
                src={JupiterUSMCLogo}
                style={styles.logo}
              />
            </button>
            <button
              type="button"
              onClick={() => handleNavigation("#/", megaMenuBaseDomain, isCRA)}
              style={styles.imageButton}
              aria-label="Navigate to Navy home"
            >
              <img
                alt="Navy logo"
                src={JupiterUSNLogo}
                style={styles.logo}
              />
            </button>
            <button
              type="button"
              onClick={() => handleNavigation("#/", megaMenuBaseDomain, isCRA)}
              style={styles.imageButton}
              aria-label="Navigate to Jupiter home"
            >
              <img
                alt="Jupiter logo"
                src={JupiterLogo}
                style={styles.advanaLogo}
              />
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    // Default (Advana) enclave
    return (
      <div style={styles.mainContainer}>
        <div style={styles.logoContainer}>
          <div style={styles.logoRow as React.CSSProperties}>
            <img alt="dod_logo" src={DODLogo} style={styles.logo} />
            <img alt="cdao_logo" src={CDAOLogo} style={styles.logo} />
            {alternateLogo ? (
              <img
                alt="alternate_logo"
                src={alternateLogo}
                style={styles.logo}
              />
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleNavigation("#/", megaMenuBaseDomain, isCRA)
                }
                style={styles.imageButton}
                aria-label="Navigate to Advana Marketplace home"
              >
                <img
                  alt="Advana logo"
                  src={AdvanaDarkTheme}
                  style={styles.advanaLogo}
                />
              </button>
            )}
          </div>
          <p style={styles.title as React.CSSProperties}>Advana Marketplace</p>
        </div>
      </div>
    );
  }
};

export default CustomMenuLogoSection;
