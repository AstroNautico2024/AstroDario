import axios from "../../Services/ConsumoAdmin/axios.js"

const ReviewsServiciosService = {
  // Obtener todas las reseñas de servicios
  getAllReviews: async () => {
    try {
      const response = await axios.get("/public/reviews/servicios")
      return response.data
    } catch (error) {
      console.error("Error al obtener reseñas de servicios:", error)
      throw error
    }
  },

  // Obtener reseñas por servicio
  getReviewsByServicio: async (servicioId) => {
    try {
      const response = await axios.get(`/public/reviews/servicios/servicio/${servicioId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener reseñas del servicio ${servicioId}:`, error)
      throw error
    }
  },

  // Obtener promedio de calificaciones por servicio
  getAverageRatingByServicio: async (servicioId) => {
    try {
      const response = await axios.get(`/public/reviews/servicios/promedio/${servicioId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener promedio de calificaciones del servicio ${servicioId}:`, error)
      return { Promedio: 0, Total: 0 } // Valor por defecto si falla
    }
  },

  // Obtener una reseña específica
  getReviewById: async (reviewId) => {
    try {
      const response = await axios.get(`/public/reviews/servicios/${reviewId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener reseña ${reviewId}:`, error)
      throw error
    }
  },

  // Crear una nueva reseña
  createReview: async (reviewData) => {
    try {
      const response = await axios.post("/public/reviews/servicios", reviewData)
      return response.data
    } catch (error) {
      console.error("Error al crear reseña de servicio:", error)
      throw error
    }
  },

  // Actualizar una reseña existente
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axios.put(`/public/reviews/servicios/${reviewId}`, reviewData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar reseña ${reviewId}:`, error)
      throw error
    }
  },

  // Eliminar una reseña
  deleteReview: async (reviewId) => {
    try {
      const response = await axios.delete(`/public/reviews/servicios/${reviewId}`)
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
      id: review.IdReseñaServicio,
      servicioId: review.IdServicio,
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

    return reviews.map((review) => ReviewsServiciosService.formatReviewData(review))
  },
}

export default ReviewsServiciosService
