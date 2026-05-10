export type Gender = 'feminino' | 'masculino' | 'unissex';
export type ProductTag = 'lancamento' | 'promocao' | 'mais vendido' | 'exclusivo';
export type PaymentMethod = 'card' | 'pix';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  gender: Gender;
  family: string;
  volume: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviews: number;
  description: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  stock: number;
  tag: ProductTag;
  tone: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  label: string;
  type: 'percent' | 'freeShipping';
  value: number;
}

export interface Seller {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface Affiliate {
  id: string;
  name: string;
  code: string;
  clicks: number;
  sales: number;
  commission: number;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  sellerId: string;
  couponCode?: string;
  affiliateCode?: string;
  paymentMethod: PaymentMethod;
  total: number;
  status: string;
}
