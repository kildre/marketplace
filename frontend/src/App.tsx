import { Routes, Route } from "react-router-dom";
import { GovernmentBanner } from "./components/government-banner/government-banner";
import { Header } from "./components/header/header-component";
import { Sidebar } from "./components/sidebar/sidebar";
import { Footer } from "./components/footer/footer-component";
import { ProductCatalog } from "./pages/product-catalog/product-catalog";
import { Cart } from "./pages/cart/cart";
import { Requests } from "./pages/requests/requests";
import { RequestDetail } from "./pages/request-detail/request-detail";
import { ApproverRedirectGuard } from "./components/auth/ApproverRedirectGuard";
import { AuthStatusPage } from "./pages/auth-status/auth-status";
import { useAuth } from "./hooks/useAuth";
import { AppRoles } from "./types/auth";
import "./styles/main.scss";

function App(): React.ReactElement {
  const { hasRole } = useAuth();

  // Role-based home component selection
  const getHomeComponent = () => {
    if (hasRole(AppRoles.APPROVER)) {
      return <Requests />;
    } else if (hasRole(AppRoles.REQUESTOR)) {
      return <ProductCatalog />;
    } else {
      // Default fallback if no specific role
      return <ProductCatalog />;
    }
  };

  return (
    <div className="app-wrapper">
      <GovernmentBanner />
      <Header />
      <main className="main-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={getHomeComponent()} />
          <Route 
            path="/cart" 
            element={
              <ApproverRedirectGuard>
                <Cart />
              </ApproverRedirectGuard>
            } 
          />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/:userId" element={<Requests />} />
          <Route path="/request-detail" element={<RequestDetail />} />
          {/* Development-only auth status page */}
          {import.meta.env.DEV && (
            <Route path="/auth-status" element={<AuthStatusPage />} />
          )}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
