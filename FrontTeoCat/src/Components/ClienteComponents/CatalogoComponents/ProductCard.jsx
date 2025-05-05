"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, Button } from "react-bootstrap"
import { toast } from "react-toastify"
import "./ProductCard.scss"

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!product) {
    console.warn("Se intentó renderizar un ProductCard con un producto nulo o indefinido");
    return null;
  }

  console.log("Renderizando ProductCard con producto:", product);

  // Usar la primera imagen del array de imágenes, o una imagen por defecto
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : (product.image || "/placeholder.svg");

  const addToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Obtener el carrito actual del localStorage
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]")

    // Verificar si el producto ya está en el carrito
    const existingProductIndex = currentCart.findIndex((item) => item.id === product.id)

    if (existingProductIndex >= 0) {
      // Si el producto ya está en el carrito, incrementar la cantidad
      currentCart[existingProductIndex].quantity += 1
    } else {
      // Si no, añadir el producto con cantidad 1
      currentCart.push({
        ...product,
        quantity: 1,
      })
    }

    // Guardar el carrito actualizado en localStorage
    localStorage.setItem("cart", JSON.stringify(currentCart))

    // Disparar evento para actualizar contador del carrito
    window.dispatchEvent(new Event("storage"))

    // Mostrar notificación
    toast.success("Producto añadido al carrito", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  }

  return (
    <div
      className="product-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="product-card h-100 border-0 shadow-sm">
        <Link to={`/producto/${product.id}`} className="text-decoration-none">
          <div className="card-img-container">
            <Card.Img
              variant="top"
              src={productImage}
              alt={product.name}
              className={`product-image ${isHovered ? "zoomed" : ""}`}
              onError={(e) => {
                console.warn("Error al cargar la imagen:", productImage);
                e.target.src = "/placeholder.svg";
              }}
            />

            <div className={`quick-actions ${isHovered ? "visible" : ""}`}>
              <button className="quick-action-btn" onClick={addToCart}>
                <i className="bi bi-cart-plus"></i>
              </button>
              <button className="quick-action-btn">
                <i className="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <p className="text-muted mb-0 small">{product.category}</p>
              <div className="d-flex align-items-center">
                <i className="bi bi-star-fill text-warning me-1"></i>
                <span>{product.rating}</span>
              </div>
            </div>

            <Card.Title className="product-title">{product.name}</Card.Title>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="product-price">
                <span className="current-price">${product.price ? product.price.toLocaleString() : "0"}</span>
              </div>

              <Button variant="brown" className="d-md-none" onClick={addToCart}>
                <i className="bi bi-cart-plus"></i>
              </Button>
            </div>
          </Card.Body>
        </Link>
      </Card>
    </div>
  )
}

export default ProductCard