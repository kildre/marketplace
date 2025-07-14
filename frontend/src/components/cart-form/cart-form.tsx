import React from "react";
import { FormRequestDetails } from "../form-request-details/form-request-details";

interface FormValues {
  organization: string;
  organizationOther: string;
  pocName: string;
  pocPhone: string;
  pocEmail: string;
  useCaseDescription: string;
}

export const CartForm = (): React.ReactElement => {
  // State to hold the form values
  const [formValues, setFormValues] = React.useState<FormValues>({
    organization: "",
    organizationOther: "",
    pocName: "",
    pocPhone: "",
    pocEmail: "",
    useCaseDescription: "",
  });

  const handleChange = (
    e:
      | React.ChangeEvent<{ name?: string; value: unknown }>
      | { target: { name?: string; value: unknown } }
  ) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    if (name) {
      setFormValues((prevData) => ({ ...prevData, [name]: value }));
    }

    if (name === "organization" && value !== "Other") {
      // Reset organizationOther if a different organization is selected
      setFormValues((prevData) => ({ ...prevData, organizationOther: "" }));
    }
  };

  // Handle form submission
  // @TODO: change from console logging to actual form submission logic
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log("Form submitted:", formValues);
    // Add logic to send data to a backend or perform other actions
  };

  return (
    <div className="cart-form__container">
      <form onSubmit={handleSubmit} className="cart-form">
        <FormRequestDetails
          formValues={formValues}
          handleChange={handleChange}
        />
        <button className="button--submit button" type="submit">
          Submit Request
        </button>
      </form>
    </div>
  );
};
