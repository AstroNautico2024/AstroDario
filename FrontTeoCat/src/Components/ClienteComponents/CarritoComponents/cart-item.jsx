"use client"

import { motion } from "framer-motion"
import { Button } from "react-bootstrap"

const updateQuantity = (idProducto, nuevaCantidad) => {
  fetch(`/api/carrito/${idCliente}/${idProducto}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Cantidad: nuevaCantidad })
  }).then(() => {
    // Actualiza el estado/cartItems aquí
  });
};

const removeItem = (idProducto) => {
  fetch(`/api/carrito/${idCliente}/${idProducto}`, {
    method: "DELETE"
  }).then(() => {
    // Actualiza el estado/cartItems aquí
  });
};

const CartItem = ({ item, updateQuantity, removeItem }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="cart-item"
    >
      <td>
        <div className="d-flex align-items-center">
          <div className="cart-item-image me-3">
            <img
              src={item.image || "/placeholder.svg?height=60&width=60"}
              alt={item.name}
              className="img-fluid rounded"
            />
          </div>
          <div>
            <h6 className="cart-item-name mb-0">{item.name}</h6>
            {item.category && <small className="text-muted">{item.category}</small>}
          </div>
        </div>
      </td>
      <td className="cart-item-price">${item.price.toLocaleString()}</td>
      <td>
        <div className="cart-quantity-controls">
          <Button
            variant="outline-secondary"
            size="sm"
            className="quantity-btn"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <i className="bi bi-dash"></i>
          </Button>
          <span className="quantity-display">{item.quantity}</span>
          <Button
            variant="outline-secondary"
            size="sm"
            className="quantity-btn"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <i className="bi bi-plus"></i>
          </Button>
        </div>
      </td>
      <td className="cart-item-subtotal">${(item.price * item.quantity).toLocaleString()}</td>
      <td>
        <Button variant="link" className="cart-item-remove" onClick={() => removeItem(item.id)}>
          <i className="bi bi-trash"></i>
        </Button>
      </td>
    </motion.tr>
  )
}

export default CartItem

