import React, { useState, useRef } from 'react';
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
  
  // Draggable state - positioned at bottom right
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<React.ElementRef<'div'>>(null);
  
  // Only show in development or when URL contains debug=true
  const shouldShow = import.meta.env.DEV || 
    (typeof window !== 'undefined' && 
     new window.URLSearchParams(window.location.search).get('debug') === 'true');
  
  if (!shouldShow) return null;

  // Find kberres requests in mock data
  const kberresRequests = mockRequestData.filter(request => 
    request.personalData.email.toLowerCase().includes('kberres')
  );

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
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px',
        padding: '16px',
        fontSize: '12px',
        maxWidth: '400px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '12px', 
        color: '#856404',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>📊 Requests Debug Panel</span>
        <span style={{ 
          fontSize: '10px', 
          color: '#666',
          fontWeight: 'normal'
        }}>
          🖱️ Drag to move
        </span>
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
