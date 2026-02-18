import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '../../hooks/useKeycloak';
import { useAuth } from '../../hooks/useAuth';
import { SessionService } from '../../services/sessionService';
import './UserProfileDropdown.css';

export const UserProfileDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const { getUserInfo } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userInfo = getUserInfo();
  const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);

    // Expire backend session if using session storage
    try {
      const sessionId = localStorage.getItem('marketplace_session_id');
      if (sessionId) {
        await SessionService.expireSession(sessionId);
      }
    } catch (error) {
      console.error('Error expiring session:', error);
    }

    // Handle logout based on authentication mode
    if (bypassAuth) {
      // Mock mode: clear localStorage and redirect to mock login
      localStorage.removeItem('mock_auth_state');
      localStorage.removeItem('marketplace_session_id');
      navigate('/mock-login', { replace: true });
    } else {
      // Real Keycloak mode: use Keycloak logout
      keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!userInfo) return '?';

    const firstName = userInfo.firstName;
    const lastName = userInfo.lastName;

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (userInfo.email) {
      return userInfo.email[0].toUpperCase();
    }

    return '?';
  };

  // Get user full name
  const getUserName = () => {
    if (!userInfo) return 'Unknown User';

    if (userInfo.firstName && userInfo.lastName) {
      return `${userInfo.firstName} ${userInfo.lastName}`;
    } else if (userInfo.firstName) {
      return userInfo.firstName;
    } else if (userInfo.username) {
      return userInfo.username;
    }

    return 'Unknown User';
  };

  // Don't render if not authenticated
  if (!keycloak.authenticated) {
    return null;
  }

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="user-profile-icon-btn"
        aria-label="User profile"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        <div className="user-avatar">
          {getInitials()}
        </div>
      </button>

      {isOpen && (
        <div className="user-profile-dropdown-menu">
          <div className="user-profile-info">
            <div className="user-profile-avatar-large">
              {getInitials()}
            </div>
            <div className="user-profile-details">
              <div className="user-profile-name">{getUserName()}</div>
              <div className="user-profile-email">{userInfo?.email || 'No email'}</div>
            </div>
          </div>
          <div className="user-profile-divider"></div>
          <button
            type="button"
            className="user-profile-logout-btn"
            onClick={handleLogout}
          >
            <svg
              className="logout-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.6667 11.3333L14 8L10.6667 4.66667"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 8H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
