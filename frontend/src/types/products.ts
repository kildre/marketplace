// @src/types/product.ts

export type ProductType =
  | "Consumption Based"
  | "License Based"
  | "Consumption Based Tool";

export type CartStatus = "available" | "unavailable";

export interface Product {
  id: number;
  type: ProductType;
  name: string;
  description: string;
  price: number | null; // Price can be null for rom products
  unit: number;
  inCart: boolean;
  currentlyInCart: number;
  cartStatus?: CartStatus;
  rom?: string; // Optional ROM label (e.g., "Custom ROM")
}

export interface ProductItems {
  items: Product[];
  itemCount: number;
  pageCount: number;
  prevPage: number | null;
  nextPage: number | null;
}
