import { Routes, Route } from "react-router-dom";
import { GovernmentBanner } from "./components/government-banner/government-banner";
import { Sidebar } from "./components/sidebar/sidebar";
import { Footer } from "./components/footer/footer-component";
import { ProductCatalog } from "./pages/product-catalog/product-catalog";
import { Cart } from "./pages/cart/cart";
import { Requests } from "./pages/requests/requests";
import { RequestDetail } from "./pages/request-detail/request-detail";
import { ApproverRedirectGuard } from "./components/auth/ApproverRedirectGuard";
import { AuthStatusPage } from "./pages/auth-status/auth-status";
import { RoleDebugInfo } from "./components/debug/RoleDebugInfo";
import { useAuth } from "./hooks/useAuth";
import { AppRoles } from "./types/auth";
// @ts-ignore
import AdvanaMenu from '@advana/platform-ui/dist/AdvanaMenu';
import CustomMenuLogoSection from "./components/CustomMenuLogoSection";
import "./styles/main.scss";
// import { useEffect } from 'react';
import CartOverlayButton from './components/CartOverlayButton';
import Metrics from "./pages/metrics/metrics";
import { RoleGuard } from "./components/auth/RoleGuard";

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

  // Create custom logo section for AdvanaMenu
  const customLogoSection = (
    <CustomMenuLogoSection 
      enclave="advana" 
      megaMenuBaseDomain="/"
      isCRA={true}
    />
  );

  return (
    <div className="app-wrapper">
      {/* CUI Banner */}
      <div className="cui-banner">
        <span className="cui-banner__text">CUI</span>
      </div>
      
      <GovernmentBanner />
      <div className="advana-menu-override advana-service-desk-style header-with-cart" style={{ position: 'static', marginTop: 0 }}>
        <AdvanaMenu menuLogoSection={customLogoSection} />
        <CartOverlayButton />
      </div>
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
          <Route
            path="/metrics"
            element={
              <RoleGuard roles={[AppRoles.APPROVER]}>
                <Metrics />
              </RoleGuard>
            }
          />
          {/* Development-only auth status page */}
          {import.meta.env.DEV && (
            <Route path="/auth-status" element={<AuthStatusPage />} />
          )}
        </Routes>
      </main>
      <Footer />
      <RoleDebugInfo />
    </div>
  );
}

export default App;
