import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import { PageTitle } from "../../components/page-title/page-title";
import { ProductCard } from "../../components/card/product-card";
import { mockProducts } from "../../data/mock-productData";
import { Product } from "../../types/products";

export const ProductCatalog = (): React.ReactElement => {
  const [products, setProducts] = useState(mockProducts.items);

  const handleAddToCart = (product: Product) => {
    // Update the product's cart status
    setProducts((prevProducts: Product[]) =>
      prevProducts.map((p: Product): Product =>
        p.id === product.id
          ? { ...p, inCart: true, currentlyInCart: p.currentlyInCart + 1 }
          : p
      )
    );
  };

  const handleUpdateCartQuantity = (product: Product, newQuantity: number) => {
    // Update the product's cart quantity
    setProducts((prevProducts: Product[]) =>
      prevProducts.map((p: Product): Product =>
        p.id === product.id
          ? { ...p, currentlyInCart: newQuantity, inCart: newQuantity > 0 }
          : p
      )
    );
  };

  return (
    <div className="product-catalog-page">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PageTitle title="Product Catalog" />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {products.map((product) => (
            <Box key={product.id}>
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onUpdateCartQuantity={handleUpdateCartQuantity}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </div>
  );
};
