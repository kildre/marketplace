import React from "react";
import { FormRequestDetails } from "../form-request-details/form-request-details";

interface FormValues {
  pocName: string;
  pocPhone: string;
  pocEmail: string;
  useCaseDescription: string;
}

export const CartForm = (): React.ReactElement => {
  // State to hold the form values (excluding organization which is now in context)
  const [formValues, setFormValues] = React.useState<FormValues>({
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
  };

  return (
    <div className="cart-form__container">
      <form id="cart-form" className="cart-form">
        <FormRequestDetails
          formValues={formValues}
          handleChange={handleChange}
        />
      </form>
    </div>
  );
};
