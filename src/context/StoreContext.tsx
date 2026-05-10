import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { coupons, products, sellers } from '../data/mock';
import type { CartItem, Order, PaymentMethod } from '../types';

type ToastTone = 'success' | 'info' | 'error';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface StoreContextValue {
  cart: CartItem[];
  favorites: string[];
  sellerId: string;
  couponCode: string;
  affiliateCode: string;
  orders: Order[];
  toast?: Toast;
  setSellerId: (sellerId: string) => void;
  setCouponCode: (code: string) => void;
  setAffiliateCode: (code: string) => void;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  clearCart: () => void;
  submitOrder: (paymentMethod: PaymentMethod, total: number) => Order;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => readJson('aura_cart', []));
  const [favorites, setFavorites] = useState<string[]>(() => readJson('aura_favorites', []));
  const [orders, setOrders] = useState<Order[]>(() => readJson('aura_orders', []));
  const [sellerId, setSellerIdState] = useState(() => localStorage.getItem('aura_seller') || sellers[4].id);
  const [couponCode, setCouponCodeState] = useState(() => localStorage.getItem('aura_coupon') || '');
  const [affiliateCode, setAffiliateCodeState] = useState(() => localStorage.getItem('aura_affiliate') || '');
  const [toast, setToast] = useState<Toast>();

  const notify = (message: string, tone: ToastTone = 'success') => {
    const next = { id: Date.now(), message, tone };
    setToast(next);
    window.setTimeout(() => setToast((current) => (current?.id === next.id ? undefined : current)), 2600);
  };

  const persistCart = (next: CartItem[]) => {
    setCart(next);
    writeJson('aura_cart', next);
  };

  const persistFavorites = (next: string[]) => {
    setFavorites(next);
    writeJson('aura_favorites', next);
  };

  const setSellerId = (id: string) => {
    setSellerIdState(id);
    localStorage.setItem('aura_seller', id);
  };

  const setCouponCode = (code: string) => {
    const normalized = code.trim().toUpperCase();
    setCouponCodeState(normalized);
    localStorage.setItem('aura_coupon', normalized);
    if (normalized) {
      notify(coupons.some((coupon) => coupon.code === normalized) ? 'Cupom aplicado.' : 'Cupom nao encontrado.', coupons.some((coupon) => coupon.code === normalized) ? 'success' : 'error');
    }
  };

  const setAffiliateCode = (code: string) => {
    const normalized = code.trim().toUpperCase();
    setAffiliateCodeState(normalized);
    localStorage.setItem('aura_affiliate', normalized);
    if (normalized) notify('Codigo de afiliado vinculado ao pedido.', 'info');
  };

  const addToCart = (productId: string, quantity = 1) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const next = cart.some((item) => item.productId === productId)
      ? cart.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item))
      : [...cart, { productId, quantity: Math.min(product.stock, quantity) }];
    persistCart(next);
    notify(`${product.name} adicionado ao carrinho.`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const next = cart
      .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(product.stock, quantity)) } : item))
      .filter((item) => item.quantity > 0);
    persistCart(next);
  };

  const removeFromCart = (productId: string) => {
    persistCart(cart.filter((item) => item.productId !== productId));
    notify('Item removido.', 'info');
  };

  const toggleFavorite = (productId: string) => {
    const next = favorites.includes(productId) ? favorites.filter((id) => id !== productId) : [...favorites, productId];
    persistFavorites(next);
    notify(favorites.includes(productId) ? 'Removido dos favoritos.' : 'Produto salvo nos favoritos.', 'info');
  };

  const clearCart = () => persistCart([]);

  const submitOrder = (paymentMethod: PaymentMethod, total: number) => {
    const order: Order = {
      id: `AUR-${Math.floor(10000 + Math.random() * 89999)}`,
      createdAt: new Date().toISOString(),
      items: cart,
      sellerId,
      couponCode: couponCode || undefined,
      affiliateCode: affiliateCode || undefined,
      paymentMethod,
      total,
      status: 'Pedido aprovado',
    };
    const next = [order, ...orders];
    setOrders(next);
    writeJson('aura_orders', next);
    clearCart();
    notify('Pedido aprovado com sucesso.');
    return order;
  };

  const value = useMemo(
    () => ({
      cart,
      favorites,
      sellerId,
      couponCode,
      affiliateCode,
      orders,
      toast,
      setSellerId,
      setCouponCode,
      setAffiliateCode,
      addToCart,
      updateQuantity,
      removeFromCart,
      toggleFavorite,
      clearCart,
      submitOrder,
    }),
    [cart, favorites, sellerId, couponCode, affiliateCode, orders, toast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
