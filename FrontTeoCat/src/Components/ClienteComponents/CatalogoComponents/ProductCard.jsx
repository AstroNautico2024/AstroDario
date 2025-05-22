"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, Button } from "react-bootstrap"
import { toast } from "react-toastify"
import { useCart } from "../../../Context/CartContext.jsx"
import "./ProductCard.scss"

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()

  if (!product) {
    console.warn("Se intentó renderizar un ProductCard con un producto nulo o indefinido")
    return null
  }

  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : product.image || "/placeholder.svg"

  const handleAddToCart = (e) => {
    e.stopPropagation()
    e.preventDefault()
    addToCart(product, 1) // Puedes pasar la cantidad deseada
    toast.success("Producto añadido al carrito", {
      position: "top-right",
      autoClose: 2000, // Se cierra en 2 segundos
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false, // <--- Esto es importante
      draggable: true,
      progress: undefined,
    })
  }

  return (
    <div
      className="product-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="product-card h-100 border-0 shadow-sm">
        <div className="card-img-container">
          <Link to={`/producto/${product.id}`} className="text-decoration-none">
            <Card.Img
              variant="top"
              src={productImage}
              alt={product.name}
              className={`product-image ${isHovered ? "zoomed" : ""}`}
              onError={(e) => {
                e.target.src = "/placeholder.svg"
              }}
            />
          </Link>
          <div className={`quick-actions ${isHovered ? "visible" : ""}`}>
            <button className="quick-action-btn" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus"></i>
            </button>
            <Link to={`/producto/${product.id}`} className="quick-action-btn">
              <i className="bi bi-eye"></i>
            </Link>
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

          <Card.Title className="product-title">
            <Link to={`/producto/${product.id}`} className="text-decoration-none text-dark">
              {product.name}
            </Link>
          </Card.Title>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="product-price">
              <span className="current-price">
                ${product.price ? product.price.toLocaleString() : "0"}
              </span>
            </div>
            <Button variant="brown" className="d-md-none" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus"></i>
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ProductCard