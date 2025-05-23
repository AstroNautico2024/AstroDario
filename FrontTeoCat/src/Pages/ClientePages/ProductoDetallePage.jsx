"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Button, Tabs, Tab, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import CatalogoService from "../../Services/ConsumoCliente/CatalogoService.js"
import ReviewsService from "../../Services/ConsumoCliente/ReviewsService.js"
import { uploadImageToCloudinary } from "../../Services/uploadImageToCloudinary.js"
import "./ProductoDetallePage.scss"

const ProductoDetallePage = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("descripcion")
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)

  // Estados para reseñas
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [reviewError, setReviewError] = useState(null)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [averageRating, setAverageRating] = useState({ Promedio: 0, Total: 0 })

  // Estados para las imágenes de reseñas (3 imágenes)
  const [reviewImages, setReviewImages] = useState([null, null, null])
  const [reviewImagePreviews, setReviewImagePreviews] = useState([null, null, null])

  useEffect(() => {
    // Resetear el estado cuando cambia el ID del producto
    setLoading(true)
    setQuantity(1)
    setSelectedImage(0)
    setError(null)
    setLoadingReviews(true)
    setReviewError(null)
    setUserRating(0)
    setUserReview("")
    setReviewImages([null, null, null])
    setReviewImagePreviews([null, null, null])

    const fetchProductData = async () => {
      try {
        // Obtener el producto por ID
        const productData = await CatalogoService.getProductoById(id)
        const formattedProduct = CatalogoService.formatProductoData(productData)

        if (!formattedProduct) {
          setError("Producto no encontrado")
          setLoading(false)
          return
        }

        setProduct(formattedProduct)

        // Obtener productos relacionados (misma categoría)
        if (productData.IdCategoriaDeProducto) {
          const relatedProductsData = await CatalogoService.getProductosByCategoria(productData.IdCategoriaDeProducto)
          // Filtrar para excluir el producto actual y limitar a 3
          const formattedRelated = CatalogoService.formatProductosList(relatedProductsData)
            .filter((p) => p.id !== formattedProduct.id)
            .slice(0, 3)

          setRelatedProducts(formattedRelated)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error al cargar el producto:", error)
        setError("No se pudo cargar el producto. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    if (id) {
      fetchProductData()
      fetchReviews() // Cargar reseñas
    }
  }, [id])

  // Función para cargar reseñas
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true)
      setReviewError(null)

      // Obtener reseñas del producto
      const reviewsData = await ReviewsService.getReviewsByProduct(id)
      const formattedReviews = ReviewsService.formatReviewsList(reviewsData)

      // Filtrar solo reseñas aprobadas y activas
      const approvedReviews = formattedReviews.filter((review) => review.approved && review.status)

      setReviews(approvedReviews)

      // Obtener promedio de calificaciones
      const avgRating = await ReviewsService.getAverageRatingByProduct(id)
      setAverageRating(avgRating)

      setLoadingReviews(false)
    } catch (error) {
      console.error("Error al cargar reseñas:", error)
      setReviewError("No se pudieron cargar las reseñas. Por favor, intenta de nuevo más tarde.")
      setLoadingReviews(false)
    }
  }

  // Función para manejar la selección de imágenes
  const handleImageChange = (e, index) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no puede exceder los 5MB")
        return
      }

      // Validar tipo de archivo
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Solo se permiten imágenes JPG, PNG y GIF")
        return
      }

      // Crear copias de los arrays actuales
      const newImages = [...reviewImages]
      const newPreviews = [...reviewImagePreviews]

      // Actualizar la imagen en el índice correspondiente
      newImages[index] = file

      // Si hay una URL de vista previa anterior, revocarla para liberar memoria
      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index])
      }

      // Crear nueva URL para la vista previa
      newPreviews[index] = URL.createObjectURL(file)

      // Actualizar los estados
      setReviewImages(newImages)
      setReviewImagePreviews(newPreviews)
    }
  }

  // Función para eliminar una imagen
  const handleRemoveImage = (index) => {
    const newImages = [...reviewImages]
    const newPreviews = [...reviewImagePreviews]

    // Si hay una URL de vista previa, revocarla para liberar memoria
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index])
    }

    // Limpiar la imagen en el índice correspondiente
    newImages[index] = null
    newPreviews[index] = null

    // Actualizar los estados
    setReviewImages(newImages)
    setReviewImagePreviews(newPreviews)
  }

  // Función para verificar si el usuario está logueado
  const checkUserLoggedIn = () => {
    // Verificar si hay un token válido
    const token = localStorage.getItem("token")

    // Si no hay token, definitivamente no está logueado
    if (!token) return false

    // El usuario está logueado si tiene un token válido
    return true
  }

  // Función para enviar reseña
  const submitReview = async (e) => {
    e.preventDefault()

    if (userRating === 0) {
      toast.error("Por favor, selecciona una calificación")
      return
    }

    try {
      setSubmittingReview(true)

      // Verificar si el usuario está logueado
      if (!checkUserLoggedIn()) {
        toast.error("Debes iniciar sesión para dejar una reseña")
        setSubmittingReview(false)
        return
      }

      // Obtener el ID del cliente (para pruebas, usar ID fijo)
      // En producción, obtener el ID real del cliente autenticado
      const clientId = 1 // ID fijo para pruebas

      // Crear objeto de reseña
      const reviewData = {
        IdProducto: Number.parseInt(id),
        IdCliente: clientId,
        Calificacion: userRating,
        Comentario: userReview,
        Estado: true,
      }

      // Procesar las imágenes
      const validImages = reviewImages.filter((img) => img !== null)

      if (validImages.length > 0) {
        const imageUrls = []

        // Subir cada imagen a Cloudinary
        for (const imageFile of validImages) {
          const imageUrl = await uploadImageToCloudinary(imageFile, "resenas")
          if (imageUrl) {
            imageUrls.push(imageUrl)
          }
        }

        // Guardar las URLs de las imágenes en el campo Foto
        if (imageUrls.length > 0) {
          reviewData.Foto = imageUrls.join(",") // Guardar como string separado por comas
        }
      }

      // Enviar reseña
      await ReviewsService.createReview(reviewData)

      // Limpiar formulario
      setUserRating(0)
      setUserReview("")
      setReviewImages([null, null, null])
      setReviewImagePreviews([null, null, null])

      // Mostrar mensaje de éxito
      toast.success("Tu reseña ha sido enviada y está pendiente de aprobación")

      // Recargar reseñas
      fetchReviews()
    } catch (error) {
      console.error("Error al enviar reseña:", error)

      // Mostrar mensaje de error más específico
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("No se pudo enviar tu reseña. Por favor, intenta de nuevo más tarde.")
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  // Función para manejar la selección de estrellas
  const handleRatingClick = (rating) => {
    setUserRating(rating)
  }

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || (product && newQuantity > product.stock)) return
    setQuantity(newQuantity)
  }

  const addToCart = () => {
    if (!product) return

    // Obtener el carrito actual del localStorage
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]")

    // Verificar si el producto ya está en el carrito
    const existingProductIndex = currentCart.findIndex((item) => item.id === product.id)

    if (existingProductIndex >= 0) {
      // Si el producto ya está en el carrito, incrementar la cantidad
      currentCart[existingProductIndex].quantity += quantity
    } else {
      // Si no, añadir el producto con la cantidad seleccionada
      currentCart.push({
        ...product,
        quantity: quantity,
      })
    }

    // Guardar el carrito actualizado en localStorage
    localStorage.setItem("cart", JSON.stringify(currentCart))

    // Disparar evento para actualizar contador del carrito
    window.dispatchEvent(new Event("storage"))

    // Mostrar notificación
     toast.success(`${quantity} ${quantity > 1 ? "unidades" : "unidad"} añadidas al carrito`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false, // <--- Cambia esto a false
      draggable: true,
      progress: undefined
    })
  }

  const handleThumbnailClick = (index) => {
    setSelectedImage(index)
  }

  if (loading) {
    return (
      <div className="producto-detalle-page loading-container">
        <Container className="py-5 mt-5 text-center">
          <div className="spinner-border" role="status" style={{ color: "#7ab51d" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando detalles del producto...</p>
        </Container>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="producto-detalle-page error-container">
        <Container className="py-5 mt-5 text-center">
          <div className="mb-4">
            <i className="bi bi-exclamation-circle-fill" style={{ fontSize: "3rem", color: "#dc3545" }}></i>
          </div>
          <h2>Producto no encontrado</h2>
          <p className="mb-4">Lo sentimos, el producto que estás buscando no existe o ha sido eliminado.</p>
          <Link to="/catalogo" className="btn btn-success">
            Volver al Catálogo
          </Link>
        </Container>
      </div>
    )
  }

  // Preparar imágenes para la galería
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : ["/placeholder.svg"]

  // Preparar especificaciones para mostrar
  const specifications =
    typeof product.specifications === "object" && product.specifications !== null
      ? product.specifications
      : { Especificaciones: "No disponibles" }

  // Preparar características para mostrar
  const features =
    Array.isArray(product.features) && product.features.length > 0
      ? product.features
      : ["No hay características disponibles"]

  // Verificar si el usuario está logueado
  const isLoggedIn = checkUserLoggedIn()

  return (
    <div className="producto-detalle-page">
      <Container className="py-5 mt-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/catalogo">Catálogo</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={`/catalogo?categoria=${product.category ? product.category.toLowerCase() : ""}`}>
                {product.category || "Sin categoría"}
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <Row className="mb-5">
          {/* Galería de imágenes */}
          <Col lg={6} className="mb-4 mb-lg-0">
            <div className="product-gallery">
              <div className="main-image-container mb-3">
                <img
                  src={productImages[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="main-image img-fluid rounded"
                />
              </div>

              {productImages.length > 1 && (
                <div className="thumbnail-container">
                  {productImages.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${selectedImage === index ? "active" : ""}`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} - Vista ${index + 1}`}
                        className="thumbnail-image img-fluid rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* Información del producto */}
          <Col lg={6}>
            <div className="product-info">
              <h1 className="product-title">{product.name}</h1>

              <div className="product-meta d-flex align-items-center mb-3">
                <div className="product-rating me-3">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${i < Math.floor(product.rating) ? "bi-star-fill" : i < product.rating ? "bi-star-half" : "bi-star"} text-warning`}
                    ></i>
                  ))}
                  <span className="ms-2">{product.rating}</span>
                </div>

                <div className="product-reviews-count">
                  <Link to="#reviews" onClick={() => setActiveTab("reviews")}>
                    {reviews.length} reseñas
                  </Link>
                </div>
              </div>

              <div className="product-price mb-4">
                <span className="current-price">${product.price.toLocaleString()}</span>
              </div>

              <div className="product-short-description mb-4">
                <p>
                  {product.description ? product.description.substring(0, 150) + "..." : "Sin descripción disponible"}
                </p>
              </div>

              <div className="product-stock mb-4">
                <span className={`stock-badge ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                  <i className={`bi ${product.stock > 0 ? "bi-check-circle-fill" : "bi-x-circle-fill"} me-2`}></i>
                  {product.stock > 0 ? `${product.stock} unidades disponibles` : "Agotado"}
                </span>
              </div>

              <div className="product-actions mb-4">
                <div className="quantity-selector d-flex align-items-center mb-3">
                  <span className="me-3">Cantidad:</span>
                  <div className="input-group" style={{ width: "150px" }}>
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </Button>
                    <Form.Control
                      type="text"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                      min="1"
                      max={product.stock}
                      className="text-center"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      <i className="bi bi-plus"></i>
                    </Button>
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex">
                  <Button
                    variant="success"
                    size="lg"
                    className="flex-grow-1"
                    onClick={addToCart}
                    disabled={product.stock <= 0}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Añadir al Carrito
                  </Button>
                </div>
              </div>

              <div className="product-category mb-4">
                <span className="text-muted me-2">Categoría:</span>
                <Link to={`/catalogo?categoria=${product.category ? product.category.toLowerCase() : ""}`}>
                  {product.category || "Sin categoría"}
                </Link>
              </div>

              <div className="product-share">
                <span className="text-muted me-2">Compartir:</span>
                <div className="social-icons d-inline-block">
                  <a href="#" className="social-icon me-2">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="social-icon me-2">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                  <a href="#" className="social-icon me-2">
                    <i className="bi bi-whatsapp"></i>
                  </a>
                  <a href="#" className="social-icon">
                    <i className="bi bi-envelope"></i>
                  </a>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Tabs de información adicional */}
        <div className="product-tabs mb-5">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            <Tab eventKey="descripcion" title="Descripción">
              <div className="tab-content-container">
                <h3 className="mb-4">Descripción del Producto</h3>
                <p>{product.description || "No hay descripción disponible para este producto."}</p>

                <h4 className="mt-4 mb-3">Características</h4>
                <ul className="features-list">
                  {product.features && product.features.length > 0 ? (
                    product.features.map((feature, index) => (
                      <li key={index}>
                        <i className="bi bi-check-circle-fill me-2" style={{ color: "#7ab51d" }}></i>
                        {feature}
                      </li>
                    ))
                  ) : (
                    <li>
                      <i className="bi bi-info-circle me-2" style={{ color: "#7ab51d" }}></i>
                      No hay características disponibles
                    </li>
                  )}
                </ul>
              </div>
            </Tab>

            <Tab eventKey="especificaciones" title="Especificaciones">
              <div className="tab-content-container">
                <h3 className="mb-4">Especificaciones Técnicas</h3>
                <table className="table specifications-table">
                  <tbody>
                    {Object.keys(product.specifications || {}).length > 0 ? (
                      Object.entries(product.specifications).map(([key, value], index) => (
                        <tr key={index}>
                          <th>{key}</th>
                          <td>{value}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <th>Especificaciones</th>
                        <td>No disponibles</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tab>

            <Tab eventKey="reviews" title={`Reseñas (${reviews.length})`}>
              <div className="tab-content-container" id="reviews">
                <h3 className="mb-4">Opiniones de Clientes</h3>

                <div className="reviews-summary mb-4">
                  <div className="d-flex align-items-center">
                    <div className="overall-rating me-4">
                      <span className="rating-value">
                        {averageRating.Promedio ? averageRating.Promedio.toFixed(1) : "0.0"}
                      </span>
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`bi ${i < Math.floor(averageRating.Promedio) ? "bi-star-fill" : i < averageRating.Promedio ? "bi-star-half" : "bi-star"} text-warning`}
                          ></i>
                        ))}
                      </div>
                      <span className="total-reviews">{averageRating.Total || 0} reseñas</span>
                    </div>

                    <div className="rating-bars flex-grow-1">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviews.filter((review) => Math.floor(review.rating) === stars).length
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

                        return (
                          <div key={stars} className="rating-bar-item d-flex align-items-center mb-1">
                            <div className="stars-label me-2">
                              {stars} <i className="bi bi-star-fill text-warning small"></i>
                            </div>
                            <div className="progress flex-grow-1 me-2" style={{ height: "8px" }}>
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${percentage}%` }}
                                aria-valuenow={percentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <div className="count-label small">{count}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {loadingReviews ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status" style={{ color: "#7ab51d" }}>
                      <span className="visually-hidden">Cargando reseñas...</span>
                    </div>
                    <p className="mt-2">Cargando reseñas...</p>
                  </div>
                ) : reviewError ? (
                  <div className="alert alert-danger" role="alert">
                    {reviewError}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-chat-square-text" style={{ fontSize: "2rem", color: "#7ab51d" }}></i>
                    <p className="mt-2">No hay reseñas para este producto. ¡Sé el primero en opinar!</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-item mb-4 pb-4 border-bottom">
                        <div className="d-flex justify-content-between mb-2">
                          <h5 className="review-author mb-0">{review.userName}</h5>
                          <span className="review-date text-muted">{review.date}</span>
                        </div>

                        <div className="review-rating mb-2">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`bi ${i < review.rating ? "bi-star-fill" : "bi-star"} text-warning`}
                            ></i>
                          ))}
                        </div>

                        <p className="review-content mb-0">{review.comment}</p>

                        {/* Mostrar imágenes de la reseña si existen */}
                        {review.image && (
                          <div className="review-images mt-3">
                            {review.image.split(",").map((img, index) => (
                              <img
                                key={index}
                                src={img || "/placeholder.svg"}
                                alt={`Imagen de reseña ${index + 1}`}
                                className="review-image-thumbnail"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg"
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="write-review mt-4">
                  <h4 className="mb-3">Escribe una Reseña</h4>

                  {/* Verificar si el usuario está logueado */}
                  {!isLoggedIn ? (
                    <div className="alert alert-info">
                      <p className="mb-0">
                        Debes <Link to="/login">iniciar sesión</Link> para dejar una reseña.
                      </p>
                    </div>
                  ) : (
                    <Form onSubmit={submitReview}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tu valoración *</Form.Label>
                        <div className="rating-selector">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`bi ${star <= userRating ? "bi-star-fill" : "bi-star"} rating-star text-warning`}
                              style={{ fontSize: "1.5rem", cursor: "pointer", marginRight: "5px" }}
                              onClick={() => handleRatingClick(star)}
                            ></i>
                          ))}
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Tu reseña *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={userReview}
                          onChange={(e) => setUserReview(e.target.value)}
                          required
                          placeholder="Comparte tu experiencia con este producto..."
                        />
                      </Form.Group>

                      {/* Sección de subida de fotos (3 fotos) */}
                      <Form.Group className="mb-4">
                        <Form.Label>Añadir fotos (opcional)</Form.Label>
                        <div className="photo-upload-section">
                          {[0, 1, 2].map((index) => (
                            <div key={index} className="photo-upload-item">
                              {!reviewImagePreviews[index] ? (
                                <div className="photo-upload-placeholder">
                                  <input
                                    type="file"
                                    id={`review-photo-${index}`}
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, index)}
                                    className="photo-upload-input"
                                  />
                                  <label htmlFor={`review-photo-${index}`} className="photo-upload-label">
                                    <i className="bi bi-camera"></i>
                                    <span>{index === 0 ? "Foto principal" : `Foto adicional ${index}`}</span>
                                  </label>
                                </div>
                              ) : (
                                <div className="photo-preview-container">
                                  <img
                                    src={reviewImagePreviews[index] || "/placeholder.svg"}
                                    alt={`Vista previa ${index + 1}`}
                                    className="photo-preview-image"
                                  />
                                  <button
                                    type="button"
                                    className="photo-remove-button"
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    <i className="bi bi-x-circle"></i>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <Form.Text className="text-muted d-block mt-1">
                          Puedes subir hasta 3 imágenes JPG, PNG o GIF (máx. 5MB cada una)
                        </Form.Text>
                      </Form.Group>

                      <Button variant="success" type="submit" disabled={submittingReview || userRating === 0}>
                        {submittingReview ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Enviar Reseña
                          </>
                        )}
                      </Button>
                    </Form>
                  )}
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h3 className="section-title mb-4">Productos Relacionados</h3>

            <Row className="g-4">
              {relatedProducts.map((relatedProduct) => {
                const relatedProductImage =
                  (relatedProduct.images && relatedProduct.images.length > 0
                    ? relatedProduct.images[0]
                    : relatedProduct.image) || "/placeholder.svg";

                return (
                  <Col md={4} key={relatedProduct.id}>
                    <div className="related-product-card card h-100 border-0 shadow-sm">
                      <Link to={`/producto/${relatedProduct.id}`} className="text-decoration-none">
                        <div className="position-relative">
                          <img
                            src={relatedProductImage}
                            alt={relatedProduct.name || "Imagen no disponible"}
                            className="card-img-top related-product-image"
                             onError={() => setImageError(true)}
                            loading="lazy"
                          />
                        </div>

                        <div className="card-body">
                          <h5 className="card-title related-product-title">{relatedProduct.name}</h5>

                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <div className="related-product-price">
                              <span className="current-price">${relatedProduct.price.toLocaleString()}</span>
                            </div>

                            <div className="related-product-rating">
                              <i className="bi bi-star-fill text-warning me-1"></i>
                              <span>{relatedProduct.rating}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}
      </Container>
    </div>
  )
}

export default ProductoDetallePage
