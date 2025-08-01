import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useKeycloak } from '../../hooks/useKeycloak';
import { AppRoles } from '../../types/auth';

/**
 * Debug component to help diagnose role checking issues
 * Only renders in development mode
 */
export const RoleDebugInfo: React.FC = () => {
  const { keycloak } = useKeycloak();
  const { hasRole, getUserInfo, getKeycloakRoles, getAppRoles, isRequestor } = useAuth();
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const userInfo = getUserInfo();
  const keycloakRoles = getKeycloakRoles();
  const appRoles = getAppRoles();
  const hasRequestorRole = hasRole(AppRoles.REQUESTOR);
  const isRequestorCheck = isRequestor();

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '10px',
      zIndex: 1000,
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      padding: '12px',
      fontSize: '11px',
      maxWidth: '300px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#495057' }}>
        🔍 Role Debug Info
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>Authenticated:</strong> {keycloak.authenticated ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>Bypass Auth:</strong> {import.meta.env.VITE_BYPASS_AUTH === 'true' ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>Username:</strong> {userInfo?.username || 'N/A'}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>Keycloak Roles:</strong> {keycloakRoles.length > 0 ? keycloakRoles.join(', ') : 'None'}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>App Roles:</strong> {appRoles.length > 0 ? appRoles.join(', ') : 'None'}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>hasRole(REQUESTOR):</strong> {hasRequestorRole ? '✅ True' : '❌ False'}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>isRequestor():</strong> {isRequestorCheck ? '✅ True' : '❌ False'}
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong>Cart Should Show:</strong> {hasRequestorRole ? '✅ Yes' : '❌ No'}
      </div>

      {keycloak.tokenParsed && (
        <details style={{ marginTop: '8px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Token Data</summary>
          <pre style={{ 
            fontSize: '10px', 
            overflow: 'auto', 
            maxHeight: '200px',
            marginTop: '4px',
            padding: '4px',
            backgroundColor: '#f1f3f4',
            borderRadius: '2px'
          }}>
            {JSON.stringify(keycloak.tokenParsed, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default RoleDebugInfo;
