import React, { useMemo } from "react";
import { PageTitle } from "../../components/page-title/page-title";
import { ProductCard } from "../../components/card/product-card";
import { mockProducts } from "../../data/mock-productData";
import { Product } from "../../types/products";
import { useCart } from "../../contexts/CartContext";

export const ProductCatalog = (): React.ReactElement => {
  const { updateCartQuantity, getProductCartQuantity, isProductInCart } =
    useCart();

  // Create products with current cart quantities from context
  const products = useMemo(() => {
    return mockProducts.items.map((product) => ({
      ...product,
      currentlyInCart: getProductCartQuantity(product.id),
      inCart: isProductInCart(product.id),
    }));
  }, [getProductCartQuantity, isProductInCart]);

  /* v8 ignore next 4 */
  const handleAddToCart = (_product: Product) => {
    // This function is kept for compatibility but not used
    // The product card will use handleUpdateCartQuantity directly
  };

  const handleUpdateCartQuantity = (product: Product, newQuantity: number) => {
    updateCartQuantity(product, newQuantity);
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
