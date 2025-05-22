import axios from "../../Services/ConsumoAdmin/axios.js"

/**
 * Servicio para gestionar el catálogo de servicios
 */
class ServiciosService {
  /**
   * Obtiene todos los servicios
   * @returns {Promise<Array>} Lista de servicios
   */
  async getServicios() {
    try {
      console.log("Intentando obtener servicios")
      const response = await axios.get("/public/services/servicios")
      console.log("Servicios obtenidos:", response.data)

      // Verificar la estructura de la respuesta y extraer los servicios
      let servicios = []

      if (response.data && response.data.data) {
        // Si la respuesta tiene una propiedad 'data' que es un array
        servicios = response.data.data
      } else if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        servicios = response.data
      }

      if (Array.isArray(servicios)) {
        servicios = servicios.map(s => ({
          ...s,
          id: s.id || s.IdServicio, // Normaliza el id
          price: s.price || s.Precio // Normaliza el price
        }));
      }

      console.log("Array de servicios extraído:", servicios)
      return servicios
    } catch (error) {
      console.error("Error al obtener servicios:", error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  }

  /**
   * Obtiene un servicio por su ID
   * @param {number|string} id - ID del servicio
   * @returns {Promise<Object>} Datos del servicio
   */
  async getServicioById(id) {
    try {
      console.log(`Intentando obtener servicio con ID ${id}`)
      const response = await axios.get(`/public/services/servicios/${id}`)
      console.log(`Servicio ${id} obtenido:`, response.data)

      // Manejar diferentes estructuras de respuesta
      let servicio = null

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Si la respuesta tiene una propiedad 'data' que es un array
        servicio = response.data.data[0]
      } else if (response.data && !Array.isArray(response.data)) {
        // Si la respuesta es directamente un objeto
        servicio = response.data
      }

      return servicio
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${id}:`, error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw error
    }
  }

  /**
   * Formatea la lista de servicios para su uso en componentes React
   * @param {Array} servicios - Lista de servicios de la API
   * @returns {Array} Lista formateada de servicios
   */
  formatServiciosList(servicios) {
    console.log("Formateando servicios:", servicios)
    if (!servicios || !Array.isArray(servicios)) {
      console.warn("No se recibió un array de servicios válido:", servicios)
      return []
    }

    return servicios.map((servicio) => this.formatServicioData(servicio))
  }

  /**
   * Formatea los datos de un servicio para su uso en componentes React
   * @param {Object} servicio - Datos del servicio de la API
   * @returns {Object} Datos formateados del servicio
   */
  formatServicioData(servicio) {
    if (!servicio) {
      console.warn("Se intentó formatear un servicio nulo o indefinido")
      return null
    }

    console.log("Formateando servicio individual:", servicio)

    // Procesar imágenes (pueden venir separadas por |)
    let images = []
    const imageField = servicio.Foto || servicio.ImagenURL || servicio.imagen || null
    if (imageField) {
      if (typeof imageField === "string" && imageField.includes("|")) {
        images = imageField.split("|")
      } else {
        images = [imageField]
      }
    }

    // Procesar beneficios (pueden venir como string)
    let benefits = []
    const beneficiosField = servicio.Beneficios || servicio.beneficios || ""
    if (beneficiosField) {
      if (typeof beneficiosField === "string") {
        // Si es un string, dividir por líneas o comas
        if (beneficiosField.includes("\n")) {
          benefits = beneficiosField.split("\n").filter((item) => item.trim() !== "")
        } else if (beneficiosField.includes(",")) {
          benefits = beneficiosField.split(",").filter((item) => item.trim() !== "")
        } else {
          benefits = [beneficiosField]
        }
      } else if (Array.isArray(beneficiosField)) {
        benefits = beneficiosField
      }
    }

    // Procesar qué incluye (pueden venir como string)
    let includes = {}
    const includesField = servicio.Que_incluye || servicio.queIncluye || ""
    if (includesField) {
      if (typeof includesField === "string") {
        // Intentar parsear como JSON primero
        try {
          includes = JSON.parse(includesField)
        } catch (error) {
          // Si no es JSON válido, intentar dividir por líneas y luego por ":"
          if (includesField.includes("\n")) {
            const lines = includesField.split("\n")
            lines.forEach((line) => {
              if (line.includes(":")) {
                const [key, value] = line.split(":").map((item) => item.trim())
                if (key && value) {
                  includes[key] = value
                }
              }
            })
          } else if (includesField.includes(":")) {
            const [key, value] = includesField.split(":").map((item) => item.trim())
            if (key && value) {
              includes[key] = value
            }
          } else {
            includes = { Incluye: includesField }
          }
        }
      } else if (typeof includesField === "object") {
        includes = includesField
      }
    }

    return {
      id: servicio.IdServicio || servicio.id || 0,
      name: servicio.Nombre || servicio.nombre || "Sin nombre",
      description: servicio.Descripcion || servicio.descripcion || "",
      price: Number.parseFloat(servicio.Precio || servicio.precio || 0),
      duration: servicio.Duracion || servicio.duracion || "No especificada",
      images: images,
      image: images.length > 0 ? images[0] : null,
      benefits: benefits,
      includes: includes,
      tipoServicio: servicio.NombreTipoServicio || servicio.tipoServicio || "General",
      tipoServicioId: servicio.IdTipoServicio || servicio.tipoServicioId || 0,
      rating: servicio.Valoracion || servicio.rating || 0,
      available: servicio.Estado || servicio.estado || true,
    }
  }
}

export default new ServiciosService()
