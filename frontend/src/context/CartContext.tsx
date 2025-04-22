import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FoodItem } from "../components/FoodItemModal";

interface CartContextType {
  cartItems: FoodItem[];
  addToCart: (item: FoodItem) => void;
  clearCart: () => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  removeFromCart: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<FoodItem[]>(() => {
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: FoodItem) => {
    const exists = cartItems.find(i => i._id === item._id);
    if (exists) {
      updateQuantity(item._id, exists.quantityToDonation + 1);
    } else {
      setCartItems(prev => [...prev, { ...item, quantityToDonation: 1 }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item._id === id ? { ...item, quantityToDonation: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, clearCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
