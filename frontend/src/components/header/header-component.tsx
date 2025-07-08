import { Link } from "react-router-dom";

export const Header = (): React.ReactElement => {
  return (
    <header className="header">
      <Link to="/" aria-label="Go to home page">
        <img src="/assets/logos/LOGOS.png" alt="Logo" className="header-logo" />
      </Link>
    </header>
  );
};
