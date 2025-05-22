"use client"

import { useCart } from "../../Context/CartContext.jsx";

const CarritoPage = () => {
  const { cartItems } = useCart();

  return (
    <div>
      <h2>Mi Carrito</h2>
      {cartItems.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        cartItems.map(item => (
          <div key={item.id}>
            <span>{item.name}</span> - <span>{item.quantity || 1}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default CarritoPage;
