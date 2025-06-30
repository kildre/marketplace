// @src/types/product.ts

export interface Product {
  id: number;
  type: 'Usage Based Tool' | 'Seat Based Tool' | 'Bundle';
  name: string;
  description: string;
  price: number;
  unit?: string;
  inCart: boolean;
  currentlyInCart: number;
  cartStatus?: 'available' | 'unavailable';
  includesInfo?: boolean;
}

export interface ProductItems {
  items: Product[];
  item_count: number;
  page_count: number;
  prev_page: number | null;
  next_page: number | null;
}
