import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = (): React.ReactElement => {
  const location = useLocation();

  return (
    <header className="header">
      <nav className="nav">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          to="/about" 
          className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
        >
          About
        </Link>
      </nav>
    </header>
  );
};

export default Header;
