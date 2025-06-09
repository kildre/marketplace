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
      <section>
        <h3><ul><li>1. Centralized Catalog
The portal exposes a curated catalog of:

Applications (e.g., pre-built dashboards, modeling tools)

Datasets (ingested DoD data sources, reference tables)

Services (compute environments, custom analytic support)
Each entry shows a description, owner, version, pricing/licensing terms, and usage metrics.</li>
<li>2. Request & Approval Workflow

Browse & “Add to Cart”: You select the items you need and specify parameters (e.g., dataset filters or app configuration).

Submit Request: Your cart order becomes a ServiceNow ticket with all metadata pre-filled.

Automated Checks: The system verifies entitlements (role-based access, funding code) and compliance (security classification, SLA).

Manager/Owner Approval: Notifications go to data stewards or application owners for sign-off.

Provisioning: Once approved, back-end services spin up resources (e.g., spawn a JupyterHub server, grant database credentials) and a record is logged in CloudTracker for license and cost tracking.</li>
<li>3. Governance, Tracking & Self-Service

Audit & Compliance: Every request and action is logged; dashboards show who’s using what, where, and at what cost.

Role-Based Access: Fine-grained policies ensure only authorized users see or can request sensitive data/services.

Self-Service Extensions: Approved apps/data appear under “My Entitlements” for instant redeployment without re-approval, speeding up repeat use</li>
</ul></h3>
     </section>
    </div>
  );
};

