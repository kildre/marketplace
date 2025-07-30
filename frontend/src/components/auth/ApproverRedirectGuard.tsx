import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ApproverRedirectGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Guard component that redirects APPROVER users to requests page
 * when they try to access restricted pages like cart.
 * Note: APPROVER users should be able to access request-detail pages
 * to review individual requests.
 */
export const ApproverRedirectGuard: React.FC<ApproverRedirectGuardProps> = ({
  children,
  redirectTo = '/requests'
}) => {
  const { isApprover } = useAuth();

  if (isApprover()) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ApproverRedirectGuard;
