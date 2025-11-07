import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export const Error403 = (): React.ReactElement => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="error-page error-403">
      <div className="error-content">
        <div className="error-code">403</div>
        <h1 className="error-title">Access Forbidden</h1>
        <p className="error-message">
          You don't have permission to access this resource.
        </p>
        <p className="error-description">
          If you believe you should have access to this page, please contact
          your administrator or verify that you have the necessary role
          permissions.
        </p>
        <Button
          variant="outlined"
          onClick={handleGoHome}
          className="error-actions__button error-actions__button--left"
          aria-label={"Go to home page"}
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};
