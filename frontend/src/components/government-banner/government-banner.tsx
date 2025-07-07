import { useState } from "react";

export const GovernmentBanner = (): React.ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section
      id="gov-banner"
      className="gov-banner"
      aria-label="Official government website"
    >
      <div className="gov-banner__header">
        <div className="gov-banner__container">
          <div className="gov-banner__header-content">
            <div className="gov-banner__flag-icon" aria-hidden="true">
              <img
                src="/assets/icons/us-flag-small.png"
                alt=""
                className="gov-banner__flag-image"
              />
            </div>
            <div className="gov-banner__header-text">
              <p className="gov-banner__text">
                An official website of the United States government
              </p>
              <button
                className="gov-banner__button"
                onClick={toggleExpanded}
                aria-expanded={isExpanded}
                aria-controls="gov-banner-guidance"
                type="button"
              >
                <p className="gov-banner__button-text">Here's how you know</p>
                <div className="gov-banner__button-icon" aria-hidden="true">
                  <img
                    src="/assets/icons/chevron.png"
                    alt="chevron icon"
                    className={`gov-banner__chevron ${
                      isExpanded ? "gov-banner__chevron--expanded" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div
          id="gov-banner-guidance"
          className="gov-banner__guidance"
          aria-hidden={!isExpanded}
        >
          <div className="gov-banner__container">
            <div className="gov-banner__guidance-content">
              <div className="gov-banner__guidance-item">
                <div className="gov-banner__icon" aria-hidden="true">
                  🏛️
                </div>
                <div className="gov-banner__guidance-text">
                  <p>
                    <strong>Official websites use .gov</strong>
                    <br />A <strong>.gov</strong> website belongs to an official
                    government organization in the United States.
                  </p>
                </div>
              </div>

              <div className="gov-banner__guidance-item">
                <div className="gov-banner__icon" aria-hidden="true">
                  🔒
                </div>
                <div className="gov-banner__guidance-text">
                  <p>
                    <strong>Secure .gov websites use HTTPS</strong>
                    <br />A <strong>lock</strong> (🔒) or{" "}
                    <strong>https://</strong> means you've safely connected to
                    the .gov website. Share sensitive information only on
                    official, secure websites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
