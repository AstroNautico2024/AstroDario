import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de productos
 */
const ProductosService = {
  /**
   * Obtiene todos los productos
   * @param {number} page - Número de página
   * @param {number} limit - Límite de productos por página
   * @returns {Promise<Array>} Lista de productos
   */
  getAll: async (page = 1, limit = 20) => {
    try {
      console.log(`Intentando obtener productos: /products/productos?page=${page}&limit=${limit}`)
      const response = await axiosInstance.get(`/products/productos?page=${page}&limit=${limit}`)
      console.log("Respuesta de productos:", response.data)

      // Verificar si la respuesta tiene la estructura nueva (con data y pagination)
      if (response.data && response.data.data) {
        return response.data.data // Devolver solo el array de productos
      }

      // Si no tiene la nueva estructura, devolver la respuesta directamente
      return response.data
    } catch (error) {
      console.error("Error al obtener productos:", error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      })
      throw error
    }
  },

  /**
   * Obtiene un producto por su ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Datos del producto
   */
  getById: async (id) => {
    try {
      console.log(`Intentando obtener producto con ID ${id}`)
      const response = await axiosInstance.get(`/products/productos/${id}`)
      console.log(`Producto ${id} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene productos activos para compras
   * @returns {Promise<Array>} Lista de productos activos
   */
  getActivosParaCompras: async () => {
    try {
      console.log("Intentando obtener productos activos para compras")
      // Intentar primero con estado=1 (numérico)
      const response = await axiosInstance.get(`/products/productos?estado=1&limit=1000`)
      console.log("Productos activos obtenidos:", response.data)

      // Verificar si la respuesta tiene la estructura nueva
      let productos = []
      if (response.data && response.data.data) {
        productos = response.data.data
      } else {
        productos = response.data
      }

      // Normalizar los datos para asegurar que tengan un formato consistente
      const productosNormalizados = productos.map((producto) => {
        return {
          IdProducto: producto.IdProducto || producto.id,
          NombreProducto: producto.NombreProducto || producto.nombre || "Sin nombre",
          CodigoBarras: producto.CodigoBarras || producto.codigoBarras || "N/A",
          Precio: Number(producto.Precio || producto.precio || 0),
          PorcentajeIVA: Number(producto.PorcentajeIVA || producto.porcentajeIVA || 0),
          Stock: Number(producto.Stock || producto.stock || 0),
          Estado: producto.Estado === true || producto.Estado === 1 || producto.Estado === "Activo",
        }
      })

      console.log("Productos normalizados:", productosNormalizados)
      return productosNormalizados
    } catch (error) {
      console.error("Error al obtener productos activos para compras:", error)

      // Si falla con estado=1, intentar con estado=true
      try {
        console.log("Intentando obtener productos activos con estado=true")
        const response = await axiosInstance.get(`/products/productos?estado=true&limit=1000`)
        console.log("Productos activos obtenidos con estado=true:", response.data)

        let productos = []
        if (response.data && response.data.data) {
          productos = response.data.data
        } else {
          productos = response.data
        }

        // Normalizar los datos
        const productosNormalizados = productos.map((producto) => {
          return {
            IdProducto: producto.IdProducto || producto.id,
            NombreProducto: producto.NombreProducto || producto.nombre || "Sin nombre",
            CodigoBarras: producto.CodigoBarras || producto.codigoBarras || "N/A",
            Precio: Number(producto.Precio || producto.precio || 0),
            PorcentajeIVA: Number(producto.PorcentajeIVA || producto.porcentajeIVA || 0),
            Stock: Number(producto.Stock || producto.stock || 0),
            Estado: true,
          }
        })

        console.log("Productos normalizados (estado=true):", productosNormalizados)
        return productosNormalizados
      } catch (secondError) {
        console.error("Error al obtener productos activos con estado=true:", secondError)

        // Si ambos intentos fallan, intentar obtener todos los productos y filtrar los activos
        try {
          console.log("Intentando obtener todos los productos y filtrar los activos")
          const response = await axiosInstance.get(`/products/productos?limit=1000`)
          console.log("Todos los productos obtenidos:", response.data)

          let productos = response.data
          if (response.data && response.data.data) {
            productos = response.data.data
          }

          // Filtrar productos activos y normalizar
          const productosActivos = productos
            .filter(
              (p) =>
                p.Estado === true || p.Estado === 1 || p.Estado === "Activo" || p.Estado === "true" || p.Estado === "1",
            )
            .map((producto) => {
              return {
                IdProducto: producto.IdProducto || producto.id,
                NombreProducto: producto.NombreProducto || producto.nombre || "Sin nombre",
                CodigoBarras: producto.CodigoBarras || producto.codigoBarras || "N/A",
                Precio: Number(producto.Precio || producto.precio || 0),
                PorcentajeIVA: Number(producto.PorcentajeIVA || producto.porcentajeIVA || 0),
                Stock: Number(producto.Stock || producto.stock || 0),
                Estado: true,
              }
            })

          console.log("Productos activos filtrados y normalizados:", productosActivos)
          return productosActivos
        } catch (thirdError) {
          console.error("Error al obtener todos los productos:", thirdError)
          throw thirdError
        }
      }
    }
  },

  /**
   * Crea un nuevo producto
   * @param {Object} productoData - Datos del producto a crear
   * @returns {Promise<Object>} Producto creado
   */
  create: async (productoData) => {
    try {
      console.log("Intentando crear nuevo producto:", productoData)
      const response = await axiosInstance.post("/products/productos", productoData)
      console.log("Producto creado exitosamente:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al crear producto:", error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      })
      throw error
    }
  },

  /**
   * Actualiza un producto existente
   * @param {number} id - ID del producto a actualizar
   * @param {Object} productoData - Datos actualizados del producto
   * @returns {Promise<Object>} Producto actualizado
   */
  update: async (id, productoData) => {
    try {
      console.log(`Intentando actualizar producto con ID ${id}:`, productoData)
      const response = await axiosInstance.put(`/products/productos/${id}`, productoData)
      console.log(`Producto ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      })
      throw error
    }
  },

  /**
   * Cambia el estado de un producto (activo/inactivo)
   * @param {number} id - ID del producto
   * @param {boolean|number} nuevoEstado - Nuevo estado del producto (true/1 para activo, false/0 para inactivo)
   * @returns {Promise<Object>} Respuesta de la actualización
   */
  changeStatus: async (id, nuevoEstado) => {
    try {
      console.log(`Intentando cambiar estado del producto ${id} a: ${nuevoEstado}`)

      // Normalizar el estado para asegurar compatibilidad con la API
      const estadoNormalizado = nuevoEstado === true || nuevoEstado === 1 ? 1 : 0

      // Intentar primero con el endpoint específico para cambio de estado si existe
      try {
        const response = await axiosInstance.patch(`/products/productos/${id}/estado`, {
          estado: estadoNormalizado,
        })
        console.log(`Estado del producto ${id} cambiado exitosamente:`, response.data)
        return response.data
      } catch (specificEndpointError) {
        console.log(
          "El endpoint específico para cambio de estado no está disponible, intentando con actualización general",
        )

        // Si no existe un endpoint específico, usar el método de actualización general
        const response = await axiosInstance.put(`/products/productos/${id}`, {
          Estado: estadoNormalizado,
        })
        console.log(`Estado del producto ${id} cambiado exitosamente mediante actualización general:`, response.data)
        return response.data
      }
    } catch (error) {
      console.error(`Error al cambiar estado del producto ${id}:`, error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      })
      throw error
    }
  },

  /**
   * Elimina un producto
   * @param {number} id - ID del producto a eliminar
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  delete: async (id) => {
    try {
      console.log(`Intentando eliminar producto con ID ${id}`)
      const response = await axiosInstance.delete(`/products/productos/${id}`)
      console.log(`Producto ${id} eliminado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar producto con ID ${id}:`, error)
      console.error("Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      })
      throw error
    }
  },
}

export default ProductosService
