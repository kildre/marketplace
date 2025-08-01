import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AppRoles } from '../../types/auth';

/**
 * Component that demonstrates role-based UI display
 * This shows how to conditionally render UI based on user roles
 */
export const RoleBasedDemo: React.FC = () => {
  const { 
    getUserInfo, 
    getUserRoles, 
    getKeycloakRoles,
    hasRole, 
    isApprover, 
    isRequestor,
    isAuthenticated 
  } = useAuth();

  const userInfo = getUserInfo();
  const userRoles = getUserRoles();
  const keycloakRoles = getKeycloakRoles();

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', border: '1px solid #f00', borderRadius: '4px' }}>
        <h3>❌ Not Authenticated</h3>
        <p>Please log in to continue.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px', margin: '10px 0' }}>
      <h3>🔐 Authentication Status</h3>
      
      {/* User Information */}
      <div style={{ marginBottom: '15px' }}>
        <h4>User Information:</h4>
        <ul>
          <li><strong>ID:</strong> {userInfo?.id}</li>
          <li><strong>Username:</strong> {userInfo?.username}</li>
          <li><strong>Email:</strong> {userInfo?.email}</li>
          <li><strong>Name:</strong> {userInfo?.firstName} {userInfo?.lastName}</li>
        </ul>
      </div>

      {/* Role Information */}
      <div style={{ marginBottom: '15px' }}>
        <h4>Roles:</h4>
        <ul>
          <li><strong>App Roles:</strong> {userRoles.join(', ') || 'None'}</li>
          <li><strong>Keycloak Roles:</strong> {keycloakRoles.join(', ') || 'None'}</li>
        </ul>
      </div>

      {/* Role-based UI Examples */}
      <div style={{ marginBottom: '15px' }}>
        <h4>Role-Based UI Examples:</h4>
        
        {/* Show for all authenticated users */}
        <div style={{ padding: '10px', backgroundColor: '#e8f5e8', margin: '5px 0', borderRadius: '4px' }}>
          ✅ <strong>All Users:</strong> This content is visible to all authenticated users.
        </div>

        {/* Show only for approvers */}
        {isApprover() && (
          <div style={{ padding: '10px', backgroundColor: '#e8f4fd', margin: '5px 0', borderRadius: '4px' }}>
            👔 <strong>Approver Only:</strong> You can approve/reject requests, view all requests, and manage the approval workflow.
          </div>
        )}

        {/* Show only for requestors */}
        {isRequestor() && (
          <div style={{ padding: '10px', backgroundColor: '#fff4e6', margin: '5px 0', borderRadius: '4px' }}>
            🛒 <strong>Requestor Only:</strong> You can browse products, add items to cart, and submit requests.
          </div>
        )}

        {/* Show for specific role combinations */}
        {hasRole(AppRoles.APPROVER) && hasRole(AppRoles.REQUESTOR) && (
          <div style={{ padding: '10px', backgroundColor: '#f0e6ff', margin: '5px 0', borderRadius: '4px' }}>
            🌟 <strong>Dual Role:</strong> You have both approver and requestor permissions - full access!
          </div>
        )}

        {/* Show if user has no recognized roles */}
        {!isApprover() && !isRequestor() && (
          <div style={{ padding: '10px', backgroundColor: '#ffe6e6', margin: '5px 0', borderRadius: '4px' }}>
            ⚠️ <strong>No Recognized Roles:</strong> You don't have marketplace-approver or marketplace-requestor roles assigned.
          </div>
        )}
      </div>

      {/* Token Information (Development Only) */}
      {import.meta.env.DEV && (
        <details style={{ marginTop: '15px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔍 Debug Information (Dev Only)</summary>
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <h5>Role Checks:</h5>
            <ul>
              <li>hasRole(APPROVER): {hasRole(AppRoles.APPROVER) ? '✅' : '❌'}</li>
              <li>hasRole(REQUESTOR): {hasRole(AppRoles.REQUESTOR) ? '✅' : '❌'}</li>
              <li>isApprover(): {isApprover() ? '✅' : '❌'}</li>
              <li>isRequestor(): {isRequestor() ? '✅' : '❌'}</li>
            </ul>
            
            <h5>Environment:</h5>
            <ul>
              <li>VITE_BYPASS_AUTH: {import.meta.env.VITE_BYPASS_AUTH}</li>
              <li>VITE_MOCK_USER_ROLES: {import.meta.env.VITE_MOCK_USER_ROLES}</li>
            </ul>
          </div>
        </details>
      )}
    </div>
  );
};

export default RoleBasedDemo;
