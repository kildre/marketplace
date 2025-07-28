import React from "react";
import { FormRequestDetails } from "../form-request-details/form-request-details";

export const CartForm = (): React.ReactElement => {
  return (
    <div className="cart-form__container">
      <form id="cart-form" className="cart-form">
        <FormRequestDetails />
      </form>
    </div>
  );
};
