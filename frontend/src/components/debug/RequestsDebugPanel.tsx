import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { mockRequestData } from '../../data/mock-requestData';

interface RequestsDebugProps {
  userId?: string;
  effectiveUserId?: string;
  filteredRequestsCount: number;
}

export const RequestsDebugPanel: React.FC<RequestsDebugProps> = ({ 
  userId, 
  effectiveUserId, 
  filteredRequestsCount 
}) => {
  const { getUserInfo, isRequestor, isApprover } = useAuth();
  const userInfo = getUserInfo();
  
  // Only show in development or when URL contains debug=true
  const shouldShow = import.meta.env.DEV || 
    (typeof window !== 'undefined' && 
     new window.URLSearchParams(window.location.search).get('debug') === 'true');
  
  if (!shouldShow) return null;

  // Find kberres requests in mock data
  const kberresRequests = mockRequestData.filter(request => 
    request.personalData.email.toLowerCase().includes('kberres')
  );

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '6px',
      padding: '16px',
      fontSize: '12px',
      maxWidth: '400px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#856404' }}>
        📊 Requests Debug Panel
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>User Info:</strong>
        <div style={{ marginLeft: '16px', fontSize: '11px' }}>
          Username: {userInfo?.username || 'N/A'}<br/>
          Email: {userInfo?.email || 'N/A'}<br/>
          Is Requestor: {isRequestor() ? '✅' : '❌'}<br/>
          Is Approver: {isApprover() ? '✅' : '❌'}
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>URL Params:</strong>
        <div style={{ marginLeft: '16px', fontSize: '11px' }}>
          Provided userId: {userId || 'None'}<br/>
          Effective userId: {effectiveUserId || 'None (show all)'}
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Data:</strong>
        <div style={{ marginLeft: '16px', fontSize: '11px' }}>
          Total mock requests: {mockRequestData.length}<br/>
          Kberres mock requests: {kberresRequests.length}<br/>
          Filtered requests shown: {filteredRequestsCount}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Kberres Request Emails:</strong>
        <div style={{ marginLeft: '16px', fontSize: '10px' }}>
          {kberresRequests.map((req, idx) => (
            <div key={idx}>{req.personalData.email}</div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>💡 Troubleshooting:</div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>
          • Add <code>?debug=true</code> to URL to show this in production<br/>
          • If no requests show, check username matching logic<br/>
          • Requests filter by email prefix before @ symbol
        </div>
      </div>
    </div>
  );
};

export default RequestsDebugPanel;
