import { Link } from "react-router-dom";
import { PageTitle } from "@/components/page-title/page-title";
import { useCart } from "../../contexts/CartContext";
import { Typography, Box, Button, Card } from "@mui/material";
import { CartForm } from "@/components/cart-form/cart-form";
import { FormPersonalInformation } from "@/components/form-personal-information/form-personal-information";

export const Cart = (): React.ReactElement => {
  const { cartItems, cartCount, removeFromCart, clearCart } = useCart();

  const formatPrice = (price: number, rom?: string) => {
    if (rom) return rom;
    if (price === 0) return "Free";
    return `$${price.toLocaleString()}`;
  };

  const getIconPath = (type: string) => {
    switch (type) {
      case "Usage Based Tool":
        return "/assets/icons/icon_user-tool.png";
      case "Bundle":
        return "/assets/icons/icon_bundle.png";
      case "Seat Based Tool":
        return "/assets/icons/icon_seat-based-tool.png";
      default:
        return "/assets/icons/icon_user-tool.png";
    }
  };

  if (cartCount === 0) {
    return (
      <div className="cart-page marketplace-content">
        <Link to="/" className="cart-form__breadcrumb">
          Return to Catalog
        </Link>
        <PageTitle title="Cart" />
        <div className="cart-page__content-wrapper">
          <div className="cart-page__content-left">
            <h2>Your cart is empty</h2>
            <p>
              Please return to the <Link to="/">Product Catalog</Link> to select
              items to be requested.
            </p>
          </div>
          <div className="cart-page__content-right">
            <FormPersonalInformation />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="cart-page marketplace-content">
        <Link to="/" className="cart-form__breadcrumb">
          Return to Catalog
        </Link>
        <PageTitle title="Cart" />
        <div className="cart-page__content-wrapper">
          <div className="cart-page__content-left">
            <CartForm />
            <Box mb={2}>
              <Typography variant="h6">
                Cart Items ({cartCount}{" "}
                {cartCount === 1 ? "product" : "products"})
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total quantities will be shown during checkout
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              {cartItems.map(({ product, quantity }) => (
                <Card
                  key={product.id}
                  className="cart-item-card"
                  sx={{
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                >
                  <Box className="icon-container" mr={2}>
                    <img
                      src={getIconPath(product.type)}
                      alt={`${product.type} icon`}
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>

                  <Box flex={1}>
                    <Typography variant="h6" component="h3">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {product.type} • {formatPrice(product.price, product.rom)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                      Quantity: {quantity}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => removeFromCart(product.id)}
                    sx={{ ml: 2 }}
                  >
                    Remove
                  </Button>
                </Card>
              ))}
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={4}
              pt={2}
              borderTop="1px solid #e0e0e0"
            >
              <Button variant="outlined" color="secondary" onClick={clearCart}>
                Clear Cart
              </Button>
            </Box>
          </div>
          <div className="cart-page__content-right">
            <FormPersonalInformation />
          </div>
        </div>
      </div>
    );
  }
};
