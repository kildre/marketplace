import React from "react";
import { useNavigate } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import { ApiError } from "@/services/apiService";
import { useCart } from "../../contexts/ReduxCartContext";
import {
  useFormData,
  useSubmitRequest,
  useSubmissionAttempts,
  useValidationErrors,
} from "../../hooks/useFormQueries";
import { SubmissionData } from "../../interfaces";
import { ErrorModal } from "../error-modal/error-modal";

export const FormSubmitRequest = (): React.ReactElement => {
  const [checked, setChecked] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorDetails, setErrorDetails] = React.useState<{
    code?: string;
    message?: string;
  }>({});
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const formData = useFormData();
  const submitMutation = useSubmitRequest();
  const { markSubmissionAttempt } = useSubmissionAttempts();
  const { hasValidationErrors } = useValidationErrors();

  // Check if form is valid for submission
  const isFormValid = React.useMemo(() => {
    // If checkbox is not checked, form is invalid
    if (!checked) {
      return false;
    }

    // If there are validation errors in phone or email, form is invalid
    if (hasValidationErrors) {
      return false;
    }

    // If organization is not selected, form is invalid
    if (formData.organization === "") {
      return false;
    }

    // If organization is "Other" but organizationOther is not filled, form is invalid
    if (
      formData.organization === "Other" &&
      formData.organizationOther === ""
    ) {
      return false;
    }

    return true;
  }, [
    checked,
    hasValidationErrors,
    formData.organization,
    formData.organizationOther,
  ]);

  // Navigate to requests page on successful submission
  React.useEffect(() => {
    if (submitMutation.isSuccess && submitMutation.data?.requestNumber) {
      clearCart(); // Clear the cart items
      // Navigate to requests page with success state and the backend-assigned request number
      navigate("/requests", {
        state: {
          showSuccessToast: true,
          requestId: submitMutation.data.requestNumber,
        },
      });
    }
  }, [submitMutation.isSuccess, submitMutation.data, navigate, clearCart]);

  // Redirect to 500 page if there's a server error, otherwise show error modal
  React.useEffect(() => {
    if (submitMutation.isError && submitMutation.error) {
      const error = submitMutation.error as Error | ApiError;
      if (
        ("name" in error && error.name === "ServerError") ||
        ("statusCode" in error && error.statusCode >= 500)
      ) {
        navigate("/500", { replace: true });
      } else {
        // Show error modal for non-500 errors
        const errorCode =
          "statusCode" in error ? error.statusCode.toString() : "errorCode";
        const errorMessage =
          error.message || "Your request could not be submitted at this time.";

        setErrorDetails({
          code: errorCode,
          message: errorMessage,
        });
        setErrorModalOpen(true);
      }
    }
  }, [submitMutation.isError, submitMutation.error, navigate]);

  const handleSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    // Mark that a submission attempt has been made
    markSubmissionAttempt();

    if (!isFormValid) return;

    // DEV ONLY: Check if error simulation is enabled
    if (import.meta.env.DEV && typeof window !== "undefined") {
      const simulateError = window.localStorage.getItem("simulateSubmitError");
      if (simulateError) {
        const errorData = JSON.parse(simulateError);
        setErrorDetails({
          code: errorData.code || "400",
          message: errorData.message || "Simulated error for testing",
        });
        setErrorModalOpen(true);
        return;
      }
    }

    const estimatedRom =
      document.getElementById("estimatedRom")?.innerHTML || "$0";

    // Get Personal Data
    const personalData = {
      name: document.getElementById("username")?.textContent || "",
      email: document.getElementById("email")?.textContent || "",
      designation: document.getElementById("designation")?.textContent || "",
      agency: document.getElementById("agency")?.textContent || "",
    };

    // Prepare cart data for output
    const cartData = cartItems.map((item) => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        type: item.product.type,
        price: item.product.price,
        description: item.product.description,
        unit: item.product.unit.toString(),
        rom: item.product.rom || "",
      },
      quantity: item.quantity,
    }));

    // Combine form data and cart data
    const submitData: SubmissionData = {
      personalData: personalData,
      requestDetails: formData,
      cartItems: cartData,
      summary: {
        totalItems: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        pendingPriceItems: cartItems.filter(
          (item) => item.product.price === null
        ).length,
        estimatedROM: estimatedRom,
      },
      submittedAt: new Date().toISOString(),
    };

    submitMutation.mutate(submitData);
  };

  const handleCloseErrorModal = () => {
    setErrorModalOpen(false);
  };

  const handleSubmitSupportTicket = () => {
    // Close the modal
    setErrorModalOpen(false);
    // You can add navigation to a support ticket page or open an external link
    // For now, we'll just close the modal
    // Example: navigate("/support");
    // Example: window.open("https://support.example.com", "_blank");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-submit-request__checkbox">
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <p>
            I understand that the Total does not include products that require
            additional review.
          </p>
        </div>
        <button
          id="submit-request-button"
          type="submit"
          disabled={!isFormValid || submitMutation.isPending}
          className={
            isFormValid && !submitMutation.isPending
              ? "button--submit button"
              : "button--submit button button--disabled"
          }
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      <ErrorModal
        open={errorModalOpen}
        onClose={handleCloseErrorModal}
        errorCode={errorDetails.code}
        errorMessage={errorDetails.message}
        onSubmitTicket={handleSubmitSupportTicket}
      />
    </>
  );
};
