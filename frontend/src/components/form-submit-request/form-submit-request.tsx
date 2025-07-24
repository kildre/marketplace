import React from "react";
import { useNavigate } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import { useCart } from "../../contexts/CartContext";
import {
  useFormData,
  useSubmitRequest,
  SubmissionData,
} from "../../hooks/useFormQueries";
import { generateRequestId } from "../../utils/helper-functions";

export const FormSubmitRequest = (): React.ReactElement => {
  const [checked, setChecked] = React.useState(false);
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const formData = useFormData();
  const submitMutation = useSubmitRequest();

  // Check if form is valid for submission
  const isFormValid = React.useMemo(() => {
    // If checkbox is not checked, form is invalid
    if (!checked) {
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
  }, [checked, formData.organization, formData.organizationOther]);

  // Navigate to requests page on successful submission
  React.useEffect(() => {
    if (submitMutation.isSuccess) {
      clearCart(); // Clear the cart items
      navigate("/requests"); // Then redirect to requests page
    }
  }, [submitMutation.isSuccess, navigate, clearCart]);

  const handleSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    const estimatedRom = document.getElementById("estimatedRom")?.innerHTML;

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

    // Generate a unique request ID
    const requestId = generateRequestId(7);

    // Combine form data and cart data
    const submitData: SubmissionData = {
      requestId: requestId,
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

  return (
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
      {submitMutation.isError && (
        <div className="error-message">
          <p>Error submitting request. Please try again.</p>
        </div>
      )}
    </form>
  );
};
