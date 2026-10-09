import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ovenly_cart');
    if (saved) return JSON.parse(saved);
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ovenly_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, options = '') => {
    setCart(prev => {
      // Check if exact product with same options exists
      const existingIdx = prev.findIndex(item => item.id === product.id && item.options === options);
      if (existingIdx >= 0) {
        const newCart = [...prev];
        newCart[existingIdx].quantity += quantity;
        return newCart;
      }
      return [...prev, { ...product, quantity, options }];
    });
    setIsCartOpen(true); // Auto-open cart
  };

  const removeFromCart = (id, options) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.options === options)));
  };

  const updateQuantity = (id, options, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.options === options) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      isCartOpen, setIsCartOpen, cartTotal, itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
