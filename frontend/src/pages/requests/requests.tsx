import { PageTitle } from "../../components/page-title/page-title";
import { RequestsTable } from "../../components/requests-table/requests-table";
import { useAuth } from "../../hooks/useAuth";
import { useRequests } from "../../hooks/useRequests";
import { useParams, useSearchParams } from "react-router-dom";

export const Requests = (): React.ReactElement => {
  const { isRequestor, isApprover, getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get("userId");

  // Get userId from URL parameters (for development without auth)
  let userId = urlUserId || queryUserId || undefined;

  // For requestors, if no userId is specified in URL, use their own email for filtering
  let effectiveUserId = userId;
  if (isRequestor() && !userId && userInfo) {
    effectiveUserId = userInfo.email; // Use email for API filtering instead of username
  }

  // Use the useRequests hook to trigger updates when user changes
  useRequests(effectiveUserId, true);

  // Determine if user column should be shown or not
  // Hide user column when filtering by specific user OR when user is a requestor (they only see their own)
  const showUserColumn = isApprover() && !userId;

  return (
    <div className="requests-page marketplace-content">
      <PageTitle title="Requests" />
      <RequestsTable userId={effectiveUserId} showUserColumn={showUserColumn} />
    </div>
  );
};
