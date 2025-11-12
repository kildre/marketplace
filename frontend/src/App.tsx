import { Route, Routes } from "react-router-dom";
import { ApproverRedirectGuard } from "./components/auth/ApproverRedirectGuard";
import { Footer } from "./components/footer/footer-component";
import { GovernmentBanner } from "./components/government-banner/government-banner";
import { Sidebar } from "./components/sidebar/sidebar";
import { useAuth } from "./hooks/useAuth";
import { useCartUserSync } from "./hooks/useCartUserSync";
import { AuthStatusPage } from "./pages/auth-status/auth-status";
import { Cart } from "./pages/cart/cart";
import { ProductCatalog } from "./pages/product-catalog/product-catalog";
import { RequestDetail } from "./pages/request-detail/request-detail";
import { Requests } from "./pages/requests/requests";
import { Error403 } from "./pages/error-403/error-403";
import { Error404 } from "./pages/error-404/error-404";
import { Error500 } from "./pages/error-500/error-500";
import { Notifications } from "./pages/notifications/notifications";
import { AppRoles } from "./types/auth";
// @ts-ignore
import AdvanaMenu from "@advana/platform-ui/dist/AdvanaMenu";
import { RoleGuard } from "./components/auth/RoleGuard";
import CartOverlayButton from "./components/CartOverlayButton";
import CustomMenuLogoSection from "./components/CustomMenuLogoSection";
import NotificationBellButton from "./components/NotificationBellButton";
import { NotificationProvider } from "./contexts/NotificationContext";
import Metrics from "./pages/metrics/metrics";
import "./styles/main.scss";

function App(): React.ReactElement {
  const { hasRole } = useAuth();

  // Automatically clear cart when user changes
  useCartUserSync();

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
    <NotificationProvider>
      <div className="app-wrapper">
        <GovernmentBanner />
        <div className="advana-menu-override advana-service-desk-style header-with-cart">
          {/* Provide local mega menu JSON and disable CRA env mode so props are used */}
          <AdvanaMenu
            menuLogoSection={customLogoSection}
            megaMenuBaseDomain="/"
            isCRA={false}
          />
          <NotificationBellButton />
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
            <Route path="/notifications" element={<Notifications />} />
            <Route
              path="/metrics"
              element={
                <RoleGuard roles={[AppRoles.APPROVER]} redirectTo="/403">
                  <Metrics />
                </RoleGuard>
              }
            />
            {/* Development-only auth status page */}
            {import.meta.env.DEV && (
              <Route path="/auth-status" element={<AuthStatusPage />} />
            )}
            {/* Error pages */}
            <Route path="/403" element={<Error403 />} />
            <Route path="/404" element={<Error404 />} />
            <Route path="/500" element={<Error500 />} />
            {/* Catch-all route for unmatched paths */}
            <Route path="*" element={<Error404 />} />
          </Routes>
        </main>
        <Footer />
        {/* <RoleDebugInfo /> */}
      </div>
    </NotificationProvider>
  );
}

export default App;
