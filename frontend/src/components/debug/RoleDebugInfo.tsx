import React, { useState, useRef } from 'react';
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
  
  // Draggable state - positioned at bottom center
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 150, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<React.ElementRef<'div'>>(null);
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const userInfo = getUserInfo();
  const keycloakRoles = getKeycloakRoles();
  const appRoles = getAppRoles();
  const hasRequestorRole = hasRole(AppRoles.REQUESTOR);
  const isRequestorCheck = isRequestor();

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      const mouseMoveHandler = (e: globalThis.MouseEvent) => handleMouseMove(e);
      const mouseUpHandler = () => handleMouseUp();
      
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      
      return () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };
    }
  }, [isDragging, dragOffset.x, dragOffset.y]);

  return (
    <div 
      ref={panelRef}
      style={{
        position: 'fixed',
        bottom: 'auto',
        right: 'auto',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '12px',
        fontSize: '11px',
        maxWidth: '300px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '8px', 
        color: '#495057',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>🔍 Role Debug Info</span>
        <span style={{ 
          fontSize: '10px', 
          color: '#666',
          fontWeight: 'normal'
        }}>
          🖱️ Drag to move
        </span>
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
