export const FormPersonalInformation = (): React.ReactElement => {
  return (
    <div className="form-personal-information">
      <div className="form-personal-information__section">
        <h4>Personal Information</h4>
        <p>
          NAME:<span>Joe Snuffy</span>
        </p>
        <p>
          EMAIL:<span>Joe.Snuffy.mil@army.mil</span>
        </p>
        <p>
          DESIGNATION:<span>Military</span>
        </p>
        <p>
          AGENCY:<span>III Corps</span>
        </p>
      </div>
      <div className="form-personal-information__section">
        <h4>Cost Details</h4>
        <p>
          PRODUCTS REQUESTED<span>3</span>
        </p>
        <p>
          APPLICATIONS PENDING PRICE<span className="cost-warning">2</span>
        </p>
      </div>
      <h5>
        Estimated ROM<span>$13.00</span>
      </h5>
    </div>
  );
};
