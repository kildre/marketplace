export const FormPersonalInformation = (): React.ReactElement => {
  return (
    <div className="form-personal-information__section">
      <h5>Personal Information</h5>
      <p>
        NAME:<span id="username">Joe Snuffy</span>
      </p>
      <p>
        EMAIL:<span id="email">Joe.Snuffy.mil@army.mil</span>
      </p>
      <p>
        DESIGNATION:<span id="designation">Military</span>
      </p>
      <p>
        AGENCY:<span id="agency">III Corps</span>
      </p>
    </div>
  );
};
