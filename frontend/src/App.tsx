import { Routes, Route } from "react-router-dom";
import { GovernmentBanner } from "./components/government-banner/government-banner";
import { Header } from "./components/header/header-component";
import { Footer } from "./components/footer/footer-component";
import { ProductCatalog } from "./pages/product-catalog/product-catalog";
import { Cart } from "./pages/cart/cart";
import { Requests } from "./pages/requests/requests";
import { RequestDetail } from "./pages/request-detail/request-detail";
import "./styles/main.scss";

function App(): React.ReactElement {
  return (
    <div className="app-wrapper">
      <GovernmentBanner />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductCatalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/request-detail" element={<RequestDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
