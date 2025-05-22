import { createContext, useContext, useState, useEffect } from "react";
import CarritoApiService from "../Services/ConsumoCliente/CarritoService";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    CarritoApiService.getCart().then(items => {
      setCartItems(items);
      setCartCount(items.reduce((acc, item) => acc + (item.quantity || 1), 0));
    });
  }, []);

  const addToCart = async (producto) => {
    await CarritoApiService.addItem(producto);
    const items = await CarritoApiService.getCart();
    setCartItems(items);
    setCartCount(items.reduce((acc, item) => acc + (item.quantity || 1), 0));
  };

  const updateQuantity = async (id, quantity) => {
    await CarritoApiService.updateQuantity(id, quantity);
    const items = await CarritoApiService.getCart();
    setCartItems(items);
    setCartCount(items.reduce((acc, item) => acc + (item.quantity || 1), 0));
  };

  const removeItem = async (id) => {
    await CarritoApiService.removeItem(id);
    const items = await CarritoApiService.getCart();
    setCartItems(items);
    setCartCount(items.reduce((acc, item) => acc + (item.quantity || 1), 0));
  };

  const clearCart = async () => {
    await CarritoApiService.clearCart();
    setCartItems([]);
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};