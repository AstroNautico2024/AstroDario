import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de productos y sus entidades relacionadas
 */
const ProductosService = {
  // PRODUCTOS BASE

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
      const response = await axiosInstance.get(`/products/productos?estado=1&limit=1000`)

      // Verificar si la respuesta tiene la estructura nueva
      let productos = []
      if (response.data && response.data.data) {
        productos = response.data.data
      } else {
        productos = response.data
      }

      return productos
    } catch (error) {
      console.error("Error al obtener productos activos para compras:", error)
      throw error
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
    console.log(`Intentando actualizar producto con ID ${id}:`, productoData);
    
    // Asegurarse de que los campos opcionales sean null si están vacíos
    if (productoData.Referencia === "") productoData.Referencia = null;
    if (productoData.CodigoBarras === "") productoData.CodigoBarras = null;
    
    const response = await axiosInstance.put(`/products/productos/${id}`, productoData);
    console.log(`Producto ${id} actualizado exitosamente:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar producto con ID ${id}:`, error);
    throw error;
  }
},

  /**
 * Cambia el estado de un producto (activo/inactivo)
 * @param {number} id - ID del producto
 * @param {boolean} nuevoEstado - Nuevo estado del producto
 * @returns {Promise<Object>} Respuesta de la actualización
 */
changeStatus: async (id, nuevoEstado) => {
  try {
    console.log(`Intentando cambiar estado del producto ${id} a: ${nuevoEstado}`)
    
    // Asegurarse de que nuevoEstado sea un booleano o 0/1, nunca undefined
    const estadoFinal = nuevoEstado === undefined ? false : !!nuevoEstado
    
    const response = await axiosInstance.patch(`/products/productos/${id}/status`, {
      Estado: estadoFinal,
    })
    console.log(`Estado del producto ${id} cambiado exitosamente:`, response.data)
    return response.data
  } catch (error) {
    console.error(`Error al cambiar estado del producto ${id}:`, error)
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
      throw error
    }
  },

  // VARIANTES DE PRODUCTOS

  /**
   * Obtiene las variantes de un producto
   * @param {number} idProducto - ID del producto base
   * @returns {Promise<Array>} Lista de variantes
   */
  getVariantes: async (idProducto) => {
    try {
      console.log(`Intentando obtener variantes del producto ${idProducto}`)
      const response = await axiosInstance.get(`/products/productos/${idProducto}/variantes`)
      console.log(`Variantes del producto ${idProducto} obtenidas:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener variantes del producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Crea una nueva variante para un producto
   * @param {number} idProducto - ID del producto base
   * @param {Object} varianteData - Datos de la variante a crear
   * @returns {Promise<Object>} Variante creada
   */
  createVariante: async (idProducto, varianteData) => {
    try {
      console.log(`Intentando crear variante para el producto ${idProducto}:`, varianteData)
      const response = await axiosInstance.post(`/products/productos/${idProducto}/variantes`, varianteData)
      console.log(`Variante creada exitosamente para el producto ${idProducto}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al crear variante para el producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Actualiza una variante existente
   * @param {number} idProducto - ID del producto base
   * @param {number} idVariante - ID de la variante a actualizar
   * @param {Object} varianteData - Datos actualizados de la variante
   * @returns {Promise<Object>} Variante actualizada
   */
  updateVariante: async (idProducto, idVariante, varianteData) => {
    try {
      console.log(`Intentando actualizar variante ${idVariante} del producto ${idProducto}:`, varianteData)
      const response = await axiosInstance.put(
        `/products/productos/${idProducto}/variantes/${idVariante}`,
        varianteData,
      )
      console.log(`Variante ${idVariante} actualizada exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar variante ${idVariante} del producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Elimina una variante
   * @param {number} idProducto - ID del producto base
   * @param {number} idVariante - ID de la variante a eliminar
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  deleteVariante: async (idProducto, idVariante) => {
    try {
      console.log(`Intentando eliminar variante ${idVariante} del producto ${idProducto}`)
      const response = await axiosInstance.delete(`/products/productos/${idProducto}/variantes/${idVariante}`)
      console.log(`Variante ${idVariante} eliminada exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar variante ${idVariante} del producto ${idProducto}:`, error)
      throw error
    }
  },

  // ATRIBUTOS DE PRODUCTOS

  /**
   * Obtiene todos los tipos de atributos
   * @returns {Promise<Array>} Lista de tipos de atributos
   */
  getTiposAtributos: async () => {
    try {
      console.log("Intentando obtener tipos de atributos")
      const response = await axiosInstance.get("/products/atributos/tipos")
      console.log("Tipos de atributos obtenidos:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al obtener tipos de atributos:", error)
      throw error
    }
  },

  /**
   * Obtiene un tipo de atributo por su ID
   * @param {number} id - ID del tipo de atributo
   * @returns {Promise<Object>} Tipo de atributo
   */
  getTipoAtributo: async (id) => {
    try {
      console.log(`Intentando obtener tipo de atributo con ID ${id}`)
      const response = await axiosInstance.get(`/products/atributos/tipos/${id}`)
      console.log(`Tipo de atributo ${id} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener tipo de atributo con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo tipo de atributo
   * @param {Object} tipoData - Datos del tipo de atributo
   * @returns {Promise<Object>} Tipo de atributo creado
   */
  createTipoAtributo: async (tipoData) => {
    try {
      console.log("Intentando crear nuevo tipo de atributo:", tipoData)

      // Asegurarse de que los nombres de campos coincidan con lo que espera el backend
      const data = {
        Nombre: tipoData.nombre || tipoData.Nombre,
        Descripcion: tipoData.descripcion || tipoData.Descripcion || null,
      }

      const response = await axiosInstance.post("/products/atributos/tipos", data)
      console.log("Tipo de atributo creado exitosamente:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al crear tipo de atributo:", error)
      throw error
    }
  },

  /**
   * Actualiza un tipo de atributo existente
   * @param {number} id - ID del tipo de atributo
   * @param {Object} tipoData - Datos actualizados del tipo de atributo
   * @returns {Promise<Object>} Tipo de atributo actualizado
   */
  updateTipoAtributo: async (id, tipoData) => {
    try {
      console.log(`Intentando actualizar tipo de atributo con ID ${id}:`, tipoData)

      // Asegurarse de que los nombres de campos coincidan con lo que espera el backend
      const data = {
        Nombre: tipoData.nombre || tipoData.Nombre,
        Descripcion: tipoData.descripcion || tipoData.Descripcion || null,
      }

      const response = await axiosInstance.put(`/products/atributos/tipos/${id}`, data)
      console.log(`Tipo de atributo ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar tipo de atributo con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Cambia el estado de un tipo de atributo
   * @param {number} id - ID del tipo de atributo
   * @param {boolean} estado - Nuevo estado
   * @returns {Promise<Object>} Respuesta de la actualización
   */
  changeStatusTipoAtributo: async (id, estado) => {
    try {
      console.log(`Intentando cambiar estado del tipo de atributo ${id} a: ${estado}`)
      const response = await axiosInstance.patch(`/products/atributos/tipos/${id}/status`, { Estado: estado })
      console.log(`Estado del tipo de atributo ${id} cambiado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al cambiar estado del tipo de atributo ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un tipo de atributo
   * @param {number} id - ID del tipo de atributo a eliminar
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  deleteTipoAtributo: async (id) => {
    try {
      console.log(`Intentando eliminar tipo de atributo con ID ${id}`)
      const response = await axiosInstance.delete(`/products/atributos/tipos/${id}`)
      console.log(`Tipo de atributo ${id} eliminado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar tipo de atributo con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene los valores de un tipo de atributo
   * @param {number} idTipoAtributo - ID del tipo de atributo
   * @returns {Promise<Array>} Lista de valores del atributo
   */
  getValoresAtributo: async (idTipoAtributo) => {
    try {
      console.log(`Intentando obtener valores del tipo de atributo ${idTipoAtributo}`)
      const response = await axiosInstance.get(`/products/atributos/tipos/${idTipoAtributo}/valores`)
      console.log(`Valores del tipo de atributo ${idTipoAtributo} obtenidos:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener valores del tipo de atributo ${idTipoAtributo}:`, error)
      throw error
    }
  },

  /**
   * Obtiene todos los valores de atributos
   * @returns {Promise<Array>} Lista de valores de atributos
   */
  getAllValoresAtributos: async () => {
    try {
      console.log("Intentando obtener todos los valores de atributos")
      const response = await axiosInstance.get("/products/atributos/valores")
      console.log("Valores de atributos obtenidos:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al obtener valores de atributos:", error)
      throw error
    }
  },

  /**
   * Obtiene un valor de atributo por su ID
   * @param {number} id - ID del valor de atributo
   * @returns {Promise<Object>} Valor de atributo
   */
  getValorAtributo: async (id) => {
    try {
      console.log(`Intentando obtener valor de atributo con ID ${id}`)
      const response = await axiosInstance.get(`/products/atributos/valores/${id}`)
      console.log(`Valor de atributo ${id} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener valor de atributo con ID ${id}:`, error)
      throw error
    }
  },

  /**
 * Crea un nuevo valor para un tipo de atributo
 * @param {Object} valorData - Datos del valor a crear
 * @returns {Promise<Object>} Valor de atributo creado
 */
createValorAtributo: async (valorData) => {
  try {
    console.log("Intentando crear nuevo valor de atributo:", valorData)
    const response = await axiosInstance.post("/products/atributos/valores", valorData)
    console.log("Valor de atributo creado exitosamente:", response.data)
    return response.data
  } catch (error) {
    console.error("Error al crear valor de atributo:", error)
    throw error
  }
},

  /**
   * Actualiza un valor de atributo existente
   * @param {number} id - ID del valor de atributo
   * @param {Object} valorData - Datos actualizados del valor de atributo
   * @returns {Promise<Object>} Valor de atributo actualizado
   */
  updateValorAtributo: async (id, valorData) => {
    try {
      console.log(`Intentando actualizar valor de atributo con ID ${id}:`, valorData)

      // Asegurarse de que los nombres de campos coincidan con lo que espera el backend
      const data = {
        Valor: valorData.valor || valorData.Valor,
        IdTipoAtributo: valorData.idTipoAtributo || valorData.IdTipoAtributo,
      }

      const response = await axiosInstance.put(`/products/atributos/valores/${id}`, data)
      console.log(`Valor de atributo ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar valor de atributo con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Cambia el estado de un valor de atributo
   * @param {number} id - ID del valor de atributo
   * @param {boolean} estado - Nuevo estado
   * @returns {Promise<Object>} Respuesta de la actualización
   */
  changeStatusValorAtributo: async (id, estado) => {
    try {
      console.log(`Intentando cambiar estado del valor de atributo ${id} a: ${estado}`)
      const response = await axiosInstance.patch(`/products/atributos/valores/${id}/status`, { Estado: estado })
      console.log(`Estado del valor de atributo ${id} cambiado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al cambiar estado del valor de atributo ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un valor de atributo
   * @param {number} id - ID del valor de atributo a eliminar
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  deleteValorAtributo: async (id) => {
    try {
      console.log(`Intentando eliminar valor de atributo con ID ${id}`)
      const response = await axiosInstance.delete(`/products/atributos/valores/${id}`)
      console.log(`Valor de atributo ${id} eliminado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar valor de atributo con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene los atributos asignados a un producto
   * @param {number} idProducto - ID del producto
   * @returns {Promise<Array>} Lista de atributos del producto
   */
  getAtributosProducto: async (idProducto) => {
    try {
      console.log(`Intentando obtener atributos del producto ${idProducto}`)
      const response = await axiosInstance.get(`/products/productos/${idProducto}/atributos`)
      console.log(`Atributos del producto ${idProducto} obtenidos:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener atributos del producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Asigna un atributo a un producto
   * @param {number} idProducto - ID del producto
   * @param {Object} atributoData - Datos del atributo a asignar
   * @returns {Promise<Object>} Atributo asignado
   */
  asignarAtributo: async (idProducto, atributoData) => {
    try {
      console.log(`Intentando asignar atributo al producto ${idProducto}:`, atributoData)
      const response = await axiosInstance.post(`/products/productos/${idProducto}/atributos`, atributoData)
      console.log(`Atributo asignado exitosamente al producto ${idProducto}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al asignar atributo al producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Asigna múltiples atributos a un producto
   * @param {number} idProducto - ID del producto
   * @param {Array} atributos - Array de objetos con idTipoAtributo e idValorAtributo
   * @returns {Promise<Object>} Respuesta de la asignación
   */
  asignarAtributosMultiples: async (idProducto, atributos) => {
    try {
      console.log(`Intentando asignar múltiples atributos al producto ${idProducto}:`, atributos)

      // Convertir el formato de los atributos si es necesario
      const atributosFormateados = atributos.map((attr) => ({
        IdTipoAtributo: attr.idTipoAtributo || attr.attributeId || attr.IdTipoAtributo,
        IdValorAtributo: attr.idValorAtributo || attr.valueId || attr.IdValorAtributo,
      }))

      const response = await axiosInstance.post(`/products/productos/${idProducto}/atributos/multiple`, {
        atributos: atributosFormateados,
      })
      console.log(`Atributos asignados exitosamente al producto ${idProducto}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al asignar atributos al producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Actualiza un atributo de producto
   * @param {number} id - ID del atributo de producto
   * @param {Object} atributoData - Datos actualizados del atributo
   * @returns {Promise<Object>} Atributo actualizado
   */
  updateAtributoProducto: async (id, atributoData) => {
    try {
      console.log(`Intentando actualizar atributo de producto con ID ${id}:`, atributoData)
      const response = await axiosInstance.put(`/products/atributos/${id}`, atributoData)
      console.log(`Atributo de producto ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar atributo de producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un atributo de producto
   * @param {number} id - ID del atributo de producto a eliminar
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  deleteAtributoProducto: async (id) => {
    try {
      console.log(`Intentando eliminar atributo de producto con ID ${id}`)
      const response = await axiosInstance.delete(`/products/atributos/${id}`)
      console.log(`Atributo de producto ${id} eliminado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar atributo de producto con ID ${id}:`, error)
      throw error
    }
  },

  // FOTOS DE PRODUCTOS

  /**
   * Obtiene las fotos de un producto
   * @param {number} idProducto - ID del producto
   * @returns {Promise<Array>} Lista de fotos del producto
   */
  getFotosProducto: async (idProducto) => {
    try {
      console.log(`Intentando obtener fotos del producto ${idProducto}`)
      const response = await axiosInstance.get(`/products/productos/${idProducto}/fotos`)
      console.log(`Fotos del producto ${idProducto} obtenidas:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener fotos del producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Agrega una foto a un producto
   * @param {number} idProducto - ID del producto
   * @param {FormData} fotoData - FormData con la imagen y metadatos
   * @returns {Promise<Object>} Foto creada
   */
  addFotoProducto: async (idProducto, fotoData) => {
    try {
      console.log(`Intentando agregar foto al producto ${idProducto}`)
      const response = await axiosInstance.post(`/products/productos/${idProducto}/fotos`, fotoData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      console.log(`Foto agregada exitosamente al producto ${idProducto}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al agregar foto al producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Establece una foto como principal
   * @param {number} idProducto - ID del producto
   * @param {number} idFoto - ID de la foto
   * @returns {Promise<Object>} Respuesta de la actualización
   */
  setFotoPrincipal: async (idProducto, idFoto) => {
    try {
      console.log(`Intentando establecer foto ${idFoto} como principal para el producto ${idProducto}`)
      const response = await axiosInstance.patch(`/products/productos/${idProducto}/fotos/${idFoto}/principal`)
      console.log(`Foto ${idFoto} establecida como principal exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al establecer foto ${idFoto} como principal:`, error)
      throw error
    }
  },

  /**
   * Elimina una foto de un producto
   * @param {number} idFoto - ID de la foto a eliminar
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  deleteFoto: async (idFoto) => {
    try {
      console.log(`Intentando eliminar foto con ID ${idFoto}`)
      const response = await axiosInstance.delete(`/fotos/${idFoto}`)
      console.log(`Foto ${idFoto} eliminada exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar foto ${idFoto}:`, error)
      throw error
    }
  },
}

export default ProductosService
