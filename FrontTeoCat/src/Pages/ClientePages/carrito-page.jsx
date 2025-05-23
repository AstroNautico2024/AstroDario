"use client";

import React, { useState } from "react";
import { useCart } from "../../Context/CartContext.jsx";
import { Link } from "react-router-dom";
import ComprasCliente from "../../Services/ConsumoCliente/ComprasCliente.js";
import { toast, ToastContainer } from "react-toastify"; // Importar ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importar estilos de react-toastify
import "../../Pages/ClientePages/carrito-page.scss";

const CarritoPage = () => {
  const { cartItems, cartCount, updateQuantity, removeItem, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcular el total de las compras
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="carrito-page empty-cart">
        <h1 className="page-title">Carrito de Compras</h1> {/* Título agregado */}
        <h2>Tu carrito está vacío</h2>
        <Link to="/catalogo" className="btn btn-primary">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (id, quantity) => {
    if (quantity > 0) {
      updateQuantity(id, quantity);
    }
  };

  const handleProceedToPayment = async () => {
    if (isProcessing) return; // Evita doble envío
    setIsProcessing(true);

    try {
      if (cartItems.length === 0) {
        toast.error("Tu carrito está vacío.");
        setIsProcessing(false);
        return;
      }

      // Obtener y parsear el usuario desde el localStorage
      const localStorageUser = JSON.parse(localStorage.getItem("userData")) || {}; // Parsear el JSON

      // Validar que los datos necesarios existan
      if (!localStorageUser.cliente?.id || !localStorageUser.id) {
        toast.error("No se pudo obtener la información del usuario. Por favor, inicia sesión.");
        setIsProcessing(false);
        return;
      }


          const detallesProductos = cartItems.map((item) => ({
      IdProducto: item.id,
      Cantidad: item.quantity,
      PrecioUnitario: item.price,
      Subtotal: item.price * item.quantity,
    }));

    // Crear el objeto de compra
    // Crear el objeto de compra
    const compraData = {
      venta: {
        IdCliente: localStorageUser.cliente.id, // Agregar IdCliente
        IdUsuario: localStorageUser.id, // Agregar IdUsuario
        FechaVenta: new Date().toISOString().slice(0, 19).replace("T", " "), // Formato compatible con MySQL
        TotalMonto: totalPrice, // Total de la compra
        Estado: "Pendiente", // Estado inicial de la compra
        MetodoPago: "Transferencia", // Método de pago inicial
      },
      detallesProductos, // Detalles de los productos
    };



      // Enviar la compra al backend usando ComprasCliente.create
      await ComprasCliente.create(compraData);

      toast.success("Compra registrada exitosamente. Redirigiendo a WhatsApp...", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        clearCart();
      }, 3200);

      // Redirigir a WhatsApp
      const phoneNumber = "3128914563";
      const message = `Hola, quiero proceder con el pago de mi carrito. El total es: $${totalPrice.toLocaleString()}`;
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      setTimeout(() => {
        window.open(whatsappURL, "_blank");
        setIsProcessing(false);
      }, 3000);
    } catch (error) {
      console.error("Error al registrar la compra:", error);
      toast.error(
        error?.response?.data?.message ||
          "Hubo un error al procesar tu compra. Por favor, inténtalo de nuevo.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      setIsProcessing(false);
    }
  };
  return (
    <div className="carrito-page">
      <ToastContainer /> {/* Asegúrate de que el ToastContainer no interfiera */}
      <h1 className="page-title">Carrito de Compras</h1> {/* Título agregado */}
      <div className="carrito-items">
        {cartItems.map((item) => (
          <div key={item.id} className="carrito-item">
            <div className="carrito-item-info">
                     <img
          src={item.images || "/placeholder.svg"} // Verifica si `item.image` está disponible
          alt={item.name}
          className="carrito-item-image img-fluid rounded"
        />
              <div>
                <h3 className="carrito-item-name">{item.name}</h3>
                <p className="carrito-item-price">Precio: ${item.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="carrito-item-actions">
              <div className="quantity-controls">
                <button
                  className="btn btn-secondary quantity-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="quantity-display">{item.quantity}</span>
                <button
                  className="btn btn-secondary quantity-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-danger carrito-item-remove"
                onClick={() => removeItem(item.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="carrito-footer">
        <div className="total-price">
          <span>Total: </span>
          <strong>${totalPrice.toLocaleString()}</strong>
        </div>
        <div className="carrito-buttons">
          <button className="btn btn-danger btn-clear-cart" onClick={clearCart}>
            Vaciar carrito
          </button>
          <button
            className="btn btn-success btn-proceed-payment"
            onClick={handleProceedToPayment}
            disabled={isProcessing}
          >
            {isProcessing ? "Procesando..." : "Proceder al pago"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarritoPage;
