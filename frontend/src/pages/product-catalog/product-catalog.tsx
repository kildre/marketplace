import React, { useState } from "react";
import { PageTitle } from "../../components/page-title/page-title";
import { ProductCard } from "../../components/card/product-card";
import { mockProducts } from "../../data/mock-productData";
import { Product } from "../../types/products";

export const ProductCatalog = (): React.ReactElement => {
  const [products, setProducts] = useState(mockProducts.items);

  const handleAddToCart = (product: Product) => {
    // Update the product's cart status
    setProducts((prevProducts: Product[]) =>
      prevProducts.map(
        (p: Product): Product =>
          p.id === product.id
            ? { ...p, inCart: true, currentlyInCart: p.currentlyInCart + 1 }
            : p
      )
    );
  };

  const handleUpdateCartQuantity = (product: Product, newQuantity: number) => {
    // Update the product's cart quantity
    setProducts((prevProducts: Product[]) =>
      prevProducts.map(
        (p: Product): Product =>
          p.id === product.id
            ? { ...p, currentlyInCart: newQuantity, inCart: newQuantity > 0 }
            : p
      )
    );
  };

  return (
    <div className="product-catalog-page marketplace-content">
      <PageTitle title="Product Catalog" />
      <div className="product-card__container">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
          />
        ))}
      </div>
    </div>
  );
};
