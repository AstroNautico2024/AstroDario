"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Button, Tabs, Tab, Form } from "react-bootstrap"
import { toast } from "react-toastify"
import ServiciosService from "../../Services/ConsumoCliente/ServiciosService.js"
import ReviewsServiciosService from "../../Services/ConsumoCliente/ReviewsServiciosService.js"
import { uploadImageToCloudinary } from "../../Services/uploadImageToCloudinary.js"
import "./ServicioDetallePage.scss"

const ServicioDetallePage = () => {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("descripcion")
  const [relatedServices, setRelatedServices] = useState([])
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
    // Resetear el estado cuando cambia el ID del servicio
    setLoading(true)
    setSelectedImage(0)
    setLoadingReviews(true)
    setReviewError(null)
    setUserRating(0)
    setUserReview("")
    setReviewImages([null, null, null])
    setReviewImagePreviews([null, null, null])

    const fetchServiceData = async () => {
      try {
        // Obtener el servicio por ID
        const serviceData = await ServiciosService.getServicioById(id)
        const formattedService = ServiciosService.formatServicioData(serviceData)

        if (!formattedService) {
          setLoading(false)
          return
        }

        // Adaptar el formato del servicio al formato esperado por el componente
        const adaptedService = {
          id: formattedService.id,
          name: formattedService.name,
          category: formattedService.tipoServicio || "Servicios",
          price: formattedService.price,
          duration: formattedService.duration ? `${formattedService.duration} minutos` : "60 minutos",
          rating: formattedService.rating || 4.9,
          availability: formattedService.available !== undefined ? formattedService.available : true,
          description: formattedService.description || "Sin descripción disponible",
          benefits: formattedService.benefits || [
            "Mejora la higiene y salud de tu mascota",
            "Previene problemas de piel y parásitos",
            "Reduce la caída de pelo en casa",
            "Detecta a tiempo posibles problemas de salud",
            "Proporciona una experiencia relajante para tu mascota",
          ],
          includes: formattedService.includes || {
            "Baño completo": "Con champú y acondicionador específicos para cada tipo de pelo",
            "Secado profesional": "Con secadores de baja temperatura para mayor comodidad",
            "Corte de pelo": "Según la raza o preferencia del dueño",
            "Limpieza de oídos": "Eliminación de cera y prevención de infecciones",
            "Corte de uñas": "Para prevenir problemas al caminar",
            "Limpieza dental": "Cepillado con pasta dental canina",
          },
          images:
            formattedService.images && formattedService.images.length > 0
              ? formattedService.images
              : formattedService.image
                ? [formattedService.image]
                : [
                    "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1200",
                    "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?q=80&w=1200",
                    "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?q=80&w=1200",
                  ],
        }

        setService(adaptedService)

        // Obtener servicios relacionados
        const allServices = await ServiciosService.getServicios()
        const formattedServices = ServiciosService.formatServiciosList(allServices)

        // Filtrar para excluir el servicio actual y limitar a 3
        const related = formattedServices
          .filter((s) => s.id !== formattedService.id)
          .slice(0, 3)
          .map((s) => ({
            id: s.id,
            name: s.name,
            category: s.tipoServicio || "Servicios",
            price: s.price,
            rating: s.rating || 4.7,
            image: s.image || "/placeholder.svg",
          }))

        setRelatedServices(related)
        setLoading(false)
      } catch (error) {
        console.error("Error al cargar el servicio:", error)
        setLoading(false)
      }
    }

    if (id) {
      fetchServiceData()
      fetchReviews() // Cargar reseñas
    }
  }, [id])

  // Función para cargar reseñas
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true)
      setReviewError(null)

      // Obtener reseñas del servicio
      const reviewsData = await ReviewsServiciosService.getReviewsByServicio(id)
      const formattedReviews = ReviewsServiciosService.formatReviewsList(reviewsData)

      // Filtrar solo reseñas aprobadas y activas
      const approvedReviews = formattedReviews.filter((review) => review.approved && review.status)

      setReviews(approvedReviews)

      // Obtener promedio de calificaciones
      const avgRating = await ReviewsServiciosService.getAverageRatingByServicio(id)
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
        IdServicio: Number.parseInt(id),
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
          const imageUrl = await uploadImageToCloudinary(imageFile, "resenas_servicios")
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
      await ReviewsServiciosService.createReview(reviewData)

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

  // Función para manejar el clic en las miniaturas
  const handleThumbnailClick = (index) => {
    setSelectedImage(index)
  }

  const handleBookService = () => {
    // Redirigir a la página de agendar cita con el ID del servicio como parámetro de consulta
    window.location.href = `/agendar-cita?servicio=${id}`

    // Mostrar notificación
    toast.success(`Servicio preseleccionado para agendar cita`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  }

  if (loading) {
    return (
      <div className="servicio-detalle-page loading-container">
        <Container className="py-5 mt-5 text-center">
          <div className="spinner-border" role="status" style={{ color: "#7ab51d" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando detalles del servicio...</p>
        </Container>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="servicio-detalle-page error-container">
        <Container className="py-5 mt-5 text-center">
          <div className="mb-4">
            <i className="bi bi-exclamation-circle-fill" style={{ fontSize: "3rem", color: "#dc3545" }}></i>
          </div>
          <h2>Servicio no encontrado</h2>
          <p className="mb-4">Lo sentimos, el servicio que estás buscando no existe o ha sido eliminado.</p>
          <Link to="/servicios" className="btn btn-success">
            Volver a Servicios
          </Link>
        </Container>
      </div>
    )
  }

  return (
    <div className="servicio-detalle-page">
      <Container className="py-5 mt-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/servicios">Servicios</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {service.name}
            </li>
          </ol>
        </nav>

        <Row className="mb-5">
          {/* Galería de imágenes */}
          <Col lg={6} className="mb-4 mb-lg-0">
            <div className="service-gallery">
              <div className="main-image-container mb-3">
                <img
                  src={service.images[selectedImage] || "/placeholder.svg"}
                  alt={service.name}
                  className="main-image img-fluid rounded"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg"
                  }}
                />
                {service.availability ? (
                  <div className="availability-badge available">Disponible</div>
                ) : (
                  <div className="availability-badge unavailable">No Disponible</div>
                )}
              </div>

              {service.images.length > 1 && (
                <div className="thumbnail-container">
                  {service.images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${selectedImage === index ? "active" : ""}`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${service.name} - Vista ${index + 1}`}
                        className="thumbnail-image img-fluid rounded"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* Información del servicio */}
          <Col lg={6}>
            <div className="service-info">
              <h1 className="service-title">{service.name}</h1>

              <div className="service-meta d-flex align-items-center mb-3">
                <div className="service-rating me-3">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${i < Math.floor(averageRating.Promedio) ? "bi-star-fill" : i < averageRating.Promedio ? "bi-star-half" : "bi-star"} text-warning`}
                    ></i>
                  ))}
                  <span className="ms-2">{averageRating.Promedio ? averageRating.Promedio.toFixed(1) : "0.0"}</span>
                </div>

                <div className="service-reviews-count">
                  <Link to="#reviews" onClick={() => setActiveTab("reviews")}>
                    {averageRating.Total || 0} reseñas
                  </Link>
                </div>
              </div>

              <div className="service-price-duration mb-4 d-flex align-items-center">
                <div className="service-price me-4">
                  <span className="current-price">${service.price.toLocaleString()}</span>
                </div>
                <div className="service-duration">
                  <i className="bi bi-clock me-2"></i>
                  <span>{service.duration}</span>
                </div>
              </div>

              <div className="service-short-description mb-4">
                <p>{service.description.substring(0, 150)}...</p>
              </div>

              <div className="service-availability mb-4">
                <span className={`availability-status ${service.availability ? "available" : "unavailable"}`}>
                  <i className={`bi ${service.availability ? "bi-check-circle-fill" : "bi-x-circle-fill"} me-2`}></i>
                  {service.availability ? "Servicio disponible para agendar" : "Servicio temporalmente no disponible"}
                </span>
              </div>

              <div className="service-actions mb-4">
                <div className="d-grid gap-2 d-md-flex">
                  <Button
                    variant="success"
                    size="lg"
                    className="flex-grow-1"
                    onClick={handleBookService}
                    disabled={!service.availability}
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    Agendar Cita
                  </Button>
                </div>
              </div>

              <div className="service-share">
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
        <div className="service-tabs mb-5">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            <Tab eventKey="descripcion" title="Descripción">
              <div className="tab-content-container">
                <h3 className="mb-4">Descripción del Servicio</h3>
                <p>{service.description}</p>

                <h4 className="mt-4 mb-3">Beneficios</h4>
                <ul className="benefits-list">
                  {service.benefits.map((benefit, index) => (
                    <li key={index}>
                      <i className="bi bi-check-circle-fill me-2" style={{ color: "#7ab51d" }}></i>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </Tab>

            <Tab eventKey="includes" title="¿Qué incluye?">
              <div className="tab-content-container">
                <h3 className="mb-4">¿Qué incluye este servicio?</h3>
                <table className="table includes-table">
                  <tbody>
                    {Object.entries(service.includes).map(([key, value], index) => (
                      <tr key={index}>
                        <th>{key}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
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
                    <p className="mt-2">No hay reseñas para este servicio. ¡Sé el primero en opinar!</p>
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
                  {!checkUserLoggedIn() ? (
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
                          placeholder="Comparte tu experiencia con este servicio..."
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

        {/* Servicios relacionados */}
        <div className="related-services">
          <h3 className="section-title mb-4">Servicios Relacionados</h3>

          <Row className="g-4">
            {relatedServices.map((relatedService) => (
              <Col md={4} key={relatedService.id}>
                <div className="related-service-card card h-100 border-0 shadow-sm">
                  <Link to={`/servicio/${relatedService.id}`} className="text-decoration-none">
                    <div className="position-relative">
                      <img
                        src={relatedService.image || "/placeholder.svg"}
                        alt={relatedService.name}
                        className="card-img-top related-service-image"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg"
                        }}
                      />
                    </div>

                    <div className="card-body">
                      <h5 className="card-title related-service-title">{relatedService.name}</h5>

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="related-service-price">
                          <span className="current-price">${relatedService.price.toLocaleString()}</span>
                        </div>

                        <div className="related-service-rating">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <span>{relatedService.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  )
}

export default ServicioDetallePage
