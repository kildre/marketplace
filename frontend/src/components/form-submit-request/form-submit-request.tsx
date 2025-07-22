import React from "react";
import Checkbox from "@mui/material/Checkbox";
import { useCart } from "../../contexts/CartContext";

interface FormData {
  organization: string;
  organizationOther: string;
  pocName: string;
  pocPhone: string;
  pocEmail: string;
  useCaseDescription: string;
}

export const FormSubmitRequest = (): React.ReactElement => {
  const [checked, setChecked] = React.useState(false);
  const [canSubmit, setCanSubmit] = React.useState(false);
  const { cartItems } = useCart();

  // Function to get form values directly from form elements
  const getValue = (name: string): string => {
    const element = document.querySelector(`[name="${name}"]`);
    return (element as { value?: string })?.value || "";
  };

  const getFormData = (): FormData => {
    return {
      organization: getValue("organization"),
      organizationOther: getValue("organizationOther"),
      pocName: getValue("pocName"),
      pocPhone: getValue("pocPhone"),
      pocEmail: getValue("pocEmail"),
      useCaseDescription: getValue("useCaseDescription"),
    };
  };

  // Check if required fields are filled and checkbox is checked
  React.useEffect(() => {
    const checkCanSubmit = () => {
      if (!checked) {
        setCanSubmit(false);
        return;
      }

      const organization = getValue("organization");
      if (organization === "") {
        setCanSubmit(false);
        return;
      }

      if (organization === "Other" && getValue("organizationOther") === "") {
        setCanSubmit(false);
        return;
      }

      setCanSubmit(true);
    };

    checkCanSubmit();

    // Add event listeners to form fields to update canSubmit when they change
    const inputs = document.querySelectorAll(
      '[name="organization"], [name="organizationOther"]'
    );
    inputs.forEach((input) => {
      input.addEventListener("change", checkCanSubmit);
      input.addEventListener("input", checkCanSubmit);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("change", checkCanSubmit);
        input.removeEventListener("input", checkCanSubmit);
      });
    };
  }, [checked]);

  const handleSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    const formData = getFormData();

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
      productId: item.product.id,
      productName: item.product.name,
      productType: item.product.type,
      quantity: item.quantity,
      price: item.product.price,
      description: item.product.description,
      unit: item.product.unit,
      rom: item.product.rom,
    }));

    // Function to generate a unique request ID
    const generateRequestId = (): number => {
      return Math.floor(Math.random() * 1000000); // Simple random ID for demo purposes
    };

    const requestId = generateRequestId();

    // Combine form data and cart data
    const submitData = {
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

    // Output the combined JSON to console
    // eslint-disable-next-line no-console
    console.log("=== FORM SUBMISSION DATA ===");
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(submitData, null, 2));
    // eslint-disable-next-line no-console
    console.log("=============================");
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
        disabled={!canSubmit}
        className={
          canSubmit
            ? "button--submit button"
            : "button--submit button button--disabled"
        }
      >
        Submit Request
      </button>
    </form>
  );
};
