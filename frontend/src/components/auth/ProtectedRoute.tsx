import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useKeycloak } from '../../hooks/useKeycloak';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const location = useLocation();

  // Wait for initialization
  if (!initialized) {
    return (
      <div className="loading-screen" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Initializing authentication...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!keycloak.authenticated) {
    return <Navigate to="/mock-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
