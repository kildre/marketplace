import React from "react";

interface PageTitleProps {
  title: string;
  id?: string;
}

export const PageTitle = ({ title }: PageTitleProps): React.ReactElement => {
  const headingId = title.toLowerCase().replace(/\s+/g, "-") + "-heading";

  return (
    <section className="section__page-title" aria-labelledby={headingId}>
      <h1 id={headingId}>{title}</h1>
    </section>
  );
};
