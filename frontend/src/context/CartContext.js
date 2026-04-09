import React, { createContext, useState, useCallback } from "react";
import { cartAPI } from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const applyCartData = useCallback((cartData) => {
    setCartItems(Array.isArray(cartData?.items) ? cartData.items : []);
    setTotal(Number(cartData?.total) || 0);
  }, []);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      applyCartData(response.data);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [applyCartData]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const response = await cartAPI.addToCart({ productId, quantity });
      applyCartData(response.data);
      return true;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      return false;
    }
  }, [applyCartData]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      applyCartData(response.data);
      return true;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      return false;
    }
  }, [applyCartData]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const response = await cartAPI.updateCart(productId, quantity);
      applyCartData(response.data);
      return true;
    } catch (error) {
      console.error("Failed to update cart:", error);
      return false;
    }
  }, [applyCartData]);

  const clearCart = useCallback(async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      setTotal(0);
      return true;
    } catch (error) {
      console.error("Failed to clear cart:", error);
      return false;
    }
  }, []);

  const value = {
    cartItems,
    total,
    loading,
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount: Array.isArray(cartItems) ? cartItems.length : 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
