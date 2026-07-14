import { useState, useCallback } from 'react';

export default function useCart() {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setItems((prev) => {
      const updated = prev.map((i) => {
        if (i.id === productId) {
          const newQty = i.quantity + delta;
          return newQty <= 0 ? null : { ...i, quantity: newQty };
        }
        return i;
      });
      return updated.filter(Boolean);
    });
  }, []);

  const total = items.reduce((sum, i) => sum + i.preco * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const checkoutWhatsApp = useCallback(() => {
    const message = items
      .map((i) => `• ${i.nome} x${i.quantity} = R$ ${(i.preco * i.quantity).toFixed(2)}`)
      .join('\n');
    const totalFormatted = total.toFixed(2);
    const text = encodeURIComponent(
      `🛒 *Pedido Garagem do MEEC*\n\n${message}\n\n💰 *Total: R$ ${totalFormatted}*\n\n📌 Retirada na oficina ou entrega a combinar.`
    );
    window.open(`https://wa.me/5561981257477?text=${text}`, '_blank');
  }, [items, total]);

  return {
    items,
    isOpen,
    total,
    count,
    addItem,
    removeItem,
    updateQuantity,
    toggleCart,
    closeCart,
    checkoutWhatsApp,
  };
}
