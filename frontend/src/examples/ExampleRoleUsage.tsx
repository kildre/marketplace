import React from 'react';
import { ApproverOnly, RequestorOnly, RoleGuard, useUserRoles } from '../components/RoleGuard';
import { MARKETPLACE_ROLES } from '../utils/roleUtils';

// Example component showing how to use role-based conditional rendering
const ExampleRoleUsage: React.FC = () => {
  const { isApprover, isRequestor, roles } = useUserRoles();

  return (
    <div className="space-y-4">
      <h2>Role-Based Conditional Rendering Examples</h2>
      
      {/* Using the hook directly */}
      <div>
        <h3>Using useUserRoles hook:</h3>
        <p>Is Approver: {isApprover ? 'Yes' : 'No'}</p>
        <p>Is Requestor: {isRequestor ? 'Yes' : 'No'}</p>
        <p>Current Roles: {roles.join(', ')}</p>
      </div>

      {/* Using ApproverOnly component */}
      <ApproverOnly>
        <div className="bg-blue-100 p-4 rounded">
          <h3>Approver Only Content</h3>
          <p>This content is only visible to users with the marketplace-approver role.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Approve Request
          </button>
        </div>
      </ApproverOnly>

      {/* Using RequestorOnly component */}
      <RequestorOnly>
        <div className="bg-green-100 p-4 rounded">
          <h3>Requestor Only Content</h3>
          <p>This content is only visible to users with the marketplace-requestor role.</p>
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Submit Request
          </button>
        </div>
      </RequestorOnly>

      {/* Using RoleGuard with specific roles */}
      <RoleGuard 
        roles={[MARKETPLACE_ROLES.APPROVER]} 
        fallback={<p>You need approver permissions to see this content.</p>}
      >
        <div className="bg-yellow-100 p-4 rounded">
          <h3>Admin Panel</h3>
          <p>Advanced administrative functions...</p>
        </div>
      </RoleGuard>

      {/* Using RoleGuard with multiple roles (ANY) */}
      <RoleGuard 
        roles={[MARKETPLACE_ROLES.APPROVER, MARKETPLACE_ROLES.REQUESTOR]}
        requireAll={false}
      >
        <div className="bg-purple-100 p-4 rounded">
          <h3>General User Content</h3>
          <p>This is visible to both approvers and requestors.</p>
        </div>
      </RoleGuard>

      {/* Conditional rendering in JSX */}
      {isApprover && (
        <div className="bg-red-100 p-4 rounded">
          <h3>Inline Conditional Rendering</h3>
          <p>You can also use the hook values directly in JSX conditionals.</p>
        </div>
      )}

      {/* Navigation example */}
      <nav className="flex space-x-4">
        <a href="/dashboard" className="text-blue-500">Dashboard</a>
        
        <RequestorOnly>
          <a href="/submit-request" className="text-green-500">Submit Request</a>
        </RequestorOnly>
        
        <ApproverOnly>
          <a href="/approve-requests" className="text-blue-500">Approve Requests</a>
          <a href="/admin" className="text-red-500">Admin Panel</a>
        </ApproverOnly>
      </nav>
    </div>
  );
};

export default ExampleRoleUsage;
