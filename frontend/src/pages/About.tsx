import React from 'react';

export const About = (): React.ReactElement => {

  return (
    <div className="container">
      <section aria-labelledby="about-heading">
        <h1 id="about-heading">About the Advana Marketplace</h1>
        <p>
          Your one-stop shop for everything you need to innovate faster. Whether you’re a data scientist hunting for the perfect dataset
          or a developer spinning up compute resources, our Storefront makes it as easy as “add to cart.”
        </p>
      </section>
    </div>
  );
};

