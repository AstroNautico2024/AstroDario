import { createContext, useContext, useState, useEffect } from "react";
import CarritoApiService from "../Services/ConsumoCliente/CarritoService";

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Actualiza el contador cada vez que cambian los items
  useEffect(() => {
    setCartCount(cartItems.reduce((acc, item) => acc + (item.quantity || item.Cantidad || 1), 0));
  }, [cartItems]);

  // Carga inicial del carrito
  useEffect(() => {
    CarritoApiService.getCart().then(items => {
      setCartItems(items);
    });
  }, []);

  const addToCart = async (producto, cantidad = 1) => {
    await CarritoApiService.addItem({ ...producto, quantity: cantidad });
    const items = await CarritoApiService.getCart();
    setCartItems(items);
  };

  const updateQuantity = async (id, quantity) => {
    await CarritoApiService.updateQuantity(id, quantity);
    const items = await CarritoApiService.getCart();
    setCartItems(items);
  };

  const removeItem = async (id) => {
    await CarritoApiService.removeItem(id);
    const items = await CarritoApiService.getCart();
    setCartItems(items);
  };

  const clearCart = async () => {
    await CarritoApiService.clearCart();
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        setCartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};