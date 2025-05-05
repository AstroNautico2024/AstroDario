import axios from "../../Services/ConsumoAdmin/axios.js"

const ReviewsService = {
  // Obtener todas las reseñas de productos
  getAllReviews: async () => {
    try {
      const response = await axios.get("/public/reviews/productos")
      return response.data
    } catch (error) {
      console.error("Error al obtener reseñas:", error)
      throw error
    }
  },

  // Obtener reseñas por producto
  getReviewsByProduct: async (productId) => {
    try {
      const response = await axios.get(`/public/reviews/productos/producto/${productId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener reseñas del producto ${productId}:`, error)
      throw error
    }
  },

  // Obtener promedio de calificaciones por producto
  getAverageRatingByProduct: async (productId) => {
    try {
      const response = await axios.get(`/public/reviews/productos/promedio/${productId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener promedio de calificaciones del producto ${productId}:`, error)
      return { Promedio: 0, Total: 0 } // Valor por defecto si falla
    }
  },

  // Obtener una reseña específica
  getReviewById: async (reviewId) => {
    try {
      const response = await axios.get(`/public/reviews/productos/${reviewId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener reseña ${reviewId}:`, error)
      throw error
    }
  },

  // Crear una nueva reseña
  createReview: async (reviewData) => {
    try {
      const response = await axios.post("/public/reviews/productos", reviewData)
      return response.data
    } catch (error) {
      console.error("Error al crear reseña:", error)
      throw error
    }
  },

  // Actualizar una reseña existente
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axios.put(`/public/reviews/productos/${reviewId}`, reviewData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar reseña ${reviewId}:`, error)
      throw error
    }
  },

  // Eliminar una reseña
  deleteReview: async (reviewId) => {
    try {
      const response = await axios.delete(`/public/reviews/productos/${reviewId}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar reseña ${reviewId}:`, error)
      throw error
    }
  },

  // Formatear datos de reseña para mostrar en la UI
  formatReviewData: (review) => {
    if (!review) return null

    return {
      id: review.IdReseñaProducto,
      productId: review.IdProducto,
      userId: review.IdCliente,
      userName: `${review.NombreCliente || ""} ${review.ApellidoCliente || ""}`.trim(),
      rating: review.Calificacion,
      comment: review.Comentario,
      image: review.Foto,
      date: new Date(review.FechaCreacion).toLocaleDateString(),
      status: review.Estado,
      approved: review.Aprobado,
    }
  },

  // Formatear lista de reseñas
  formatReviewsList: (reviews) => {
    if (!reviews || !Array.isArray(reviews)) return []

    return reviews.map((review) => ReviewsService.formatReviewData(review))
  },
}

export default ReviewsService
