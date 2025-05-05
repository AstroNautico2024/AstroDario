import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de detalles de ventas (productos)
 */
const DetallesVentasService = {
  /**
   * Obtiene los detalles de productos de una venta
   * @param {number} idVenta - ID de la venta
   * @returns {Promise<Array>} Lista de detalles de productos
   */
  getByVenta: async (idVenta) => {
    try {
      console.log("DetallesVentasService: Solicitando detalles de productos para venta ID", idVenta)

      // Añadir timestamp para evitar caché
      const response = await axiosInstance.get(`/sales/ventas/${idVenta}/detalles?_t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      console.log("DetallesVentasService: Respuesta completa:", response)

      // Verificar la estructura de la respuesta
      if (Array.isArray(response.data)) {
        console.log("DetallesVentasService: Detalles obtenidos como array:", response.data.length)
        return response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log("DetallesVentasService: Detalles obtenidos dentro de objeto data:", response.data.data.length)
        return response.data.data
      } else if (response.data && response.data.detallesProductos && Array.isArray(response.data.detallesProductos)) {
        console.log(
          "DetallesVentasService: Detalles obtenidos como detallesProductos:",
          response.data.detallesProductos.length,
        )
        return response.data.detallesProductos
      } else if (response.data && response.data.productos && Array.isArray(response.data.productos)) {
        console.log("DetallesVentasService: Detalles obtenidos como productos:", response.data.productos.length)
        return response.data.productos
      }

      // Si no se encontró un formato conocido pero hay datos, intentar extraer un array
      if (response.data && typeof response.data === "object") {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`DetallesVentasService: Detalles encontrados en propiedad ${key}:`, response.data[key].length)
            return response.data[key]
          }
        }
      }

      console.warn("DetallesVentasService: No se encontraron detalles de productos en formato conocido:", response.data)
      return []
    } catch (error) {
      console.error(`DetallesVentasService: Error al obtener detalles de productos para venta ID ${idVenta}:`, error)

      // Intentar recuperar datos del localStorage como último recurso
      try {
        const ventasGuardadas = JSON.parse(localStorage.getItem("ventas") || "[]")
        const venta = ventasGuardadas.find((v) => v.id == idVenta || v.IdVenta == idVenta)

        if (venta && venta.detallesProductos) {
          console.log("DetallesVentasService: Usando datos locales como último recurso")
          return venta.detallesProductos
        } else if (venta && venta.productos) {
          console.log("DetallesVentasService: Usando productos locales como último recurso")
          return venta.productos
        }
      } catch (localError) {
        console.warn("DetallesVentasService: Error al obtener datos locales:", localError)
      }

      // Propagar el error para que se maneje en el componente
      throw error
    }
  },

  /**
   * Obtiene un detalle de producto por su ID
   * @param {number} id - ID del detalle
   * @returns {Promise<Object>} Detalle de producto
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/sales/detalles-ventas/${id}?_t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error al obtener detalle de producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo detalle de producto
   * @param {Object} detalleData - Datos del detalle a crear
   * @returns {Promise<Object>} Detalle creado
   */
  create: async (detalleData) => {
    try {
      const response = await axiosInstance.post("/sales/detalles-ventas", detalleData)
      return response.data
    } catch (error) {
      console.error("Error al crear detalle de producto:", error)
      throw error
    }
  },

  /**
   * Actualiza un detalle de producto existente
   * @param {number} id - ID del detalle a actualizar
   * @param {Object} detalleData - Nuevos datos del detalle
   * @returns {Promise<Object>} Detalle actualizado
   */
  update: async (id, detalleData) => {
    try {
      const response = await axiosInstance.put(`/sales/detalles-ventas/${id}`, detalleData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar detalle de producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un detalle de producto
   * @param {number} id - ID del detalle a eliminar
   * @param {number} idVenta - ID de la venta a la que pertenece el detalle
   * @returns {Promise<Object>} Resultado de la operación
   */
  delete: async (id, idVenta) => {
    try {
      const response = await axiosInstance.delete(`/sales/detalles-ventas/${id}?idVenta=${idVenta}`)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar detalle de producto con ID ${id}:`, error)
      throw error
    }
  },
}

export default DetallesVentasService
