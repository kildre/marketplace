import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export const Error404 = (): React.ReactElement => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="error-page error-404">
      <div className="error-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-message">
          The page you're looking for doesn't exist.
        </p>
        <p className="error-description">
          The page may have been moved, deleted, or the URL might be incorrect.
          Please check the URL or navigate back to the home page.
        </p>
        <div className="error-actions">
          <Button
            variant="outlined"
            onClick={handleGoHome}
            className="error-actions__button error-actions__button--left"
            aria-label={"Go to home page"}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            onClick={handleGoBack}
            className="error-actions__button error-actions__button--right"
            aria-label={"Go Back"}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};
