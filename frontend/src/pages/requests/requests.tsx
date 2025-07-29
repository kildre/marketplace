import { PageTitle } from "../../components/page-title/page-title";
import { RequestsTable } from "../../components/requests-table/requests-table";
import { useAuth } from "../../hooks/useAuth";
import { useParams, useSearchParams } from "react-router-dom";

export const Requests = (): React.ReactElement => {
  const { isRequestor, isApprover, getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('userId');

  // Get userId from URL parameters (for development without auth)
  let userId = urlUserId || queryUserId || undefined;
  
  // For requestors, if no userId is specified in URL, use their own username
  if (isRequestor() && !userId && userInfo) {
    userId = userInfo.username;
  }
  
  // Determine if user column should be shown
  // Hide user column when filtering by specific user OR when user is a requestor (they only see their own)
  const showUserColumn = isApprover() && !userId;

  return (
    <div className="requests-page marketplace-content">
      <PageTitle title="Requests" />
      <RequestsTable userId={userId} showUserColumn={showUserColumn} />
    </div>
  );
};
