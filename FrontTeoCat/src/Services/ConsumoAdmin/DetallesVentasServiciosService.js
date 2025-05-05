import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de detalles de servicios en ventas
 */
const DetallesVentasServiciosService = {
  /**
   * Obtiene los detalles de servicios de una venta
   * @param {number} idVenta - ID de la venta
   * @returns {Promise<Array>} Lista de detalles de servicios
   */
  getByVenta: async (idVenta) => {
    try {
      console.log("DetallesVentasServiciosService: Solicitando detalles de servicios para venta ID", idVenta)

      // Intentar diferentes rutas de API, en orden de prioridad
      const rutasAPI = [
        `/sales/ventas/${idVenta}/detalles-servicios`,
        `/sales/detalles-ventas-servicios?idVenta=${idVenta}`,
        `/sales/detalles-ventas-servicios/venta/${idVenta}`,
        `/sales/ventas/${idVenta}/servicios`,
      ]

      let ultimoError = null

      for (const ruta of rutasAPI) {
        try {
          console.log("DetallesVentasServiciosService: Intentando ruta:", ruta)

          // Añadir timestamp para evitar caché
          const response = await axiosInstance.get(`${ruta}?_t=${Date.now()}`, {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          })

          console.log("DetallesVentasServiciosService: Respuesta de", ruta, ":", response)

          // Verificar la estructura de la respuesta
          if (Array.isArray(response.data)) {
            console.log("DetallesVentasServiciosService: Detalles obtenidos como array:", response.data.length)
            return response.data
          } else if (response.data && Array.isArray(response.data.data)) {
            console.log(
              "DetallesVentasServiciosService: Detalles obtenidos dentro de objeto data:",
              response.data.data.length,
            )
            return response.data.data
          } else if (
            response.data &&
            response.data.detallesServicios &&
            Array.isArray(response.data.detallesServicios)
          ) {
            console.log(
              "DetallesVentasServiciosService: Detalles obtenidos como detallesServicios:",
              response.data.detallesServicios.length,
            )
            return response.data.detallesServicios
          } else if (response.data && response.data.servicios && Array.isArray(response.data.servicios)) {
            console.log(
              "DetallesVentasServiciosService: Detalles obtenidos como servicios:",
              response.data.servicios.length,
            )
            return response.data.servicios
          }

          // Si no se encontró un formato conocido pero hay datos, intentar extraer un array
          if (response.data && typeof response.data === "object") {
            for (const key in response.data) {
              if (Array.isArray(response.data[key])) {
                console.log(
                  `DetallesVentasServiciosService: Detalles encontrados en propiedad ${key}:`,
                  response.data[key].length,
                )
                return response.data[key]
              }
            }
          }

          console.warn(
            "DetallesVentasServiciosService: Ruta",
            ruta,
            "no devolvió detalles en formato conocido:",
            response.data,
          )
        } catch (rutaError) {
          console.error("DetallesVentasServiciosService: Error al intentar ruta", ruta, ":", rutaError.message)
          ultimoError = rutaError
        }
      }

      // Si llegamos aquí, ninguna ruta funcionó
      console.error("DetallesVentasServiciosService: Todas las rutas fallaron para obtener detalles de servicios")

      // Intentar recuperar datos del localStorage como último recurso
      try {
        const ventasGuardadas = JSON.parse(localStorage.getItem("ventas") || "[]")
        const venta = ventasGuardadas.find((v) => v.id == idVenta || v.IdVenta == idVenta)

        if (venta && venta.detallesServicios) {
          console.log("DetallesVentasServiciosService: Usando datos locales como último recurso")
          return venta.detallesServicios
        } else if (venta && venta.servicios) {
          console.log("DetallesVentasServiciosService: Usando servicios locales como último recurso")
          return venta.servicios
        }
      } catch (localError) {
        console.warn("DetallesVentasServiciosService: Error al obtener datos locales:", localError)
      }

      // Propagar el último error
      if (ultimoError) {
        throw ultimoError
      } else {
        throw new Error("No se pudieron obtener detalles de servicios de ninguna ruta API")
      }
    } catch (error) {
      console.error(
        `DetallesVentasServiciosService: Error al obtener detalles de servicios para venta ID ${idVenta}:`,
        error,
      )

      // Propagar el error para que se maneje en el componente
      throw error
    }
  },

  /**
   * Obtiene un detalle de servicio por su ID
   * @param {number} id - ID del detalle
   * @returns {Promise<Object>} Detalle de servicio
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/sales/detalles-ventas-servicios/${id}?_t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error al obtener detalle de servicio con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo detalle de servicio
   * @param {Object} detalleData - Datos del detalle a crear
   * @returns {Promise<Object>} Detalle creado
   */
  create: async (detalleData) => {
    try {
      const response = await axiosInstance.post("/sales/detalles-ventas-servicios", detalleData)
      return response.data
    } catch (error) {
      console.error("Error al crear detalle de servicio:", error)
      throw error
    }
  },

  /**
   * Actualiza un detalle de servicio existente
   * @param {number} id - ID del detalle a actualizar
   * @param {Object} detalleData - Nuevos datos del detalle
   * @returns {Promise<Object>} Detalle actualizado
   */
  update: async (id, detalleData) => {
    try {
      const response = await axiosInstance.put(`/sales/detalles-ventas-servicios/${id}`, detalleData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar detalle de servicio con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un detalle de servicio
   * @param {number} id - ID del detalle a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/sales/detalles-ventas-servicios/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar detalle de servicio con ID ${id}:`, error)
      throw error
    }
  },
}

export default DetallesVentasServiciosService
