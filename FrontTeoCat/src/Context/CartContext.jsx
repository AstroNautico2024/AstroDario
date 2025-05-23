import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Cargar el carrito desde localStorage al iniciar
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(storedCart);
    setCartCount(storedCart.reduce((acc, item) => acc + (item.quantity || 1), 0));
  }, []);

  const addToCart = (producto, quantity = 1) => {
    if (!producto) return;

    // Obtener el carrito actual del localStorage
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Verificar si el producto ya está en el carrito
    const existingProductIndex = currentCart.findIndex((item) => item.id === producto.id);

    if (existingProductIndex >= 0) {
      // Si el producto ya está en el carrito, incrementar la cantidad
      currentCart[existingProductIndex].quantity += quantity;
    } else {
      // Si no, añadir el producto con la cantidad seleccionada
      currentCart.push({
        ...producto,
        quantity: quantity,
      });
    }

    // Guardar el carrito actualizado en localStorage
    localStorage.setItem("cart", JSON.stringify(currentCart));

    // Actualizar el estado del carrito
    setCartItems(currentCart);
    setCartCount(currentCart.reduce((acc, item) => acc + item.quantity, 0));

  };

  const updateQuantity = (id, quantity) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = currentCart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));
  };

  const removeItem = (id) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = currentCart.filter((item) => item.id !== id);

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));

    // Mostrar notificación con react-toastify
    toast.info("Producto eliminado del carrito", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
    setCartCount(0);

    // Mostrar notificación con react-toastify
    toast.warn("Carrito vaciado", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
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