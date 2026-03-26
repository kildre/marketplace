import Alert from "@mui/material/Alert";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import React from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { PageTitle } from "../../components/page-title/page-title";
import { RequestsTable } from "../../components/requests-table/requests-table";
import { useAuth } from "../../hooks/useAuth";
import { useRequests } from "../../hooks/useRequests";
import { RequestData } from "../../interfaces/interfaceStore";

// Custom transition: spring slide-down + fade in, fade-out + slide-up exit
const ToastTransition = React.forwardRef<
  HTMLDivElement,
  { in?: boolean; children?: React.ReactNode; onEnter?: () => void; onExited?: () => void }
>(function ToastTransition({ in: inProp, children, onEnter, onExited }, ref) {
  // Initialise directly from inProp so the correct class is present on the very first paint.
  const [animClass, setAnimClass] = React.useState(inProp ? "toast-enter" : "");
  const [show, setShow] = React.useState(!!inProp);
  const prevIn = React.useRef(inProp);

  // useLayoutEffect fires synchronously before the browser paints, eliminating the one-frame
  // flicker that useEffect would cause.
  React.useLayoutEffect(() => {
    if (inProp && !prevIn.current) {
      setShow(true);
      setAnimClass("toast-enter");
      onEnter?.();
    } else if (!inProp && prevIn.current) {
      setAnimClass("toast-exit"); // keep visible until animation ends
    }
    prevIn.current = inProp;
  }, [inProp, onEnter]);

  const handleAnimationEnd = () => {
    if (!inProp) {
      setShow(false); // unmount only after exit animation completes
      onExited?.();
    }
  };

  if (!show) return null;

  return (
    <div ref={ref} className={animClass} onAnimationEnd={handleAnimationEnd}>
      {children}
    </div>
  );
});

export const Requests = (): React.ReactElement => {
  const location = useLocation();
  const { isRequestor, isApprover, getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get("userId");

  // Snackbar state management
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  // Check for success toast on page load
  React.useEffect(() => {
    if (location.state?.showSuccessToast && location.state?.requestId) {
      setSnackbarMessage(
        `Request submitted successfully!  Request ID: ${location.state.requestId}`
      );
      setSnackbarOpen(true);

      // Clear the state to prevent showing the toast on refresh
      window.history.replaceState(null, "");
    }
  }, [location.state]);

  // Handle snackbar close
  const handleClose = (
    event?: React.SyntheticEvent | globalThis.Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Get userId from URL parameters (for development without auth)
  let userId = urlUserId || queryUserId || undefined;

  // For requestors, if no userId is specified in URL, use their own email for filtering
  let effectiveUserId = userId;
  if (isRequestor() && !userId && userInfo) {
    effectiveUserId = userInfo.email; // Use email for API filtering instead of username
  }

  // Use the useRequests hook to get requests data
  const { requests } = useRequests(effectiveUserId, true);

  // Determine if user column should be shown or not
  // Hide user column when filtering by specific user OR when user is a requestor (they only see their own)
  const showUserColumn = isApprover() && !userId;

  return (
    <>
      <div className="requests-page marketplace-content">
        <PageTitle title="Requests" />
        <RequestsTable
          userId={effectiveUserId}
          showUserColumn={showUserColumn}
          data={requests as unknown as RequestData[]}
        />
      </div>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        onClose={handleClose}
        autoHideDuration={7000}
        TransitionComponent={ToastTransition}
        id="toast-notification"
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
