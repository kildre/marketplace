import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AppRoles } from '../../types/auth';

/**
 * Dedicated page for viewing authentication status and testing role-based functionality
 * Only accessible in development mode
 */
export const AuthStatusPage: React.FC = () => {
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

  // Don't render in production
  if (import.meta.env.PROD || import.meta.env.VITE_BYPASS_AUTH !== 'true') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🚫 Auth Status Page</h2>
        <p>This page is only available in development mode with authentication bypass enabled.</p>
        <p>Set <code>VITE_BYPASS_AUTH=true</code> in your .env file to access this page.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', border: '1px solid #f00', borderRadius: '4px', margin: '20px' }}>
        <h3>❌ Not Authenticated</h3>
        <p>Please log in to continue.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔐 Authentication Status</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Development-only page for testing authentication and role-based functionality
      </p>
      
      {/* User Information */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>👤 User Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'center' }}>
          <strong>ID:</strong> <span>{userInfo?.id}</span>
          <strong>Username:</strong> <span>{userInfo?.username}</span>
          <strong>Email:</strong> <span>{userInfo?.email}</span>
          <strong>Name:</strong> <span>{userInfo?.firstName} {userInfo?.lastName}</span>
        </div>
      </div>

      {/* Role Information */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>🎭 Roles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'center' }}>
          <strong>App Roles:</strong> 
          <span>
            {userRoles.length > 0 ? (
              userRoles.map(role => (
                <span key={role} style={{ 
                  padding: '2px 8px', 
                  margin: '2px',
                  backgroundColor: role === AppRoles.APPROVER ? '#e8f4fd' : '#fff4e6',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {role}
                </span>
              ))
            ) : (
              <span style={{ color: '#999' }}>None</span>
            )}
          </span>
          
          <strong>Keycloak Roles:</strong> 
          <span>
            {keycloakRoles.length > 0 ? (
              keycloakRoles.map(role => (
                <span key={role} style={{ 
                  padding: '2px 8px', 
                  margin: '2px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {role}
                </span>
              ))
            ) : (
              <span style={{ color: '#999' }}>None</span>
            )}
          </span>
        </div>
      </div>

      {/* Role-based UI Examples */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>🎨 Role-Based UI Examples</h2>
        
        {/* Show for all authenticated users */}
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e8f5e8', 
          margin: '10px 0', 
          borderRadius: '6px',
          border: '1px solid #4caf50'
        }}>
          ✅ <strong>All Users:</strong> This content is visible to all authenticated users.
        </div>

        {/* Show only for approvers */}
        {isApprover() && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e8f4fd', 
            margin: '10px 0', 
            borderRadius: '6px',
            border: '1px solid #2196f3'
          }}>
            👔 <strong>Approver Only:</strong> You can approve/reject requests, view all requests, and manage the approval workflow.
          </div>
        )}

        {/* Show only for requestors */}
        {isRequestor() && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#fff4e6', 
            margin: '10px 0', 
            borderRadius: '6px',
            border: '1px solid #ff9800'
          }}>
            🛒 <strong>Requestor Only:</strong> You can browse products, add items to cart, and submit requests.
          </div>
        )}

        {/* Show for specific role combinations */}
        {hasRole(AppRoles.APPROVER) && hasRole(AppRoles.REQUESTOR) && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f0e6ff', 
            margin: '10px 0', 
            borderRadius: '6px',
            border: '1px solid #9c27b0'
          }}>
            🌟 <strong>Dual Role:</strong> You have both approver and requestor permissions - full access!
          </div>
        )}

        {/* Show if user has no recognized roles */}
        {!isApprover() && !isRequestor() && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ffe6e6', 
            margin: '10px 0', 
            borderRadius: '6px',
            border: '1px solid #f44336'
          }}>
            ⚠️ <strong>No Recognized Roles:</strong> You don't have marketplace-approver or marketplace-requestor roles assigned.
          </div>
        )}
      </div>

      {/* Debug Information */}
      <details style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <summary style={{ 
          cursor: 'pointer', 
          fontWeight: 'bold', 
          fontSize: '18px',
          marginBottom: '15px'
        }}>
          🔍 Debug Information
        </summary>
        
        <div style={{ marginTop: '15px' }}>
          <h3>Role Check Results:</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto auto', 
            gap: '10px', 
            alignItems: 'center',
            maxWidth: '400px'
          }}>
            <span>hasRole(APPROVER):</span> 
            <span style={{ fontWeight: 'bold', color: hasRole(AppRoles.APPROVER) ? 'green' : 'red' }}>
              {hasRole(AppRoles.APPROVER) ? '✅ true' : '❌ false'}
            </span>
            
            <span>hasRole(REQUESTOR):</span> 
            <span style={{ fontWeight: 'bold', color: hasRole(AppRoles.REQUESTOR) ? 'green' : 'red' }}>
              {hasRole(AppRoles.REQUESTOR) ? '✅ true' : '❌ false'}
            </span>
            
            <span>isApprover():</span> 
            <span style={{ fontWeight: 'bold', color: isApprover() ? 'green' : 'red' }}>
              {isApprover() ? '✅ true' : '❌ false'}
            </span>
            
            <span>isRequestor():</span> 
            <span style={{ fontWeight: 'bold', color: isRequestor() ? 'green' : 'red' }}>
              {isRequestor() ? '✅ true' : '❌ false'}
            </span>
          </div>
          
          <h3 style={{ marginTop: '20px' }}>Environment Variables:</h3>
          <div style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            <div>VITE_BYPASS_AUTH: <strong>{import.meta.env.VITE_BYPASS_AUTH}</strong></div>
            <div>VITE_MOCK_USER_ROLES: <strong>{import.meta.env.VITE_MOCK_USER_ROLES}</strong></div>
            <div>NODE_ENV: <strong>{import.meta.env.MODE}</strong></div>
            <div>Production Build: <strong>{import.meta.env.PROD ? 'Yes' : 'No'}</strong></div>
          </div>
        </div>
      </details>

      {/* Navigation back */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Back to Application
        </button>
      </div>
    </div>
  );
};

export default AuthStatusPage;
