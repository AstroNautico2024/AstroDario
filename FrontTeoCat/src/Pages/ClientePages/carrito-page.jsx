"use client"

import { useEffect } from "react";
import { useCart } from "../../Context/CartContext.jsx";
import CartItem from "../../Components/ClienteComponents/CarritoComponents/cart-item.jsx";
import { Table } from "react-bootstrap";

const CarritoPage = () => {
  const { cartItems, setCartItems } = useCart();

  console.log("cartItems en CarritoPage:", cartItems); // <-- Agrega este log

  // Trae el carrito del backend al cargar la página
  useEffect(() => {
    fetch("http://localhost:3000/api/carrito", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => setCartItems(data))
      .catch(() => setCartItems([]));
  }, [setCartItems]);

  // Funciones para actualizar/eliminar (puedes mejorarlas según tu backend)
  const updateQuantity = (idProducto, nuevaCantidad) => {
    fetch(`http://localhost:3000/api/carrito/${idProducto}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ Cantidad: nuevaCantidad }),
    })
      .then(() => {
        // Refresca el carrito
        fetch("http://localhost:3000/api/carrito", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
          .then(res => res.json())
          .then(data => setCartItems(data));
      });
  };

  const removeItem = (idProducto) => {
    fetch(`http://localhost:3000/api/carrito/${idProducto}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(() => {
        // Refresca el carrito
        fetch("http://localhost:3000/api/carrito", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
          .then(res => res.json())
          .then(data => setCartItems(data));
      });
  };

  return (
    <div>
      <h2>Mi Carrito</h2>
      {(!Array.isArray(cartItems) || cartItems.length === 0) ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(item => (
              <CartItem
                key={item.id || item.IdProducto}
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default CarritoPage;
