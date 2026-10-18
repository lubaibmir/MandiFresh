import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

// Cart line: { listingId, name, unit, price, qty, vendorId, vendorName }
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);

  const add = (line) =>
    setItems((prev) => {
      const found = prev.find((i) => i.listingId === line.listingId);
      if (found) return prev.map((i) => (i.listingId === line.listingId ? { ...i, qty: i.qty + line.qty, price: line.price } : i));
      return [...prev, line];
    });
  const setQty = (listingId, qty) =>
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.listingId !== listingId) : prev.map((i) => (i.listingId === listingId ? { ...i, qty } : i))));
  const remove = (listingId) => setItems((prev) => prev.filter((i) => i.listingId !== listingId));
  const clear = () => setItems([]);

  const count = items.length;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</CartContext.Provider>;
}
