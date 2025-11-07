import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export const Error500 = (): React.ReactElement => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="error-page error-500">
      <div className="error-content">
        <div className="error-code">500</div>
        <h1 className="error-title">Internal Server Error</h1>
        <p className="error-message">Something went wrong on our end.</p>
        <p className="error-description">
          We're experiencing technical difficulties. Please try refreshing the
          page or come back later. If the problem persists, contact support.
        </p>
        <div className="error-actions">
          <Button
            variant="outlined"
            onClick={handleRefresh}
            className="error-actions__button error-actions__button--left"
            aria-label={"Refresh the page"}
          >
            Refresh Page
          </Button>
          <Button
            variant="outlined"
            onClick={handleGoHome}
            className="error-actions__button error-actions__button--right"
            aria-label={"Go to home page"}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};
