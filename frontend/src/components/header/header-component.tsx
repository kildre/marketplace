import React from "react";
import { Link, useLocation } from "react-router-dom";

export const Header = (): React.ReactElement => {
  const location = useLocation();

  return (
    <header className="header">
      <img src="/assets/logos/LOGOS.png" alt="Logo" className="header-logo" />
      <nav className="nav">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`nav-link ${
            location.pathname === "/about" ? "active" : ""
          }`}
        >
          About
        </Link>
      </nav>
    </header>
  );
};
