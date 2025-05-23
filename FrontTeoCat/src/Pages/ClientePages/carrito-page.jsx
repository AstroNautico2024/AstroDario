"use client";

import React from "react";
import { useCart } from "../../Context/CartContext.jsx";
import { Link } from "react-router-dom";
import ComprasService from "../../Services/ConsumoAdmin/ComprasService.js";
import DetalleComprasService from "../../Services/ConsumoAdmin/DetalleComprasService.js";
import { toast, ToastContainer } from "react-toastify"; // Importar ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importar estilos de react-toastify
import "../../Pages/ClientePages/carrito-page.scss";

const CarritoPage = () => {
  const { cartItems, cartCount, updateQuantity, removeItem, clearCart } = useCart();

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
    try {
      // Crear los detalles de la compra en el backend
      const detalles = cartItems.map((item) => ({
        IdProducto: item.id,
        Cantidad: item.quantity,
        PrecioUnitario: item.price,
        Subtotal: item.price * item.quantity,
      }));

      // Iterar sobre los detalles y enviarlos al backend
      for (const detalle of detalles) {
        await DetalleComprasService.create(detalle);
      }

      console.log("Detalles de compra creados exitosamente");

      // Mostrar notificación de éxito
      toast.success("Compra registrada exitosamente. Redirigiendo a WhatsApp...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Redirigir a WhatsApp
      const phoneNumber = "3128914563"; // Reemplaza con el número de WhatsApp del negocio
      const message = `Hola, quiero proceder con el pago de mi carrito. El total es: $${totalPrice.toLocaleString()}`;
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      setTimeout(() => {
        window.open(whatsappURL, "_blank");
      }, 3000); // Esperar a que el toast se cierre antes de redirigir
    } catch (error) {
      console.error("Error al crear los detalles de la compra:", error);

      // Mostrar notificación de error
      toast.error("Hubo un error al procesar tu compra. Por favor, inténtalo de nuevo.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
              <img src={item.image} alt={item.name} className="carrito-item-image" />
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
          >
            Proceder al pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarritoPage;
